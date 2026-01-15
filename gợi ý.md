# Hướng Dẫn Phát Triển Chatbot AI với Google Gemini

## 📋 Tổng Quan

Hướng dẫn này sẽ giúp bạn tích hợp chatbot AI sử dụng Google Gemini API vào ứng dụng web của bạn.

## ⚡ Hướng Dẫn Nhanh (Quick Start)

**Các file đã được tạo sẵn, bạn chỉ cần:**

1. **Cài đặt package:**
   ```bash
   cd backend
   npm install @google/generative-ai
   ```

2. **Thêm API Key vào `.env`:**
   - Mở file `backend/.env` (tạo mới nếu chưa có)
   - Thêm dòng: `GEMINI_API_KEY=AlzaSyBMcbLcbPew_JZ5TfKZqMLubryDOzrgBRA`
   - ⚠️ **LƯU Ý:** Thay bằng API key thực tế của bạn (từ hình ảnh bạn đã gửi)

3. **Khởi động lại server:**
   ```bash
   # Dừng server hiện tại (Ctrl+C)
   # Sau đó chạy lại
   npm start
   ```

4. **Kiểm tra:**
   - Mở trình duyệt
   - Click vào nút chatbot ở góc dưới bên phải
   - Gửi tin nhắn test!

---

## 🚀 Bước 1: Lấy API Key từ Google Gemini

1. Truy cập: https://makersuite.google.com/app/apikey
2. Đăng nhập bằng tài khoản Google
3. Tạo API key mới
4. Copy API key và lưu lại (sẽ cần dùng sau)

---

## 🔧 Bước 2: Cài Đặt Dependencies

### Backend (Node.js)

Mở terminal trong thư mục `backend` và chạy:

```bash
npm install @google/generative-ai
```

### Frontend

Không cần cài thêm package, sẽ dùng axios (đã có sẵn) để gọi API backend.

---

## 📁 Bước 3: Cấu Hình Backend

### 3.1. Thêm API Key vào .env

Mở file `backend/.env` (hoặc tạo mới nếu chưa có) và thêm:

```env
GEMINI_API_KEY=your_api_key_here
```

**⚠️ LƯU Ý:** Thay `your_api_key_here` bằng API key bạn đã lấy ở Bước 1.

### 3.2. Tạo Controller cho Chatbot

Tạo file `backend/controllers/chatbotController.js`:

```javascript
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');

dotenv.config();

// Khởi tạo Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Lấy model Gemini
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

// Lưu trữ lịch sử chat theo session (có thể dùng Redis hoặc database)
const chatHistory = new Map();

// Hàm xử lý chat
const chatWithGemini = async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    // Validate input
    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập tin nhắn'
      });
    }

    // Lấy lịch sử chat của session (nếu có)
    let history = chatHistory.get(sessionId) || [];

    // Thêm tin nhắn của user vào lịch sử
    history.push({
      role: 'user',
      parts: [{ text: message }]
    });

    // Giới hạn lịch sử để tránh quá dài (giữ 10 tin nhắn gần nhất)
    if (history.length > 20) {
      history = history.slice(-20);
    }

    // Tạo prompt với context (tùy chỉnh theo nhu cầu)
    const systemPrompt = `Bạn là một chatbot hỗ trợ cho ứng dụng mua bán đồ dùng cũ của sinh viên.
    Hãy trả lời một cách thân thiện, hữu ích và chuyên nghiệp.
    Nếu được hỏi về sản phẩm, hãy hướng dẫn người dùng cách tìm kiếm và mua hàng.
    Trả lời bằng tiếng Việt.`;

    // Gửi request đến Gemini
    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: systemPrompt }]
        },
        {
          role: 'model',
          parts: [{ text: 'Xin chào! Tôi là chatbot hỗ trợ của bạn. Tôi có thể giúp gì cho bạn?' }]
        },
        ...history.slice(0, -1) // Bỏ tin nhắn cuối (tin nhắn hiện tại)
      ]
    });

    // Gửi tin nhắn và nhận phản hồi
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    // Thêm phản hồi của AI vào lịch sử
    history.push({
      role: 'model',
      parts: [{ text: text }]
    });

    // Lưu lịch sử
    chatHistory.set(sessionId || 'default', history);

    // Trả về kết quả
    res.status(200).json({
      success: true,
      message: text,
      sessionId: sessionId || 'default'
    });

  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi xử lý tin nhắn. Vui lòng thử lại sau.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Hàm xóa lịch sử chat
const clearChatHistory = (req, res) => {
  try {
    const { sessionId } = req.body;
    chatHistory.delete(sessionId || 'default');
    
    res.status(200).json({
      success: true,
      message: 'Đã xóa lịch sử chat'
    });
  } catch (error) {
    console.error('Clear history error:', error);
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi xóa lịch sử'
    });
  }
};

module.exports = {
  chatWithGemini,
  clearChatHistory
};
```

