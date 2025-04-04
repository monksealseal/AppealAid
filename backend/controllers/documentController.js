const asyncHandler = require('../utils/asyncHandler');
const Document = require('../models/documentModel');
const documentService = require('../services/documentService');
const path = require('path');
const fs = require('fs');

// @desc    Upload a new document
// @route   POST /api/documents
// @access  Private
const uploadDocument = asyncHandler(async (req, res) => {
  // Check if file exists in request
  if (!req.file && !req.body.filePath) {
    res.status(400);
    throw new Error('No file uploaded or file path provided');
  }

  let fileName, mimetype, size, filePath, fileBuffer;
  const documentType = req.body.documentType || 'eob';
  const documentName = req.body.name;

  // Handle file upload via multipart/form-data
  if (req.file) {
    const { originalname, mimetype: fileType, size: fileSize, path: uploadPath } = req.file;
    fileName = documentName || originalname;
    mimetype = fileType;
    size = fileSize;
    filePath = uploadPath;
  } 
  // Handle file upload via file path
  else if (req.body.filePath) {
    try {
      const providedPath = req.body.filePath;
      
      // Normalize the path (handles Windows/Unix differences)
      let normalizedPath = '';
      
      try {
        // Handle WSL path format (\\wsl.localhost\...)
        if (providedPath.includes('wsl.localhost')) {
          const wslPattern = /\\+wsl\.localhost\\+(\w+)\\+(.*)/;
          const match = providedPath.match(wslPattern);
          
          if (match && match.length >= 3) {
            const distroName = match[1];  // e.g., "Ubuntu"
            const remainingPath = match[2];
            
            // Convert to Linux format
            normalizedPath = `/${remainingPath.replace(/\\/g, '/')}`;
            console.log(`Converted WSL path to: ${normalizedPath}`);
          } else {
            // Fallback to basic normalization
            normalizedPath = path.normalize(providedPath.replace(/\\+/g, '/'));
          }
        } else {
          // Standard path normalization
          normalizedPath = path.normalize(providedPath.replace(/\\+/g, '/'));
        }
      } catch (error) {
        console.error(`Error normalizing path: ${error.message}`);
        // Basic fallback - just replace backslashes
        normalizedPath = providedPath.replace(/\\/g, '/');
      }
      
      // Extract filename from path
      const parsedPath = path.parse(normalizedPath);
      const extractedFileName = parsedPath.base || 'unknown-file';
      
      // Determine mimetype based on extension
      const extension = parsedPath.ext.toLowerCase();
      let fileType;
      if (['.pdf'].includes(extension)) {
        fileType = 'application/pdf';
      } else if (['.jpg', '.jpeg'].includes(extension)) {
        fileType = 'image/jpeg';
      } else if (['.png'].includes(extension)) {
        fileType = 'image/png';
      } else {
        res.status(400);
        throw new Error('Unsupported file type. Please upload a PDF or image file.');
      }
      
      // Check if file exists and is accessible
      // Try different path formats to handle WSL paths better
      const pathsToTry = [
        providedPath,                            // Original path
        normalizedPath,                          // Normalized path
        path.resolve(normalizedPath),            // Resolved normalized path
        path.resolve(providedPath),              // Resolved original path
        `/mnt/${normalizedPath.replace(/^\//, '')}` // Try with /mnt/ prefix (WSL path format)
      ];
      
      let fileExists = false;
      let accessiblePath = '';
      
      for (const pathToTry of pathsToTry) {
        try {
          if (fs.existsSync(pathToTry)) {
            fileExists = true;
            accessiblePath = pathToTry;
            console.log(`File found at: ${accessiblePath}`);
            break;
          }
        } catch (err) {
          console.log(`Path check error for ${pathToTry}: ${err.message}`);
          // Continue trying other paths
        }
      }
      
      if (!fileExists) {
        console.error(`File not found. Tried paths: ${JSON.stringify(pathsToTry)}`);
        res.status(400);
        throw new Error('File not found or not accessible at the provided path. Please check if the file exists and the path is correct.');
      }

      // Get file stats
      const stats = fs.statSync(accessiblePath);
      
      // Copy file to uploads directory
      const uploadsDir = path.join(__dirname, '../uploads');
      // Ensure uploads directory exists
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      const targetFilename = `${Date.now()}-${extractedFileName}`;
      const targetPath = path.join(uploadsDir, targetFilename);
      
      try {
        // Read and write the file
        fs.copyFileSync(accessiblePath, targetPath);
        console.log(`File copied to ${targetPath}`);
      } catch (copyError) {
        console.error(`Error copying file: ${copyError.message}`);
        // Try manual copy as a fallback
        try {
          const fileContent = fs.readFileSync(accessiblePath);
          fs.writeFileSync(targetPath, fileContent);
          console.log(`File copied using read/write fallback to ${targetPath}`);
        } catch (fallbackError) {
          console.error(`Error in fallback copy: ${fallbackError.message}`);
          res.status(500);
          throw new Error(`Failed to copy file: ${fallbackError.message}`);
        }
      }

      fileName = documentName || extractedFileName;
      mimetype = fileType;
      size = stats.size;
      filePath = targetPath;
    } catch (error) {
      res.status(400);
      throw new Error(`Error processing file path: ${error.message}`);
    }
  }
  
  // Create document in database
  const document = new Document({
    user: req.user.id,
    documentType,
    fileName,
    fileSize: size,
    fileType: mimetype,
    filePath,
    status: 'uploaded'
  });

  // Save document to database
  const savedDocument = await document.save();

  // Start document processing in the background
  // In a production environment, this would be handled by a message queue
  // or a separate worker process
  processDocumentAsync(savedDocument._id);

  res.status(201).json({
    _id: savedDocument._id,
    fileName: savedDocument.fileName,
    documentType: savedDocument.documentType,
    status: savedDocument.status,
    message: 'Document uploaded and processing started'
  });
});

