const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'product_approved', 
      'product_rejected', 
      'new_message', 
      'new_comment',
      'new_review',
      'new_offer',
      'offer_accepted',
      'offer_rejected',
      'offer_countered',
      'product_interested',
      'product_favorited',
      'user_followed',
      'favorite_price_drop',
      'review_reminder',
      'product_trending',
      'payment_pending_review',
      'payment_confirmed',
      'payment_rejected',
      'order_expired',
      'offer_expired',
      'payment_expired'
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  }
}, {
  timestamps: true
});

notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);



