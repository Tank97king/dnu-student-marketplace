const Message = require('../models/Message');

// @desc    Send message
// @route   POST /api/messages
// @access  Private
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, productId, content, offerPrice } = req.body;

    console.log('Send message request:', { receiverId, productId, content, offerPrice, senderId: req.user.id });

    // Validation
    if (!receiverId) {
      return res.status(400).json({
        success: false,
        message: 'Receiver ID is required'
      });
    }

    // Allow sending files without content
    if (!content && (!req.files || req.files.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Message content or file is required'
      });
    }

    // Create conversationId (sorted IDs to ensure consistency)
    const participants = [req.user.id, receiverId].sort();
    const conversationId = participants.join('_');

    console.log('Creating message with conversationId:', conversationId);

    const messageData = {
      conversationId,
      senderId: req.user.id,
      receiverId
    };

    // Add content if provided
    if (content && content.trim()) {
      messageData.content = content.trim();
    }

    // Only add productId if it exists
    if (productId) {
      messageData.productId = productId;
    }

    // Only add offerPrice if it exists
    if (offerPrice) {
      messageData.offerPrice = offerPrice;
    }

    // Handle file attachments
    if (req.files && req.files.length > 0) {
      messageData.attachments = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        url: `/uploads/messages/${file.filename}`
      }));
    }

    const message = await Message.create(messageData);

    console.log('Message created successfully:', message._id);

    // Emit socket event for real-time notification
    const io = req.app.get('io');
    if (io) {
      io.to(`user-${receiverId}`).emit('new-message', message);
      console.log('Socket event emitted to user:', receiverId);
    }

    res.status(201).json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get conversations
// @route   GET /api/messages/conversations
// @access  Private
exports.getConversations = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ senderId: req.user.id }, { receiverId: req.user.id }]
    })
      .populate('senderId', 'name avatar')
      .populate('receiverId', 'name avatar')
      .populate('productId', 'title images price')
      .sort({ createdAt: -1 });

    // Group by conversation
    const conversationsMap = {};
    messages.forEach(msg => {
      if (!conversationsMap[msg.conversationId]) {
        conversationsMap[msg.conversationId] = [];
      }
      conversationsMap[msg.conversationId].push(msg);
    });

    res.json({
      success: true,
      data: conversationsMap
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get messages in conversation
// @route   GET /api/messages/:conversationId
// @access  Private
exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId
    })
      .populate('senderId', 'name avatar')
      .populate('receiverId', 'name avatar')
      .populate('productId', 'title images price')
      .sort({ createdAt: 1 });

    // Mark as read if user is receiver
    await Message.updateMany(
      {
        conversationId: req.params.conversationId,
        receiverId: req.user.id
      },
      { isRead: true }
    );

    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

