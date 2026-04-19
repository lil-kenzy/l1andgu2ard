const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const Property = require('../models/Property');
const User = require('../models/User');
const FraudReport = require('../models/FraudReport');
const Transaction = require('../models/Transaction');
const { authenticate } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const { isWithinGhana } = require('../utils/geolocation');
const { emitNewSubmission } = require('../services/socketService');

const router = express.Router();

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// ── Helper: compute a GeoJSON Point centroid for a Polygon ring ──────────────
function polygonCentroid(ring) {
  // ring is an array of [lng, lat] pairs (already closed: first === last is OK)
  const pts = ring[0] && Array.isArray(ring[0]) ? ring : ring;
  let sumLng = 0;
  let sumLat = 0;
  let count = 0;
  for (const [lng, lat] of pts) {
    sumLng += lng;
    sumLat += lat;
    count++;
  }
  return [sumLng / count, sumLat / count];
}

// ── Helper: build the geometry + centerPoint from raw request data ────────────
function buildGeoFields(body) {
  const geoFields = {};

  // polygon: array of [lng, lat] pairs sent by the client
  if (Array.isArray(body.polygon) && body.polygon.length >= 3) {
    // Ensure the polygon ring is closed (GeoJSON requirement)
    const ring = body.polygon;
    const first = ring[0];
    const last = ring[ring.length - 1];
    const closed =
      first[0] === last[0] && first[1] === last[1]
        ? ring
        : [...ring, first];

    geoFields.geometry = {
      type: 'Polygon',
      coordinates: [closed]   // GeoJSON Polygon: array of rings
    };
    geoFields.centerPoint = {
      type: 'Point',
      coordinates: polygonCentroid(closed)
    };
  } else if (
    typeof body.longitude === 'number' &&
    typeof body.latitude === 'number'
  ) {
    // Single point provided (no polygon drawn)
    const lng = body.longitude;
    const lat = body.latitude;
    geoFields.geometry = {
      type: 'Point',
      coordinates: [lng, lat]   // GeoJSON: longitude first
    };
    geoFields.centerPoint = {
      type: 'Point',
      coordinates: [lng, lat]
    };
  }

  return geoFields;
}

// ── Helper: transform a Property document for API response ────────────────────
function transformProperty(property) {
  const center = property.centerPoint?.coordinates;
  return {
    id: property._id,
    title: property.title,
    location: property.location,
    gpsAddress: property.gpsAddress,
    type: property.type,
    price: property.price,
    size: property.size,
    category: property.category,
    verified: property.verified,
    verificationStatus: property.verificationStatus,
    status: property.status,
    image: property.images && property.images.length > 0 ? property.images[0].url : '/img/land.jpg',
    images: property.images || [],
    views: property.views,
    saved: property.saves,
    description: property.description,
    features: property.features,
    negotiable: property.negotiable,
    contactMethod: property.contactMethod,
    // Geospatial fields for map display
    geometry: property.geometry || null,
    // Convenience centroid: [lat, lng] for map libraries that expect lat-first
    center: center ? [center[1], center[0]] : null,
    // Raw GeoJSON center: [lng, lat]
    centerPoint: property.centerPoint || null,
    seller: property.seller,
    createdAt: property.createdAt,
    updatedAt: property.updatedAt
  };
}

