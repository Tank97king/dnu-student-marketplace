const Bookmark = require('../models/Bookmark');
const Product = require('../models/Product');

// @desc    Create bookmark
// @route   POST /api/bookmarks
// @access  Private
exports.createBookmark = async (req, res) => {
  try {
    const { productId, tags, notes } = req.body;
    
    const bookmark = await Bookmark.create({
      userId: req.user.id,
      productId,
      tags: tags || [],
      notes: notes || ''
    });

    await bookmark.populate('productId', 'title images price');

    res.status(201).json({
      success: true,
      data: bookmark
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Sản phẩm đã có trong bookmark'
      });
    }
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get bookmarks
// @route   GET /api/bookmarks
// @access  Private
exports.getBookmarks = async (req, res) => {
  try {
    const { tag } = req.query;
    const query = { userId: req.user.id };
    
    if (tag) {
      query.tags = tag;
    }

    const bookmarks = await Bookmark.find(query)
      .populate('productId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: bookmarks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update bookmark
// @route   PUT /api/bookmarks/:id
// @access  Private
exports.updateBookmark = async (req, res) => {
  try {
    const { tags, notes } = req.body;
    const bookmark = await Bookmark.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!bookmark) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bookmark'
      });
    }

    if (tags) bookmark.tags = tags;
    if (notes !== undefined) bookmark.notes = notes;

    await bookmark.save();
    await bookmark.populate('productId', 'title images price');

    res.json({
      success: true,
      data: bookmark
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete bookmark
// @route   DELETE /api/bookmarks/:id
// @access  Private
exports.deleteBookmark = async (req, res) => {
  try {
    const bookmark = await Bookmark.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!bookmark) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bookmark'
      });
    }

    res.json({
      success: true,
      message: 'Đã xóa bookmark'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get bookmark tags
// @route   GET /api/bookmarks/tags
// @access  Private
exports.getBookmarkTags = async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ userId: req.user.id });
    const tagsSet = new Set();
    
    bookmarks.forEach(bookmark => {
      bookmark.tags.forEach(tag => tagsSet.add(tag));
    });

    res.json({
      success: true,
      data: Array.from(tagsSet)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

