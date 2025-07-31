const express = require('express');
const router = express.Router();
const { sendMessage, getClientMessages } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

// Send message to a client - Fix the route
router.post('/send', protect, sendMessage);

// Get messages for a client
router.get('/client/:clientId', protect, getClientMessages);

module.exports = router;
