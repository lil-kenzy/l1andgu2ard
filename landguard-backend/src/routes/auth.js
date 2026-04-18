const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const { normalizeGhanaCard, normalizeGhanaPhone, maskEmail, maskPhone } = require('../utils/formatters');
const { generateOtpCode, generateResetToken, hashValue, signAccessToken, signRefreshToken, verifyToken } = require('../utils/tokens');
const { sendOtpEmail, sendPasswordResetEmail, sendWelcomeEmail } = require('../services/emailService');

const router = express.Router();

function mapRole(inputRole) {
  if (inputRole === 'admin') return 'government_admin';
  return inputRole;
}

router.post('/register', asyncHandler(async (req, res) => {
  const { fullName, email, phone, ghanaCardNumber, password, role = 'buyer' } = req.body;

  const normalizedCard = normalizeGhanaCard(ghanaCardNumber);
  const normalizedPhone = normalizeGhanaPhone(phone);

  if (!fullName || !normalizedCard || !normalizedPhone || !password) {
    return res.status(400).json({ success: false, message: 'fullName, ghanaCardNumber, phone and password are required' });
  }

  const userRole = mapRole(role);
  if (!['buyer', 'seller', 'government_admin'].includes(userRole)) {
    return res.status(400).json({ success: false, message: 'Invalid role' });
  }

  const exists = await User.findOne({
    $or: [
      { 'personalInfo.ghanaCardNumber': normalizedCard },
      { 'personalInfo.phoneNumber': normalizedPhone },
      ...(email ? [{ 'personalInfo.email': email.toLowerCase() }] : [])
    ]
  });

  if (exists) {
    return res.status(409).json({ success: false, message: 'User already exists with provided identity fields' });
  }

  const otpCode = generateOtpCode();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

  const user = await User.create({
    role: userRole,
    personalInfo: {
      fullName,
      ghanaCardNumber: normalizedCard,
      phoneNumber: normalizedPhone,
      email: email ? email.toLowerCase() : undefined
    },
    password,
    phoneVerificationCode: otpCode,
    phoneVerificationExpires: otpExpiry,
    isPhoneVerified: false,
    isEmailVerified: false,
    sellerInfo: userRole === 'seller' ? { verificationStatus: 'pending' } : undefined
  });

  // Send OTP via email if the user provided an email address
  if (user.personalInfo.email) {
    sendOtpEmail({
      to: user.personalInfo.email,
      fullName: user.personalInfo.fullName,
      otpCode,
    }).catch(() => {});
  }

  return res.status(201).json({
    success: true,
    message: 'Account created. Verify OTP to activate session.',
    data: {
      userId: user._id,
      role: user.role,
      otpDeliveryHint: {
        sms: maskPhone(normalizedPhone),
        email: maskEmail(user.personalInfo.email)
      },
      niaVerification: {
        status: process.env.NIA_API_URL ? 'pending_live_check' : 'sandbox_mocked',
        note: process.env.NIA_API_URL ? 'NIA endpoint configured; integrate request signing in production.' : 'Set NIA_API_URL and NIA_API_KEY in .env for live card verification.'
      }
    }
  });
}));

router.post('/login', asyncHandler(async (req, res) => {
  const { identifier, password, role } = req.body;
  if (!identifier || !password) {
    return res.status(400).json({ success: false, message: 'identifier and password are required' });
  }

  const normalizedPhone = normalizeGhanaPhone(identifier);
  const normalizedCard = normalizeGhanaCard(identifier);

  const user = await User.findOne({
    $or: [
      { 'personalInfo.email': String(identifier).toLowerCase() },
      { 'personalInfo.phoneNumber': normalizedPhone || '__none__' },
      { 'personalInfo.ghanaCardNumber': normalizedCard || '__none__' }
    ]
  });

  if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });
  if (role && mapRole(role) !== user.role) return res.status(403).json({ success: false, message: 'Role mismatch' });

  const validPassword = await user.comparePassword(password);
  if (!validPassword) {
    await user.incLoginAttempts();
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  if (user.isLocked) {
    return res.status(423).json({ success: false, message: 'Account locked due to failed login attempts' });
  }

  const otpCode = generateOtpCode();
  user.phoneVerificationCode = otpCode;
  user.phoneVerificationExpires = new Date(Date.now() + 10 * 60 * 1000);
  await user.resetLoginAttempts();

  await user.save();

  // Send OTP via email if the user has an email address
  if (user.personalInfo.email) {
    sendOtpEmail({
      to: user.personalInfo.email,
      fullName: user.personalInfo.fullName,
      otpCode,
    }).catch(() => {});
  }

  return res.json({
    success: true,
    message: 'Credentials accepted. OTP sent based on user-selected channel.',
    data: {
      userId: user._id,
      role: user.role,
      otpDeliveryHint: {
        sms: maskPhone(user.personalInfo.phoneNumber),
        email: maskEmail(user.personalInfo.email)
      }
    }
  });
}));

