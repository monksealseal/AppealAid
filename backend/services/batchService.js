/**
 * Batch Processing Service
 * Responsible for handling batch upload, processing, and appeal generation
 * for large volumes of claims, especially for hospital/facility use
 */

// Dependencies
const Batch = require('../models/batchModel');
const Document = require('../models/documentModel');
const Appeal = require('../models/appealModel');
const Facility = require('../models/facilityModel');
const appealService = require('./appealService');
const aiService = require('./aiService');
const logger = require('../utils/logger');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');
const { v4: uuidv4 } = require('uuid');

/**
 * Create a new batch processing job
 * @param {Object} batchData - Data for the batch job
 * @returns {Object} Created batch job
 */
const createBatch = async (batchData) => {
  try {
    // Generate a unique batch ID
    const batchId = `BATCH-${Date.now()}-${uuidv4().substring(0, 8)}`;
    
    // Create the batch record
    const batch = new Batch({
      batchId,
      name: batchData.name || `Batch ${new Date().toLocaleDateString()}`,
      facility: batchData.facilityId,
      uploadedBy: batchData.userId,
      batchType: batchData.batchType || 'denial',
      status: 'uploaded',
      prioritization: {
        method: batchData.prioritizationMethod || 'amount'
      },
      appealGeneration: {
        strategy: batchData.appealStrategy || 'manual',
        threshold: {
          amountThreshold: batchData.amountThreshold || 500,
          confidenceThreshold: batchData.confidenceThreshold || 0.7
        }
      },
      processingOptions: {
        generateAppeals: batchData.generateAppeals || false,
        useAI: batchData.useAI !== undefined ? batchData.useAI : true,
        autoCategorizeDenials: batchData.autoCategorizeDenials !== undefined ? batchData.autoCategorizeDenials : true
      },
      notes: batchData.notes || '',
      startTime: new Date()
    });
    
    // Save the batch
    const savedBatch = await batch.save();
    logger.info(`Created new batch: ${batchId}`);
    
    return savedBatch;
  } catch (error) {
    logger.error(`Error creating batch: ${error.message}`);
    throw error;
  }
};

/**
 * Process an uploaded claim file (CSV or spreadsheet)
 * @param {String} filePath - Path to the uploaded file
 * @param {String} batchId - ID of the batch to associate with
 * @returns {Object} Processing results
 */
