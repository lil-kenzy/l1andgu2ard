/**
 * ghanaPostService.js
 * GhanaPost GPS digital address service for LANDGUARD.
 *
 * GhanaPost GPS is Ghana's national digital addressing system.
 * Each address is a 10-character code like "AK-039-5028".
 *
 * This service wraps the GhanaPost GPS REST API and performs:
 *   - GPS Address → coordinates (lookup)
 *   - Coordinates → GPS Address (reverse lookup)
 *   - Address validation
 *
 * Required .env vars:
 *   GHANA_POST_API_KEY   – API key from GhanaPost GPS developer portal
 *   GHANA_POST_BASE_URL  – Base URL (default: https://app.ghanapostgps.com/v2)
 *
 * Sandbox mode (when key absent): returns synthetic results so development
 * and CI work without real credentials.
 *
 * GhanaPost GPS format: CC-NNN-NNNN (2-letter district code + 3 digits + 4 digits)
 * Examples: AK-039-5028, GA-145-3892, AS-024-1733
 */

const GHANA_POST_API_KEY  = process.env.GHANA_POST_API_KEY  || '';
const GHANA_POST_BASE_URL = (process.env.GHANA_POST_BASE_URL || 'https://app.ghanapostgps.com/v2').replace(/\/$/, '');

// GhanaPost GPS format regex: 2 uppercase letters, dash, 3 digits, dash, 4 digits
const GPS_FORMAT = /^[A-Z]{2}-\d{3,4}-\d{4}$/;

// ── Sandbox mocks ─────────────────────────────────────────────────────────────

const SANDBOX_COORDS = { lat: 5.6037, lng: -0.1870 };

function sandboxLookup(gpsAddress) {
  const clean = gpsAddress.trim().toUpperCase();
  if (!GPS_FORMAT.test(clean)) {
    return { valid: false, gpsAddress: clean, lat: null, lng: null, region: null, district: null, sandbox: true, error: 'Invalid GPS address format. Expected CC-NNN-NNNN (e.g. AK-039-5028)' };
  }
  return {
    valid:      true,
    gpsAddress: clean,
    lat:        SANDBOX_COORDS.lat,
    lng:        SANDBOX_COORDS.lng,
    region:     'Greater Accra',
    district:   'Accra Metropolitan',
    sandbox:    true
  };
}

function sandboxReverse(lat, lng) {
  // Generate a plausible-looking GPS address from the coordinates
  const prefix = 'GA';
  const mid    = Math.abs(Math.floor(lat * 100)) % 999;
  const suffix = Math.abs(Math.floor(lng * 1000)) % 9999;
  return {
    gpsAddress: `${prefix}-${String(mid).padStart(3, '0')}-${String(suffix).padStart(4, '0')}`,
    lat,
    lng,
    region:   'Greater Accra',
    district: 'Accra Metropolitan',
    sandbox:  true
  };
}

// ── Live API helper ───────────────────────────────────────────────────────────

async function ghanaPostGet(path, params = {}) {
  const qs = new URLSearchParams(params);
  const url = `${GHANA_POST_BASE_URL}${path}?${qs.toString()}`;
  const res = await fetch(url, {
    headers: {
      'x-api-key':    GHANA_POST_API_KEY,
      'Accept':       'application/json',
      'User-Agent':   'LANDGUARD/1.0'
    },
    signal: AbortSignal.timeout(8000)
  });
  if (!res.ok) throw new Error(`GhanaPost GPS API HTTP ${res.status}`);
  return res.json();
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Look up a GhanaPost GPS digital address → coordinates.
 *
 * @param {string} gpsAddress  – e.g. "AK-039-5028"
 * @returns {Promise<{ valid, gpsAddress, lat, lng, region, district, sandbox, error? }>}
 */
async function lookupAddress(gpsAddress) {
  const clean = String(gpsAddress || '').trim().toUpperCase();

  if (!GPS_FORMAT.test(clean)) {
    return { valid: false, gpsAddress: clean, lat: null, lng: null, region: null, district: null, sandbox: false, error: 'Invalid GPS address format. Expected CC-NNN-NNNN (e.g. AK-039-5028)' };
  }

  if (!GHANA_POST_API_KEY) return sandboxLookup(clean);

  try {
    const data = await ghanaPostGet('/Client/GetGPSAddressInfo', { GPSName: clean, Type: 0 });

    if (!data || data.error) {
      return { valid: false, gpsAddress: clean, lat: null, lng: null, region: null, district: null, sandbox: false, error: data?.error || 'Address not found' };
    }

    // Response shape from GhanaPost API (may vary — normalise here)
    const lat  = Number.parseFloat(data.Lat || data.lat || data.latitude  || 0);
    const lng  = Number.parseFloat(data.Lng || data.lng || data.longitude || 0);

    return {
      valid:      true,
      gpsAddress: clean,
      lat,
      lng,
      region:   data.Region   || data.region   || null,
      district: data.District || data.district || null,
      sandbox:  false
    };
  } catch (err) {
    console.error('[ghanaPostService] lookupAddress error:', err.message);
    return { valid: false, gpsAddress: clean, lat: null, lng: null, region: null, district: null, sandbox: false, error: `GhanaPost GPS unavailable: ${err.message}` };
  }
}

/**
 * Convert GPS coordinates → GhanaPost digital address (reverse lookup).
 *
 * @param {number} lat
 * @param {number} lng
 * @returns {Promise<{ gpsAddress, lat, lng, region, district, sandbox, error? }>}
 */
async function reverseToDigitalAddress(lat, lng) {
  if (!GHANA_POST_API_KEY) return sandboxReverse(lat, lng);

  try {
    const data = await ghanaPostGet('/Client/GetGPSAddress', { Lat: lat, Lng: lng, Type: 0 });

    if (!data || data.error) {
      return { ...sandboxReverse(lat, lng), sandbox: false, error: data?.error || 'No address found for these coordinates' };
    }

    const gpsAddress = data.GPSName || data.gpsName || data.gps_name || '';

    return {
      gpsAddress,
      lat,
      lng,
      region:   data.Region   || data.region   || null,
      district: data.District || data.district || null,
      sandbox:  false
    };
  } catch (err) {
    console.error('[ghanaPostService] reverseToDigitalAddress error:', err.message);
    return { ...sandboxReverse(lat, lng), sandbox: false, error: `GhanaPost GPS unavailable: ${err.message}` };
  }
}

/**
 * Validate whether a GhanaPost digital address is well-formed and exists.
 * Returns { valid, gpsAddress, sandbox, error? }
 */
async function validateAddress(gpsAddress) {
  const result = await lookupAddress(gpsAddress);
  return {
    valid:      result.valid,
    gpsAddress: result.gpsAddress,
    sandbox:    result.sandbox,
    error:      result.error || null
  };
}

module.exports = { lookupAddress, reverseToDigitalAddress, validateAddress, GPS_FORMAT };
