const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  // Role-based access
  role: {
    type: String,
    enum: ['buyer', 'seller', 'government_admin'],
    required: true,
    index: true
  },

  // Personal Information
  personalInfo: {
    fullName: {
      type: String,
      required: true,
      trim: true
    },

    ghanaCardNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      // Note: In production, this should be encrypted
    },

    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      sparse: true // Allows multiple null values
    },

    profilePhoto: {
      url: String,
      filename: String
    },

    dateOfBirth: {
      type: Date
    },

    gender: {
      type: String,
      enum: ['male', 'female', 'other']
    }
  },

  // Seller-specific information
  sellerInfo: {
    businessRegNumber: {
      type: String,
      trim: true,
      sparse: true
    },

    tin: {
      type: String,
      trim: true,
      sparse: true
    },

    physicalAddress: {
      type: String,
      trim: true
    },

    bankAccount: {
      bankName: String,
      accountNumber: String,
      accountName: String,
      // Note: In production, sensitive data should be encrypted
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
    }
  },

  // Authentication
  password: {
    type: String,
    required: true,
    minlength: 8
  },

  // Push notification device token (FCM)
  fcmToken: {
    type: String,
    default: null
  },

  // Biometric authentication (for mobile app)
  biometricEnabled: {
    type: Boolean,
    default: false
  },

  biometricData: {
    fingerprintHash: String,
    faceIdHash: String
  },

  // Location (for geospatial queries)
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    },

    address: String,
    region: String,
    district: String
  },

  // Account status
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },

  isSuspended: {
    type: Boolean,
    default: false,
    index: true
  },

  suspensionReason: {
    type: String
  },

  // Email verification
  isEmailVerified: {
    type: Boolean,
    default: false
  },

  emailVerificationToken: String,
  emailVerificationExpires: Date,

  // Phone verification
  isPhoneVerified: {
    type: Boolean,
    default: false
  },

  phoneVerificationCode: String,
  phoneVerificationExpires: Date,

  // Password reset
  passwordResetToken: String,
  passwordResetExpires: Date,

  // Session management
  refreshTokens: [{
    token: String,
    createdAt: {
      type: Date,
      default: Date.now
    },
    expiresAt: Date,
    deviceInfo: {
      userAgent: String,
      ipAddress: String
    }
  }],

  // Activity tracking
  lastLogin: {
    type: Date
  },

  loginAttempts: {
    type: Number,
    default: 0
  },

  lockUntil: Date,

  // Preferences
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    },

    language: {
      type: String,
      default: 'en',
      enum: ['en', 'fr'] // English, French (Ghana's official languages)
    },

    currency: {
      type: String,
      default: 'GHS'
    }
  },

  // Analytics
  propertiesListed: {
    type: Number,
    default: 0
  },

  propertiesSold: {
    type: Number,
    default: 0
  },

  searchesPerformed: {
    type: Number,
    default: 0
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

// Indexes
UserSchema.index({ 'personalInfo.ghanaCardNumber': 1 });
UserSchema.index({ 'personalInfo.phoneNumber': 1 });
UserSchema.index({ 'personalInfo.email': 1 });
UserSchema.index({ role: 1, isActive: 1 });
UserSchema.index({ 'sellerInfo.verificationStatus': 1 });

// Geospatial index for location-based queries
UserSchema.index({ location: '2dsphere' });

// Update timestamp on save
UserSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance methods
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Delegates to the RS256-based token helpers in utils/tokens.js
UserSchema.methods.generateAuthToken = function() {
  const { signAccessToken } = require('../utils/tokens');
  return signAccessToken({ userId: this._id.toString(), role: this.role });
};

UserSchema.methods.generateRefreshToken = function() {
  const { signRefreshToken } = require('../utils/tokens');
  return signRefreshToken({ userId: this._id.toString(), role: this.role });
};

// Account locking methods
UserSchema.methods.incLoginAttempts = function() {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };

  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = {
      lockUntil: Date.now() + 2 * 60 * 60 * 1000 // 2 hours
    };
  }

  return this.updateOne(updates);
};

UserSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 },
    $set: { lastLogin: new Date() }
  });
};

// Virtual for account lock status
UserSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Static methods
UserSchema.statics.findByGhanaCard = function(ghanaCardNumber) {
  return this.findOne({ 'personalInfo.ghanaCardNumber': ghanaCardNumber });
};

UserSchema.statics.findByPhone = function(phoneNumber) {
  return this.findOne({ 'personalInfo.phoneNumber': phoneNumber });
};

UserSchema.statics.findByEmail = function(email) {
  return this.findOne({ 'personalInfo.email': email });
};

module.exports = mongoose.model('User', UserSchema);