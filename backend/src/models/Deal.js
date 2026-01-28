const mongoose = require('mongoose');

const dealSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Deal title is required'],
        trim: true,
        maxlength: [120, 'Title cannot exceed 120 characters']
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    shortDescription: {
        type: String,
        maxlength: [200, 'Short description cannot exceed 200 characters']
    },
    partner: {
        name: {
            type: String,
            required: true
        },
        logo: String,
        website: String,
        description: String
    },
    category: {
        type: String,
        required: true,
        enum: ['cloud', 'marketing', 'analytics', 'productivity', 'design', 'development', 'finance', 'communication']
    },
    discountType: {
        type: String,
        enum: ['percentage', 'fixed', 'credits', 'free_tier'],
        default: 'percentage'
    },
    discountValue: {
        type: String,
        required: true
    },
    originalPrice: {
        type: String
    },
    isLocked: {
        type: Boolean,
        default: false
    },
    eligibility: {
        type: String,
        default: 'All startups'
    },
    terms: {
        type: String
    },
    claimInstructions: {
        type: String
    },
    maxClaims: {
        type: Number,
        default: null
    },
    currentClaims: {
        type: Number,
        default: 0
    },
    expiresAt: {
        type: Date
    },
    isActive: {
        type: Boolean,
        default: true
    },
    featured: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// indexes
dealSchema.index({ category: 1 });
dealSchema.index({ isLocked: 1 });
dealSchema.index({ isActive: 1 });
dealSchema.index({ featured: -1, createdAt: -1 });

module.exports = mongoose.model('Deal', dealSchema);
