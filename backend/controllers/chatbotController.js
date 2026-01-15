const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const path = require('path');

// Đảm bảo đọc .env từ thư mục backend
dotenv.config({ path: path.join(__dirname, '../.env') });

// Khởi tạo Gemini AI
let genAI;
let model;

// Hàm khởi tạo Gemini AI (có thể gọi lại nếu cần)
const initializeGemini = () => {
  try {
    // Đảm bảo đọc lại .env mỗi lần gọi (để xử lý trường hợp thêm API key sau khi server đã chạy)
    dotenv.config({ path: path.join(__dirname, '../.env') });
    
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.warn('⚠️ GEMINI_API_KEY not found in .env file');
      console.warn('   Current working directory:', process.cwd());
      console.warn('   Looking for .env at:', path.join(__dirname, '../.env'));
      return false;
    }

    if (!apiKey.trim()) {
      console.warn('⚠️ GEMINI_API_KEY is empty');
      return false;
    }

    genAI = new GoogleGenerativeAI(apiKey.trim());
    // Sử dụng model gemini-2.5-flash (model mới nhất, nhanh và mạnh)
    model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    console.log('✅ Gemini AI initialized successfully with model: gemini-2.5-flash');
    console.log('⚠️  Nếu gặp lỗi 404, vui lòng kích hoạt Generative Language API tại:');
    console.log('   https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com');
    return true;
  } catch (error) {
    console.error('❌ Error initializing Gemini AI:', error);
    return false;
  }
};

// Khởi tạo lần đầu khi load module
initializeGemini();

// Lưu trữ lịch sử chat theo session (có thể nâng cấp lên database sau)
const chatHistory = new Map();

