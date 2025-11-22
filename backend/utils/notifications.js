const Notification = require('../models/Notification');

// Helper function to create and emit notification
const createAndEmitNotification = async (io, userId, type, title, message, data = {}) => {
  try {
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

