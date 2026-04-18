/**
 * storageService.js
 * Abstraction over AWS S3 (primary) and local-disk (sandbox/fallback).
 *
 * All S3 objects are stored with AES-256 server-side encryption (SSE-S3)
 * enabled by default.  When AWS credentials are absent the service falls
 * back to a no-op / URL passthrough so that the rest of the app can still
 * function in local development.
 *
 * Required .env vars (production):
 *   AWS_ACCESS_KEY_ID
 *   AWS_SECRET_ACCESS_KEY
 *   AWS_REGION              – e.g. us-east-1
 *   AWS_S3_BUCKET_DOCUMENTS – bucket for legal / verification documents
 *   AWS_S3_BUCKET_MEDIA     – bucket for property images / avatars
 *   AWS_CLOUDFRONT_DOMAIN   – optional CDN domain for public media URLs
 *
 * Optional:
 *   STORAGE_PROVIDER=s3|local   (default: s3 when creds present, else local)
 *   PRESIGNED_URL_EXPIRES=3600  (seconds, default 1 hour)
 */

const path = require('path');
const fs   = require('fs');

// ── Lazy AWS SDK imports (so missing creds don't crash dev server) ────────────
let s3Client;
let S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand;
let getSignedUrl;

function getS3Client() {
  if (s3Client) return s3Client;

  ({ S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } =
    require('@aws-sdk/client-s3'));
  ({ getSignedUrl } = require('@aws-sdk/s3-request-presigner'));

  s3Client = new S3Client({
    region:      process.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId:     process.env.AWS_ACCESS_KEY_ID     || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
    }
  });

  return s3Client;
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function isS3Configured() {
  return !!(
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.AWS_REGION &&
    process.env.STORAGE_PROVIDER !== 'local'
  );
}

function bucketForType(fileType) {
  const mediaTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  return mediaTypes.includes(fileType)
    ? (process.env.AWS_S3_BUCKET_MEDIA     || process.env.AWS_S3_BUCKET || 'landguard-media')
    : (process.env.AWS_S3_BUCKET_DOCUMENTS || process.env.AWS_S3_BUCKET || 'landguard-documents');
}

function buildPublicUrl(bucket, key) {
  if (process.env.AWS_CLOUDFRONT_DOMAIN) {
    return `https://${process.env.AWS_CLOUDFRONT_DOMAIN}/${key}`;
  }
  const region = process.env.AWS_REGION || 'us-east-1';
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

function sanitizeKey(original) {
  // Reject any path traversal sequences before sanitising
  if (/\.\./.test(original)) {
    throw new Error('Invalid filename: path traversal detected');
  }
  // Allow only safe chars — no forward slashes (caller provides the prefix)
  return original.replace(/[^a-zA-Z0-9._\-]/g, '_');
}

// ── Upload ────────────────────────────────────────────────────────────────────
/**
 * Upload a file buffer to S3 (or log to console in sandbox mode).
 *
 * @param {object} opts
 * @param {Buffer}  opts.buffer       – file content
 * @param {string}  opts.mimeType     – MIME type
 * @param {string}  opts.originalName – original filename
 * @param {string}  opts.folder       – S3 key prefix, e.g. 'documents/verification'
 * @param {string}  [opts.ownerId]    – optional owner ID for key namespacing
 * @returns {Promise<{key, url, bucket, provider}>}
 */
async function uploadFile({ buffer, mimeType, originalName, folder = 'uploads', ownerId }) {
  const ext       = path.extname(originalName || '').toLowerCase();
  const safeName  = sanitizeKey(`${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  const keyPrefix = ownerId ? `${folder}/${ownerId}` : folder;
  const key       = `${keyPrefix}/${safeName}`;

  if (!isS3Configured()) {
    // Sandbox: save to local uploads directory
    const uploadDir = path.join(__dirname, '../../uploads', folder);
    fs.mkdirSync(uploadDir, { recursive: true });
    const localPath = path.join(uploadDir, safeName);
    fs.writeFileSync(localPath, buffer);
    console.log(`[storageService] sandbox: saved file to ${localPath}`);
    return {
      key,
      url:      `local://${localPath}`,
      bucket:   'local',
      provider: 'local'
    };
  }

  const bucket = bucketForType(mimeType);
  const client = getS3Client();

  await client.send(new PutObjectCommand({
    Bucket:               bucket,
    Key:                  key,
    Body:                 buffer,
    ContentType:          mimeType,
    ServerSideEncryption: 'AES256',  // SSE-S3 encryption-at-rest
    Metadata: {
      originalName: encodeURIComponent(originalName || ''),
      ownerId:      ownerId || ''
    }
  }));

  return {
    key,
    url:      buildPublicUrl(bucket, key),
    bucket,
    provider: 's3'
  };
}

