/**
 * geocoding.js
 * Geocoding and Places API routes for LANDGUARD.
 *
 * All routes proxy server-side Google Maps and GhanaPost GPS calls,
 * keeping API keys out of client bundles.
 *
 * Base path: /api/geocoding
 *
 * Routes:
 *   GET  /reverse               – coordinates → address (Google Geocoding)
 *   GET  /forward               – address text → coordinates (Google Geocoding)
 *   GET  /places                – address autocomplete (Google Places)
 *   GET  /ghanapost/lookup      – GPS digital address → coordinates (GhanaPost GPS)
 *   GET  /ghanapost/reverse     – coordinates → GPS digital address (GhanaPost GPS)
 *   POST /ghanapost/validate    – validate a digital address
 */

const express  = require('express');
const { authenticate } = require('../middleware/auth');
const asyncHandler    = require('../utils/asyncHandler');
const { reverseGeocode, forwardGeocode, placesAutocomplete } = require('../services/geocodingService');
const { lookupAddress, reverseToDigitalAddress, validateAddress } = require('../services/ghanaPostService');

const router = express.Router();

// ── Google Geocoding — Reverse ────────────────────────────────────────────────
// GET /api/geocoding/reverse?lat=5.6037&lng=-0.1870
router.get('/reverse', authenticate, asyncHandler(async (req, res) => {
  const lat = Number.parseFloat(req.query.lat);
  const lng = Number.parseFloat(req.query.lng);

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return res.status(400).json({ success: false, message: '`lat` and `lng` query params are required' });
  }

  const result = await reverseGeocode(lat, lng);
  return res.json({ success: true, data: result });
}));

// ── Google Geocoding — Forward ────────────────────────────────────────────────
// GET /api/geocoding/forward?address=Accra+Mall,+Accra
router.get('/forward', authenticate, asyncHandler(async (req, res) => {
  const { address } = req.query;
  if (!address || !address.trim()) {
    return res.status(400).json({ success: false, message: '`address` query param is required' });
  }

  const result = await forwardGeocode(address.trim());
  return res.json({ success: true, data: result });
}));

// ── Google Places — Autocomplete ──────────────────────────────────────────────
// GET /api/geocoding/places?input=Dome&lat=5.60&lng=-0.18
router.get('/places', authenticate, asyncHandler(async (req, res) => {
  const { input } = req.query;
  if (!input || !input.trim()) {
    return res.status(400).json({ success: false, message: '`input` query param is required' });
  }

  const lat = Number.parseFloat(req.query.lat);
  const lng = Number.parseFloat(req.query.lng);
  const opts = {};
  if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
    opts.lat = lat;
    opts.lng = lng;
    opts.radius = Number.parseInt(req.query.radius || '50000', 10);
  }

  const result = await placesAutocomplete(input.trim(), opts);
  return res.json({ success: true, data: result });
}));

// ── GhanaPost GPS — Digital address lookup ────────────────────────────────────
// GET /api/geocoding/ghanapost/lookup?address=AK-039-5028
router.get('/ghanapost/lookup', authenticate, asyncHandler(async (req, res) => {
  const { address } = req.query;
  if (!address || !address.trim()) {
    return res.status(400).json({ success: false, message: '`address` query param is required (e.g. AK-039-5028)' });
  }

  const result = await lookupAddress(address.trim());
  const status = result.valid ? 200 : 404;
  return res.status(status).json({ success: result.valid, data: result });
}));

// ── GhanaPost GPS — Reverse (coordinates → digital address) ───────────────────
// GET /api/geocoding/ghanapost/reverse?lat=5.6037&lng=-0.1870
router.get('/ghanapost/reverse', authenticate, asyncHandler(async (req, res) => {
  const lat = Number.parseFloat(req.query.lat);
  const lng = Number.parseFloat(req.query.lng);

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return res.status(400).json({ success: false, message: '`lat` and `lng` query params are required' });
  }

  const result = await reverseToDigitalAddress(lat, lng);
  return res.json({ success: true, data: result });
}));

// ── GhanaPost GPS — Validate digital address ──────────────────────────────────
// POST /api/geocoding/ghanapost/validate   body: { address }
router.post('/ghanapost/validate', authenticate, asyncHandler(async (req, res) => {
  const { address } = req.body;
  if (!address || !String(address).trim()) {
    return res.status(400).json({ success: false, message: '`address` is required in request body' });
  }

  const result = await validateAddress(String(address).trim());
  return res.json({ success: true, data: result });
}));

module.exports = router;
