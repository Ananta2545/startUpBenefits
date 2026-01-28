const express = require('express');
const { getDeals, getDeal, getCategories, getFeaturedDeals } = require('../controllers/dealsController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// optional auth middleware for checking user claims
const optionalAuth = async (req, res, next) => {
    const { protect } = require('../middleware/auth');

    if (req.headers.authorization) {
        try {
            const jwt = require('jsonwebtoken');
            const User = require('../models/User');
            const token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id);
        } catch (e) {
            // token invalid, continue without user
        }
    }
    next();
};

router.get('/', getDeals);
router.get('/featured', getFeaturedDeals);
router.get('/categories', getCategories);
router.get('/:id', optionalAuth, getDeal);

module.exports = router;
