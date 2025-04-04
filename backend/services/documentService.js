const fs = require('fs');
const path = require('path');
const tesseract = require('node-tesseract-ocr');
const pdfParse = require('pdf-parse');
const mlDocumentProcessor = require('./mlDocumentProcessor');

/**
 * Document processing service
 * Handles OCR, text extraction, and data extraction from documents
 */

// OCR configuration
const ocrConfig = {
  lang: 'eng',
  oem: 1,
  psm: 3,
};

/**
 * Extract text from a document file
 * @param {string} filePath - Path to the document file
 * @returns {Promise<string>} - Extracted text
 */
const extractTextFromDocument = async (filePath) => {
  const fileExtension = path.extname(filePath).toLowerCase();
  
  try {
    if (fileExtension === '.pdf') {
      return await extractTextFromPdf(filePath);
    } else if (['.png', '.jpg', '.jpeg', '.tiff', '.bmp'].includes(fileExtension)) {
      return await extractTextFromImage(filePath);
    } else {
      throw new Error('Unsupported file format');
    }
  } catch (error) {
    console.error(`Error extracting text from document: ${error.message}`);
    throw error;
  }
};

/**
 * Extract text from a PDF document
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<string>} - Extracted text
 */
const extractTextFromPdf = async (filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  } catch (error) {
    console.error(`Error extracting text from PDF: ${error.message}`);
    throw error;
  }
};

/**
 * Extract text from an image using OCR
 * @param {string} filePath - Path to the image file
 * @returns {Promise<string>} - Extracted text
 */
const extractTextFromImage = async (filePath) => {
  try {
    const text = await tesseract.recognize(filePath, ocrConfig);
    return text;
  } catch (error) {
    console.error(`Error extracting text from image: ${error.message}`);
    throw error;
  }
};

/**
 * Extract structured data from document text
 * Identifies fields like claim numbers, amounts, dates, etc.
 * @param {string} text - Extracted text from document
 * @param {string} documentType - Type of document (eob, denialLetter, etc.)
 * @returns {Object} - Extracted structured data
 */
