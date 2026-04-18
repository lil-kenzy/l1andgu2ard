const mongoose = require('mongoose');

const PropertySchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Basic Property Information
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

  // Media
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
      enum: ['title_deed', 'site_plan', 'building_permit', 'consent_letter', 'ghana_card']
    },
    url: String,
    filename: String,
    uploadedAt: {
      type: Date,
      default: Date.now
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

  // Geospatial Data (Critical for mapping)
  geometry: {
    type: {
      type: String,
      enum: ['Polygon', 'Point'],
      default: 'Polygon'
    },
    coordinates: {
      type: [[[Number]]], // For Polygon: [[[lng, lat], [lng, lat], ...]]
      required: true
    }
  },

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

// Create geospatial index for location-based queries
PropertySchema.index({ geometry: '2dsphere' });

// Compound indexes for efficient queries
PropertySchema.index({ type: 1, verified: 1, status: 1 });
PropertySchema.index({ location: 1, type: 1 });
PropertySchema.index({ category: 1, type: 1 });

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

// Static method to find nearby properties
PropertySchema.statics.findNearby = function(longitude, latitude, maxDistance = 5000) {
  return this.find({
    geometry: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistance // in meters
      }
    },
    verified: true,
    status: { $in: ['available', 'active'] }
  });
};

module.exports = mongoose.model('Property', PropertySchema);