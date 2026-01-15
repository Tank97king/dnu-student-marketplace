const express = require('express');
const router = express.Router();
const { chatWithGemini, clearChatHistory } = require('../controllers/chatbotController');
const rateLimit = require('express-rate-limit');

// Rate limiting để tránh spam
const chatbotLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 phút
  max: 20, // tối đa 20 requests/phút
  message: {
    success: false,
    message: 'Bạn đã gửi quá nhiều tin nhắn. Vui lòng đợi một chút rồi thử lại.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Route chat với AI (không cần đăng nhập để ai cũng có thể dùng)
router.post('/chat', chatbotLimiter, chatWithGemini);

// Route xóa lịch sử chat
router.post('/clear-history', clearChatHistory);

module.exports = router;

