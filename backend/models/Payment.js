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
  // Phí dịch vụ và thuế
  platformFeePercent: {
    type: Number,
    default: 5  // 5%
  },
  vatPercent: {
    type: Number,
    default: 10  // 10% VAT áp dụng trên phí dịch vụ
  },
  platformFee: {
    type: Number,
    default: 0  // amount * 5%
  },
  vatAmount: {
    type: Number,
    default: 0  // platformFee * 10%
  },
  sellerAmount: {
    type: Number,
    default: 0  // amount - platformFee - vatAmount
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
  adminApproved: {
    type: Boolean,
    default: false
  },
  adminApprovedAt: {
    type: Date
  },
  adminApprovedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  sellerApproved: {
    type: Boolean,
    default: false
  },
  sellerApprovedAt: {
    type: Date
  },
  sellerApprovedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Người bán đã được thanh toán
  sellerPaid: {
    type: Boolean,
    default: false
  },
  sellerPaidAt: {
    type: Date
  },
  sellerPaidBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectionReason: {
    type: String,
    trim: true
  },
  // Admin xác nhận đã nhận tiền COD từ khách
  codConfirmedByAdmin: {
    type: Boolean,
    default: false
  },
  codConfirmedAt: {
    type: Date
  },
  // Ảnh biên lai Admin upload khi chuyển tiền cho Người bán
  sellerPaymentProof: {
    type: String,
    default: null
  },
  // Người bán xác nhận đã nhận tiền
  sellerConfirmedReceipt: {
    type: Boolean,
    default: false
  },
  sellerReceiptConfirmedAt: {
    type: Date
  },
  // Người bán báo lỗi chưa nhận được tiền
  sellerReportedIssue: {
    type: Boolean,
    default: false
  },
  sellerReportReason: {
    type: String,
    trim: true
  },
  sellerReportedAt: {
    type: Date
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

