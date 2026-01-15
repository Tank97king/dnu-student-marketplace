const Product = require('../models/Product');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const User = require('../models/User');
const ProductView = require('../models/ProductView');
const Notification = require('../models/Notification');
const Review = require('../models/Review');
const mongoose = require('mongoose');
const { createAndEmitNotification } = require('../utils/notifications');
const { shouldSendNotification } = require('../controllers/notificationSettingsController');

let io = null;

// Set io instance for notifications
const setIO = (socketIO) => {
  io = socketIO;
};

// Check for price drops in favorite products
const checkFavoritePriceDrops = async () => {
  try {
    console.log('[Smart Notifications] Checking for price drops in favorite products...');
    
    // Get all users with favorites
    const users = await User.find({ favorites: { $exists: true, $ne: [] } })
      .select('_id favorites');
    
    for (const user of users) {
      // Check if user wants this notification
      const shouldSend = await shouldSendNotification(user._id, 'favorite_price_drop');
      if (!shouldSend) continue;

      // Get user's favorite products
      const favoriteProducts = await Product.find({
        _id: { $in: user.favorites },
        status: 'Available',
        isApproved: true
      });

      for (const product of favoriteProducts) {
        // Check if price has dropped (we need to track previous price)
        // For now, we'll check if product was recently updated with lower price
        // In a real system, you'd track price history
        
        // Get recent views to determine if product is active
        const recentViews = await ProductView.countDocuments({
          productId: product._id,
          createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        });

        // If product has many views recently, it might be trending
        if (recentViews > 10) {
          // Check if we already sent this notification today
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const existingNotification = await Notification.findOne({
            userId: user._id,
            type: 'favorite_price_drop',
            'data.productId': product._id,
            createdAt: { $gte: today }
          });

          if (!existingNotification) {
            await createAndEmitNotification(
              io,
              user._id,
              'favorite_price_drop',
              'Sản phẩm yêu thích đang hot!',
              `Sản phẩm "${product.title}" trong danh sách yêu thích của bạn đang được nhiều người quan tâm!`,
              { productId: product._id, productName: product.title }
            );
          }
        }
      }
    }

    console.log('[Smart Notifications] Finished checking price drops');
  } catch (error) {
    console.error('[Smart Notifications] Error checking price drops:', error);
  }
};

// Send review reminders for completed orders
const sendReviewReminders = async () => {
  try {
    console.log('[Smart Notifications] Sending review reminders...');
    
    // Find completed orders from 3 days ago that don't have reviews yet
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    
    const completedOrders = await Order.find({
      status: 'completed',
      completedAt: {
        $gte: threeDaysAgo,
        $lte: new Date(threeDaysAgo.getTime() + 24 * 60 * 60 * 1000) // Within 1 day window
      }
    }).populate('buyerId', '_id').populate('productId', '_id title');

    for (const order of completedOrders) {
      // Check if user wants this notification
      const shouldSend = await shouldSendNotification(order.buyerId._id, 'review_reminder');
      if (!shouldSend) continue;

      // Check if buyer already reviewed this product
      const existingReview = await Review.findOne({
        reviewerId: order.buyerId._id,
        productId: order.productId._id
      });

      if (!existingReview) {
        // Check if we already sent reminder
        const existingNotification = await require('../models/Notification').findOne({
          userId: order.buyerId._id,
          type: 'review_reminder',
          'data.orderId': order._id,
          createdAt: { $gte: threeDaysAgo }
        });

        if (!existingNotification) {
          await createAndEmitNotification(
            io,
            order.buyerId._id,
            'review_reminder',
            'Nhắc nhở đánh giá',
            `Bạn đã mua "${order.productId.title}" 3 ngày trước. Hãy chia sẻ đánh giá của bạn nhé!`,
            { 
              orderId: order._id, 
              productId: order.productId._id,
              productName: order.productId.title
            }
          );
        }
      }
    }

    console.log('[Smart Notifications] Finished sending review reminders');
  } catch (error) {
    console.error('[Smart Notifications] Error sending review reminders:', error);
  }
};

// Notify sellers about trending products
const notifyTrendingProducts = async () => {
  try {
    console.log('[Smart Notifications] Checking for trending products...');
    
    // Find products with high view count in last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    // Get products with most views in last 24 hours
    const trendingProducts = await ProductView.aggregate([
      {
        $match: {
          createdAt: { $gte: oneDayAgo }
        }
      },
      {
        $group: {
          _id: '$productId',
          viewCount: { $sum: 1 }
        }
      },
      {
        $sort: { viewCount: -1 }
      },
      { $limit: 20 }
    ]);

    for (const trend of trendingProducts) {
      if (trend.viewCount >= 20) { // Threshold: 20 views in 24h
        const product = await Product.findById(trend._id).populate('userId', '_id');
        
        if (!product || !product.userId) continue;

        // Check if user wants this notification
        const shouldSend = await shouldSendNotification(product.userId._id, 'product_trending');
        if (!shouldSend) continue;

        // Check if we already sent this notification today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const existingNotification = await require('../models/Notification').findOne({
          userId: product.userId._id,
          type: 'product_trending',
          'data.productId': product._id,
          createdAt: { $gte: today }
        });

        if (!existingNotification) {
          await createAndEmitNotification(
            io,
            product.userId._id,
            'product_trending',
            'Sản phẩm đang hot! 🔥',
            `Sản phẩm "${product.title}" của bạn đang được nhiều người quan tâm! Đã có ${trend.viewCount} lượt xem trong 24h qua.`,
            { 
              productId: product._id, 
              productName: product.title,
              viewCount: trend.viewCount
            }
          );
        }
      }
    }

    console.log('[Smart Notifications] Finished checking trending products');
  } catch (error) {
    console.error('[Smart Notifications] Error checking trending products:', error);
  }
};

// Run all smart notification checks
const runSmartNotifications = async () => {
  await checkFavoritePriceDrops();
  await sendReviewReminders();
  await notifyTrendingProducts();
};

module.exports = {
  setIO,
  checkFavoritePriceDrops,
  sendReviewReminders,
  notifyTrendingProducts,
  runSmartNotifications
};

