const express = require('express');
const { getProjects, getProjectById, createProject, updateProject, deleteProject, toggleLike } = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getProjects);
router.get('/:id', protect, getProjectById);
router.post('/', protect, createProject);
router.put('/:id', protect, updateProject);
router.delete('/:id', protect, deleteProject);
router.post('/:id/like', protect, toggleLike);

module.exports = router;
