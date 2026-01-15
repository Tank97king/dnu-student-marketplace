const mongoose = require('mongoose');

const searchHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  searchTerm: {
    type: String,
    required: true,
    trim: true
  },
  filters: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  resultCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for faster queries
searchHistorySchema.index({ userId: 1, createdAt: -1 });
searchHistorySchema.index({ searchTerm: 1 });

module.exports = mongoose.model('SearchHistory', searchHistorySchema);

