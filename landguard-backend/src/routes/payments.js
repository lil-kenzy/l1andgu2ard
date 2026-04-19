/**
 * payments.js
 * Payment routes for LANDGUARD — Paystack integration + escrow lifecycle.
 *
 * Paystack env vars:
 *   PAYSTACK_SECRET_KEY       – sk_live_... or sk_test_... from https://dashboard.paystack.com
 *   PAYSTACK_PUBLIC_KEY       – pk_live_... or pk_test_...
 *   PAYSTACK_WEBHOOK_SECRET   – Secret set in Paystack dashboard → Settings → API → Webhook hash
 *
 * Routes:
 *   GET  /fee-calculate              – fee preview (no auth needed for UI)
 *   POST /initialize                 – initiate Paystack payment → returns authorization_url
 *   GET  /verify/:reference          – verify Paystack payment after redirect
 *   POST /webhook                    – Paystack webhook (raw body, HMAC-SHA512 signature check)
 *   POST /escrow/initiate            – create escrow hold for a transaction (buyer)
 *   POST /escrow/release             – release escrow to seller (admin or buyer confirmation)
 *   GET  /escrow/status              – check escrow state for a transaction
 *
 * Sandbox mode: When PAYSTACK_SECRET_KEY is not set, initialize returns a mock
 * checkout URL and verify returns a mock success so the app works in dev.
 */

const express  = require('express');
const crypto   = require('crypto');
const { authenticate, authorize } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const Transaction  = require('../models/Transaction');
const Property     = require('../models/Property');

const router = express.Router();

const PAYSTACK_SECRET_KEY     = process.env.PAYSTACK_SECRET_KEY     || '';
const PAYSTACK_WEBHOOK_SECRET = process.env.PAYSTACK_WEBHOOK_SECRET || PAYSTACK_SECRET_KEY;
const FRONTEND_URL            = process.env.FRONTEND_URL            || 'http://localhost:3000';
const TX_FEE_PCT              = Number.parseFloat(process.env.TRANSACTION_FEE_PERCENT || '2') / 100;

// ── Paystack HTTP helper ──────────────────────────────────────────────────────

