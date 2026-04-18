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

router.get('/:id', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('personalInfo.fullName role sellerInfo.verificationStatus createdAt');
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  return res.json({ success: true, data: user });
}));

module.exports = router;