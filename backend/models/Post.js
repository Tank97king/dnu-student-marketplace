const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    default: null // Optional - có thể đăng không cần tạo product
  },
  images: [{
    type: String
  }],
  videos: [{
    type: String
  }],
  caption: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  hashtags: [{
    type: String,
    trim: true
  }],
  mentions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  location: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    min: 0
  },
  category: {
    type: String,
    enum: ['Books', 'Electronics', 'Furniture', 'Clothing', 'Stationery', 'Sports', 'Other']
  },
  condition: {
    type: String,
    enum: [
      // Giá trị mới (tiếng Việt)
      'Rất tốt', 'Tốt', 'Khá', 'Đã dùng nhiều', 'Cần sửa chữa',
      // Giá trị cũ (tiếng Anh) - để tương thích ngược
      'New', 'Like New', 'Excellent', 'Good', 'Fair', 'Used', 'NeedsRepair'
    ]
  },
  status: {
    type: String,
    enum: ['available', 'sold', 'pending'],
    default: 'available'
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  likeCount: {
    type: Number,
    default: 0
  },
  commentCount: {
    type: Number,
    default: 0
  },
  shareCount: {
    type: Number,
    default: 0
  },
  viewCount: {
    type: Number,
    default: 0
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  reports: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String,
    reportedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes
postSchema.index({ userId: 1, createdAt: -1 });
postSchema.index({ category: 1, createdAt: -1 });
postSchema.index({ hashtags: 1 });
postSchema.index({ status: 1, isApproved: 1, createdAt: -1 });
postSchema.index({ caption: 'text', hashtags: 'text' });

// Update likeCount when likes array changes
postSchema.pre('save', function(next) {
  if (this.isModified('likes')) {
    this.likeCount = this.likes.length;
  }
  next();
});

module.exports = mongoose.model('Post', postSchema);