const processClaimFile = async (filePath, batchId) => {
  try {
    // Find the batch
    const batch = await Batch.findOne({ batchId });
    if (!batch) {
      throw new Error(`Batch ${batchId} not found`);
    }
    
    // Update batch status
    batch.status = 'processing';
    await batch.save();
    
    // Results tracking
    const results = {
      totalRows: 0,
      processedRows: 0,
      failedRows: 0,
      documents: []
    };
    
    // Process the CSV file
    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', async (row) => {
          try {
            results.totalRows++;
            
            // Extract claim data from the CSV row
            const documentData = {
              user: batch.uploadedBy,
              facilityId: batch.facility,
              batchId: batch.batchId,
              documentType: determineDocumentType(row),
              fileName: `Claim-${row.claimNumber || row.ClaimNumber || 'Unknown'}.pdf`, // Placeholder
              fileSize: 0, // Placeholder
              fileType: 'application/pdf', // Placeholder
              filePath: '/uploads/placeholder.pdf', // Placeholder
              extractedData: {
                documentDate: parseDate(row.serviceDate || row.ServiceDate || row.date_of_service),
                providerName: row.providerName || row.ProviderName || row.provider,
                patientName: row.patientName || row.PatientName || row.patient,
                insuranceCarrier: row.insuranceCarrier || row.InsuranceCarrier || row.payer,
                claimNumber: row.claimNumber || row.ClaimNumber,
                memberId: row.memberId || row.MemberId || row.member_id,
                groupNumber: row.groupNumber || row.GroupNumber || row.group_id,
                serviceDate: parseDate(row.serviceDate || row.ServiceDate || row.date_of_service),
                billedAmount: parseFloat(row.billedAmount || row.BilledAmount || row.billed || 0),
                allowedAmount: parseFloat(row.allowedAmount || row.AllowedAmount || row.allowed || 0),
                patientResponsibility: parseFloat(row.patientResponsibility || row.PatientResponsibility || row.patient_resp || 0),
                denialReason: row.denialReason || row.DenialReason || row.reason,
                denialCode: row.denialCode || row.DenialCode || row.code,
                appealDeadline: parseDate(row.appealDeadline || row.AppealDeadline || row.deadline),
                serviceDescription: row.serviceDescription || row.ServiceDescription || row.description,
                diagnosisCodes: parseArray(row.diagnosisCodes || row.DiagnosisCodes || row.diagnosis),
                procedureCodes: parseArray(row.procedureCodes || row.ProcedureCodes || row.procedure),
                providerInfo: {
                  name: row.providerName || row.ProviderName || row.provider,
                  address: row.providerAddress || row.ProviderAddress || '',
                  phone: row.providerPhone || row.ProviderPhone || '',
                  npi: row.providerNPI || row.ProviderNPI || row.npi || '',
                  tin: row.providerTIN || row.ProviderTIN || row.tin || ''
                }
              },
              status: 'processed'
            };
            
            // Calculate denial amount
            const deniedAmount = documentData.extractedData.billedAmount - documentData.extractedData.allowedAmount;
            
            // Create document record
            const document = new Document(documentData);
            const savedDocument = await document.save();
            
            // Add document to batch
            batch.documents.push({
              document: savedDocument._id,
              status: 'processed',
              denialAmount: deniedAmount,
              appealDeadline: documentData.extractedData.appealDeadline,
              priority: calculatePriority(deniedAmount, documentData.extractedData.appealDeadline)
            });
            
            // Update batch statistics
            batch.processingStats.totalDocuments++;
            batch.processingStats.processedDocuments++;
            batch.processingStats.totalDenialAmount += deniedAmount;
            
            results.processedRows++;
            results.documents.push(savedDocument._id);
            
          } catch (error) {
            results.failedRows++;
            logger.error(`Error processing row: ${error.message}`);
          }
        })
        .on('end', async () => {
          try {
            // Update batch status
            batch.status = 'processed';
            await batch.save();
            
            // If auto-generation is enabled, start generating appeals
            if (batch.processingOptions.generateAppeals) {
              generateBatchAppeals(batch.batchId);
            }
            
            resolve(results);
          } catch (error) {
            reject(error);
          }
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  } catch (error) {
    logger.error(`Error processing claim file: ${error.message}`);
    throw error;
  }
};

/**
 * Generate appeals for all documents in a batch based on batch settings
 * @param {String} batchId - ID of the batch to process
 * @returns {Object} Generation results
 */
