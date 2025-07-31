const express = require('express');
const router = express.Router();
const { getAIResponse, streamAIResponse } = require('../services/aiService');

// Regular chat endpoint (non-streaming)
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

// Streaming chat endpoint
router.post('/stream', async (req, res) => {
  try {
    console.log('Streaming endpoint hit');
    console.log('Request headers:', req.headers);
    console.log('Request body:', req.body);
    console.log('Request body type:', typeof req.body);
    console.log('Request body keys:', Object.keys(req.body || {}));
    
    const { message, sessionId = 'default' } = req.body;
    
    if (!message || typeof message !== 'string' || !message.trim()) {
      console.log('Invalid message received for streaming:', req.body);
      return res.status(400).json({ 
        error: 'Invalid message',
        message: 'Please provide a valid message string'
      });
    }

    console.log('Processing streaming message:', message);
    console.log('Session ID:', sessionId);
    
    // Set headers for streaming
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Stream the response
    for await (const chunk of streamAIResponse(message.trim(), sessionId)) {
      res.write(chunk);
    }
    
    res.end();
    
  } catch (error) {
    console.error('Streaming chat route error:', error);
    res.status(500).json({ 
      error: 'Failed to process streaming message',
      message: 'An error occurred while processing your request'
    });
  }
});

module.exports = router;

