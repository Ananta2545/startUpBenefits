const Claim = require('../models/Claim');
const Deal = require('../models/Deal');

// @desc    Claim a deal
// @route   POST /api/claims
exports.createClaim = async (req, res, next) => {
    try {
        const { dealId, notes } = req.body;

        if (!dealId) {
            return res.status(400).json({
                success: false,
                message: 'Deal ID is required'
            });
        }

        const deal = await Deal.findById(dealId);
        if (!deal) {
            return res.status(404).json({
                success: false,
                message: 'Deal not found'
            });
        }

        if (!deal.isActive) {
            return res.status(400).json({
                success: false,
                message: 'This deal is no longer active'
            });
        }

        // check if deal is expired
        if (deal.expiresAt && new Date(deal.expiresAt) < new Date()) {
            return res.status(400).json({
                success: false,
                message: 'This deal has expired'
            });
        }

        // check if deal is locked and user is not verified
        if (deal.isLocked && !req.user.isVerified) {
            return res.status(403).json({
                success: false,
                message: 'You need to verify your account to claim this deal'
            });
        }

        // check max claims
        if (deal.maxClaims && deal.currentClaims >= deal.maxClaims) {
            return res.status(400).json({
                success: false,
                message: 'This deal has reached maximum claims'
            });
        }

        // check if already claimed
        const existingClaim = await Claim.findOne({
            user: req.user._id,
            deal: dealId
        });

        if (existingClaim) {
            return res.status(400).json({
                success: false,
                message: 'You have already claimed this deal'
            });
        }

        const claim = await Claim.create({
            user: req.user._id,
            deal: dealId,
            notes
        });

        // increment claim count
        await Deal.findByIdAndUpdate(dealId, {
            $inc: { currentClaims: 1 }
        });

        await claim.populate('deal');

        res.status(201).json({
            success: true,
            data: claim
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get user's claims
// @route   GET /api/claims
exports.getMyClaims = async (req, res, next) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;

        const query = { user: req.user._id };

        if (status) {
            query.status = status;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const claims = await Claim.find(query)
            .populate('deal')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Claim.countDocuments(query);

        res.json({
            success: true,
            data: claims,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get single claim
// @route   GET /api/claims/:id
exports.getClaim = async (req, res, next) => {
    try {
        const claim = await Claim.findOne({
            _id: req.params.id,
            user: req.user._id
        }).populate('deal');

        if (!claim) {
            return res.status(404).json({
                success: false,
                message: 'Claim not found'
            });
        }

        res.json({
            success: true,
            data: claim
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get claim stats for user
// @route   GET /api/claims/stats
exports.getClaimStats = async (req, res, next) => {
    try {
        const stats = await Claim.aggregate([
            { $match: { user: req.user._id } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const result = {
            total: 0,
            pending: 0,
            approved: 0,
            rejected: 0
        };

        stats.forEach(s => {
            result[s._id] = s.count;
            result.total += s.count;
        });

        res.json({
            success: true,
            data: result
        });
    } catch (err) {
        next(err);
    }
};