// @route   GET /api/properties
// @desc    Get all verified + active properties with filtering and pagination
// @access  Public
router.get('/', [
  query('q').optional().isString().trim(),
  query('type').optional().isIn(['all', 'sale', 'rent']),
  query('region').optional().isString().trim(),
  query('district').optional().isString().trim(),
  query('propertyType').optional().isIn(['residential', 'commercial', 'vacant']),
  query('priceMin').optional().isFloat({ min: 0 }).toFloat(),
  query('priceMax').optional().isFloat({ min: 0 }).toFloat(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('page').optional().isInt({ min: 1 }).toInt(),
  handleValidationErrors
], asyncHandler(async (req, res) => {
  const {
    q,
    type,
    region,
    district,
    propertyType,
    priceMin,
    priceMax,
    limit = 50,
    page = 1
  } = req.query;

  const filter = {
    verified: true,
    status: 'active'
  };

  if (q) {
    filter.$or = [
      { title:                  { $regex: q, $options: 'i' } },
      { 'location.address':     { $regex: q, $options: 'i' } },
      { 'location.region':      { $regex: q, $options: 'i' } },
      { 'location.district':    { $regex: q, $options: 'i' } },
      { gpsAddress:             { $regex: q, $options: 'i' } }
    ];
  }

  if (type && type !== 'all') {
    filter.type = type;
  }

  if (region) {
    filter['location.region'] = { $regex: region, $options: 'i' };
  }

  if (district) {
    filter['location.district'] = { $regex: district, $options: 'i' };
  }

  if (propertyType) {
    filter.category = propertyType;
  }

  // Price range: prices are stored as strings so we do a numeric cast in-memory
  // For a scalable solution prices would be stored as numbers, but we respect
  // the existing schema by post-filtering.
  const parsedPriceMin = priceMin !== undefined ? Number(priceMin) : null;
  const parsedPriceMax = priceMax !== undefined ? Number(priceMax) : null;

  const skip = (page - 1) * limit;
  const needsPriceFilter = parsedPriceMin !== null || parsedPriceMax !== null;

  let rawProperties = await Property.find(filter)
    .populate('seller', 'personalInfo.fullName sellerInfo.verificationStatus')
    .limit(needsPriceFilter ? 0 : limit)
    .skip(needsPriceFilter ? 0 : skip)
    .sort({ createdAt: -1 })
    .select('-documents -__v');

  if (needsPriceFilter) {
    rawProperties = rawProperties.filter((p) => {
      const price = Number(p.price);
      if (Number.isNaN(price)) return true;
      if (parsedPriceMin !== null && price < parsedPriceMin) return false;
      if (parsedPriceMax !== null && price > parsedPriceMax) return false;
      return true;
    });
  }

  const total = needsPriceFilter ? rawProperties.length : await Property.countDocuments(filter);
  const properties = needsPriceFilter ? rawProperties.slice(skip, skip + limit) : rawProperties;

  const transformedProperties = properties.map(transformProperty);

  return res.json({
    success: true,
    data: transformedProperties,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasNextPage: page * limit < total,
    hasPrevPage: page > 1
  });
}));

// @route   GET /api/properties/mine
// @desc    Get all properties belonging to the authenticated seller (all statuses)
// @access  Authenticated
router.get('/mine', authenticate, asyncHandler(async (req, res) => {
  const properties = await Property.find({ seller: req.user.id })
    .sort({ createdAt: -1 })
    .select('-documents -__v');

  return res.json({
    success: true,
    data: properties.map(transformProperty),
    total: properties.length
  });
}));

// @route   POST /api/properties
// @desc    Create a new property listing (submitted for admin review)
// @access  Authenticated sellers
router.post('/', authenticate, [
  body('type').isIn(['sale', 'rent']).withMessage('type must be sale or rent'),
  body('price').notEmpty().withMessage('price is required'),
  body('size').notEmpty().withMessage('size is required'),
  body('category').isIn(['residential', 'commercial', 'vacant']).withMessage('invalid category'),
  handleValidationErrors
], asyncHandler(async (req, res) => {
  const {
    title,
    propertyTitle,   // mobile app field alias
    type,
    transactionType, // mobile app field alias for type
    price,
    size,
    category,
    description,
    gpsAddress,
    digitalAddress,  // mobile app field alias for gpsAddress
    region,
    district,
    address,
    features,
    negotiable,
    contactMethod,
    latitude,
    longitude,
    polygon
  } = req.body;

  // Only verified sellers may list properties
  const sellerUser = await User.findById(req.user.id).select('sellerInfo.verificationStatus role');
  if (sellerUser?.role === 'seller' && sellerUser?.sellerInfo?.verificationStatus !== 'verified') {
    return res.status(403).json({
      success: false,
      message: 'Only verified sellers can list properties. Please complete your seller verification first.'
    });
  }

  // Build structured location
  const locationObj = {
    address: address || '',
    region: region || '',
    district: district || ''
  };

  // Resolve field aliases
  const resolvedType = type || (transactionType === 'sale' ? 'sale' : transactionType === 'rent' ? 'rent' : 'sale');
  const resolvedGps  = gpsAddress || digitalAddress || '';
  const resolvedTitle = title || propertyTitle || '';

  // Parse lat/lng (may come as strings from multipart forms)
  const parsedLng = typeof longitude === 'number' ? longitude : parseFloat(longitude);
  const parsedLat = typeof latitude  === 'number' ? latitude  : parseFloat(latitude);

  const geoFields = buildGeoFields({
    polygon: Array.isArray(polygon) ? polygon : [],
    longitude: Number.isFinite(parsedLng) ? parsedLng : undefined,
    latitude:  Number.isFinite(parsedLat) ? parsedLat : undefined
  });

  // Validate coordinates are within Ghana (if provided)
  if (geoFields.centerPoint?.coordinates) {
    if (!isWithinGhana(geoFields.centerPoint.coordinates)) {
      return res.status(400).json({
        success: false,
        message: 'Coordinates must be within Ghana'
      });
    }
  }

  const property = new Property({
    seller: req.user.id,
    title: resolvedTitle,
    location: locationObj,
    gpsAddress: resolvedGps,
    type: resolvedType,
    price: String(price),
    size: String(size),
    category,
    description: description || '',
    features: Array.isArray(features) ? features : [],
    negotiable: negotiable !== false,
    contactMethod: contactMethod || 'both',
    verificationStatus: 'pending',
    verified: false,
    status: 'available',
    ...geoFields
  });

  await property.save();

  // Notify admins in real time that a new property needs review
  emitNewSubmission(property._id, {
    title:    property.title || String(property._id),
    sellerId: String(req.user.id)
  });

  return res.status(201).json({
    success: true,
    message: 'Property submitted for admin verification',
    data: transformProperty(property)
  });
}));

// @route   GET /api/properties/:id
// @desc    Get single property details
// @access  Public (verified + active only)
router.get('/:id', [
  param('id').isMongoId().withMessage('Invalid property ID'),
  handleValidationErrors
], asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id)
    .populate('seller', 'personalInfo.fullName personalInfo.phoneNumber personalInfo.email sellerInfo.verificationStatus')
    .select('-documents.__v -__v');

  if (!property) {
    return res.status(404).json({ success: false, message: 'Property not found' });
  }

  if (!property.verified || property.status !== 'active') {
    return res.status(404).json({ success: false, message: 'Property not found' });
  }

  await property.incrementViews();

  const center = property.centerPoint?.coordinates;
  const result = {
    ...transformProperty(property),
    owner: {
      name:     property.seller?.personalInfo?.fullName || 'Anonymous',
      phone:    property.contactMethod !== 'email' ? property.seller?.personalInfo?.phoneNumber : null,
      email:    property.contactMethod !== 'phone' ? property.seller?.personalInfo?.email : null,
      verified: property.seller?.sellerInfo?.verificationStatus === 'verified'
    }
  };
  delete result.seller;

  return res.json({ success: true, data: result });
}));

