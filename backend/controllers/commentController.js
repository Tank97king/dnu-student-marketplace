const Comment = require('../models/Comment');

// @desc    Create comment
// @route   POST /api/products/:productId/comments
// @access  Private
exports.createComment = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Nội dung bình luận không được để trống'
      });
    }

    console.log('Creating comment for product:', req.params.id, 'by user:', req.user.id);
    const comment = await Comment.create({
      productId: req.params.id,
      userId: req.user.id,
      content: content.trim()
    });

    await comment.populate('userId', 'name avatar');
    console.log('Comment created successfully:', comment._id);

    res.status(201).json({
      success: true,
      data: comment
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get comments
// @route   GET /api/products/:productId/comments
// @access  Public
exports.getComments = async (req, res) => {
  try {
    console.log('Getting comments for product:', req.params.id);
    const comments = await Comment.find({ productId: req.params.id })
      .populate('userId', 'name avatar')
      .populate('replies.userId', 'name avatar')
      .sort({ createdAt: -1 });

    console.log('Found comments:', comments.length);
    res.json({
      success: true,
      data: comments
    });
  } catch (error) {
    console.error('Error getting comments:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Reply to comment
// @route   POST /api/comments/:commentId/reply
// @access  Private
exports.replyToComment = async (req, res) => {
  try {
    const { content } = req.body;
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bình luận'
      });
    }

    comment.replies.push({
      userId: req.user.id,
      content
    });

    await comment.save();
    await comment.populate('replies.userId', 'name avatar');

    res.json({
      success: true,
      data: comment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update comment
// @route   PUT /api/comments/:commentId
// @access  Private
exports.updateComment = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Nội dung bình luận không được để trống'
      });
    }

    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bình luận'
      });
    }

    // Check if user is comment owner
    if (comment.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bạn chỉ có thể chỉnh sửa bình luận của mình'
      });
    }

    comment.content = content.trim();
    await comment.save();

    await comment.populate('userId', 'name avatar');

    res.json({
      success: true,
      data: comment
    });
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete comment
// @route   DELETE /api/comments/:commentId
// @access  Private
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bình luận'
      });
    }

    // Check if user is comment owner or product owner
    if (comment.userId.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xóa bình luận này'
      });
    }

    await Comment.findByIdAndDelete(req.params.commentId);

    res.json({
      success: true,
      message: 'Đã xóa bình luận'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};






