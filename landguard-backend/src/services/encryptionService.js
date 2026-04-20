/**
 * encryptionService.js
 * AES-256-GCM field-level encryption for sensitive PII stored in MongoDB.
 *
 * Encrypted values are stored in the format:
 *   enc:<base64(iv)>:<base64(authTag)>:<base64(ciphertext)>
 *
 * Required env var:
 *   ENCRYPTION_KEY  – exactly 32 ASCII characters (256-bit key)
 *
 * If ENCRYPTION_KEY is not set the service falls back to a no-op passthrough
 * so that development environments continue to function without the key.
 */

const crypto = require('crypto');

const ALGO      = 'aes-256-gcm';
const IV_BYTES  = 12;  // 96-bit IV recommended for GCM
const TAG_BYTES = 16;
const PREFIX    = 'enc:';

function getKey() {
  const raw = process.env.ENCRYPTION_KEY || '';
  if (raw.length !== 32) {
    return null; // sandbox / dev — no encryption
  }
  return Buffer.from(raw, 'utf8');
}

/**
 * Encrypt a plaintext string.
 * Returns the original value unchanged when ENCRYPTION_KEY is not configured.
 */
function encrypt(plaintext) {
  if (plaintext == null) return plaintext;
  const str = String(plaintext);

  // Already encrypted — idempotent
  if (str.startsWith(PREFIX)) return str;

  const key = getKey();
  if (!key) return str; // no-op in dev

  const iv       = crypto.randomBytes(IV_BYTES);
  const cipher   = crypto.createCipheriv(ALGO, key, iv);
  const encrypted = Buffer.concat([cipher.update(str, 'utf8'), cipher.final()]);
  const authTag  = cipher.getAuthTag();

  return `${PREFIX}${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted.toString('base64')}`;
}

/**
 * Decrypt a value previously encrypted with encrypt().
 * Returns the original value if it was not encrypted (e.g. legacy plaintext).
 */
function decrypt(value) {
  if (value == null) return value;
  const str = String(value);

  if (!str.startsWith(PREFIX)) return str; // plaintext passthrough

  const key = getKey();
  if (!key) return str; // no key — return raw encrypted string

  try {
    const rest      = str.slice(PREFIX.length);
    const parts     = rest.split(':');
    if (parts.length !== 3) return str; // malformed

    const iv        = Buffer.from(parts[0], 'base64');
    const authTag   = Buffer.from(parts[1], 'base64');
    const encrypted = Buffer.from(parts[2], 'base64');

    const decipher = crypto.createDecipheriv(ALGO, key, iv);
    decipher.setAuthTag(authTag);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString('utf8');
  } catch {
    // Decryption failure — return the raw encrypted value rather than crash
    return str;
  }
}

/**
 * Returns true when ENCRYPTION_KEY is properly configured.
 */
function isEncryptionEnabled() {
  return getKey() !== null;
}

module.exports = { encrypt, decrypt, isEncryptionEnabled };
