const Project = require('../models/Project');
const User = require('../models/User');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');

// GET /api/projects — List all projects
const getProjects = async (req, res) => {
    try {
        const { tag, search, stage, recommended } = req.query;
        let filter = {};

        if (tag) {
            filter.tags = { $in: [new RegExp(tag, 'i')] };
        }
        if (stage && stage !== 'all') {
            filter.stage = stage;
        }
        if (search) {
            filter.$or = [
                { title: new RegExp(search, 'i') },
                { description: new RegExp(search, 'i') },
                { 'rolesNeeded.title': new RegExp(search, 'i') },
                { 'rolesNeeded.skills': { $in: [new RegExp(search, 'i')] } },
            ];
        }

        let projects;

        // Smart discovery: if user is authenticated and wants recommendations
        if (recommended === 'true' && req.user) {
            const user = await User.findById(req.user._id);
            if (user && user.skills.length > 0) {
                projects = await Project.aggregate([
                    {
                        $addFields: {
                            relevanceScore: {
                                $size: {
                                    $setIntersection: ['$tags', user.skills],
                                },
                            },
                        },
                    },
                    { $sort: { relevanceScore: -1, createdAt: -1 } },
                    { $limit: 20 },
                ]);
                projects = await Project.populate(projects, [
                    { path: 'author', select: '-password' },
                    { path: 'team.user', select: 'fullName username avatar skills' },
                ]);
                return res.json(projects);
            }
        }

        projects = await Project.find(filter)
            .populate('author', '-password')
            .populate('team.user', 'fullName username avatar skills')
            .sort({ createdAt: -1 })
            .limit(50);

        // Sanitize teamLinks for public list
        const sanitized = projects.map((p) => {
            const obj = p.toObject();
            delete obj.teamLinks;
            return obj;
        });

        res.json(sanitized);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/projects/:id
const getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate('author', '-password')
            .populate('team.user', 'fullName username avatar skills')
            .populate('milestones.assignedTo', 'fullName username avatar');

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const projectObj = project.toObject();

        // Check if current user is author or team member
        const currentUserId = req.user ? req.user._id.toString() : null;
        const isAuthor = currentUserId && project.author._id.toString() === currentUserId;
        const isTeamMember = currentUserId && project.team.some((m) => m.user && m.user._id.toString() === currentUserId);

        // Hide private team links from non-members
        if (!isAuthor && !isTeamMember) {
            projectObj.teamLinks = { discord: '', slack: '', meet: '', notes: '' };
        }

        res.json(projectObj);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST /api/projects
const createProject = async (req, res) => {
    try {
        const { title, description, thumbnail, liveUrl, repoUrl, tags, stage, rolesNeeded, milestones, teamLinks } = req.body;

        if (!title || !description) {
            return res.status(400).json({ message: 'Title and description are required' });
        }

        const team = [{
            user: req.user._id,
            role: 'Project Creator',
            joinedAt: new Date(),
        }];

        const project = await Project.create({
            title,
            description,
            thumbnail,
            liveUrl,
            repoUrl,
            tags: tags || [],
            stage: stage || 'recruiting',
            rolesNeeded: rolesNeeded || [],
            milestones: milestones || [],
            teamLinks: teamLinks || {},
            team,
            author: req.user._id,
        });

        const populated = await project.populate([
            { path: 'author', select: '-password' },
            { path: 'team.user', select: 'fullName username avatar skills' },
        ]);
        res.status(201).json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PUT /api/projects/:id
const updateProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        if (project.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const { title, description, thumbnail, liveUrl, repoUrl, tags, stage, rolesNeeded, teamLinks } = req.body;
        const updated = await Project.findByIdAndUpdate(
            req.params.id,
            { title, description, thumbnail, liveUrl, repoUrl, tags, stage, rolesNeeded, teamLinks },
            { new: true, runValidators: true }
        )
            .populate('author', '-password')
            .populate('team.user', 'fullName username avatar skills');

        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE /api/projects/:id
const deleteProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        if (project.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await project.deleteOne();
        await Comment.deleteMany({ project: req.params.id });
        res.json({ message: 'Project deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST /api/projects/:id/like — Toggle like
const toggleLike = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const userId = req.user._id;
        const index = project.likes.indexOf(userId);

        if (index === -1) {
            project.likes.push(userId);
        } else {
            project.likes.splice(index, 1);
        }

        await project.save();
        const populated = await project.populate([
            { path: 'author', select: '-password' },
            { path: 'team.user', select: 'fullName username avatar skills' },
        ]);
        res.json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ===== MILESTONES =====
// POST /api/projects/:id/milestones
const addMilestone = async (req, res) => {
    try {
        const { title } = req.body;
        if (!title) return res.status(400).json({ message: 'Milestone title is required' });

        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        const isAuthor = project.author.toString() === req.user._id.toString();
        const isTeamMember = project.team.some((m) => m.user.toString() === req.user._id.toString());
        if (!isAuthor && !isTeamMember) {
            return res.status(403).json({ message: 'Only team members can manage milestones' });
        }

        project.milestones.push({ title });
        await project.save();

        res.status(201).json(project.milestones);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PUT /api/projects/:id/milestones/:milestoneId/toggle
const toggleMilestone = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        const isAuthor = project.author.toString() === req.user._id.toString();
        const isTeamMember = project.team.some((m) => m.user.toString() === req.user._id.toString());
        if (!isAuthor && !isTeamMember) {
            return res.status(403).json({ message: 'Only team members can update milestones' });
        }

        const milestone = project.milestones.id(req.params.milestoneId);
        if (!milestone) return res.status(404).json({ message: 'Milestone not found' });

        milestone.completed = !milestone.completed;
        await project.save();

        res.json(project.milestones);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE /api/projects/:id/milestones/:milestoneId
const deleteMilestone = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        if (project.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Only project owner can delete milestones' });
        }

        project.milestones = project.milestones.filter((m) => m._id.toString() !== req.params.milestoneId);
        await project.save();

        res.json(project.milestones);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ===== COMMENTS & Q/A =====
// GET /api/projects/:id/comments
const getComments = async (req, res) => {
    try {
        const comments = await Comment.find({ project: req.params.id })
            .populate('author', 'fullName username avatar skills')
            .sort({ createdAt: 1 });
        res.json(comments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST /api/projects/:id/comments
const addComment = async (req, res) => {
    try {
        const { content } = req.body;
        if (!content || !content.trim()) {
            return res.status(400).json({ message: 'Comment content cannot be empty' });
        }

        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        const comment = await Comment.create({
            project: project._id,
            author: req.user._id,
            content: content.trim(),
        });

        // Notify author if comment is from someone else
        if (project.author.toString() !== req.user._id.toString()) {
            await Notification.create({
                recipient: project.author,
                sender: req.user._id,
                project: project._id,
                type: 'application_received',
                message: `${req.user.fullName || req.user.username} asked a question on "${project.title}"`,
            });
        }

        const populated = await comment.populate('author', 'fullName username avatar skills');
        res.status(201).json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE /api/projects/:id/comments/:commentId
const deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.commentId);
        if (!comment) return res.status(404).json({ message: 'Comment not found' });

        const project = await Project.findById(req.params.id);
        const isAuthor = comment.author.toString() === req.user._id.toString();
        const isProjectOwner = project && project.author.toString() === req.user._id.toString();

        if (!isAuthor && !isProjectOwner) {
            return res.status(403).json({ message: 'Not authorized to delete this comment' });
        }

        await comment.deleteOne();
        res.json({ message: 'Comment deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/projects/:id/recommended-creators — AI/Skill-based candidate recommendations for this project
const getRecommendedCreatorsForProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        const neededSkills = new Set();
        project.rolesNeeded?.forEach((r) => r.skills?.forEach((s) => neededSkills.add(s.toLowerCase())));
        project.tags?.forEach((t) => neededSkills.add(t.toLowerCase()));

        const excludeIds = [project.author];
        project.team?.forEach((m) => excludeIds.push(m.user));

        const candidates = await User.find({ _id: { $nin: excludeIds } })
            .select('fullName username avatar bio skills availability weeklyHours')
            .lean();

        const scored = candidates
            .map((c) => {
                if (!c.skills?.length || neededSkills.size === 0) return null;
                const matched = c.skills.filter((s) => neededSkills.has(s.toLowerCase()));
                if (matched.length === 0) return null;
                const matchScore = Math.min(99, Math.round((matched.length / Math.min(neededSkills.size, 3)) * 100));
                return {
                    ...c,
                    matchScore,
                    matchedSkills: matched,
                };
            })
            .filter(Boolean)
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, 6);

        res.json(scored);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getProjects,
    getProjectById,
    createProject,
    updateProject,
    deleteProject,
    toggleLike,
    addMilestone,
    toggleMilestone,
    deleteMilestone,
    getComments,
    addComment,
    deleteComment,
    getRecommendedCreatorsForProject,
};
