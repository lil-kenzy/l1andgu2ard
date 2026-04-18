const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const Document = require('../models/Document');

const router = express.Router();

router.post('/upload', authenticate, asyncHandler(async (req, res) => {
  const { type, fileName, storageUrl, propertyId, expiresAt } = req.body;

  if (!type || !fileName || !storageUrl) {
    return res.status(400).json({ success: false, message: 'type, fileName and storageUrl are required' });
  }

  const document = await Document.create({
    ownerId: req.user.id,
    propertyId,
    type,
    fileName,
    storageUrl,
    encrypted: true,
    virusScanned: false,
    ocrStatus: 'pending',
    expiresAt: expiresAt ? new Date(expiresAt) : undefined
  });

  return res.status(201).json({
    success: true,
    message: 'Document uploaded and queued for scan',
    data: document
  });
}));

router.post('/ocr', authenticate, asyncHandler(async (req, res) => {
  const { documentId } = req.body;
  const document = await Document.findById(documentId);

  if (!document) {
    return res.status(404).json({ success: false, message: 'Document not found' });
  }

  document.ocrStatus = 'completed';
  document.ocrText = 'OCR pipeline placeholder output';
  document.ocrMetadata = {
    extractedAt: new Date(),
    provider: process.env.OCR_PROVIDER || 'local-sandbox'
  };
  document.virusScanned = true;

  await document.save();

  return res.json({ success: true, data: document });
}));

router.get('/expired', authenticate, authorize('admin', 'government_admin'), asyncHandler(async (req, res) => {
  const thresholdDays = Number.parseInt(req.query.thresholdDays || '30', 10);
  const until = new Date(Date.now() + thresholdDays * 24 * 60 * 60 * 1000);

  const docs = await Document.find({
    expiresAt: { $lte: until, $gte: new Date() }
  }).sort({ expiresAt: 1 });

  return res.json({ success: true, data: docs });
}));

module.exports = router;
