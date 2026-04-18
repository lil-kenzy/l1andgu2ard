const crypto = require('crypto');
const jwt = require('jsonwebtoken');

let generatedKeyPair;

function getPemFromEnv(value) {
  if (!value) return null;
  return value.includes('-----BEGIN') ? value.replace(/\\n/g, '\n') : value;
}

function getSigningKeys() {
  const privateKey = getPemFromEnv(process.env.JWT_PRIVATE_KEY);
  const publicKey = getPemFromEnv(process.env.JWT_PUBLIC_KEY);

  if (privateKey && publicKey) {
    return { privateKey, publicKey, algorithm: 'RS256' };
  }

  if (!generatedKeyPair) {
    generatedKeyPair = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      privateKeyEncoding: { type: 'pkcs1', format: 'pem' },
      publicKeyEncoding: { type: 'pkcs1', format: 'pem' }
    });
  }

  return {
    privateKey: generatedKeyPair.privateKey,
    publicKey: generatedKeyPair.publicKey,
    algorithm: 'RS256'
  };
}

function signAccessToken(payload) {
  const { privateKey, algorithm } = getSigningKeys();
  return jwt.sign(payload, privateKey, {
    algorithm,
    expiresIn: process.env.JWT_EXPIRE || '15m',
    issuer: 'landguard-backend',
    audience: 'landguard-clients'
  });
}

function signRefreshToken(payload) {
  const { privateKey, algorithm } = getSigningKeys();
  return jwt.sign(payload, privateKey, {
    algorithm,
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d',
    issuer: 'landguard-backend',
    audience: 'landguard-clients'
  });
}

function verifyToken(token) {
  const { publicKey, algorithm } = getSigningKeys();
  return jwt.verify(token, publicKey, {
    algorithms: [algorithm],
    issuer: 'landguard-backend',
    audience: 'landguard-clients'
  });
}

function generateOtpCode() {
  return `${Math.floor(100000 + Math.random() * 900000)}`;
}

function generateResetToken() {
  return crypto.randomBytes(32).toString('hex');
}

function hashValue(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyToken,
  generateOtpCode,
  generateResetToken,
  hashValue
};
