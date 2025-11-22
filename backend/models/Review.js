const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  reviewerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviewedUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    trim: true
  },
  images: [{
    type: String // URLs to uploaded images
  }],
  isSeller: {
    type: Boolean,
    required: true
  }
}, {
  timestamps: true
});

reviewSchema.index({ reviewedUserId: 1 });
reviewSchema.index({ transactionId: 1 });
reviewSchema.index({ orderId: 1 });
reviewSchema.index({ productId: 1 });

module.exports = mongoose.model('Review', reviewSchema);








