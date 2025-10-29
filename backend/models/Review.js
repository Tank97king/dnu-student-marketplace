const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true
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
  isSeller: {
    type: Boolean,
    required: true
  }
}, {
  timestamps: true
});

reviewSchema.index({ reviewedUserId: 1 });
reviewSchema.index({ transactionId: 1 });

module.exports = mongoose.model('Review', reviewSchema);








