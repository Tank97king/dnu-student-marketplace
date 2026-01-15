const Post = require('../models/Post');
const User = require('../models/User');
const Product = require('../models/Product');
const Hashtag = require('../models/Hashtag');
const { uploadToCloudinary } = require('../utils/uploadImage');

// Helper function to extract hashtags from text
const extractHashtags = (text) => {
  if (!text) return [];
  const hashtagRegex = /#[\w\u00C0-\u1EF9]+/g;
  const matches = text.match(hashtagRegex);
  return matches ? matches.map(tag => tag.substring(1).toLowerCase()) : [];
};

// Helper function to extract mentions from text
const extractMentions = async (text) => {
  if (!text) return [];
  const mentionRegex = /@(\w+)/g;
  const matches = [...text.matchAll(mentionRegex)];
  const usernames = matches.map(m => m[1]);
  
  // Find user IDs by username/email
  const users = await User.find({
    $or: [
      { email: { $in: usernames.map(u => `${u}@dnu.edu.vn`) } },
      { nickname: { $in: usernames } }
    ]
  }).select('_id');
  
  return users.map(u => u._id);
};

// Helper function to update hashtags
const updateHashtags = async (hashtags, postId, action = 'add') => {
  for (const tagName of hashtags) {
    if (action === 'add') {
      await Hashtag.findOneAndUpdate(
        { name: tagName },
        { 
          $addToSet: { posts: postId },
          $set: { lastUsedAt: new Date() }
        },
        { upsert: true, new: true }
      );
    } else {
      await Hashtag.findOneAndUpdate(
        { name: tagName },
        { $pull: { posts: postId } }
      );
    }
  }
};

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
exports.createPost = async (req, res) => {
  try {
    const { caption, price, category, condition, location, productId } = req.body;
    
    // Extract hashtags and mentions
    const hashtags = extractHashtags(caption);
    const mentions = await extractMentions(caption);
    
    // Handle image uploads
    let images = [];
    if (req.files && req.files.length > 0) {
      if (req.files.length > 10) {
        return res.status(400).json({
          success: false,
          message: 'Tối đa 10 ảnh cho mỗi bài đăng'
        });
      }
      
      try {
        const uploadPromises = req.files.map(file => 
          uploadToCloudinary(file.buffer, 'dnu-marketplace/posts')
        );
        const results = await Promise.all(uploadPromises);
        images = results.map(result => result.secure_url);
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        return res.status(500).json({
          success: false,
          message: 'Lỗi khi upload hình ảnh: ' + uploadError.message
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng upload ít nhất 1 hình ảnh'
      });
    }
    
    // Create post
    const postData = {
      userId: req.user.id,
      images,
      caption: caption || '',
      hashtags,
      mentions,
      price: price ? parseFloat(price) : undefined,
      category,
      condition,
      location,
      productId: productId || null,
      isApproved: req.user.isAdmin || req.user.isSuperAdmin ? true : false
    };
    
    const post = await Post.create(postData);
    
    // Update hashtags
    if (hashtags.length > 0) {
      await updateHashtags(hashtags, post._id, 'add');
    }
    
    // Update user post count
    await User.findByIdAndUpdate(req.user.id, { $inc: { postCount: 1 } });
    
    // Link post to product if productId provided
    if (productId) {
      await Product.findByIdAndUpdate(productId, { postId: post._id });
    }
    
    // Populate and return
    await post.populate('userId', 'name avatar nickname');
    
    // Send notification via Socket.IO if available
    const io = req.app.get('io');
    if (io && !post.isApproved) {
      // Notify admins about pending post
      io.to('admins').emit('new-pending-post', {
        postId: post._id,
        userId: post.userId._id,
        userName: post.userId.name
      });
    }
    
    res.status(201).json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo bài đăng: ' + error.message
    });
  }
};

// @desc    Get all posts (Feed)
// @route   GET /api/posts
// @access  Public (or Private for personalized feed)
exports.getPosts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      userId,
      hashtag,
      sort = '-createdAt'
    } = req.query;
    
    const query = { isApproved: true, status: 'available' };
    
    if (category) {
      query.category = category;
    }
    
    if (userId) {
      query.userId = userId;
    }
    
    if (hashtag) {
      query.hashtags = hashtag.toLowerCase();
    }
    
    // If user is logged in, can show personalized feed
    if (req.user) {
      // Could add logic to show posts from followed users
      // For now, show all approved posts
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const posts = await Post.find(query)
      .populate('userId', 'name avatar nickname')
      .populate('productId')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Post.countDocuments(query);
    
    res.json({
      success: true,
      data: posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách bài đăng: ' + error.message
    });
  }
};

