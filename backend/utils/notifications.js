const Notification = require('../models/Notification');
const { shouldSendNotification } = require('../controllers/notificationSettingsController');

// Helper function to create and emit notification
const createAndEmitNotification = async (io, userId, type, title, message, data = {}) => {
  try {
    // Check if user wants to receive this type of notification
    const shouldSend = await shouldSendNotification(userId, type);
    if (!shouldSend) {
      console.log(`Skipping notification ${type} for user ${userId} (disabled in settings)`);
      return null;
    }

    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      data
    });

    // Emit to user's room
    if (io) {
      io.to(`user-${userId}`).emit('new-notification', notification);
    }

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

module.exports = { createAndEmitNotification };

