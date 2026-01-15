const express = require('express');
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification
} = require('../controllers/notificationController');
const {
  getSettings,
  updateSettings
} = require('../controllers/notificationSettingsController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getNotifications);
router.get('/count', getUnreadCount);
router.put('/:id/read', markAsRead);
router.put('/read-all', markAllAsRead);
router.delete('/:id', deleteNotification);

// Notification settings routes
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

module.exports = router;