async function paystackPost(path, body) {
  const res = await fetch(`https://api.paystack.co${path}`, {
    method:  'POST',
    headers: {
      Authorization:  `Bearer ${PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json'
    },
    body:   JSON.stringify(body),
    signal: AbortSignal.timeout(10000)
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Paystack ${path} HTTP ${res.status}: ${text}`);
  }
  return res.json();
}

async function paystackGet(path) {
  const res = await fetch(`https://api.paystack.co${path}`, {
    headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
    signal:  AbortSignal.timeout(10000)
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Paystack ${path} HTTP ${res.status}: ${text}`);
  }
  return res.json();
}

// ── Sandbox mocks ─────────────────────────────────────────────────────────────

function sandboxInitialize(reference, amountKobo) {
  return {
    status:  true,
    message: 'Authorization URL created (sandbox)',
    data: {
      authorization_url: `${FRONTEND_URL}/payment/sandbox?reference=${reference}&amount=${amountKobo}`,
      access_code:       `sandbox_${reference}`,
      reference
    }
  };
}

function sandboxVerify(reference) {
  return {
    status: true,
    message: 'Verification successful (sandbox)',
    data: {
      status:    'success',
      reference,
      amount:    0,
      currency:  'GHS',
      channel:   'sandbox',
      paid_at:   new Date().toISOString(),
      customer:  { email: 'sandbox@landguard.test' }
    }
  };
}

// ── Fee calculation ───────────────────────────────────────────────────────────
// GET /api/payments/fee-calculate?amount=50000
router.get('/fee-calculate', asyncHandler(async (req, res) => {
  const amount = Number.parseFloat(req.query.amount || '0');
  if (!amount || Number.isNaN(amount) || amount <= 0) {
    return res.status(400).json({ success: false, message: 'Valid `amount` query param is required' });
  }

  const platformFee = amount * TX_FEE_PCT;
  return res.json({
    success: true,
    data: {
      amount,
      platformFee: Number(platformFee.toFixed(2)),
      total:       Number((amount + platformFee).toFixed(2)),
      currency:    req.query.currency || 'GHS',
      feePercent:  TX_FEE_PCT * 100
    }
  });
}));

// ── Initialize Paystack payment ───────────────────────────────────────────────
// POST /api/payments/initialize
// Body: { transactionId, email }
// Creates a Paystack checkout for the full transaction amount + platform fee.
router.post('/initialize', authenticate, asyncHandler(async (req, res) => {
  const { transactionId, email: bodyEmail } = req.body;
  if (!transactionId) {
    return res.status(400).json({ success: false, message: '`transactionId` is required' });
  }

  const tx = await Transaction.findById(transactionId).populate('buyer', 'email phone fullName');
  if (!tx) return res.status(404).json({ success: false, message: 'Transaction not found' });

  // Only the buyer may initiate payment
  if (String(tx.buyer._id) !== String(req.user._id)) {
    return res.status(403).json({ success: false, message: 'Only the buyer may initiate payment for this transaction' });
  }

  if (!['initiated', 'payment_pending'].includes(tx.status)) {
    return res.status(409).json({ success: false, message: `Payment cannot be initiated in status: ${tx.status}` });
  }

  const platformFee   = tx.amount * TX_FEE_PCT;
  const totalGHS      = tx.amount + platformFee;
  const amountKobo    = Math.round(totalGHS * 100); // Paystack uses kobo (1 GHS = 100 kobo)
  const reference     = `LG-${transactionId}-${Date.now()}`;
  const customerEmail = bodyEmail || tx.buyer.email;
  const callbackUrl   = `${FRONTEND_URL}/payment/verify?reference=${reference}`;

  let paystackData;

  if (!PAYSTACK_SECRET_KEY) {
    paystackData = sandboxInitialize(reference, amountKobo);
  } else {
    paystackData = await paystackPost('/transaction/initialize', {
      email:        customerEmail,
      amount:       amountKobo,
      reference,
      currency:     tx.currency || 'GHS',
      callback_url: callbackUrl,
      metadata: {
        transactionId: String(tx._id),
        propertyId:    String(tx.property),
        buyerId:       String(tx.buyer._id),
        sellerId:      String(tx.seller),
        platformFee:   platformFee.toFixed(2),
        appName:       process.env.APP_NAME || 'LANDGUARD'
      }
    });
  }

  if (!paystackData.status) {
    return res.status(502).json({ success: false, message: paystackData.message || 'Paystack initialization failed' });
  }

  // Persist the reference and advance status
  tx.paymentReference = reference;
  tx.status           = 'payment_pending';
  tx.timeline.push({ status: 'payment_pending', note: `Paystack payment initialized (ref: ${reference})`, updatedBy: req.user._id });
  await tx.save();

  return res.json({
    success:          true,
    data: {
      authorizationUrl: paystackData.data.authorization_url,
      accessCode:       paystackData.data.access_code,
      reference,
      amountGHS:        totalGHS,
      amountKobo,
      sandbox:          !PAYSTACK_SECRET_KEY
    }
  });
}));

// ── Verify Paystack payment ───────────────────────────────────────────────────
// GET /api/payments/verify/:reference
router.get('/verify/:reference', authenticate, asyncHandler(async (req, res) => {
  const { reference } = req.params;
  if (!reference) return res.status(400).json({ success: false, message: '`reference` param is required' });

  let paystackData;
  if (!PAYSTACK_SECRET_KEY) {
    paystackData = sandboxVerify(reference);
  } else {
    paystackData = await paystackGet(`/transaction/verify/${encodeURIComponent(reference)}`);
  }

  if (!paystackData.status || paystackData.data?.status !== 'success') {
    return res.status(402).json({
      success: false,
      message: 'Payment not confirmed',
      paystackStatus: paystackData.data?.status || 'unknown'
    });
  }

  // Find and update the transaction
  const tx = await Transaction.findOne({ paymentReference: reference });

  // Authorisation: only the buyer for this transaction (or an admin) may verify
  if (tx) {
    const isBuyer = String(tx.buyer) === String(req.user._id);
    const isAdmin = req.user.role === 'admin' || req.user.role === 'government_admin';
    if (!isBuyer && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorised to verify this payment' });
    }
  }

  if (tx && tx.status === 'payment_pending') {
    tx.status           = 'payment_received';
    tx.platformFeePaid  = true;
    tx.timeline.push({ status: 'payment_received', note: `Paystack payment verified (ref: ${reference})`, updatedBy: req.user._id });
    // Auto-set escrow to 10% of transaction amount if not already set
    if (!tx.escrowAmount) tx.calculateEscrow?.();
    await tx.save();
  }

  return res.json({
    success: true,
    data: {
      verified:     true,
      reference,
      paidAt:       paystackData.data?.paid_at,
      channel:      paystackData.data?.channel,
      transactionId: tx?._id || null,
      sandbox:      !PAYSTACK_SECRET_KEY
    }
  });
}));

// ── Paystack Webhook ──────────────────────────────────────────────────────────
// POST /api/payments/webhook
// Paystack signs each event with HMAC-SHA512 using PAYSTACK_WEBHOOK_SECRET.
// This route must use raw body parsing (see server.js configuration).
router.post('/webhook', asyncHandler(async (req, res) => {
  const signature = req.headers['x-paystack-signature'];

  if (PAYSTACK_WEBHOOK_SECRET && signature) {
    const hash = crypto
      .createHmac('sha512', PAYSTACK_WEBHOOK_SECRET)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (hash !== signature) {
      console.warn('[payments/webhook] Invalid Paystack signature — request rejected');
      return res.status(401).json({ success: false, message: 'Invalid webhook signature' });
    }
  }

  const event = req.body;
  const { event: eventType, data } = event || {};

  if (eventType === 'charge.success' && data?.reference) {
    const tx = await Transaction.findOne({ paymentReference: data.reference });
    if (tx && tx.status === 'payment_pending') {
      tx.status          = 'payment_received';
      tx.platformFeePaid = true;
      tx.timeline.push({ status: 'payment_received', note: `Paystack webhook: charge.success (ref: ${data.reference})` });
      if (!tx.escrowAmount) tx.calculateEscrow?.();
      await tx.save();
    }
  }

  // Always acknowledge quickly so Paystack stops retrying
  return res.status(200).json({ success: true });
}));

// ── Escrow: initiate ──────────────────────────────────────────────────────────
// POST /api/payments/escrow/initiate
// Body: { transactionId }
// Moves funds into escrow hold once payment_received.
router.post('/escrow/initiate', authenticate, asyncHandler(async (req, res) => {
  const { transactionId } = req.body;
  if (!transactionId) return res.status(400).json({ success: false, message: '`transactionId` is required' });

  const tx = await Transaction.findById(transactionId);
  if (!tx) return res.status(404).json({ success: false, message: 'Transaction not found' });

  // Only buyer or admin may place funds in escrow
  const isParty = String(tx.buyer) === String(req.user._id) || req.user.role === 'admin';
  if (!isParty) return res.status(403).json({ success: false, message: 'Not authorised to initiate escrow for this transaction' });

  if (tx.status !== 'payment_received') {
    return res.status(409).json({ success: false, message: `Escrow can only be initiated when status is 'payment_received' (current: ${tx.status})` });
  }

  if (!tx.escrowAmount || tx.escrowAmount <= 0) {
    tx.escrowAmount = tx.amount * 0.1;
  }

  tx.status = 'documents_pending';
  tx.timeline.push({ status: 'documents_pending', note: 'Escrow initiated — funds held pending document verification', updatedBy: req.user._id });
  await tx.save();

  return res.json({
    success: true,
    data: {
      transactionId: tx._id,
      escrowAmount:  tx.escrowAmount,
      escrowState:   'held',
      status:        tx.status
    }
  });
}));

// ── Escrow: release ───────────────────────────────────────────────────────────
// POST /api/payments/escrow/release
// Body: { transactionId }
// Releases escrow to seller once all conditions are met.
// Only admin or buyer may release.
router.post('/escrow/release', authenticate, asyncHandler(async (req, res) => {
  const { transactionId } = req.body;
  if (!transactionId) return res.status(400).json({ success: false, message: '`transactionId` is required' });

  const tx = await Transaction.findById(transactionId);
  if (!tx) return res.status(404).json({ success: false, message: 'Transaction not found' });

  const isBuyer = String(tx.buyer) === String(req.user._id);
  const isAdmin = req.user.role === 'admin';

  if (!isBuyer && !isAdmin) {
    return res.status(403).json({ success: false, message: 'Only the buyer or an admin may release escrow' });
  }

  if (tx.escrowReleased) {
    return res.status(409).json({ success: false, message: 'Escrow has already been released for this transaction' });
  }

  if (!['documents_pending', 'verification_pending'].includes(tx.status)) {
    return res.status(409).json({ success: false, message: `Escrow can only be released when status is 'documents_pending' or 'verification_pending' (current: ${tx.status})` });
  }

  tx.escrowReleased = true;
  tx.status         = 'completed';
  tx.completionDate = new Date();
  tx.timeline.push({ status: 'completed', note: 'Escrow released to seller — transaction completed', updatedBy: req.user._id });
  await tx.save();

  // Mark the property as sold
  await Property.findByIdAndUpdate(tx.property, { status: 'sold' });

  return res.json({
    success: true,
    data: {
      transactionId:  tx._id,
      escrowReleased: true,
      status:         tx.status,
      completionDate: tx.completionDate
    }
  });
}));

// ── Escrow: status ────────────────────────────────────────────────────────────
// GET /api/payments/escrow/status?transactionId=...
router.get('/escrow/status', authenticate, asyncHandler(async (req, res) => {
  const { transactionId } = req.query;
  if (!transactionId) return res.status(400).json({ success: false, message: '`transactionId` query param is required' });

  const tx = await Transaction.findById(transactionId).select('status escrowAmount escrowReleased buyer seller');
  if (!tx) return res.status(404).json({ success: false, message: 'Transaction not found' });

  // Only parties or admin may view escrow
  const isParty = [String(tx.buyer), String(tx.seller)].includes(String(req.user._id));
  if (!isParty && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorised to view this transaction' });
  }

  return res.json({
    success: true,
    data: {
      transactionId: tx._id,
      status:        tx.status,
      escrowAmount:  tx.escrowAmount,
      escrowState:   tx.escrowReleased ? 'released' : 'held'
    }
  });
}));

module.exports = router;
