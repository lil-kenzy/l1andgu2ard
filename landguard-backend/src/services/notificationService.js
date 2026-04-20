/**
 * notificationService.js
 * Central hub for all notification delivery.
 *
 * Delivery channels per notification:
 *   in_app  – persist Notification doc in MongoDB
 *   socket  – emit 'notification:new' to the recipient's user-{userId} room
 *   push    – send FCM push to recipient's fcmToken (if set)
 *   email   – delegate to emailService (if recipient has email)
 *
 * Usage:
 *   const { notify } = require('../services/notificationService');
 *   await notify({ recipientId, type, title, message, data, channels, priority });
 */

const Notification = require('../models/Notification');
const User         = require('../models/User');
const { emitToUser, emitToAdmins } = require('./socketService');
const { sendPush } = require('./pushService');

/**
 * Create and deliver a notification.
 *
 * @param {object}   opts
 * @param {string}   opts.recipientId          Mongoose ObjectId string
 * @param {string}   opts.type                 Notification.type enum value
 * @param {string}   opts.title                max 100 chars
 * @param {string}   opts.message              max 500 chars
 * @param {object}   [opts.data]               { propertyId, transactionId, amount, … }
 * @param {string[]} [opts.channels]           default ['in_app', 'socket', 'push']
 * @param {string}   [opts.priority]           'low'|'medium'|'high'|'urgent'
 * @param {string}   [opts.senderId]           optional sender
 * @param {string}   [opts.actionUrl]
 * @returns {Promise<import('mongoose').Document|null>}  saved Notification doc (or null on non-fatal failure)
 */
async function notify(opts) {
  const {
    recipientId,
    type,
    title,
    message,
    data       = {},
    channels   = ['in_app', 'socket', 'push'],
    priority   = 'medium',
    senderId,
    actionUrl
  } = opts;

  let doc = null;

  // ── 1. Persist in-app notification ────────────────────────────────────────
  if (channels.includes('in_app')) {
    try {
      doc = await Notification.create({
        recipient:  recipientId,
        sender:     senderId || undefined,
        type,
        title,
        message,
        data,
        priority,
        channels,
        actionUrl:  actionUrl || undefined
      });
    } catch (err) {
      console.error('[notificationService] DB create error:', err.message);
    }
  }

  // ── 2. Socket real-time delivery ──────────────────────────────────────────
  if (channels.includes('socket')) {
    const payload = doc ? doc.toObject() : { recipientId, type, title, message, data, priority };
    emitToUser(recipientId, payload);
  }

  // ── 3. FCM push notification ──────────────────────────────────────────────
  if (channels.includes('push')) {
    try {
      const recipient = await User.findById(recipientId).select('fcmToken preferences.notifications');
      if (recipient?.fcmToken && recipient.preferences?.notifications?.push !== false) {
        await sendPush(
          recipient.fcmToken,
          title,
          message,
          { type, ...(data.propertyId ? { propertyId: String(data.propertyId) } : {}) }
        );
      }
    } catch (err) {
      console.error('[notificationService] push error:', err.message);
    }
  }

  return doc;
}

/**
 * Notify multiple recipients at once (e.g. all admins).
 * @param {string[]} recipientIds
 * @param {Omit<Parameters<typeof notify>[0], 'recipientId'>} opts
 */
async function notifyMany(recipientIds, opts) {
  if (!recipientIds?.length) return;
  await Promise.all(recipientIds.map((id) => notify({ ...opts, recipientId: id })));
}

/**
 * Broadcast a notification to every active admin/government_admin.
 * Uses socket only (not DB) for speed; logs to console in sandbox.
 * @param {string} event  socket event name
 * @param {object} data
 */
function broadcastToAdmins(event, data) {
  emitToAdmins(event, { ...data, timestamp: new Date() });
}

/**
 * Fetch all admins from DB and send them a persisted notification.
 */
async function notifyAdmins(opts) {
  const admins = await User.find({
    role:        { $in: ['admin', 'government_admin'] },
    isActive:    true,
    isSuspended: false
  }).select('_id').lean();

  const ids = admins.map((a) => String(a._id));
  await notifyMany(ids, opts);
}

module.exports = { notify, notifyMany, notifyAdmins, broadcastToAdmins };
