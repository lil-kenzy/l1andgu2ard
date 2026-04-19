/**
 * upload.js — Multer middleware
 *
 * Storage backend:
 *   S3 (via multer-s3)  when AWS credentials are configured
 *   Memory (in-process) otherwise, so routes can pass the buffer to storageService
 *
 * All S3 objects are stored with AES-256 SSE (encryption-at-rest).
 */

const multer    = require('multer');
const multerS3  = require('multer-s3');
const path      = require('path');
const { S3Client } = require('@aws-sdk/client-s3');
const { isS3Configured } = require('../services/storageService');

// ── S3 client (shared, lazy) ──────────────────────────────────────────────────
let _s3;
function getS3() {
  if (_s3) return _s3;
  _s3 = new S3Client({
    region:      process.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId:     process.env.AWS_ACCESS_KEY_ID     || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
    }
  });
  return _s3;
}

// ── Storage strategy ──────────────────────────────────────────────────────────
function buildStorage(folder) {
  if (isS3Configured()) {
    const bucket = folder.startsWith('documents')
      ? (process.env.AWS_S3_BUCKET_DOCUMENTS || process.env.AWS_S3_BUCKET || 'landguard-documents')
      : (process.env.AWS_S3_BUCKET_MEDIA     || process.env.AWS_S3_BUCKET || 'landguard-media');

    return multerS3({
      s3:     getS3(),
      bucket,
      serverSideEncryption: 'AES256',
      acl:    'private',
      contentType: multerS3.AUTO_CONTENT_TYPE,
      key: (req, file, cb) => {
        const ext   = path.extname(file.originalname).toLowerCase();
        const uid   = req.user?.id || 'anon';
        const stamp = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        cb(null, `${folder}/${uid}/${stamp}${ext}`);
      },
      metadata: (req, file, cb) => {
        cb(null, { originalName: encodeURIComponent(file.originalname) });
      }
    });
  }

  // Fallback: store in memory so the route handler can call storageService.uploadFile
  return multer.memoryStorage();
}

// ── Filename sanitization ─────────────────────────────────────────────────────
/**
 * Sanitize an upload filename:
 * - Remove path separators to prevent path traversal
 * - Strip characters that could be dangerous in shell or URLs
 * - Collapse spaces to underscores
 * - Truncate to 200 chars
 */
function sanitizeFilename(original) {
  return original
    .replace(/[/\\]/g, '')                  // path traversal
    .replace(/[^a-zA-Z0-9._\- ]/g, '')     // keep safe chars only
    .replace(/\s+/g, '_')                  // spaces → underscores
    .replace(/\.{2,}/g, '.')               // collapse consecutive dots
    .slice(0, 200)
    || 'upload';
}

// ── Magic-number signatures for file type validation ──────────────────────────
// We check the first few bytes of the file buffer against known signatures.
// This prevents attacks where a malicious file is given a safe extension.
const MAGIC_SIGNATURES = [
  // JPEG
  { mime: 'image/jpeg',  bytes: [0xFF, 0xD8, 0xFF] },
  // PNG
  { mime: 'image/png',   bytes: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A] },
  // GIF
  { mime: 'image/gif',   bytes: [0x47, 0x49, 0x46, 0x38] },
  // WebP (RIFF....WEBP)
  { mime: 'image/webp',  bytes: [0x52, 0x49, 0x46, 0x46] },
  // PDF
  { mime: 'application/pdf', bytes: [0x25, 0x50, 0x44, 0x46] }, // %PDF
  // DOCX / XLSX (ZIP signature)
  { mime: 'application/zip', bytes: [0x50, 0x4B, 0x03, 0x04] },
  // DOC (OLE2 signature)
  { mime: 'application/msword', bytes: [0xD0, 0xCF, 0x11, 0xE0] },
];

function matchesMagic(buffer, signature) {
  if (!buffer || buffer.length < signature.bytes.length) return false;
  return signature.bytes.every((byte, i) => buffer[i] === byte);
}

/**
 * Validate a file buffer against known magic-number signatures.
 * Returns true if the buffer matches any of the allowed MIME types.
 *
 * @param {Buffer} buffer – file buffer (from multer memoryStorage)
 * @param {string[]} allowedMimes – list of MIME types to accept
 */
