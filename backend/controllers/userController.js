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
    const { name, phone, address, avatar, studentId } = req.body;
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






