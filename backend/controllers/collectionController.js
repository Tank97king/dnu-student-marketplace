const Collection = require('../models/Collection');
const Post = require('../models/Post');

// @desc    Create a collection
// @route   POST /api/collections
// @access  Private
exports.createCollection = async (req, res) => {
  try {
    const { name, description, isPublic = true } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập tên collection'
      });
    }
    
    const collection = await Collection.create({
      userId: req.user.id,
      name,
      description: description || '',
      isPublic: isPublic === 'true' || isPublic === true
    });
    
    await collection.populate('userId', 'name avatar');
    
    res.status(201).json({
      success: true,
      data: collection
    });
  } catch (error) {
    console.error('Create collection error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo collection: ' + error.message
    });
  }
};

// @desc    Get collections
// @route   GET /api/collections
// @access  Private (own collections) or Public (public collections)
exports.getCollections = async (req, res) => {
  try {
    const { userId } = req.query;
    const query = {};
    
    if (userId) {
      query.userId = userId;
      // If viewing own collections, show all. Otherwise only public
      if (userId !== req.user?.id) {
        query.isPublic = true;
      }
    } else if (req.user) {
      // Get own collections
      query.userId = req.user.id;
    } else {
      // Get only public collections
      query.isPublic = true;
    }
    
    const collections = await Collection.find(query)
      .populate('userId', 'name avatar nickname')
      .populate('posts', 'images caption')
      .sort('-createdAt');
    
    res.json({
      success: true,
      data: collections
    });
  } catch (error) {
    console.error('Get collections error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy collections: ' + error.message
    });
  }
};

// @desc    Get single collection
// @route   GET /api/collections/:id
// @access  Public (if public) or Private (if own)
exports.getCollection = async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id)
      .populate('userId', 'name avatar nickname')
      .populate({
        path: 'posts',
        populate: {
          path: 'userId',
          select: 'name avatar nickname'
        }
      });
    
    if (!collection) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy collection'
      });
    }
    
    // Check access
    if (!collection.isPublic && collection.userId._id.toString() !== req.user?.id) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền xem collection này'
      });
    }
    
    res.json({
      success: true,
      data: collection
    });
  } catch (error) {
    console.error('Get collection error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy collection: ' + error.message
    });
  }
};

// @desc    Update collection
// @route   PUT /api/collections/:id
// @access  Private
exports.updateCollection = async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id);
    
    if (!collection) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy collection'
      });
    }
    
    if (collection.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền chỉnh sửa collection này'
      });
    }
    
    const { name, description, isPublic, coverImage } = req.body;
    
    if (name) collection.name = name;
    if (description !== undefined) collection.description = description;
    if (isPublic !== undefined) collection.isPublic = isPublic === 'true' || isPublic === true;
    if (coverImage) collection.coverImage = coverImage;
    
    await collection.save();
    
    res.json({
      success: true,
      data: collection
    });
  } catch (error) {
    console.error('Update collection error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật collection: ' + error.message
    });
  }
};

// @desc    Delete collection
// @route   DELETE /api/collections/:id
// @access  Private
exports.deleteCollection = async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id);
    
    if (!collection) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy collection'
      });
    }
    
    if (collection.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền xóa collection này'
      });
    }
    
    await collection.deleteOne();
    
    res.json({
      success: true,
      message: 'Xóa collection thành công'
    });
  } catch (error) {
    console.error('Delete collection error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa collection: ' + error.message
    });
  }
};

// @desc    Add post to collection
// @route   POST /api/collections/:id/posts/:postId
// @access  Private
exports.addPostToCollection = async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id);
    const post = await Post.findById(req.params.postId);
    
    if (!collection) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy collection'
      });
    }
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài đăng'
      });
    }
    
    if (collection.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền thêm vào collection này'
      });
    }
    
    // Check if post already in collection
    if (collection.posts.includes(req.params.postId)) {
      return res.status(400).json({
        success: false,
        message: 'Bài đăng đã có trong collection'
      });
    }
    
    collection.posts.push(req.params.postId);
    
    // Set cover image if not set
    if (!collection.coverImage && post.images && post.images.length > 0) {
      collection.coverImage = post.images[0];
    }
    
    await collection.save();
    
    res.json({
      success: true,
      data: collection
    });
  } catch (error) {
    console.error('Add post to collection error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi thêm bài đăng: ' + error.message
    });
  }
};

// @desc    Remove post from collection
// @route   DELETE /api/collections/:id/posts/:postId
// @access  Private
exports.removePostFromCollection = async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id);
    
    if (!collection) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy collection'
      });
    }
    
    if (collection.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền xóa khỏi collection này'
      });
    }
    
    collection.posts = collection.posts.filter(
      p => p.toString() !== req.params.postId
    );
    
    await collection.save();
    
    res.json({
      success: true,
      data: collection
    });
  } catch (error) {
    console.error('Remove post from collection error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa bài đăng: ' + error.message
    });
  }
};

