const NotificationSettings = require('../models/NotificationSettings');
const User = require('../models/User');

// @desc    Get user's notification settings
// @route   GET /api/notifications/settings
// @access  Private
exports.getSettings = async (req, res) => {
  try {
    let settings = await NotificationSettings.findOne({ userId: req.user.id });

    // Create default settings if not exists
    if (!settings) {
      settings = await NotificationSettings.create({
        userId: req.user.id
      });
    }

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error getting notification settings:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update notification settings
// @route   PUT /api/notifications/settings
// @access  Private
exports.updateSettings = async (req, res) => {
  try {
    let settings = await NotificationSettings.findOne({ userId: req.user.id });

    if (!settings) {
      settings = await NotificationSettings.create({
        userId: req.user.id,
        ...req.body
      });
    } else {
      // Update only provided fields
      Object.keys(req.body).forEach(key => {
        if (settings.schema.paths[key]) {
          settings[key] = req.body[key];
        }
      });
      await settings.save();
    }

    res.json({
      success: true,
      data: settings,
      message: 'Đã cập nhật cài đặt thông báo'
    });
  } catch (error) {
    console.error('Error updating notification settings:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Helper function to check if user wants to receive this type of notification
exports.shouldSendNotification = async (userId, notificationType) => {
  try {
    const settings = await NotificationSettings.findOne({ userId });
    
    // If no settings, default to true (send all notifications)
    if (!settings) {
      return true;
    }

    // Map notification types to settings
    const typeMap = {
      'favorite_price_drop': 'favoritePriceDrop',
      'review_reminder': 'reviewReminder',
      'product_trending': 'productTrending',
      'new_offer': 'newOffer',
      'new_message': 'newMessage',
      'new_comment': 'newComment',
      'new_review': 'newReview',
      'product_approved': 'productApproved',
      'product_rejected': 'productRejected',
      'payment_pending_review': 'paymentNotification',
      'payment_confirmed': 'paymentNotification',
      'payment_rejected': 'paymentNotification',
      'payment_expired': 'paymentNotification'
    };

    const settingKey = typeMap[notificationType];
    if (!settingKey) {
      // Unknown type, default to true
      return true;
    }

    return settings[settingKey] !== false;
  } catch (error) {
    console.error('Error checking notification settings:', error);
    // On error, default to true (send notification)
    return true;
  }
};

