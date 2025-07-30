const express = require('express');
const router = express.Router();
const { getAIResponse } = require('../services/aiService');

router.post('/', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message || typeof message !== 'string' || !message.trim()) {
      console.log('Invalid message received:', req.body);
      return res.status(400).json({ 
        error: 'Invalid message',
        message: 'Please provide a valid message string'
      });
    }

    console.log('Processing message:', message);
    
    const reply = await getAIResponse(message.trim());
    
    console.log('Sending reply:', reply);
    res.json({ reply });
    
  } catch (error) {
    console.error('Chat route error:', error);
    res.status(500).json({ 
      error: 'Failed to process message',
      message: 'An error occurred while processing your request'
    });
  }
});

module.exports = router;

