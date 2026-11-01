const express = require('express');
const {
    applyToProject,
    getProjectApplications,
    updateApplicationStatus,
    getMyApplications,
} = require('../controllers/applicationController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/apply/:projectId', protect, applyToProject);
router.get('/project/:projectId', protect, getProjectApplications);
router.put('/:id/status', protect, updateApplicationStatus);
router.get('/my', protect, getMyApplications);

module.exports = router;

