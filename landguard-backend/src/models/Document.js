const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', index: true },
  type: { type: String, required: true },
  fileName: { type: String, required: true },
  storageUrl: { type: String, required: true },
  storageProvider: { type: String, enum: ['s3', 'azure', 'local'], default: 'local' },
  encrypted: { type: Boolean, default: true },
  virusScanned: { type: Boolean, default: false },
  ocrStatus: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' },
  ocrText: { type: String, default: '' },
  ocrMetadata: { type: mongoose.Schema.Types.Mixed },
  expiresAt: { type: Date, index: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Document', DocumentSchema);
