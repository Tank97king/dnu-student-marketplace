import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import io from 'socket.io-client'
import api from '../utils/api'

export default function Chat() {
  const { user } = useSelector(state => state.auth)
  const { userId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const productId = searchParams.get('productId')
  
  const [conversations, setConversations] = useState({})
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [offerPrice, setOfferPrice] = useState('')
  const [selectedFiles, setSelectedFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState(new Set())
  const [showOfferModal, setShowOfferModal] = useState(false)
  const [socket, setSocket] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    // Initialize socket
    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000')
    setSocket(newSocket)

    // Join user room
    newSocket.emit('join-room', user.id)

    // Listen for new messages
    newSocket.on('new-message', (message) => {
      setMessages(prev => [...prev, message])
    })

    // Listen for user status changes
    newSocket.on('user-status-change', ({ userId, isOnline }) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev)
        if (isOnline) {
          newSet.add(userId)
        } else {
          newSet.delete(userId)
        }
        return newSet
      })
    })

    return () => {
      newSocket.emit('leave-room', user.id)
      newSocket.disconnect()
    }
  }, [user, navigate])

  useEffect(() => {
    loadConversations()
  }, [user])

  useEffect(() => {
    if (userId && productId) {
      // Direct chat with specific user
      const conversationId = [user.id, userId].sort().join('_')
      setSelectedConversation(conversationId)
      loadMessages(conversationId)
    }
  }, [userId, productId, user])

  const loadConversations = async () => {
    try {
      const response = await api.get('/messages/conversations')
      setConversations(response.data.data)
      setLoading(false)
    } catch (error) {
      console.error('Error loading conversations:', error)
      setLoading(false)
    }
  }

  const loadMessages = async (conversationId) => {
    try {
      const response = await api.get(`/messages/${conversationId}`)
      setMessages(response.data.data)
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if ((!newMessage.trim() && selectedFiles.length === 0) || !selectedConversation) return

    const receiverId = getReceiverId()
    console.log('Sending message:', { receiverId, productId, content: newMessage.trim(), selectedFiles })

    if (!receiverId) {
      alert('Không thể xác định người nhận')
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('receiverId', receiverId)
      if (productId) formData.append('productId', productId)
      if (newMessage.trim()) formData.append('content', newMessage.trim())
      
      selectedFiles.forEach(file => {
        formData.append('files', file)
      })

      const response = await api.post('/messages', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      setMessages(prev => [...prev, response.data.data])
      setNewMessage('')
      setSelectedFiles([])
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Không thể gửi tin nhắn: ' + (error.response?.data?.message || error.message))
    } finally {
      setUploading(false)
    }
  }

  const handleSendOffer = async () => {
    if (!offerPrice || !selectedConversation) return

    try {
      const response = await api.post('/messages', {
        receiverId: getReceiverId(),
        productId: productId,
        content: `Tôi muốn đề xuất mua lại mặt hàng với giá: ${parseInt(offerPrice).toLocaleString()} VNĐ`,
        offerPrice: parseInt(offerPrice)
      })
      
      setMessages(prev => [...prev, response.data.data])
      setOfferPrice('')
      setShowOfferModal(false)
    } catch (error) {
      console.error('Error sending offer:', error)
      alert('Không thể gửi đề nghị')
    }
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    setSelectedFiles(prev => [...prev, ...files])
  }

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const isUserOnline = (userId) => {
    return onlineUsers.has(userId)
  }

  const getStatusColor = (userId) => {
    return isUserOnline(userId) ? 'bg-green-500' : 'bg-gray-400 dark:bg-gray-600'
  }

  const getReceiverId = () => {
    if (userId) return userId
    
    const conversation = conversations[selectedConversation]
    if (conversation && conversation.length > 0) {
      const message = conversation[0]
      return message.senderId._id === user.id ? message.receiverId._id : message.senderId._id
    }
    return null
  }

  const getReceiverInfo = () => {
    if (userId) {
      return { _id: userId, name: 'Người bán' }
    }
    
    const conversation = conversations[selectedConversation]
    if (conversation && conversation.length > 0) {
      const message = conversation[0]
      return message.senderId._id === user.id ? message.receiverId : message.senderId
    }
    return null
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date
    
    if (diff < 60000) return 'Vừa xong'
    if (diff < 3600000) return `${Math.floor(diff / 60000)} phút trước`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} giờ trước`
    return date.toLocaleDateString('vi-VN')
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-12 px-4 text-center">
        <div className="inline-block w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-2"></div>
        <p className="text-gray-500 dark:text-gray-400">Đang tải cuộc hội thoại...</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 transition-colors duration-200">
      
      {/* DNU Chat Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/15 p-6 mb-6">
        {/* Background elements */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10 blur-xl"></div>
        <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-yellow-300/15 blur-lg"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-orange-50">
                💬 DNU Chatbox
              </span>
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              <span className="text-xs text-orange-100 font-medium">Trực tuyến</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white mb-2 drop-shadow-sm leading-normal">
              Hộp Thư Sinh Viên DNU
            </h1>
            <p className="text-sm text-orange-50/90 max-w-xl leading-relaxed">
              Trò chuyện trực tiếp, đàm phán giá cả và trao đổi mua bán giáo trình, đồ dùng học tập an toàn cùng bạn học.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-md border border-gray-100 dark:border-gray-800 flex overflow-hidden" style={{ height: '620px' }}>
        
        {/* Conversations List Sidebar */}
        <div className="w-1/3 border-r border-gray-100 dark:border-gray-850 flex flex-col bg-gray-50/50 dark:bg-gray-900/50">
          <div className="p-4 border-b border-gray-100 dark:border-gray-850">
            <h2 className="font-bold text-gray-800 dark:text-gray-250 text-sm">
              Cuộc trò chuyện
            </h2>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {Object.keys(conversations).length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">
                Chưa có cuộc trò chuyện nào
              </div>
            ) : (
              Object.entries(conversations).map(([conversationId, messages]) => {
                const latestMessage = messages[0]
                const receiver = latestMessage.senderId._id === user.id ? latestMessage.receiverId : latestMessage.senderId
                const isSelected = selectedConversation === conversationId
                
                return (
                  <div 
                    key={conversationId}
                    className={`p-4 border-b border-gray-100 dark:border-gray-850 cursor-pointer relative transition-all duration-200 flex ${
                      isSelected 
                        ? 'bg-orange-50/40 dark:bg-orange-950/20 text-orange-950 dark:text-orange-50 border-l-4 border-l-orange-500' 
                        : 'hover:bg-gray-100/50 dark:hover:bg-gray-800/40 border-l-4 border-l-transparent'
                    }`}
                    onClick={() => {
                      setSelectedConversation(conversationId)
                      loadMessages(conversationId)
                    }}
                  >
                    <div className="flex items-center w-full min-w-0">
                      <div className="relative mr-3 shrink-0">
                        <img
                          src={receiver.avatar || 'https://via.placeholder.com/40'}
                          alt={receiver.name}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-transparent"
                        />
                        <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-gray-900 ${getStatusColor(receiver._id)}`}></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <p className="font-bold text-xs text-gray-800 dark:text-gray-200 truncate leading-relaxed">{receiver.nickname || receiver.name}</p>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold ${
                            isUserOnline(receiver._id) 
                              ? 'bg-green-55 dark:bg-green-950/30 text-green-700 dark:text-green-400' 
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                          }`}>
                            {isUserOnline(receiver._id) ? 'Online' : 'Offline'}
                          </span>
                        </div>
                        <p className={`text-xs truncate leading-relaxed py-0.5 ${isSelected ? 'text-orange-700 dark:text-orange-400 font-medium' : 'text-gray-500'}`}>
                          {latestMessage.content || 
                           (latestMessage.attachments && latestMessage.attachments.length > 0 
                            ? `📎 ${latestMessage.attachments.length} file(s)` 
                            : 'Tin nhắn')}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-1">
                          {formatTime(latestMessage.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Messages Panel */}
        <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
          {selectedConversation ? (
            <>
              {/* Receiver profile header bar */}
              <div className="p-4 border-b border-gray-100 dark:border-gray-850 flex items-center justify-between">
                <div className="flex items-center">
                  <img
                    src={getReceiverInfo()?.avatar || 'https://via.placeholder.com/40'}
                    alt={getReceiverInfo()?.name}
                    className="w-10 h-10 rounded-full mr-3 object-cover"
                  />
                  <div>
                    <h2 className="font-bold text-gray-850 dark:text-gray-150 text-sm leading-relaxed">
                      {getReceiverInfo()?.nickname || getReceiverInfo()?.name}
                    </h2>
                    <div className="flex items-center space-x-1.5 mt-0.5">
                      <span className={`w-2 h-2 rounded-full ${isUserOnline(getReceiverInfo()?._id) ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
                      <span className="text-[11px] text-gray-500">
                        {isUserOnline(getReceiverInfo()?._id) ? 'Đang hoạt động' : 'Ngoại tuyến'}
                      </span>
                    </div>
                  </div>
                </div>
                {productId && (
                  <button
                    onClick={() => setShowOfferModal(true)}
                    className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md hover:shadow-orange-500/10 active:scale-95 transition-all flex items-center gap-1.5"
                  >
                    <span>💰</span> Đề nghị giá mua
                  </button>
                )}
              </div>

              {/* Chat bubbles container */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/20 dark:bg-gray-900/10">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-400 py-12 text-xs">
                    Bắt đầu gửi tin nhắn để trò chuyện cùng bạn học.
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isOwn = msg.senderId._id === user.id
                    return (
                      <div
                        key={msg._id}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className="max-w-xs lg:max-w-md">
                          <div
                            className={`px-4 py-2.5 rounded-2xl shadow-sm leading-relaxed text-sm ${
                              isOwn 
                                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-tr-sm' 
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-sm border border-gray-200/20'
                            }`}
                          >
                            {msg.content && <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>}
                            
                            {msg.offerPrice && (
                              <div className="bg-white/10 dark:bg-black/10 p-2 rounded-xl mt-2 border border-white/20 dark:border-white/5 flex items-center justify-between gap-4">
                                <span className="text-xs font-bold">💰 ĐỀ XUẤT GIÁ MUA</span>
                                <span className="font-extrabold text-sm text-yellow-300">
                                  {msg.offerPrice.toLocaleString()} VNĐ
                                </span>
                              </div>
                            )}

                            {msg.attachments && msg.attachments.length > 0 && (
                              <div className="mt-2.5 space-y-2">
                                {msg.attachments.map((file, index) => {
                                  const isImage = file.mimetype && file.mimetype.startsWith('image/');
                                  const fileUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${file.url}`;
                                  
                                  return (
                                    <div key={index} className="pt-1 border-t border-white/10">
                                      {isImage ? (
                                        <div className="space-y-1.5">
                                          <img
                                            src={fileUrl}
                                            alt={file.originalName}
                                            className="max-w-xs max-h-48 object-contain rounded-lg cursor-pointer hover:opacity-90 border bg-gray-50 dark:bg-gray-950"
                                            onClick={() => window.open(fileUrl, '_blank')}
                                            onError={(e) => {
                                              e.target.style.display = 'none';
                                            }}
                                          />
                                          <div className="flex items-center space-x-1 text-[11px] opacity-80">
                                            <span>📎</span>
                                            <a
                                              href={fileUrl}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="underline hover:no-underline font-semibold"
                                            >
                                              {file.originalName}
                                            </a>
                                            <span>({formatFileSize(file.size)})</span>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="flex items-center space-x-2 text-xs">
                                          <span>📎</span>
                                          <a
                                            href={fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="underline hover:no-underline font-semibold truncate max-w-[180px]"
                                          >
                                            {file.originalName}
                                          </a>
                                          <span className="opacity-75 shrink-0">
                                            ({formatFileSize(file.size)})
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                          <p className="text-[10px] text-gray-400 mt-1 flex justify-end">
                            {formatTime(msg.createdAt)}
                          </p>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              {/* Chat Input footer form */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-100 dark:border-gray-850">
                {/* Selected Files Preview */}
                {selectedFiles.length > 0 && (
                  <div className="mb-3 p-3 bg-orange-50/30 dark:bg-orange-950/10 rounded-xl border border-orange-200/10">
                    <p className="text-xs font-bold text-orange-900 dark:text-orange-400 mb-2">Tệp đính kèm đã chọn:</p>
                    <div className="space-y-1.5">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
                          <span className="truncate max-w-[280px]">📎 {file.name} ({formatFileSize(file.size)})</span>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="text-red-500 hover:text-red-750 font-bold px-1"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-input"
                  />
                  <label
                    htmlFor="file-input"
                    className="p-2.5 bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-orange-500 dark:text-gray-400 hover:bg-orange-50 dark:hover:bg-orange-950/20 rounded-xl transition-colors cursor-pointer flex items-center justify-center shrink-0"
                    title="Đính kèm ảnh/files"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                  </label>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Nhập nội dung tin nhắn..."
                    className="flex-1 px-4 py-3 leading-relaxed border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-850 text-gray-850 dark:text-gray-150 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-sm"
                  />
                  <button
                    type="submit"
                    disabled={uploading}
                    className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-md shadow-orange-500/10 hover:shadow-orange-500/20 active:scale-95 disabled:scale-100 disabled:opacity-50 transition-all"
                  >
                    {uploading ? 'Đang gửi...' : 'Gửi'}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 p-8">
              <span className="text-4xl mb-2">✉️</span>
              <p className="text-sm font-medium">Chọn một cuộc trò chuyện từ danh sách để bắt đầu trao đổi mua bán</p>
            </div>
          )}
        </div>
      </div>

      {/* Offer Modal */}
      {showOfferModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-sm border border-gray-100 dark:border-gray-800 shadow-xl">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2 flex items-center gap-2">
              <span>💰</span> Đề nghị giá mua mới
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
              Bạn có thể đề xuất một mức giá thương lượng mong muốn cho Người bán. Tin nhắn sẽ tự động gửi dưới dạng thẻ đề nghị giá.
            </p>
            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">Giá đề nghị (VNĐ)</label>
              <input
                type="number"
                value={offerPrice}
                onChange={(e) => setOfferPrice(e.target.value)}
                placeholder="Nhập giá thương lượng..."
                className="w-full px-3 py-3 leading-relaxed border border-gray-200 dark:border-gray-750 rounded-xl bg-white dark:bg-gray-850 text-gray-850 dark:text-gray-150 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-sm font-semibold"
                min="0"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowOfferModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-colors text-xs font-semibold"
              >
                Hủy
              </button>
              <button
                onClick={handleSendOffer}
                className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-orange-500/10 hover:shadow-orange-500/25 active:scale-95 transition-all"
              >
                Gửi đề nghị
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}