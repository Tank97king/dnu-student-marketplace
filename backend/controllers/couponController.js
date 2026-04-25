const Coupon = require('../models/Coupon');
const User = require('../models/User');
const { createAndEmitNotification } = require('../utils/notifications');

// @desc    Create a new coupon
// @route   POST /api/admin/coupons
// @access  Admin
exports.createCoupon = async (req, res) => {
  try {
    const {
      code,
      discountType,
      discountValue,
      minPurchase,
      maxDiscount,
      description,
      expiryDate,
      usageLimit,
      applicableCategories,
      applicableUsers
    } = req.body;

    // Validate required fields
    if (!code || !discountType || !discountValue || !expiryDate) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin bắt buộc (mã, loại giảm giá, giá trị, ngày hết hạn)'
      });
    }

    // Validate discount value based on type
    if (discountType === 'percentage' && (discountValue < 1 || discountValue > 100)) {
      return res.status(400).json({
        success: false,
        message: 'Phần trăm giảm giá phải từ 1% đến 100%'
      });
    }

    if (discountType === 'fixed' && discountValue <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Giá trị giảm giá cố định phải lớn hơn 0'
      });
    }

    // Check if code already exists
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return res.status(400).json({
        success: false,
        message: 'Mã giảm giá này đã tồn tại'
      });
    }

    // Validate expiry date
    const expiry = new Date(expiryDate);
    if (expiry <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Ngày hết hạn phải sau ngày hiện tại'
      });
    }

    // Create coupon
    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      discountType,
      discountValue,
      minPurchase: minPurchase || 0,
      maxDiscount: maxDiscount || null,
      description: description || '',
      expiryDate: expiry,
      usageLimit: usageLimit || null,
      applicableCategories: applicableCategories || [],
      applicableUsers: applicableUsers || [],
      createdBy: req.user.id,
      isActive: true,
      usedCount: 0
    });

    // Send notification to all active users
    try {
      const io = req.app.get('io');
      const activeUsers = await User.find({ isActive: true }).select('_id');
      
      const discountText = discountType === 'percentage' 
        ? `${discountValue}%` 
        : `${discountValue.toLocaleString('vi-VN')} VNĐ`;
      
      const title = `🎟️ Mã giảm giá mới: ${coupon.code}`;
      const message = description 
        ? `${description}. Giảm ${discountText} cho đơn hàng tối thiểu ${minPurchase ? minPurchase.toLocaleString('vi-VN') : '0'} VNĐ. Hết hạn: ${expiry.toLocaleDateString('vi-VN')}`
        : `Mã giảm giá ${coupon.code} - Giảm ${discountText} cho đơn hàng tối thiểu ${minPurchase ? minPurchase.toLocaleString('vi-VN') : '0'} VNĐ. Hết hạn: ${expiry.toLocaleDateString('vi-VN')}`;

      // Send notification to each user
      const notificationPromises = activeUsers.map(user => 
        createAndEmitNotification(
          io,
          user._id,
          'new_coupon',
          title,
          message,
          { couponId: coupon._id, couponCode: coupon.code }
        )
      );

      await Promise.allSettled(notificationPromises);
      console.log(`✅ Sent coupon notification to ${activeUsers.length} users`);
    } catch (notificationError) {
      console.error('Error sending coupon notifications:', notificationError);
      // Don't fail the coupon creation if notification fails
    }

    res.status(201).json({
      success: true,
      data: coupon,
      message: 'Tạo mã giảm giá thành công và đã gửi thông báo cho tất cả người dùng'
    });
  } catch (error) {
    console.error('Error creating coupon:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Không thể tạo mã giảm giá'
    });
  }
};

// @desc    Get all coupons
// @route   GET /api/admin/coupons
// @access  Admin
exports.getAllCoupons = async (req, res) => {
  try {
    const { page = 1, limit = 10, status = 'all' } = req.query;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};
    
    if (status === 'active') {
      filter.isActive = true;
      filter.expiryDate = { $gt: new Date() };
    } else if (status === 'expired') {
      filter.$or = [
        { expiryDate: { $lte: new Date() } },
        { isActive: false }
      ];
    } else if (status === 'used') {
      filter.usedCount = { $gt: 0 };
    }

    const coupons = await Coupon.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Coupon.countDocuments(filter);

    res.json({
      success: true,
      count: coupons.length,
      total,
      data: coupons,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching coupons:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Không thể lấy danh sách mã giảm giá'
    });
  }
};

// @desc    Get coupon by ID
// @route   GET /api/admin/coupons/:id
// @access  Admin
exports.getCouponById = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('applicableUsers', 'name email');

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy mã giảm giá'
      });
    }

    res.json({
      success: true,
      data: coupon
    });
  } catch (error) {
    console.error('Error fetching coupon:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Không thể lấy thông tin mã giảm giá'
    });
  }
};

