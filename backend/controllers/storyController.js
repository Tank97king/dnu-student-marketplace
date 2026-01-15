const Story = require('../models/Story');
const { uploadToCloudinary } = require('../utils/uploadImage');

// @desc    Create a new story
// @route   POST /api/stories
// @access  Private
exports.createStory = async (req, res) => {
  try {
    const { mediaType, text, stickers } = req.body;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng upload ảnh hoặc video'
      });
    }
    
    // Upload media
    let mediaUrl;
    try {
      const result = await uploadToCloudinary(
        req.file.buffer,
        'dnu-marketplace/stories'
      );
      mediaUrl = result.secure_url;
    } catch (uploadError) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi upload: ' + uploadError.message
      });
    }
    
    const storyData = {
      userId: req.user.id,
      mediaType: mediaType || 'image',
      mediaUrl,
      text: text || '',
      stickers: stickers ? JSON.parse(stickers) : [],
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    };
    
    const story = await Story.create(storyData);
    await story.populate('userId', 'name avatar nickname');
    
    res.status(201).json({
      success: true,
      data: story
    });
  } catch (error) {
    console.error('Create story error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo story: ' + error.message
    });
  }
};

// @desc    Get stories (from followed users or all)
// @route   GET /api/stories
// @access  Private
exports.getStories = async (req, res) => {
  try {
    // Get stories from users that current user is following
    const Follow = require('../models/Follow');
    const follows = await Follow.find({ followerId: req.user.id });
    const followingIds = follows.map(f => f.followingId);
    
    // Also include current user's stories
    followingIds.push(req.user.id);
    
    const stories = await Story.find({
      userId: { $in: followingIds },
      expiresAt: { $gt: new Date() }
    })
      .populate('userId', 'name avatar nickname')
      .sort('-createdAt');
    
    // Group by user
    const storiesByUser = {};
    stories.forEach(story => {
      const userId = story.userId._id.toString();
      if (!storiesByUser[userId]) {
        storiesByUser[userId] = {
          user: story.userId,
          stories: []
        };
      }
      storiesByUser[userId].stories.push(story);
    });
    
    res.json({
      success: true,
      data: Object.values(storiesByUser)
    });
  } catch (error) {
    console.error('Get stories error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy stories: ' + error.message
    });
  }
};

// @desc    Get stories by user
// @route   GET /api/stories/user/:userId
// @access  Public
exports.getUserStories = async (req, res) => {
  try {
    const stories = await Story.find({
      userId: req.params.userId,
      expiresAt: { $gt: new Date() }
    })
      .populate('userId', 'name avatar nickname')
      .sort('-createdAt');
    
    res.json({
      success: true,
      data: stories
    });
  } catch (error) {
    console.error('Get user stories error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy stories: ' + error.message
    });
  }
};

// @desc    View story
// @route   GET /api/stories/:id
// @access  Private
exports.viewStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id)
      .populate('userId', 'name avatar nickname');
    
    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy story'
      });
    }
    
    // Check if already viewed
    const alreadyViewed = story.views.some(
      v => v.userId.toString() === req.user.id
    );
    
    if (!alreadyViewed) {
      story.views.push({
        userId: req.user.id,
        viewedAt: new Date()
      });
      await story.save();
    }
    
    res.json({
      success: true,
      data: story
    });
  } catch (error) {
    console.error('View story error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xem story: ' + error.message
    });
  }
};

// @desc    React to story
// @route   POST /api/stories/:id/reaction
// @access  Private
exports.reactToStory = async (req, res) => {
  try {
    const { emoji = '❤️' } = req.body;
    const story = await Story.findById(req.params.id);
    
    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy story'
      });
    }
    
    // Remove existing reaction from this user
    story.reactions = story.reactions.filter(
      r => r.userId.toString() !== req.user.id
    );
    
    // Add new reaction
    story.reactions.push({
      userId: req.user.id,
      emoji,
      reactedAt: new Date()
    });
    
    await story.save();
    
    // Send notification
    const io = req.app.get('io');
    if (io && story.userId.toString() !== req.user.id) {
      io.to(`user-${story.userId}`).emit('story-reacted', {
        storyId: story._id,
        userId: req.user.id,
        userName: req.user.name,
        emoji
      });
    }
    
    res.json({
      success: true,
      data: {
        reactions: story.reactions
      }
    });
  } catch (error) {
    console.error('React to story error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi react story: ' + error.message
    });
  }
};

// @desc    Delete story
// @route   DELETE /api/stories/:id
// @access  Private
exports.deleteStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    
    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy story'
      });
    }
    
    if (story.userId.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền xóa story này'
      });
    }
    
    await story.deleteOne();
    
    res.json({
      success: true,
      message: 'Xóa story thành công'
    });
  } catch (error) {
    console.error('Delete story error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa story: ' + error.message
    });
  }
};

