const mongoose = require('mongoose');

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
