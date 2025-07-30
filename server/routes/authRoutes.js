const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');

// Public Auth Routes
router.post('/register', registerUser);
router.post('/login', loginUser);

module.exports = router;
