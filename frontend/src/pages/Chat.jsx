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
      
      // Add files
      console.log('Selected files:', selectedFiles)
      selectedFiles.forEach(file => {
        console.log('Adding file to FormData:', file.name, file.type, file.size)
        formData.append('files', file)
      })

      console.log('FormData contents:')
      for (let [key, value] of formData.entries()) {
        console.log(key, value)
      }

      const response = await api.post('/messages', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      console.log('Message sent successfully:', response.data)
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
        content: `Tôi muốn mua với giá ${parseInt(offerPrice).toLocaleString()} VNĐ`,
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
    return isUserOnline(userId) ? 'bg-green-500' : 'bg-red-500'
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
      // For direct chat, we need to get user info
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
      <div className="max-w-6xl mx-auto py-6 px-4">
        <div className="text-center">Đang tải...</div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      <h1 className="text-3xl font-bold mb-6">Tin nhắn</h1>

      <div className="bg-white rounded-lg shadow-md flex" style={{ height: '600px' }}>
        {/* Conversations List */}
        <div className="w-1/3 border-r overflow-y-auto">
          <div className="p-4 border-b">
            <h2 className="font-semibold">Cuộc trò chuyện</h2>
          </div>
          
          {Object.keys(conversations).length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              Chưa có cuộc trò chuyện nào
            </div>
          ) : (
            Object.entries(conversations).map(([conversationId, messages]) => {
              const latestMessage = messages[0]
              const receiver = latestMessage.senderId._id === user.id ? latestMessage.receiverId : latestMessage.senderId
              
              return (
                <div 
                  key={conversationId}
                  className={`p-3 border-b hover:bg-gray-50 cursor-pointer ${
                    selectedConversation === conversationId ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => {
                    setSelectedConversation(conversationId)
                    loadMessages(conversationId)
                  }}
                >
                  <div className="flex items-center">
                    <div className="relative mr-3">
                      <img
                        src={receiver.avatar || 'https://via.placeholder.com/40'}
                        alt={receiver.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(receiver._id)}`}></div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold">{receiver.name}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${isUserOnline(receiver._id) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {isUserOnline(receiver._id) ? 'Online' : 'Offline'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 truncate">
                        {latestMessage.content || 
                         (latestMessage.attachments && latestMessage.attachments.length > 0 
                          ? `📎 ${latestMessage.attachments.length} file(s)` 
                          : 'Tin nhắn')}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatTime(latestMessage.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center">
                  <img
                    src={getReceiverInfo()?.avatar || 'https://via.placeholder.com/40'}
                    alt={getReceiverInfo()?.name}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <div>
                    <h2 className="font-semibold">{getReceiverInfo()?.name}</h2>
                    <p className="text-sm text-gray-500">Đang hoạt động</p>
                  </div>
                </div>
                {productId && (
                  <button
                    onClick={() => setShowOfferModal(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    Đề nghị mua
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    Chưa có tin nhắn nào
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg._id}
                      className={`flex ${msg.senderId._id === user.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className="max-w-xs lg:max-w-md">
                        <div
                          className={`px-4 py-2 rounded-lg ${
                            msg.senderId._id === user.id 
                              ? 'bg-primary-600 text-white' 
                              : 'bg-gray-200'
                          }`}
                        >
                          {msg.content && <p>{msg.content}</p>}
                          {msg.offerPrice && (
                            <p className="text-sm font-semibold mt-1">
                              💰 Đề nghị: {msg.offerPrice.toLocaleString()} VNĐ
                            </p>
                          )}
                          {msg.attachments && msg.attachments.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {msg.attachments.map((file, index) => {
                                const isImage = file.mimetype && file.mimetype.startsWith('image/');
                                const fileUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${file.url}`;
                                
                                console.log('File attachment:', {
                                  file,
                                  isImage,
                                  fileUrl,
                                  mimetype: file.mimetype,
                                  originalName: file.originalName
                                });
                                
                                return (
                                  <div key={index}>
                                    {isImage ? (
                                      <div className="space-y-1">
                                        <img
                                          src={fileUrl}
                                          alt={file.originalName}
                                          className="max-w-64 max-h-48 object-contain rounded cursor-pointer hover:opacity-80 border bg-gray-50"
                                          onClick={() => window.open(fileUrl, '_blank')}
                                          onError={(e) => {
                                            console.error('Image load error:', e.target.src);
                                            e.target.style.display = 'none';
                                          }}
                                          onLoad={() => {
                                            console.log('Image loaded successfully:', fileUrl);
                                          }}
                                        />
                                        <div className="flex items-center space-x-1 text-xs opacity-75">
                                          <span>📎</span>
                                          <a
                                            href={fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="underline hover:no-underline"
                                          >
                                            {file.originalName}
                                          </a>
                                          <span>({formatFileSize(file.size)})</span>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="flex items-center space-x-2">
                                        <span className="text-sm">📎</span>
                                        <a
                                          href={fileUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-sm underline hover:no-underline"
                                        >
                                          {file.originalName}
                                        </a>
                                        <span className="text-xs opacity-75">
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
                        <p className="text-xs text-gray-500 mt-1">
                          {formatTime(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleSendMessage} className="p-4 border-t">
                {/* Selected Files Preview */}
                {selectedFiles.length > 0 && (
                  <div className="mb-3 p-2 bg-gray-100 rounded-lg">
                    <p className="text-sm font-medium mb-2">Files đã chọn:</p>
                    <div className="space-y-1">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span>📎 {file.name} ({formatFileSize(file.size)})</span>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="text-red-500 hover:text-red-700"
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
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 cursor-pointer"
                  >
                    📎
                  </label>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Nhập tin nhắn..."
                    className="flex-1 px-4 py-2 border rounded-lg"
                  />
                  <button
                    type="submit"
                    disabled={uploading}
                    className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50"
                  >
                    {uploading ? 'Đang gửi...' : 'Gửi'}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Chọn một cuộc trò chuyện để bắt đầu
            </div>
          )}
        </div>
      </div>

      {/* Offer Modal */}
      {showOfferModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Đề nghị mua hàng</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Giá đề nghị (VNĐ)</label>
              <input
                type="number"
                value={offerPrice}
                onChange={(e) => setOfferPrice(e.target.value)}
                placeholder="Nhập giá đề nghị..."
                className="w-full px-3 py-2 border rounded-lg"
                min="0"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowOfferModal(false)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleSendOffer}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
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