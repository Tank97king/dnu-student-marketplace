const rateLimit = require('express-rate-limit');

// Rate limiter cho authentication (login, register, forgot password)
exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 5, // 5 requests mỗi 15 phút
  message: {
    success: false,
    message: 'Quá nhiều lần thử. Vui lòng thử lại sau 15 phút.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting trong development mode (tùy chọn)
    return process.env.NODE_ENV === 'development' && req.ip === '::1';
  }
});

// Rate limiter cho payment APIs
exports.paymentLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 phút
  max: 10, // 10 requests mỗi phút
  message: {
    success: false,
    message: 'Quá nhiều yêu cầu thanh toán. Vui lòng thử lại sau.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter cho API chung
exports.apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 phút
  max: 100, // 100 requests mỗi phút
  message: {
    success: false,
    message: 'Quá nhiều requests. Vui lòng thử lại sau.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter cho upload files
exports.uploadLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 phút
  max: 20, // 20 uploads mỗi phút
  message: {
    success: false,
    message: 'Quá nhiều yêu cầu upload. Vui lòng thử lại sau.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
