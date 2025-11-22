const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  offerPrice: {
    type: Number,
    required: true,
    min: 0
  },
  counterOfferPrice: {
    type: Number,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'countered', 'expired', 'cancelled'],
    default: 'pending'
  },
  message: {
    type: String,
    trim: true
  },
  sellerMessage: {
    type: String,
    trim: true
  },
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    }
  },
  acceptedAt: {
    type: Date
  },
  rejectedAt: {
    type: Date
  },
  rejectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

offerSchema.index({ buyerId: 1, status: 1 });
offerSchema.index({ sellerId: 1, status: 1 });
offerSchema.index({ productId: 1 });
offerSchema.index({ expiresAt: 1 });

// Auto-expire offers
offerSchema.pre('save', function(next) {
  if (this.status === 'pending' && this.expiresAt && this.expiresAt < new Date()) {
    this.status = 'expired';
  }
  next();
});

module.exports = mongoose.model('Offer', offerSchema);

