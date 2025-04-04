const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  uploadDocument,
  getDocuments,
  getDocumentById,
  processDocument,
  deleteDocument,
  downloadDocument,
  getDenialsPrioritized,
  updateBatchDocuments
} = require('../controllers/documentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExt = path.extname(file.originalname) || '.pdf';
    cb(null, `doc-${uniqueSuffix}${fileExt}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only PDF, images, and common document formats
  if (
    file.mimetype === 'application/pdf' ||
    file.mimetype.startsWith('image/') ||
    file.mimetype === 'application/msword' ||
    file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file format. Only PDF, images, and Office documents are allowed.'), false);
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB max file size
  }
});

// Middleware for handling file uploads with path option
const handleFileUpload = (req, res, next) => {
  // Check if a file path is provided
  if (req.body && req.body.filePath) {
    // Skip multer and go directly to the controller
    next();
  } else {
    // Use multer for regular file uploads
    upload.single('document')(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ 
          message: `File upload error: ${err.message}` 
        });
      } else if (err) {
        return res.status(400).json({ 
          message: err.message || 'An error occurred during file upload' 
        });
      }
      next();
    });
  }
};

// All routes are protected
router.route('/')
  .post(protect, handleFileUpload, uploadDocument)
  .get(protect, getDocuments);

router.route('/:id')
  .get(protect, getDocumentById)
  .delete(protect, deleteDocument);

router.route('/:id/process')
  .post(protect, processDocument);

router.route('/:id/download')
  .get(protect, downloadDocument);

// Routes for denial management and batch operations
router.route('/denials')
  .get(protect, getDenialsPrioritized);

router.route('/batch')
  .patch(protect, updateBatchDocuments);

module.exports = router;