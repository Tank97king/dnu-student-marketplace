const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Vui lòng nhập tiêu đề'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Vui lòng nhập mô tả'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Vui lòng nhập giá'],
    min: 0
  },
  category: {
    type: String,
    required: [true, 'Vui lòng chọn danh mục'],
    enum: ['Books', 'Electronics', 'Furniture', 'Clothing', 'Stationery', 'Sports', 'Other']
  },
  condition: {
    type: String,
    required: [true, 'Vui lòng chọn tình trạng'],
    enum: [
      // Giá trị mới (tiếng Việt)
      'Rất tốt', 'Tốt', 'Khá', 'Đã dùng nhiều', 'Cần sửa chữa',
      // Giá trị cũ (tiếng Anh) - để tương thích ngược
      'New', 'Like New', 'Excellent', 'Good', 'Fair', 'Used', 'NeedsRepair'
    ]
  },
  images: [{
    type: String
  }],
  tags: [{
    type: String,
    trim: true
  }],
  location: {
    type: String,
    required: [true, 'Vui lòng chọn khu vực'],
    enum: ['Campus', 'Dormitory', 'Nearby']
  },
  status: {
    type: String,
    enum: ['Available', 'Sold', 'Deleted'],
    default: 'Available'
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  viewCount: {
    type: Number,
    default: 0
  },
  favoriteCount: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  comments: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    content: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
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
  }],
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    default: null
  },
  likeCount: {
    type: Number,
    default: 0
  },
  shareCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for search
productSchema.index({ title: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ location: 1 });
productSchema.index({ status: 1 });
productSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Product', productSchema);





