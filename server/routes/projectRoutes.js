const express = require('express');
const {
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
} = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getProjects);
router.get('/:id', protect, getProjectById);
router.get('/:id/recommended-creators', protect, getRecommendedCreatorsForProject);
router.post('/', protect, createProject);
router.put('/:id', protect, updateProject);
router.delete('/:id', protect, deleteProject);
router.post('/:id/like', protect, toggleLike);

// Milestones
router.post('/:id/milestones', protect, addMilestone);
router.put('/:id/milestones/:milestoneId/toggle', protect, toggleMilestone);
router.delete('/:id/milestones/:milestoneId', protect, deleteMilestone);

// Comments
router.get('/:id/comments', protect, getComments);
router.post('/:id/comments', protect, addComment);
router.delete('/:id/comments/:commentId', protect, deleteComment);

module.exports = router;
