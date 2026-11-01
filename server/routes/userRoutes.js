const express = require('express');
const { getUsers, getUserById, updateUser, getRecommendations } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getUsers);
router.get('/:id', protect, getUserById);
router.put('/:id', protect, updateUser);
router.get('/:id/recommendations', protect, getRecommendations);

module.exports = router;
