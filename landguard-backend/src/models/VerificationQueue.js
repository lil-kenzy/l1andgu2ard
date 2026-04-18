const mongoose = require('mongoose');

const VerificationQueueSchema = new mongoose.Schema({
  applicantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
  documentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Document' }],
  status: {
    type: String,
    enum: ['pending', 'in_review', 'approved', 'rejected', 'more_info_required'],
    default: 'pending',
    index: true
  },
  assignedOfficer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
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

module.exports = mongoose.model('VerificationQueue', VerificationQueueSchema);
