const mongoose = require('mongoose');

const pendingPasswordResetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  newPassword: {
    type: String,
    required: true,
    minlength: 6
  },
  verificationCode: {
    type: String,
    required: true
  },
  verificationCodeExpire: {
    type: Date,
    required: true
  },
  type: {
    type: String,
    enum: ['forgot', 'change'], // forgot = quên mật khẩu, change = đổi mật khẩu
    required: true
  }
}, {
  timestamps: true
});

// Index for faster queries and cleanup
pendingPasswordResetSchema.index({ email: 1 });
pendingPasswordResetSchema.index({ userId: 1 });
pendingPasswordResetSchema.index({ verificationCodeExpire: 1 });

module.exports = mongoose.model('PendingPasswordReset', pendingPasswordResetSchema);