// Hàm xử lý chat
const chatWithGemini = async (req, res) => {
  try {
    // Kiểm tra và khởi tạo lại nếu cần (để xử lý trường hợp thêm API key sau khi server đã chạy)
    if (!genAI || !model) {
      console.log('🔄 Attempting to reinitialize Gemini AI...');
      const initialized = initializeGemini();
      
      if (!initialized || !genAI || !model) {
        console.error('❌ Failed to initialize Gemini AI. API Key:', process.env.GEMINI_API_KEY ? 'Present but invalid' : 'Missing');
        return res.status(500).json({
          success: false,
          message: 'Chatbot chưa được cấu hình. Vui lòng kiểm tra GEMINI_API_KEY trong file .env và khởi động lại server.'
        });
      }
    }

    const { message, sessionId } = req.body;

    // Validate input
    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập tin nhắn'
      });
    }

    const userMessage = message.trim();
    const currentSessionId = sessionId || 'default';

    // Lấy lịch sử chat của session (nếu có)
    let history = chatHistory.get(currentSessionId) || [];

    // Tạo prompt với context về ứng dụng
    const systemPrompt = `Bạn là một chatbot hỗ trợ thân thiện cho ứng dụng mua bán đồ dùng cũ của sinh viên Đại học Đại Nam.
    
Nhiệm vụ của bạn:
- Hỗ trợ người dùng tìm hiểu về cách sử dụng ứng dụng
- Hướng dẫn cách đăng bán sản phẩm
- Hướng dẫn cách mua hàng và thanh toán
- Trả lời các câu hỏi về chính sách, quy định
- Giúp đỡ người dùng khi gặp vấn đề

Hãy trả lời một cách:
- Thân thiện, nhiệt tình
- Ngắn gọn, dễ hiểu
- Chuyên nghiệp nhưng gần gũi
- Bằng tiếng Việt

Nếu không biết câu trả lời, hãy thành thật và hướng dẫn người dùng liên hệ với quản trị viên.`;

    // Chuẩn bị lịch sử chat
    // Nếu chưa có lịch sử, thêm system prompt
    if (history.length === 0) {
      history.push({
        role: 'user',
        parts: [{ text: systemPrompt }]
      });
      history.push({
        role: 'model',
        parts: [{ text: 'Xin chào! 👋 Tôi là chatbot hỗ trợ của bạn. Tôi có thể giúp gì cho bạn hôm nay?' }]
      });
    }

    // Thêm tin nhắn của user vào lịch sử
    history.push({
      role: 'user',
      parts: [{ text: userMessage }]
    });

    // Giới hạn lịch sử để tránh quá dài (giữ 20 tin nhắn gần nhất)
    if (history.length > 20) {
      history = history.slice(-20);
    }

    // Gửi request đến Gemini với fallback nếu model không hoạt động
    let result;
    let response;
    let text;
    
    try {
      const chat = model.startChat({
        history: history.slice(0, -1) // Bỏ tin nhắn cuối (tin nhắn hiện tại)
      });
      result = await chat.sendMessage(userMessage);
      response = await result.response;
      text = response.text();
    } catch (modelError) {
      // Nếu model hiện tại không hoạt động (404), thử model khác
      if (modelError.status === 404 || modelError.message?.includes('not found')) {
        console.warn('⚠️ Model không hoạt động, đang thử model khác...');
        
        // Thử các model khác (ưu tiên gemini-2.5-flash và các model tương tự)
        const alternativeModels = ['gemini-2.5-flash', 'models/gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];
        let success = false;
        
        for (const altModel of alternativeModels) {
          try {
            console.log(`🔄 Thử model: ${altModel}`);
            const altGenAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY.trim());
            const altModelInstance = altGenAI.getGenerativeModel({ model: altModel });
            const chat = altModelInstance.startChat({
              history: history.slice(0, -1)
            });
            result = await chat.sendMessage(userMessage);
            response = await result.response;
            text = response.text();
            
            // Nếu thành công, cập nhật model chính
            model = altModelInstance;
            console.log(`✅ Đã chuyển sang model: ${altModel}`);
            success = true;
            break;
          } catch (altError) {
            console.warn(`❌ Model ${altModel} cũng không hoạt động`);
            console.warn(`   Error: ${altError.message}`);
            console.warn(`   Status: ${altError.status || 'N/A'}`);
            continue;
          }
        }
        
        if (!success) {
          throw new Error('Không tìm thấy model nào hoạt động. Vui lòng kiểm tra API key và quyền truy cập.');
        }
      } else {
        throw modelError;
      }
    }

    // Thêm phản hồi của AI vào lịch sử
    history.push({
      role: 'model',
      parts: [{ text: text }]
    });

    // Lưu lịch sử
    chatHistory.set(currentSessionId, history);

    // Trả về kết quả
    res.status(200).json({
      success: true,
      message: text,
      sessionId: currentSessionId
    });

  } catch (error) {
    // Log chi tiết lỗi để debug
    console.error('\n========== CHATBOT ERROR DETAILS ==========');
    console.error('Error Type:', error.constructor.name);
    console.error('Error Message:', error.message);
    console.error('Error Status:', error.status || 'N/A');
    console.error('Error Status Text:', error.statusText || 'N/A');
    
    // Log API key (một phần để debug)
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      console.error('API Key (first 15 chars):', apiKey.substring(0, 15) + '...');
      console.error('API Key Length:', apiKey.length);
    } else {
      console.error('❌ API Key: NOT FOUND');
    }
    
    // Log model đang sử dụng
    console.error('Model đang sử dụng:', model ? 'gemini-2.5-flash' : 'NOT INITIALIZED');
    
    // Log error details nếu có
    if (error.errorDetails) {
      console.error('Error Details:', JSON.stringify(error.errorDetails, null, 2));
    }
    
    // Log stack trace trong development
    if (process.env.NODE_ENV === 'development') {
      console.error('Stack Trace:', error.stack);
    }
    
    // Log request info
    console.error('Request Body:', JSON.stringify(req.body, null, 2));
    console.error('==========================================\n');
    
    // Xử lý các lỗi cụ thể
    let errorMessage = 'Có lỗi xảy ra khi xử lý tin nhắn. Vui lòng thử lại sau.';
    let errorCode = 'UNKNOWN_ERROR';
    
    // Kiểm tra lỗi API key
    if (error.status === 400 && error.errorDetails) {
      const errorInfo = error.errorDetails.find(detail => detail.reason === 'API_KEY_INVALID');
      if (errorInfo) {
        errorCode = 'API_KEY_INVALID';
        errorMessage = 'API key không hợp lệ. Vui lòng kiểm tra lại GEMINI_API_KEY trong file .env và đảm bảo API key còn hiệu lực.';
      }
    } else if (error.status === 403) {
      errorCode = 'API_KEY_FORBIDDEN';
      errorMessage = 'API key không có quyền truy cập. Vui lòng kiểm tra API key và đảm bảo Generative Language API đã được kích hoạt.';
    } else if (error.status === 404) {
      errorCode = 'MODEL_NOT_FOUND';
      errorMessage = 'Model không tìm thấy. Có thể model không được hỗ trợ hoặc API key không có quyền truy cập model này.';
    } else if (error.message?.includes('API_KEY') || error.message?.includes('API key not valid')) {
      errorCode = 'API_KEY_INVALID';
      errorMessage = 'API key không hợp lệ. Vui lòng kiểm tra lại GEMINI_API_KEY trong file .env.';
    } else if (error.message?.includes('quota') || error.message?.includes('limit')) {
      errorCode = 'QUOTA_EXCEEDED';
      errorMessage = 'Đã vượt quá giới hạn sử dụng. Vui lòng thử lại sau.';
    } else if (error.message?.includes('not found') || error.message?.includes('404')) {
      errorCode = 'MODEL_NOT_FOUND';
      errorMessage = 'Model không tìm thấy. Vui lòng kiểm tra model name và API key.';
    }

    res.status(error.status || 500).json({
      success: false,
      message: errorMessage,
      errorCode: errorCode,
      error: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        status: error.status,
        statusText: error.statusText,
        details: error.errorDetails,
        apiKeyPrefix: apiKey ? apiKey.substring(0, 10) + '...' : 'NOT FOUND',
        model: 'gemini-2.5-flash'
      } : undefined
    });
  }
};

// Hàm xóa lịch sử chat
const clearChatHistory = (req, res) => {
  try {
    const { sessionId } = req.body;
    const currentSessionId = sessionId || 'default';
    
    chatHistory.delete(currentSessionId);
    
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

