const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, immutable: true },
  action: { type: String, required: true, index: true, immutable: true },
  method: { type: String, required: true, immutable: true },
  path: { type: String, required: true, immutable: true },
  statusCode: { type: Number, immutable: true },
  ipAddress: { type: String, immutable: true },
  userAgent: { type: String, immutable: true },
  metadata: { type: mongoose.Schema.Types.Mixed, immutable: true },
  timestamp: { type: Date, default: Date.now, index: true, immutable: true }
}, {
  versionKey: false,
  // Disable updateOne / findOneAndUpdate at the model level
  strict: true
});

AuditLogSchema.index({ userId: 1, action: 1, timestamp: -1 });

// Block any attempt to update or delete audit log entries (write-once)
function blockMutation(next) {
  next(new Error('AuditLog is immutable: updates and deletions are not permitted'));
}
AuditLogSchema.pre('updateOne', blockMutation);
AuditLogSchema.pre('updateMany', blockMutation);
AuditLogSchema.pre('findOneAndUpdate', blockMutation);
AuditLogSchema.pre('findOneAndDelete', blockMutation);
AuditLogSchema.pre('deleteOne', blockMutation);
AuditLogSchema.pre('deleteMany', blockMutation);

module.exports = mongoose.model('AuditLog', AuditLogSchema);
