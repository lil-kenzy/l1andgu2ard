const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (payload, expiresIn = '7d') => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn,
    issuer: 'landguard-backend',
    audience: 'landguard-users'
  });
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET, {
      issuer: 'landguard-backend',
      audience: 'landguard-users'
    });
  } catch (error) {
    throw error;
  }
};

// Generate refresh token (longer expiry)
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '30d',
    issuer: 'landguard-backend',
    audience: 'landguard-users'
  });
};

// Verify refresh token
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET, {
      issuer: 'landguard-backend',
      audience: 'landguard-users'
    });
  } catch (error) {
    throw error;
  }
};

// Extract token from Authorization header
const extractToken = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.split(' ')[1];
};

module.exports = {
  generateToken,
  verifyToken,
  generateRefreshToken,
  verifyRefreshToken,
  extractToken
};