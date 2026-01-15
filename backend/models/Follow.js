const mongoose = require('mongoose');

const followSchema = new mongoose.Schema({
  followerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  followingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Prevent self-follow
followSchema.pre('save', function(next) {
  if (this.followerId.toString() === this.followingId.toString()) {
    return next(new Error('Cannot follow yourself'));
  }
  next();
});

// Compound unique index to prevent duplicate follows
followSchema.index({ followerId: 1, followingId: 1 }, { unique: true });

// Indexes for queries
followSchema.index({ followerId: 1 });
followSchema.index({ followingId: 1 });

module.exports = mongoose.model('Follow', followSchema);

