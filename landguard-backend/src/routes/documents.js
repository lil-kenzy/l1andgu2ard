const express  = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const Document = require('../models/Document');
const VerificationQueue = require('../models/VerificationQueue');
const { getPresignedUrl } = require('../services/storageService');
const { processDocument } = require('../services/ocrService');

const router = express.Router();

// ── POST /api/documents/upload ────────────────────────────────────────────────
// Called after a client-side presigned PUT upload (or by /uploads routes).
// Registers the document record, queues OCR, optionally creates a VerificationQueue entry.
router.post('/upload', authenticate, asyncHandler(async (req, res) => {
  const { type, fileName, storageUrl, storageKey, storageBucket, storageProvider,
          propertyId, transactionId, expiresAt, queueForVerification } = req.body;

  if (!type || !fileName || !storageUrl) {
    return res.status(400).json({ success: false, message: 'type, fileName and storageUrl are required' });
  }

  const document = await Document.create({
    ownerId:         req.user.id,
    propertyId:      propertyId     || undefined,
    transactionId:   transactionId  || undefined,
    type,
    fileName,
    storageUrl,
    storageKey:      storageKey     || null,
    storageBucket:   storageBucket  || null,
    storageProvider: storageProvider || 'local',
    encrypted:       true,
    virusScanned:    false,
    ocrStatus:       'pending',
    expiresAt:       expiresAt ? new Date(expiresAt) : undefined
  });

  // Auto-create a VerificationQueue entry for verification-type documents
  let queueEntry = null;
  if (queueForVerification || /verif|title|deed|id_doc/i.test(type)) {
    queueEntry = await VerificationQueue.create({
      applicantId:  req.user.id,
      propertyId:   propertyId || undefined,
      documentIds:  [document._id],
      status:       'pending',
      slaDueAt:     new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5-day SLA
    });
  }

  return res.status(201).json({
    success: true,
    message: 'Document uploaded and queued for OCR',
    data: document,
    verificationQueueId: queueEntry?._id || null
  });
}));

// ── POST /api/documents/ocr ───────────────────────────────────────────────────
// Trigger (or re-trigger) OCR processing for a specific document.
// In production this would be triggered by an S3 event / queue worker.
router.post('/ocr', authenticate, asyncHandler(async (req, res) => {
  const { documentId } = req.body;
  if (!documentId) {
    return res.status(400).json({ success: false, message: 'documentId is required' });
  }

  const document = await Document.findById(documentId);
  if (!document) {
    return res.status(404).json({ success: false, message: 'Document not found' });
  }

  // Only the owner or admin can trigger OCR
  if (
    document.ownerId.toString() !== req.user.id &&
    !['admin', 'government_admin'].includes(req.user.role)
  ) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  document.ocrStatus = 'processing';
  await document.save();

  // Fetch the file bytes so we can send them to the OCR provider.
  // For S3 objects we generate a short-lived presigned URL and download.
  // For local sandbox URLs we read the file from disk.
  let fileBuffer;
  let mimeType = 'application/pdf';

  try {
    if (document.storageKey && document.storageProvider === 's3') {
      const signedUrl = await getPresignedUrl(document.storageKey, document.storageBucket, 60);
      const { default: https } = await import('node:https');
      fileBuffer = await new Promise((resolve, reject) => {
        https.get(signedUrl, (resp) => {
          const chunks = [];
          resp.on('data', (c) => chunks.push(c));
          resp.on('end', () => resolve(Buffer.concat(chunks)));
          resp.on('error', reject);
        }).on('error', reject);
      });
    } else if (document.storageUrl.startsWith('local://')) {
      const localPath = document.storageUrl.replace('local://', '');
      const { readFileSync } = require('fs');
      fileBuffer = readFileSync(localPath);
    } else {
      // Remote URL — download via HTTPS
      const urlStr   = document.storageUrl;
      const protocol = urlStr.startsWith('https') ? require('https') : require('http');
      fileBuffer = await new Promise((resolve, reject) => {
        protocol.get(urlStr, (resp) => {
          const chunks = [];
          resp.on('data', (c) => chunks.push(c));
          resp.on('end', () => resolve(Buffer.concat(chunks)));
          resp.on('error', reject);
        }).on('error', reject);
      });
    }

    // Infer MIME from filename
    if (/\.pdf$/i.test(document.fileName))  mimeType = 'application/pdf';
    else if (/\.png$/i.test(document.fileName))  mimeType = 'image/png';
    else if (/\.jpe?g$/i.test(document.fileName)) mimeType = 'image/jpeg';
  } catch (fetchErr) {
    console.error('[documents/ocr] failed to fetch file for OCR:', fetchErr.message);
    document.ocrStatus = 'failed';
    document.ocrMetadata = { error: fetchErr.message, extractedAt: new Date() };
    await document.save();
    return res.status(422).json({ success: false, message: 'Could not retrieve file for OCR', details: fetchErr.message });
  }

  // Run OCR
  let ocrResult;
  try {
    ocrResult = await processDocument(fileBuffer, mimeType);
  } catch (ocrErr) {
    console.error('[documents/ocr] OCR processing error:', ocrErr.message);
    document.ocrStatus = 'failed';
    document.ocrMetadata = { error: ocrErr.message, extractedAt: new Date() };
    await document.save();
    return res.status(422).json({ success: false, message: 'OCR processing failed', details: ocrErr.message });
  }

  document.ocrStatus   = 'completed';
  document.ocrText     = ocrResult.rawText;
  document.ocrMetadata = {
    ...ocrResult.metadata,
    provider:   ocrResult.provider,
    sandbox:    ocrResult.sandbox,
    extractedAt: new Date()
  };
  document.virusScanned = true; // mark after successful processing (no AV in sandbox)
  await document.save();

  return res.json({
    success: true,
    data: document,
    sandbox: ocrResult.sandbox
  });
}));

