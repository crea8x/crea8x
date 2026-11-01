const mongoose = require('mongoose');

const roleNeededSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    skills: [{
        type: String,
        trim: true,
    }],
    spots: {
        type: Number,
        default: 1,
        min: 1,
    },
    filled: {
        type: Number,
        default: 0,
    },
});

const teamMemberSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    role: {
        type: String,
        default: 'Collaborator',
        trim: true,
    },
    joinedAt: {
        type: Date,
        default: Date.now,
    },
});

const milestoneSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    completed: {
        type: Boolean,
        default: false,
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const projectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Project title is required'],
        trim: true,
        maxlength: 100,
    },
    description: {
        type: String,
        required: [true, 'Project description is required'],
        maxlength: 2000,
    },
    stage: {
        type: String,
        enum: ['idea', 'recruiting', 'building', 'launched'],
        default: 'recruiting',
    },
    thumbnail: {
        type: String,
        default: '',
    },
    liveUrl: {
        type: String,
        default: '',
    },
    repoUrl: {
        type: String,
        default: '',
    },
    tags: [{
        type: String,
        trim: true,
    }],
    rolesNeeded: [roleNeededSchema],
    team: [teamMemberSchema],
    milestones: [milestoneSchema],
    // Private collaboration links (visible only to team & author)
    teamLinks: {
        discord: { type: String, default: '' },
        slack: { type: String, default: '' },
        meet: { type: String, default: '' },
        notes: { type: String, default: '' },
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
}, {
    timestamps: true,
});

module.exports = mongoose.model('Project', projectSchema);
