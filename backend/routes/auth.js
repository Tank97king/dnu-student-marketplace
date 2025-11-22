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

const router = express.Router();

router.post('/register', register);
router.post('/verify-otp', verifyOTP);
router.post('/resend-verification', resendVerificationCode);
router.get('/verify/:token', verifyEmail); // Legacy endpoint
router.post('/login', login);
router.post('/forgotpassword', forgotPassword);
router.post('/verify-otp-reset-password', verifyOTPAndResetPassword);

// Protected routes
router.get('/me', protect, getMe);
router.post('/request-change-password', protect, requestChangePassword);
router.post('/verify-otp-change-password', protect, verifyOTPAndChangePassword);
router.post('/logout', protect, logout);

module.exports = router;