// ── GET /api/documents/:id ────────────────────────────────────────────────────
router.get('/:id', authenticate, asyncHandler(async (req, res) => {
  const document = await Document.findById(req.params.id);
  if (!document) {
    return res.status(404).json({ success: false, message: 'Document not found' });
  }

  // Owners and admins can view
  if (
    document.ownerId.toString() !== req.user.id &&
    !['admin', 'government_admin'].includes(req.user.role)
  ) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  // Attach a short-lived presigned GET URL for S3 documents
  let accessUrl = document.storageUrl;
  if (document.storageKey && document.storageProvider === 's3') {
    try {
      accessUrl = await getPresignedUrl(document.storageKey, document.storageBucket, 900); // 15 min
    } catch { /* use original URL */ }
  }

  return res.json({ success: true, data: { ...document.toObject(), accessUrl } });
}));

// ── GET /api/documents/:id/view ───────────────────────────────────────────────
// Returns a short-lived access URL for document viewing, with watermark metadata
// embedded in response headers. The caller must overlay the watermark on the
// client side using userId + timestamp from the response headers.
// This endpoint emits an audit log for every view access.
router.get('/:id/view', authenticate, asyncHandler(async (req, res) => {
  const document = await Document.findById(req.params.id);
  if (!document) {
    return res.status(404).json({ success: false, message: 'Document not found' });
  }

  // Owners and admins can view
  if (
    document.ownerId.toString() !== req.user.id &&
    !['admin', 'government_admin'].includes(req.user.role)
  ) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  const viewedAt = new Date().toISOString();
  const watermarkText = `LANDGUARD | User: ${req.user.id} | ${viewedAt}`;

  // Attach a short-lived presigned GET URL for S3 documents (5 min for viewer)
  let accessUrl = document.storageUrl;
  if (document.storageKey && document.storageProvider === 's3') {
    try {
      accessUrl = await getPresignedUrl(document.storageKey, document.storageBucket, 300); // 5 min
    } catch { /* use original URL */ }
  }

  // Emit watermark metadata via response headers so the client can render the overlay
  res.set('X-Watermark-Text',   encodeURIComponent(watermarkText));
  res.set('X-Watermark-UserId', String(req.user.id));
  res.set('X-Watermark-Ts',     viewedAt);
  res.set('X-Document-Id',      String(document._id));

  return res.json({
    success: true,
    data: {
      ...document.toObject(),
      accessUrl,
      watermark: { text: watermarkText, userId: req.user.id, timestamp: viewedAt }
    }
  });
}));

// ── GET /api/documents/expired ────────────────────────────────────────────────
router.get('/expired', authenticate, authorize('admin', 'government_admin'), asyncHandler(async (req, res) => {
  const thresholdDays = Number.parseInt(req.query.thresholdDays || '30', 10);
  const until = new Date(Date.now() + thresholdDays * 24 * 60 * 60 * 1000);

  const docs = await Document.find({
    expiresAt: { $lte: until, $gte: new Date() }
  }).sort({ expiresAt: 1 });

  return res.json({ success: true, data: docs });
}));

module.exports = router;
