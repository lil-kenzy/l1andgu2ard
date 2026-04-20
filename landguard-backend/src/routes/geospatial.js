const express = require('express');
const Property = require('../models/Property');
const asyncHandler = require('../utils/asyncHandler');
const { parsePagination } = require('../utils/pagination');

const router = express.Router();

router.post('/validate-boundary', asyncHandler(async (req, res) => {
  const { polygon = [] } = req.body;
  if (!Array.isArray(polygon) || polygon.length < 3) {
    return res.status(400).json({ success: false, message: 'A polygon with at least 3 points is required' });
  }

  const closedPolygon = [...polygon, polygon[0]];
  const overlapping = await Property.findOne({
    geometry: {
      $geoIntersects: {
        $geometry: {
          type: 'Polygon',
          coordinates: [closedPolygon]
        }
      }
    },
    status: { $ne: 'deleted' }
  }).select('_id location gpsAddress');

  return res.json({
    success: true,
    data: {
      valid: !overlapping,
      overlappingProperty: overlapping || null
    }
  });
}));

router.get('/nearby', asyncHandler(async (req, res) => {
  const lng = Number.parseFloat(req.query.lng);
  const lat = Number.parseFloat(req.query.lat);
  const radius = Math.max(100, Number.parseInt(req.query.radius || '5000', 10));
  const { page, limit, skip } = parsePagination(req.query);

  if (Number.isNaN(lng) || Number.isNaN(lat)) {
    return res.status(400).json({ success: false, message: 'lng and lat query params are required' });
  }

  // Use centerPoint (GeoJSON Point, 2dsphere indexed) for proximity queries.
  // geometry stores Polygon shapes which cannot be used with $near.
  const filter = {
    centerPoint: {
      $near: {
        $geometry: { type: 'Point', coordinates: [lng, lat] }, // GeoJSON: longitude first
        $maxDistance: radius
      }
    },
    verified: true,
    status: { $in: ['active', 'available'] }
  };

  const [items, total] = await Promise.all([
    Property.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
    Property.countDocuments(filter)
  ]);

  return res.json({
    success: true,
    data: items,
    page,
    limit,
    total
  });
}));

module.exports = router;
