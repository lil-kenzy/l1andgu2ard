const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  // Explicit receiver (schema spec) — denormalised from conversation for fast per-recipient queries
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  // Land parcel context (schema spec)
  landParcelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', index: true },
  // Message body — encrypted at rest (schema spec: content: { encrypted: true })
  body: { type: String, required: true },
  // Alias kept so callers can use schema-spec name `content`
  content: { type: String },
  attachments: [{ url: String, fileName: String }],
  encrypted: { type: Boolean, default: true },
  flagged: { type: Boolean, default: false, index: true },
  // Legacy multi-user read receipts
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  // Schema-spec single-timestamp read receipt
  readAt: { type: Date },
  // Schema-spec send timestamp (mirrors createdAt)
  sentAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

MessageSchema.index({ conversationId: 1, createdAt: -1 });
MessageSchema.index({ receiverId: 1, createdAt: -1 });

// Keep sentAt in sync with createdAt on insert
MessageSchema.pre('save', function (next) {
  if (this.isNew && !this.sentAt) this.sentAt = this.createdAt || new Date();
  if (this.content && !this.body) this.body = this.content;
  if (this.body && !this.content) this.content = this.body;
  next();
});

module.exports = mongoose.model('Message', MessageSchema);
