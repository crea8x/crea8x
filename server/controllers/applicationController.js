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

        if (project.author.toString() === applicantId.toString()) {
            return res.status(400).json({ message: 'You cannot apply to your own project' });
        }

        const alreadyInTeam = project.team.some(
            (m) => m.user.toString() === applicantId.toString()
        );
        if (alreadyInTeam) {
            return res.status(400).json({ message: 'You are already a team member on this project' });
        }

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
            origin: 'application',
            message: message || '',
        });

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

// POST /api/applications/invite — Owner invites a creator to join
const inviteCreator = async (req, res) => {
    try {
        const { projectId, userId, role, message } = req.body;
        if (!projectId || !userId || !role) {
            return res.status(400).json({ message: 'Project, user, and role are required' });
        }

        const project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        if (project.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Only project owner can send invitations' });
        }

        const isAlreadyMember = project.team.some((m) => m.user.toString() === userId.toString());
        if (isAlreadyMember) {
            return res.status(400).json({ message: 'User is already a member of this project team' });
        }

        const application = await Application.create({
            project: projectId,
            applicant: userId,
            role,
            origin: 'invite',
            message: message || '',
        });

        await Notification.create({
            recipient: userId,
            sender: req.user._id,
            project: projectId,
            type: 'project_invite',
            message: `🎉 ${req.user.fullName || req.user.username} invited you to join "${project.title}" as ${role}!`,
        });

        res.status(201).json(application);
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

// PUT /api/applications/:id/status — Accept or Reject application/invite
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
        const currentUserId = req.user._id.toString();
        const isOwner = project.author.toString() === currentUserId;
        const isApplicant = application.applicant._id.toString() === currentUserId;

        // If it's an invite: the recipient (applicant) decides. If it's an application: the owner decides.
        if (application.origin === 'invite' && !isApplicant && !isOwner) {
            return res.status(403).json({ message: 'Not authorized to respond to this invite' });
        }
        if (application.origin === 'application' && !isOwner) {
            return res.status(403).json({ message: 'Only the project creator can review applications' });
        }

        application.status = status;
        await application.save();

        if (status === 'accepted') {
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

            const roleObj = project.rolesNeeded.find((r) => r.title.toLowerCase() === application.role.toLowerCase());
            if (roleObj) {
                roleObj.filled = (roleObj.filled || 0) + 1;
            }

            await project.save();

            // Notify recipient
            const notifyTarget = application.origin === 'invite' ? project.author : application.applicant._id;
            const notificationMsg =
                application.origin === 'invite'
                    ? `🎉 ${application.applicant.fullName || application.applicant.username} accepted your invitation to join "${project.title}"!`
                    : `🎉 You've been accepted to join "${project.title}" as ${application.role}!`;

            await Notification.create({
                recipient: notifyTarget,
                sender: req.user._id,
                project: project._id,
                type: 'application_accepted',
                message: notificationMsg,
            });
        }

        res.json(application);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/applications/my — Current user's applications & invitations
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
    inviteCreator,
    getProjectApplications,
    updateApplicationStatus,
    getMyApplications,
};