const extractStructuredData = (text, documentType) => {
  // This would be a complex function with regex patterns, NLP, etc.
  // For this example, we'll use a simplified version that looks for common patterns
  
  // Initialize extracted data object
  const extractedData = {
    documentDate: null,
    providerName: null,
    insuranceCarrier: null,
    claimNumber: null,
    memberId: null,
    groupNumber: null,
    serviceDate: null,
    billedAmount: null,
    allowedAmount: null,
    patientResponsibility: null,
    denialReason: null,
    denialCode: null,
    additionalFields: {}
  };
  
  // Example pattern matching for claim numbers
  const claimNumberMatch = text.match(/claim\s*(?:#|number|no)?\s*[:=]?\s*([A-Za-z0-9-]{5,20})/i);
  if (claimNumberMatch) {
    extractedData.claimNumber = claimNumberMatch[1].trim();
  }
  
  // Example pattern matching for member ID
  const memberIdMatch = text.match(/(?:member|subscriber|id)\s*(?:#|number|no)?\s*[:=]?\s*([A-Za-z0-9-]{5,20})/i);
  if (memberIdMatch) {
    extractedData.memberId = memberIdMatch[1].trim();
  }
  
  // Pattern matching for dates
  const serviceDateMatch = text.match(/(?:service|dos|date\s+of\s+service)\s*(?:date)?\s*[:=]?\s*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/i);
  if (serviceDateMatch) {
    extractedData.serviceDate = new Date(serviceDateMatch[1].trim());
  }
  
  // Pattern matching for document date
  const documentDateMatch = text.match(/(?:date|statement\s+date|letter\s+date)\s*[:=]?\s*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/i);
  if (documentDateMatch) {
    extractedData.documentDate = new Date(documentDateMatch[1].trim());
  }
  
  // Pattern matching for patient name
  const patientNameMatch = text.match(/(?:patient|member|beneficiary)\s*(?:name)?\s*[:=]?\s*([A-Za-z\s\.,'-]{2,40})/i) ||
                         text.match(/Name:\s*([A-Za-z\s\.,'-]{2,40})/i);
  if (patientNameMatch) {
    extractedData.patientName = patientNameMatch[1].trim();
  }
  
  // Example pattern matching for dollar amounts
  const billedAmountMatch = text.match(/(?:billed|charged|submitted)\s*(?:amount|charges)?\s*[:=]?\s*\$?(\d+,?\d*\.?\d*)/i);
  if (billedAmountMatch) {
    extractedData.billedAmount = parseFloat(billedAmountMatch[1].replace(',', ''));
  }
  
  // Pattern matching for allowed amounts
  const allowedAmountMatch = text.match(/(?:allowed|approved|covered)\s*(?:amount|charges)?\s*[:=]?\s*\$?(\d+,?\d*\.?\d*)/i);
  if (allowedAmountMatch) {
    extractedData.allowedAmount = parseFloat(allowedAmountMatch[1].replace(',', ''));
  }
  
  // Pattern matching for patient responsibility
  const patientAmountMatch = text.match(/(?:patient|member|you\s+pay|you\s+owe|your\s+responsibility)\s*(?:pays|cost|amount|responsibility)?\s*[:=]?\s*\$?(\d+,?\d*\.?\d*)/i);
  if (patientAmountMatch) {
    extractedData.patientResponsibility = parseFloat(patientAmountMatch[1].replace(',', ''));
  }
  
  // Example pattern matching for denial reasons
  const denialReasonMatch = text.match(/(?:denied|denial|not\s+covered).{0,50}(?:because|due\s+to|reason).{0,10}(.*?)(?:\.|$)/i) || 
                          text.match(/reason\s+for\s+denial\s*:?\s*(.*?)(?:\.|$)/i);
  if (denialReasonMatch) {
    extractedData.denialReason = denialReasonMatch[1].trim();
  }
  
  // Pattern matching for insurance carrier
  const insuranceMatch = text.match(/(?:insurance|carrier|plan|payer)\s*(?:provider|company|name)?\s*[:=]?\s*([A-Za-z\s\.]{2,30})/i);
  if (insuranceMatch) {
    extractedData.insuranceCarrier = insuranceMatch[1].trim();
  }
  
  // Pattern matching for provider name
  const providerMatch = text.match(/(?:provider|physician|doctor|facility)\s*(?:name)?\s*[:=]?\s*([A-Za-z\s\.,']{2,40})/i) ||
                     text.match(/Provider:\s*([A-Za-z\s\.,']{2,40})/i);
  if (providerMatch) {
    extractedData.providerName = providerMatch[1].trim();
    
    // If provider info doesn't exist, create it
    if (!extractedData.providerInfo) {
      extractedData.providerInfo = {};
    }
    
    // Add provider name to provider info
    extractedData.providerInfo.name = extractedData.providerName;
  }
  
  // Pattern matching for provider NPI
  const npiMatch = text.match(/(?:npi|national\s+provider\s+identifier)\s*[:=]?\s*(\d{10})/i);
  if (npiMatch) {
    if (!extractedData.providerInfo) {
      extractedData.providerInfo = {};
    }
    extractedData.providerInfo.npi = npiMatch[1].trim();
  }
  
  // Pattern matching for address
  const addressMatch = text.match(/(?:address|addr)\s*[:=]?\s*([A-Za-z0-9\s\.,'\-\/\(\)]{10,100})/i);
  if (addressMatch) {
    if (!extractedData.providerInfo) {
      extractedData.providerInfo = {};
    }
    extractedData.providerInfo.address = addressMatch[1].trim();
  }
  
  // Pattern matching for phone number
  const phoneMatch = text.match(/(?:phone|tel|telephone)\s*[:=]?\s*(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/i);
  if (phoneMatch) {
    if (!extractedData.providerInfo) {
      extractedData.providerInfo = {};
    }
    extractedData.providerInfo.phone = phoneMatch[1].trim();
  }
  
  // Pattern matching for service description
  const serviceDescMatch = text.match(/(?:service|procedure|treatment)\s*(?:description)?\s*[:=]?\s*([A-Za-z0-9\s\.,'\-\/\(\)]{5,100})/i) ||
                         text.match(/Service Description:\s*([A-Za-z0-9\s\.,'\-\/\(\)]{5,100})/i);
  if (serviceDescMatch) {
    extractedData.serviceDescription = serviceDescMatch[1].trim();
  }
  
  // Look for CPT or procedure codes - common format like CPT 12345
  const procedureMatch = text.match(/(?:CPT|HCPCS|procedure\s+code|proc\s+code)\s*[:=]?\s*([0-9]{5})/ig);
  if (procedureMatch) {
    // Extract just the numbers from matched strings
    extractedData.procedureCodes = procedureMatch.map(match => {
      const codeMatch = match.match(/([0-9]{5})/);
      return codeMatch ? codeMatch[1] : null;
    }).filter(code => code !== null);
  }
  
  // Look for ICD diagnosis codes - common format like ICD-10 A12.3
  const diagnosisMatch = text.match(/(?:ICD|ICD-10|diagnosis\s+code|dx\s+code)\s*[:=]?\s*([A-Z][0-9]{2}(?:\.[0-9]{1,2})?)/ig);
  if (diagnosisMatch) {
    extractedData.diagnosisCodes = diagnosisMatch.map(match => {
      const codeMatch = match.match(/([A-Z][0-9]{2}(?:\.[0-9]{1,2})?)/);
      return codeMatch ? codeMatch[1] : null;
    }).filter(code => code !== null);
  }
  
  // Pattern matching for denial code
  const denialCodeMatch = text.match(/(?:denial|reason)\s*(?:code)?\s*[:=]?\s*([A-Z0-9-]{1,10})/i) || 
                         text.match(/code\s*:?\s*([A-Z0-9-]{1,10})/i) ||
                         text.match(/Denial Code:\s*([A-Z0-9-]{1,10})/i);
  if (denialCodeMatch) {
    extractedData.denialCode = denialCodeMatch[1].trim();
  }
  
  // Pattern matching for appeal deadline
  const appealDeadlineMatch = text.match(/(?:appeal|file\s+an\s+appeal|you\s+may\s+appeal).{0,30}(?:within|by|before|no\s+later\s+than)\s*(\d{1,3})\s*(?:days|calendar\s+days)/i);
  if (appealDeadlineMatch) {
    const daysToAppeal = parseInt(appealDeadlineMatch[1]);
    // Set deadline to N days from service date or current date if service date not found
    const baseDate = extractedData.serviceDate || new Date();
    const deadlineDate = new Date(baseDate);
    deadlineDate.setDate(deadlineDate.getDate() + daysToAppeal);
    extractedData.appealDeadline = deadlineDate;
  }
  
  // In a real implementation, we would have many more patterns and
  // potentially use NLP or ML-based extraction
  
  return extractedData;
};

/**
 * Identify the type of document from its content
 * @param {string} text - Extracted text from document
 * @returns {string} - Document type (eob, denialLetter, medicalRecord, other)
 */
const identifyDocumentType = (text) => {
  const lowercase = text.toLowerCase();
  
  // Check for denial letter first since some EOBs can also be denial letters
  if (
    lowercase.includes('denial') || 
    lowercase.includes('denied') ||
    lowercase.includes('not covered') || 
    lowercase.includes('not approved') ||
    lowercase.includes('not medically necessary')
  ) {
    return 'denialLetter';
  } else if (
    lowercase.includes('explanation of benefits') || 
    lowercase.includes('eob') || 
    (lowercase.includes('claim') && lowercase.includes('benefit'))
  ) {
    return 'eob';
  } else if (
    lowercase.includes('medical record') || 
    lowercase.includes('patient history') || 
    lowercase.includes('clinical notes')
  ) {
    return 'medicalRecord';
  } else {
    return 'other';
  }
};

/**
 * Process a document to extract all relevant information using the ML processor
 * @param {string} filePath - Path to the document file
 * @param {string} [providedDocumentType] - Optional document type if known
 * @returns {Promise<Object>} - Processing results with extracted data
 */
const processDocument = async (filePath, providedDocumentType = null) => {
  try {
    // Use the ML document processor for enhanced extraction
    const mlResult = await mlDocumentProcessor.processDocument(filePath, providedDocumentType);
    
    // If ML processing was successful, return the result
    if (mlResult.success) {
      return mlResult;
    }
    
    // If ML processing failed, fall back to the legacy method
    console.log("ML processing failed, falling back to legacy method");
    
    // Extract text from document
    const extractedText = await extractTextFromDocument(filePath);
    
    // Identify document type if not provided
    const documentType = providedDocumentType || identifyDocumentType(extractedText);
    
    // Extract structured data based on document type
    const extractedData = extractStructuredData(extractedText, documentType);
    
    return {
      success: true,
      documentType,
      extractedText,
      extractedData
    };
  } catch (error) {
    console.error(`Error processing document: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  processDocument,
  extractTextFromDocument,
  extractStructuredData,
  identifyDocumentType
};