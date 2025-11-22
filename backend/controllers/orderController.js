const Order = require('../models/Order');
const Product = require('../models/Product');

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