const generateBatchAppeals = async (batchId) => {
  try {
    // Find the batch and populate documents
    const batch = await Batch.findOne({ batchId }).populate('documents.document');
    if (!batch) {
      throw new Error(`Batch ${batchId} not found`);
    }
    
    // Update batch status
    batch.status = 'generating';
    await batch.save();
    
    const results = {
      totalAppeals: 0,
      generatedAppeals: 0,
      failedAppeals: 0,
      skippedAppeals: 0,
      appealIds: []
    };
    
    // Get batch settings
    const { appealGeneration, processingOptions } = batch;
    const { amountThreshold, confidenceThreshold } = appealGeneration.threshold;
    
    // Get facility template overrides if available
    const facility = await Facility.findById(batch.facility);
    const templateOverrides = facility?.defaultSettings?.appealTemplates || {};
    
    // Process each document in the batch
    for (const docItem of batch.documents) {
      try {
        const document = docItem.document;
        
        // Skip already appealed documents
        if (docItem.status === 'appealed' || docItem.status === 'submitted' || docItem.status === 'skipped') {
          continue;
        }
        
        results.totalAppeals++;
        
        // Determine if this document should be appealed based on batch settings
        let shouldAppeal = true;
        
        if (appealGeneration.strategy === 'highValue' && docItem.denialAmount < amountThreshold) {
          shouldAppeal = false;
        }
        
        if (shouldAppeal) {
          // Generate appeal
          const appealStrategy = appealService.identifyAppealStrategy(
            document.extractedData.denialReason,
            document.extractedData.denialCode
          );
          
          // Get template - check for overrides first
          const templateId = templateOverrides[appealStrategy.appealType] || appealStrategy.templateId;
          
          // Generate appeal content
          const appealResult = await appealService.generateLetterContent(document, templateId);
          
          // Create appeal
          const appeal = new Appeal({
            user: batch.uploadedBy,
            relatedDocument: document._id,
            title: `Appeal for ${document.extractedData.claimNumber || document.fileName}`,
            description: document.extractedData.denialReason ? `Denial reason: ${document.extractedData.denialReason}` : '',
            appealType: appealStrategy.appealType,
            denialInfo: {
              denialReason: document.extractedData.denialReason || 'Not specified',
              denialCode: document.extractedData.denialCode,
              serviceDate: document.extractedData.serviceDate,
              claimNumber: document.extractedData.claimNumber,
              deniedAmount: docItem.denialAmount
            },
            appealTemplate: templateId,
            appealContent: appealResult.appealContent,
            status: 'generated',
            aiConfidence: appealResult.aiConfidence,
            aiSuggestions: appealResult.suggestedEvidence,
            timeline: [
              {
                date: new Date(),
                status: 'generated',
                description: 'Appeal letter generated via batch processing'
              }
            ]
          });
          
          // Save the appeal
          const savedAppeal = await appeal.save();
          
          // Update document with appeal info
          document.appealStatus = {
            hasAppeal: true,
            appealId: savedAppeal._id,
            appealCreatedAt: new Date()
          };
          await document.save();
          
          // Update the batch document entry
          docItem.appeal = savedAppeal._id;
          docItem.status = 'appealed';
          docItem.successProbability = appealResult.aiConfidence;
          
          // Track appeal type for statistics
          const appealType = appealStrategy.appealType;
          batch.processingStats.appealsByType.set(
            appealType, 
            (batch.processingStats.appealsByType.get(appealType) || 0) + 1
          );
          
          results.generatedAppeals++;
          results.appealIds.push(savedAppeal._id);
        } else {
          // Mark as skipped
          docItem.status = 'skipped';
          results.skippedAppeals++;
        }
      } catch (error) {
        docItem.status = 'error';
        results.failedAppeals++;
        logger.error(`Error generating appeal for document: ${error.message}`);
      }
    }
    
    // Update batch statistics
    batch.processingStats.generatedAppeals = results.generatedAppeals;
    batch.processingStats.averageConfidenceScore = results.generatedAppeals > 0 ? 
      batch.documents
        .filter(d => d.successProbability)
        .reduce((sum, d) => sum + d.successProbability, 0) / results.generatedAppeals : 0;
    
    // Update batch status and completion time
    batch.status = 'complete';
    batch.completionTime = new Date();
    await batch.save();
    
    return results;
  } catch (error) {
    logger.error(`Error generating batch appeals: ${error.message}`);
    
    // Update batch status to failed
    const batch = await Batch.findOne({ batchId });
    if (batch) {
      batch.status = 'failed';
      await batch.save();
    }
    
    throw error;
  }
};

/**
 * Get batch stats and summary
 * @param {String} batchId - ID of the batch
 * @returns {Object} Batch statistics and summary
 */
