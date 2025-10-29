const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversationId: {
    type: String,
    required: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  content: {
    type: String,
    trim: true,
    default: ''
  },
  isRead: {
    type: Boolean,
    default: false
  },
  offerPrice: {
    type: Number,
    min: 0
  },
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    url: String
  }]
}, {
  timestamps: true
});

// Custom validation: require either content or attachments
messageSchema.pre('validate', function(next) {
  if (!this.content && (!this.attachments || this.attachments.length === 0)) {
    next(new Error('Message must have either content or attachments'));
  } else {
    next();
  }
});

messageSchema.index({ senderId: 1, receiverId: 1 });
messageSchema.index({ conversationId: 1 });

module.exports = mongoose.model('Message', messageSchema);



