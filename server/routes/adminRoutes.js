const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
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
} = require('../controllers/adminController');

// All admin routes require authentication and admin role
router.use(protect);
router.use(admin);

// Analytics
router.get('/stats', getPlatformStats);

// Users management
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/status', toggleUserStatus);
router.delete('/users/:id', deleteUser);

// Projects management
router.get('/projects', getAllProjects);
router.put('/projects/:id/featured', toggleProjectFeatured);
router.put('/projects/:id/stage', updateProjectStage);
router.delete('/projects/:id', deleteProjectAdmin);

// Announcements & Broadcast
router.post('/broadcast', broadcastAnnouncement);

// Content moderation (Comments)
router.get('/comments', getAllComments);
router.delete('/comments/:id', deleteCommentAdmin);

module.exports = router;

