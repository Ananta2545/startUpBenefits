const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

// helper to generate token
const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
exports.register = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { email, password, name, companyName, companySize } = req.body;

        // check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }

        const user = await User.create({
            email,
            password,
            name,
            companyName,
            companySize
        });

        const token = signToken(user._id);

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                companyName: user.companyName,
                isVerified: user.isVerified,
                role: user.role
            }
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { email, password } = req.body;

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const token = signToken(user._id);

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                companyName: user.companyName,
                isVerified: user.isVerified,
                role: user.role
            }
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get current user
// @route   GET /api/auth/me
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        res.json({
            success: true,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                companyName: user.companyName,
                companySize: user.companySize,
                isVerified: user.isVerified,
                role: user.role,
                createdAt: user.createdAt
            }
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
exports.updateProfile = async (req, res, next) => {
    try {
        const { name, companyName, companySize } = req.body;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { name, companyName, companySize },
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                companyName: user.companyName,
                companySize: user.companySize,
                isVerified: user.isVerified
            }
        });
    } catch (err) {
        next(err);
    }
};
