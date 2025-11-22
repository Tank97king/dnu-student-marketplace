const mongoose = require('mongoose');

const productViewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  viewedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index để query nhanh và tránh duplicate views trong cùng ngày
productViewSchema.index({ userId: 1, productId: 1, createdAt: -1 });
productViewSchema.index({ productId: 1, createdAt: -1 });
productViewSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('ProductView', productViewSchema);

