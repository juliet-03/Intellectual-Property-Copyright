const express = require('express');
const router = express.Router();
const { sendMessage, getClientMessages } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

// Send message to a client
router.post('/', protect, sendMessage);

// Get messages for a client
router.get('/:clientId', protect, getClientMessages);

module.exports = router;
