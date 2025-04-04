const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const batchController = require('../controllers/batchController');

// Batch upload and management
router.post('/upload', protect, batchController.uploadBatch);
router.get('/facility/:facilityId', protect, batchController.getFacilityBatches);
router.get('/facility/:facilityId/stats', protect, batchController.getFacilityAppealStats);
router.get('/:batchId', protect, batchController.getBatchDetails);
router.get('/:batchId/documents', protect, batchController.getBatchDocuments);
router.post('/:batchId/generate-appeals', protect, batchController.generateBatchAppeals);

module.exports = router;