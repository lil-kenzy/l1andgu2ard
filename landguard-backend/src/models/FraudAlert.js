const mongoose = require('mongoose');

const FraudAlertSchema = new mongoose.Schema({
  source: { type: String, default: 'engine' },
  signalType: { type: String, required: true },
  severity: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
  reportId: { type: mongoose.Schema.Types.ObjectId, ref: 'FraudReport' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  triageStatus: { type: String, enum: ['new', 'assigned', 'escalated', 'false_positive', 'resolved'], default: 'new' },
  note: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FraudAlert', FraudAlertSchema);