// Helper function to process document asynchronously
const processDocumentAsync = async (documentId) => {
  try {
    // Find the document
    const document = await Document.findById(documentId);
    
    if (!document) {
      console.error(`Document ${documentId} not found`);
      return;
    }
    
    // Update status to processing
    document.status = 'processing';
    await document.save();
    
    // Process the document using documentService with enhanced denial detection
    const result = await documentService.processDocument(document.filePath, document.documentType);
    
    if (result.success) {
      // Update document with extracted data
      document.extractedText = result.extractedText;
      document.extractedData = result.extractedData;
      document.status = 'processed';
      
      // Store denial information if it was detected
      if (result.denialInfo && result.denialInfo.isDenial) {
        if (!document.extractedData) document.extractedData = {};
        
        document.extractedData.denialInfo = {
          isDenial: result.denialInfo.isDenial,
          denialType: result.denialInfo.denialType,
          denialReason: result.denialInfo.denialReason || document.extractedData.denialReason,
          denialCode: result.denialInfo.denialCode || document.extractedData.denialCode,
          appealDeadlineDays: result.denialInfo.appealDeadlineDays,
          appealDeadlineDate: result.denialInfo.appealDeadlineDate,
          confidence: result.denialInfo.confidence,
          suggestedNextSteps: result.denialInfo.suggestedNextSteps
        };
        
        // Store appeal potential analysis if available
        if (result.appealPotential) {
          document.extractedData.appealPotential = {
            successProbability: result.appealPotential.successProbability,
            priorityScore: result.appealPotential.priorityScore,
            appealRecommendation: result.appealPotential.appealRecommendation,
            factors: result.appealPotential.factors
          };
        }
        
        // Set deadline warning flag if deadline is soon
        if (result.denialInfo.appealDeadlineDays !== null) {
          const urgencyLevel = result.denialInfo.appealDeadlineDays <= 3 ? 'high' :
                              result.denialInfo.appealDeadlineDays <= 7 ? 'medium' :
                              result.denialInfo.appealDeadlineDays <= 14 ? 'low' : 'normal';
          
          document.extractedData.deadlineWarning = {
            daysRemaining: result.denialInfo.appealDeadlineDays,
            urgencyLevel,
            message: result.denialInfo.appealDeadlineDays <= 3 ? 
              `URGENT: Only ${result.denialInfo.appealDeadlineDays} days left to appeal` :
              result.denialInfo.appealDeadlineDays <= 7 ?
              `WARNING: Appeal deadline in ${result.denialInfo.appealDeadlineDays} days` :
              `Appeal deadline in ${result.denialInfo.appealDeadlineDays} days`
          };
        }
      }
    } else {
      // Update document with error
      document.status = 'failed';
      document.processingErrors = [result.error];
    }
    
    await document.save();
    console.log(`Document ${documentId} processed with status: ${document.status}`);
  } catch (error) {
    console.error(`Error processing document ${documentId}: ${error.message}`);
    
    // Update document with error
    const document = await Document.findById(documentId);
    if (document) {
      document.status = 'failed';
      document.processingErrors = [error.message];
      await document.save();
    }
  }
};

