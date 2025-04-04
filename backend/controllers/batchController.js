const asyncHandler = require('../utils/asyncHandler');
const Batch = require('../models/batchModel');
const Facility = require('../models/facilityModel');
const batchService = require('../services/batchService');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const logger = require('../utils/logger');

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    // Allow only CSV, Excel, or Zip files
    const allowedExtensions = ['.csv', '.xlsx', '.xls', '.zip'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV, Excel, or Zip files are allowed'));
    }
  }
}).single('file');

// @desc    Upload and create a batch job
// @route   POST /api/batches/upload
// @access  Private (Facility Admin, Billing Staff)
const uploadBatch = asyncHandler(async (req, res) => {
  // Use multer to handle the file upload
  upload(req, res, async (err) => {
    if (err) {
      res.status(400);
      throw new Error(err.message);
    }
    
    if (!req.file) {
      res.status(400);
      throw new Error('Please upload a file');
    }
    
    // Get form data
    const { name, facilityId, batchType, generateAppeals, prioritizationMethod, notes } = req.body;
    
    // Validate required fields
    if (!name || !facilityId) {
      // Clean up the uploaded file
      fs.unlinkSync(req.file.path);
      res.status(400);
      throw new Error('Batch name and facility ID are required');
    }
    
    // Verify facility exists and user has access to it
    const facility = await Facility.findById(facilityId);
    if (!facility) {
      fs.unlinkSync(req.file.path);
      res.status(404);
      throw new Error('Facility not found');
    }
    
    const isUserAuthorized = facility.administrators.includes(req.user.id) || 
                             facility.staff.some(s => s.user.toString() === req.user.id.toString());
                             
    if (!isUserAuthorized) {
      fs.unlinkSync(req.file.path);
      res.status(401);
      throw new Error('Not authorized to upload for this facility');
    }
    
    try {
      // Create the batch record
      const batchData = {
        name,
        facilityId,
        userId: req.user.id,
        batchType: batchType || 'denial',
        generateAppeals: generateAppeals === 'true',
        prioritizationMethod: prioritizationMethod || 'amount',
        notes
      };
      
      const batch = await batchService.createBatch(batchData);
      
      // Process the uploaded file
      const filePath = req.file.path;
      
      // Start processing (this will happen asynchronously)
      batchService.processClaimFile(filePath, batch.batchId)
        .then(results => {
          logger.info(`Batch ${batch.batchId} processing completed: ${results.processedRows}/${results.totalRows} rows processed`);
        })
        .catch(error => {
          logger.error(`Batch ${batch.batchId} processing failed: ${error.message}`);
        });
      
      // Return immediate response
      res.status(201).json({
        batchId: batch.batchId,
        name: batch.name,
        status: 'processing',
        message: 'Batch upload initiated successfully'
      });
    } catch (error) {
      // Clean up the uploaded file
      fs.unlinkSync(req.file.path);
      throw error;
    }
  });
});

// @desc    Get all batches for a facility
// @route   GET /api/batches/facility/:facilityId
// @access  Private (Facility Staff)
const getFacilityBatches = asyncHandler(async (req, res) => {
  const { facilityId } = req.params;
  const { status, page = 1, limit = 10 } = req.query;
  
  // Verify facility exists and user has access to it
  const facility = await Facility.findById(facilityId);
  if (!facility) {
    res.status(404);
    throw new Error('Facility not found');
  }
  
  const isUserAuthorized = facility.administrators.includes(req.user.id) || 
                           facility.staff.some(s => s.user.toString() === req.user.id.toString());
                           
  if (!isUserAuthorized) {
    res.status(401);
    throw new Error('Not authorized to view batches for this facility');
  }
  
  // Build query
  const query = { facility: facilityId };
  
  if (status) {
    query.status = status;
  }
  
  // Paginate results
  const skip = (page - 1) * limit;
  
  // Get batches
  const batches = await Batch.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate('uploadedBy', 'name email')
    .select('batchId name status processingStats startTime completionTime createdAt');
  
  // Get total count for pagination
  const totalCount = await Batch.countDocuments(query);
  
  res.json({
    batches,
    pagination: {
      total: totalCount,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(totalCount / parseInt(limit))
    }
  });
});

// @desc    Get batch details
// @route   GET /api/batches/:batchId
// @access  Private (Facility Staff)
const getBatchDetails = asyncHandler(async (req, res) => {
  const { batchId } = req.params;
  
  // Get batch summary
  const batchSummary = await batchService.getBatchSummary(batchId);
  
  // Check user authorization
  const facility = await Facility.findById(batchSummary.facility);
  if (!facility) {
    res.status(404);
    throw new Error('Facility not found');
  }
  
  const isUserAuthorized = facility.administrators.includes(req.user.id) || 
                           facility.staff.some(s => s.user.toString() === req.user.id.toString());
                           
  if (!isUserAuthorized) {
    res.status(401);
    throw new Error('Not authorized to view this batch');
  }
  
  res.json(batchSummary);
});

// @desc    Get documents in a batch
// @route   GET /api/batches/:batchId/documents
// @access  Private (Facility Staff)
const getBatchDocuments = asyncHandler(async (req, res) => {
  const { batchId } = req.params;
  const { 
    status, 
    minAmount, 
    appealType, 
    sortBy = 'priority', 
    sortDirection = 'desc',
    page = 1,
    limit = 50
  } = req.query;
  
  // Verify batch exists and user has access to it
  const batch = await Batch.findOne({ batchId }).populate('facility');
  if (!batch) {
    res.status(404);
    throw new Error('Batch not found');
  }
  
  const facility = batch.facility;
  
  const isUserAuthorized = facility.administrators.includes(req.user.id) || 
                           facility.staff.some(s => s.user.toString() === req.user.id.toString());
                           
  if (!isUserAuthorized) {
    res.status(401);
    throw new Error('Not authorized to view documents for this batch');
  }
  
  // Get documents with filtering and sorting
  const options = {
    status,
    minAmount: minAmount ? parseFloat(minAmount) : 0,
    appealType,
    sortBy,
    sortDirection,
    page: parseInt(page),
    limit: parseInt(limit)
  };
  
  const result = await batchService.getBatchDocuments(batchId, options);
  
  res.json(result);
});

