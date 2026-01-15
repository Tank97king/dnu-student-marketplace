const mongoose = require('mongoose');

const bankQRSchema = new mongoose.Schema({
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
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('BankQR', bankQRSchema);



