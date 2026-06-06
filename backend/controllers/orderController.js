const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const { createAndEmitNotification } = require('../utils/notifications');

const mapProductCategoryToCouponCategory = (productCat) => {
  const mapping = {
    'Sách': 'Books',
    'Điện tử': 'Electronics',
    'Nội thất': 'Furniture',
    'Quần áo': 'Clothing',
    'Văn phòng phẩm': 'Stationery',
    'Thể thao': 'Sports',
    'Khác': 'Other'
  };
  return mapping[productCat] || 'Other';
};

const getOrCreatePaymentForOrder = async (order) => {
  const Payment = require('../models/Payment');
  const User = require('../models/User');
  let payment = await Payment.findOne({ orderId: order._id });
  if (!payment) {
    const buyer = await User.findById(order.buyerId);
    const generateTransactionCode = require('../utils/generateTransactionCode');
    
    // Generate transaction code
    let transactionCode;
    let isUnique = false;
    let attempts = 0;
    while (!isUnique && attempts < 10) {
      transactionCode = generateTransactionCode();
      const existing = await Payment.findOne({ transactionCode });
      if (!existing) isUnique = true;
      attempts++;
    }
    
    const PLATFORM_FEE_PERCENT = 5;
    const VAT_PERCENT = 10;
    const amount = order.finalPrice;
    const platformFee = Math.round(amount * PLATFORM_FEE_PERCENT / 100);
    const vatAmount = Math.round(platformFee * VAT_PERCENT / 100);
    const sellerAmount = amount - platformFee - vatAmount;
    
    payment = await Payment.create({
      orderId: order._id,
      buyerId: order.buyerId,
      buyerName: buyer?.name || 'Người mua',
      buyerPhone: buyer?.phone || '',
      amount,
      platformFeePercent: PLATFORM_FEE_PERCENT,
      vatPercent: VAT_PERCENT,
      platformFee,
      vatAmount,
      sellerAmount,
      transactionCode,
      shippingAddress: order.shippingAddress,
      status: 'pending'
    });
  }
  return payment;
};

const handleSellerApproval = async (order, userId, req) => {
  const payment = await getOrCreatePaymentForOrder(order);

  // Update seller approval on payment
  payment.sellerApproved = true;
  payment.sellerApprovedBy = userId;
  payment.sellerApprovedAt = new Date();
  await payment.save();

  let message = 'Đã xác nhận đơn hàng từ phía người bán';

  // Check if admin has also approved
  if (payment.adminApproved) {
    order.status = 'confirmed';
    order.confirmedAt = new Date();
    await order.save();

    if (payment.paymentProof) {
      payment.status = 'confirmed';
      payment.confirmedBy = userId;
      payment.confirmedAt = new Date();
    } else {
      payment.status = 'pending';
    }
    await payment.save();

    // Tự động đánh dấu sản phẩm là "Đã bán"
    if (order.productId) {
      await Product.findByIdAndUpdate(order.productId._id || order.productId, {
        status: 'Sold'
      });
    }

    message = 'Đã xác nhận đơn hàng thành công (Cả Người bán và Admin đều đã phê duyệt)';

    // Create notification for buyer
    const io = req.app.get('io');
    if (io) {
      await createAndEmitNotification(
        io,
        order.buyerId,
        'order_confirmed',
        'Đơn hàng đã được xác nhận',
        `Người bán và Admin đã xác nhận đơn hàng cho sản phẩm "${order.productId.title}"`,
        { orderId: order._id, productId: order.productId._id, productName: order.productId.title }
      );
    }
  } else {
    message = 'Đã xác nhận đơn hàng từ phía người bán. Đang chờ Admin phê duyệt thanh toán để hoàn tất.';
    
    // Notify Admin
    const io = req.app.get('io');
    if (io) {
      const User = require('../models/User');
      const admins = await User.find({ isAdmin: true, isActive: true });
      for (const admin of admins) {
        await createAndEmitNotification(
          io,
          admin._id,
          'payment_pending_review',
          'Người bán đã xác nhận đơn hàng',
          `Người bán đã duyệt đơn hàng. Vui lòng phê duyệt thanh toán cho mã GD: ${payment.transactionCode}`,
          { paymentId: payment._id, orderId: order._id }
        );
      }
    }
  }

  return {
    success: true,
    message
  };
};