// @route   PATCH /api/properties/:id
// @desc    Update a property listing (seller can edit their own pending/rejected listings)
// @access  Authenticated owner
router.patch('/:id', authenticate, [
  param('id').isMongoId().withMessage('Invalid property ID'),
  handleValidationErrors
], asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);

  if (!property) {
    return res.status(404).json({ success: false, message: 'Property not found' });
  }

  // Only the seller or an admin may update
  if (String(property.seller) !== String(req.user.id) && req.user.role !== 'admin' && req.user.role !== 'government_admin') {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  const allowedFields = ['title', 'description', 'price', 'size', 'category', 'features', 'negotiable', 'contactMethod', 'gpsAddress', 'digitalAddress', 'type', 'transactionType', 'region', 'district', 'address', 'latitude', 'longitude', 'polygon'];

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      if (field === 'region' || field === 'district' || field === 'address') {
        property.location = property.location || {};
        property.location[field === 'address' ? 'address' : field] = req.body[field];
      } else if (field === 'gpsAddress' || field === 'digitalAddress') {
        property.gpsAddress = req.body[field];
      } else if (field === 'type' || field === 'transactionType') {
        const v = req.body[field];
        if (v === 'sale' || v === 'rent') property.type = v;
      } else if (field === 'latitude' || field === 'longitude' || field === 'polygon') {
        // handled below
      } else {
        property[field] = req.body[field];
      }
    }
  }

  // Re-compute geo fields if spatial data changed
  const parsedLng = typeof req.body.longitude === 'number' ? req.body.longitude : parseFloat(req.body.longitude);
  const parsedLat = typeof req.body.latitude  === 'number' ? req.body.latitude  : parseFloat(req.body.latitude);
  const geoFields = buildGeoFields({
    polygon: Array.isArray(req.body.polygon) ? req.body.polygon : [],
    longitude: Number.isFinite(parsedLng) ? parsedLng : undefined,
    latitude:  Number.isFinite(parsedLat) ? parsedLat : undefined
  });
  if (geoFields.geometry)    property.geometry    = geoFields.geometry;
  if (geoFields.centerPoint) property.centerPoint = geoFields.centerPoint;

  // Editing a rejected listing resets it to pending review
  if (property.verificationStatus === 'rejected') {
    property.verificationStatus = 'pending';
    property.verified = false;
    property.status = 'available';
  }

  await property.save();
  return res.json({ success: true, data: transformProperty(property) });
}));