// @desc    Get all documents for the authenticated user
// @route   GET /api/documents
// @access  Private
const getDocuments = asyncHandler(async (req, res) => {
  const { type, sort, limit, denials_only } = req.query;
  
  // Build query for filtering
  const query = {
    user: req.user.id,
    isDeleted: false
  };
  
  // Filter by document type if specified
  if (type && ['eob', 'denialLetter', 'medicalRecord', 'other'].includes(type)) {
    query.documentType = type;
  }
  
  // Filter for denials only if specified
  if (denials_only === 'true') {
    query['extractedData.denialInfo.isDenial'] = true;
  }
  
  // Determine sort order
  let sortOption = '-createdAt'; // Default: newest first
  
  if (sort) {
    switch (sort) {
      case 'priority':
        // Sort by priority score if available, otherwise by creation date
        sortOption = {
          'isPriority': -1,
          'extractedData.appealPotential.priorityScore': -1,
          'createdAt': -1
        };
        break;
      case 'deadline':
        // Sort by approaching deadline
        sortOption = {
          'extractedData.denialInfo.appealDeadlineDays': 1,
          'createdAt': -1
        };
        break;
      case 'value':
        // Sort by denied amount (billedAmount - allowedAmount)
        sortOption = {
          'isPriority': -1,
          'extractedData.billedAmount': -1,
          'createdAt': -1
        };
        break;
      case 'success':
        // Sort by appeal success probability
        sortOption = {
          'extractedData.appealPotential.successProbability': -1,
          'createdAt': -1
        };
        break;
      case 'oldest':
        sortOption = 'createdAt';
        break;
      case 'newest':
      default:
        sortOption = '-createdAt';
    }
  }
  
  // Apply limit if specified
  const limitVal = limit ? parseInt(limit) : 0;
  
  // Get documents matching the query
  let documentsQuery = Document.find(query)
    .select('-extractedText') // Don't include the large text field
    .sort(sortOption);
  
  // Apply limit if specified
  if (limitVal > 0) {
    documentsQuery = documentsQuery.limit(limitVal);
  }
  
  // Execute query
  const documents = await documentsQuery;
  
  res.json(documents);
});

// @desc    Get a specific document by ID
// @route   GET /api/documents/:id
// @access  Private
const getDocumentById = asyncHandler(async (req, res) => {
  const documentId = req.params.id;

  // Find document by ID
  const document = await Document.findById(documentId);

  if (!document) {
    res.status(404);
    throw new Error('Document not found');
  }

  // Check if the document belongs to the current user
  if (document.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized to access this document');
  }

  // If document is deleted, don't return it
  if (document.isDeleted) {
    res.status(404);
    throw new Error('Document not found');
  }

  // Generate a download URL for the file
  const fileUrl = `/api/documents/${document._id}/download`;
  const documentWithUrl = document.toObject();
  documentWithUrl.fileUrl = fileUrl;

  res.json(documentWithUrl);
});

