// controllers/notificationController.js
const Notification = require('../models/notificationModel'); // Adjust the path as necessary

// Create a new notification
exports.createNotification = async (req, res) => {
    const { user, message } = req.body;

    try {
        const newNotification = new Notification({ user, message });
        await newNotification.save();
        res.status(201).json({ message: "Notification created successfully.", notification: newNotification });
    } catch (error) {
        res.status(500).json({ message: "Error creating notification.", error });
    }
};

// Get all notifications for a user
exports.getUserNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving notifications.", error });
    }
};

// Mark a notification as read
exports.markNotificationAsRead = async (req, res) => {
    const { id } = req.params;

    try {
        const notification = await Notification.findById(id);
        if (!notification) return res.status(404).json({ message: "Notification not found." });

        notification.isRead = true;
        await notification.save();
        res.status(200).json(notification);
    } catch (error) {
        res.status(500).json({ message: "Error marking notification as read.", error });
    }
};
