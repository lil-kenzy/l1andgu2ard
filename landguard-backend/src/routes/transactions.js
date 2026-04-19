/**
 * transactions.js
 * Transaction lifecycle: initiate → agree → pay → escrow → complete.
 *
 * Key business rules:
 *   - Both buyer AND seller must confirm terms before payment can be initiated.
 *   - platformFeePaid must be true (set by payments.js on Paystack success) before
 *     the property can be marked "sold" and the ownership certificate released.
 *   - Ownership certificate endpoint is locked until platformFeePaid === true.
 */

const express = require('express');
const { param, body, validationResult } = require('express-validator');
const Transaction = require('../models/Transaction');
const Property    = require('../models/Property');
const { authenticate, authorize } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

const TX_FEE_PCT = Number.parseFloat(process.env.TRANSACTION_FEE_PERCENT || '2') / 100;

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
  }
  next();
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function isParty(tx, userId) {
  return String(tx.buyer) === String(userId) || String(tx.seller) === String(userId);
}

// ── GET /api/transactions/history ────────────────────────────────────────────
// Returns all transactions where the authenticated user is buyer or seller.
router.get('/history', authenticate, asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { role, status, page = 1, limit = 20 } = req.query;

  const query = {};
  if (role === 'buyer')  query.buyer  = userId;
  else if (role === 'seller') query.seller = userId;
  else query.$or = [{ buyer: userId }, { seller: userId }];

  if (status) query.status = status;

  const skip = (Number(page) - 1) * Number(limit);
  const [transactions, total] = await Promise.all([
    Transaction.find(query)
      .populate('property', 'title location price images type')
      .populate('buyer',  'personalInfo.fullName personalInfo.email')
      .populate('seller', 'personalInfo.fullName personalInfo.email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Transaction.countDocuments(query)
  ]);

  return res.json({ success: true, data: transactions, total, page: Number(page), limit: Number(limit) });
}));

// ── POST /api/transactions/initiate ──────────────────────────────────────────
// Buyer initiates the purchase flow.
// Body: { propertyId, paymentMethod, agreedPrice, agreedTerms }
router.post('/initiate', authenticate, [
  body('propertyId').isMongoId().withMessage('Valid propertyId is required'),
  body('paymentMethod').isIn(['bank_transfer', 'mobile_money', 'card', 'cash']).withMessage('Invalid paymentMethod'),
  body('agreedPrice').optional().isFloat({ min: 0 }).withMessage('agreedPrice must be a positive number'),
  validate
], asyncHandler(async (req, res) => {
  const { propertyId, paymentMethod, agreedPrice, agreedTerms } = req.body;

  const property = await Property.findById(propertyId);
  if (!property) return res.status(404).json({ success: false, message: 'Property not found' });
  if (!property.verified || property.status !== 'active') {
    return res.status(409).json({ success: false, message: 'Property is not available for purchase' });
  }

  const sellerId = property.seller;
  if (String(sellerId) === String(req.user._id)) {
    return res.status(400).json({ success: false, message: 'Seller cannot initiate a transaction on their own property' });
  }

  // Prevent duplicate open transactions for the same buyer/property
  const existing = await Transaction.findOne({
    property: propertyId,
    buyer:    req.user._id,
    status:   { $nin: ['completed', 'cancelled'] }
  });
  if (existing) {
    return res.status(409).json({
      success: false,
      message: 'You already have an active transaction for this property',
      data: { transactionId: existing._id }
    });
  }

  const price = agreedPrice || property.price;
  const platformFeeAmount = Number((price * TX_FEE_PCT).toFixed(2));

  const tx = await Transaction.create({
    property:          propertyId,
    buyer:             req.user._id,
    seller:            sellerId,
    amount:            price,
    agreedPrice:       price,
    agreedTerms:       agreedTerms || '',
    paymentMethod,
    transactionType:   property.type === 'rent' ? 'rental' : 'sale',
    platformFeeAmount,
    // Buyer implicitly confirms by initiating
    buyerConfirmed:    true,
    status:            'initiated',
    timeline: [{ status: 'initiated', note: 'Transaction initiated by buyer', updatedBy: req.user._id }]
  });

  return res.status(201).json({
    success: true,
    message: 'Transaction initiated. Awaiting seller confirmation.',
    data: tx
  });
}));

