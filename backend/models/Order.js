const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
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
  offerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Offer'
  },
  finalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  },
  notes: {
    type: String,
    trim: true
  },
  completedAt: {
    type: Date
  },
  cancelledAt: {
    type: Date
  },
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cancellationReason: {
    type: String
  },
  shippingAddress: {
    fullName: {
      type: String,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      trim: true
    },
    ward: {
      type: String,
      trim: true
    },
    district: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      trim: true
    },
    note: {
      type: String,
      trim: true
    }
  },
  deliveryMethod: {
    type: String,
    enum: ['pickup', 'delivery', 'meetup'],
    default: 'meetup'
  },
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    }
  },
  confirmedAt: {
    type: Date
  }
}, {
  timestamps: true
});

orderSchema.index({ buyerId: 1, status: 1 });
orderSchema.index({ sellerId: 1, status: 1 });
orderSchema.index({ productId: 1 });
orderSchema.index({ expiresAt: 1 });
orderSchema.index({ status: 1, expiresAt: 1 });

// Auto-expire orders
orderSchema.pre('save', function(next) {
  if (this.status === 'pending' && this.expiresAt && this.expiresAt < new Date()) {
    this.status = 'cancelled';
    this.cancelledAt = new Date();
    this.cancellationReason = 'Tự động hủy do hết thời gian xác nhận';
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);

