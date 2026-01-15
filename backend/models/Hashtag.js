const mongoose = require('mongoose');

const hashtagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  postCount: {
    type: Number,
    default: 0
  },
  posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  }],
  lastUsedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
hashtagSchema.index({ name: 1 });
hashtagSchema.index({ postCount: -1 });
hashtagSchema.index({ lastUsedAt: -1 });

// Update postCount when posts array changes
hashtagSchema.pre('save', function(next) {
  if (this.isModified('posts')) {
    this.postCount = this.posts.length;
    this.lastUsedAt = new Date();
  }
  next();
});

module.exports = mongoose.model('Hashtag', hashtagSchema);

