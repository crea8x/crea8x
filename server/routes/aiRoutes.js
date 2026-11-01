const express = require('express');
const { generateDescription, generateBio, suggestTags, getSkillInsights } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/generate-description', protect, generateDescription);
router.post('/generate-bio', protect, generateBio);
router.post('/suggest-tags', protect, suggestTags);
router.post('/skill-insights', protect, getSkillInsights);

module.exports = router;
