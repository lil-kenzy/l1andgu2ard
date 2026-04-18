/**
 * pushService.js
 * Firebase Cloud Messaging (FCM) push notifications via firebase-admin.
 *
 * Required .env vars (production):
 *   FIREBASE_PROJECT_ID
 *   FIREBASE_PRIVATE_KEY   – PEM string (replace literal \n with newlines)
 *   FIREBASE_CLIENT_EMAIL
 *
 * When env vars are absent the service operates in sandbox mode and logs
 * what would have been sent without making any network call.
 */

let _app   = null;
let _admin = null;

function isConfigured() {
  return !!(
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_PRIVATE_KEY &&
    process.env.FIREBASE_CLIENT_EMAIL
  );
}

function getAdmin() {
  if (_admin) return _admin;

  _admin = require('firebase-admin');

  if (!_app) {
    // Avoid duplicate app initialisation (e.g. hot-reload in dev)
    if (_admin.apps.length === 0) {
      _app = _admin.initializeApp({
        credential: _admin.credential.cert({
          projectId:   process.env.FIREBASE_PROJECT_ID,
          privateKey:  (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL
        })
      });
    } else {
      _app = _admin.app();
    }
  }

  return _admin;
}

/**
 * Send a push notification to a single device FCM token.
 *
 * @param {string} fcmToken
 * @param {string} title
 * @param {string} body
 * @param {Record<string,string>} [data]  extra key-value pairs (string values only)
 * @returns {Promise<string|null>}  FCM message ID or null on error
 */
async function sendPush(fcmToken, title, body, data = {}) {
  if (!fcmToken) return null;

  if (!isConfigured()) {
    console.log(`[pushService] sandbox: would send push → ${fcmToken.slice(0, 12)}… | "${title}"`);
    return 'sandbox-msg-id';
  }

  const admin = getAdmin();

  const message = {
    token: fcmToken,
    notification: { title, body },
    data:          stringifyValues(data),
    android: { priority: 'high' },
    apns:    { payload: { aps: { sound: 'default' } } }
  };

  try {
    const msgId = await admin.messaging().send(message);
    return msgId;
  } catch (err) {
    console.error('[pushService] send error:', err.code || err.message);
    return null;
  }
}

/**
 * Send a push notification to multiple devices (FCM multicast).
 *
 * @param {string[]} fcmTokens
 * @param {string}   title
 * @param {string}   body
 * @param {Record<string,string>} [data]
 * @returns {Promise<{successCount:number, failureCount:number}>}
 */
async function sendMulticast(fcmTokens, title, body, data = {}) {
  const tokens = (fcmTokens || []).filter(Boolean);
  if (!tokens.length) return { successCount: 0, failureCount: 0 };

  if (!isConfigured()) {
    console.log(`[pushService] sandbox: would multicast (${tokens.length} tokens) | "${title}"`);
    return { successCount: tokens.length, failureCount: 0 };
  }

  const admin = getAdmin();

  const message = {
    tokens,
    notification: { title, body },
    data:          stringifyValues(data),
    android: { priority: 'high' },
    apns:    { payload: { aps: { sound: 'default' } } }
  };

  try {
    const result = await admin.messaging().sendEachForMulticast(message);
    return {
      successCount: result.successCount,
      failureCount: result.failureCount
    };
  } catch (err) {
    console.error('[pushService] multicast error:', err.code || err.message);
    return { successCount: 0, failureCount: tokens.length };
  }
}

/** FCM data values must be strings */
function stringifyValues(obj) {
  const out = {};
  for (const [k, v] of Object.entries(obj || {})) {
    out[k] = String(v);
  }
  return out;
}

module.exports = { sendPush, sendMulticast, isConfigured };
