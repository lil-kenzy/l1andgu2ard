const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
  lastMessage: {
    text: String,
    at: Date,
    by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  createdAt: { type: Date, default: Date.now }
});

ConversationSchema.index({ participants: 1 });

module.exports = mongoose.model('Conversation', ConversationSchema);