const getBatchSummary = async (batchId) => {
  try {
    const batch = await Batch.findOne({ batchId })
      .populate('facility', 'name type')
      .populate('uploadedBy', 'name email');
    
    if (!batch) {
      throw new Error(`Batch ${batchId} not found`);
    }
    
    // Get appeals breakdown by status
    const appealIds = batch.documents
      .filter(d => d.appeal)
      .map(d => d.appeal);
    
    const appeals = await Appeal.find({ _id: { $in: appealIds } });
    
    const statusCounts = appeals.reduce((acc, appeal) => {
      acc[appeal.status] = (acc[appeal.status] || 0) + 1;
      return acc;
    }, {});
    
    // Get deadline information
    const urgentCount = batch.documents.filter(d => {
      if (!d.appealDeadline) return false;
      const daysRemaining = Math.ceil((new Date(d.appealDeadline) - new Date()) / (1000 * 60 * 60 * 24));
      return daysRemaining <= 7;
    }).length;
    
    // High value denials
    const highValueCount = batch.documents.filter(d => d.denialAmount >= 1000).length;
    
    // Get top denial reasons
    const denialReasons = {};
    batch.documents.forEach(d => {
      if (d.document && d.document.extractedData && d.document.extractedData.denialReason) {
        const reason = d.document.extractedData.denialReason;
        denialReasons[reason] = (denialReasons[reason] || 0) + 1;
      }
    });
    
    const topDenialReasons = Object.entries(denialReasons)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([reason, count]) => ({ reason, count }));
    
    return {
      batchId: batch.batchId,
      name: batch.name,
      status: batch.status,
      facility: batch.facility,
      uploadedBy: batch.uploadedBy,
      createdAt: batch.createdAt,
      processingStats: batch.processingStats,
      appealStats: {
        statusCounts,
        urgentCount,
        highValueCount,
        topDenialReasons,
        appealByTypeData: Object.fromEntries(batch.processingStats.appealsByType)
      },
      timeMetrics: {
        startTime: batch.startTime,
        completionTime: batch.completionTime,
        processingTime: batch.completionTime && batch.startTime ? 
          (new Date(batch.completionTime) - new Date(batch.startTime)) / 1000 / 60 : null
      }
    };
  } catch (error) {
    logger.error(`Error getting batch summary: ${error.message}`);
    throw error;
  }
};

/**
 * Get documents in a batch with filtering and sorting options
 * @param {String} batchId - ID of the batch
 * @param {Object} options - Filter and sort options
 * @returns {Array} Filtered and sorted documents
 */
