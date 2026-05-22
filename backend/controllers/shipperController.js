const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { createAndEmitNotification } = require('../utils/notifications');
const { uploadToCloudinary } = require('../utils/uploadImage');

// @desc    Đăng ký làm shipper
// @route   POST /api/shipper/apply
// @access  Private
exports.applyShipper = async (req, res) => {
  try {
    const { idCard, vehicleType, operatingArea, bio } = req.body;
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (user.isShipper || user.shipperStatus === 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Bạn đã đăng ký hoặc đang chờ duyệt làm Shipper'
      });
    }

    if (!idCard || !operatingArea) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp số CMND/CCCD và khu vực hoạt động'
      });
    }

    user.shipperStatus = 'pending';
    user.shipperInfo = {
      idCard,
      vehicleType: vehicleType || 'motorbike',
      operatingArea,
      bio: bio || '',
      appliedAt: new Date()
    };
    await user.save();

    // Notify admins
    const io = req.app.get('io');
    if (io) {
      const admins = await User.find({ isAdmin: true, isActive: true });
      for (const admin of admins) {
        await createAndEmitNotification(
          io, admin._id,
          'shipper_application',
          'Đơn đăng ký Shipper mới',
          `${user.name} đã nộp đơn đăng ký làm Shipper. Khu vực: ${operatingArea}`,
          { userId: user._id }
        );
      }
    }

    res.json({
      success: true,
      message: 'Đã nộp đơn đăng ký làm Shipper. Admin sẽ xét duyệt trong thời gian sớm nhất.'
    });
  } catch (error) {
    console.error('Error applying shipper:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Shipper cập nhật thông tin nhận lương (Bank QR)
// @route   PUT /api/shipper/bank
// @access  Private
exports.updateShipperBank = async (req, res) => {
  try {
    const { bankName, accountNumber, accountHolder } = req.body;
    const userId = req.user.id;

    if (!bankName || !accountNumber || !accountHolder) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ thông tin: tên ngân hàng, số tài khoản, chủ tài khoản'
      });
    }

    let qrCodeImage = undefined;
    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.buffer, 'dnu-marketplace/shipper-qr');
      qrCodeImage = uploadResult.secure_url;
    }

    const user = await User.findById(userId);
    if (!user || !user.isShipper) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền thực hiện chức năng này' });
    }

    if (!user.shipperInfo) {
      user.shipperInfo = {};
    }

    user.shipperInfo.bankAccount = {
      ...user.shipperInfo.bankAccount,
      bankName,
      accountNumber,
      accountHolder,
      ...(qrCodeImage && { qrCodeImage })
    };

    // Nếu là lần đầu tiên cập nhật mà không có file upload
    if (!user.shipperInfo.bankAccount.qrCodeImage && !qrCodeImage) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng upload ảnh QR code nhận tiền'
      });
    }

    await user.save();

    res.json({
      success: true,
      message: 'Cập nhật thông tin nhận lương thành công',
      data: user.shipperInfo.bankAccount
    });
  } catch (error) {
    console.error('Error updating shipper bank:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin lấy danh sách shipper
// @route   GET /api/shipper/list
// @access  Admin
exports.getShipperList = async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    if (status) {
      query.shipperStatus = status;
    } else {
      query.shipperStatus = { $in: ['pending', 'approved', 'rejected', 'suspended'] };
    }

    const shippers = await User.find(query)
      .select('name email phone avatar shipperStatus shipperInfo createdAt isActive')
      .sort({ 'shipperInfo.appliedAt': -1 });

    res.json({ success: true, count: shippers.length, data: shippers });
  } catch (error) {
    console.error('Error getting shipper list:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin duyệt shipper
// @route   PUT /api/shipper/:id/approve
// @access  Admin
exports.approveShipper = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    if (user.shipperStatus !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Người dùng này không có đơn đăng ký đang chờ'
      });
    }

    user.isShipper = true;
    user.shipperStatus = 'approved';
    await user.save();

    const io = req.app.get('io');
    if (io) {
      await createAndEmitNotification(
        io, user._id,
        'shipper_approved',
        'Đơn đăng ký Shipper được duyệt!',
        'Chúc mừng! Bạn đã được phê duyệt làm Shipper. Hãy kiểm tra trang Shipper Dashboard.',
        {}
      );
    }

    res.json({
      success: true,
      message: `Đã phê duyệt ${user.name} làm Shipper`
    });
  } catch (error) {
    console.error('Error approving shipper:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin từ chối/đình chỉ shipper
// @route   PUT /api/shipper/:id/reject
// @access  Admin
exports.rejectShipper = async (req, res) => {
  try {
    const { reason, suspend } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    user.isShipper = false;
    user.shipperStatus = suspend ? 'suspended' : 'rejected';
    await user.save();

    const io = req.app.get('io');
    if (io) {
      await createAndEmitNotification(
        io, user._id,
        'shipper_rejected',
        suspend ? 'Tài khoản Shipper bị đình chỉ' : 'Đơn đăng ký Shipper bị từ chối',
        reason || (suspend ? 'Tài khoản Shipper của bạn đã bị đình chỉ bởi Admin' : 'Đơn đăng ký Shipper của bạn bị từ chối'),
        {}
      );
    }

    res.json({
      success: true,
      message: suspend ? `Đã đình chỉ Shipper ${user.name}` : `Đã từ chối đơn của ${user.name}`
    });
  } catch (error) {
    console.error('Error rejecting shipper:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin assign shipper cho đơn hàng
// @route   PUT /api/shipper/assign/:orderId
// @access  Admin
exports.assignShipper = async (req, res) => {
  try {
    const { shipperId } = req.body;
    const order = await Order.findById(req.params.orderId)
      .populate('productId', 'title');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }

    if (order.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'Chỉ có thể assign Shipper cho đơn hàng đã xác nhận'
      });
    }

    const shipper = await User.findById(shipperId);
    if (!shipper || !shipper.isShipper || shipper.shipperStatus !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Shipper không hợp lệ hoặc chưa được phê duyệt'
      });
    }

    order.shipperId = shipperId;
    order.shipperAssignedAt = new Date();
    await order.save();

    const io = req.app.get('io');
    if (io) {
      await createAndEmitNotification(
        io, shipperId,
        'order_assigned',
        'Bạn có đơn giao hàng mới',
        `Bạn được phân công giao đơn hàng: ${order.productId?.title || 'Sản phẩm'}.`,
        { orderId: order._id }
      );
      await createAndEmitNotification(
        io, order.buyerId,
        'shipper_assigned',
        'Đơn hàng đang được giao',
        `Shipper ${shipper.name} đang giao hàng cho bạn. SĐT: ${shipper.phone}`,
        { orderId: order._id }
      );
    }

    res.json({ success: true, message: `Đã gán Shipper ${shipper.name} cho đơn hàng` });
  } catch (error) {
    console.error('Error assigning shipper:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Shipper xem đơn hàng của mình
// @route   GET /api/shipper/my-orders
// @access  Shipper
exports.getMyShipperOrders = async (req, res) => {
  try {
    const shipperId = req.user.id;
    const { status } = req.query;

    let query = { shipperId };
    if (status) query.status = status;

    const orders = await Order.find(query)
      .populate('buyerId', 'name phone avatar')
      .populate('sellerId', 'name phone avatar address')
      .populate('productId', 'title images price')
      .populate('payment')
      .sort({ shipperAssignedAt: -1 });

    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    console.error('Error getting shipper orders:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Lấy danh sách đơn hàng có thể nhận (chưa có shipper)
// @route   GET /api/shipper/available-orders
// @access  Shipper
exports.getAvailableOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      status: 'confirmed',
      shipperId: null
    })
      .populate('buyerId', 'name phone avatar')
      .populate('sellerId', 'name phone avatar address')
      .populate('productId', 'title images price')
      .populate('payment')
      .sort({ confirmedAt: -1 });

    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    console.error('Error getting available orders:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Shipper nhận giao đơn hàng
// @route   PUT /api/shipper/orders/:orderId/accept
// @access  Shipper
exports.acceptOrder = async (req, res) => {
  try {
    const shipperId = req.user.id;
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }

    if (order.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'Đơn hàng này không ở trạng thái chờ giao'
      });
    }

    if (order.shipperId) {
      return res.status(400).json({
        success: false,
        message: 'Đơn hàng này đã có shipper khác nhận giao'
      });
    }

    const shipper = await User.findById(shipperId);

    order.shipperId = shipperId;
    order.shipperAssignedAt = new Date();
    await order.save();

    const io = req.app.get('io');
    if (io) {
      await createAndEmitNotification(
        io, order.buyerId,
        'shipper_assigned',
        'Đơn hàng đang được giao',
        `Shipper ${shipper.name} đã nhận giao đơn hàng cho bạn. SĐT: ${shipper.phone}`,
        { orderId: order._id }
      );
    }

    res.json({ success: true, message: 'Đã nhận đơn hàng thành công', data: order });
  } catch (error) {
    console.error('Error accepting order:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Shipper xác nhận lấy hàng từ người bán
// @route   PUT /api/shipper/orders/:orderId/pickup
// @access  Shipper
exports.markPickedUp = async (req, res) => {
  try {
    const shipperId = req.user.id;
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }

    if (order.shipperId?.toString() !== shipperId) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không phải là Shipper của đơn hàng này'
      });
    }

    if (order.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'Chỉ có thể xác nhận lấy hàng cho đơn ở trạng thái đã xác nhận'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp ảnh chụp xác nhận đã lấy hàng'
      });
    }

    // Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(req.file.buffer, 'dnu-marketplace/shipper-proof');
    
    order.status = 'picked_up';
    order.pickupProof = uploadResult.secure_url;
    order.pickedUpAt = new Date();
    await order.save();

    const io = req.app.get('io');
    if (io) {
      // Notify Buyer
      await createAndEmitNotification(
        io, order.buyerId,
        'order_picked_up',
        'Đơn hàng đã được lấy',
        `Shipper đã nhận hàng từ người bán và đang trên đường giao tới bạn.`,
        { orderId: order._id }
      );
      // Notify Seller
      await createAndEmitNotification(
        io, order.sellerId,
        'order_picked_up_seller',
        'Đơn hàng đã được shipper lấy',
        `Shipper đã lấy hàng từ bạn thành công.`,
        { orderId: order._id }
      );
    }

    res.json({
      success: true,
      message: 'Đã xác nhận lấy hàng thành công',
      data: order
    });
  } catch (error) {
    console.error('Error marking picked up:', error);
    res.status(500).json({ success: false, message: error.message });
  }
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

