const express = require('express');
const {
    createNotification,
    getUserNotifications,
    markNotificationAsRead
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware.js'); // Middleware for authentication

const router = express.Router();

// POST /api/notifications
router.post('/', protect, createNotification); // Create a new notification

// GET /api/notifications/user
router.get('/user', protect, getUserNotifications); // Get notifications for the logged-in user

// PATCH /api/notifications/:id/read
router.patch('/:id/read', protect, markNotificationAsRead); // Mark a notification as read

module.exports = router;
