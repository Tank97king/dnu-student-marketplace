const Follow = require('../models/Follow');
const User = require('../models/User');

// @desc    Follow a user
// @route   POST /api/users/:userId/follow
// @access  Private
exports.followUser = async (req, res) => {
  try {
    const followingId = req.params.userId;
    const followerId = req.user.id;
    
    if (followingId === followerId) {
      return res.status(400).json({
        success: false,
        message: 'Không thể follow chính mình'
      });
    }
    
    // Check if user exists
    const userToFollow = await User.findById(followingId);
    if (!userToFollow) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }
    
    // Check if already following
    const existingFollow = await Follow.findOne({
      followerId,
      followingId
    });
    
    if (existingFollow) {
      return res.status(400).json({
        success: false,
        message: 'Đã follow người dùng này rồi'
      });
    }
    
    // Create follow relationship
    await Follow.create({
      followerId,
      followingId
    });
    
    // Update user counts
    await User.findByIdAndUpdate(followerId, {
      $inc: { followingCount: 1 }
    });
    await User.findByIdAndUpdate(followingId, {
      $inc: { followerCount: 1 }
    });
    
    // Update user arrays
    await User.findByIdAndUpdate(followerId, {
      $addToSet: { following: followingId }
    });
    await User.findByIdAndUpdate(followingId, {
      $addToSet: { followers: followerId }
    });
    
    // Send notification
    const io = req.app.get('io');
    if (io) {
      io.to(`user-${followingId}`).emit('user-followed', {
        followerId,
        followerName: req.user.name
      });
    }
    
    res.json({
      success: true,
      message: 'Follow thành công'
    });
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi follow: ' + error.message
    });
  }
};

// @desc    Unfollow a user
// @route   DELETE /api/users/:userId/follow
// @access  Private
exports.unfollowUser = async (req, res) => {
  try {
    const followingId = req.params.userId;
    const followerId = req.user.id;
    
    const follow = await Follow.findOneAndDelete({
      followerId,
      followingId
    });
    
    if (!follow) {
      return res.status(404).json({
        success: false,
        message: 'Chưa follow người dùng này'
      });
    }
    
    // Update user counts
    await User.findByIdAndUpdate(followerId, {
      $inc: { followingCount: -1 }
    });
    await User.findByIdAndUpdate(followingId, {
      $inc: { followerCount: -1 }
    });
    
    // Update user arrays
    await User.findByIdAndUpdate(followerId, {
      $pull: { following: followingId }
    });
    await User.findByIdAndUpdate(followingId, {
      $pull: { followers: followerId }
    });
    
    res.json({
      success: true,
      message: 'Unfollow thành công'
    });
  } catch (error) {
    console.error('Unfollow user error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi unfollow: ' + error.message
    });
  }
};

// @desc    Get followers
// @route   GET /api/users/:userId/followers
// @access  Public
exports.getFollowers = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const follows = await Follow.find({ followingId: req.params.userId })
      .populate('followerId', 'name avatar nickname bio')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Follow.countDocuments({ followingId: req.params.userId });
    
    res.json({
      success: true,
      data: follows.map(f => f.followerId),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách followers: ' + error.message
    });
  }
};

// @desc    Get following
// @route   GET /api/users/:userId/following
// @access  Public
exports.getFollowing = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const follows = await Follow.find({ followerId: req.params.userId })
      .populate('followingId', 'name avatar nickname bio')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Follow.countDocuments({ followerId: req.params.userId });
    
    res.json({
      success: true,
      data: follows.map(f => f.followingId),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách following: ' + error.message
    });
  }
};

// @desc    Get user suggestions
// @route   GET /api/users/suggestions
// @access  Private
exports.getUserSuggestions = async (req, res) => {
  try {
    // Get users that current user is following
    const follows = await Follow.find({ followerId: req.user.id });
    const followingIds = follows.map(f => f.followingId);
    followingIds.push(req.user.id); // Exclude self
    
    // Get users not yet followed, with most followers
    const suggestions = await User.find({
      _id: { $nin: followingIds },
      isActive: true
    })
      .select('name avatar nickname bio followerCount')
      .sort('-followerCount')
      .limit(10);
    
    res.json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    console.error('Get user suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy gợi ý: ' + error.message
    });
  }
};

