const Deal = require('../models/Deal');
const Claim = require('../models/Claim');

// @desc    Get all deals
// @route   GET /api/deals
exports.getDeals = async (req, res, next) => {
    try {
        const { category, isLocked, search, featured, page = 1, limit = 12 } = req.query;

        const query = { isActive: true };

        if (category && category !== 'all') {
            query.category = category;
        }

        if (isLocked !== undefined) {
            query.isLocked = isLocked === 'true';
        }

        if (featured === 'true') {
            query.featured = true;
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { 'partner.name': { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const deals = await Deal.find(query)
            .sort({ featured: -1, createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Deal.countDocuments(query);

        res.json({
            success: true,
            data: deals,
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

// @desc    Get single deal
// @route   GET /api/deals/:id
exports.getDeal = async (req, res, next) => {
    try {
        const deal = await Deal.findById(req.params.id);

        if (!deal) {
            return res.status(404).json({
                success: false,
                message: 'Deal not found'
            });
        }

        // check if user has claimed this deal
        let userClaim = null;
        if (req.user) {
            userClaim = await Claim.findOne({
                user: req.user._id,
                deal: deal._id
            });
        }

        res.json({
            success: true,
            data: deal,
            userClaim: userClaim ? {
                status: userClaim.status,
                claimCode: userClaim.claimCode,
                claimedAt: userClaim.createdAt
            } : null
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get deal categories with counts
// @route   GET /api/deals/categories
exports.getCategories = async (req, res, next) => {
    try {
        const categories = await Deal.aggregate([
            { $match: { isActive: true } },
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        res.json({
            success: true,
            data: categories.map(c => ({
                name: c._id,
                count: c.count
            }))
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get featured deals
// @route   GET /api/deals/featured
exports.getFeaturedDeals = async (req, res, next) => {
    try {
        const deals = await Deal.find({ isActive: true, featured: true })
            .sort({ createdAt: -1 })
            .limit(6);

        res.json({
            success: true,
            data: deals
        });
    } catch (err) {
        next(err);
    }
};
