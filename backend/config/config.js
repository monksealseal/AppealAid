/**
 * Application configuration
 */

const config = {
  // Server configuration
  server: {
    port: process.env.PORT || 5000,
    environment: process.env.NODE_ENV || 'development',
    apiPrefix: '/api'
  },

  // Database configuration - would connect to real DB in production
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/appealaid',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  },

  // Authentication configuration
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'developmentsecret',
    jwtExpiration: '30d'
  },

  // File storage configuration
  storage: {
    uploadDir: process.env.UPLOAD_DIR || 'uploads/',
    maxFileSize: 10 * 1024 * 1024 // 10MB
  },

  // OCR configuration
  ocr: {
    lang: 'eng',
    oem: 1,
    psm: 3
  },

  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    filename: process.env.LOG_FILE || 'app.log'
  }
};

module.exports = config;