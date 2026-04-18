/**
 * emailService.js
 * Centralised Amazon SES email service for LANDGUARD.
 *
 * All outbound emails (OTPs, password resets, welcome, receipts,
 * notifications) go through this module.
 *
 * Required .env vars:
 *   AWS_ACCESS_KEY_ID       – IAM user access key (must have ses:SendEmail)
 *   AWS_SECRET_ACCESS_KEY   – IAM user secret key
 *   AWS_SES_REGION          – SES region (e.g. us-east-1 or eu-west-1)
 *   AWS_SES_FROM_EMAIL      – Verified sender address in SES
 *   FRONTEND_URL            – Base URL of the web app (for password-reset links)
 *   APP_NAME                – Defaults to "LANDGUARD"
 */

const aws = require('aws-sdk');
const nodemailer = require('nodemailer');

const APP_NAME = process.env.APP_NAME || 'LANDGUARD';
const FROM_ADDRESS = `"${APP_NAME}" <${process.env.AWS_SES_FROM_EMAIL}>`;

// -------------------------------------------------------------------
// Lazy-initialised transporter – created once on first use
// -------------------------------------------------------------------
let _transporter;

function getTransporter() {
  if (_transporter) return _transporter;

  const ses = new aws.SES({
    region: process.env.AWS_SES_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  });

  _transporter = nodemailer.createTransport({ SES: { ses, aws } });
  return _transporter;
}

// -------------------------------------------------------------------
// Low-level send helper
// -------------------------------------------------------------------
async function sendEmail({ to, subject, html, text }) {
  if (!process.env.AWS_SES_FROM_EMAIL) {
    console.warn('[emailService] AWS_SES_FROM_EMAIL not set – skipping email send');
    return;
  }

  try {
    await getTransporter().sendMail({
      from: FROM_ADDRESS,
      to,
      subject,
      html,
      text: text || subject,
    });
  } catch (err) {
    // Log and continue – never crash the request because of an email failure
    console.error(`[emailService] Failed to send "${subject}" to ${to}:`, err.message);
  }
}

