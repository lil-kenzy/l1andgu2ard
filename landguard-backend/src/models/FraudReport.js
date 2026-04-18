const mongoose = require('mongoose');

const FraudReportSchema = new mongoose.Schema({
  reporterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
  transactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
  evidence: [{ url: String, note: String }],
  description: { type: String, required: true },
  status: { type: String, enum: ['open', 'investigating', 'resolved', 'dismissed'], default: 'open' },
  findings: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FraudReport', FraudReportSchema);
