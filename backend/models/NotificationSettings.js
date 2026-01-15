const mongoose = require('mongoose');

const notificationSettingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  // Thông báo khi sản phẩm yêu thích giảm giá
  favoritePriceDrop: {
    type: Boolean,
    default: true
  },
  // Thông báo nhắc nhở đánh giá sau mua hàng
  reviewReminder: {
    type: Boolean,
    default: true
  },
  // Thông báo sản phẩm sắp hết hạn
  productExpiring: {
    type: Boolean,
    default: true
  },
  // Thông báo khi có người xem sản phẩm nhiều (trending)
  productTrending: {
    type: Boolean,
    default: true
  },
  // Thông báo khi có offer mới
  newOffer: {
    type: Boolean,
    default: true
  },
  // Thông báo khi có message mới
  newMessage: {
    type: Boolean,
    default: true
  },
  // Thông báo khi có comment mới
  newComment: {
    type: Boolean,
    default: true
  },
  // Thông báo khi có review mới
  newReview: {
    type: Boolean,
    default: true
  },
  // Thông báo khi sản phẩm được duyệt
  productApproved: {
    type: Boolean,
    default: true
  },
  // Thông báo khi sản phẩm bị từ chối
  productRejected: {
    type: Boolean,
    default: true
  },
  // Thông báo thanh toán
  paymentNotification: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// userId already has unique: true, which creates index automatically

module.exports = mongoose.model('NotificationSettings', notificationSettingsSchema);