// @desc    Shipper báo đã giao hàng
// @route   PUT /api/shipper/orders/:orderId/delivered
// @access  Shipper
exports.markDelivered = async (req, res) => {
  try {
    const shipperId = req.user.id;
    const order = await Order.findById(req.params.orderId)
      .populate('productId', 'title');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }

    if (order.shipperId?.toString() !== shipperId) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không phải là Shipper của đơn hàng này'
      });
    }

    if (order.status !== 'picked_up') {
      return res.status(400).json({
        success: false,
        message: 'Chỉ có thể xác nhận giao hàng sau khi đã lấy hàng từ người bán'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp ảnh chụp xác nhận đã giao hàng thành công'
      });
    }

    // Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(req.file.buffer, 'dnu-marketplace/shipper-proof');

    // Cập nhật trạng thái thanh toán tương ứng
    const payment = await getOrCreatePaymentForOrder(order);
    payment.status = 'confirmed';
    payment.confirmedAt = new Date();
    payment.adminApproved = true;
    payment.sellerApproved = true;
    if (!payment.confirmedBy) {
      payment.confirmedBy = shipperId;
    }
    await payment.save();

    order.status = 'completed';
    order.deliveryProof = uploadResult.secure_url;
    order.deliveredAt = new Date();
    order.completedAt = new Date();
    await order.save();

    const io = req.app.get('io');
    if (io) {
      // Notify Buyer
      await createAndEmitNotification(
        io, order.buyerId,
        'order_delivered',
        'Đơn hàng đã được giao',
        `Shipper đã giao thành công đơn hàng: ${order.productId?.title || 'Sản phẩm'}`,
        { orderId: order._id }
      );
      // Notify Seller
      await createAndEmitNotification(
        io, order.sellerId,
        'order_delivered_seller',
        'Đơn hàng giao thành công',
        `Đơn hàng của bạn "${order.productId?.title || 'Sản phẩm'}" đã được shipper giao thành công đến người mua.`,
        { orderId: order._id }
      );
    }

    res.json({ success: true, message: 'Đã xác nhận giao hàng thành công. Đơn hàng hoàn tất và cập nhật thanh toán.' });
  } catch (error) {
    console.error('Error marking delivered:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin assign/remove shipper role for any user
// @route   PUT /api/shipper/:id/role
// @access  Admin
exports.toggleShipperRole = async (req, res) => {
  try {
    const { isShipper } = req.body;
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    user.isShipper = isShipper;
    if (isShipper) {
      user.shipperStatus = 'approved';
      // If user hasn't applied before, initialize shipperInfo
      if (!user.shipperInfo) {
        user.shipperInfo = {
          idCard: 'Được admin cấp quyền',
          vehicleType: 'motorbike',
          operatingArea: 'Toàn hệ thống',
          bio: 'Được cấp quyền trực tiếp bởi Admin',
          appliedAt: new Date()
        };
      }
    } else {
      user.shipperStatus = 'none';
    }
    
    await user.save();

    const io = req.app.get('io');
    if (io) {
      await createAndEmitNotification(
        io, user._id,
        isShipper ? 'shipper_approved' : 'shipper_rejected',
        isShipper ? 'Bạn đã được cấp quyền Shipper' : 'Quyền Shipper của bạn đã bị thu hồi',
        isShipper ? 'Admin đã cấp cho bạn quyền hoạt động với tư cách là Shipper.' : 'Admin đã thu hồi quyền hoạt động Shipper của bạn.',
        {}
      );
    }

    res.json({
      success: true,
      message: isShipper ? `Đã cấp quyền Shipper cho ${user.name}` : `Đã thu hồi quyền Shipper của ${user.name}`,
      data: user
    });
  } catch (error) {
    console.error('Error toggling shipper role:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
