const mongoose = require('mongoose');

const DisputeSchema = new mongoose.Schema({
  caseNumber: { type: String, required: true, unique: true },
  parties: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
  evidence: [{ url: String, note: String }],
  status: { type: String, enum: ['open', 'under_review', 'resolved', 'closed'], default: 'open' },
  decision: { type: String, default: '' },
  freezeParcel: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  resolvedAt: { type: Date }
});

module.exports = mongoose.model('Dispute', DisputeSchema);
