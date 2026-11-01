const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
    },
    applicant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    role: {
        type: String,
        required: true,
        trim: true,
    },
    message: {
        type: String,
        default: '',
        maxlength: 1000,
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending',
    },
}, {
    timestamps: true,
});

// Ensure a user cannot apply to the same project role multiple times
applicationSchema.index({ project: 1, applicant: 1, role: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
