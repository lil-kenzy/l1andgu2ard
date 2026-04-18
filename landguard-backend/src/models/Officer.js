const mongoose = require('mongoose');

const OfficerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  role: {
    type: String,
    enum: ['admin', 'surveyor', 'legal', 'compliance', 'support'],
    required: true
  },
  region: { type: String, default: '' },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Officer', OfficerSchema);
