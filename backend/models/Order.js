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
    enum: ['pending', 'confirmed', 'picked_up', 'completed', 'cancelled', 'return_requested', 'returned'],
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
  // --- Hoàn đơn hàng ---
  returnReason: {
    type: String,
    trim: true
  },
  returnRequestedAt: {
    type: Date
  },
  returnApprovedAt: {
    type: Date
  },
  returnApprovedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  returnRejectedAt: {
    type: Date
  },
  returnRejectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  returnRejectionReason: {
    type: String,
    trim: true
  },
  // --- Shipper ---
  shipperId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  shipperAssignedAt: {
    type: Date
  },
  pickedUpAt: {
    type: Date
  },
  deliveredAt: {
    type: Date
  },
  pickupProof: {
    type: String,
    default: ''
  },
  deliveryProof: {
    type: String,
    default: ''
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
    default: 'delivery'
  },
  paymentMethod: {
    type: String,
    enum: ['transfer', 'cash'],
    default: 'transfer'
  },
  couponId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coupon',
    default: null
  },
  couponCode: {
    type: String,
    trim: true,
    uppercase: true,
    default: null
  },
  discountAmount: {
    type: Number,
    default: 0,
    min: 0
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
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Define payment virtual
orderSchema.virtual('payment', {
  ref: 'Payment',
  localField: '_id',
  foreignField: 'orderId',
  justOne: true
});

orderSchema.index({ buyerId: 1, status: 1 });
orderSchema.index({ sellerId: 1, status: 1 });
orderSchema.index({ productId: 1 });
orderSchema.index({ expiresAt: 1 });
orderSchema.index({ status: 1, expiresAt: 1 });

// Auto-expire orders and sync product/coupon status
orderSchema.pre('save', async function() {
  // 1. Auto-expire pending orders
  if (this.status === 'pending' && this.expiresAt && this.expiresAt < new Date()) {
    this.status = 'cancelled';
    this.cancelledAt = new Date();
    this.cancellationReason = 'Tự động hủy do hết thời gian xác nhận';
  }

  // 2. Revert coupon usage if status changes to cancelled
  if (this.isModified('status') && this.status === 'cancelled' && this.couponId) {
    try {
      const Coupon = mongoose.model('Coupon');
      await Coupon.updateOne(
        { _id: this.couponId, usedCount: { $gt: 0 } },
        { $inc: { usedCount: -1 } }
      );
    } catch (err) {
      console.error('Error reverting coupon usage in order pre-save:', err);
    }
  }

  // 3. Make product available again if order status changes to cancelled or returned
  if (this.isModified('status') && (this.status === 'cancelled' || this.status === 'returned')) {
    try {
      const Product = mongoose.model('Product');
      await Product.findByIdAndUpdate(this.productId, { status: 'Available' });
    } catch (err) {
      console.error('Error releasing product in order pre-save:', err);
    }
  }
});

module.exports = mongoose.model('Order', orderSchema);

