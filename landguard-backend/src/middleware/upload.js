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

// ── File filters ──────────────────────────────────────────────────────────────
const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const documentFilter = (req, file, cb) => {
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
  resolveFileKey
};