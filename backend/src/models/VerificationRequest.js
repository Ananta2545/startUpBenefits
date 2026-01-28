const mongoose = require('mongoose');

const verificationRequestSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true // One request per user
    },
    companyName: {
        type: String,
        required: [true, 'Company name is required'],
        trim: true
    },
    companyWebsite: {
        type: String,
        trim: true
    },
    companyDescription: {
        type: String,
        required: [true, 'Company description is required'],
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    foundingYear: {
        type: Number
    },
    teamSize: {
        type: String,
        enum: ['1-10', '11-50', '51-200', '200+']
    },
    linkedinUrl: {
        type: String,
        trim: true
    },
    additionalInfo: {
        type: String,
        maxlength: [500, 'Additional info cannot exceed 500 characters']
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reviewedAt: {
        type: Date
    },
    rejectionReason: {
        type: String
    }
}, {
    timestamps: true
});

// Index for quick lookups
verificationRequestSchema.index({ status: 1, createdAt: -1 });
verificationRequestSchema.index({ user: 1 });

module.exports = mongoose.model('VerificationRequest', verificationRequestSchema);