// ── Delete ────────────────────────────────────────────────────────────────────
/**
 * Delete a file from S3 (or local disk in sandbox).
 *
 * @param {string} key    – S3 key
 * @param {string} [bucket]
 */
async function deleteFile(key, bucket) {
  if (!isS3Configured()) {
    const localPath = path.join(__dirname, '../../uploads', key);
    if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
    return;
  }

  const resolvedBucket = bucket || process.env.AWS_S3_BUCKET_DOCUMENTS || process.env.AWS_S3_BUCKET;
  const client = getS3Client();

  await client.send(new DeleteObjectCommand({
    Bucket: resolvedBucket,
    Key:    key
  }));
}

// ── Presigned GET URL ─────────────────────────────────────────────────────────
/**
 * Generate a time-limited presigned GET URL for a private S3 object.
 * In sandbox mode returns the key as-is (no signing needed).
 *
 * @param {string}  key
 * @param {string}  [bucket]
 * @param {number}  [expiresIn=3600]  – seconds
 * @returns {Promise<string>}
 */
async function getPresignedUrl(key, bucket, expiresIn) {
  const ttl = expiresIn || Number.parseInt(process.env.PRESIGNED_URL_EXPIRES || '3600', 10);

  if (!isS3Configured()) {
    return `local://uploads/${key}?expires_in=${ttl}`;
  }

  const resolvedBucket = bucket || process.env.AWS_S3_BUCKET_DOCUMENTS || process.env.AWS_S3_BUCKET;
  const client = getS3Client();

  const command = new GetObjectCommand({ Bucket: resolvedBucket, Key: key });
  return getSignedUrl(client, command, { expiresIn: ttl });
}

// ── Presigned PUT URL (direct client upload) ──────────────────────────────────
/**
 * Generate a presigned PUT URL so the mobile/web client can upload directly
 * to S3 without routing the bytes through the backend.
 *
 * @param {object} opts
 * @param {string} opts.mimeType
 * @param {string} opts.folder
 * @param {string} [opts.ownerId]
 * @param {number} [opts.expiresIn=300]  – seconds (default 5 min)
 * @returns {Promise<{key, uploadUrl, publicUrl, expiresIn}>}
 */
async function getPresignedUploadUrl({ mimeType, folder = 'uploads', ownerId, expiresIn = 300 }) {
  const ext       = mimeType.split('/')[1] || 'bin';
  const safeName  = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const keyPrefix = ownerId ? `${folder}/${ownerId}` : folder;
  const key       = `${keyPrefix}/${safeName}`;

  if (!isS3Configured()) {
    return {
      key,
      uploadUrl:  `local://sandbox-upload/${key}`,
      publicUrl:  `local://uploads/${key}`,
      expiresIn,
      sandbox:    true
    };
  }

  const bucket = bucketForType(mimeType);
  const client = getS3Client();

  const command = new PutObjectCommand({
    Bucket:               bucket,
    Key:                  key,
    ContentType:          mimeType,
    ServerSideEncryption: 'AES256'
  });
  const uploadUrl = await getSignedUrl(client, command, { expiresIn });

  return {
    key,
    uploadUrl,
    publicUrl: buildPublicUrl(bucket, key),
    expiresIn,
    sandbox:   false
  };
}

module.exports = {
  uploadFile,
  deleteFile,
  getPresignedUrl,
  getPresignedUploadUrl,
  isS3Configured
};
