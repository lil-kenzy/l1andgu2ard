const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'GHS',
    enum: ['GHS', 'USD']
  },
  status: {
    type: String,
    enum: ['initiated', 'payment_pending', 'payment_received', 'documents_pending', 'verification_pending', 'completed', 'cancelled', 'disputed'],
    default: 'initiated'
  },
  transactionType: {
    type: String,
    enum: ['sale', 'lease', 'rental'],
    required: true
  },
  escrowAmount: {
    type: Number,
    default: 0
  },
  escrowReleased: {
    type: Boolean,
    default: false
  },
  documents: [{
    type: {
      type: String,
      enum: ['title_deed', 'contract', 'receipt', 'verification_certificate', 'other'],
      required: true
    },
    url: {
      type: String,
      required: true
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
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
  paymentMethod: {
    type: String,
    enum: ['bank_transfer', 'mobile_money', 'card', 'cash'],
    required: true
  },
  paymentReference: {
    type: String
  },
  timeline: [{
    status: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    note: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  completionDate: {
    type: Date
  },
  notes: [{
    content: {
      type: String,
      required: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  disputeReason: {
    type: String
  },
  disputeResolved: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better query performance
TransactionSchema.index({ buyer: 1, status: 1 });
TransactionSchema.index({ seller: 1, status: 1 });
TransactionSchema.index({ property: 1 });
TransactionSchema.index({ status: 1, createdAt: -1 });
TransactionSchema.index({ 'timeline.timestamp': -1 });

// Virtual for transaction duration
TransactionSchema.virtual('duration').get(function() {
  if (this.completionDate && this.createdAt) {
    return Math.ceil((this.completionDate - this.createdAt) / (1000 * 60 * 60 * 24)); // days
  }
  return null;
});

// Method to add timeline entry
TransactionSchema.methods.addTimelineEntry = function(status, note, updatedBy) {
  this.timeline.push({
    status,
    note,
    updatedBy
  });
  return this.save();
};

// Method to calculate escrow amount (10% of transaction)
TransactionSchema.methods.calculateEscrow = function() {
  this.escrowAmount = this.amount * 0.1;
  return this.escrowAmount;
};

// Static method to get transactions by status
TransactionSchema.statics.getByStatus = function(status) {
  return this.find({ status }).populate('property buyer seller');
};

// Static method to get user's transactions
TransactionSchema.statics.getUserTransactions = function(userId, role = 'buyer') {
  const query = role === 'buyer' ? { buyer: userId } : { seller: userId };
  return this.find(query)
    .populate('property', 'title location price images')
    .populate(role === 'buyer' ? 'seller' : 'buyer', 'name email phone avatar')
    .sort({ createdAt: -1 });
};

module.exports = mongoose.model('Transaction', TransactionSchema);