// @desc    Process a document that was previously uploaded
// @route   POST /api/documents/:id/process
// @access  Private
const processDocument = asyncHandler(async (req, res) => {
  const documentId = req.params.id;

  // Find document by ID
  const document = await Document.findById(documentId);

  if (!document) {
    res.status(404);
    throw new Error('Document not found');
  }

  // Check if the document belongs to the current user
  if (document.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized to process this document');
  }

  // If document is deleted, don't process it
  if (document.isDeleted) {
    res.status(404);
    throw new Error('Document not found');
  }

  // Update status to processing
  document.status = 'processing';
  document.processingErrors = [];
  await document.save();

  // Start processing asynchronously
  processDocumentAsync(documentId);

  res.json({
    _id: document._id,
    status: document.status,
    message: 'Document processing started'
  });
});

// @desc    Delete a document
// @route   DELETE /api/documents/:id
// @access  Private
const deleteDocument = asyncHandler(async (req, res) => {
  const documentId = req.params.id;

  // Find document by ID
  const document = await Document.findById(documentId);

  if (!document) {
    res.status(404);
    throw new Error('Document not found');
  }

  // Check if the document belongs to the current user
  if (document.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized to delete this document');
  }

  // Soft delete - mark as deleted
  document.isDeleted = true;
  await document.save();

  res.json({
    _id: document._id,
    message: 'Document deleted successfully'
  });
});

// @desc    Download a document file
// @route   GET /api/documents/:id/download
// @access  Private
const downloadDocument = asyncHandler(async (req, res) => {
  const documentId = req.params.id;

  // Find document by ID
  const document = await Document.findById(documentId);

  if (!document) {
    res.status(404);
    throw new Error('Document not found');
  }

  // Check if the document belongs to the current user
  if (document.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized to download this document');
  }

  // If document is deleted, don't allow download
  if (document.isDeleted) {
    res.status(404);
    throw new Error('Document not found');
  }

  // Check if file exists
  const fs = require('fs');
  const path = require('path');
  const filePath = path.resolve(document.filePath);

  if (!fs.existsSync(filePath)) {
    res.status(404);
    throw new Error('File not found on server');
  }

  // Set appropriate headers
  res.setHeader('Content-Type', document.fileType);
  res.setHeader('Content-Disposition', `attachment; filename="${document.fileName}"`);

  // Send the file
  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);
});

