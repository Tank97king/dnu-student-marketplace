const Hashtag = require('../models/Hashtag');
const Post = require('../models/Post');

// @desc    Get trending hashtags
// @route   GET /api/hashtags/trending
// @access  Public
exports.getTrendingHashtags = async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    
    const hashtags = await Hashtag.find({})
      .sort({ postCount: -1, lastUsedAt: -1 })
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      data: hashtags
    });
  } catch (error) {
    console.error('Get trending hashtags error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy hashtags: ' + error.message
    });
  }
};

// @desc    Get hashtag info
// @route   GET /api/hashtags/:name
// @access  Public
exports.getHashtag = async (req, res) => {
  try {
    const hashtag = await Hashtag.findOne({
      name: req.params.name.toLowerCase()
    });
    
    if (!hashtag) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hashtag'
      });
    }
    
    res.json({
      success: true,
      data: hashtag
    });
  } catch (error) {
    console.error('Get hashtag error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy hashtag: ' + error.message
    });
  }
};

// @desc    Search hashtags
// @route   GET /api/hashtags/search
// @access  Public
exports.searchHashtags = async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập từ khóa tìm kiếm'
      });
    }
    
    const hashtags = await Hashtag.find({
      name: { $regex: q.toLowerCase(), $options: 'i' }
    })
      .sort({ postCount: -1 })
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      data: hashtags
    });
  } catch (error) {
    console.error('Search hashtags error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tìm kiếm hashtags: ' + error.message
    });
  }
};

