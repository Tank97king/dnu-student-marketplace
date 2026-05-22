const mongoose = require('mongoose');

const sellerBankQRSchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true  // Mỗi người bán chỉ có 1 QR active
  },
  bankName: {
    type: String,
    required: [true, 'Vui lòng nhập tên ngân hàng'],
    trim: true
  },
  accountNumber: {
    type: String,
    required: [true, 'Vui lòng nhập số tài khoản'],
    trim: true
  },
  accountHolder: {
    type: String,
    required: [true, 'Vui lòng nhập tên chủ tài khoản'],
    trim: true
  },
  qrCodeImage: {
    type: String,
    required: [true, 'Vui lòng upload ảnh QR code']
  },
  isVerified: {
    type: Boolean,
    default: false  // Admin cần xác minh trước khi dùng
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: {
    type: Date
  }
}, {
  timestamps: true
});

sellerBankQRSchema.index({ sellerId: 1 });
sellerBankQRSchema.index({ isVerified: 1 });

module.exports = mongoose.model('SellerBankQR', sellerBankQRSchema);
