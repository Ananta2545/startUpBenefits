const VerificationRequest = require('../models/VerificationRequest');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// @desc    Submit verification request
// @route   POST /api/verification/request
exports.submitRequest = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        // Check if user already verified
        if (req.user.isVerified) {
            return res.status(400).json({
                success: false,
                message: 'You are already verified'
            });
        }

        // Check for existing pending request
        const existingRequest = await VerificationRequest.findOne({ user: req.user.id });
        if (existingRequest) {
            return res.status(400).json({
                success: false,
                message: existingRequest.status === 'pending'
                    ? 'You already have a pending verification request'
                    : existingRequest.status === 'rejected'
                        ? 'Your previous request was rejected. Please contact support.'
                        : 'Request already exists'
            });
        }

        const {
            companyName,
            companyWebsite,
            companyDescription,
            foundingYear,
            teamSize,
            linkedinUrl,
            additionalInfo
        } = req.body;

        const verificationRequest = await VerificationRequest.create({
            user: req.user.id,
            companyName,
            companyWebsite,
            companyDescription,
            foundingYear,
            teamSize,
            linkedinUrl,
            additionalInfo
        });

        res.status(201).json({
            success: true,
            message: 'Verification request submitted successfully',
            data: verificationRequest
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get my verification request status
// @route   GET /api/verification/status
exports.getMyStatus = async (req, res, next) => {
    try {
        const request = await VerificationRequest.findOne({ user: req.user.id });

        res.json({
            success: true,
            data: request || null,
            isVerified: req.user.isVerified
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get all verification requests (Admin)
// @route   GET /api/verification/requests
exports.getAllRequests = async (req, res, next) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const query = {};

        if (status) query.status = status;

        const requests = await VerificationRequest.find(query)
            .populate('user', 'name email companyName createdAt')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await VerificationRequest.countDocuments(query);

        res.json({
            success: true,
            data: requests,
            pagination: {
                page: parseInt(page),
                pages: Math.ceil(total / limit),
                total
            }
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Approve verification request (Admin)
// @route   PUT /api/verification/approve/:id
exports.approveRequest = async (req, res, next) => {
    try {
        const request = await VerificationRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Request not found'
            });
        }

        if (request.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Request has already been processed'
            });
        }

        // Update request status
        request.status = 'approved';
        request.reviewedBy = req.user.id;
        request.reviewedAt = new Date();
        await request.save();

        // Update user verification status
        await User.findByIdAndUpdate(request.user, { isVerified: true });

        res.json({
            success: true,
            message: 'Request approved successfully',
            data: request
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Reject verification request (Admin)
// @route   PUT /api/verification/reject/:id
exports.rejectRequest = async (req, res, next) => {
    try {
        const { reason } = req.body;

        const request = await VerificationRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Request not found'
            });
        }

        if (request.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Request has already been processed'
            });
        }

        request.status = 'rejected';
        request.rejectionReason = reason || 'Your request did not meet our verification criteria';
        request.reviewedBy = req.user.id;
        request.reviewedAt = new Date();
        await request.save();

        res.json({
            success: true,
            message: 'Request rejected',
            data: request
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get all users (Admin)
// @route   GET /api/verification/users
exports.getAllUsers = async (req, res, next) => {
    try {
        const { isVerified, page = 1, limit = 50 } = req.query;
        const query = { role: { $ne: 'admin' } }; // Exclude admins

        if (isVerified !== undefined) {
            query.isVerified = isVerified === 'true';
        }

        const users = await User.find(query)
            .select('name email companyName isVerified createdAt')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await User.countDocuments(query);
        const verifiedCount = await User.countDocuments({ ...query, isVerified: true });
        const unverifiedCount = await User.countDocuments({ ...query, isVerified: false });

        res.json({
            success: true,
            data: users,
            stats: {
                total,
                verified: verifiedCount,
                unverified: unverifiedCount
            },
            pagination: {
                page: parseInt(page),
                pages: Math.ceil(total / limit),
                total
            }
        });
    } catch (err) {
        next(err);
    }
};
