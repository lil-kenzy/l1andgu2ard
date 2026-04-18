const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    enum: [
      'property_interest',
      'transaction_update',
      'payment_received',
      'document_uploaded',
      'verification_approved',
      'verification_rejected',
      'system_announcement',
      'property_alert',
      'transaction_completed',
      'dispute_opened',
      'dispute_resolved'
    ],
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  message: {
    type: String,
    required: true,
    maxlength: 500
  },
  data: {
    // Additional data specific to notification type
    propertyId: mongoose.Schema.Types.ObjectId,
    transactionId: mongoose.Schema.Types.ObjectId,
    amount: Number,
    location: String,
    deadline: Date
  },
  read: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  channels: [{
    type: String,
    enum: ['in_app', 'email', 'sms', 'push'],
    default: ['in_app']
  }],
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  },
  actionRequired: {
    type: Boolean,
    default: false
  },
  actionUrl: {
    type: String
  },
  metadata: {
    // Additional metadata for analytics
    userAgent: String,
    ipAddress: String,
    source: String
  }
}, {
  timestamps: true
});

// Indexes for better query performance
NotificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });
NotificationSchema.index({ type: 1, createdAt: -1 });
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index
NotificationSchema.index({ 'channels': 1 });

// Virtual for isExpired
NotificationSchema.virtual('isExpired').get(function() {
  return this.expiresAt < new Date();
});

// Method to mark as read
NotificationSchema.methods.markAsRead = function() {
  this.read = true;
  this.readAt = new Date();
  return this.save();
};

// Method to send via specific channel
NotificationSchema.methods.sendViaChannel = function(channel) {
  // TODO: Implement actual sending logic (email, SMS, push notifications)
  console.log(`Sending ${channel} notification: ${this.title}`);
  return Promise.resolve();
};

// Static method to get unread notifications for user
NotificationSchema.statics.getUnreadForUser = function(userId) {
  return this.find({
    recipient: userId,
    read: false,
    expiresAt: { $gt: new Date() }
  }).sort({ createdAt: -1 });
};

// Static method to get notifications by type
NotificationSchema.statics.getByType = function(type, limit = 50) {
  return this.find({ type })
    .populate('recipient', 'name email')
    .populate('sender', 'name email')
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to create system notification
NotificationSchema.statics.createSystemNotification = function(recipientIds, type, title, message, data = {}) {
  const notifications = recipientIds.map(recipientId => ({
    recipient: recipientId,
    type,
    title,
    message,
    data,
    channels: ['in_app', 'email']
  }));

  return this.insertMany(notifications);
};

// Static method to cleanup expired notifications
NotificationSchema.statics.cleanupExpired = function() {
  return this.deleteMany({
    expiresAt: { $lt: new Date() }
  });
};

module.exports = mongoose.model('Notification', NotificationSchema);