const mongoose = require('mongoose');

const pendingRegistrationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    match: [/@dnu\.edu\.vn$/, 'Email phải có đuôi @dnu.edu.vn']
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  address: {
    type: String,
    trim: true
  },
  studentId: {
    type: String,
    trim: true
  },
  verificationCode: {
    type: String,
    required: true
  },
  verificationCodeExpire: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

// Index for faster queries
pendingRegistrationSchema.index({ email: 1 });
pendingRegistrationSchema.index({ phone: 1 });
pendingRegistrationSchema.index({ verificationCodeExpire: 1 });

module.exports = mongoose.model('PendingRegistration', pendingRegistrationSchema);