router.post('/verify-otp', asyncHandler(async (req, res) => {
  const { userId, otp, channel = 'sms' } = req.body;
  if (!userId || !otp) {
    return res.status(400).json({ success: false, message: 'userId and otp are required' });
  }

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  if (!user.phoneVerificationCode || user.phoneVerificationCode !== String(otp)) {
    return res.status(400).json({ success: false, message: 'Invalid OTP code' });
  }

  if (!user.phoneVerificationExpires || user.phoneVerificationExpires < new Date()) {
    return res.status(400).json({ success: false, message: 'OTP expired' });
  }

  const wasNewUser = !user.isPhoneVerified && !user.isEmailVerified;

  user.phoneVerificationCode = undefined;
  user.phoneVerificationExpires = undefined;
  if (channel === 'sms') user.isPhoneVerified = true;
  if (channel === 'email') user.isEmailVerified = true;

  const accessToken = signAccessToken({ userId: user._id.toString(), role: user.role });
  const refreshToken = signRefreshToken({ userId: user._id.toString(), role: user.role });

  user.refreshTokens.push({
    token: hashValue(refreshToken),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    deviceInfo: {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip
    }
  });

  await user.save();

  // Send welcome email to first-time verified users who have an email
  if (wasNewUser && user.personalInfo.email) {
    sendWelcomeEmail({
      to: user.personalInfo.email,
      fullName: user.personalInfo.fullName,
      role: user.role,
    }).catch(() => {});
  }

  return res.json({
    success: true,
    message: 'OTP verified successfully',
    data: {
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        role: user.role,
        fullName: user.personalInfo.fullName,
        email: user.personalInfo.email,
        phone: user.personalInfo.phoneNumber
      }
    }
  });
}));

router.post('/biometric/setup', authenticate, asyncHandler(async (req, res) => {
  const { publicKey } = req.body;
  if (!publicKey) return res.status(400).json({ success: false, message: 'publicKey is required' });

  const user = await User.findById(req.user.id);
  user.biometricEnabled = true;
  user.biometricData = {
    ...user.biometricData,
    fingerprintHash: hashValue(publicKey)
  };
  await user.save();

  return res.json({ success: true, message: 'Biometric credential registered' });
}));

router.post('/biometric/login', asyncHandler(async (req, res) => {
  const { identifier, biometricSignature } = req.body;
  if (!identifier || !biometricSignature) {
    return res.status(400).json({ success: false, message: 'identifier and biometricSignature are required' });
  }

  const normalizedPhone = normalizeGhanaPhone(identifier);
  const user = await User.findOne({
    $or: [
      { 'personalInfo.email': String(identifier).toLowerCase() },
      { 'personalInfo.phoneNumber': normalizedPhone || '__none__' }
    ]
  });

  if (!user || !user.biometricEnabled) {
    return res.status(401).json({ success: false, message: 'Biometric profile not found' });
  }

  if (user.biometricData?.fingerprintHash !== hashValue(biometricSignature)) {
    return res.status(401).json({ success: false, message: 'Biometric signature invalid' });
  }

  const accessToken = signAccessToken({ userId: user._id.toString(), role: user.role });
  const refreshToken = signRefreshToken({ userId: user._id.toString(), role: user.role });

  user.refreshTokens.push({
    token: hashValue(refreshToken),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    deviceInfo: { userAgent: req.headers['user-agent'], ipAddress: req.ip }
  });
  await user.save();

  return res.json({ success: true, data: { accessToken, refreshToken } });
}));

router.post('/refresh', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ success: false, message: 'refreshToken is required' });

  const payload = verifyToken(refreshToken);
  const user = await User.findById(payload.userId);
  if (!user) return res.status(401).json({ success: false, message: 'Invalid refresh token' });

  const hashed = hashValue(refreshToken);
  const tokenExists = user.refreshTokens.some((item) => item.token === hashed && item.expiresAt > new Date());
  if (!tokenExists) {
    return res.status(401).json({ success: false, message: 'Refresh token revoked or expired' });
  }

  user.refreshTokens = user.refreshTokens.filter((item) => item.token !== hashed);

  const newAccessToken = signAccessToken({ userId: user._id.toString(), role: user.role });
  const newRefreshToken = signRefreshToken({ userId: user._id.toString(), role: user.role });

  user.refreshTokens.push({
    token: hashValue(newRefreshToken),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    deviceInfo: { userAgent: req.headers['user-agent'], ipAddress: req.ip }
  });

  await user.save();

  return res.json({ success: true, data: { accessToken: newAccessToken, refreshToken: newRefreshToken } });
}));

router.post('/logout', authenticate, asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ success: false, message: 'refreshToken is required' });

  const user = await User.findById(req.user.id);
  user.refreshTokens = user.refreshTokens.filter((item) => item.token !== hashValue(refreshToken));
  await user.save();

  return res.json({ success: true, message: 'Session logged out' });
}));

router.post('/logout-all', authenticate, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  user.refreshTokens = [];
  await user.save();

  return res.json({ success: true, message: 'All sessions revoked' });
}));

router.post('/forgot-password', asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'email is required' });

  const user = await User.findOne({ 'personalInfo.email': String(email).toLowerCase() });
  if (!user) return res.json({ success: true, message: 'If email exists, reset instructions were generated.' });

  const resetToken = generateResetToken();
  user.passwordResetToken = hashValue(resetToken);
  user.passwordResetExpires = new Date(Date.now() + 30 * 60 * 1000);
  await user.save();

  sendPasswordResetEmail({
    to: user.personalInfo.email,
    fullName: user.personalInfo.fullName,
    resetToken,
  }).catch(() => {});

  return res.json({
    success: true,
    message: 'If the email exists, a password reset link has been sent.',
  });
}));

router.post('/reset-password', asyncHandler(async (req, res) => {
  const { resetToken, newPassword } = req.body;
  if (!resetToken || !newPassword) {
    return res.status(400).json({ success: false, message: 'resetToken and newPassword are required' });
  }

  const user = await User.findOne({
    passwordResetToken: hashValue(resetToken),
    passwordResetExpires: { $gt: new Date() }
  });

  if (!user) return res.status(400).json({ success: false, message: 'Reset token invalid or expired' });

  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.refreshTokens = [];
  await user.save();

  return res.json({ success: true, message: 'Password reset successful' });
}));

module.exports = router;