const Message = require('../models/Message');

// Create a message
exports.sendMessage = async (req, res) => {
  try {
    const { clientId, content } = req.body;
    console.log('Received message data:', { clientId, content, userId: req.user._id });

    const message = await Message.create({
      client: clientId,
      sender: req.user._id,
      content,
    });

    res.status(201).json(message);
  } catch (error) {
    console.error('Message creation error:', error);
    res.status(500).json({ message: 'Failed to send message', error: error.message });
  }
};

// Get all messages for a client
exports.getClientMessages = async (req, res) => {
  try {
    const clientId = req.params.clientId;

    const messages = await Message.find({ client: clientId }).populate('sender', 'fullName email');
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch messages', error });
  }
};
