const Comment = require('../models/Comment');
const Product = require('../models/Product');
const Post = require('../models/Post');
const { createAndEmitNotification } = require('../utils/notifications');

// @desc    Create comment (for product or post)
// @route   POST /api/products/:productId/comments or POST /api/posts/:postId/comments
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

    const commentData = {
      userId: req.user.id,
      content: content.trim()
    };

    // Determine if it's a product or post comment
    if (req.params.productId) {
      commentData.productId = req.params.productId;
    } else if (req.params.postId) {
      commentData.postId = req.params.postId;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Thiếu productId hoặc postId'
      });
    }

    const comment = await Comment.create(commentData);
    await comment.populate('userId', 'name avatar');

    // Update comment count
    if (commentData.productId) {
      const product = await Product.findById(commentData.productId);
      if (product) {
        product.comments.push(comment._id);
        await product.save();
      }
    } else if (commentData.postId) {
      const post = await Post.findById(commentData.postId);
      if (post) {
        post.commentCount += 1;
        await post.save();
      }
    }

    // Create notification
    try {
      const io = req.app.get('io');
      if (commentData.productId) {
        const product = await Product.findById(commentData.productId).populate('userId');
        if (product && product.userId._id.toString() !== req.user.id) {
          await createAndEmitNotification(
            io,
            product.userId._id,
            'new_comment',
            'Có bình luận mới',
            `${req.user.name} đã bình luận trên sản phẩm "${product.title}" của bạn`,
            { productId: product._id, commentId: comment._id, productName: product.title }
          );
        }
      } else if (commentData.postId) {
        const post = await Post.findById(commentData.postId).populate('userId');
        if (post && post.userId._id.toString() !== req.user.id) {
          await createAndEmitNotification(
            io,
            post.userId._id,
            'new_comment',
            'Có bình luận mới',
            `${req.user.name} đã bình luận trên bài đăng của bạn`,
            { postId: post._id, commentId: comment._id }
          );
        }
      }
    } catch (notifError) {
      console.error('Error creating comment notification:', notifError);
    }

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

// @desc    Get comments (for product or post)
// @route   GET /api/products/:productId/comments or GET /api/posts/:postId/comments
// @access  Public
exports.getComments = async (req, res) => {
  try {
    const query = {};
    if (req.params.productId) {
      query.productId = req.params.productId;
    } else if (req.params.postId) {
      query.postId = req.params.postId;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Thiếu productId hoặc postId'
      });
    }

    const comments = await Comment.find(query)
      .populate('userId', 'name avatar nickname')
      .populate('replies.userId', 'name avatar nickname')
      .sort({ createdAt: -1 });

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

// @desc    Like/Unlike comment
// @route   POST /api/comments/:commentId/like
// @access  Private
exports.likeComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bình luận'
      });
    }

    const userId = req.user.id;
    const isLiked = comment.likes.includes(userId);

    if (isLiked) {
      comment.likes = comment.likes.filter(id => id.toString() !== userId);
    } else {
      comment.likes.push(userId);
    }

    await comment.save();

    res.json({
      success: true,
      data: {
        isLiked: !isLiked,
        likeCount: comment.likeCount
      }
    });
  } catch (error) {
    console.error('Error liking comment:', error);
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

    await comment.populate('userId', 'name avatar nickname');

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