// @desc    Update coupon
// @route   PUT /api/admin/coupons/:id
// @access  Admin
exports.updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy mã giảm giá'
      });
    }

    const {
      code,
      discountType,
      discountValue,
      minPurchase,
      maxDiscount,
      description,
      expiryDate,
      usageLimit,
      isActive,
      applicableCategories,
      applicableUsers
    } = req.body;

    // Validate discount value if provided
    if (discountType || discountValue !== undefined) {
      const finalDiscountType = discountType || coupon.discountType;
      const finalDiscountValue = discountValue !== undefined ? discountValue : coupon.discountValue;

      if (finalDiscountType === 'percentage' && (finalDiscountValue < 1 || finalDiscountValue > 100)) {
        return res.status(400).json({
          success: false,
          message: 'Phần trăm giảm giá phải từ 1% đến 100%'
        });
      }

      if (finalDiscountType === 'fixed' && finalDiscountValue <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Giá trị giảm giá cố định phải lớn hơn 0'
        });
      }
    }

    // Check if code already exists (if changing code)
    if (code && code.toUpperCase() !== coupon.code) {
      const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
      if (existingCoupon) {
        return res.status(400).json({
          success: false,
          message: 'Mã giảm giá này đã tồn tại'
        });
      }
      coupon.code = code.toUpperCase();
    }

    // Update fields
    if (discountType !== undefined) coupon.discountType = discountType;
    if (discountValue !== undefined) coupon.discountValue = discountValue;
    if (minPurchase !== undefined) coupon.minPurchase = minPurchase;
    if (maxDiscount !== undefined) coupon.maxDiscount = maxDiscount;
    if (description !== undefined) coupon.description = description;
    if (expiryDate !== undefined) {
      const expiry = new Date(expiryDate);
      if (expiry <= new Date() && expiry !== coupon.expiryDate) {
        return res.status(400).json({
          success: false,
          message: 'Ngày hết hạn phải sau ngày hiện tại'
        });
      }
      coupon.expiryDate = expiry;
    }
    if (usageLimit !== undefined) coupon.usageLimit = usageLimit;
    if (isActive !== undefined) coupon.isActive = isActive;
    if (applicableCategories !== undefined) coupon.applicableCategories = applicableCategories;
    if (applicableUsers !== undefined) coupon.applicableUsers = applicableUsers;

    await coupon.save();

    res.json({
      success: true,
      data: coupon,
      message: 'Cập nhật mã giảm giá thành công'
    });
  } catch (error) {
    console.error('Error updating coupon:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Không thể cập nhật mã giảm giá'
    });
  }
};

// @desc    Delete coupon
// @route   DELETE /api/admin/coupons/:id
// @access  Admin
exports.deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy mã giảm giá'
      });
    }

    await coupon.deleteOne();

    res.json({
      success: true,
      message: 'Xóa mã giảm giá thành công'
    });
  } catch (error) {
    console.error('Error deleting coupon:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Không thể xóa mã giảm giá'
    });
  }
};

// @desc    Validate coupon code (for users)
// @route   POST /api/coupons/validate
// @access  Protected
exports.validateCoupon = async (req, res) => {
  try {
    const { code, amount, category } = req.body;
    const userId = req.user.id;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập mã giảm giá'
      });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Mã giảm giá không tồn tại'
      });
    }

    const validation = coupon.validateCoupon(userId, amount || 0, category);
    const discountAmount = validation.isValid ? coupon.calculateDiscount(amount || 0) : 0;

    res.json({
      success: validation.isValid,
      data: {
        coupon: {
          _id: coupon._id,
          code: coupon.code,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          description: coupon.description
        },
        discountAmount,
        finalAmount: (amount || 0) - discountAmount,
        validation
      },
      message: validation.isValid ? 'Mã giảm giá hợp lệ' : validation.errors[0]
    });
  } catch (error) {
    console.error('Error validating coupon:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Không thể xác thực mã giảm giá'
    });
  }
};

// @desc    Get available coupons for user
// @route   GET /api/coupons/available
// @access  Protected
exports.getAvailableCoupons = async (req, res) => {
  try {
    const { amount, category, includeExpired = false } = req.query;
    const userId = req.user.id;

    const now = new Date();
    
    // Build filter
    const filter = {};
    
    if (includeExpired === 'true') {
      // Get all active coupons (including expired) for user to see their history
      filter.isActive = true;
    } else {
      // Only get active and not expired coupons
      filter.isActive = true;
      filter.expiryDate = { $gt: now };
      filter.$or = [
        { usageLimit: null },
        { $expr: { $lt: ['$usedCount', '$usageLimit'] } }
      ];
    }
    
    const coupons = await Coupon.find(filter).sort({ createdAt: -1 });

    // Filter coupons that are applicable for the user
    const applicableCoupons = coupons.filter(coupon => {
      // Check if user is in applicable users list (if specified)
      if (coupon.applicableUsers && coupon.applicableUsers.length > 0) {
        if (!coupon.applicableUsers.some(id => id.toString() === userId.toString())) {
          return false;
        }
      }

      // Check category if specified
      if (category && coupon.applicableCategories && coupon.applicableCategories.length > 0) {
        if (!coupon.applicableCategories.includes(category)) {
          return false;
        }
      }

      // Check minimum purchase if amount is provided
      if (amount && coupon.minPurchase > 0) {
        if (parseFloat(amount) < coupon.minPurchase) {
          return false;
        }
      }

      return true;
    });

    // Calculate discount for each coupon if amount is provided
    const couponsWithDiscount = applicableCoupons.map(coupon => {
      const discount = amount ? coupon.calculateDiscount(parseFloat(amount)) : 0;
      return {
        _id: coupon._id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        description: coupon.description,
        minPurchase: coupon.minPurchase,
        expiryDate: coupon.expiryDate,
        discountAmount: discount,
        finalAmount: amount ? parseFloat(amount) - discount : 0
      };
    });

    res.json({
      success: true,
      count: couponsWithDiscount.length,
      data: couponsWithDiscount
    });
  } catch (error) {
    console.error('Error fetching available coupons:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Không thể lấy danh sách mã giảm giá'
    });
  }
};
