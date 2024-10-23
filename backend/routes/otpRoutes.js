const express = require('express');
const {
    generateOTP,
    verifyOTP
} = require('../controllers/otpContoller.js');
const { protect } = require('../middleware/authMiddleware.js'); // Middleware for authentication

const router = express.Router();

// POST /api/otp/generate
router.post('/generate', protect, generateOTP); // Generate and send OTP

// POST /api/otp/verify
router.post('/verify', protect, verifyOTP); // Verify OTP

module.exports = router;
