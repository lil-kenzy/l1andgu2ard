/**
 * EXAMPLE: Backend API Route for Properties
 * This is a reference implementation for the /api/properties endpoint
 * 
 * Location: Your backend project (e.g., backend/routes/properties.js or backend/pages/api/properties.js for Next.js)
 * 
 * This serves as a template for implementing the backend API that the frontend expects.
 */

// ============ NOTE: IMPLEMENTATION REQUIRED ============
// This file shows what your backend /api/properties endpoint should look like
// You need to implement this on your backend (Node.js/Express or Next.js API routes)

// ============ EXAMPLE: Next.js API Route ============
/*
import handleCors from '@/middleware/cors';
import { connectDB } from '@/lib/mongodb';
import Property from '@/models/Property';

export default async function handler(req, res) {
  await handleCors(req, res);

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    await connectDB();

    const { q, type, region, propertyType, limit = 50, page = 1 } = req.query;

    // Build filter object
    const filter = {};

    // Search filter (location or GPS address)
    if (q) {
      filter.$or = [
        { location: { $regex: q, $options: 'i' } },
        { ghanaPostGPSAddress: { $regex: q, $options: 'i' } }
      ];
    }

    // Transaction type filter
    if (type && type !== 'all') {
      filter.type = type; // 'sale' or 'rent'
    }

    // Region filter
    if (region) {
      filter.location = { $regex: region, $options: 'i' };
    }

    // Property type filter
    if (propertyType) {
      filter.category = propertyType;
    }

    // Only show verified properties (optional - adjust based on requirements)
    filter.verified = true;

    // Pagination
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = Math.min(parseInt(limit, 10) || 50, 100); // max 100 per page
    const skip = (pageNum - 1) * limitNum;

    // Fetch properties
    const properties = await Property.find(filter)
      .limit(limitNum)
      .skip(skip)
      .sort({ createdAt: -1 }); // Sort by newest first

    // Get total count for pagination
    const total = await Property.countDocuments(filter);

    return res.status(200).json({
      success: true,
      data: properties,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    });
  } catch (error) {
    console.error('Error fetching properties:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch properties'
    });
  }
}
*/

// ============ EXAMPLE: Express.js Route ============
/*
const express = require('express');
const router = express.Router();
const Property = require('../models/Property');

router.get('/properties', async (req, res) => {
  try {
    const { q, type, region, propertyType, limit = 50, page = 1 } = req.query;

    // Build filter object
    const filter = { verified: true };

    if (q) {
      filter.$or = [
        { location: { $regex: q, $options: 'i' } },
        { ghanaPostGPSAddress: { $regex: q, $options: 'i' } }
      ];
    }

    if (type && type !== 'all') {
      filter.type = type;
    }

    if (region) {
      filter.location = { $regex: region, $options: 'i' };
    }

    if (propertyType) {
      filter.category = propertyType;
    }

    // Pagination
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = Math.min(parseInt(limit, 10) || 50, 100);
    const skip = (pageNum - 1) * limitNum;

    const properties = await Property.find(filter)
      .limit(limitNum)
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await Property.countDocuments(filter);

    res.json({
      success: true,
      data: properties,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
*/

// ============ MongoDB Property Model Example ============
/*
const mongoose = require('mongoose');

const PropertySchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  location: {
    type: String,
    required: true,
    index: true
  },
  gpsAddress: {
    type: String,
    index: true
  },
  type: {
    type: String,
    enum: ['sale', 'rent'],
    required: true,
    index: true
  },
  price: String,
  size: String,
  category: {
    type: String,
    enum: ['residential', 'commercial', 'vacant'],
    index: true
  },
  verified: {
    type: Boolean,
    default: false,
    index: true
  },
  image: String,
  views: {
    type: Number,
    default: 0
  },
  saved: {
    type: Number,
    default: 0
  },
  description: String,
  features: [String],
  geometry: {
    type: {
      type: String,
      enum: ['Polygon', 'Point'],
      default: 'Polygon'
    },
    coordinates: []
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: Date
});

// Create geospatial index for location-based queries
PropertySchema.index({ geometry: '2dsphere' });

module.exports = mongoose.model('Property', PropertySchema);
*/

// ============ KEY POINTS FOR IMPLEMENTATION ============
// 1. Create the /api/properties endpoint in your backend
// 2. Accept the query parameters shown in the frontend code
// 3. Query your MongoDB database with the provided filters
// 4. Return the exact response structure expected by the frontend
// 5. Implement pagination for performance
// 6. Add error handling
// 7. Consider adding authentication for future seller functionality
// 8. Use geospatial indexes for efficient location-based searches
// 9. Add CORS headers if frontend and backend are on different domains
// 10. Consider caching for frequently accessed data

console.log('This is an example file showing how to implement the backend API');
console.log('Refer to API_INTEGRATION.md for detailed specifications');
