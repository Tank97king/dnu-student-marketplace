const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    default: null
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    default: null
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Vui lòng nhập nội dung bình luận'],
    trim: true
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  likeCount: {
    type: Number,
    default: 0
  },
  replies: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    content: String,
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Ensure either productId or postId is provided
commentSchema.pre('validate', function(next) {
  if (!this.productId && !this.postId) {
    return next(new Error('Either productId or postId must be provided'));
  }
  if (this.productId && this.postId) {
    return next(new Error('Cannot have both productId and postId'));
  }
  next();
});

commentSchema.index({ productId: 1 });
commentSchema.index({ postId: 1 });
commentSchema.index({ userId: 1 });

// Update likeCount when likes array changes
commentSchema.pre('save', function(next) {
  if (this.isModified('likes')) {
    this.likeCount = this.likes.length;
  }
  next();
});

module.exports = mongoose.model('Comment', commentSchema);








