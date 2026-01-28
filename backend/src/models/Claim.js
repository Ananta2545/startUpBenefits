const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    deal: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Deal',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'expired'],
        default: 'pending'
    },
    claimCode: {
        type: String
    },
    notes: {
        type: String,
        maxlength: [500, 'Notes cannot exceed 500 characters']
    },
    reviewedAt: {
        type: Date
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// compound index to prevent duplicate claims
claimSchema.index({ user: 1, deal: 1 }, { unique: true });
claimSchema.index({ user: 1, status: 1 });
claimSchema.index({ status: 1, createdAt: -1 });

// generate claim code on approval
claimSchema.pre('save', function (next) {
    if (this.isModified('status') && this.status === 'approved' && !this.claimCode) {
        this.claimCode = 'SB-' + Math.random().toString(36).substring(2, 10).toUpperCase();
        this.reviewedAt = new Date();
    }
    next();
});

module.exports = mongoose.model('Claim', claimSchema);