function validateMagicNumbers(buffer, allowedMimes) {
  for (const sig of MAGIC_SIGNATURES) {
    if (allowedMimes.some((m) => m === sig.mime || sig.mime.startsWith(m.split('/')[0]))) {
      if (matchesMagic(buffer, sig)) return true;
    }
  }
  // ZIP matches DOCX/XLSX — accept if application/zip variants are allowed
  if (allowedMimes.some((m) => m.includes('openxmlformats') || m.includes('zip'))) {
    const zipSig = MAGIC_SIGNATURES.find((s) => s.mime === 'application/zip');
    if (zipSig && matchesMagic(buffer, zipSig)) return true;
  }
  return false;
}

/**
 * Express middleware: validates magic numbers for in-memory uploads.
 * Must be used AFTER multer's memoryStorage middleware.
 *
 * @param {string[]} allowedMimes
 */
function magicNumberCheck(allowedMimes) {
  return (req, res, next) => {
    const files = req.files
      ? (Array.isArray(req.files) ? req.files : Object.values(req.files).flat())
      : req.file
        ? [req.file]
        : [];

    for (const file of files) {
      if (!file.buffer) continue; // S3 storage – buffer not available, skip
      if (!validateMagicNumbers(file.buffer, allowedMimes)) {
        return res.status(400).json({
          success: false,
          message: `File "${sanitizeFilename(file.originalname)}" has an invalid type. Content does not match declared MIME type.`
        });
      }
    }
    next();
  };
}

// ── File filters ──────────────────────────────────────────────────────────────
const imageFilter = (req, file, cb) => {
  // Sanitize filename before any storage operation
  file.originalname = sanitizeFilename(file.originalname);
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const documentFilter = (req, file, cb) => {
  // Sanitize filename before any storage operation
  file.originalname = sanitizeFilename(file.originalname);
  const allowed = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/gif'
  ];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, DOC, DOCX, and image files are allowed!'), false);
  }
};

// ── Multer instances ──────────────────────────────────────────────────────────
const uploadPropertyImages = multer({
  storage:    buildStorage('media/properties'),
  fileFilter: imageFilter,
  limits:     { fileSize: 5 * 1024 * 1024, files: 10 }
}).array('images', 10);

const uploadSingleImage = multer({
  storage:    buildStorage('media/misc'),
  fileFilter: imageFilter,
  limits:     { fileSize: 2 * 1024 * 1024 }
}).single('image');

const uploadAvatar = multer({
  storage:    buildStorage('media/avatars'),
  fileFilter: imageFilter,
  limits:     { fileSize: 2 * 1024 * 1024 }
}).single('avatar');

const uploadVerificationDocuments = multer({
  storage:    buildStorage('documents/verification'),
  fileFilter: documentFilter,
  limits:     { fileSize: 10 * 1024 * 1024, files: 5 }
}).array('documents', 5);

const uploadTransactionDocuments = multer({
  storage:    buildStorage('documents/transactions'),
  fileFilter: documentFilter,
  limits:     { fileSize: 10 * 1024 * 1024, files: 3 }
}).array('documents', 3);

// ── Error handler ─────────────────────────────────────────────────────────────
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size allowed is 5 MB for images and 10 MB for documents.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ success: false, message: 'Too many files uploaded.' });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ success: false, message: 'Unexpected file field.' });
    }
  }

  if (error?.message?.includes('Only')) {
    return res.status(400).json({ success: false, message: error.message });
  }

  next(error);
};

// ── Helper: resolve URL from multer result ────────────────────────────────────
// multer-s3 sets file.location; memoryStorage has no location.
function resolveFileUrl(file) {
  return file.location || null;   // null → caller must call storageService.uploadFile
}

function resolveFileKey(file) {
  return file.key || file.fieldname + '-' + Date.now();
}

module.exports = {
  uploadPropertyImages,
  uploadSingleImage,
  uploadAvatar,
  uploadVerificationDocuments,
  uploadTransactionDocuments,
  handleMulterError,
  resolveFileUrl,
  resolveFileKey,
  magicNumberCheck,
  sanitizeFilename,
};