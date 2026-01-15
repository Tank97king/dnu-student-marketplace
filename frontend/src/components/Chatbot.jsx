import { useState, useRef, useEffect } from 'react';
import api from '../utils/api';

const Chatbot = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Xin chào! 👋 Tôi là chatbot hỗ trợ của bạn. Tôi có thể giúp gì cho bạn hôm nay?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const sessionId = useRef(`session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

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
      const response = await api.post('/chatbot/chat', {
        message: userMessage,
        sessionId: sessionId.current
      });

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
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.';
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: errorMessage 
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Xóa lịch sử chat
  const handleClear = async () => {
    try {
      await api.post('/chatbot/clear-history', { 
        sessionId: sessionId.current 
      });
      
      setMessages([
        {
          role: 'assistant',
          content: 'Xin chào! 👋 Tôi là chatbot hỗ trợ của bạn. Tôi có thể giúp gì cho bạn hôm nay?'
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
          className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-300 z-50 hover:scale-110"
          aria-label="Mở chatbot"
          title="Chat với AI"
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
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white dark:bg-gray-800 rounded-lg shadow-2xl flex flex-col z-50 border border-gray-200 dark:border-gray-700">
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
                aria-label="Xóa lịch sử chat"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-blue-700 rounded transition-colors"
                aria-label="Đóng chatbot"
                title="Đóng"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
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
          <form onSubmit={handleSend} className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-lg">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Nhập tin nhắn..."
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                disabled={loading}
                autoFocus
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Gửi tin nhắn"
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

