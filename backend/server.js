/**
 * AppealAid API Server
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const helmet = require('helmet');
const logger = require('./utils/logger');
const { defaultLimiter } = require('./middleware/rateLimit');
const responseRoutes = require('./routes/responseRoutes');
const providerCollaborationRoutes = require('./routes/providerCollaborationRoutes');

// Load environment variables
require('dotenv').config();

// Create Express app
const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(helmet()); // Security headers
app.use(defaultLimiter); // Rate limiting
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', { stream: logger.stream }));
}

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB
const connectDB = async () => {
  try {
    // Skip DB connection if in mock mode (for testing)
    if (process.env.USE_MOCK_DB === 'true') {
      logger.info('Using mock database');
      return;
    }
    
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/appealaid', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

// Connect to database (unless running in test mode with --no-db flag)
if (process.env.NODE_ENV !== 'test' || process.env.USE_MOCK_DB !== 'true') {
  connectDB();
}

// Default route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'AppealAid API is running'
  });
});

// Health check endpoint for monitoring services
app.get('/health', (req, res) => {
  const healthcheck = {
    uptime: process.uptime(),
    status: 'OK',
    timestamp: Date.now(),
    environment: process.env.NODE_ENV || 'development'
  };
  
  try {
    res.status(200).json(healthcheck);
  } catch (error) {
    healthcheck.status = 'ERROR';
    healthcheck.message = error.message;
    res.status(503).json(healthcheck);
  }
});

// Routes
app.use('/api/responses', responseRoutes);
app.use('/api/provider-collaboration', providerCollaborationRoutes);

// Add other routes here
const appealRoutes = require('./routes/appealRoutes');
const peerReviewRoutes = require('./routes/peerReviewRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/api/appeals', appealRoutes);
app.use('/api/peer-reviews', peerReviewRoutes);
app.use('/api/users', userRoutes);
// app.use('/api/documents', documentRoutes);
// app.use('/api/patients', patientRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  res.status(statusCode).json({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.stack
  });
});

// Handle 404 errors
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Load monitoring module
try {
  const monitor = require('./utils/monitor');
  if (process.env.NODE_ENV === 'production') {
    // Start monitoring in production
    monitor.startMonitoring();
  }
} catch (error) {
  logger.warn('Monitoring module not available:', error.message);
}

// Start the server
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    logger.info(`API available at http://localhost:${PORT}`);
    if (process.env.NODE_ENV === 'production') {
      logger.info('Running in production mode with enhanced security');
    }
  });
}

// For testing
module.exports = app;