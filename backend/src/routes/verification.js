const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect, adminOnly } = require('../middleware/auth');
const {
    submitRequest,
    getMyStatus,
    getAllRequests,
    approveRequest,
    rejectRequest,
    getAllUsers
} = require('../controllers/verificationController');

// User routes
router.post('/request', protect, [
    body('companyName').notEmpty().withMessage('Company name is required'),
    body('companyDescription').notEmpty().withMessage('Company description is required')
        .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
    body('teamSize').optional().isIn(['1-10', '11-50', '51-200', '200+']),
    body('foundingYear').optional().isInt({ min: 1900, max: new Date().getFullYear() })
], submitRequest);

router.get('/status', protect, getMyStatus);

// Admin routes
router.get('/requests', protect, adminOnly, getAllRequests);
router.get('/users', protect, adminOnly, getAllUsers);
router.put('/approve/:id', protect, adminOnly, approveRequest);
router.put('/reject/:id', protect, adminOnly, rejectRequest);

module.exports = router;