// @desc    Create direct order (Buy Now)
// @route   POST /api/orders
// @access  Private
exports.createDirectOrder = async (req, res) => {
  try {
    const { productId, shippingAddress, deliveryMethod, paymentMethod, notes, couponCode } = req.body;
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

    // Process coupon if present
    let finalPrice = product.price;
    let discountAmount = 0;
    let coupon = null;

    if (couponCode) {
      coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
      if (!coupon) {
        return res.status(404).json({
          success: false,
          message: 'Mã giảm giá không tồn tại'
        });
      }

      const mappedCategory = product.category ? mapProductCategoryToCouponCategory(product.category) : undefined;
      const validation = coupon.validateCoupon(buyerId, product.price, mappedCategory);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: validation.errors[0]
        });
      }

      discountAmount = coupon.calculateDiscount(product.price);
      finalPrice = product.price - discountAmount;
    }

    // Create order with final price (possibly discounted)
    const order = await Order.create({
      buyerId,
      sellerId: product.userId._id,
      productId: product._id,
      finalPrice,
      couponId: coupon ? coupon._id : null,
      couponCode: coupon ? coupon.code : null,
      discountAmount,
      status: 'pending',
      shippingAddress: shippingAddress || {
        fullName: req.user.name,
        phone: req.user.phone,
        address: req.user.address || ''
      },
      deliveryMethod: 'delivery',
      paymentMethod: paymentMethod || 'transfer',
      notes: notes || ''
    });

    // Increment coupon usedCount if coupon was applied
    if (coupon) {
      coupon.usedCount += 1;
      await coupon.save();
    }

    // Mark product as sold
    await Product.findByIdAndUpdate(productId, {
      status: 'Sold'
    });

    // Automatically create payment record so it is visible to admin/seller immediately
    await getOrCreatePaymentForOrder(order);

    // Create notification for seller AND admins
    const io = req.app.get('io');
    if (io) {
      // Notify seller
      await createAndEmitNotification(
        io,
        product.userId._id,
        'new_order',
        'Có đơn hàng mới',
        `${req.user.name} đã đặt mua "${product.title}" với giá ${finalPrice.toLocaleString('vi-VN')} ₫`,
        { orderId: order._id, productId, productName: product.title }
      );

      // Notify all admins
      const User = require('../models/User');
      const admins = await User.find({ isAdmin: true, isActive: true });
      for (const admin of admins) {
        await createAndEmitNotification(
          io,
          admin._id,
          'new_order',
          'Có đơn hàng mới cần xét duyệt',
          `${req.user.name} vừa đặt mua "${product.title}" - ${finalPrice.toLocaleString('vi-VN')} ₫. Vui lòng kiểm tra và phê duyệt.`,
          { orderId: order._id, productId, productName: product.title }
        );
      }
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

    // Call helper
    const approvalResult = await handleSellerApproval(order, req.user.id, req);
    if (!approvalResult.success) {
      return res.status(400).json({
        success: false,
        message: approvalResult.message
      });
    }

    const populatedOrder = await Order.findById(order._id)
      .populate('buyerId', 'name avatar')
      .populate('sellerId', 'name avatar')
      .populate('productId', 'title images price')
      .populate('payment');

    res.json({
      success: true,
      data: populatedOrder,
      message: approvalResult.message
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
      .populate('payment')
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
      .populate('offerId')
      .populate('payment');

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
    if (status === 'completed' && !['confirmed', 'picked_up'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Chỉ có thể hoàn thành đơn hàng đã được xác nhận hoặc đang giao hàng'
      });
    }

    if (status === 'confirmed') {
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
        
        await Product.findByIdAndUpdate(order.productId, {
          status: 'Available'
        });

        return res.status(400).json({
          success: false,
          message: 'Đơn hàng đã hết hạn và đã được tự động hủy'
        });
      }

      // Call helper
      const approvalResult = await handleSellerApproval(order, req.user.id, req);
      if (!approvalResult.success) {
        return res.status(400).json({
          success: false,
          message: approvalResult.message
        });
      }

      const populatedOrder = await Order.findById(order._id)
        .populate('buyerId', 'name avatar')
        .populate('sellerId', 'name avatar')
        .populate('productId', 'title images price')
        .populate('payment');

      return res.json({
        success: true,
        data: populatedOrder,
        message: approvalResult.message
      });
    }

    if (status === 'cancelled') {
      if (order.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Chỉ có thể hủy đơn hàng khi đang ở trạng thái chờ thanh toán/xác nhận (pending)'
        });
      }
      order.cancelledAt = new Date();
      order.cancelledBy = req.user.id;
      
      // Make product available again
      await Product.findByIdAndUpdate(order.productId, {
        status: 'Available'
      });

      // If a payment exists, reject it
      const Payment = require('../models/Payment');
      const payment = await Payment.findOne({ orderId: order._id });
      if (payment) {
        payment.status = 'rejected';
        payment.rejectionReason = 'Người bán đã hủy đơn hàng';
        payment.adminApproved = false;
        payment.sellerApproved = false;
        await payment.save();
      }
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

