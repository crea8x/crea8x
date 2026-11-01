const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 30,
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 6,
    },
    fullName: {
        type: String,
        default: '',
        trim: true,
    },
    bio: {
        type: String,
        default: '',
        maxlength: 500,
    },
    avatar: {
        type: String,
        default: '',
    },
    skills: [{
        type: String,
        trim: true,
    }],
    availability: {
        type: String,
        enum: ['open', 'selective', 'busy'],
        default: 'open',
    },
    weeklyHours: {
        type: String,
        default: '5-10 hrs/week',
        trim: true,
    },
    socialLinks: {
        github: { type: String, default: '' },
        linkedin: { type: String, default: '' },
        portfolio: { type: String, default: '' },
    },
    role: {
        type: String,
        enum: ['member', 'admin'],
        default: 'member',
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('User', userSchema);
