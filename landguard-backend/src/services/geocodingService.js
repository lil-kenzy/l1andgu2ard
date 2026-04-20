/**
 * geocodingService.js
 * Google Maps Geocoding API + Places Autocomplete wrapper for LANDGUARD.
 *
 * Required .env vars:
 *   GOOGLE_MAPS_API_KEY  – Server-side restricted API key from Google Cloud Console
 *                          Enable: Geocoding API, Places API
 *
 * Sandbox mode (when key absent):
 *   - reverseGeocode  → returns a synthetic address for the given coordinates
 *   - forwardGeocode  → returns synthetic coordinates for the given address
 *   - placesAutocomplete → returns a short static list of placeholder results
 */

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || '';
const GEOCODING_BASE = 'https://maps.googleapis.com/maps/api/geocode/json';
const PLACES_BASE    = 'https://maps.googleapis.com/maps/api/place/autocomplete/json';

// ── Helpers ───────────────────────────────────────────────────────────────────

async function googleGet(url, params) {
  const qs = new URLSearchParams({ ...params, key: GOOGLE_MAPS_API_KEY });
  const res = await fetch(`${url}?${qs.toString()}`, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`Google API HTTP ${res.status}`);
  return res.json();
}

// ── Sandbox mocks ─────────────────────────────────────────────────────────────

function sandboxReverse(lat, lng) {
  return {
    formattedAddress: `${lat.toFixed(4)}, ${lng.toFixed(4)} (Sandbox — Accra, Greater Accra Region, Ghana)`,
    locality: 'Accra',
    administrativeArea: 'Greater Accra Region',
    country: 'Ghana',
    placeId: null,
    sandbox: true
  };
}

function sandboxForward(address) {
  return {
    lat: 5.6037 + Math.random() * 0.01,
    lng: -0.1870 + Math.random() * 0.01,
    formattedAddress: address,
    placeId: null,
    sandbox: true
  };
}

function sandboxPlaces(input) {
  const base = input || 'Accra';
  return {
    predictions: [
      { description: `${base} Central, Greater Accra, Ghana`, placeId: 'sandbox_1' },
      { description: `${base} Road, Kumasi, Ashanti Region, Ghana`, placeId: 'sandbox_2' },
      { description: `${base} New Town, Tamale, Northern Region, Ghana`, placeId: 'sandbox_3' }
    ],
    sandbox: true
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Convert GPS coordinates → human-readable address (reverse geocoding).
 *
 * @param {number} lat
 * @param {number} lng
 * @returns {Promise<{ formattedAddress, locality, administrativeArea, country, placeId, sandbox }>}
 */
async function reverseGeocode(lat, lng) {
  if (!GOOGLE_MAPS_API_KEY) return sandboxReverse(lat, lng);

  try {
    const data = await googleGet(GEOCODING_BASE, { latlng: `${lat},${lng}`, region: 'gh' });
    if (data.status !== 'OK' || !data.results?.length) {
      return { ...sandboxReverse(lat, lng), sandbox: false, error: data.status };
    }

    const result = data.results[0];
    const components = result.address_components || [];
    const get = (type) => components.find((c) => c.types.includes(type))?.long_name || null;

    return {
      formattedAddress:   result.formatted_address,
      locality:           get('locality') || get('administrative_area_level_2'),
      administrativeArea: get('administrative_area_level_1'),
      country:            get('country'),
      placeId:            result.place_id || null,
      sandbox:            false
    };
  } catch (err) {
    console.error('[geocodingService] reverseGeocode error:', err.message);
    return { ...sandboxReverse(lat, lng), sandbox: false, error: err.message };
  }
}

/**
 * Convert address string → GPS coordinates (forward geocoding).
 *
 * @param {string} address
 * @returns {Promise<{ lat, lng, formattedAddress, placeId, sandbox }>}
 */
async function forwardGeocode(address) {
  if (!GOOGLE_MAPS_API_KEY) return sandboxForward(address);

  try {
    const data = await googleGet(GEOCODING_BASE, { address, region: 'gh', components: 'country:GH' });
    if (data.status !== 'OK' || !data.results?.length) {
      return { ...sandboxForward(address), sandbox: false, error: data.status };
    }

    const result = data.results[0];
    const { lat, lng } = result.geometry.location;
    return {
      lat,
      lng,
      formattedAddress: result.formatted_address,
      placeId:          result.place_id || null,
      sandbox:          false
    };
  } catch (err) {
    console.error('[geocodingService] forwardGeocode error:', err.message);
    return { ...sandboxForward(address), sandbox: false, error: err.message };
  }
}

/**
 * Places Autocomplete — returns address suggestions for a partial input.
 * Restricted to Ghana (components: country:gh).
 *
 * @param {string} input   – partial address typed by the user
 * @param {object} [opts]
 * @param {number} [opts.lat]    – bias origin latitude
 * @param {number} [opts.lng]    – bias origin longitude
 * @param {number} [opts.radius] – bias radius in metres (default 50 000)
 * @returns {Promise<{ predictions: Array<{ description, placeId }>, sandbox }>}
 */
async function placesAutocomplete(input, { lat, lng, radius = 50000 } = {}) {
  if (!GOOGLE_MAPS_API_KEY) return sandboxPlaces(input);

  const params = {
    input,
    components: 'country:gh',
    types:      'geocode',
    language:   'en'
  };

  if (lat != null && lng != null) {
    params.location = `${lat},${lng}`;
    params.radius   = radius;
  }

  try {
    const data = await googleGet(PLACES_BASE, params);
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      return { ...sandboxPlaces(input), sandbox: false, error: data.status };
    }

    const predictions = (data.predictions || []).map((p) => ({
      description: p.description,
      placeId:     p.place_id
    }));

    return { predictions, sandbox: false };
  } catch (err) {
    console.error('[geocodingService] placesAutocomplete error:', err.message);
    return { ...sandboxPlaces(input), sandbox: false, error: err.message };
  }
}

module.exports = { reverseGeocode, forwardGeocode, placesAutocomplete };
