const User = require('../models/User');
const { verifyToken } = require('../utils/tokens');

async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication token required' });
    }

    const payload = verifyToken(token);
    const user = await User.findById(payload.userId);

    if (!user || !user.isActive || user.isSuspended) {
      return res.status(401).json({ success: false, message: 'Invalid session' });
    }

    req.user = {
      id: user._id,
      role: user.role,
      isVerifiedSeller: user.role === 'seller' && user.sellerInfo?.verificationStatus === 'verified',
      email: user.personalInfo?.email,
      phone: user.personalInfo?.phoneNumber
    };

    return next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Insufficient permissions' });
    }

    return next();
  };
}

function requireVerifiedSeller(req, res, next) {
  if (!req.user || req.user.role !== 'seller' || !req.user.isVerifiedSeller) {
    return res.status(403).json({ success: false, message: 'Verified seller access required' });
  }
  return next();
}

module.exports = {
  authenticate,
  authorize,
  requireVerifiedSeller
};