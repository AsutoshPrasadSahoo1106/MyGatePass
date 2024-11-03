const express = require('express');
const {
    createGatePass,
    getUserGatePasses,
    updateGatePassStatus,
    getPendingGatePassesForWarden,
    getApprovedGatePassesForGuard,
    getGatePassHistory
} = require('../controllers/gatePassContoller');
const { protect } = require('../middleware/authMiddleware.js'); // Middleware for authentication

const router = express.Router();

// POST /api/gatepasses
router.post('/', protect, createGatePass);

// GET /api/gatepasses/user
router.get('/user', protect, getUserGatePasses); // Get gate passes for the logged-in user

// GET /api/gatepasses/pending
router.get('/pending', protect, getPendingGatePassesForWarden); // Get pending gate passes for the warden

// GET /api/gatepasses/approved
router.get('/approved', protect, getApprovedGatePassesForGuard); // Get approved gate passes for the guard

// PATCH /api/gatepasses/:id/status
router.patch('/:id/status', protect, updateGatePassStatus); // Approve or reject a gate pass

router.get('/history', protect, getGatePassHistory);

module.exports = router;
