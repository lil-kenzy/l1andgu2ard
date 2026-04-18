const express = require('express');
const { authenticate } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const Transaction = require('../models/Transaction');

const router = express.Router();

router.get('/fee-calculate', authenticate, asyncHandler(async (req, res) => {
  const amount = Number.parseFloat(req.query.amount || '0');
  if (!amount || Number.isNaN(amount) || amount <= 0) {
    return res.status(400).json({ success: false, message: 'Valid amount query param is required' });
  }

  const fee = amount * 0.02;
  return res.json({
    success: true,
    data: {
      amount,
      platformFee: fee,
      total: amount + fee,
      currency: req.query.currency || 'GHS'
    }
  });
}));

router.post('/webhook', asyncHandler(async (req, res) => {
  return res.status(202).json({
    success: true,
    message: 'Webhook accepted (provider verification and signature checks should be configured in production)',
    data: req.body
  });
}));

router.get('/escrow/status', authenticate, asyncHandler(async (req, res) => {
  const { transactionId } = req.query;
  const tx = await Transaction.findById(transactionId).select('status escrowAmount escrowReleased');
  if (!tx) return res.status(404).json({ success: false, message: 'Transaction not found' });

  return res.json({
    success: true,
    data: {
      transactionId: tx._id,
      status: tx.status,
      escrowAmount: tx.escrowAmount,
      escrowState: tx.escrowReleased ? 'released' : 'held'
    }
  });
}));

module.exports = router;