// -------------------------------------------------------------------
// Shared layout wrapper
// -------------------------------------------------------------------
function layout(bodyHtml, preheader = '') {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${APP_NAME}</title>
  <style>
    body { margin:0; padding:0; background:#f4f4f4; font-family:Arial,sans-serif; }
    .wrapper { max-width:600px; margin:40px auto; background:#fff; border-radius:8px; overflow:hidden; }
    .header { background:#1a5276; padding:24px 32px; }
    .header h1 { color:#fff; margin:0; font-size:22px; letter-spacing:1px; }
    .body { padding:32px; color:#333; line-height:1.6; }
    .otp-box { font-size:36px; font-weight:bold; letter-spacing:8px; color:#1a5276;
               background:#eaf0fb; border-radius:8px; padding:16px 24px; text-align:center;
               margin:24px 0; }
    .btn { display:inline-block; padding:12px 28px; background:#1a5276; color:#fff;
           border-radius:6px; text-decoration:none; font-weight:bold; margin-top:16px; }
    .footer { background:#f4f4f4; padding:16px 32px; font-size:12px; color:#888; text-align:center; }
    .divider { border:none; border-top:1px solid #eee; margin:24px 0; }
  </style>
</head>
<body>
  ${preheader ? `<span style="display:none;max-height:0;overflow:hidden;">${preheader}</span>` : ''}
  <div class="wrapper">
    <div class="header"><h1>${APP_NAME}</h1></div>
    <div class="body">${bodyHtml}</div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} ${APP_NAME} – Ghana Land Registry Platform<br/>
      If you did not request this email, please ignore it.
    </div>
  </div>
</body>
</html>`;
}

// -------------------------------------------------------------------
// Public email-sending functions
// -------------------------------------------------------------------

/**
 * Send an OTP code to the user's email address.
 * Used for both registration and login (email channel).
 */
async function sendOtpEmail({ to, fullName, otpCode, expiresMinutes = 10 }) {
  const body = `
    <p>Hi <strong>${fullName || 'there'}</strong>,</p>
    <p>Use the one-time code below to verify your ${APP_NAME} account. It expires in <strong>${expiresMinutes} minutes</strong>.</p>
    <div class="otp-box">${otpCode}</div>
    <p>Do not share this code with anyone, including ${APP_NAME} staff.</p>`;

  await sendEmail({
    to,
    subject: `${otpCode} – Your ${APP_NAME} verification code`,
    html: layout(body, `Your verification code is ${otpCode}`),
  });
}

/**
 * Send a password-reset link.
 */
async function sendPasswordResetEmail({ to, fullName, resetToken }) {
  const frontendUrl = (process.env.FRONTEND_URL || '').replace(/\/$/, '');
  const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

  const body = `
    <p>Hi <strong>${fullName || 'there'}</strong>,</p>
    <p>We received a request to reset your ${APP_NAME} password. Click the button below to choose a new password. This link expires in <strong>30 minutes</strong>.</p>
    <p><a class="btn" href="${resetUrl}">Reset My Password</a></p>
    <hr class="divider"/>
    <p style="font-size:12px;color:#888;">If the button doesn't work, copy and paste this URL into your browser:<br/>${resetUrl}</p>`;

  await sendEmail({
    to,
    subject: `Reset your ${APP_NAME} password`,
    html: layout(body, 'Reset your password'),
  });
}

/**
 * Welcome email sent after first successful OTP verification.
 */
async function sendWelcomeEmail({ to, fullName, role }) {
  const roleLabel = role === 'seller' ? 'Seller' : role === 'government_admin' ? 'Government Admin' : 'Buyer';

  const body = `
    <p>Hi <strong>${fullName}</strong>,</p>
    <p>Welcome to <strong>${APP_NAME}</strong> – Ghana's trusted land registry platform. Your account has been successfully verified.</p>
    <p><strong>Account type:</strong> ${roleLabel}</p>
    <p>You can now:</p>
    <ul>
      <li>Search and view registered land parcels</li>
      <li>Submit ownership documents for verification</li>
      <li>Track transaction status in real time</li>
    </ul>
    <p>If you have any questions, contact us at <a href="mailto:${process.env.SUPPORT_EMAIL || 'support@landguard.gov.gh'}">${process.env.SUPPORT_EMAIL || 'support@landguard.gov.gh'}</a>.</p>`;

  await sendEmail({
    to,
    subject: `Welcome to ${APP_NAME}!`,
    html: layout(body, `Welcome to ${APP_NAME}`),
  });
}

/**
 * Notify a user that their account has been suspended.
 */
async function sendAccountSuspensionEmail({ to, fullName, reason }) {
  const body = `
    <p>Hi <strong>${fullName || 'there'}</strong>,</p>
    <p>Your <strong>${APP_NAME}</strong> account has been <strong>suspended</strong>.</p>
    <p><strong>Reason:</strong> ${reason || 'Policy violation'}</p>
    <p>If you believe this is an error, please contact support at <a href="mailto:${process.env.SUPPORT_EMAIL || 'support@landguard.gov.gh'}">${process.env.SUPPORT_EMAIL || 'support@landguard.gov.gh'}</a>.</p>`;

  await sendEmail({
    to,
    subject: `Your ${APP_NAME} account has been suspended`,
    html: layout(body, 'Account suspended'),
  });
}

/**
 * Notify a user that their account suspension has been lifted.
 */
async function sendAccountUnsuspensionEmail({ to, fullName }) {
  const body = `
    <p>Hi <strong>${fullName || 'there'}</strong>,</p>
    <p>Good news! Your <strong>${APP_NAME}</strong> account has been <strong>reinstated</strong>. You can now log in and use all platform features.</p>
    <p>If you have any questions, contact us at <a href="mailto:${process.env.SUPPORT_EMAIL || 'support@landguard.gov.gh'}">${process.env.SUPPORT_EMAIL || 'support@landguard.gov.gh'}</a>.</p>`;

  await sendEmail({
    to,
    subject: `Your ${APP_NAME} account has been reinstated`,
    html: layout(body, 'Account reinstated'),
  });
}

/**
 * Notify a property seller that their listing was verified or rejected.
 */
async function sendPropertyVerificationEmail({ to, fullName, propertyTitle, verified, notes }) {
  const statusWord = verified ? 'Approved' : 'Rejected';
  const statusColour = verified ? '#1e8449' : '#c0392b';

  const body = `
    <p>Hi <strong>${fullName || 'there'}</strong>,</p>
    <p>Your property listing <strong>"${propertyTitle}"</strong> has been reviewed by the ${APP_NAME} verification team.</p>
    <p><strong>Status:</strong> <span style="color:${statusColour};font-weight:bold;">${statusWord}</span></p>
    ${notes ? `<p><strong>Notes from reviewer:</strong><br/>${notes}</p>` : ''}
    ${verified
      ? '<p>Your property is now listed on the public registry and visible to buyers.</p>'
      : '<p>Please review the notes above, address any outstanding issues, and resubmit your documents for re-verification.</p>'}
    <p>Log in to your account to view further details.</p>`;

  await sendEmail({
    to,
    subject: `Property listing ${statusWord.toLowerCase()}: ${propertyTitle}`,
    html: layout(body, `Property ${statusWord.toLowerCase()}`),
  });
}

/**
 * Send a transaction receipt to a buyer or seller.
 */
async function sendTransactionReceiptEmail({ to, fullName, transactionId, propertyTitle, amount, currency = 'GHS', role, completedAt }) {
  const formatted = new Intl.NumberFormat('en-GH', { minimumFractionDigits: 2 }).format(amount || 0);
  const dateStr = completedAt ? new Date(completedAt).toLocaleString('en-GH', { dateStyle: 'long', timeStyle: 'short' }) : new Date().toLocaleString();

  const body = `
    <p>Hi <strong>${fullName || 'there'}</strong>,</p>
    <p>A land transaction has been completed on ${APP_NAME}. Here is your receipt.</p>
    <table style="width:100%;border-collapse:collapse;margin-top:16px;">
      <tr style="background:#f0f4f8;"><td style="padding:10px;font-weight:bold;width:40%">Transaction ID</td><td style="padding:10px;">${transactionId}</td></tr>
      <tr><td style="padding:10px;font-weight:bold;">Property</td><td style="padding:10px;">${propertyTitle}</td></tr>
      <tr style="background:#f0f4f8;"><td style="padding:10px;font-weight:bold;">Your Role</td><td style="padding:10px;text-transform:capitalize;">${role || 'party'}</td></tr>
      <tr><td style="padding:10px;font-weight:bold;">Amount</td><td style="padding:10px;">${currency} ${formatted}</td></tr>
      <tr style="background:#f0f4f8;"><td style="padding:10px;font-weight:bold;">Date</td><td style="padding:10px;">${dateStr}</td></tr>
    </table>
    <p style="margin-top:24px;">Please retain this receipt for your records. For queries, contact <a href="mailto:${process.env.SUPPORT_EMAIL || 'support@landguard.gov.gh'}">${process.env.SUPPORT_EMAIL || 'support@landguard.gov.gh'}</a>.</p>`;

  await sendEmail({
    to,
    subject: `${APP_NAME} Transaction Receipt – ${transactionId}`,
    html: layout(body, `Transaction receipt ${transactionId}`),
  });
}

/**
 * Generic notification email – used for custom/admin-initiated messages.
 */
async function sendNotificationEmail({ to, fullName, subject, message }) {
  const body = `
    <p>Hi <strong>${fullName || 'there'}</strong>,</p>
    <p>${message}</p>`;

  await sendEmail({
    to,
    subject,
    html: layout(body, subject),
  });
}

module.exports = {
  sendOtpEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendAccountSuspensionEmail,
  sendAccountUnsuspensionEmail,
  sendPropertyVerificationEmail,
  sendTransactionReceiptEmail,
  sendNotificationEmail,
};
