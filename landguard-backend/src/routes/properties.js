const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const Property = require('../models/Property');

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

// @route   GET /api/properties
// @desc    Get all properties with filtering and pagination
// @access  Public
router.get('/', [
  query('q').optional().isString().trim(),
  query('type').optional().isIn(['all', 'sale', 'rent']),
  query('region').optional().isString().trim(),
  query('propertyType').optional().isIn(['residential', 'commercial', 'vacant']),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('page').optional().isInt({ min: 1 }).toInt(),
  handleValidationErrors
], async (req, res) => {
  try {
    const {
      q,
      type,
      region,
      propertyType,
      limit = 50,
      page = 1
    } = req.query;

    // Build filter object
    const filter = {
      verified: true,
      status: 'active'
    };

    // Search filter (location or GPS address)
    if (q) {
      filter.$or = [
        { location: { $regex: q, $options: 'i' } },
        { gpsAddress: { $regex: q, $options: 'i' } }
      ];
    }

    // Transaction type filter
    if (type && type !== 'all') {
      filter.type = type;
    }

    // Region filter
    if (region) {
      filter.location = { $regex: region, $options: 'i' };
    }

    // Property type filter
    if (propertyType) {
      filter.category = propertyType;
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Fetch properties with populated owner info (limited fields for performance)
    const properties = await Property.find(filter)
      .populate('ownerId', 'personalInfo.fullName sellerInfo.verificationStatus')
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 })
      .select('-documents -__v'); // Exclude sensitive/private fields

    // Get total count for pagination
    const total = await Property.countDocuments(filter);

    // Transform data for frontend compatibility
    const transformedProperties = properties.map(property => ({
      id: property._id,
      location: property.location,
      gpsAddress: property.gpsAddress,
      type: property.type,
      price: property.price,
      size: property.size,
      category: property.category,
      verified: property.verified,
      image: property.images && property.images.length > 0 ? property.images[0].url : '/img/land.jpg',
      views: property.views,
      saved: property.saves,
      ownerName: property.ownerId?.personalInfo?.fullName || 'Anonymous',
      createdAt: property.createdAt
    }));

    res.json({
      success: true,
      data: transformedProperties,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1
    });

  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch properties',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/properties/:id
// @desc    Get single property details
// @access  Public
router.get('/:id', [
  param('id').isMongoId().withMessage('Invalid property ID'),
  handleValidationErrors
], async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('ownerId', 'personalInfo.fullName personalInfo.phoneNumber personalInfo.email sellerInfo.verificationStatus')
      .select('-documents.__v -__v');

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Check if property is accessible
    if (!property.verified || property.status !== 'active') {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Increment view count
    await property.incrementViews();

    // Transform for frontend
    const transformedProperty = {
      id: property._id,
      location: property.location,
      gpsAddress: property.gpsAddress,
      type: property.type,
      price: property.price,
      size: property.size,
      category: property.category,
      verified: property.verified,
      images: property.images || [],
      views: property.views,
      saves: property.saves,
      inquiries: property.inquiries,
      description: property.description,
      features: property.features,
      geometry: property.geometry,
      negotiable: property.negotiable,
      contactMethod: property.contactMethod,
      owner: {
        name: property.ownerId?.personalInfo?.fullName || 'Anonymous',
        phone: property.contactMethod !== 'email' ? property.ownerId?.personalInfo?.phoneNumber : null,
        email: property.contactMethod !== 'phone' ? property.ownerId?.personalInfo?.email : null,
        verified: property.ownerId?.sellerInfo?.verificationStatus === 'verified'
      },
      createdAt: property.createdAt,
      updatedAt: property.updatedAt
    };

    res.json({
      success: true,
      data: transformedProperty
    });

  } catch (error) {
    console.error('Error fetching property:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch property',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/properties/nearby/:lng/:lat
// @desc    Get nearby properties
// @access  Public
router.get('/nearby/:lng/:lat', [
  param('lng').isFloat({ min: -180, max: 180 }),
  param('lat').isFloat({ min: -90, max: 90 }),
  query('distance').optional().isInt({ min: 100, max: 50000 }).toInt(),
  handleValidationErrors
], async (req, res) => {
  try {
    const { lng, lat } = req.params;
    const distance = req.query.distance || 5000; // 5km default

    const properties = await Property.findNearby(parseFloat(lng), parseFloat(lat), distance)
      .populate('ownerId', 'personalInfo.fullName')
      .limit(20)
      .select('location gpsAddress type price size category verified images views saves');

    const transformedProperties = properties.map(property => ({
      id: property._id,
      location: property.location,
      gpsAddress: property.gpsAddress,
      type: property.type,
      price: property.price,
      size: property.size,
      category: property.category,
      verified: property.verified,
      image: property.images && property.images.length > 0 ? property.images[0].url : '/img/land.jpg',
      views: property.views,
      saved: property.saves
    }));

    res.json({
      success: true,
      data: transformedProperties,
      searchLocation: { lng: parseFloat(lng), lat: parseFloat(lat) },
      distance
    });

  } catch (error) {
    console.error('Error fetching nearby properties:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch nearby properties',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;