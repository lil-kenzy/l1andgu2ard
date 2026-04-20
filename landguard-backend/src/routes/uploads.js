const express  = require('express');
const { authenticate } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const {
  uploadPropertyImages,
  uploadVerificationDocuments,
  uploadTransactionDocuments,
  handleMulterError,
  resolveFileUrl,
  resolveFileKey,
  magicNumberCheck,
} = require('../middleware/upload');
const {
  uploadFile,
  deleteFile,
  getPresignedUploadUrl,
  isS3Configured
} = require('../services/storageService');
const Document = require('../models/Document');

const router = express.Router();

// ── Helper: persist files uploaded via multer (S3 or memory) ─────────────────
async function persistFiles(files, req, folder) {
  const results = [];
  for (const file of files) {
    let url  = resolveFileUrl(file);   // set by multer-s3
    let key  = resolveFileKey(file);
    let provider = 's3';

    if (!url) {
      // Memory storage fallback: upload via storageService
      const result = await uploadFile({
        buffer:       file.buffer,
        mimeType:     file.mimetype,
        originalName: file.originalname,
        folder,
        ownerId:      req.user?.id
      });
      url      = result.url;
      key      = result.key;
      provider = result.provider;
    }

    results.push({ url, key, originalName: file.originalname, mimeType: file.mimetype, size: file.size, provider });
  }
  return results;
}

// ── POST /api/uploads/property-images ────────────────────────────────────────
router.post(
  '/property-images',
  authenticate,
  (req, res, next) => {
    uploadPropertyImages(req, res, (err) => {
      if (err) return handleMulterError(err, req, res, next);
      next();
    });
  },
  magicNumberCheck(['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
  asyncHandler(async (req, res) => {
    const files = req.files || [];
    if (!files.length) {
      return res.status(400).json({ success: false, message: 'No images uploaded' });
    }

    const uploaded = await persistFiles(files, req, 'media/properties');

    return res.status(201).json({
      success: true,
      message: `${uploaded.length} image(s) uploaded`,
      data: uploaded,
      storageProvider: isS3Configured() ? 's3' : 'local'
    });
  })
);

// ── POST /api/uploads/verification-documents ─────────────────────────────────
router.post(
  '/verification-documents',
  authenticate,
  (req, res, next) => {
    uploadVerificationDocuments(req, res, (err) => {
      if (err) return handleMulterError(err, req, res, next);
      next();
    });
  },
  magicNumberCheck([
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/gif',
  ]),
  asyncHandler(async (req, res) => {
    const files = req.files || [];
    if (!files.length) {
      return res.status(400).json({ success: false, message: 'No documents uploaded' });
    }

    const uploaded = await persistFiles(files, req, 'documents/verification');

    // Create Document records and queue for OCR + admin review
    const documents = await Promise.all(
      uploaded.map((f) =>
        Document.create({
          ownerId:         req.user.id,
          propertyId:      req.body.propertyId || undefined,
          type:            req.body.documentType || 'verification',
          fileName:        f.originalName,
          storageUrl:      f.url,
          storageKey:      f.key,
          storageProvider: f.provider,
          encrypted:       true,
          virusScanned:    false,
          ocrStatus:       'pending'
        })
      )
    );

    return res.status(201).json({
      success: true,
      message: `${documents.length} document(s) uploaded and queued for verification`,
      data:    documents,
      storageProvider: isS3Configured() ? 's3' : 'local'
    });
  })
);

// ── POST /api/uploads/transaction-documents ───────────────────────────────────
router.post(
  '/transaction-documents',
  authenticate,
  (req, res, next) => {
    uploadTransactionDocuments(req, res, (err) => {
      if (err) return handleMulterError(err, req, res, next);
      next();
    });
  },
  magicNumberCheck([
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/gif',
  ]),
  asyncHandler(async (req, res) => {
    const files = req.files || [];
    if (!files.length) {
      return res.status(400).json({ success: false, message: 'No documents uploaded' });
    }

    const uploaded = await persistFiles(files, req, 'documents/transactions');

    const documents = await Promise.all(
      uploaded.map((f) =>
        Document.create({
          ownerId:         req.user.id,
          propertyId:      req.body.propertyId   || undefined,
          transactionId:   req.body.transactionId || undefined,
          type:            req.body.documentType  || 'transaction',
          fileName:        f.originalName,
          storageUrl:      f.url,
          storageKey:      f.key,
          storageProvider: f.provider,
          encrypted:       true,
          virusScanned:    false,
          ocrStatus:       'pending'
        })
      )
    );

    return res.status(201).json({
      success: true,
      message: `${documents.length} transaction document(s) uploaded`,
      data:    documents,
      storageProvider: isS3Configured() ? 's3' : 'local'
    });
  })
);

// ── DELETE /api/uploads/:key ──────────────────────────────────────────────────
// key is base64url-encoded to avoid path issues
router.delete(
  '/:encodedKey',
  authenticate,
  asyncHandler(async (req, res) => {
    const key = Buffer.from(req.params.encodedKey, 'base64url').toString('utf8');

    // Ensure the requester owns the document
    const doc = await Document.findOne({ storageKey: key, ownerId: req.user.id });
    if (!doc && req.user.role !== 'admin' && req.user.role !== 'government_admin') {
      return res.status(404).json({ success: false, message: 'File not found or access denied' });
    }

    await deleteFile(key, doc?.storageBucket || undefined);
    if (doc) await doc.deleteOne();

    return res.json({ success: true, message: 'File deleted' });
  })
);

// ── GET /api/uploads/presigned-url ────────────────────────────────────────────
// Generate a presigned PUT URL for direct-to-S3 client uploads
router.get(
  '/presigned-url',
  authenticate,
  asyncHandler(async (req, res) => {
    const { mimeType, folder, expiresIn } = req.query;

    if (!mimeType) {
      return res.status(400).json({ success: false, message: 'mimeType query param is required' });
    }

    const result = await getPresignedUploadUrl({
      mimeType,
      folder:    folder || 'uploads/misc',
      ownerId:   req.user.id,
      expiresIn: expiresIn ? Number.parseInt(expiresIn, 10) : 300
    });

    return res.json({ success: true, data: result });
  })
);

module.exports = router;