/**
 * niaService.js
 * Ghana National Identification Authority (NIA) — Ghana Card verification.
 *
 * When NIA_API_URL and NIA_API_KEY are set in .env this module makes a live
 * request to the NIA REST endpoint.  Otherwise it falls back to a sandbox
 * mock so development and CI work without credentials.
 *
 * Required .env vars (production):
 *   NIA_API_URL  – Base URL, e.g. https://api.nia.gov.gh/v1
 *   NIA_API_KEY  – API key issued by NIA
 *
 * Ghana Card number format: GHA-XXXXXXXXX-X  (validated client-side too)
 */

const https = require('https');
const http  = require('http');

const NIA_API_URL = process.env.NIA_API_URL || '';
const NIA_API_KEY = process.env.NIA_API_KEY  || process.env.GHANA_CARD_API_KEY || '';

// ── Result shape ─────────────────────────────────────────────────────────────
// { verified: Boolean, fullName: String|null, dateOfBirth: String|null,
//   gender: String|null, sandbox: Boolean, error: String|null }

// ── Sandbox mock ─────────────────────────────────────────────────────────────
function sandboxVerify(ghanaCardNumber, fullName) {
  // In sandbox we accept any well-formed GHA-XXXXXXXXX-X card number and
  // return a synthetic record that echoes back the submitted name.
  const GHA_PATTERN = /^GHA-\d{9}-\d$/;
  if (!GHA_PATTERN.test(ghanaCardNumber)) {
    return {
      verified: false,
      fullName: null,
      dateOfBirth: null,
      gender: null,
      sandbox: true,
      error: 'Card number format invalid. Expected GHA-XXXXXXXXX-X'
    };
  }

  return {
    verified: true,
    fullName: fullName || 'Sandbox User',
    dateOfBirth: null,
    gender: null,
    sandbox: true,
    error: null
  };
}

// ── Live NIA call ─────────────────────────────────────────────────────────────
function liveVerify(ghanaCardNumber, fullName) {
  return new Promise((resolve, reject) => {
    const baseUrl = NIA_API_URL.replace(/\/$/, '');
    const urlStr  = `${baseUrl}/verify`;
    const body    = JSON.stringify({ cardNumber: ghanaCardNumber, fullName });

    const parsed    = new URL(urlStr);
    const transport = parsed.protocol === 'https:' ? https : http;

    const options = {
      hostname: parsed.hostname,
      port:     parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
      path:     parsed.pathname + (parsed.search || ''),
      method:   'POST',
      headers: {
        'Content-Type':  'application/json',
        'Content-Length': Buffer.byteLength(body),
        'Authorization':  `Bearer ${NIA_API_KEY}`,
        'X-Api-Key':      NIA_API_KEY,
        'User-Agent':     'LANDGUARD/1.0'
      }
    };

    const req = transport.request(options, (res) => {
      let raw = '';
      res.on('data', (chunk) => { raw += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(raw);

          if (res.statusCode === 200 && json.verified) {
            resolve({
              verified:    true,
              fullName:    json.fullName    || null,
              dateOfBirth: json.dateOfBirth || null,
              gender:      json.gender      || null,
              sandbox:     false,
              error:       null
            });
          } else {
            resolve({
              verified:    false,
              fullName:    null,
              dateOfBirth: null,
              gender:      null,
              sandbox:     false,
              error:       json.message || 'NIA verification failed'
            });
          }
        } catch {
          reject(new Error(`NIA response parse error (HTTP ${res.statusCode})`));
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.setTimeout(8000, () => {
      req.destroy();
      reject(new Error('NIA request timed out'));
    });
    req.write(body);
    req.end();
  });
}

// ── Public API ────────────────────────────────────────────────────────────────
/**
 * Verify a Ghana Card number against NIA.
 *
 * @param {string} ghanaCardNumber  – normalised card number (GHA-XXXXXXXXX-X)
 * @param {string} [fullName]       – registrant's full name for cross-check
 * @returns {Promise<{verified, fullName, dateOfBirth, gender, sandbox, error}>}
 */
async function verifyGhanaCard(ghanaCardNumber, fullName = '') {
  if (!NIA_API_URL || !NIA_API_KEY) {
    // No credentials — use sandbox mock
    return sandboxVerify(ghanaCardNumber, fullName);
  }

  try {
    return await liveVerify(ghanaCardNumber, fullName);
  } catch (err) {
    console.error('[niaService] live verify error:', err.message);
    // On network / parse errors fall back to sandbox so the request does not
    // crash — but flag the error so the caller can decide what to do.
    return {
      verified:    false,
      fullName:    null,
      dateOfBirth: null,
      gender:      null,
      sandbox:     false,
      error:       `NIA service unavailable: ${err.message}`
    };
  }
}

module.exports = { verifyGhanaCard };
