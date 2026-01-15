const mongoose = require('mongoose');

const collectionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  coverImage: {
    type: String,
    default: ''
  },
  posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  postCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes
collectionSchema.index({ userId: 1, createdAt: -1 });
collectionSchema.index({ isPublic: 1 });

// Update postCount when posts array changes
collectionSchema.pre('save', function(next) {
  if (this.isModified('posts')) {
    this.postCount = this.posts.length;
    // Set coverImage to first post's image if not set
    if (!this.coverImage && this.posts.length > 0) {
      // This will be handled in controller
    }
  }
  next();
});

module.exports = mongoose.model('Collection', collectionSchema);