const getBatchDocuments = async (batchId, options = {}) => {
  try {
    const {
      status,
      minAmount = 0,
      appealType,
      sortBy = 'priority',
      sortDirection = 'desc',
      page = 1,
      limit = 50
    } = options;
    
    // Find the batch
    const batch = await Batch.findOne({ batchId });
    if (!batch) {
      throw new Error(`Batch ${batchId} not found`);
    }
    
    // Build query
    let query = { batchId };
    
    if (status) {
      const docIds = batch.documents
        .filter(d => d.status === status)
        .map(d => d.document);
      query._id = { $in: docIds };
    }
    
    if (minAmount > 0) {
      const docIds = batch.documents
        .filter(d => d.denialAmount >= minAmount)
        .map(d => d.document);
      query._id = query._id ? { $in: query._id.$in.filter(id => docIds.includes(id)) } : { $in: docIds };
    }
    
    if (appealType) {
      query['extractedData.denialInfo.denialType'] = appealType;
    }
    
    // Execute query with pagination
    const skip = (page - 1) * limit;
    
    // Determine sort field
    let sortField = 'createdAt';
    if (sortBy === 'priority') {
      // Need to join with batch info for priority
      // This is just a placeholder approach
      const docIdsWithPriority = batch.documents
        .sort((a, b) => {
          if (sortDirection === 'desc') {
            return b.priority - a.priority;
          } else {
            return a.priority - b.priority;
          }
        })
        .map(d => d.document);
      
      // Using $in with an ordered array to maintain sort order
      query._id = query._id ? 
        { $in: docIdsWithPriority.filter(id => query._id.$in.includes(id)) } :
        { $in: docIdsWithPriority };
        
      // No additional sort needed as we've pre-sorted with the $in
      sortField = null;
    } else if (sortBy === 'amount') {
      // Similar approach for amount-based sorting
      const docIdsByAmount = batch.documents
        .sort((a, b) => {
          if (sortDirection === 'desc') {
            return b.denialAmount - a.denialAmount;
          } else {
            return a.denialAmount - b.denialAmount;
          }
        })
        .map(d => d.document);
      
      query._id = query._id ? 
        { $in: docIdsByAmount.filter(id => query._id.$in.includes(id)) } :
        { $in: docIdsByAmount };
        
      sortField = null;
    } else if (sortBy === 'deadline') {
      sortField = 'extractedData.appealDeadline';
    } else if (sortBy === 'date') {
      sortField = 'extractedData.serviceDate';
    }
    
    // Execute the query
    let documentsQuery = Document.find(query)
      .populate({
        path: 'appealStatus.appealId',
        select: 'status appealType aiConfidence'
      });
    
    if (sortField) {
      documentsQuery = documentsQuery.sort({ [sortField]: sortDirection === 'desc' ? -1 : 1 });
    }
    
    const documents = await documentsQuery
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const totalCount = await Document.countDocuments(query);
    
    // Enhance documents with batch-specific metadata
    const enhancedDocuments = documents.map(doc => {
      const batchDoc = batch.documents.find(d => d.document.toString() === doc._id.toString());
      return {
        ...doc.toObject(),
        batchMetadata: {
          priority: batchDoc?.priority || 0,
          denialAmount: batchDoc?.denialAmount || 0,
          status: batchDoc?.status || 'pending'
        }
      };
    });
    
    return {
      documents: enhancedDocuments,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit)
      }
    };
  } catch (error) {
    logger.error(`Error getting batch documents: ${error.message}`);
    throw error;
  }
};

// Helper functions

/**
 * Determine document type from claim data
 */
const determineDocumentType = (row) => {
  const typeField = row.documentType || row.DocumentType || row.type;
  if (typeField) {
    if (typeField.toLowerCase().includes('eob')) return 'eob';
    if (typeField.toLowerCase().includes('denial')) return 'denialLetter';
    if (typeField.toLowerCase().includes('medical')) return 'medicalRecord';
  }
  
  // Default to EOB if denial reason exists
  if (row.denialReason || row.DenialReason) {
    return 'denialLetter';
  }
  
  return 'eob';
};

/**
 * Parse date from various formats
 */
const parseDate = (dateStr) => {
  if (!dateStr) return null;
  
  // Try to parse the date
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date;
};

/**
 * Parse array values from string
 */
const parseArray = (arrayStr) => {
  if (!arrayStr) return [];
  
  // If already an array, return as is
  if (Array.isArray(arrayStr)) return arrayStr;
  
  // Split by comma, semicolon, or space
  return arrayStr.split(/[,;\s]+/).filter(Boolean);
};

/**
 * Calculate priority score based on amount and deadline
 */
const calculatePriority = (amount, deadline) => {
  let priority = 0;
  
  // Amount-based priority (0-100)
  if (amount > 10000) priority += 100;
  else if (amount > 5000) priority += 80;
  else if (amount > 1000) priority += 60;
  else if (amount > 500) priority += 40;
  else if (amount > 100) priority += 20;
  else priority += 10;
  
  // Deadline-based priority (0-100)
  if (deadline) {
    const daysRemaining = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
    
    if (daysRemaining < 0) priority += 0; // Expired
    else if (daysRemaining <= 3) priority += 100;
    else if (daysRemaining <= 7) priority += 80;
    else if (daysRemaining <= 14) priority += 60;
    else if (daysRemaining <= 30) priority += 40;
    else priority += 20;
  }
  
  return priority;
};

module.exports = {
  createBatch,
  processClaimFile,
  generateBatchAppeals,
  getBatchSummary,
  getBatchDocuments
};