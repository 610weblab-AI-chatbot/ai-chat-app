const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Configure CORS to allow frontend connections
app.use(cors({
  origin: [
    'http://localhost:8080', // Frontend development server
    'http://localhost:3000', // Alternative React dev server
    'http://localhost:5173', // Vite default
    'http://127.0.0.1:8080',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint for frontend connection testing
app.get('/api/health', (req, res) => {
  console.log('Health check requested');
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'ai-middleware',
    version: '1.0.0'
  });
});

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log('Content-Type:', req.headers['content-type']);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Request body:', JSON.stringify(req.body, null, 2));
  } else {
    console.log('Request body is empty or undefined');
  }
  next();
});

const chatRoutes = require('./routes/chat');
app.use('/api/chat', chatRoutes);

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    error: 'Route not found',
    availableRoutes: [
      'GET /api/health',
      'POST /api/chat',
      'POST /api/chat/stream'
    ]
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`AI middleware running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Chat endpoint: http://localhost:${PORT}/api/chat`);
  console.log(`Streaming endpoint: http://localhost:${PORT}/api/chat/stream`);
  console.log(`CORS enabled for frontend development servers`);
});

