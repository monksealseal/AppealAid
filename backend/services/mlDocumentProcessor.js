/**
 * Enhanced ML-based Document Processor
 * 
 * This service enhances document processing with machine learning techniques
 * for insurance document analysis and data extraction.
 */

const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const tesseract = require('node-tesseract-ocr');

// Tesseract OCR configuration for optimal insurance document extraction
const tesseractConfig = {
  lang: 'eng',
  oem: 1, // Neural net LSTM engine only
  psm: 6, // Assume a single uniform block of text
  dpi: 300,
  preserve_interword_spaces: 1,
};

// Regular expressions for key data patterns
const REGEXES = {
  claimNumber: /(?:claim|reference)\s*(?:number|#|no)?\s*[:#]?\s*(\w+[-\s]*\w+)/i,
  memberId: /(?:member|subscriber|patient)\s*(?:id|number|no)?\s*[:#]?\s*(\w+[-\s]*\w+)/i,
  groupNumber: /(?:group)\s*(?:id|number|no)?\s*[:#]?\s*(\w+[-\s]*\w+)/i,
  date: /(?:\d{1,2}[-/]\d{1,2}[-/]\d{2,4})|(?:\w+\s+\d{1,2},?\s+\d{4})/g,
  serviceDate: /(?:date of service|service date|dos)(?:[:\s]+)([a-zA-Z0-9\s,/-]+)/i,
  amount: /\$\s*(\d{1,3}(?:,\d{3})*\.\d{2})/g,
  denialReason: /(?:denial\s+reason|reason\s+for\s+denial|not\s+covered\s+because)[:\s]*([^.]*)/i,
  denialCode: /(?:denial|reason|adjustment|remark)(?:\s+code)[:\s]*([A-Z0-9]{1,5})/i,
  providerName: /(?:provider|doctor|physician|facility)(?:\s+name)?[:\s]*([^0-9\n\r.]{5,50})/i,
  diagnosisCode: /(?:diagnosis|dx|diag)(?:\s+code)?[:\s]*([A-Z0-9]{3,7})/gi,
  procedureCode: /(?:procedure|cpt|hcpcs)(?:\s+code)?[:\s]*([A-Z0-9]{5})/gi,
  insuranceCarrier: /(?:insurance\s+(?:company|carrier|plan)|plan\s+name)[:\s]*([A-Za-z\s&]+)/i,
  appealDeadline: /(?:appeal|file)(?:\s+within|by|\s+deadline)[:\s]*(\d+\s+days|[a-zA-Z]{3,9}\s+\d{1,2},?\s+\d{4})/i,
  patientName: /(?:patient|member|beneficiary)\s+name[:\s]*([A-Za-z\s-]+)/i,
  providerNPI: /(?:npi|national\s+provider\s+(?:identifier|id))[:\s]*(\d{10})/i,
  providerTIN: /(?:tin|tax\s+(?:id|identification)\s+number)[:\s]*(\d{2}-\d{7}|\d{9})/i,
  authorizationNumber: /(?:auth(?:orization)?|prior\s+auth(?:orization)?)\s*(?:number|#|no)?[:\s]*([A-Z0-9]{5,15})/i
};

// Additional denial identification patterns for improved detection
const DENIAL_INDICATORS = [
  // Common denial phrases
  /not\s+medically\s+necessary/i,
  /not\s+covered\s+(?:benefit|service)/i,
  /experimental\s+(?:or\s+investigational)/i,
  /out\s+of\s+network/i,
  /non[-\s]par/i,
  /prior\s+authorization\s+(?:required|not\s+obtained)/i,
  /coverage\s+terminated/i,
  /maximum\s+benefits\s+reached/i,
  /duplicate\s+claim/i,
  /timely\s+filing/i,
  /patient\s+responsibility/i,
  /non[-\s]covered/i,
  /bundled\s+service/i,
  /inclusive\s+service/i,
  /denied/i,
  /rejection/i
];

// Extended denial codes mapping
const DENIAL_CODES = {
  // CARC (Claim Adjustment Reason Codes)
  '16': 'Claim lacks information or has submission/billing error(s)',
  '50': 'Not covered by contract or plan',
  '96': 'Non-covered services',
  '97': 'Bundled or unbundled services',
  '119': 'Benefit maximum reached',
  '149': 'Lifetime benefit maximum reached',
  '167': 'Service not authorized',
  '185': 'Payer specific issue: needs prior authorization',
  '197': 'Precertification/authorization/notification absent',
  '204': 'Service requires prior authorization',
  '219': 'Based on policy, procedure is experimental/investigational',
  '234': 'Service not provided at authorized location',
  '243': 'Services not provided by network/primary care providers',
  '252': 'Out of network referral',
  '272': 'Coverage/program guidelines not met',
  
  // RARC (Remittance Advice Remark Codes)
  'N115': 'Incomplete/invalid service authorization',
  'N130': 'Consult plan benefit documents',
  'N280': 'Service does not meet medical necessity',
  'N381': 'No approval certificate provided',
  'N418': 'Misrouted claim',
  'N650': 'Missing/incomplete documentation',
  'N767': 'Service is not covered in network',
  'M54': 'Missing/incomplete/invalid provider information',
  'M86': 'Service denied because payment already made',
  'MA04': 'Secondary payment cannot be considered when no primary',
  'MA130': 'Your claim includes services for which the provider must file'
};

// Classification of documents
const documentTypes = {
  eob: [
    'explanation of benefits', 'eob', 'summary of benefits', 'benefit statement',
    'remittance advice', 'provider remittance'
  ],
  denialLetter: [
    'denial letter', 'notice of denial', 'adverse determination', 'non-coverage',
    'service denial', 'claim denied'
  ],
  medicalRecord: [
    'medical record', 'clinical summary', 'progress note', 'discharge summary',
    'patient history', 'physical examination'
  ]
};

// Insurance company portal information
const INSURANCE_PORTALS = {
  'Blue Cross Blue Shield': {
    name: 'Blue Cross Blue Shield',
    appealPortalUrl: 'https://provider.bcbs.com',
    appealFormats: ['electronic', 'fax', 'mail'],
    appealTimeframes: { standard: 180, expedited: 72 },
    appealFormLocation: 'Provider Portal > Claims > Appeals'
  },
  'Aetna': {
    name: 'Aetna',
    appealPortalUrl: 'https://navinet.navimedix.com',
    appealFormats: ['electronic', 'fax', 'mail'],
    appealTimeframes: { standard: 180, expedited: 72 },
    appealFormLocation: 'Claims > Appeal Request'
  },
  'UnitedHealthcare': {
    name: 'UnitedHealthcare',
    appealPortalUrl: 'https://www.unitedhealthcareonline.com',
    appealFormats: ['electronic', 'fax', 'mail'],
    appealTimeframes: { standard: 180, expedited: 72 },
    appealFormLocation: 'Claims & Payments > Submit Appeal'
  },
  'Cigna': {
    name: 'Cigna',
    appealPortalUrl: 'https://cignaforhcp.cigna.com',
    appealFormats: ['electronic', 'fax', 'mail'],
    appealTimeframes: { standard: 180, expedited: 72 },
    appealFormLocation: 'Claims > Claim Reconsiderations'
  },
  'Humana': {
    name: 'Humana',
    appealPortalUrl: 'https://www.availity.com',
    appealFormats: ['electronic', 'fax', 'mail'],
    appealTimeframes: { standard: 180, expedited: 60 },
    appealFormLocation: 'Claims > Claims Status > Appeals'
  },
  'Medicare': {
    name: 'Medicare',
    appealPortalUrl: 'https://www.cms.gov/Medicare/Appeals-and-Grievances/MedPrescriptDrugApplGriev',
    appealFormats: ['mail', 'fax'],
    appealTimeframes: { standard: 120, expedited: 72 },
    appealFormLocation: 'N/A - Use Medicare Redetermination Request Form'
  },
  'Medicaid': {
    name: 'Medicaid',
    appealPortalUrl: 'Varies by state',
    appealFormats: ['mail', 'fax'],
    appealTimeframes: { standard: 90, expedited: 72 },
    appealFormLocation: 'Varies by state'
  }
};

/**
 * Classifies document type based on content
 * @param {string} text - The extracted text from the document
 * @returns {string} - The document type classification
 */
function classifyDocumentType(text) {
  text = text.toLowerCase();
  
  // Check each document type for matches
  for (const [type, keywords] of Object.entries(documentTypes)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return type;
    }
  }
  
  // Default type if no matches found
  return 'other';
}

/**
 * Automatically detects if a document is a denial and categorizes the denial type
 * @param {string} text - The extracted text from the document
 * @param {Object} extractedData - Previously extracted structured data
 * @returns {Object} - Denial detection results
 */
function detectDenial(text, extractedData = {}) {
  // Initialize result
  const result = {
    isDenial: false,
    denialType: null,
    denialReason: null,
    denialCode: null,
    appealDeadlineDays: null,
    appealDeadlineDate: null,
    confidence: 0,
    suggestedNextSteps: []
  };
  
  // Check for explicit denial indicators
  const denialMatches = DENIAL_INDICATORS.filter(pattern => pattern.test(text));
  
  // Check if denial reason or code already extracted
  const hasDenialReason = extractedData.denialReason && extractedData.denialReason.length > 5;
  const hasDenialCode = extractedData.denialCode && extractedData.denialCode.trim().length > 0;
  
  // Check for amount indicators (difference between billed and allowed)
  const hasPaymentGap = extractedData.billedAmount && 
                         extractedData.allowedAmount && 
                         extractedData.billedAmount > extractedData.allowedAmount;
  
  // Determine if this is a denial
  if (denialMatches.length > 0 || hasDenialReason || hasDenialCode || hasPaymentGap) {
    result.isDenial = true;
    
    // Set confidence level based on evidence
    if ((hasDenialReason && hasDenialCode) || denialMatches.length >= 2) {
      result.confidence = 0.9; // Strong evidence
    } else if (hasDenialReason || hasDenialCode || denialMatches.length === 1) {
      result.confidence = 0.7; // Good evidence
    } else if (hasPaymentGap) {
      result.confidence = 0.5; // Moderate evidence
    }
    
    // Use existing extracted data if available
    if (hasDenialReason) {
      result.denialReason = extractedData.denialReason;
    } else {
      // Try to extract denial reason from context around denial indicators
      for (const pattern of denialMatches) {
        const matchIndex = text.search(pattern);
        if (matchIndex >= 0) {
          // Get the sentence containing the denial indicator
          const sentenceStart = text.lastIndexOf('.', matchIndex) + 1;
          const sentenceEnd = text.indexOf('.', matchIndex);
          if (sentenceEnd > sentenceStart) {
            result.denialReason = text.substring(sentenceStart, sentenceEnd).trim();
            break;
          }
        }
      }
    }
    
    // Use existing denial code or try to extract one
    if (hasDenialCode) {
      result.denialCode = extractedData.denialCode;
      
      // Look up code meaning
      if (DENIAL_CODES[result.denialCode]) {
        if (!result.denialReason || result.denialReason.length < DENIAL_CODES[result.denialCode].length) {
          result.denialReason = DENIAL_CODES[result.denialCode];
        }
      }
    } else {
      // Look for common denial code patterns
      const codeMatch = text.match(/(?:code|CARC|RARC)[:\s]*([A-Z0-9]{1,5})/i);
      if (codeMatch && codeMatch[1]) {
        result.denialCode = codeMatch[1].trim();
      }
    }
    
    // Categorize denial type based on reason or code
    result.denialType = categorizeDenial(result.denialReason, result.denialCode);
    
    // Extract appeal deadline if available
    if (extractedData.appealDeadline) {
      result.appealDeadlineDate = extractedData.appealDeadline;
      
      // Calculate days remaining
      const now = new Date();
      const deadline = new Date(extractedData.appealDeadline);
      result.appealDeadlineDays = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
    } else {
      // Try to find standard appeal timeframe
      const timeframeMatch = text.match(/(?:appeal|file)[^.]*?within\s+(\d+)\s+(?:calendar|business)?\s*days/i);
      if (timeframeMatch && timeframeMatch[1]) {
        result.appealDeadlineDays = parseInt(timeframeMatch[1]);
        
        // Calculate deadline date
        const deadline = new Date();
        deadline.setDate(deadline.getDate() + result.appealDeadlineDays);
        result.appealDeadlineDate = deadline;
      } else {
        // Try to find specific deadline date
        const deadlineDateMatch = text.match(/(?:appeal|file)[^.]*?by\s+([A-Za-z]+\s+\d{1,2},?\s+\d{4})/i);
        if (deadlineDateMatch && deadlineDateMatch[1]) {
          result.appealDeadlineDate = extractDate(deadlineDateMatch[1]);
          
          if (result.appealDeadlineDate) {
            const now = new Date();
            result.appealDeadlineDays = Math.ceil((result.appealDeadlineDate - now) / (1000 * 60 * 60 * 24));
          }
        }
      }
    }
    
    // Determine next steps based on denial type
    result.suggestedNextSteps = generateNextSteps(result.denialType, extractedData);
  }
  
  return result;
}

/**
 * Categorizes a denial into specific types based on reason or code
 * @param {string} denialReason - The extracted denial reason
 * @param {string} denialCode - The extracted denial code
 * @returns {string} - Categorized denial type
 */
function categorizeDenial(denialReason, denialCode) {
  // Start with default
  let denialType = 'other';
  
  // Check denial code first if available
  if (denialCode) {
    const codeMap = {
      '16': 'codingError',
      '50': 'notCovered',
      '96': 'notCovered',
      '97': 'codingError',
      '119': 'benefitMaximum',
      '149': 'benefitMaximum',
      '167': 'priorAuthorization',
      '185': 'priorAuthorization',
      '197': 'priorAuthorization',
      '204': 'priorAuthorization',
      '219': 'experimentalTreatment',
      '234': 'networkStatus',
      '243': 'networkStatus',
      '252': 'networkStatus',
      '272': 'medicalNecessity',
      'N115': 'priorAuthorization',
      'N130': 'notCovered',
      'N280': 'medicalNecessity',
      'N381': 'priorAuthorization',
      'N650': 'codingError',
      'N767': 'networkStatus'
    };
    
    if (codeMap[denialCode]) {
      denialType = codeMap[denialCode];
      return denialType;
    }
  }
  
  // If no match with code, check reason text
  if (denialReason) {
    const reasonLower = denialReason.toLowerCase();
    
    if (/medical\s+necessity|not\s+medically\s+necessary/i.test(reasonLower)) {
      denialType = 'medicalNecessity';
    } else if (/prior\s+auth|authorization|pre[-\s]?certification/i.test(reasonLower)) {
      denialType = 'priorAuthorization';
    } else if (/network|non[-\s]par|out\s+of\s+network/i.test(reasonLower)) {
      denialType = 'networkStatus';
    } else if (/experimental|investigational|unproven/i.test(reasonLower)) {
      denialType = 'experimentalTreatment';
    } else if (/coding|incorrect\s+code|invalid\s+code|unbundling|bundled/i.test(reasonLower)) {
      denialType = 'codingError';
    } else if (/not\s+covered|non[-\s]covered|excluded\s+benefit|exclusion/i.test(reasonLower)) {
      denialType = 'notCovered';
    } else if (/maximum\s+benefit|lifetime\s+maximum|exhausted\s+benefit/i.test(reasonLower)) {
      denialType = 'benefitMaximum';
    } else if (/timely\s+filing|filing\s+deadline/i.test(reasonLower)) {
      denialType = 'timelyFiling';
    } else if (/duplicate/i.test(reasonLower)) {
      denialType = 'duplicate';
    }
  }
  
  return denialType;
}

/**
 * Generates recommended next steps based on denial type
 * @param {string} denialType - The categorized denial type
 * @param {Object} extractedData - The extracted document data
 * @returns {Array} - List of recommended next steps
 */
function generateNextSteps(denialType, extractedData) {
  const steps = [];
  
  // Common step for all denials
  steps.push('Review the denial reason and supporting documentation');
  
  // Type-specific steps
  switch (denialType) {
    case 'medicalNecessity':
      steps.push('Obtain physician letter explaining medical necessity');
      steps.push('Gather relevant clinical documentation showing condition severity');
      steps.push('Review medical necessity criteria from the payer');
      break;
      
    case 'priorAuthorization':
      steps.push('Check if authorization was obtained but not properly documented');
      steps.push('Document any emergency circumstances that prevented prior authorization');
      steps.push('Verify if service is actually subject to prior authorization requirements');
      break;
      
    case 'networkStatus':
      steps.push('Document why an out-of-network provider was necessary');
      steps.push('Check if there was a network adequacy issue or a referral from in-network provider');
      steps.push('Verify if the provider\'s network status changed during the course of treatment');
      break;
      
    case 'experimentalTreatment':
      steps.push('Gather peer-reviewed studies supporting treatment efficacy');
      steps.push('Obtain expert physician statement on standard of care');
      steps.push('Research similar cases where treatment was approved');
      break;
      
    case 'codingError':
      steps.push('Review coding for accuracy and compliance with current guidelines');
      steps.push('Check modifiers and ensure code matches documentation');
      steps.push('Correct claim and resubmit with appropriate documentation');
      break;
      
    case 'notCovered':
      steps.push('Review policy documents for specific coverage provisions');
      steps.push('Check if service can be billed under a different, covered code');
      steps.push('Verify effective dates of policy and any benefit changes');
      break;
      
    case 'benefitMaximum':
      steps.push('Verify benefit calculations and usage tracking');
      steps.push('Check if patient has secondary insurance');
      steps.push('Review if some services can be recategorized under different benefits');
      break;
      
    case 'timelyFiling':
      steps.push('Gather proof of timely submission (electronic confirmation, certified mail)');
      steps.push('Check if there were extenuating circumstances affecting filing');
      steps.push('Document any previous claim submission attempts');
      break;
      
    case 'duplicate':
      steps.push('Verify if services were actually provided multiple times');
      steps.push('Check for date of service or claim number discrepancies');
      steps.push('Provide documentation that shows distinct services were provided');
      break;
      
    default:
      steps.push('Consult with billing/coding specialist about appropriate appeal strategy');
      steps.push('Review claim for any missing or incorrect information');
  }
  
  // Add urgency-based recommendations
  if (extractedData.appealDeadline) {
    const now = new Date();
    const deadline = new Date(extractedData.appealDeadline);
    const daysRemaining = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
    
    if (daysRemaining <= 3) {
      steps.unshift('URGENT: Submit appeal immediately to meet deadline');
    } else if (daysRemaining <= 7) {
      steps.unshift('PRIORITY: Prepare and submit appeal within the next 48 hours');
    }
  }
  
  // Add insurance-specific recommendations
  if (extractedData.insuranceCarrier && INSURANCE_PORTALS[extractedData.insuranceCarrier]) {
    const insurer = INSURANCE_PORTALS[extractedData.insuranceCarrier];
    steps.push(`Submit appeal through ${insurer.name} portal: ${insurer.appealPortalUrl}`);
  }
  
  return steps;
}

/**
 * Analyzes the potential success rate of an appeal based on denial type and other factors
 * @param {Object} denialInfo - The denial detection results
 * @param {Object} extractedData - The extracted document data
 * @returns {Object} - Appeal success prediction
 */
function analyzeAppealPotential(denialInfo, extractedData) {
  // Base success rates by denial type
  const baseSuccessRates = {
    medicalNecessity: 0.72,
    priorAuthorization: 0.65,
    networkStatus: 0.58,
    experimentalTreatment: 0.45,
    codingError: 0.85,
    notCovered: 0.48,
    benefitMaximum: 0.35,
    timelyFiling: 0.40,
    duplicate: 0.75,
    other: 0.50
  };
  
  // Start with base success rate
  let successProbability = baseSuccessRates[denialInfo.denialType] || 0.5;
  
  // Adjust based on extracted documentation completeness
  const criticalFields = ['claimNumber', 'serviceDate', 'denialReason', 'denialCode'];
  const supportingFields = ['patientName', 'providerName', 'diagnosisCodes', 'procedureCodes'];
  
  const presentCriticalFields = criticalFields.filter(f => extractedData[f]);
  const presentSupportingFields = supportingFields.filter(f => {
    if (Array.isArray(extractedData[f])) return extractedData[f].length > 0;
    return extractedData[f];
  });
  
  // Calculate data completeness scores
  const criticalScore = presentCriticalFields.length / criticalFields.length;
  const supportingScore = presentSupportingFields.length / supportingFields.length;
  
  // Adjust probability based on data completeness
  successProbability += (criticalScore * 0.15);
  successProbability += (supportingScore * 0.05);
  
  // Adjust based on denial amount if available
  if (extractedData.billedAmount && extractedData.allowedAmount) {
    const denialAmount = extractedData.billedAmount - extractedData.allowedAmount;
    
    // Higher amounts typically face more scrutiny
    if (denialAmount > 10000) {
      successProbability -= 0.15;
    } else if (denialAmount > 5000) {
      successProbability -= 0.10;
    } else if (denialAmount > 1000) {
      successProbability -= 0.05;
    } else if (denialAmount < 500) {
      successProbability += 0.05; // Smaller amounts may be approved more easily
    }
  }
  
  // Adjust for insurance carrier if known
  const carrierAdjustments = {
    'Blue Cross Blue Shield': 0.05,
    'Aetna': -0.02,
    'UnitedHealthcare': 0.0,
    'Cigna': 0.03,
    'Humana': -0.05,
    'Medicare': 0.08,
    'Medicaid': -0.10
  };
  
  if (extractedData.insuranceCarrier && carrierAdjustments[extractedData.insuranceCarrier]) {
    successProbability += carrierAdjustments[extractedData.insuranceCarrier];
  }
  
  // Ensure probability is between 0 and 1
  successProbability = Math.min(Math.max(successProbability, 0), 1);
  
  // Determine priority score (combination of success probability and financial impact)
  let priorityScore = successProbability;
  if (extractedData.billedAmount && extractedData.allowedAmount) {
    const denialAmount = extractedData.billedAmount - extractedData.allowedAmount;
    // Normalize to 0-1 scale based on amount (assumes $10,000+ is highest priority)
    const financialImpact = Math.min(denialAmount / 10000, 1);
    // Weighted combination: 60% success probability, 40% financial impact
    priorityScore = (successProbability * 0.6) + (financialImpact * 0.4);
  }
  
  // Generate appeal impact factors
  const factors = [];
  
  // Success rate factor
  if (successProbability > 0.7) {
    factors.push({
      factor: 'High historical success rate',
      impact: 'positive',
      description: `${denialInfo.denialType} appeals have a ${Math.round(baseSuccessRates[denialInfo.denialType]*100)}% historical success rate`
    });
  } else if (successProbability < 0.4) {
    factors.push({
      factor: 'Low historical success rate',
      impact: 'negative',
      description: `${denialInfo.denialType} appeals have only a ${Math.round(baseSuccessRates[denialInfo.denialType]*100)}% historical success rate`
    });
  }
  
  // Data completeness factor
  if (criticalScore >= 0.75) {
    factors.push({
      factor: 'Good documentation available',
      impact: 'positive',
      description: 'Critical information is well-documented, strengthening the appeal'
    });
  } else if (criticalScore < 0.5) {
    factors.push({
      factor: 'Incomplete documentation',
      impact: 'negative',
      description: 'Missing critical information may weaken the appeal case'
    });
  }
  
  // Amount factor
  if (extractedData.billedAmount && extractedData.allowedAmount) {
    const denialAmount = extractedData.billedAmount - extractedData.allowedAmount;
    if (denialAmount > 5000) {
      factors.push({
        factor: 'High dollar amount',
        impact: 'negative',
        description: 'Larger dollar amounts typically face greater scrutiny in appeals'
      });
    }
  }
  
  // Deadline factor
  if (denialInfo.appealDeadlineDays !== null) {
    if (denialInfo.appealDeadlineDays < 0) {
      factors.push({
        factor: 'Deadline missed',
        impact: 'negative',
        description: 'Appeal deadline has passed, significantly reducing chances of success'
      });
    } else if (denialInfo.appealDeadlineDays < 7) {
      factors.push({
        factor: 'Urgent deadline approaching',
        impact: 'negative',
        description: `Only ${denialInfo.appealDeadlineDays} days remain to submit appeal`
      });
    }
  }
  
  // Insurance carrier factor
  if (extractedData.insuranceCarrier && carrierAdjustments[extractedData.insuranceCarrier]) {
    const adjustment = carrierAdjustments[extractedData.insuranceCarrier];
    if (adjustment > 0) {
      factors.push({
        factor: `${extractedData.insuranceCarrier} appeal response`,
        impact: 'positive',
        description: `${extractedData.insuranceCarrier} typically has more favorable appeal outcomes`
      });
    } else if (adjustment < 0) {
      factors.push({
        factor: `${extractedData.insuranceCarrier} appeal response`,
        impact: 'negative',
        description: `${extractedData.insuranceCarrier} can be more challenging for appeals`
      });
    }
  }
  
  return {
    successProbability,
    priorityScore,
    appealRecommendation: successProbability > 0.4 ? 'recommended' : 'review',
    factors
  };
}

/**
 * Extracts formatted date from text
 * @param {string} text - Text potentially containing date
 * @returns {Date|null} - Formatted Date object or null
 */
function extractDate(text) {
  if (!text) return null;
  
  try {
    // Look for dates in the text
    const dateMatch = text.match(/\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})\b/) || 
                     text.match(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{1,2}),?\s+(\d{4})\b/i);
    
    if (dateMatch) {
      // Try to parse the date
      const possibleDate = new Date(dateMatch[0]);
      if (!isNaN(possibleDate.getTime())) {
        return possibleDate;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing date:', error);
    return null;
  }
}

/**
 * Extracts monetary amount from string
 * @param {string} amountStr - String containing a dollar amount
 * @returns {number|null} - Extracted amount as number or null
 */
function extractAmount(amountStr) {
  if (!amountStr) return null;
  
  try {
    // Remove $ and commas, then parse as float
    const amount = parseFloat(amountStr.replace(/[$,]/g, ''));
    return isNaN(amount) ? null : amount;
  } catch (error) {
    return null;
  }
}

/**
 * Process a PDF file to extract text content
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<string>} - Extracted text content
 */
async function extractTextFromPDF(filePath) {
  try {
    // Read the file as buffer
    const dataBuffer = fs.readFileSync(filePath);
    
    // Parse PDF to text
    const pdfData = await pdfParse(dataBuffer);
    let text = pdfData.text;
    
    // If text extraction yielded limited results, try OCR as a fallback
    if (text.length < 100 || text.split('\n').length < 5) {
      console.log('PDF text extraction yielded limited results. Falling back to OCR...');
      text = await performOCR(filePath);
    }
    
    return text;
  } catch (error) {
    console.error(`Error extracting text from PDF: ${error.message}`);
    // Fallback to OCR
    return await performOCR(filePath);
  }
}

/**
 * Process an image file using OCR
 * @param {string} filePath - Path to the image file
 * @returns {Promise<string>} - Extracted text content
 */
async function performOCR(filePath) {
  try {
    const text = await tesseract.recognize(filePath, tesseractConfig);
    return text;
  } catch (error) {
    console.error(`OCR processing error: ${error.message}`);
    throw new Error('Failed to extract text using OCR');
  }
}

/**
 * Extract key information from document text using regex patterns and ML heuristics
 * @param {string} text - Extracted text from document
 * @param {string} documentType - Classified document type
 * @returns {Object} - Extracted data fields
 */
function extractDataFromText(text, documentType) {
  // Initialize extracted data object
  const extractedData = {
    documentType,
    documentDate: null,
    providerName: null,
    patientName: null,
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
    appealDeadline: null,
    serviceDescription: null,
    diagnosisCodes: [],
    procedureCodes: [],
    providerInfo: {
      name: null,
      npi: null,
      tin: null,
      address: null,
      phone: null,
      fax: null
    },
    additionalFields: {}
  };
  
  // Extract key data using regex patterns
  const extractRegexData = () => {
    // Claim Number
    const claimMatch = text.match(REGEXES.claimNumber);
    if (claimMatch && claimMatch[1]) {
      extractedData.claimNumber = claimMatch[1].trim();
    }
    
    // Member ID
    const memberMatch = text.match(REGEXES.memberId);
    if (memberMatch && memberMatch[1]) {
      extractedData.memberId = memberMatch[1].trim();
    }
    
    // Group Number
    const groupMatch = text.match(REGEXES.groupNumber);
    if (groupMatch && groupMatch[1]) {
      extractedData.groupNumber = groupMatch[1].trim();
    }
    
    // Service Date
    const serviceDateMatch = text.match(REGEXES.serviceDate);
    if (serviceDateMatch && serviceDateMatch[1]) {
      extractedData.serviceDate = extractDate(serviceDateMatch[1]);
    }
    
    // Provider Name
    const providerMatch = text.match(REGEXES.providerName);
    if (providerMatch && providerMatch[1]) {
      extractedData.providerName = providerMatch[1].trim();
      extractedData.providerInfo.name = providerMatch[1].trim();
    }
    
    // Patient Name
    const patientMatch = text.match(REGEXES.patientName);
    if (patientMatch && patientMatch[1]) {
      extractedData.patientName = patientMatch[1].trim();
    }
    
    // Provider NPI
    const npiMatch = text.match(REGEXES.providerNPI);
    if (npiMatch && npiMatch[1]) {
      extractedData.providerInfo.npi = npiMatch[1].trim();
    }
    
    // Provider TIN
    const tinMatch = text.match(REGEXES.providerTIN);
    if (tinMatch && tinMatch[1]) {
      extractedData.providerInfo.tin = tinMatch[1].trim();
    }
    
    // Authorization Number
    const authMatch = text.match(REGEXES.authorizationNumber);
    if (authMatch && authMatch[1]) {
      extractedData.additionalFields.authorizationNumber = authMatch[1].trim();
    }
    
    // Insurance Carrier
    const insuranceMatch = text.match(REGEXES.insuranceCarrier);
    if (insuranceMatch && insuranceMatch[1]) {
      extractedData.insuranceCarrier = insuranceMatch[1].trim();
    }
    
    // Denial Reason
    const denialReasonMatch = text.match(REGEXES.denialReason);
    if (denialReasonMatch && denialReasonMatch[1]) {
      extractedData.denialReason = denialReasonMatch[1].trim();
    }
    
    // Denial Code
    const denialCodeMatch = text.match(REGEXES.denialCode);
    if (denialCodeMatch && denialCodeMatch[1]) {
      extractedData.denialCode = denialCodeMatch[1].trim();
    }
    
    // Appeal Deadline
    const appealDeadlineMatch = text.match(REGEXES.appealDeadline);
    if (appealDeadlineMatch && appealDeadlineMatch[1]) {
      // If deadline is in "X days" format, calculate the date
      const deadlineText = appealDeadlineMatch[1].trim();
      if (deadlineText.match(/\d+\s+days/i)) {
        const days = parseInt(deadlineText.match(/(\d+)/)[1]);
        const deadline = new Date();
        deadline.setDate(deadline.getDate() + days);
        extractedData.appealDeadline = deadline;
      } else {
        extractedData.appealDeadline = extractDate(deadlineText);
      }
    }
    
    // Procedure Codes
    const procedureMatches = text.matchAll(REGEXES.procedureCode);
    for (const match of procedureMatches) {
      if (match[1] && !extractedData.procedureCodes.includes(match[1].trim())) {
        extractedData.procedureCodes.push(match[1].trim());
      }
    }
    
    // Diagnosis Codes
    const diagnosisMatches = text.matchAll(REGEXES.diagnosisCode);
    for (const match of diagnosisMatches) {
      if (match[1] && !extractedData.diagnosisCodes.includes(match[1].trim())) {
        extractedData.diagnosisCodes.push(match[1].trim());
      }
    }
    
    // Document Date - typically the first date in the document
    const allDates = Array.from(text.matchAll(REGEXES.date))
      .map(match => extractDate(match[0]))
      .filter(date => date !== null);
    
    if (allDates.length > 0) {
      extractedData.documentDate = allDates[0];
    }
    
    // Find multiple dollar amounts to determine billing information
    const allAmounts = Array.from(text.matchAll(REGEXES.amount))
      .map(match => extractAmount(match[1]))
      .filter(amount => amount !== null)
      .sort((a, b) => b - a); // Sort in descending order
    
    if (allAmounts.length >= 3) {
      // Typically the highest amount is billed amount
      extractedData.billedAmount = allAmounts[0];
      // Second highest is often the allowed amount
      extractedData.allowedAmount = allAmounts[1];
      // A lower amount is often patient responsibility
      extractedData.patientResponsibility = allAmounts[allAmounts.length - 1];
    } else if (allAmounts.length >= 1) {
      // If we only found one amount, assume it's the billed amount
      extractedData.billedAmount = allAmounts[0];
    }
  };
  
  // Extract document-type specific data
  const extractTypeSpecificData = () => {
    if (documentType === 'eob') {
      // Look for common EOB sections
      const sections = text.split(/\n{2,}/); // Split by multiple newlines which often denote sections
      
      // Look for a service description in the EOB
      const serviceDescSection = sections.find(section => 
        /service description|description of service/i.test(section)
      );
      
      if (serviceDescSection) {
        const descriptionMatch = serviceDescSection.match(/service description[:\s]*(.*)/i);
        if (descriptionMatch && descriptionMatch[1]) {
          extractedData.serviceDescription = descriptionMatch[1].trim();
        }
      }
      
      // Look for provider address
      const addressSection = sections.find(section => 
        /provider\s+(?:address|location)|facility\s+address/i.test(section)
      );
      
      if (addressSection) {
        const addressLines = addressSection.split('\n');
        const addressLineIndex = addressLines.findIndex(line => 
          /provider\s+(?:address|location)|facility\s+address/i.test(line)
        );
        
        if (addressLineIndex >= 0 && addressLineIndex < addressLines.length - 1) {
          extractedData.providerInfo.address = addressLines[addressLineIndex + 1].trim();
        }
      }
    } else if (documentType === 'denialLetter') {
      // Look for appeal instructions in denial letters
      const appealSection = text.match(/you have the right to appeal|appeal process|how to appeal|file an appeal/i);
      if (appealSection) {
        // The section following this match likely contains appeal instructions
        const sectionIndex = text.indexOf(appealSection[0]);
        const appealText = text.substring(sectionIndex, sectionIndex + 500); // Look at next 500 chars
        
        // Look for timeline mentioned in appeals section
        const timelineMatch = appealText.match(/within\s+(\d+)\s+days|by\s+([a-zA-Z]+\s+\d{1,2},?\s+\d{4})/i);
        if (timelineMatch) {
          if (timelineMatch[1]) {
            // "within X days" format
            const days = parseInt(timelineMatch[1]);
            const deadline = new Date();
            deadline.setDate(deadline.getDate() + days);
            extractedData.appealDeadline = deadline;
          } else if (timelineMatch[2]) {
            // "by Month Day, Year" format
            extractedData.appealDeadline = extractDate(timelineMatch[2]);
          }
        }
        
        // Look for service description in denial section
        const serviceMatch = appealText.match(/(?:service|procedure|treatment)[:\s]+([^.]+)/i);
        if (serviceMatch && serviceMatch[1]) {
          extractedData.serviceDescription = serviceMatch[1].trim();
        }
      }
    }
  };
  
  // Call extraction functions
  extractRegexData();
  extractTypeSpecificData();
  
  // Extract insurance portal information if carrier is known
  if (extractedData.insuranceCarrier) {
    for (const [key, insurer] of Object.entries(INSURANCE_PORTALS)) {
      if (extractedData.insuranceCarrier.includes(key)) {
        extractedData.additionalFields.insurerPortalInfo = insurer;
        break;
      }
    }
  }
  
  return extractedData;
}

/**
 * Main function to process document and extract data
 * @param {string} filePath - Path to the document file
 * @param {string} providedType - Optional document type hint
 * @returns {Promise<Object>} - Processing result with extracted data
 */
async function processDocument(filePath, providedType = null) {
  try {
    console.log(`Processing document: ${filePath}`);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error('File not found');
    }
    
    // Extract file extension
    const fileExt = path.extname(filePath).toLowerCase();
    
    // Extract text based on file type
    let extractedText;
    if (fileExt === '.pdf') {
      extractedText = await extractTextFromPDF(filePath);
    } else if (['.png', '.jpg', '.jpeg', '.tiff', '.bmp'].includes(fileExt)) {
      extractedText = await performOCR(filePath);
    } else {
      throw new Error('Unsupported file format');
    }
    
    // If no text was extracted, return error
    if (!extractedText || extractedText.trim().length === 0) {
      throw new Error('No text could be extracted from the document');
    }
    
    // Determine document type (use provided type if available)
    const documentType = providedType || classifyDocumentType(extractedText);
    
    // Extract structured data from text
    const extractedData = extractDataFromText(extractedText, documentType);
    
    // Detect denial status and categorize
    const denialInfo = detectDenial(extractedText, extractedData);
    
    // Calculate appeal potential if it's a denial
    let appealPotential = null;
    if (denialInfo.isDenial) {
      appealPotential = analyzeAppealPotential(denialInfo, extractedData);
    }
    
    // Return successful result
    return {
      success: true,
      extractedText,
      extractedData,
      documentType,
      denialInfo,
      appealPotential
    };
  } catch (error) {
    console.error(`Document processing error: ${error.message}`);
    
    // Return error result
    return {
      success: false,
      error: error.message,
    };
  }
}

module.exports = {
  processDocument,
  extractTextFromPDF,
  performOCR,
  extractDataFromText,
  classifyDocumentType,
  detectDenial,
  analyzeAppealPotential
};