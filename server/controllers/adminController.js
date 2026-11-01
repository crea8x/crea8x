const User = require('../models/User');
const Project = require('../models/Project');
const Application = require('../models/Application');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');

// GET /api/admin/stats
const getPlatformStats = async (req, res) => {
    try {
        const [
            totalUsers,
            activeUsers,
            suspendedUsers,
            adminUsers,
            totalProjects,
            featuredProjects,
            ideaProjects,
            recruitingProjects,
            buildingProjects,
            launchedProjects,
            totalApplications,
            pendingApplications,
            acceptedApplications,
            rejectedApplications,
            totalComments,
            recentUsers,
            recentProjects,
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ status: 'active' }),
            User.countDocuments({ status: 'suspended' }),
            User.countDocuments({ role: 'admin' }),
            Project.countDocuments(),
            Project.countDocuments({ featured: true }),
            Project.countDocuments({ stage: 'idea' }),
            Project.countDocuments({ stage: 'recruiting' }),
            Project.countDocuments({ stage: 'building' }),
            Project.countDocuments({ stage: 'launched' }),
            Application.countDocuments(),
            Application.countDocuments({ status: 'pending' }),
            Application.countDocuments({ status: 'accepted' }),
            Application.countDocuments({ status: 'rejected' }),
            Comment.countDocuments(),
            User.find().sort({ createdAt: -1 }).limit(5).select('-password'),
            Project.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .populate('author', 'username fullName avatar'),
        ]);

        res.json({
            users: {
                total: totalUsers,
                active: activeUsers,
                suspended: suspendedUsers,
                admins: adminUsers,
                recent: recentUsers,
            },
            projects: {
                total: totalProjects,
                featured: featuredProjects,
                stages: {
                    idea: ideaProjects,
                    recruiting: recruitingProjects,
                    building: buildingProjects,
                    launched: launchedProjects,
                },
                recent: recentProjects,
            },
            collaborations: {
                totalApplications,
                pending: pendingApplications,
                accepted: acceptedApplications,
                rejected: rejectedApplications,
                acceptanceRate:
                    totalApplications > 0
                        ? Math.round((acceptedApplications / totalApplications) * 100)
                        : 0,
            },
            discussions: {
                totalComments,
            },
            system: {
                status: 'operational',
                serverTime: new Date().toISOString(),
                nodeVersion: process.version,
            },
        });
    } catch (error) {
        console.error('Admin getStats error:', error);
        res.status(500).json({ message: error.message });
    }
};

// GET /api/admin/users
const getAllUsers = async (req, res) => {
    try {
        const { search, role, status } = req.query;
        const query = {};

        if (search) {
            query.$or = [
                { username: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { fullName: { $regex: search, $options: 'i' } },
            ];
        }

        if (role && role !== 'all') {
            query.role = role;
        }

        if (status && status !== 'all') {
            query.status = status;
        }

        const users = await User.find(query).sort({ createdAt: -1 }).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PUT /api/admin/users/:id/role
const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        if (!['member', 'admin'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        if (req.params.id === req.user._id.toString() && role !== 'admin') {
            return res.status(400).json({ message: 'Cannot demote your own admin account.' });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PUT /api/admin/users/:id/status
const toggleUserStatus = async (req, res) => {
    try {
        if (req.params.id === req.user._id.toString()) {
            return res.status(400).json({ message: 'Cannot suspend your own account.' });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.status = user.status === 'suspended' ? 'active' : 'suspended';
        await user.save();

        res.json({
            _id: user._id,
            username: user.username,
            status: user.status,
            message: `User ${user.username} is now ${user.status}`,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
    try {
        if (req.params.id === req.user._id.toString()) {
            return res.status(400).json({ message: 'Cannot delete your own account from admin panel.' });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Clean up associated resources
        await Promise.all([
            Project.deleteMany({ author: user._id }),
            Application.deleteMany({ applicant: user._id }),
            Comment.deleteMany({ author: user._id }),
            Notification.deleteMany({ user: user._id }),
            User.findByIdAndDelete(user._id),
        ]);

        res.json({ message: `User @${user.username} and their data were permanently deleted.` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/admin/projects
const getAllProjects = async (req, res) => {
    try {
        const { search, stage, featured } = req.query;
        const query = {};

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $regex: search, $options: 'i' } },
            ];
        }

        if (stage && stage !== 'all') {
            query.stage = stage;
        }

        if (featured !== undefined && featured !== 'all') {
            query.featured = featured === 'true';
        }

        const projects = await Project.find(query)
            .sort({ createdAt: -1 })
            .populate('author', 'username fullName email avatar');

        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PUT /api/admin/projects/:id/featured
const toggleProjectFeatured = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        project.featured = !project.featured;
        await project.save();

        res.json({
            _id: project._id,
            title: project.title,
            featured: project.featured,
            message: project.featured
                ? `⭐ "${project.title}" is now Featured!`
                : `"${project.title}" was removed from Featured.`,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PUT /api/admin/projects/:id/stage
const updateProjectStage = async (req, res) => {
    try {
        const { stage } = req.body;
        if (!['idea', 'recruiting', 'building', 'launched'].includes(stage)) {
            return res.status(400).json({ message: 'Invalid stage' });
        }

        const project = await Project.findByIdAndUpdate(
            req.params.id,
            { stage },
            { new: true }
        ).populate('author', 'username fullName avatar');

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        res.json(project);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE /api/admin/projects/:id
const deleteProjectAdmin = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        await Promise.all([
            Application.deleteMany({ project: project._id }),
            Comment.deleteMany({ project: project._id }),
            Notification.deleteMany({ project: project._id }),
            Project.findByIdAndDelete(project._id),
        ]);

        res.json({ message: `Project "${project.title}" was permanently removed.` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST /api/admin/broadcast
const broadcastAnnouncement = async (req, res) => {
    try {
        const { title, message, urgency } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({ message: 'Announcement message is required' });
        }

        const users = await User.find({ status: 'active' }).select('_id');

        const prefix = urgency === 'alert' ? '🚨 ALERT: ' : urgency === 'celebration' ? '🎉 ' : '📢 ';
        const notificationText = title
            ? `${prefix}${title.trim()} — ${message.trim()}`
            : `${prefix}${message.trim()}`;

        const notifications = users.map((u) => ({
            user: u._id,
            message: notificationText,
            type: 'system',
            read: false,
        }));

        if (notifications.length > 0) {
            await Notification.insertMany(notifications);
        }

        res.json({
            success: true,
            recipientCount: users.length,
            message: `Announcement broadcasted to ${users.length} active creators!`,
        });
    } catch (error) {
        console.error('Broadcast error:', error);
        res.status(500).json({ message: error.message });
    }
};

// GET /api/admin/comments
const getAllComments = async (req, res) => {
    try {
        const comments = await Comment.find()
            .sort({ createdAt: -1 })
            .limit(100)
            .populate('author', 'username fullName avatar email')
            .populate('project', 'title _id');

        res.json(comments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE /api/admin/comments/:id
const deleteCommentAdmin = async (req, res) => {
    try {
        const comment = await Comment.findByIdAndDelete(req.params.id);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getPlatformStats,
    getAllUsers,
    updateUserRole,
    toggleUserStatus,
    deleteUser,
    getAllProjects,
    toggleProjectFeatured,
    updateProjectStage,
    deleteProjectAdmin,
    broadcastAnnouncement,
    getAllComments,
    deleteCommentAdmin,
};

