const express  = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { parsePagination } = require('../utils/pagination');
const { notify, notifyMany } = require('../services/notificationService');

const router = express.Router();

// ── GET /api/notifications ────────────────────────────────────────────────────
router.get('/', authenticate, asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const { unreadOnly } = req.query;

  const filter = {
    recipient:  req.user.id,
    expiresAt:  { $gt: new Date() }
  };
  if (unreadOnly === 'true') filter.read = false;

  const [items, total, unreadCount] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Notification.countDocuments(filter),
    Notification.countDocuments({ recipient: req.user.id, read: false, expiresAt: { $gt: new Date() } })
  ]);

  return res.json({ success: true, data: items, page, limit, total, unreadCount });
}));

// ── PUT /api/notifications/:id/read ──────────────────────────────────────────
router.put('/:id/read', authenticate, asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({ _id: req.params.id, recipient: req.user.id });
  if (!notification) {
    return res.status(404).json({ success: false, message: 'Notification not found' });
  }

  await notification.markAsRead();
  return res.json({ success: true, data: notification });
}));

// ── PUT /api/notifications/read-all ──────────────────────────────────────────
router.put('/read-all', authenticate, asyncHandler(async (req, res) => {
  const result = await Notification.updateMany(
    { recipient: req.user.id, read: false },
    { $set: { read: true, readAt: new Date() } }
  );

  return res.json({ success: true, message: `${result.modifiedCount} notification(s) marked as read` });
}));

// ── DELETE /api/notifications/:id ────────────────────────────────────────────
router.delete('/:id', authenticate, asyncHandler(async (req, res) => {
  const result = await Notification.deleteOne({ _id: req.params.id, recipient: req.user.id });
  if (result.deletedCount === 0) {
    return res.status(404).json({ success: false, message: 'Notification not found' });
  }

  return res.json({ success: true, message: 'Notification deleted' });
}));

// ── POST /api/notifications/send  (admin broadcast) ──────────────────────────
router.post('/send', authenticate, authorize('admin', 'government_admin'), asyncHandler(async (req, res) => {
  const { recipientIds, type, title, message, priority, channels, data: extraData } = req.body;

  if (!Array.isArray(recipientIds) || !recipientIds.length) {
    return res.status(400).json({ success: false, message: 'recipientIds must be a non-empty array' });
  }
  if (!type || !title || !message) {
    return res.status(400).json({ success: false, message: 'type, title and message are required' });
  }

  await notifyMany(recipientIds, {
    type,
    title,
    message,
    priority: priority || 'medium',
    channels: channels || ['in_app', 'socket', 'push'],
    data:     extraData || {},
    senderId: req.user.id
  });

  return res.json({ success: true, message: `Notification sent to ${recipientIds.length} recipient(s)` });
}));

// ── GET /api/notifications/settings ──────────────────────────────────────────
router.get('/settings', authenticate, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('preferences.notifications');
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  return res.json({ success: true, data: user.preferences?.notifications || { email: true, sms: true, push: true } });
}));

// ── PUT /api/notifications/settings ──────────────────────────────────────────
router.put('/settings', authenticate, asyncHandler(async (req, res) => {
  const { email, sms, push } = req.body;
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  if (!user.preferences) user.preferences = {};
  if (!user.preferences.notifications) user.preferences.notifications = {};

  if (typeof email === 'boolean') user.preferences.notifications.email = email;
  if (typeof sms   === 'boolean') user.preferences.notifications.sms   = sms;
  if (typeof push  === 'boolean') user.preferences.notifications.push  = push;

  user.markModified('preferences');
  await user.save();

  return res.json({ success: true, data: user.preferences.notifications });
}));

module.exports = router;