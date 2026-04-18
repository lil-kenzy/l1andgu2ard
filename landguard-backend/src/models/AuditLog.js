const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  action: { type: String, required: true, index: true },
  method: { type: String, required: true },
  path: { type: String, required: true },
  statusCode: { type: Number },
  ipAddress: { type: String },
  userAgent: { type: String },
  metadata: { type: mongoose.Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now, index: true }
}, { versionKey: false });

AuditLogSchema.index({ userId: 1, action: 1, timestamp: -1 });

module.exports = mongoose.model('AuditLog', AuditLogSchema);
