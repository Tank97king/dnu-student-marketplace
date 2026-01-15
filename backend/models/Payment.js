const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    unique: true
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  buyerName: {
    type: String,
    required: true,
    trim: true
  },
  buyerPhone: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  transactionCode: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
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
  paymentProof: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'rejected'],
    default: 'pending'
  },
  confirmedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  confirmedAt: {
    type: Date
  },
  rejectionReason: {
    type: String,
    trim: true
  },
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    }
  }
}, {
  timestamps: true
});

// orderId and transactionCode already have unique: true, which creates indexes automatically
paymentSchema.index({ buyerId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ expiresAt: 1 });
paymentSchema.index({ status: 1, expiresAt: 1 });

// Auto-expire payments
paymentSchema.pre('save', function(next) {
  if (this.status === 'pending' && this.expiresAt && this.expiresAt < new Date()) {
    this.status = 'rejected';
    this.rejectionReason = 'Tự động hủy do hết thời gian upload biên lai (24 giờ)';
  }
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);

