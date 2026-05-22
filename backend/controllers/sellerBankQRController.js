const SellerBankQR = require('../models/SellerBankQR');
const Payment = require('../models/Payment');
const Order = require('../models/Order');
const { uploadToCloudinary } = require('../utils/uploadImage');
const { createAndEmitNotification } = require('../utils/notifications');

// @desc    Người bán upload/cập nhật QR ngân hàng
// @route   POST /api/seller-bankqr
// @access  Private
exports.upsertSellerBankQR = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const { bankName, accountNumber, accountHolder } = req.body;

    if (!bankName || !accountNumber || !accountHolder) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ: tên ngân hàng, số tài khoản, tên chủ tài khoản'
      });
    }

    let qrCodeImage = null;
    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.buffer, 'dnu-marketplace/seller-qr');
      qrCodeImage = uploadResult.secure_url;
    }

    // Upsert (create or update)
    const existing = await SellerBankQR.findOne({ sellerId });
    let sellerQR;

    if (existing) {
      existing.bankName = bankName;
      existing.accountNumber = accountNumber;
      existing.accountHolder = accountHolder;
      if (qrCodeImage) existing.qrCodeImage = qrCodeImage;
      existing.isVerified = false; // Reset verification khi cập nhật
      existing.verifiedBy = undefined;
      existing.verifiedAt = undefined;
      await existing.save();
      sellerQR = existing;
    } else {
      if (!qrCodeImage) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng upload ảnh QR code'
        });
      }
      sellerQR = await SellerBankQR.create({
        sellerId,
        bankName,
        accountNumber,
        accountHolder,
        qrCodeImage
      });
    }

    // Notify admins to verify
    const User = require('../models/User');
    const io = req.app.get('io');
    if (io) {
      const admins = await User.find({ isAdmin: true, isActive: true });
      for (const admin of admins) {
        await createAndEmitNotification(
          io, admin._id,
          'seller_qr_pending',
          'QR ngân hàng người bán cần xác minh',
          `${req.user.name} đã cập nhật QR ngân hàng. Vui lòng xác minh để cho phép nhận thanh toán.`,
          { sellerId }
        );
      }
    }

    res.json({
      success: true,
      data: sellerQR,
      message: existing
        ? 'Đã cập nhật thông tin ngân hàng. Vui lòng chờ Admin xác minh.'
        : 'Đã lưu thông tin ngân hàng. Vui lòng chờ Admin xác minh.'
    });
  } catch (error) {
    console.error('Error upserting seller bank QR:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Người bán xem QR của mình
// @route   GET /api/seller-bankqr/my
// @access  Private
exports.getMySellerBankQR = async (req, res) => {
  try {
    const sellerQR = await SellerBankQR.findOne({ sellerId: req.user.id });
    res.json({
      success: true,
      data: sellerQR || null
    });
  } catch (error) {
    console.error('Error getting seller bank QR:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin lấy danh sách QR người bán cần xác minh
// @route   GET /api/seller-bankqr/all
// @access  Admin
exports.getAllSellerBankQRs = async (req, res) => {
  try {
    const qrs = await SellerBankQR.find()
      .populate('sellerId', 'name email avatar phone')
      .populate('verifiedBy', 'name')
      .sort({ updatedAt: -1 });

    res.json({ success: true, count: qrs.length, data: qrs });
  } catch (error) {
    console.error('Error getting all seller bank QRs:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin xác minh QR người bán
// @route   PUT /api/seller-bankqr/:id/verify
// @access  Admin
exports.verifySellerBankQR = async (req, res) => {
  try {
    const sellerQR = await SellerBankQR.findById(req.params.id)
      .populate('sellerId', 'name');

    if (!sellerQR) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy QR ngân hàng' });
    }

    sellerQR.isVerified = true;
    sellerQR.verifiedBy = req.user.id;
    sellerQR.verifiedAt = new Date();
    await sellerQR.save();

    const io = req.app.get('io');
    if (io) {
      await createAndEmitNotification(
        io, sellerQR.sellerId._id,
        'seller_qr_verified',
        'QR ngân hàng đã được xác minh',
        `Admin đã xác minh thông tin ngân hàng của bạn (${sellerQR.bankName} - ${sellerQR.accountNumber}). Bạn sẽ nhận tiền qua QR này sau mỗi giao dịch thành công.`,
        {}
      );
    }

    res.json({
      success: true,
      message: `Đã xác minh QR ngân hàng của ${sellerQR.sellerId?.name}`
    });
  } catch (error) {
    console.error('Error verifying seller bank QR:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin xác nhận đã chuyển tiền cho người bán (bắt buộc kèm ảnh biên lai)
// @route   PUT /api/seller-bankqr/payments/:paymentId/mark-seller-paid
// @access  Admin
exports.markSellerPaid = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.paymentId)
      .populate('orderId')
      .populate('buyerId', 'name');

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thanh toán' });
    }

    if (payment.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'Chỉ có thể xác nhận thanh toán cho người bán sau khi đơn hàng được xác nhận'
      });
    }

    if (payment.sellerPaid) {
      return res.status(400).json({
        success: false,
        message: 'Đã xác nhận chuyển tiền cho người bán trước đó rồi'
      });
    }

    // Bắt buộc phải có ảnh biên lai
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng upload ảnh biên lai chuyển khoản cho người bán'
      });
    }

    // Upload ảnh biên lai lên Cloudinary
    const uploadResult = await uploadToCloudinary(req.file.buffer, 'dnu-marketplace/seller-payment-proofs');
    const sellerPaymentProofUrl = uploadResult.secure_url;

    payment.sellerPaid = true;
    payment.sellerPaidAt = new Date();
    payment.sellerPaidBy = req.user.id;
    payment.sellerPaymentProof = sellerPaymentProofUrl;
    await payment.save();

    // Notify seller
    const order = payment.orderId;
    if (order) {
      const io = req.app.get('io');
      if (io) {
        const sellerAmountFormatted = payment.sellerAmount?.toLocaleString('vi-VN');
        const productTitle = order.productId?.title || `Đơn hàng #${order._id.toString().slice(-6).toUpperCase()}`;
        await createAndEmitNotification(
          io, order.sellerId,
          'seller_payment_received',
          '💰 Bạn đã nhận được tiền!',
          `Admin đã chuyển ${sellerAmountFormatted} ₫ cho sản phẩm "${productTitle}". Vui lòng kiểm tra tài khoản và xác nhận đã nhận tiền.`,
          { paymentId: payment._id, orderId: order._id }
        );
      }
    }

    res.json({
      success: true,
      message: 'Đã xác nhận chuyển tiền và gửi biên lai cho người bán',
      data: {
        sellerAmount: payment.sellerAmount,
        sellerPaidAt: payment.sellerPaidAt,
        sellerPaymentProof: sellerPaymentProofUrl
      }
    });
  } catch (error) {
    console.error('Error marking seller paid:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Người bán xác nhận đã nhận tiền từ Admin
// @route   PUT /api/seller-bankqr/payments/:paymentId/confirm-receipt
// @access  Private (Người bán chủ đơn hàng)
exports.confirmSellerReceipt = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.paymentId)
      .populate({
        path: 'orderId',
        populate: { path: 'productId', select: 'title' }
      });

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thanh toán' });
    }

    // Kiểm tra quyền - phải là người bán của đơn hàng này
    const order = payment.orderId;
    if (!order || order.sellerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xác nhận nhận tiền cho đơn hàng này'
      });
    }

    if (!payment.sellerPaid) {
      return res.status(400).json({
        success: false,
        message: 'Admin chưa xác nhận chuyển tiền cho đơn hàng này'
      });
    }

    if (payment.sellerConfirmedReceipt) {
      return res.status(400).json({
        success: false,
        message: 'Bạn đã xác nhận nhận tiền cho đơn hàng này rồi'
      });
    }

    payment.sellerConfirmedReceipt = true;
    payment.sellerReceiptConfirmedAt = new Date();
    await payment.save();

    // Notify all admins
    const User = require('../models/User');
    const io = req.app.get('io');
    if (io) {
      const admins = await User.find({ isAdmin: true, isActive: true });
      const sellerName = req.user.name;
      const productTitle = order.productId?.title || `Đơn #${order._id.toString().slice(-6).toUpperCase()}`;
      const sellerAmountFormatted = payment.sellerAmount?.toLocaleString('vi-VN');

      for (const admin of admins) {
        await createAndEmitNotification(
          io, admin._id,
          'seller_receipt_confirmed',
          '✅ Người bán đã xác nhận nhận tiền',
          `${sellerName} đã xác nhận đã nhận ${sellerAmountFormatted} ₫ cho sản phẩm "${productTitle}".`,
          { paymentId: payment._id, orderId: order._id }
        );
      }
    }

    res.json({
      success: true,
      message: 'Đã xác nhận nhận tiền thành công! Cảm ơn bạn.',
      data: {
        sellerConfirmedReceipt: payment.sellerConfirmedReceipt,
        sellerReceiptConfirmedAt: payment.sellerReceiptConfirmedAt
      }
    });
  } catch (error) {
    console.error('Error confirming seller receipt:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Người bán báo cáo lỗi chưa nhận được tiền
// @route   PUT /api/seller-bankqr/payments/:paymentId/report-issue
// @access  Private (Người bán chủ đơn hàng)
exports.reportPaymentIssue = async (req, res) => {
  try {
    const { reason } = req.body;
    
    if (!reason || reason.trim() === '') {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp lý do/lời nhắn' });
    }

    const payment = await Payment.findById(req.params.paymentId)
      .populate({
        path: 'orderId',
        populate: { path: 'productId', select: 'title' }
      });

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thanh toán' });
    }

    // Kiểm tra quyền
    const order = payment.orderId;
    if (!order || order.sellerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền báo cáo cho đơn hàng này'
      });
    }

    if (!payment.sellerPaid) {
      return res.status(400).json({
        success: false,
        message: 'Admin chưa xác nhận chuyển tiền'
      });
    }

    if (payment.sellerConfirmedReceipt) {
      return res.status(400).json({
        success: false,
        message: 'Bạn đã xác nhận nhận tiền rồi, không thể báo lỗi nữa'
      });
    }

    payment.sellerReportedIssue = true;
    payment.sellerReportReason = reason.trim();
    payment.sellerReportedAt = new Date();
    await payment.save();

    // Notify all admins
    const User = require('../models/User');
    const io = req.app.get('io');
    if (io) {
      const admins = await User.find({ isAdmin: true, isActive: true });
      const sellerName = req.user.name;
      const productTitle = order.productId?.title || `Đơn #${order._id.toString().slice(-6).toUpperCase()}`;

      for (const admin of admins) {
        await createAndEmitNotification(
          io, admin._id,
          'seller_payment_issue',
          '⚠️ Người bán báo cáo chưa nhận được tiền',
          `${sellerName} báo cáo lỗi chuyển khoản cho sản phẩm "${productTitle}". Lý do: ${reason}`,
          { paymentId: payment._id, orderId: order._id }
        );
      }
    }

    res.json({
      success: true,
      message: 'Đã gửi báo cáo thành công. Admin sẽ kiểm tra lại!',
      data: {
        sellerReportedIssue: payment.sellerReportedIssue,
        sellerReportReason: payment.sellerReportReason,
        sellerReportedAt: payment.sellerReportedAt
      }
    });
  } catch (error) {
    console.error('Error reporting payment issue:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
