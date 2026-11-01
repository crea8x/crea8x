const User = require('../models/User');
const Project = require('../models/Project');

// GET /api/users — List all users (with optional skill filter)
const getUsers = async (req, res) => {
    try {
        const { skill, search } = req.query;
        let filter = {};

        if (skill) {
            filter.skills = { $in: [new RegExp(skill, 'i')] };
        }
        if (search) {
            filter.$or = [
                { username: new RegExp(search, 'i') },
                { fullName: new RegExp(search, 'i') },
            ];
        }

        const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/users/:id — Get single user profile with creations and collaborations
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Projects created by this user
        const createdProjects = await Project.find({ author: user._id })
            .select('title description stage thumbnail tags createdAt likes')
            .sort({ createdAt: -1 });

        // Projects this user collaborated on as an accepted team member (excluding authored)
        const collaborations = await Project.find({
            'team.user': user._id,
            author: { $ne: user._id },
        })
            .select('title description stage thumbnail tags createdAt team author')
            .populate('author', 'fullName username avatar')
            .sort({ createdAt: -1 });

        const userObj = user.toObject();
        userObj.createdProjects = createdProjects;
        userObj.collaborations = collaborations;

        res.json(userObj);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PUT /api/users/:id — Update profile (self only)
const updateUser = async (req, res) => {
    try {
        if (req.user._id.toString() !== req.params.id) {
            return res.status(403).json({ message: 'Not authorized to update this profile' });
        }

        const { fullName, bio, avatar, skills, socialLinks } = req.body;

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { fullName, bio, avatar, skills, socialLinks },
            { new: true, runValidators: true }
        ).select('-password');

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/users/:id/recommendations — Skill-based member recommendations
const getRecommendations = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user || !user.skills.length) {
            return res.json([]);
        }

        // Find users with overlapping skills, excluding self
        const recommendations = await User.aggregate([
            { $match: { _id: { $ne: user._id } } },
            {
                $addFields: {
                    matchingSkills: {
                        $size: {
                            $setIntersection: ['$skills', user.skills],
                        },
                    },
                },
            },
            { $match: { matchingSkills: { $gt: 0 } } },
            { $sort: { matchingSkills: -1 } },
            { $limit: 6 },
            { $project: { password: 0 } },
        ]);

        res.json(recommendations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getUsers, getUserById, updateUser, getRecommendations };
