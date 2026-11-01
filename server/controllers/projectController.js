const Project = require('../models/Project');
const User = require('../models/User');

// GET /api/projects — List all projects (with optional tag filter + smart sorting)
const getProjects = async (req, res) => {
    try {
        const { tag, search, recommended } = req.query;
        let filter = {};

        if (tag) {
            filter.tags = { $in: [new RegExp(tag, 'i')] };
        }
        if (search) {
            filter.$or = [
                { title: new RegExp(search, 'i') },
                { description: new RegExp(search, 'i') },
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
                // Populate author
                projects = await Project.populate(projects, { path: 'author', select: '-password' });
                return res.json(projects);
            }
        }

        projects = await Project.find(filter)
            .populate('author', '-password')
            .sort({ createdAt: -1 })
            .limit(50);

        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/projects/:id
const getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id).populate('author', '-password');
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        res.json(project);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST /api/projects
const createProject = async (req, res) => {
    try {
        const { title, description, thumbnail, liveUrl, repoUrl, tags } = req.body;

        if (!title || !description) {
            return res.status(400).json({ message: 'Title and description are required' });
        }

        const project = await Project.create({
            title,
            description,
            thumbnail,
            liveUrl,
            repoUrl,
            tags: tags || [],
            author: req.user._id,
        });

        const populated = await project.populate('author', '-password');
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

        const { title, description, thumbnail, liveUrl, repoUrl, tags } = req.body;
        const updated = await Project.findByIdAndUpdate(
            req.params.id,
            { title, description, thumbnail, liveUrl, repoUrl, tags },
            { new: true, runValidators: true }
        ).populate('author', '-password');

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
        const populated = await project.populate('author', '-password');
        res.json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getProjects, getProjectById, createProject, updateProject, deleteProject, toggleLike };
