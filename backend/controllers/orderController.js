const Order = require('../models/Order');
const Product = require('../models/Product');
const { createAndEmitNotification } = require('../utils/notifications');

// @desc    Create direct order (Buy Now)
// @route   POST /api/orders
// @access  Private
exports.createDirectOrder = async (req, res) => {
  try {
    const { productId, shippingAddress, deliveryMethod, notes } = req.body;
    const buyerId = req.user.id;

    // Validate product
    const product = await Product.findById(productId).populate('userId', 'name');
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Sản phẩm không tồn tại'
      });
    }

    if (product.userId._id.toString() === buyerId) {
      return res.status(400).json({
        success: false,
        message: 'Bạn không thể mua sản phẩm của chính mình'
      });
    }

    if (product.status !== 'Available') {
      return res.status(400).json({
        success: false,
        message: 'Sản phẩm không còn khả dụng'
      });
    }

    // Check if there's already a pending order for this product
    const existingOrder = await Order.findOne({
      productId,
      status: 'pending',
      buyerId: { $ne: buyerId }
    });

    if (existingOrder) {
      return res.status(400).json({
        success: false,
        message: 'Sản phẩm này đã có đơn hàng đang chờ xử lý'
      });
    }

    // Create order with original price
    const order = await Order.create({
      buyerId,
      sellerId: product.userId._id,
      productId: product._id,
      finalPrice: product.price,
      status: 'pending',
      shippingAddress: shippingAddress || {
        fullName: req.user.name,
        phone: req.user.phone,
        address: req.user.address || ''
      },
      deliveryMethod: deliveryMethod || 'meetup',
      notes: notes || ''
    });

    // Mark product as sold
    await Product.findByIdAndUpdate(productId, {
      status: 'Sold'
    });

    // Create notification for seller
    const io = req.app.get('io');
    if (io) {
      await createAndEmitNotification(
        io,
        product.userId._id,
        'new_order',
        'Có đơn hàng mới',
        `${req.user.name} đã đặt mua "${product.title}" với giá ${product.price.toLocaleString('vi-VN')} ₫`,
        { orderId: order._id, productId, productName: product.title }
      );
    }

    const populatedOrder = await Order.findById(order._id)
      .populate('buyerId', 'name avatar')
      .populate('sellerId', 'name avatar')
      .populate('productId', 'title images price');

    res.status(201).json({
      success: true,
      data: populatedOrder,
      message: 'Đã tạo đơn hàng thành công'
    });
  } catch (error) {
    console.error('Error creating direct order:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Confirm order (by seller)
// @route   PUT /api/orders/:id/confirm
// @access  Private
exports.confirmOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('productId', 'title');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    // Check if user is seller
    if (order.sellerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Chỉ người bán mới có thể xác nhận đơn hàng'
      });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Chỉ có thể xác nhận đơn hàng đang chờ xử lý'
      });
    }

    // Check if order expired
    if (order.expiresAt && order.expiresAt < new Date()) {
      order.status = 'cancelled';
      order.cancelledAt = new Date();
      order.cancellationReason = 'Tự động hủy do hết thời gian xác nhận';
      await order.save();
      
      // Make product available again
      await Product.findByIdAndUpdate(order.productId, {
        status: 'Available'
      });

      return res.status(400).json({
        success: false,
        message: 'Đơn hàng đã hết hạn và đã được tự động hủy'
      });
    }

    order.status = 'confirmed';
    order.confirmedAt = new Date();
    await order.save();

    // Create notification for buyer
    const io = req.app.get('io');
    if (io) {
      await createAndEmitNotification(
        io,
        order.buyerId,
        'order_confirmed',
        'Đơn hàng đã được xác nhận',
        `Người bán đã xác nhận đơn hàng cho sản phẩm "${order.productId.title}"`,
        { orderId: order._id, productId: order.productId._id, productName: order.productId.title }
      );
    }

    const populatedOrder = await Order.findById(order._id)
      .populate('buyerId', 'name avatar')
      .populate('sellerId', 'name avatar')
      .populate('productId', 'title images price');

    res.json({
      success: true,
      data: populatedOrder,
      message: 'Đã xác nhận đơn hàng'
    });
  } catch (error) {
    console.error('Error confirming order:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get orders
// @route   GET /api/orders
// @access  Private
exports.getOrders = async (req, res) => {
  try {
    const { type = 'all', status } = req.query; // 'buying', 'selling', 'all'
    const userId = req.user.id;

    let query = {};
    if (type === 'buying') {
      query.buyerId = userId;
    } else if (type === 'selling') {
      query.sellerId = userId;
    } else {
      query.$or = [{ buyerId: userId }, { sellerId: userId }];
    }

    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('buyerId', 'name avatar')
      .populate('sellerId', 'name avatar')
      .populate('productId', 'title images price')
      .populate('offerId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Error getting orders:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('buyerId', 'name avatar email phone')
      .populate('sellerId', 'name avatar email phone')
      .populate('productId', 'title images price description')
      .populate('offerId');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    // Check if user has access
    if (order.buyerId._id.toString() !== req.user.id && order.sellerId._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xem đơn hàng này'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error getting order:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    // Check permissions
    const isBuyer = order.buyerId.toString() === req.user.id;
    const isSeller = order.sellerId.toString() === req.user.id;

    if (!isBuyer && !isSeller) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền cập nhật đơn hàng này'
      });
    }

    // Validate status transitions
    if (status === 'completed' && order.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'Chỉ có thể hoàn thành đơn hàng đã được xác nhận'
      });
    }

    if (status === 'cancelled') {
      if (order.status === 'completed') {
        return res.status(400).json({
          success: false,
          message: 'Không thể hủy đơn hàng đã hoàn thành'
        });
      }
      order.cancelledAt = new Date();
      order.cancelledBy = req.user.id;
      
      // Make product available again
      await Product.findByIdAndUpdate(order.productId, {
        status: 'Available'
      });
    }

    if (status === 'completed') {
      order.completedAt = new Date();
    }

    order.status = status;
    await order.save();

    res.json({
      success: true,
      data: order,
      message: 'Đã cập nhật trạng thái đơn hàng'
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

