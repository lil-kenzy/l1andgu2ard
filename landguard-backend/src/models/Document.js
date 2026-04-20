const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  ownerId:          { type: mongoose.Schema.Types.ObjectId, ref: 'User',        required: true, index: true },
  propertyId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Property',    index: true },
  transactionId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction', index: true },
  type:             { type: String, required: true },
  fileName:         { type: String, required: true },
  storageUrl:       { type: String, required: true },
  storageKey:       { type: String, index: true },          // S3 object key
  storageBucket:    { type: String },                       // S3 bucket name
  storageProvider:  { type: String, enum: ['s3', 'azure', 'local'], default: 'local' },
  encrypted:        { type: Boolean, default: true },
  virusScanned:     { type: Boolean, default: false },
  ocrStatus:        { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' },
  ocrText:          { type: String, default: '' },
  ocrMetadata:      { type: mongoose.Schema.Types.Mixed },  // extractMetadata() output
  expiresAt:        { type: Date, index: true },
  adminReviewNote:  { type: String, default: '' },
  createdAt:        { type: Date, default: Date.now }
});

module.exports = mongoose.model('Document', DocumentSchema);