// @desc    Người mua yêu cầu hoàn hàng
// @route   POST /api/orders/:id/return-request
// @access  Private (Buyer)
exports.requestReturn = async (req, res) => {
  try {
    const { returnReason } = req.body;
    const order = await Order.findById(req.params.id)
      .populate('productId', 'title');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }

    if (order.buyerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Chỉ người mua mới có thể yêu cầu hoàn hàng'
      });
    }

    if (order.status !== 'confirmed' && order.status !== 'picked_up') {
      return res.status(400).json({
        success: false,
        message: 'Chỉ có thể yêu cầu hoàn hàng cho đơn đã xác nhận hoặc đang giao hàng'
      });
    }

    // Kiểm tra trong vòng 3 ngày kể từ khi confirmedAt
    const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;
    const confirmedAt = order.confirmedAt || order.updatedAt;
    if (Date.now() - new Date(confirmedAt).getTime() > THREE_DAYS_MS) {
      return res.status(400).json({
        success: false,
        message: 'Đã quá thời hạn yêu cầu hoàn hàng (3 ngày kể từ khi xác nhận)'
      });
    }

    if (!returnReason || !returnReason.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập lý do hoàn hàng'
      });
    }

    order.status = 'return_requested';
    order.returnReason = returnReason;
    order.returnRequestedAt = new Date();
    await order.save();

    // Notify seller and admins
    const io = req.app.get('io');
    if (io) {
      await createAndEmitNotification(
        io, order.sellerId,
        'return_requested',
        'Người mua yêu cầu hoàn hàng',
        `Người mua yêu cầu hoàn hàng "${order.productId?.title}". Lý do: ${returnReason}`,
        { orderId: order._id }
      );
      const User = require('../models/User');
      const admins = await User.find({ isAdmin: true, isActive: true });
      for (const admin of admins) {
        await createAndEmitNotification(
          io, admin._id,
          'return_requested',
          'Yêu cầu hoàn hàng mới',
          `Có yêu cầu hoàn hàng cho đơn "${order.productId?.title}". Lý do: ${returnReason}`,
          { orderId: order._id }
        );
      }
    }

    res.json({
      success: true,
      message: 'Đã gửi yêu cầu hoàn hàng. Admin sẽ xem xét trong thời gian sớm nhất.'
    });
  } catch (error) {
    console.error('Error requesting return:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin duyệt hoàn hàng
// @route   PUT /api/orders/:id/return-approve
// @access  Admin
exports.approveReturn = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('productId', 'title _id');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }

    if (order.status !== 'return_requested') {
      return res.status(400).json({
        success: false,
        message: 'Đơn hàng này không có yêu cầu hoàn hàng'
      });
    }

    order.status = 'returned';
    order.returnApprovedAt = new Date();
    order.returnApprovedBy = req.user.id;
    await order.save();

    // Đưa sản phẩm về lại Available
    if (order.productId) {
      await Product.findByIdAndUpdate(order.productId._id || order.productId, {
        status: 'Available'
      });
    }

    const io = req.app.get('io');
    if (io) {
      await createAndEmitNotification(
        io, order.buyerId,
        'return_approved',
        'Yêu cầu hoàn hàng được chấp thuận',
        `Admin đã chấp thuận hoàn hàng cho đơn "${order.productId?.title}". Sản phẩm đã được mở bán lại.`,
        { orderId: order._id }
      );
      await createAndEmitNotification(
        io, order.sellerId,
        'return_approved',
        'Đơn hàng bị hoàn',
        `Đơn hàng "${order.productId?.title}" đã bị Admin chấp thuận hoàn. Sản phẩm đã được mở bán lại.`,
        { orderId: order._id }
      );
    }

    res.json({ success: true, message: 'Đã duyệt hoàn hàng. Sản phẩm mở bán trở lại.' });
  } catch (error) {
    console.error('Error approving return:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin từ chối hoàn hàng
// @route   PUT /api/orders/:id/return-reject
// @access  Admin
exports.rejectReturn = async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    const order = await Order.findById(req.params.id)
      .populate('productId', 'title');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }

    if (order.status !== 'return_requested') {
      return res.status(400).json({
        success: false,
        message: 'Đơn hàng này không có yêu cầu hoàn hàng'
      });
    }

    order.status = 'confirmed'; // Quay về confirmed
    order.returnRejectedAt = new Date();
    order.returnRejectedBy = req.user.id;
    order.returnRejectionReason = rejectionReason || 'Không đủ điều kiện hoàn hàng';
    await order.save();

    const io = req.app.get('io');
    if (io) {
      await createAndEmitNotification(
        io, order.buyerId,
        'return_rejected',
        'Yêu cầu hoàn hàng bị từ chối',
        `Admin đã từ chối hoàn hàng cho đơn "${order.productId?.title}". Lý do: ${order.returnRejectionReason}`,
        { orderId: order._id }
      );
    }

    res.json({ success: true, message: 'Đã từ chối yêu cầu hoàn hàng.' });
  } catch (error) {
    console.error('Error rejecting return:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin lấy danh sách yêu cầu hoàn hàng
// @route   GET /api/orders/return-requests
// @access  Admin
exports.getReturnRequests = async (req, res) => {
  try {
    const orders = await Order.find({ status: 'return_requested' })
      .populate('buyerId', 'name avatar email phone')
      .populate('sellerId', 'name avatar')
      .populate('productId', 'title images price')
      .sort({ returnRequestedAt: -1 });

    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    console.error('Error getting return requests:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin lấy tất cả đơn hàng (để phân công shipper)
// @route   GET /api/orders/admin/all
// @access  Admin
exports.getAllOrdersForAdmin = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('buyerId', 'name email phone avatar')
      .populate('sellerId', 'name email phone avatar')
      .populate('productId', 'title images price')
      .populate('shipperId', 'name phone email avatar')
      .populate('payment')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    console.error('Error getting all orders for admin:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
