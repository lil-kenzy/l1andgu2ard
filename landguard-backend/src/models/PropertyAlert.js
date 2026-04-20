const mongoose = require('mongoose');

const PropertyAlertSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  label: {
    type: String,
    trim: true,
    maxlength: 100
  },
  region: {
    type: String,
    trim: true
  },
  district: {
    type: String,
    trim: true
  },
  priceMin: {
    type: Number,
    min: 0
  },
  priceMax: {
    type: Number,
    min: 0
  },
  category: {
    type: String,
    enum: ['residential', 'commercial', 'vacant', 'any'],
    default: 'any'
  },
  type: {
    type: String,
    enum: ['sale', 'rent', 'any'],
    default: 'any'
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

PropertyAlertSchema.index({ user: 1, active: 1 });

module.exports = mongoose.model('PropertyAlert', PropertyAlertSchema);