// ── POST /api/transactions/:id/confirm ───────────────────────────────────────
// Buyer or seller confirms the deal terms.
// Once BOTH parties confirm → status advances to 'payment_pending'.
router.post('/:id/confirm', authenticate, [
  param('id').isMongoId().withMessage('Invalid transaction ID'),
  validate
], asyncHandler(async (req, res) => {
  const tx = await Transaction.findById(req.params.id);
  if (!tx) return res.status(404).json({ success: false, message: 'Transaction not found' });

  if (!isParty(tx, req.user._id)) {
    return res.status(403).json({ success: false, message: 'Only a party to this transaction may confirm it' });
  }

  if (!['initiated', 'payment_pending'].includes(tx.status)) {
    return res.status(409).json({ success: false, message: `Cannot confirm in status: ${tx.status}` });
  }

  // Allow updating agreed terms on confirm
  if (req.body.agreedPrice)  tx.agreedPrice  = req.body.agreedPrice;
  if (req.body.agreedTerms)  tx.agreedTerms  = req.body.agreedTerms;

  if (String(tx.buyer) === String(req.user._id))  tx.buyerConfirmed  = true;
  if (String(tx.seller) === String(req.user._id)) tx.sellerConfirmed = true;

  const bothConfirmed = tx.buyerConfirmed && tx.sellerConfirmed;
  if (bothConfirmed && tx.status === 'initiated') {
    tx.status = 'payment_pending';
    tx.timeline.push({ status: 'payment_pending', note: 'Both parties confirmed — awaiting payment', updatedBy: req.user._id });
  } else {
    const party = String(tx.buyer) === String(req.user._id) ? 'buyer' : 'seller';
    tx.timeline.push({ status: tx.status, note: `${party} confirmed terms`, updatedBy: req.user._id });
  }

  await tx.save();

  return res.json({
    success: true,
    message: bothConfirmed ? 'Both parties confirmed. Proceed to payment.' : 'Confirmation recorded. Awaiting other party.',
    data: {
      transactionId:  tx._id,
      status:         tx.status,
      buyerConfirmed: tx.buyerConfirmed,
      sellerConfirmed: tx.sellerConfirmed,
      bothConfirmed
    }
  });
}));

// ── GET /api/transactions/:id ─────────────────────────────────────────────────
router.get('/:id', authenticate, [
  param('id').isMongoId().withMessage('Invalid transaction ID'),
  validate
], asyncHandler(async (req, res) => {
  const tx = await Transaction.findById(req.params.id)
    .populate('property', 'title location price images type status')
    .populate('buyer',  'personalInfo.fullName personalInfo.email personalInfo.phoneNumber')
    .populate('seller', 'personalInfo.fullName personalInfo.email personalInfo.phoneNumber');

  if (!tx) return res.status(404).json({ success: false, message: 'Transaction not found' });

  if (!isParty(tx, req.user._id) && req.user.role !== 'admin' && req.user.role !== 'government_admin') {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  return res.json({ success: true, data: tx });
}));

// ── PUT /api/transactions/:id/status ─────────────────────────────────────────
// Admin-only status override.
router.put('/:id/status', authenticate, authorize('admin', 'government_admin'), [
  param('id').isMongoId().withMessage('Invalid transaction ID'),
  body('status').isIn(['initiated','payment_pending','payment_received','documents_pending','verification_pending','completed','cancelled','disputed'])
    .withMessage('Invalid status'),
  validate
], asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const tx = await Transaction.findById(req.params.id);
  if (!tx) return res.status(404).json({ success: false, message: 'Transaction not found' });

  tx.status = status;
  tx.timeline.push({ status, note: note || `Status updated by admin`, updatedBy: req.user._id });
  await tx.save();

  return res.json({ success: true, data: tx });
}));

// ── POST /api/transactions/:id/complete ──────────────────────────────────────
// Admin or buyer marks transaction completed (escrow already released via payments.js).
// Requires platformFeePaid === true.
router.post('/:id/complete', authenticate, [
  param('id').isMongoId().withMessage('Invalid transaction ID'),
  validate
], asyncHandler(async (req, res) => {
  const tx = await Transaction.findById(req.params.id);
  if (!tx) return res.status(404).json({ success: false, message: 'Transaction not found' });

  const isBuyer = String(tx.buyer) === String(req.user._id);
  const isAdmin = req.user.role === 'admin' || req.user.role === 'government_admin';
  if (!isBuyer && !isAdmin) {
    return res.status(403).json({ success: false, message: 'Only the buyer or admin may complete this transaction' });
  }

  if (!tx.platformFeePaid) {
    return res.status(402).json({ success: false, message: 'Platform fee must be paid before completing the transaction' });
  }

  if (!['documents_pending', 'verification_pending', 'payment_received'].includes(tx.status)) {
    return res.status(409).json({ success: false, message: `Cannot complete transaction in status: ${tx.status}` });
  }

  tx.status         = 'completed';
  tx.completionDate = new Date();
  tx.escrowReleased = true;
  tx.timeline.push({ status: 'completed', note: 'Transaction completed', updatedBy: req.user._id });
  await tx.save();

  // Mark property as sold
  await Property.findByIdAndUpdate(tx.property, { status: 'sold' });

  return res.json({ success: true, data: { transactionId: tx._id, status: tx.status, completionDate: tx.completionDate } });
}));

