const Payment = require('../models/Payment');
const Order = require('../models/Order');
const User = require('../models/User');
const BankQR = require('../models/BankQR');
const generateTransactionCode = require('../utils/generateTransactionCode');
const { uploadToCloudinary } = require('../utils/uploadImage');
const { createAndEmitNotification } = require('../utils/notifications');

// @desc    Create payment (when buyer clicks "Thanh toán")
// @route   POST /api/payments
// @access  Private
exports.createPayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    const buyerId = req.user.id;

    // Validate order
    const order = await Order.findById(orderId)
      .populate('buyerId', 'name phone')
      .populate('productId', 'title images');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    // Check if user is the buyer
    if (order.buyerId._id.toString() !== buyerId) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền thanh toán đơn hàng này'
      });
    }

    // Check if order is pending
    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Chỉ có thể thanh toán đơn hàng đang chờ xử lý'
      });
    }

    // Check if payment already exists
    const existingPayment = await Payment.findOne({ orderId });
    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: 'Đơn hàng này đã có thanh toán',
        data: existingPayment
      });
    }

    // Generate unique transaction code
    let transactionCode;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      transactionCode = generateTransactionCode();
      const existing = await Payment.findOne({ transactionCode });
      if (!existing) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return res.status(500).json({
        success: false,
        message: 'Không thể tạo mã giao dịch. Vui lòng thử lại'
      });
    }

    // Get active bank QR code
    const bankQR = await BankQR.findOne({ isActive: true }).sort({ createdAt: -1 });

    if (!bankQR) {
      return res.status(404).json({
        success: false,
        message: 'Chưa có QR code ngân hàng được cấu hình. Vui lòng liên hệ admin'
      });
    }

    // Create payment record
    const payment = await Payment.create({
      orderId: order._id,
      buyerId: buyerId,
      buyerName: order.buyerId.name,
      buyerPhone: order.buyerId.phone,
      amount: order.finalPrice,
      transactionCode,
      shippingAddress: order.shippingAddress,
      status: 'pending'
    });

    const populatedPayment = await Payment.findById(payment._id)
      .populate('orderId')
      .populate('buyerId', 'name avatar');

    res.status(201).json({
      success: true,
      data: {
        payment: populatedPayment,
        bankQR: {
          _id: bankQR._id,
          bankName: bankQR.bankName,
          accountNumber: bankQR.accountNumber,
          accountHolder: bankQR.accountHolder,
          qrCodeImage: bankQR.qrCodeImage
        },
        transactionCode
      },
      message: 'Đã tạo thanh toán thành công. Vui lòng quét QR code và chuyển khoản với nội dung: ' + transactionCode
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get payment by order ID
// @route   GET /api/payments/order/:orderId
// @access  Private
exports.getPaymentByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const payment = await Payment.findOne({ orderId })
      .populate('orderId')
      .populate('buyerId', 'name avatar')
      .populate('confirmedBy', 'name email');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thanh toán cho đơn hàng này'
      });
    }

    // Check if user has access (buyer or admin)
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    const isBuyer = order.buyerId.toString() === userId;
    const isAdmin = req.user.isAdmin;

    if (!isBuyer && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xem thanh toán này'
      });
    }

    // Get bank QR if payment is pending
    let bankQR = null;
    if (payment.status === 'pending') {
      bankQR = await BankQR.findOne({ isActive: true }).sort({ createdAt: -1 });
    }

    res.json({
      success: true,
      data: {
        payment,
        bankQR: bankQR ? {
          _id: bankQR._id,
          bankName: bankQR.bankName,
          accountNumber: bankQR.accountNumber,
          accountHolder: bankQR.accountHolder,
          qrCodeImage: bankQR.qrCodeImage
        } : null
      }
    });
  } catch (error) {
    console.error('Error getting payment:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Upload payment proof (biên lai chuyển khoản)
// @route   PUT /api/payments/:id/upload-proof
// @access  Private
exports.uploadPaymentProof = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('orderId');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thanh toán'
      });
    }

    // Check if user is the buyer
    if (payment.buyerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Chỉ người mua mới có thể upload ảnh biên lai'
      });
    }

    if (payment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Chỉ có thể upload ảnh biên lai cho thanh toán đang chờ xử lý'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng upload ảnh biên lai'
      });
    }

    // Upload payment proof to Cloudinary
    const uploadResult = await uploadToCloudinary(req.file.buffer, 'dnu-marketplace/payments');

    payment.paymentProof = uploadResult.secure_url;
    await payment.save();

    // Notify admins
    const io = req.app.get('io');
    if (io) {
      // Get all admins
      const admins = await User.find({ isAdmin: true, isActive: true });
      for (const admin of admins) {
        await createAndEmitNotification(
          io,
          admin._id,
          'payment_pending_review',
          'Có thanh toán cần xác nhận',
          `Người mua đã upload ảnh biên lai cho đơn hàng. Mã giao dịch: ${payment.transactionCode}`,
          { paymentId: payment._id, orderId: payment.orderId._id }
        );
      }
    }

    const populatedPayment = await Payment.findById(payment._id)
      .populate('orderId')
      .populate('buyerId', 'name avatar');

    res.json({
      success: true,
      data: populatedPayment,
      message: 'Đã upload ảnh biên lai thành công. Vui lòng chờ admin xác nhận'
    });
  } catch (error) {
    console.error('Error uploading payment proof:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all pending payments (for admin)
// @route   GET /api/payments/pending
// @access  Admin
exports.getPendingPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ status: 'pending' })
      .populate({
        path: 'orderId',
        select: 'finalPrice status',
        populate: {
          path: 'productId',
          select: 'title images'
        }
      })
      .populate('buyerId', 'name avatar email phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error) {
    console.error('Error getting pending payments:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Confirm payment (by admin)
// @route   PUT /api/payments/:id/confirm
// @access  Admin
exports.confirmPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('orderId')
      .populate('buyerId', 'name');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thanh toán'
      });
    }

    if (payment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Chỉ có thể xác nhận thanh toán đang chờ xử lý'
      });
    }

    // Update payment status
    payment.status = 'confirmed';
    payment.confirmedBy = req.user.id;
    payment.confirmedAt = new Date();
    await payment.save();

    // Update order status to confirmed
    const order = await Order.findById(payment.orderId._id);
    if (order) {
      order.status = 'confirmed';
      order.confirmedAt = new Date();
      await order.save();
    }

    // Notify buyer
    const io = req.app.get('io');
    if (io) {
      await createAndEmitNotification(
        io,
        payment.buyerId._id,
        'payment_confirmed',
        'Thanh toán đã được xác nhận',
        `Admin đã xác nhận thanh toán của bạn. Đơn hàng đã được xác nhận.`,
        { paymentId: payment._id, orderId: payment.orderId._id }
      );
    }

    const populatedPayment = await Payment.findById(payment._id)
      .populate('orderId')
      .populate('buyerId', 'name avatar')
      .populate('confirmedBy', 'name email');

    res.json({
      success: true,
      data: populatedPayment,
      message: 'Đã xác nhận thanh toán thành công'
    });
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Reject payment (by admin)
// @route   PUT /api/payments/:id/reject
// @access  Admin
exports.rejectPayment = async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    const payment = await Payment.findById(req.params.id)
      .populate('orderId')
      .populate('buyerId', 'name');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thanh toán'
      });
    }

    if (payment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Chỉ có thể từ chối thanh toán đang chờ xử lý'
      });
    }

    // Update payment status
    payment.status = 'rejected';
    payment.rejectionReason = rejectionReason || 'Không hợp lệ';
    await payment.save();

    // Notify buyer
    const io = req.app.get('io');
    if (io) {
      await createAndEmitNotification(
        io,
        payment.buyerId._id,
        'payment_rejected',
        'Thanh toán bị từ chối',
        `Thanh toán của bạn đã bị từ chối. Lý do: ${payment.rejectionReason}`,
        { paymentId: payment._id, orderId: payment.orderId._id }
      );
    }

    const populatedPayment = await Payment.findById(payment._id)
      .populate('orderId')
      .populate('buyerId', 'name avatar')
      .populate('confirmedBy', 'name email');

    res.json({
      success: true,
      data: populatedPayment,
      message: 'Đã từ chối thanh toán'
    });
  } catch (error) {
    console.error('Error rejecting payment:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all payments (for admin)
// @route   GET /api/payments
// @access  Admin
exports.getAllPayments = async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    if (status) {
      query.status = status;
    }

    const payments = await Payment.find(query)
      .populate({
        path: 'orderId',
        select: 'finalPrice status',
        populate: {
          path: 'productId',
          select: 'title images'
        }
      })
      .populate('buyerId', 'name avatar email phone')
      .populate('confirmedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error) {
    console.error('Error getting payments:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get buyer's payment history
// @route   GET /api/payments/my-payments
// @access  Private
exports.getMyPayments = async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    const buyerId = req.user.id;

    let query = { buyerId };
    
    if (status) {
      query.status = status;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    const payments = await Payment.find(query)
      .populate({
        path: 'orderId',
        select: 'finalPrice status createdAt',
        populate: {
          path: 'productId',
          select: 'title images'
        }
      })
      .populate('confirmedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error) {
    console.error('Error getting my payments:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

