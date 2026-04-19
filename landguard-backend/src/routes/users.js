const express = require('express');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { authenticate } = require('../middleware/auth');
const { normalizeGhanaPhone } = require('../utils/formatters');

const router = express.Router();

router.get('/profile', authenticate, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password -refreshTokens -loginAttempts -lockUntil');
  return res.json({ success: true, data: user });
}));

router.patch('/profile', authenticate, asyncHandler(async (req, res) => {
  const allowedFields = ['fullName', 'email', 'phone', 'dateOfBirth', 'gender', 'region', 'district', 'address'];
  const updates = {};

  for (const field of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(req.body, field)) {
      updates[field] = req.body[field];
    }
  }

  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  if (updates.fullName) user.personalInfo.fullName = updates.fullName;
  if (updates.email) user.personalInfo.email = String(updates.email).toLowerCase();
  if (updates.phone) user.personalInfo.phoneNumber = normalizeGhanaPhone(updates.phone);
  if (updates.dateOfBirth) user.personalInfo.dateOfBirth = updates.dateOfBirth;
  if (updates.gender) user.personalInfo.gender = updates.gender;

  if (updates.region) user.location.region = updates.region;
  if (updates.district) user.location.district = updates.district;
  if (updates.address) user.location.address = updates.address;

  await user.save();

  return res.json({ success: true, message: 'Profile updated', data: user });
}));

router.get('/compliance/export', authenticate, asyncHandler(async (req, res) => {
  const format = (req.query.format || 'json').toLowerCase();
  const user = await User.findById(req.user.id).select('-password -refreshTokens');

  if (format === 'pdf') {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="landguard-user-export-${user._id}.pdf"`);
    return res.send(Buffer.from(`LANDGUARD DATA EXPORT\n\nUser ID: ${user._id}\nName: ${user.personalInfo.fullName}\nEmail: ${user.personalInfo.email || ''}\nPhone: ${user.personalInfo.phoneNumber}\nRole: ${user.role}\nGenerated At: ${new Date().toISOString()}`));
  }

  return res.json({ success: true, data: user, generatedAt: new Date().toISOString() });
}));

router.post('/compliance/delete', authenticate, asyncHandler(async (req, res) => {
  const { mode = 'soft' } = req.body;
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  if (mode === 'hard') {
    await User.deleteOne({ _id: user._id });
    return res.json({ success: true, message: 'User permanently deleted' });
  }

  user.isActive = false;
  user.suspensionReason = 'User requested account deletion (soft delete)';
  await user.save();

  return res.json({ success: true, message: 'User soft-deleted with retention policy' });
}));

router.post('/push-token', authenticate, asyncHandler(async (req, res) => {
  const { fcmToken } = req.body;
  if (!fcmToken || typeof fcmToken !== 'string') {
    return res.status(400).json({ success: false, message: 'fcmToken is required' });
  }

  await User.findByIdAndUpdate(req.user.id, { fcmToken });
  return res.json({ success: true, message: 'Push token registered' });
}));

// GET /api/users/saved-properties — return user's saved/favourited property listings
router.get('/saved-properties', authenticate, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id)
    .select('savedProperties')
    .populate({
      path: 'savedProperties',
      select: 'title location gpsAddress type price size category verified images status centerPoint',
      match: { isActive: true }
    });

  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  return res.json({ success: true, data: user.savedProperties });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('personalInfo.fullName role sellerInfo.verificationStatus createdAt');
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  return res.json({ success: true, data: user });
}));

// PATCH /api/users/seller-info — update seller-specific fields (businessRegNumber, TIN, physicalAddress, bankAccount)
router.patch('/seller-info', authenticate, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  const { businessRegNumber, tin, physicalAddress, bankName, accountNumber, accountName } = req.body;

  if (!user.sellerInfo) user.sellerInfo = {};

  if (businessRegNumber !== undefined) user.sellerInfo.businessRegNumber = businessRegNumber;
  if (tin             !== undefined) user.sellerInfo.tin              = tin;
  if (physicalAddress !== undefined) user.sellerInfo.physicalAddress   = physicalAddress;

  if (bankName || accountNumber || accountName) {
    user.sellerInfo.bankAccount = {
      bankName:      bankName      || user.sellerInfo.bankAccount?.bankName      || '',
      accountNumber: accountNumber || user.sellerInfo.bankAccount?.accountNumber || '',
      accountName:   accountName   || user.sellerInfo.bankAccount?.accountName   || ''
    };
  }

  user.markModified('sellerInfo');
  await user.save();

  return res.json({ success: true, message: 'Seller info updated', data: user.sellerInfo });
}));

module.exports = router;