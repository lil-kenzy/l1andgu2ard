const mongoose = require('mongoose');

const VerificationQueueSchema = new mongoose.Schema({
  // sellerId — canonical name per schema spec (mirrors applicantId below)
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  // applicantId — kept for backward compatibility with existing routes
  applicantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
  // Legacy document refs
  documentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Document' }],
  // Rich documents-submitted array with OCR-extracted metadata (schema spec)
  documentsSubmitted: [{
    type: {
      type: String,
      enum: ['title_deed', 'site_plan', 'ghana_card', 'utility_bill', 'building_permit', 'consent_letter']
    },
    fileUrl: String,
    uploadedAt: { type: Date, default: Date.now },
    ocrExtractedData: { type: mongoose.Schema.Types.Mixed }  // auto-extracted by OCR pipeline
  }],
  status: {
    type: String,
    enum: ['pending', 'in_review', 'approved', 'rejected', 'more_info_required', 'more_info_needed'],
    default: 'pending',
    index: true
  },
  assignedOfficer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  // Top-level review notes (schema spec)
  reviewNotes: { type: String },
  slaDueAt: { type: Date },
  submittedAt: { type: Date, default: Date.now, index: true },
  reviewedAt: { type: Date },
  reviewHistory: [{
    action: String,
    note: String,
    by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    at: { type: Date, default: Date.now }
  }]
});

VerificationQueueSchema.index({ status: 1, assignedOfficer: 1 });
VerificationQueueSchema.index({ submittedAt: -1 });

// Sync sellerId ↔ applicantId on save so callers can use either
VerificationQueueSchema.pre('save', function (next) {
  if (this.sellerId && !this.applicantId) this.applicantId = this.sellerId;
  if (this.applicantId && !this.sellerId) this.sellerId = this.applicantId;
  next();
});

module.exports = mongoose.model('VerificationQueue', VerificationQueueSchema);
