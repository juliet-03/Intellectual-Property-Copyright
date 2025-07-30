const express = require('express');
const router = express.Router();
const { registerUser, loginUser, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public Auth Routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected profile update
router.put('/profile', protect, updateProfile);

module.exports = router;