// @desc    Get prioritized denials for dashboard/worklist
// @route   GET /api/documents/denials
// @access  Private
const getDenialsPrioritized = asyncHandler(async (req, res) => {
  // Apply advanced query parameters
  const { sort = 'priority', days_remaining, min_amount, min_success } = req.query;
  
  // Base query: only get denials for current user that aren't deleted
  const query = {
    user: req.user.id,
    isDeleted: false,
    'extractedData.denialInfo.isDenial': true
  };
  
  // Filter by days remaining until deadline if specified
  if (days_remaining) {
    // Convert to number and add 1 to include the specified day
    const daysVal = parseInt(days_remaining) + 1;
    query['extractedData.denialInfo.appealDeadlineDays'] = { $lt: daysVal, $gte: 0 };
  }
  
  // Filter by minimum denied amount
  if (min_amount) {
    const amountVal = parseFloat(min_amount);
    // We need documents where billedAmount - allowedAmount >= minAmount
    query.$expr = {
      $gte: [
        { $subtract: ['$extractedData.billedAmount', '$extractedData.allowedAmount'] },
        amountVal
      ]
    };
  }
  
  // Filter by minimum success probability
  if (min_success) {
    const successVal = parseFloat(min_success);
    query['extractedData.appealPotential.successProbability'] = { $gte: successVal };
  }
  
  // Determine sort order
  let sortOption;
  switch (sort) {
    case 'priority':
      sortOption = {
        'isPriority': -1,
        'extractedData.appealPotential.priorityScore': -1,
        'extractedData.denialInfo.appealDeadlineDays': 1
      };
      break;
    case 'deadline':
      sortOption = {
        'extractedData.denialInfo.appealDeadlineDays': 1,
        'extractedData.appealPotential.priorityScore': -1
      };
      break;
    case 'value':
      // Sort by denied amount (calculated field)
      sortOption = {
        $expr: {
          $subtract: ['$extractedData.billedAmount', '$extractedData.allowedAmount']
        }
      };
      break;
    case 'success':
      sortOption = {
        'extractedData.appealPotential.successProbability': -1,
        'extractedData.denialInfo.appealDeadlineDays': 1
      };
      break;
    default:
      sortOption = {
        'isPriority': -1,
        'extractedData.denialInfo.appealDeadlineDays': 1,
        'createdAt': -1
      };
  }
  
  // Get prioritized denials
  const denials = await Document.find(query)
    .select('-extractedText')
    .sort(sortOption)
    .limit(50);  // Limit to reasonable number for dashboard
  
  // Count total denials matching the criteria
  const totalCount = await Document.countDocuments(query);
  
  // Calculate total denied amount
  const pipeline = [
    { $match: query },
    { 
      $group: {
        _id: null,
        totalDenied: {
          $sum: { 
            $subtract: ['$extractedData.billedAmount', '$extractedData.allowedAmount'] 
          }
        },
        count: { $sum: 1 },
        urgentCount: {
          $sum: {
            $cond: [
              { $lte: ['$extractedData.denialInfo.appealDeadlineDays', 7] },
              1,
              0
            ]
          }
        }
      }
    }
  ];
  
  const aggregateResult = await Document.aggregate(pipeline);
  
  // Prepare response with summary statistics
  const summary = {
    totalDenials: totalCount,
    totalDeniedAmount: aggregateResult.length > 0 ? aggregateResult[0].totalDenied : 0,
    urgentDeadlines: aggregateResult.length > 0 ? aggregateResult[0].urgentCount : 0
  };
  
  res.json({
    denials,
    summary
  });
});

// @desc    Update priority flag or batch status for documents
// @route   PATCH /api/documents/batch
// @access  Private
const updateBatchDocuments = asyncHandler(async (req, res) => {
  const { documentIds, update } = req.body;
  
  if (!documentIds || !Array.isArray(documentIds) || documentIds.length === 0) {
    res.status(400);
    throw new Error('Document IDs are required');
  }
  
  if (!update || typeof update !== 'object') {
    res.status(400);
    throw new Error('Update data is required');
  }
  
  // Validate document ownership and build IDs array
  const validDocuments = await Document.find({
    _id: { $in: documentIds },
    user: req.user.id
  }).select('_id');
  
  const validIds = validDocuments.map(doc => doc._id);
  
  if (validIds.length === 0) {
    res.status(404);
    throw new Error('No valid documents found');
  }
  
  // Prepare update object with allowed fields only
  const updateData = {};
  
  // Allow updating priority flag
  if (update.hasOwnProperty('isPriority')) {
    updateData.isPriority = Boolean(update.isPriority);
  }
  
  // Update documents
  const result = await Document.updateMany(
    { _id: { $in: validIds } },
    { $set: updateData }
  );
  
  res.json({
    message: `${result.matchedCount} documents found, ${result.modifiedCount} documents updated`,
    matchedCount: result.matchedCount,
    modifiedCount: result.modifiedCount
  });
});

module.exports = {
  uploadDocument,
  getDocuments,
  getDocumentById,
  processDocument,
  deleteDocument,
  downloadDocument,
  getDenialsPrioritized,
  updateBatchDocuments
};