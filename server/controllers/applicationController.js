const Application = require('../models/Application');
const Project = require('../models/Project');
const Notification = require('../models/Notification');
const User = require('../models/User');

// POST /api/applications/apply/:projectId
const applyToProject = async (req, res) => {
    try {
        const { role, message } = req.body;
        const { projectId } = req.params;
        const applicantId = req.user._id;

        if (!role) {
            return res.status(400).json({ message: 'Role is required to apply' });
        }

        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Author cannot apply to their own project
        if (project.author.toString() === applicantId.toString()) {
            return res.status(400).json({ message: 'You cannot apply to your own project' });
        }

        // Check if user is already on the team
        const alreadyInTeam = project.team.some(
            (m) => m.user.toString() === applicantId.toString()
        );
        if (alreadyInTeam) {
            return res.status(400).json({ message: 'You are already a team member on this project' });
        }

        // Check for existing pending application for this role
        const existingApp = await Application.findOne({
            project: projectId,
            applicant: applicantId,
            role,
            status: 'pending',
        });
        if (existingApp) {
            return res.status(400).json({ message: 'You already have a pending application for this role' });
        }

        const application = await Application.create({
            project: projectId,
            applicant: applicantId,
            role,
            message: message || '',
        });

        // Create notification for the project author
        const applicant = await User.findById(applicantId);
        await Notification.create({
            recipient: project.author,
            sender: applicantId,
            project: projectId,
            type: 'application_received',
            message: `${applicant.fullName || applicant.username} applied to join "${project.title}" as ${role}`,
        });

        const populated = await application.populate([
            { path: 'applicant', select: 'fullName username avatar skills bio' },
            { path: 'project', select: 'title' },
        ]);

        res.status(201).json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/applications/project/:projectId — Owner views applications
const getProjectApplications = async (req, res) => {
    try {
        const { projectId } = req.params;
        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        if (project.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to view applications for this project' });
        }

        const applications = await Application.find({ project: projectId })
            .populate('applicant', 'fullName username avatar skills email bio')
            .sort({ createdAt: -1 });

        res.json(applications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PUT /api/applications/:id/status — Accept or Reject application
const updateApplicationStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!['accepted', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Status must be accepted or rejected' });
        }

        const application = await Application.findById(req.params.id)
            .populate('project')
            .populate('applicant', 'fullName username email');

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        const project = await Project.findById(application.project._id);
        if (project.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Only the project creator can review applications' });
        }

        application.status = status;
        await application.save();

        if (status === 'accepted') {
            // Add to project team if not already added
            const isAlreadyMember = project.team.some(
                (m) => m.user.toString() === application.applicant._id.toString()
            );

            if (!isAlreadyMember) {
                project.team.push({
                    user: application.applicant._id,
                    role: application.role,
                    joinedAt: new Date(),
                });
            }

            // Update filled count in rolesNeeded
            const roleObj = project.rolesNeeded.find((r) => r.title.toLowerCase() === application.role.toLowerCase());
            if (roleObj) {
                roleObj.filled = (roleObj.filled || 0) + 1;
            }

            await project.save();

            // Notify applicant
            await Notification.create({
                recipient: application.applicant._id,
                sender: req.user._id,
                project: project._id,
                type: 'application_accepted',
                message: `🎉 Great news! You've been accepted to join "${project.title}" as ${application.role}!`,
            });
        } else {
            // Notify applicant of rejection
            await Notification.create({
                recipient: application.applicant._id,
                sender: req.user._id,
                project: project._id,
                type: 'application_rejected',
                message: `Your application to join "${project.title}" as ${application.role} was not selected this time.`,
            });
        }

        res.json(application);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/applications/my — Current user's applications
const getMyApplications = async (req, res) => {
    try {
        const applications = await Application.find({ applicant: req.user._id })
            .populate({
                path: 'project',
                select: 'title description thumbnail stage author',
                populate: { path: 'author', select: 'fullName username avatar' },
            })
            .sort({ createdAt: -1 });

        res.json(applications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    applyToProject,
    getProjectApplications,
    updateApplicationStatus,
    getMyApplications,
};
