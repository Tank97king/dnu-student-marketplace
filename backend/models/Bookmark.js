const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema({
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
  tags: [{
    type: String,
    trim: true
  }],
  notes: {
    type: String,
    trim: true,
    maxlength: 500
  }
}, {
  timestamps: true
});

bookmarkSchema.index({ userId: 1, productId: 1 }, { unique: true });
bookmarkSchema.index({ userId: 1, tags: 1 });

module.exports = mongoose.model('Bookmark', bookmarkSchema);

