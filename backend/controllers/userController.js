const User = require('../models/User');
const Product = require('../models/Product');
const Review = require('../models/Review');

// @desc    Get user profile
// @route   GET /api/users/profile/:id
// @access  Private
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, address, avatar, studentId, bio, nickname } = req.body;
    const userId = req.user.id;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Tên không được để trống'
      });
    }

    if (phone && !/^[0-9+\-\s()]+$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Số điện thoại không hợp lệ'
      });
    }

    // Validate avatar URL or data URL
    if (avatar && !avatar.startsWith('data:') && !/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(avatar)) {
      return res.status(400).json({
        success: false,
        message: 'URL ảnh đại diện không hợp lệ'
      });
    }

    // Validate bio length (max 60 words)
    if (bio) {
      const wordCount = bio.trim().split(/\s+/).filter(word => word.length > 0).length;
      if (wordCount > 60) {
        return res.status(400).json({
          success: false,
          message: 'Giới thiệu không được vượt quá 60 từ'
        });
      }
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    // Update fields
    user.name = name.trim();
    if (phone) user.phone = phone.trim();
    if (address) user.address = address.trim();
    if (avatar) user.avatar = avatar.trim();
    if (studentId) user.studentId = studentId.trim();
    if (bio !== undefined) user.bio = bio.trim();
    if (nickname) user.nickname = nickname.trim().toLowerCase().replace(/\s+/g, '-');

    console.log('Updating user avatar:', avatar ? 'Avatar provided' : 'No avatar');
    console.log('Avatar length:', avatar ? avatar.length : 0);

    const updatedUser = await user.save();

    // Return user without password
    const userData = updatedUser.toObject();
    delete userData.password;

    console.log('Updated user avatar in DB:', userData.avatar ? 'Avatar saved' : 'No avatar in DB');

    res.json({
      success: true,
      data: userData,
      message: 'Cập nhật thông tin thành công'
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user products
// @route   GET /api/users/products
// @access  Private
exports.getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ userId: req.user.id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Add to favorites
// @route   POST /api/users/favorites/:productId
// @access  Private
exports.addToFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user.favorites.includes(req.params.productId)) {
      user.favorites.push(req.params.productId);
      await user.save();

      // Update product favorite count
      const product = await Product.findById(req.params.productId);
      if (product) {
        product.favoriteCount += 1;
        await product.save();
      }
    }

    res.json({
      success: true,
      message: 'Đã thêm vào yêu thích'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Remove from favorites
// @route   DELETE /api/users/favorites/:productId
// @access  Private
exports.removeFromFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    user.favorites = user.favorites.filter(
      favorite => favorite.toString() !== req.params.productId
    );
    await user.save();

    // Update product favorite count
    const product = await Product.findById(req.params.productId);
    if (product) {
      product.favoriteCount = Math.max(0, product.favoriteCount - 1);
      await product.save();
    }

    res.json({
      success: true,
      message: 'Đã xóa khỏi yêu thích'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get favorites
// @route   GET /api/users/favorites
// @access  Private
exports.getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('favorites');

    res.json({
      success: true,
      data: user.favorites
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user stats
// @route   GET /api/users/stats
// @access  Private
exports.getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const productsCount = await Product.countDocuments({
      userId,
      status: 'Available'
    });
    const soldCount = await Product.countDocuments({
      userId,
      status: 'Sold'
    });
    const reviews = await Review.find({ reviewedUserId: userId });

    res.json({
      success: true,
      data: {
        activeProducts: productsCount,
        soldProducts: soldCount,
        reviews: reviews.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get public user profile
// @route   GET /api/users/:userId/public
// @access  Public
exports.getUserPublicProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('-password -verificationToken -resetPasswordToken -resetPasswordExpire')
      .populate('followers', 'name avatar')
      .populate('following', 'name avatar');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    // Tính join date
    const joinDate = new Date(user.createdAt);
    const now = new Date();
    const years = now.getFullYear() - joinDate.getFullYear();
    const months = now.getMonth() - joinDate.getMonth();
    const joinDuration = years > 0 
      ? `${years} năm ${months > 0 ? months : 0} tháng`
      : `${months} tháng`;

    res.json({
      success: true,
      data: {
        ...user.toObject(),
        followersCount: user.followers.length,
        followingCount: user.following.length,
        joinDuration
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user products by status
// @route   GET /api/users/:userId/products
// @access  Public
exports.getUserProducts = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status = 'Available', page = 1, limit = 12 } = req.query;

    const query = { 
      userId,
      status: { $ne: 'Deleted' },  // Không hiển thị sản phẩm đã xóa
      isApproved: true  // Chỉ hiển thị sản phẩm đã được duyệt (áp dụng cho tất cả)
    };
    
    if (status && status !== 'all') {
      query.status = status;
    }

    const products = await Product.find(query)
      .populate('userId', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      data: products,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Follow user
// @route   POST /api/users/:userId/follow
// @access  Private
exports.followUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    if (userId === currentUserId) {
      return res.status(400).json({
        success: false,
        message: 'Bạn không thể theo dõi chính mình'
      });
    }

    const userToFollow = await User.findById(userId);
    const currentUser = await User.findById(currentUserId);

    if (!userToFollow || !currentUser) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    // Check if already following
    if (userToFollow.followers.includes(currentUserId)) {
      return res.status(400).json({
        success: false,
        message: 'Bạn đã theo dõi người dùng này rồi'
      });
    }

    // Add to following and followers
    userToFollow.followers.push(currentUserId);
    currentUser.following.push(userId);

    await userToFollow.save();
    await currentUser.save();

    res.json({
      success: true,
      message: 'Đã theo dõi người dùng',
      data: {
        followersCount: userToFollow.followers.length,
        followingCount: currentUser.following.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Unfollow user
// @route   DELETE /api/users/:userId/follow
// @access  Private
exports.unfollowUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    const userToUnfollow = await User.findById(userId);
    const currentUser = await User.findById(currentUserId);

    if (!userToUnfollow || !currentUser) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    // Check if not following
    if (!userToUnfollow.followers.includes(currentUserId)) {
      return res.status(400).json({
        success: false,
        message: 'Bạn chưa theo dõi người dùng này'
      });
    }

    // Remove from following and followers
    userToUnfollow.followers = userToUnfollow.followers.filter(
      id => id.toString() !== currentUserId
    );
    currentUser.following = currentUser.following.filter(
      id => id.toString() !== userId
    );

    await userToUnfollow.save();
    await currentUser.save();

    res.json({
      success: true,
      message: 'Đã bỏ theo dõi người dùng',
      data: {
        followersCount: userToUnfollow.followers.length,
        followingCount: currentUser.following.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};






