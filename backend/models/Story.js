const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mediaType: {
    type: String,
    enum: ['image', 'video'],
    required: true
  },
  mediaUrl: {
    type: String,
    required: true
  },
  text: {
    type: String,
    trim: true,
    maxlength: 200
  },
  stickers: [{
    type: {
      type: String,
      enum: ['emoji', 'image', 'text']
    },
    content: String,
    position: {
      x: Number,
      y: Number
    }
  }],
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
  },
  views: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    viewedAt: {
      type: Date,
      default: Date.now
    }
  }],
  viewCount: {
    type: Number,
    default: 0
  },
  reactions: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    emoji: {
      type: String,
      default: '❤️'
    },
    reactedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isHighlight: {
    type: Boolean,
    default: false
  },
  highlightTitle: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes
storySchema.index({ userId: 1, createdAt: -1 });
storySchema.index({ expiresAt: 1 });
storySchema.index({ isHighlight: 1, userId: 1 });

// Update viewCount when views array changes
storySchema.pre('save', function(next) {
  if (this.isModified('views')) {
    this.viewCount = this.views.length;
  }
  next();
});

// Auto-delete expired stories (can be handled by cron job)
storySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Story', storySchema);

