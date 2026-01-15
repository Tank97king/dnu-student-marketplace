const express = require('express');
const {
  register,
  verifyEmail,
  verifyOTP,
  resendVerificationCode,
  login,
  getMe,
  forgotPassword,
  verifyOTPAndResetPassword,
  requestChangePassword,
  verifyOTPAndChangePassword,
  logout
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateVerifyOTP
} = require('../middleware/validators/authValidator');

const router = express.Router();

// Apply rate limiting và validation cho auth routes
router.post('/register', authLimiter, validateRegister, register);
router.post('/verify-otp', validateVerifyOTP, verifyOTP);
router.post('/resend-verification', authLimiter, resendVerificationCode);
router.get('/verify/:token', verifyEmail); // Legacy endpoint
router.post('/login', authLimiter, validateLogin, login);
router.post('/forgotpassword', authLimiter, validateForgotPassword, forgotPassword);
router.post('/verify-otp-reset-password', authLimiter, validateVerifyOTP, verifyOTPAndResetPassword);

// Protected routes
router.get('/me', protect, getMe);
router.post('/request-change-password', protect, requestChangePassword);
router.post('/verify-otp-change-password', protect, verifyOTPAndChangePassword);
router.post('/logout', protect, logout);

module.exports = router;








