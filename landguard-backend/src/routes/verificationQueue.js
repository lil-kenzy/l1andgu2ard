const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const VerificationQueue = require('../models/VerificationQueue');
const { parsePagination } = require('../utils/pagination');

const router = express.Router();

router.get('/', authenticate, authorize('admin', 'government_admin'), asyncHandler(async (req, res) => {
  const { status } = req.query;
  const { page, limit, skip } = parsePagination(req.query);
  const filter = status ? { status } : {};

  const [items, total] = await Promise.all([
    VerificationQueue.find(filter)
      .populate('applicantId', 'personalInfo.fullName personalInfo.email')
      .populate('assignedOfficer', 'personalInfo.fullName')
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit),
    VerificationQueue.countDocuments(filter)
  ]);

  return res.json({ success: true, data: items, page, limit, total });
}));

router.get('/:id', authenticate, authorize('admin', 'government_admin'), asyncHandler(async (req, res) => {
  const item = await VerificationQueue.findById(req.params.id)
    .populate('applicantId')
    .populate('documentIds');

  if (!item) return res.status(404).json({ success: false, message: 'Queue item not found' });

  return res.json({ success: true, data: item });
}));

router.post('/:id/review', authenticate, authorize('admin', 'government_admin'), asyncHandler(async (req, res) => {
  const { action, note } = req.body;
  const item = await VerificationQueue.findById(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Queue item not found' });

  const actionMap = {
    approve: 'approved',
    reject: 'rejected',
    request_more_info: 'more_info_required'
  };

  if (!actionMap[action]) {
    return res.status(400).json({ success: false, message: 'Invalid review action' });
  }

  item.status = actionMap[action];
  item.reviewedAt = new Date();
  item.reviewHistory.push({
    action,
    note: note || '',
    by: req.user.id,
    at: new Date()
  });
  await item.save();

  return res.json({ success: true, data: item });
}));

router.get('/:id/history', authenticate, authorize('admin', 'government_admin'), asyncHandler(async (req, res) => {
  const item = await VerificationQueue.findById(req.params.id).select('reviewHistory status submittedAt reviewedAt');
  if (!item) return res.status(404).json({ success: false, message: 'Queue item not found' });

  return res.json({ success: true, data: item.reviewHistory });
}));

module.exports = router;
