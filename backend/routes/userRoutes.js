const express = require('express');
const { registerUser, loginUser, getUser } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware.js'); // Middleware for authentication

const router = express.Router();

// POST /api/users/register
router.post('/register', registerUser);

// POST /api/users/login
router.post('/login', loginUser);

// GET /api/users/me
router.get('/me', protect, getUser); // Protected route to get the logged-in user's details

module.exports = router;
