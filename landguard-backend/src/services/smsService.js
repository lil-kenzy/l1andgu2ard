/**
 * smsService.js
 * Hubtel SMS service for LANDGUARD – used exclusively for OTP delivery
 * when the user selects the "sms" channel during registration or login.
 *
 * Required .env vars:
 *   HUBTEL_CLIENT_ID       – Hubtel API client ID
 *   HUBTEL_CLIENT_SECRET   – Hubtel API client secret
 *   HUBTEL_SENDER_ID       – Registered alphanumeric sender name (max 11 chars),
 *                            e.g. "LANDGUARD"
 *
 * Hubtel SMS REST API reference:
 *   https://developers.hubtel.com/docs/send-message-api
 *
 * The same IAM credentials are NOT used here – these are Hubtel-specific keys
 * obtained from https://unity.hubtel.com → API → Credentials.
 */

const APP_NAME = process.env.APP_NAME || 'LANDGUARD';

// -------------------------------------------------------------------
// Low-level send helper (Node 18+ built-in fetch)
// -------------------------------------------------------------------
async function sendSms({ to, message }) {
  const clientId = process.env.HUBTEL_CLIENT_ID;
  const clientSecret = process.env.HUBTEL_CLIENT_SECRET;
  const senderId = process.env.HUBTEL_SENDER_ID || APP_NAME.slice(0, 11);

  if (!clientId || !clientSecret) {
    console.warn('[smsService] HUBTEL_CLIENT_ID / HUBTEL_CLIENT_SECRET not set – skipping SMS send');
    return;
  }

  // Hubtel expects a local Ghana number or E.164 (+233...)
  // Strip any leading 0 and prepend +233 if not already E.164
  const normalised = normaliseToE164(to);

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const body = JSON.stringify({
    From: senderId,
    To: normalised,
    Content: message,
  });

  try {
    const response = await fetch('https://smsc.hubtel.com/v1/messages/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${credentials}`,
      },
      body,
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`[smsService] Hubtel returned ${response.status}: ${text}`);
    }
  } catch (err) {
    // Log and continue – never crash the request because of an SMS failure
    console.error(`[smsService] Failed to send SMS to ${normalised}:`, err.message);
  }
}

// -------------------------------------------------------------------
// E.164 normalisation helper for Ghana numbers
// -------------------------------------------------------------------
function normaliseToE164(phone) {
  if (!phone) return phone;
  const digits = String(phone).replace(/\D/g, '');

  // Already in E.164 with country code
  if (digits.startsWith('233') && digits.length === 12) return `+${digits}`;

  // Local format starting with 0
  if (digits.startsWith('0') && digits.length === 10) return `+233${digits.slice(1)}`;

  // Already prefixed with +
  if (String(phone).startsWith('+')) return String(phone);

  return `+${digits}`;
}

// -------------------------------------------------------------------
// Public function
// -------------------------------------------------------------------

/**
 * Send an OTP code to a phone number via Hubtel SMS.
 *
 * @param {object} params
 * @param {string} params.to        – Recipient phone (Ghana local or E.164)
 * @param {string} params.otpCode   – The 6-digit OTP code
 * @param {number} [params.expiresMinutes=10] – Expiry hint shown in message
 */
async function sendOtpSms({ to, otpCode, expiresMinutes = 10 }) {
  const message = `Your ${APP_NAME} verification code is: ${otpCode}. It expires in ${expiresMinutes} minutes. Do not share this code with anyone.`;
  await sendSms({ to, message });
}

module.exports = { sendOtpSms };
