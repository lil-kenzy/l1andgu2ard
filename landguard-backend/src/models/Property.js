const mongoose = require('mongoose');

const PropertySchema = new mongoose.Schema({
  // The seller/owner who listed this property
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Human-readable listing title
  title: {
    type: String,
    trim: true,
    maxlength: 200
  },

  // Structured location information
  location: {
    address: { type: String, trim: true },
    region:  { type: String, trim: true, index: true },
    district:{ type: String, trim: true }
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

  price: {
    type: String,
    required: true
  },

  size: {
    type: String,
    required: true
  },

  category: {
    type: String,
    enum: ['residential', 'commercial', 'vacant'],
    required: true,
    index: true
  },

  // Verification Status
  verified: {
    type: Boolean,
    default: false,
    index: true
  },

  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },

  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  verifiedAt: {
    type: Date
  },

  rejectionReason: {
    type: String
  },

  // Unique registry identifiers
  serialNumber: {
    type: String,
    trim: true,
    index: true
  },

  parcelNumber: {
    type: String,
    trim: true,
    index: true
  },

  // Land classification (schema spec: propertyType)
  propertyType: {
    type: String,
    enum: ['vacant_land', 'with_building', 'commercial', 'residential'],
    index: true
  },

  // GhanaPost GPS address (canonical name from schema spec)
  ghanaPostGPSAddress: {
    type: String,
    trim: true,
    index: true
  },

  // Active flag — controls visibility in public queries and admin counts
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },

  // Featured listing flag
  isFeatured: {
    type: Boolean,
    default: false,
    index: true
  },

  // Media — rich array supporting images, videos, and 360° tours
  media: [{
    url: String,
    type: {
      type: String,
      enum: ['image', 'video', '360_tour'],
      default: 'image'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    verified: {
      type: Boolean,
      default: false
    }
  }],

  // Legacy images array — kept for backward compatibility
  images: [{
    url: String,
    filename: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],

  documents: [{
    type: {
      type: String,
      enum: ['title_deed', 'site_plan', 'building_permit', 'consent_letter', 'ghana_card', 'utility_bill']
    },
    url: String,
    fileUrl: String,  // alias kept in sync with url for schema-spec callers
    filename: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    // Verification fields (schema spec)
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verifiedAt: {
      type: Date
    },
    // Expiry for time-bound documents
    expiryDate: {
      type: Date
    }
  }],

  // Property Details
  description: {
    type: String,
    maxlength: 1000
  },

  features: [{
    type: String,
    enum: ['water', 'electricity', 'sewage', 'internet', 'fenced', 'gated_community', 'parking', 'security']
  }],

  // Geospatial Data
  // ── geometry: full GeoJSON shape (Polygon or Point) for boundary queries
  geometry: {
    type: {
      type: String,
      enum: ['Polygon', 'Point']
    },
    // Mixed supports both Polygon coords [[[lng,lat],...]] and Point coords [lng,lat]
    coordinates: {
      type: mongoose.Schema.Types.Mixed
    }
  },

  // ── centerPoint: GeoJSON Point used for fast $near proximity queries.
  //    For polygon parcels this is the centroid; for point listings it equals geometry.coordinates.
  centerPoint: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number]  // [longitude, latitude]
    }
  },

  // Structured details subdocument (schema spec)
  details: {
    sizeSqM:     { type: Number },
    sizeAcres:   { type: Number },
    priceGHS:    { type: Number },
    negotiable:  { type: Boolean, default: true },
    description: { type: String, maxlength: 1000 },
    features:    [{ type: String }]
  },

  // Transaction / event history trail
  history: [{
    action: {
      type: String,
      enum: ['listed', 'price_changed', 'status_updated', 'sold', 'verified', 'rejected', 'document_added']
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed  // e.g. { oldPrice, newPrice }
    }
  }],

  // Analytics
  views: {
    type: Number,
    default: 0
  },

  saves: {
    type: Number,
    default: 0
  },

  inquiries: {
    type: Number,
    default: 0
  },

  // Status
  status: {
    type: String,
    enum: ['available', 'under_offer', 'sold', 'rented', 'paused', 'deleted', 'active'],
    default: 'available',
    index: true
  },

  soldAt: {
    type: Date
  },

  // Negotiation settings
  negotiable: {
    type: Boolean,
    default: true
  },

  contactMethod: {
    type: String,
    enum: ['phone', 'email', 'both'],
    default: 'both'
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 2dsphere index on geometry for $geoIntersects / polygon boundary queries
PropertySchema.index({ geometry: '2dsphere' });

// 2dsphere index on centerPoint for $near proximity searches
PropertySchema.index({ centerPoint: '2dsphere' });

// Compound indexes for efficient queries
PropertySchema.index({ type: 1, verified: 1, status: 1 });
PropertySchema.index({ 'location.region': 1, type: 1 });
PropertySchema.index({ category: 1, type: 1 });
PropertySchema.index({ isActive: 1, verificationStatus: 1, status: 1 });
// Full-text search on GPS address (schema spec)
PropertySchema.index({ ghanaPostGPSAddress: 'text', gpsAddress: 'text' });

// Update timestamp on save
PropertySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Virtual for formatted price (for display)
PropertySchema.virtual('formattedPrice').get(function() {
  return this.price;
});

// Method to increment views
PropertySchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Method to increment saves
PropertySchema.methods.incrementSaves = function() {
  this.saves += 1;
  return this.save();
};

// Static method to find nearby properties using the dedicated GeoJSON Point field
PropertySchema.statics.findNearby = function(longitude, latitude, maxDistance = 5000) {
  return this.find({
    centerPoint: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]  // GeoJSON: longitude first
        },
        $maxDistance: maxDistance // in metres
      }
    },
    verified: true,
    status: { $in: ['available', 'active'] }
  });
};

module.exports = mongoose.model('Property', PropertySchema);