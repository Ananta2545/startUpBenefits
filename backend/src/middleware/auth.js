const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id);

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'User no longer exists'
            });
        }

        next();
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: 'Token is invalid or expired'
        });
    }
};

// middleware to check if user is verified
const requireVerified = (req, res, next) => {
    if (!req.user.isVerified) {
        return res.status(403).json({
            success: false,
            message: 'Your account needs to be verified to perform this action'
        });
    }
    next();
};

// admin only middleware
const adminOnly = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Admin access required'
        });
    }
    next();
};

module.exports = { protect, requireVerified, adminOnly };