// @route   PATCH /api/properties/:id/status
// @desc    Update property status (available / under_offer / sold)
//          Cannot mark as sold without a confirmed transaction
// @access  Authenticated owner
router.patch('/:id/status', authenticate, [
  param('id').isMongoId().withMessage('Invalid property ID'),
  body('status').isIn(['available', 'under_offer', 'sold']).withMessage('status must be available, under_offer or sold'),
  handleValidationErrors
], asyncHandler(async (req, res) => {
  const { status } = req.body;
  const property = await Property.findById(req.params.id);

  if (!property) return res.status(404).json({ success: false, message: 'Property not found' });

  if (String(property.seller) !== String(req.user.id) &&
      req.user.role !== 'admin' && req.user.role !== 'government_admin') {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  // Cannot mark as sold without a confirmed transaction
  if (status === 'sold') {
    const confirmedTx = await Transaction.findOne({
      property: property._id,
      status: { $in: ['completed', 'confirmed'] }
    });
    if (!confirmedTx) {
      return res.status(403).json({
        success: false,
        message: 'Cannot mark property as Sold without a confirmed transaction.'
      });
    }
  }

  property.status = status;
  await property.save();

  return res.json({ success: true, data: transformProperty(property) });
}));

// @route   GET /api/properties/nearby/:lng/:lat
// @desc    Get nearby properties using GeoJSON Point proximity
// @access  Public
router.get('/nearby/:lng/:lat', [
  param('lng').isFloat({ min: -180, max: 180 }),
  param('lat').isFloat({ min: -90, max: 90 }),
  query('distance').optional().isInt({ min: 100, max: 50000 }).toInt(),
  handleValidationErrors
], asyncHandler(async (req, res) => {
  const { lng, lat } = req.params;
  const distance = req.query.distance || 5000;

  const properties = await Property.findNearby(parseFloat(lng), parseFloat(lat), distance)
    .populate('seller', 'personalInfo.fullName')
    .limit(20)
    .select('title location gpsAddress type price size category verified images views saves geometry centerPoint');

  return res.json({
    success: true,
    data: properties.map(transformProperty),
    searchLocation: { lng: parseFloat(lng), lat: parseFloat(lat) },
    distance
  });
}));

// @route   POST /api/properties/:id/save
// @desc    Toggle save/unsave a property for the authenticated user
// @access  Authenticated
router.post('/:id/save', authenticate, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(req.user.id).select('savedProperties');
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  const property = await Property.findById(id).select('_id title saves');
  if (!property) return res.status(404).json({ success: false, message: 'Property not found' });

  const savedIndex = user.savedProperties.findIndex((p) => String(p) === String(id));
  let isSaved;

  if (savedIndex !== -1) {
    user.savedProperties.splice(savedIndex, 1);
    isSaved = false;
  } else {
    user.savedProperties.push(id);
    property.saves = (property.saves || 0) + 1;
    await property.save();
    isSaved = true;
  }

  await user.save();
  return res.json({ success: true, isSaved });
}));

// @route   POST /api/properties/:id/report
// @desc    Report a suspicious property listing
// @access  Authenticated
router.post('/:id/report', authenticate, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { description } = req.body;

  if (!description || !String(description).trim()) {
    return res.status(400).json({ success: false, message: 'description is required' });
  }

  const property = await Property.findById(id).select('_id');
  if (!property) return res.status(404).json({ success: false, message: 'Property not found' });

  const report = await FraudReport.create({
    reporterId:  req.user.id,
    propertyId:  id,
    description: String(description).trim()
  });

  return res.status(201).json({ success: true, message: 'Report submitted', data: report });
}));

module.exports = router;