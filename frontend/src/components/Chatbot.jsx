import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const Chatbot = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Xin chào! 👋 Tôi là trợ lý AI của sàn đồ cũ sinh viên Đại học Đại Nam.\n\nTôi có thể giúp bạn:\n🔍 Tìm sản phẩm phù hợp\n📖 Hướng dẫn mua/bán\n📋 Giải đáp chính sách\n\nBạn cần hỗ trợ gì?'
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
          content: response.data.message,
          products: response.data.products || null
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
          content: 'Xin chào! 👋 Tôi là trợ lý AI của sàn đồ cũ sinh viên Đại học Đại Nam.\n\nTôi có thể giúp bạn:\n🔍 Tìm sản phẩm phù hợp\n📖 Hướng dẫn mua/bán\n📋 Giải đáp chính sách\n\nBạn cần hỗ trợ gì?'
        }
      ]);
    } catch (error) {
      console.error('Clear history error:', error);
    }
  };

  // Quick action buttons
  const quickActions = [
    { label: '🔍 Tìm sản phẩm', message: 'Cho mình xem các sản phẩm đang có trên sàn' },
    { label: '📖 Cách đăng bán', message: 'Hướng dẫn cách đăng bán sản phẩm' },
    { label: '💳 Thanh toán', message: 'Có những phương thức thanh toán nào?' },
    { label: '📋 Chính sách', message: 'Chính sách mua bán và quy định của sàn' },
  ];

  const handleQuickAction = (msg) => {
    setInput(msg);
  };

  return (
    <>
      {/* Nút mở chatbot (floating button) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-white dark:bg-gray-800 rounded-full p-1 shadow-2xl shadow-orange-500/30 transition-all duration-300 z-50 hover:scale-110 border-2 border-orange-100 dark:border-gray-700 group flex items-center justify-center"
          aria-label="Mở chatbot AI"
          title="Chat với AI"
          id="chatbot-open-btn"
        >
          <img 
            src="/avatars/chatbot_avatar.png" 
            alt="DNU AI" 
            className="w-14 h-14 rounded-full object-cover transition-transform duration-300 group-hover:rotate-12"
          />
          {/* Badge RAG AI */}
          <span className="absolute -top-1 -right-1 bg-gradient-to-r from-green-400 to-green-500 text-white text-[10px] font-black rounded-full w-6 h-6 flex items-center justify-center border-2 border-white dark:border-gray-800 shadow-sm">
            AI
          </span>
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div
          className="fixed bottom-6 right-6 w-96 h-[620px] bg-white dark:bg-gray-800 rounded-xl shadow-2xl flex flex-col z-50 border border-gray-200 dark:border-gray-700"
          id="chatbot-window"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-t-xl flex justify-between items-center flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img 
                  src="/avatars/chatbot_avatar.png" 
                  alt="DNU Bot" 
                  className="w-9 h-9 rounded-full object-cover border-2 border-white/30"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-orange-600"></span>
              </div>
              <div>
                <h3 className="font-semibold text-sm leading-tight">Trợ lý AI</h3>
              </div>
            </div>
            <div className="flex gap-1">
              <button
                onClick={handleClear}
                className="p-2 hover:bg-orange-600/50 rounded-lg transition-colors"
                title="Xóa lịch sử"
                aria-label="Xóa lịch sử chat"
                id="chatbot-clear-btn"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-orange-600/50 rounded-lg transition-colors"
                aria-label="Đóng chatbot"
                title="Đóng"
                id="chatbot-close-btn"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900 min-h-0">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {/* Avatar cho bot */}
                {msg.role === 'assistant' && (
                  <img 
                    src="/avatars/chatbot_avatar.png" 
                    alt="DNU Bot" 
                    className="w-7 h-7 rounded-full object-cover mr-2 mt-1 flex-shrink-0 border border-gray-200 dark:border-gray-700 shadow-sm"
                  />
                )}

                <div className={`max-w-[80%] rounded-2xl px-3 py-2.5 ${msg.role === 'user'
                  ? 'bg-orange-500 text-white rounded-br-sm'
                  : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-bl-sm shadow-sm'
                  }`}>
                  <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{msg.content}</p>

                  {/* Card sản phẩm khi bot gợi ý */}
                  {msg.role === 'assistant' && msg.products && msg.products.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">
                        🔍 {msg.products.length} sản phẩm tìm thấy:
                      </p>
                      <div className="grid grid-cols-2 gap-1.5">
                        {msg.products.slice(0, 4).map((p) => (
                          <Link
                            key={p._id}
                            to={`/products/${p._id}`}
                            onClick={() => setIsOpen(false)}
                            className="block rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden hover:shadow-md transition-all hover:border-orange-300 bg-gray-50 dark:bg-gray-700/50"
                          >
                            <div className="aspect-square w-full bg-gray-200 dark:bg-gray-600">
                              <img
                                src={p.images?.[0] || 'https://via.placeholder.com/200/e2e8f0/94a3b8?text=No+Image'}
                                alt={p.title}
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.src = 'https://via.placeholder.com/200/e2e8f0/94a3b8?text=No+Image'; }}
                              />
                            </div>
                            <div className="p-1.5">
                              <p className="text-xs font-medium line-clamp-2 text-gray-800 dark:text-gray-200 leading-tight" title={p.title}>
                                {p.title}
                              </p>
                              <p className="text-xs font-bold text-orange-600 dark:text-orange-400 mt-0.5">
                                {Number(p.price || 0).toLocaleString('vi-VN')} ₫
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                      {msg.products.length > 4 && (
                        <Link
                          to="/products"
                          onClick={() => setIsOpen(false)}
                          className="block mt-2 text-center text-xs text-orange-600 dark:text-orange-400 hover:underline"
                        >
                          Xem thêm {msg.products.length - 4} sản phẩm →
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Loading animation */}
            {loading && (
              <div className="flex justify-start items-end gap-2">
                <img 
                  src="/avatars/chatbot_avatar.png" 
                  alt="DNU Bot" 
                  className="w-7 h-7 rounded-full object-cover flex-shrink-0 border border-gray-200 dark:border-gray-700 shadow-sm"
                />
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    <span className="text-xs text-gray-400 ml-1">Đang tìm kiếm...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions (chỉ hiện khi chưa có nhiều tin nhắn) */}
          {messages.length <= 1 && !loading && (
            <div className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex-shrink-0">
              <p className="text-xs text-gray-400 mb-1.5">Gợi ý nhanh:</p>
              <div className="grid grid-cols-2 gap-1.5">
                {quickActions.map((action, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuickAction(action.message)}
                    className="text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg py-1.5 px-2 text-left hover:border-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/30 transition-colors text-gray-700 dark:text-gray-300"
                    id={`chatbot-quick-${i}`}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleSend} className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-xl flex-shrink-0">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Nhập câu hỏi..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                disabled={loading}
                autoFocus
                id="chatbot-input"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                title="Gửi"
                id="chatbot-send-btn"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