// ── POST /api/transactions/:id/cancel ────────────────────────────────────────
router.post('/:id/cancel', authenticate, [
  param('id').isMongoId().withMessage('Invalid transaction ID'),
  validate
], asyncHandler(async (req, res) => {
  const tx = await Transaction.findById(req.params.id);
  if (!tx) return res.status(404).json({ success: false, message: 'Transaction not found' });

  if (!isParty(tx, req.user._id) && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  if (['completed', 'cancelled'].includes(tx.status)) {
    return res.status(409).json({ success: false, message: `Cannot cancel a ${tx.status} transaction` });
  }

  tx.status = 'cancelled';
  tx.timeline.push({ status: 'cancelled', note: req.body.reason || 'Transaction cancelled', updatedBy: req.user._id });
  await tx.save();

  return res.json({ success: true, data: { transactionId: tx._id, status: tx.status } });
}));

// ── POST /api/transactions/:id/upload-document ───────────────────────────────
// Attach a document URL to the transaction (after upload to S3 via /uploads).
router.post('/:id/upload-document', authenticate, [
  param('id').isMongoId().withMessage('Invalid transaction ID'),
  body('url').isURL().withMessage('Valid document URL is required'),
  body('type').isIn(['title_deed','contract','receipt','verification_certificate','other']).withMessage('Invalid document type'),
  validate
], asyncHandler(async (req, res) => {
  const tx = await Transaction.findById(req.params.id);
  if (!tx) return res.status(404).json({ success: false, message: 'Transaction not found' });

  if (!isParty(tx, req.user._id) && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  tx.documents.push({ type: req.body.type, url: req.body.url, uploadedBy: req.user._id });
  tx.timeline.push({ status: tx.status, note: `Document uploaded: ${req.body.type}`, updatedBy: req.user._id });
  await tx.save();

  return res.json({ success: true, data: { documents: tx.documents } });
}));

// ── GET /api/transactions/user/:userId ────────────────────────────────────────
// Admin can query by userId; users can only query themselves.
router.get('/user/:userId', authenticate, [
  param('userId').isMongoId().withMessage('Invalid userId'),
  validate
], asyncHandler(async (req, res) => {
  const targetId = req.params.userId;

  if (String(req.user._id) !== targetId && req.user.role !== 'admin' && req.user.role !== 'government_admin') {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  const transactions = await Transaction.getUserTransactions(targetId)
    .catch(() => Transaction.find({ $or: [{ buyer: targetId }, { seller: targetId }] }).sort({ createdAt: -1 }));

  return res.json({ success: true, data: transactions });
}));

// ── GET /api/transactions/:id/ownership-certificate ──────────────────────────
// Returns a signed ownership certificate for the buyer.
// LOCKED until platformFeePaid === true AND transaction is completed.
router.get('/:id/ownership-certificate', authenticate, [
  param('id').isMongoId().withMessage('Invalid transaction ID'),
  validate
], asyncHandler(async (req, res) => {
  const tx = await Transaction.findById(req.params.id)
    .populate('property', 'title location gpsAddress type price size images')
    .populate('buyer',  'personalInfo.fullName personalInfo.ghanaCardNumber')
    .populate('seller', 'personalInfo.fullName personalInfo.ghanaCardNumber');

  if (!tx) return res.status(404).json({ success: false, message: 'Transaction not found' });

  if (!isParty(tx, req.user._id) && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  if (!tx.platformFeePaid) {
    return res.status(402).json({
      success: false,
      message: 'Ownership certificate is locked until the platform fee is paid.',
      code: 'FEE_NOT_PAID'
    });
  }

  if (tx.status !== 'completed') {
    return res.status(409).json({
      success: false,
      message: 'Ownership certificate is only available for completed transactions.',
      code: 'TX_NOT_COMPLETE'
    });
  }

  return res.json({
    success: true,
    data: {
      certificateType: 'LANDGUARD_OWNERSHIP_CERTIFICATE',
      issuedAt:         new Date().toISOString(),
      transactionId:    tx._id,
      property: {
        title:          tx.property?.title,
        location:       tx.property?.location,
        gpsAddress:     tx.property?.gpsAddress,
        type:           tx.property?.type,
        agreedPrice:    tx.agreedPrice,
        currency:       tx.currency
      },
      buyer:  { name: tx.buyer?.personalInfo?.fullName },
      seller: { name: tx.seller?.personalInfo?.fullName },
      completionDate:  tx.completionDate,
      platformFeePaid: tx.platformFeePaid,
      reference:       tx.paymentReference
    }
  });
}));

module.exports = router;