### 3.3. Tạo Routes cho Chatbot

Tạo file `backend/routes/chatbot.js`:

```javascript
const express = require('express');
const router = express.Router();
const { chatWithGemini, clearChatHistory } = require('../controllers/chatbotController');
const auth = require('../middleware/auth'); // Nếu muốn yêu cầu đăng nhập

// Route chat với AI (có thể bỏ auth nếu muốn cho phép chat không cần đăng nhập)
router.post('/chat', chatWithGemini);

// Route xóa lịch sử chat
router.post('/clear-history', clearChatHistory);

module.exports = router;
```

### 3.4. Thêm Route vào server.js

Mở file `backend/server.js` và thêm:

```javascript
// Thêm vào phần import routes (khoảng dòng 34)
const chatbotRoutes = require('./routes/chatbot');

// Thêm vào phần sử dụng routes (khoảng dòng 173)
app.use('/api/chatbot', chatbotRoutes);
```

---

## 🎨 Bước 4: Tạo Frontend Component

### 4.1. Tạo Component Chatbot

Tạo file `frontend/src/components/Chatbot.jsx`:

```jsx
import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const Chatbot = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Xin chào! Tôi là chatbot hỗ trợ của bạn. Tôi có thể giúp gì cho bạn?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const sessionId = useRef(`session-${Date.now()}`);

  // Auto scroll to bottom khi có tin nhắn mới
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Gửi tin nhắn
  const handleSend = async (e) => {
    e.preventDefault();
    
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    
    // Thêm tin nhắn của user vào UI
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/chatbot/chat`,
        {
          message: userMessage,
          sessionId: sessionId.current
        }
      );

      if (response.data.success) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: response.data.message 
        }]);
      } else {
        throw new Error(response.data.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Xóa lịch sử chat
  const handleClear = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/chatbot/clear-history`,
        { sessionId: sessionId.current }
      );
      
      setMessages([
        {
          role: 'assistant',
          content: 'Xin chào! Tôi là chatbot hỗ trợ của bạn. Tôi có thể giúp gì cho bạn?'
        }
      ]);
    } catch (error) {
      console.error('Clear history error:', error);
    }
  };

  return (
    <>
      {/* Nút mở chatbot (floating button) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-300 z-50"
          aria-label="Mở chatbot"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-lg shadow-2xl flex flex-col z-50 border border-gray-200">
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-lg">Chatbot Hỗ Trợ</h3>
              <p className="text-xs text-blue-100">Trực tuyến</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleClear}
                className="p-2 hover:bg-blue-700 rounded transition-colors"
                title="Xóa lịch sử"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-blue-700 rounded transition-colors"
                aria-label="Đóng chatbot"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-800 border border-gray-200'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Nhập tin nhắn..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default Chatbot;
```

### 4.2. Thêm Chatbot vào App.jsx

Mở file `frontend/src/App.jsx` và thêm component Chatbot:

```jsx
// Thêm import
import Chatbot from './components/Chatbot';

// Thêm vào trong return của component (thường ở cuối, trước thẻ đóng)
<Chatbot />
```

---

## 🔐 Bước 5: Cấu Hình Environment Variables

### Backend (.env)

Đảm bảo file `backend/.env` có:

```env
GEMINI_API_KEY=your_api_key_here
PORT=5000
MONGODB_URI=your_mongodb_uri
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)

Đảm bảo file `frontend/.env` có:

```env
VITE_API_URL=http://localhost:5000
```

---

## 🧪 Bước 6: Test Chatbot

1. **Khởi động Backend:**
   ```bash
   cd backend
   npm start
   ```

2. **Khởi động Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Kiểm tra:**
   - Mở trình duyệt và truy cập ứng dụng
   - Click vào nút chatbot ở góc dưới bên phải
   - Gửi tin nhắn test: "Xin chào"
   - Kiểm tra xem có nhận được phản hồi từ AI không

---

## 🎯 Tùy Chỉnh Nâng Cao

### 1. Lưu Lịch Sử Chat vào Database

Thay vì dùng `Map` trong memory, bạn có thể lưu vào MongoDB:

```javascript
// Tạo model ChatHistory
const ChatHistory = require('./models/ChatHistory');

// Trong controller, thay vì Map:
const history = await ChatHistory.findOne({ sessionId }) || { messages: [] };
// ... xử lý ...
await ChatHistory.findOneAndUpdate(
  { sessionId },
  { messages: history, updatedAt: new Date() },
  { upsert: true }
);
```

### 2. Thêm Context về Sản Phẩm

Bạn có thể cung cấp thông tin sản phẩm cho AI:

```javascript
// Trong controller, trước khi gửi đến Gemini:
const products = await Product.find({ /* điều kiện */ }).limit(5);
const productContext = products.map(p => `${p.name}: ${p.price}đ`).join('\n');

const enhancedPrompt = `${systemPrompt}\n\nSản phẩm hiện có:\n${productContext}`;
```

### 3. Rate Limiting

Thêm rate limiting để tránh spam:

```javascript
const rateLimit = require('express-rate-limit');

const chatbotLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 phút
  max: 10 // tối đa 10 requests/phút
});

