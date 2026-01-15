const Order = require('../models/Order');
const Offer = require('../models/Offer');
const Product = require('../models/Product');
const Payment = require('../models/Payment');
const { createAndEmitNotification } = require('../utils/notifications');

let io = null;

// Set io instance for notifications
const setIO = (socketIO) => {
  io = socketIO;
};

// Auto-expire pending orders after 24 hours
const expireOrders = async () => {
  try {
    const now = new Date();
    
    // Find expired pending orders
    const expiredOrders = await Order.find({
      status: 'pending',
      expiresAt: { $lt: now }
    }).populate('productId', 'title').populate('buyerId', 'name').populate('sellerId', 'name');

    console.log(`[Cron] Found ${expiredOrders.length} expired orders`);

    for (const order of expiredOrders) {
      order.status = 'cancelled';
      order.cancelledAt = now;
      order.cancellationReason = 'Tự động hủy do hết thời gian xác nhận (24 giờ)';
      await order.save();

      // Make product available again
      await Product.findByIdAndUpdate(order.productId._id, {
        status: 'Available'
      });

      // Create notifications
      if (io) {
        // Notify buyer
        await createAndEmitNotification(
          io,
          order.buyerId._id,
          'order_expired',
          'Đơn hàng đã hết hạn',
          `Đơn hàng cho sản phẩm "${order.productId.title}" đã hết hạn và được tự động hủy`,
          { orderId: order._id, productId: order.productId._id }
        );

        // Notify seller
        await createAndEmitNotification(
          io,
          order.sellerId._id,
          'order_expired',
          'Đơn hàng đã hết hạn',
          `Đơn hàng cho sản phẩm "${order.productId.title}" đã hết hạn do không được xác nhận kịp thời`,
          { orderId: order._id, productId: order.productId._id }
        );
      }

      console.log(`[Cron] Expired order ${order._id}`);
    }
  } catch (error) {
    console.error('[Cron] Error expiring orders:', error);
  }
};

// Auto-expire pending offers after 7 days
const expireOffers = async () => {
  try {
    const now = new Date();
    
    // Find expired pending offers
    const expiredOffers = await Offer.find({
      status: 'pending',
      expiresAt: { $lt: now }
    }).populate('productId', 'title').populate('buyerId', 'name').populate('sellerId', 'name');

    console.log(`[Cron] Found ${expiredOffers.length} expired offers`);

    for (const offer of expiredOffers) {
      offer.status = 'expired';
      await offer.save();

      // Create notifications
      if (io) {
        // Notify buyer
        await createAndEmitNotification(
          io,
          offer.buyerId._id,
          'offer_expired',
          'Đề nghị giá đã hết hạn',
          `Đề nghị giá cho sản phẩm "${offer.productId.title}" đã hết hạn (7 ngày)`,
          { offerId: offer._id, productId: offer.productId._id }
        );

        // Notify seller
        await createAndEmitNotification(
          io,
          offer.sellerId._id,
          'offer_expired',
          'Đề nghị giá đã hết hạn',
          `Đề nghị giá cho sản phẩm "${offer.productId.title}" đã hết hạn`,
          { offerId: offer._id, productId: offer.productId._id }
        );
      }

      console.log(`[Cron] Expired offer ${offer._id}`);
    }
  } catch (error) {
    console.error('[Cron] Error expiring offers:', error);
  }
};

// Auto-expire pending payments after 24 hours (if no proof uploaded)
const expirePayments = async () => {
  try {
    const now = new Date();
    
    // Find expired pending payments without proof
    const expiredPayments = await Payment.find({
      status: 'pending',
      expiresAt: { $lt: now },
      paymentProof: null
    }).populate('orderId').populate('buyerId', 'name').populate('orderId.productId', 'title');

    console.log(`[Cron] Found ${expiredPayments.length} expired payments`);

    for (const payment of expiredPayments) {
      payment.status = 'rejected';
      payment.rejectionReason = 'Tự động hủy do hết thời gian upload biên lai (24 giờ)';
      await payment.save();

      // Cancel related order if still pending
      if (payment.orderId && payment.orderId.status === 'pending') {
        const Order = require('../models/Order');
        const Product = require('../models/Product');
        
        payment.orderId.status = 'cancelled';
        payment.orderId.cancelledAt = now;
        payment.orderId.cancellationReason = 'Đơn hàng bị hủy do thanh toán hết hạn';
        await payment.orderId.save();

        // Make product available again
        if (payment.orderId.productId) {
          await Product.findByIdAndUpdate(payment.orderId.productId._id, {
            status: 'Available'
          });
        }
      }

      // Create notification
      if (io && payment.buyerId) {
        await createAndEmitNotification(
          io,
          payment.buyerId._id,
          'payment_expired',
          'Thanh toán đã hết hạn',
          `Thanh toán cho đơn hàng đã hết hạn do không upload biên lai trong 24 giờ`,
          { paymentId: payment._id, orderId: payment.orderId?._id }
        );
      }

      console.log(`[Cron] Expired payment ${payment._id}`);
    }
  } catch (error) {
    console.error('[Cron] Error expiring payments:', error);
  }
};

// Run expiration checks
const runExpirationChecks = async () => {
  await expireOrders();
  await expireOffers();
  await expirePayments();
};

module.exports = {
  setIO,
  expireOrders,
  expireOffers,
  expirePayments,
  runExpirationChecks
};

