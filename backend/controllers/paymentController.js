const Payment = require('../models/Payment');
const Order = require('../models/Order');
const Product = require('../models/Product');
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
    const { orderId, shippingAddress } = req.body;
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

    // If shippingAddress is provided (e.g., from offer checkout), update it on the order
    if (shippingAddress) {
      order.shippingAddress = shippingAddress;
      await order.save();
    }

    // Check if payment already exists
    const existingPayment = await Payment.findOne({ orderId })
      .populate('orderId')
      .populate('buyerId', 'name avatar');
    if (existingPayment) {
      if (shippingAddress) {
        existingPayment.shippingAddress = shippingAddress;
        await existingPayment.save();
      }
      const bankQR = await BankQR.findOne({ isActive: true }).sort({ createdAt: -1 });
      return res.status(200).json({
        success: true,
        data: {
          payment: existingPayment,
          bankQR: bankQR ? {
            _id: bankQR._id,
            bankName: bankQR.bankName,
            accountNumber: bankQR.accountNumber,
            accountHolder: bankQR.accountHolder,
            qrCodeImage: bankQR.qrCodeImage
          } : null,
          transactionCode: existingPayment.transactionCode
        },
        message: 'Đơn hàng này đã có thanh toán'
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

    // Tính phí dịch vụ và VAT
    const PLATFORM_FEE_PERCENT = 5;   // 5% phí sàn
    const VAT_PERCENT = 10;           // 10% VAT áp dụng trên phí sàn
    const amount = order.finalPrice;
    const platformFee = Math.round(amount * PLATFORM_FEE_PERCENT / 100);
    const vatAmount = Math.round(platformFee * VAT_PERCENT / 100);
    const sellerAmount = amount - platformFee - vatAmount;

    // Create payment record
    const payment = await Payment.create({
      orderId: order._id,
      buyerId: buyerId,
      buyerName: order.buyerId.name,
      buyerPhone: order.buyerId.phone,
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
      .populate({
        path: 'orderId',
        populate: [
          {
            path: 'productId',
            select: 'title images price'
          },
          {
            path: 'shipperId',
            select: 'name phone email avatar'
          }
        ]
      })
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
    const isSeller = order.sellerId.toString() === userId;
    const isAdmin = req.user.isAdmin;

    if (!isBuyer && !isAdmin && !isSeller) {
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

    if (payment.status !== 'pending' && payment.status !== 'rejected') {
      return res.status(400).json({
        success: false,
        message: 'Chỉ có thể upload ảnh biên lai cho thanh toán đang chờ xử lý hoặc bị từ chối'
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
    payment.status = 'pending';
    payment.rejectionReason = null;
    payment.adminApproved = false;
    payment.sellerApproved = false;
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
        select: 'finalPrice status sellerId shipperId pickupProof deliveryProof pickedUpAt deliveryMethod',
        populate: [
          {
            path: 'productId',
            select: 'title images'
          },
          {
            path: 'shipperId',
            select: 'name phone email avatar'
          }
        ]
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

    // Cập nhật trạng thái duyệt của Admin
    payment.adminApproved = true;
    payment.adminApprovedBy = req.user.id;
    payment.adminApprovedAt = new Date();
    await payment.save();

    const order = await Order.findById(payment.orderId._id);
    let message = 'Đã xác nhận thanh toán từ phía Admin';

    // Kiểm tra xem Người bán (Seller) đã duyệt chưa
    if (payment.sellerApproved) {
      // Cả hai cùng duyệt thành công
      if (payment.paymentProof) {
        payment.status = 'confirmed';
        payment.confirmedBy = req.user.id;
        payment.confirmedAt = new Date();
      } else {
        payment.status = 'pending';
      }
      await payment.save();

      if (order) {
        order.status = 'confirmed';
        order.confirmedAt = new Date();
        await order.save();

        // Tự động đánh dấu sản phẩm là "Đã bán"
        if (order.productId) {
          await Product.findByIdAndUpdate(order.productId, {
            status: 'Sold'
          });
        }
      }

      message = payment.paymentProof
        ? 'Đã xác nhận thanh toán thành công (Cả Người bán và Admin đều đã phê duyệt)'
        : 'Đã phê duyệt đơn hàng thành công và chuyển sang giao hàng COD';

      // Notify buyer
      const io = req.app.get('io');
      if (io) {
        await createAndEmitNotification(
          io,
          payment.buyerId._id,
          'payment_confirmed',
          payment.paymentProof ? 'Thanh toán đã được xác nhận' : 'Đơn hàng đã được xác nhận (COD)',
          payment.paymentProof
            ? `Admin và Người bán đã xác nhận thanh toán cho đơn hàng của bạn.`
            : `Đơn hàng của bạn đã được duyệt và đang chuẩn bị giao.`,
          { paymentId: payment._id, orderId: payment.orderId._id }
        );
        
        // Notify seller
        if (order) {
          await createAndEmitNotification(
            io,
            order.sellerId,
            'order_confirmed',
            'Đơn hàng đã được xác nhận',
            payment.paymentProof
              ? `Admin đã duyệt thanh toán. Đơn hàng chuyển sang trạng thái đã xác nhận.`
              : `Admin đã duyệt đơn hàng (COD). Đơn hàng chuyển sang trạng thái đã xác nhận để giao hàng.`,
            { orderId: order._id }
          );
        }
      }
    } else {
      message = payment.paymentProof
        ? 'Đã phê duyệt thanh toán từ phía Admin. Đang chờ Người bán xác nhận đơn hàng để hoàn tất.'
        : 'Admin đã duyệt đơn hàng. Đang chờ Người bán xác nhận để chuyển sang giao hàng.';

      // Notify buyer
      const io = req.app.get('io');
      if (io) {
        await createAndEmitNotification(
          io,
          payment.buyerId._id,
          'payment_admin_approved',
          'Thanh toán được duyệt bởi Admin',
          `Admin đã duyệt thanh toán của bạn. Đang chờ Người bán xác nhận đơn hàng để hoàn tất.`,
          { paymentId: payment._id, orderId: payment.orderId._id }
        );

        // Notify seller
        if (order) {
          await createAndEmitNotification(
            io,
            order.sellerId,
            'payment_admin_approved',
            'Admin đã duyệt thanh toán',
            `Admin đã duyệt thanh toán cho mã GD: ${payment.transactionCode}. Vui lòng xác nhận đơn hàng để hoàn tất.`,
            { orderId: order._id }
          );
        }
      }
    }

    const populatedPayment = await Payment.findById(payment._id)
      .populate({
        path: 'orderId',
        populate: [
          {
            path: 'productId',
            select: 'title images price'
          },
          {
            path: 'shipperId',
            select: 'name phone email avatar'
          }
        ]
      })
      .populate('buyerId', 'name avatar')
      .populate('confirmedBy', 'name email');

    res.json({
      success: true,
      data: populatedPayment,
      message
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
    payment.adminApproved = false;
    payment.sellerApproved = false;
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
      .populate({
        path: 'orderId',
        populate: [
          {
            path: 'productId',
            select: 'title images price'
          },
          {
            path: 'shipperId',
            select: 'name phone email avatar'
          }
        ]
      })
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
        select: 'finalPrice status sellerId shipperId pickupProof deliveryProof pickedUpAt deliveryMethod',
        populate: [
          {
            path: 'productId',
            select: 'title images'
          },
          {
            path: 'shipperId',
            select: 'name phone email avatar'
          }
        ]
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

// @desc    Admin xác nhận đã nhận tiền COD qua QR scan → notify shipper
// @route   PUT /api/payments/:id/confirm-cod
// @access  Admin
exports.confirmCODReceived = async (req, res) => {
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

    if (payment.status === 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'Thanh toán này đã được xác nhận rồi'
      });
    }

    // Xác nhận thanh toán COD
    payment.status = 'confirmed';
    payment.confirmedBy = req.user.id;
    payment.confirmedAt = new Date();
    payment.adminApproved = true;
    payment.adminApprovedBy = req.user.id;
    payment.adminApprovedAt = new Date();
    payment.codConfirmedByAdmin = true;
    payment.codConfirmedAt = new Date();
    await payment.save();

    const order = await Order.findById(payment.orderId._id);

    const io = req.app.get('io');
    if (io && order) {
      // Notify shipper - admin đã nhận tiền, shipper có thể xác nhận giao hàng
      if (order.shipperId) {
        await createAndEmitNotification(
          io,
          order.shipperId,
          'cod_payment_confirmed',
          '✅ Khách đã thanh toán COD',
          `Admin đã xác nhận nhận tiền COD thành công. Vui lòng xác nhận và ấn "Giao hàng thành công".`,
          { paymentId: payment._id, orderId: order._id }
        );
      }

      // Notify buyer
      await createAndEmitNotification(
        io,
        payment.buyerId._id,
        'payment_confirmed',
        'Thanh toán COD đã được xác nhận',
        `Admin đã xác nhận nhận tiền COD thành công cho đơn hàng của bạn.`,
        { paymentId: payment._id, orderId: order._id }
      );
    }

    const populatedPayment = await Payment.findById(payment._id)
      .populate({
        path: 'orderId',
        populate: [
          { path: 'productId', select: 'title images price' },
          { path: 'shipperId', select: 'name phone email avatar' }
        ]
      })
      .populate('buyerId', 'name avatar')
      .populate('confirmedBy', 'name email');

    res.json({
      success: true,
      data: populatedPayment,
      message: 'Đã xác nhận nhận tiền COD thành công. Shipper đã được thông báo.'
    });
  } catch (error) {
    console.error('Error confirming COD payment:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