router.post('/chat', chatbotLimiter, chatWithGemini);
```

### 4. Streaming Response (Real-time)

Để hiển thị response theo thời gian thực:

```javascript
// Backend - sử dụng Server-Sent Events hoặc WebSocket
// Frontend - xử lý stream response
```

---

## ⚠️ Lưu Ý Quan Trọng

1. **Bảo mật API Key:**
   - ❌ KHÔNG commit file `.env` lên Git
   - ✅ Thêm `.env` vào `.gitignore`
   - ✅ Sử dụng biến môi trường trên server production

2. **Giới hạn API:**
   - Google Gemini có giới hạn số requests miễn phí
   - Cân nhắc thêm rate limiting
   - Monitor usage để tránh vượt quota

3. **Error Handling:**
   - Luôn xử lý lỗi một cách graceful
   - Hiển thị thông báo thân thiện cho user
   - Log lỗi để debug

4. **Performance:**
   - Lưu lịch sử chat vào database thay vì memory
   - Giới hạn độ dài lịch sử chat
   - Cache responses nếu cần

---

## 📚 Tài Liệu Tham Khảo

- [Google Gemini API Documentation](https://ai.google.dev/docs)
- [@google/generative-ai npm package](https://www.npmjs.com/package/@google/generative-ai)
- [Gemini Pro Model Guide](https://ai.google.dev/models/gemini)

---

## 🐛 Troubleshooting

### Lỗi: "API key not valid"
- Kiểm tra lại API key trong file `.env`
- Đảm bảo đã restart server sau khi thay đổi `.env`

### Lỗi: "Module not found"
- Chạy `npm install @google/generative-ai` trong thư mục backend
- Kiểm tra `package.json` đã có dependency chưa

### Chatbot không phản hồi
- Kiểm tra console log của backend
- Kiểm tra network tab trong browser DevTools
- Đảm bảo API key còn hiệu lực

### Lỗi CORS
- Kiểm tra `FRONTEND_URL` trong backend `.env`
- Đảm bảo frontend URL đúng trong CORS config

---

## ✅ Checklist Hoàn Thành

- [ ] Đã lấy API key từ Google Gemini
- [ ] Đã cài đặt `@google/generative-ai` package
- [ ] Đã thêm `GEMINI_API_KEY` vào `.env`
- [ ] Đã tạo `chatbotController.js`
- [ ] Đã tạo `chatbot.js` route
- [ ] Đã thêm route vào `server.js`
- [ ] Đã tạo component `Chatbot.jsx`
- [ ] Đã thêm Chatbot vào `App.jsx`
- [ ] Đã test chatbot hoạt động
- [ ] Đã kiểm tra error handling

---

Chúc bạn thành công! 🎉