// @desc    Generate appeals for a batch
// @route   POST /api/batches/:batchId/generate-appeals
// @access  Private (Facility Admin, Billing Staff)
const generateBatchAppeals = asyncHandler(async (req, res) => {
  const { batchId } = req.params;
  
  // Verify batch exists and user has access to it
  const batch = await Batch.findOne({ batchId }).populate('facility');
  if (!batch) {
    res.status(404);
    throw new Error('Batch not found');
  }
  
  const facility = batch.facility;
  
  const isUserAuthorized = facility.administrators.includes(req.user.id) || 
                           facility.staff.some(s => s.user.toString() === req.user.id.toString() && s.permissions.canGenerateAppeals);
                           
  if (!isUserAuthorized) {
    res.status(401);
    throw new Error('Not authorized to generate appeals for this batch');
  }
  
  // Check batch status
  if (batch.status !== 'processed') {
    res.status(400);
    throw new Error('Batch must be in processed state to generate appeals');
  }
  
  // Update batch settings if provided
  const { amountThreshold, confidenceThreshold, strategy } = req.body;
  
  if (amountThreshold) {
    batch.appealGeneration.threshold.amountThreshold = parseFloat(amountThreshold);
  }
  
  if (confidenceThreshold) {
    batch.appealGeneration.threshold.confidenceThreshold = parseFloat(confidenceThreshold);
  }
  
  if (strategy) {
    batch.appealGeneration.strategy = strategy;
  }
  
  await batch.save();
  
  // Start appeal generation process (this will happen asynchronously)
  batchService.generateBatchAppeals(batchId)
    .then(results => {
      logger.info(`Batch ${batchId} appeal generation completed: ${results.generatedAppeals}/${results.totalAppeals} appeals generated`);
    })
    .catch(error => {
      logger.error(`Batch ${batchId} appeal generation failed: ${error.message}`);
    });
  
  // Return immediate response
  res.json({
    batchId: batch.batchId,
    name: batch.name,
    status: 'generating',
    message: 'Appeal generation initiated successfully'
  });
});

// @desc    Get appeal statistics for a facility
// @route   GET /api/batches/facility/:facilityId/stats
// @access  Private (Facility Staff)
const getFacilityAppealStats = asyncHandler(async (req, res) => {
  const { facilityId } = req.params;
  const { startDate, endDate } = req.query;
  
  // Verify facility exists and user has access to it
  const facility = await Facility.findById(facilityId);
  if (!facility) {
    res.status(404);
    throw new Error('Facility not found');
  }
  
  const isUserAuthorized = facility.administrators.includes(req.user.id) || 
                           facility.staff.some(s => s.user.toString() === req.user.id.toString());
                           
  if (!isUserAuthorized) {
    res.status(401);
    throw new Error('Not authorized to view statistics for this facility');
  }
  
  // Parse date range
  const dateFilter = {};
  if (startDate) {
    dateFilter.createdAt = { $gte: new Date(startDate) };
  }
  if (endDate) {
    if (dateFilter.createdAt) {
      dateFilter.createdAt.$lte = new Date(endDate);
    } else {
      dateFilter.createdAt = { $lte: new Date(endDate) };
    }
  }
  
  // Get batches for the facility in date range
  const batchQuery = { facility: facilityId, ...dateFilter };
  const batches = await Batch.find(batchQuery);
  
  // Calculate overall stats
  const totalBatches = batches.length;
  const totalDocuments = batches.reduce((sum, batch) => sum + batch.processingStats.totalDocuments, 0);
  const totalAppeals = batches.reduce((sum, batch) => sum + batch.processingStats.generatedAppeals, 0);
  const totalDenialAmount = batches.reduce((sum, batch) => sum + batch.processingStats.totalDenialAmount, 0);
  
  // Get appeal types breakdown
  const appealTypeStats = {};
  batches.forEach(batch => {
    batch.processingStats.appealsByType.forEach((count, type) => {
      appealTypeStats[type] = (appealTypeStats[type] || 0) + count;
    });
  });
  
  // Get status stats from facility
  const { stats } = facility;
  
  res.json({
    facilityId,
    facilityName: facility.name,
    batchStats: {
      totalBatches,
      totalDocuments,
      totalAppeals,
      totalDenialAmount,
      appealTypeBreakdown: appealTypeStats
    },
    overallStats: {
      successRate: stats.totalAppeals > 0 ? stats.successfulAppeals / stats.totalAppeals : 0,
      totalRecovered: stats.totalRecovered,
      pendingAppeals: stats.pendingAppeals,
      appealsByInsurer: Object.fromEntries(stats.appealsByInsurer),
      appealSuccessRateByType: Object.fromEntries(stats.successRateByType)
    },
    dateRange: {
      startDate: startDate || 'all time',
      endDate: endDate || 'present'
    }
  });
});

module.exports = {
  uploadBatch,
  getFacilityBatches,
  getBatchDetails,
  getBatchDocuments,
  generateBatchAppeals,
  getFacilityAppealStats
};