// @desc    Get single post
// @route   GET /api/posts/:id
// @access  Public
exports.getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('userId', 'name avatar nickname bio')
      .populate('productId')
      .populate('mentions', 'name avatar');
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài đăng'
      });
    }
    
    // Increment view count
    post.viewCount += 1;
    await post.save();
    
    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy bài đăng: ' + error.message
    });
  }
};

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private
exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài đăng'
      });
    }
    
    // Check ownership or admin
    if (post.userId.toString() !== req.user.id && !req.user.isAdmin && !req.user.isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền chỉnh sửa bài đăng này'
      });
    }
    
    const { caption, price, category, condition, location } = req.body;
    
    // Handle new images if provided
    if (req.files && req.files.length > 0) {
      if (req.files.length > 10) {
        return res.status(400).json({
          success: false,
          message: 'Tối đa 10 ảnh cho mỗi bài đăng'
        });
      }
      
      try {
        const uploadPromises = req.files.map(file => 
          uploadToCloudinary(file.buffer, 'dnu-marketplace/posts')
        );
        const results = await Promise.all(uploadPromises);
        post.images = results.map(result => result.secure_url);
      } catch (uploadError) {
        return res.status(500).json({
          success: false,
          message: 'Lỗi khi upload hình ảnh: ' + uploadError.message
        });
      }
    }
    
    // Update old hashtags
    if (post.hashtags.length > 0) {
      await updateHashtags(post.hashtags, post._id, 'remove');
    }
    
    // Extract new hashtags and mentions
    const newHashtags = extractHashtags(caption);
    const newMentions = await extractMentions(caption);
    
    // Update post
    if (caption !== undefined) post.caption = caption;
    if (price !== undefined) post.price = parseFloat(price);
    if (category) post.category = category;
    if (condition) post.condition = condition;
    if (location) post.location = location;
    post.hashtags = newHashtags;
    post.mentions = newMentions;
    
    await post.save();
    
    // Update new hashtags
    if (newHashtags.length > 0) {
      await updateHashtags(newHashtags, post._id, 'add');
    }
    
    await post.populate('userId', 'name avatar nickname');
    
    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật bài đăng: ' + error.message
    });
  }
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài đăng'
      });
    }
    
    // Check ownership or admin
    if (post.userId.toString() !== req.user.id && !req.user.isAdmin && !req.user.isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền xóa bài đăng này'
      });
    }
    
    // Remove from hashtags
    if (post.hashtags.length > 0) {
      await updateHashtags(post.hashtags, post._id, 'remove');
    }
    
    // Update user post count
    await User.findByIdAndUpdate(post.userId, { $inc: { postCount: -1 } });
    
    // Remove postId from product if linked
    if (post.productId) {
      await Product.findByIdAndUpdate(post.productId, { $unset: { postId: 1 } });
    }
    
    await post.deleteOne();
    
    res.json({
      success: true,
      message: 'Xóa bài đăng thành công'
    });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa bài đăng: ' + error.message
    });
  }
};

// @desc    Like/Unlike post
// @route   POST /api/posts/:id/like
// @access  Private
exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài đăng'
      });
    }
    
    const userId = req.user.id;
    const isLiked = post.likes.includes(userId);
    
    if (isLiked) {
      // Unlike
      post.likes = post.likes.filter(id => id.toString() !== userId);
    } else {
      // Like
      post.likes.push(userId);
    }
    
    await post.save();
    
    // Send notification via Socket.IO
    const io = req.app.get('io');
    if (io && !isLiked && post.userId.toString() !== userId) {
      io.to(`user-${post.userId}`).emit('post-liked', {
        postId: post._id,
        userId: req.user.id,
        userName: req.user.name
      });
    }
    
    res.json({
      success: true,
      data: {
        isLiked: !isLiked,
        likeCount: post.likeCount
      }
    });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi like bài đăng: ' + error.message
    });
  }
};

// @desc    Get users who liked the post
// @route   GET /api/posts/:id/likes
// @access  Public
exports.getPostLikes = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('likes', 'name avatar nickname');
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài đăng'
      });
    }
    
    res.json({
      success: true,
      data: post.likes
    });
  } catch (error) {
    console.error('Get post likes error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách like: ' + error.message
    });
  }
};

// @desc    Share post
// @route   POST /api/posts/:id/share
// @access  Private
exports.sharePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài đăng'
      });
    }
    
    post.shareCount += 1;
    await post.save();
    
    // Send notification via Socket.IO
    const io = req.app.get('io');
    if (io && post.userId.toString() !== req.user.id) {
      io.to(`user-${post.userId}`).emit('post-shared', {
        postId: post._id,
        userId: req.user.id,
        userName: req.user.name
      });
    }
    
    res.json({
      success: true,
      data: {
        shareCount: post.shareCount
      }
    });
  } catch (error) {
    console.error('Share post error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi share bài đăng: ' + error.message
    });
  }
};

// @desc    Get posts by user
// @route   GET /api/posts/user/:userId
// @access  Public
exports.getUserPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const posts = await Post.find({
      userId: req.params.userId,
      isApproved: true
    })
      .populate('userId', 'name avatar nickname')
      .populate('productId', 'title price')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Post.countDocuments({
      userId: req.params.userId,
      isApproved: true
    });
    
    res.json({
      success: true,
      data: posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy bài đăng của người dùng: ' + error.message
    });
  }
};

// @desc    Get posts by hashtag
// @route   GET /api/posts/hashtag/:hashtag
// @access  Public
exports.getPostsByHashtag = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const hashtag = req.params.hashtag.toLowerCase();
    
    const posts = await Post.find({
      hashtags: hashtag,
      isApproved: true,
      status: 'available'
    })
      .populate('userId', 'name avatar nickname')
      .populate('productId', 'title price')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Post.countDocuments({
      hashtags: hashtag,
      isApproved: true,
      status: 'available'
    });
    
    res.json({
      success: true,
      data: posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get posts by hashtag error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy bài đăng theo hashtag: ' + error.message
    });
  }
};

