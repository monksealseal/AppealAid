/**
 * Patient Service
 * Handles patient-specific functionality including eligibility verification,
 * cost estimation, consent management, and patient communication
 */

// Dependencies
const Document = require('../models/documentModel');
const Appeal = require('../models/appealModel');
const logger = require('../utils/logger');
const axios = require('axios');

/**
 * Verify patient insurance eligibility
 * @param {Object} patientInfo - Patient demographic and insurance information
 * @param {Object} serviceInfo - Information about the service being checked
 * @returns {Object} Eligibility details
 */
const verifyEligibility = async (patientInfo, serviceInfo) => {
  try {
    logger.info('Verifying patient eligibility');
    
    // In production, this would connect to a clearinghouse or payer API
    // For simulation, we'll provide sample responses
    
    // Destructure required fields from input
    const { 
      memberId, 
      subscriberId = memberId,
      dateOfBirth, 
      firstName, 
      lastName, 
      insuranceCarrier, 
      groupNumber 
    } = patientInfo;
    
    const { 
      serviceType, 
      diagnosisCodes = [], 
      procedureCodes = [], 
      serviceDate = new Date() 
    } = serviceInfo;
    
    // Validate required fields
    if (!memberId || !insuranceCarrier) {
      throw new Error('Member ID and insurance carrier are required for eligibility verification');
    }
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate sample response based on input
    const eligibilityResponse = {
      status: 'active',
      verificationDate: new Date(),
      planInformation: {
        planName: `${insuranceCarrier} ${serviceType === 'inpatient' ? 'Hospital' : 'Medical'} Plan`,
        planType: getRandomPlanType(),
        effectiveDate: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
        terminationDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        groupName: groupNumber ? `Group #${groupNumber}` : 'Individual Plan'
      },
      benefitInformation: {
        inNetwork: {
          deductible: {
            individual: getRandomAmount(500, 3000),
            family: getRandomAmount(1000, 9000),
            remaining: getRandomAmount(0, 2000)
          },
          outOfPocketMax: {
            individual: getRandomAmount(3000, 8000),
            family: getRandomAmount(6000, 16000),
            remaining: getRandomAmount(1000, 7000)
          },
          coinsurance: getRandomCoinsurance(),
          copay: getRandomCopay(serviceType)
        },
        outOfNetwork: {
          deductible: {
            individual: getRandomAmount(1000, 6000),
            family: getRandomAmount(2000, 12000),
            remaining: getRandomAmount(500, 5000)
          },
          outOfPocketMax: {
            individual: getRandomAmount(6000, 15000),
            family: getRandomAmount(12000, 30000),
            remaining: getRandomAmount(3000, 12000)
          },
          coinsurance: getRandomOutOfNetworkCoinsurance(),
          copay: null
        }
      },
      serviceCoverage: {
        isServiceCovered: getIsCovered(procedureCodes, diagnosisCodes),
        authorizationRequired: getAuthorizationRequired(procedureCodes, serviceType),
        limitations: getServiceLimitations(procedureCodes, serviceType),
        benefitNotes: generateBenefitNotes(insuranceCarrier, serviceType)
      },
      referralRequired: getReferralRequired(insuranceCarrier, serviceType),
      additionalVerificationDetails: {
        operatorId: generateRandomId(8),
        referenceNumber: generateRandomId(12),
        callDateTime: new Date(),
        disclaimer: 'Verification of eligibility is not a guarantee of payment.'
      }
    };
    
    return {
      success: true,
      data: eligibilityResponse
    };
    
  } catch (error) {
    logger.error(`Error verifying eligibility: ${error.message}`);
    return {
      success: false,
      error: error.message || 'Failed to verify eligibility',
      errorDetails: error
    };
  }
};

/**
 * Estimate patient cost for a particular service or appeal
 * @param {Object} eligibilityData - Patient eligibility information
 * @param {Object} serviceInfo - Service or procedure information
 * @param {Object} appealInfo - Optional appeal details if estimating post-appeal costs
 * @returns {Object} Cost estimate details
 */
const estimatePatientCost = async (eligibilityData, serviceInfo, appealInfo = null) => {
  try {
    logger.info('Generating patient cost estimate');
    
    // In production, this would use real payer contracts and fee schedules
    // For simulation, we'll calculate based on provided info
    
    // Destructure service info
    const { 
      procedureCodes = [], 
      modifier = '',
      quantity = 1,
      facilityType = 'outpatient',
      providerStatus = 'inNetwork',
      billedAmount,
      estimatedAmount
    } = serviceInfo;
    
    // Set the base amount (either provided or generated)
    const baseAmount = billedAmount || estimatedAmount || generateEstimatedAmount(procedureCodes, facilityType);
    
    // Get benefit information based on network status
    const benefitInfo = providerStatus === 'inNetwork' 
      ? eligibilityData.benefitInformation.inNetwork 
      : eligibilityData.benefitInformation.outOfNetwork;
    
    // Calculate estimated patient responsibility
    const deductibleRemaining = benefitInfo.deductible.remaining;
    const coinsuranceRate = benefitInfo.coinsurance / 100; // Convert percentage to decimal
    const copayAmount = benefitInfo.copay || 0;
    
    // Apply deductible first
    let patientResponsibility = Math.min(deductibleRemaining, baseAmount);
    let remainingAmount = baseAmount - patientResponsibility;
    
    // Then apply coinsurance to the remainder
    patientResponsibility += remainingAmount * coinsuranceRate;
    
    // Add copay if applicable
    patientResponsibility += copayAmount;
    
    // Apply out-of-pocket maximum if necessary
    const oopRemaining = benefitInfo.outOfPocketMax.remaining;
    patientResponsibility = Math.min(patientResponsibility, oopRemaining);
    
    // Calculate insurer responsibility
    const insurerResponsibility = baseAmount - patientResponsibility;
    
    // Create detailed breakdown
    const costBreakdown = {
      billedAmount: baseAmount,
      allowedAmount: getEstimatedAllowedAmount(baseAmount, providerStatus, eligibilityData.planInformation.planType),
      deductibleApplied: Math.min(deductibleRemaining, baseAmount),
      coinsuranceAmount: remainingAmount * coinsuranceRate,
      copayAmount: copayAmount,
      patientResponsibility: patientResponsibility,
      insurerResponsibility: insurerResponsibility
    };
    
    // If this is for an appeal, calculate potential savings
    const appealDetails = appealInfo ? {
      deniedAmount: baseAmount - (appealInfo.initiallyPaid || 0),
      appealType: appealInfo.appealType,
      successProbability: appealInfo.successProbability || 0.6,
      potentialRecovery: calculatePotentialRecovery(baseAmount, appealInfo),
      estimatedTimeToResolution: estimateResolutionTime(appealInfo.appealType),
      recommendedAction: determineRecommendedAction(baseAmount, appealInfo)
    } : null;
    
    return {
      success: true,
      data: {
        estimateDate: new Date(),
        estimateExpiryDate: new Date(new Date().setDate(new Date().getDate() + 30)),
        baseAmount: baseAmount,
        patientResponsibility: patientResponsibility,
        insurerResponsibility: insurerResponsibility,
        detailedBreakdown: costBreakdown,
        providerStatus: providerStatus,
        appealDetails: appealDetails,
        estimateDisclaimer: 'This estimate is based on current benefit information and is not a guarantee of payment.'
      }
    };
    
  } catch (error) {
    logger.error(`Error estimating patient cost: ${error.message}`);
    return {
      success: false,
      error: error.message || 'Failed to generate cost estimate',
      errorDetails: error
    };
  }
};

/**
 * Record patient consent for appeals processing
 * @param {string} appealId - Appeal ID
 * @param {Object} consentInfo - Consent information
 * @returns {Object} Consent record result
 */
const recordPatientConsent = async (appealId, consentInfo) => {
  try {
    logger.info(`Recording patient consent for appeal ${appealId}`);
    
    // Find the appeal
    const appeal = await Appeal.findById(appealId);
    if (!appeal) {
      throw new Error('Appeal not found');
    }
    
    // Destructure consent information
    const { 
      consentObtained,
      consentDate,
      consentMethod,
      expirationDate,
      consentVerifiedBy,
      dataSharePermissions
    } = consentInfo;
    
    // Update the appeal with consent information
    appeal.patientConsent = {
      consentObtained,
      consentDate: consentDate || new Date(),
      consentMethod,
      expirationDate: expirationDate || new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      consentVerifiedBy,
      dataSharePermissions: dataSharePermissions || {
        allowProviderShare: true,
        allowInsurerShare: true,
        allowExternalReviewShare: true
      }
    };
    
    // Add a timeline entry
    appeal.timeline.push({
      date: new Date(),
      status: 'consent_recorded',
      description: `Patient consent recorded via ${consentMethod}`
    });
    
    // Save the updated appeal
    await appeal.save();
    
    return {
      success: true,
      consentId: appeal._id,
      consentDate: appeal.patientConsent.consentDate,
      expirationDate: appeal.patientConsent.expirationDate,
      consentMethod: appeal.patientConsent.consentMethod
    };
    
  } catch (error) {
    logger.error(`Error recording patient consent: ${error.message}`);
    return {
      success: false,
      error: error.message || 'Failed to record patient consent',
      errorDetails: error
    };
  }
};

/**
 * Generate patient-friendly appeal status updates
 * @param {string} appealId - Appeal ID
 * @param {string} language - Preferred language for updates
 * @returns {Object} Formatted status update
 */
const generatePatientStatusUpdate = async (appealId, language = 'English') => {
  try {
    logger.info(`Generating patient status update for appeal ${appealId}`);
    
    // Find the appeal with related document
    const appeal = await Appeal.findById(appealId).populate('relatedDocument');
    if (!appeal) {
      throw new Error('Appeal not found');
    }
    
    // Get appeal status and relevant dates
    const status = appeal.status;
    const createdDate = appeal.createdAt;
    const submissionDate = appeal.submissionDetails?.submittedDate;
    const responseDate = appeal.outcomeDetails?.responseDate;
    
    // Format dates based on language preference
    const dateFormat = language === 'English' ? 'en-US' : 'es-US';
    const formatDate = (date) => date ? new Date(date).toLocaleDateString(dateFormat, { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }) : null;
    
    // Calculate days in each stage
    const daysInGeneration = submissionDate ? 
      Math.round((new Date(submissionDate) - new Date(createdDate)) / (1000 * 60 * 60 * 24)) : 
      Math.round((new Date() - new Date(createdDate)) / (1000 * 60 * 60 * 24));
      
    const daysInReview = responseDate && submissionDate ? 
      Math.round((new Date(responseDate) - new Date(submissionDate)) / (1000 * 60 * 60 * 24)) : 
      (submissionDate ? Math.round((new Date() - new Date(submissionDate)) / (1000 * 60 * 60 * 24)) : 0);
      
    // Get appeal amount if available  
    const appealAmount = appeal.denialInfo?.deniedAmount || 'unknown amount';
    
    // Get next steps based on status
    const nextSteps = getNextStepsForPatient(status, appeal, language);
    
    // Generate status message based on language
    let statusMessage;
    if (language === 'English') {
      statusMessage = getEnglishStatusMessage(status, appeal, formatDate);
    } else if (language === 'Spanish') {
      statusMessage = getSpanishStatusMessage(status, appeal, formatDate);
    } else {
      statusMessage = getEnglishStatusMessage(status, appeal, formatDate);
    }
    
    // Compile status update
    const statusUpdate = {
      appealId: appeal._id,
      patientName: appeal.relatedDocument?.extractedData?.patientName || 'Patient',
      currentStatus: status,
      statusMessage: statusMessage,
      lastUpdated: formatDate(appeal.updatedAt),
      timeline: {
        created: formatDate(appeal.createdAt),
        submitted: formatDate(submissionDate),
        responded: formatDate(responseDate)
      },
      metrics: {
        daysInGeneration,
        daysInReview,
        totalDays: daysInGeneration + daysInReview
      },
      nextSteps: nextSteps,
      appealAmount: appealAmount,
      estimatedTimeToResolution: getEstimatedTimeToResolution(status, appeal),
      suggestedActions: getSuggestedPatientActions(status, appeal, language)
    };
    
    return {
      success: true,
      data: statusUpdate
    };
    
  } catch (error) {
    logger.error(`Error generating patient status update: ${error.message}`);
    return {
      success: false,
      error: error.message || 'Failed to generate patient status update',
      errorDetails: error
    };
  }
};

// Helper functions

// Get random plan type for eligibility simulation
const getRandomPlanType = () => {
  const planTypes = ['PPO', 'HMO', 'EPO', 'POS', 'HDHP', 'Medicare Advantage', 'Medicaid Managed'];
  return planTypes[Math.floor(Math.random() * planTypes.length)];
};

// Generate random amount within range for simulated benefits
const getRandomAmount = (min, max) => {
  return Math.round((Math.random() * (max - min) + min) / 100) * 100; // Round to nearest 100
};

// Generate random coinsurance percentage
const getRandomCoinsurance = () => {
  const options = [10, 15, 20, 30, 40];
  return options[Math.floor(Math.random() * options.length)];
};

// Generate random out-of-network coinsurance
const getRandomOutOfNetworkCoinsurance = () => {
  const options = [30, 40, 50, 60];
  return options[Math.floor(Math.random() * options.length)];
};

// Generate random copay based on service type
const getRandomCopay = (serviceType) => {
  switch (serviceType) {
    case 'primary':
      return getRandomAmount(20, 50);
    case 'specialist':
      return getRandomAmount(40, 80);
    case 'emergency':
      return getRandomAmount(150, 300);
    case 'inpatient':
      return getRandomAmount(250, 500);
    case 'outpatient':
      return getRandomAmount(100, 250);
    case 'diagnostic':
      return getRandomAmount(40, 100);
    default:
      return getRandomAmount(30, 60);
  }
};

// Determine if service is covered based on codes
const getIsCovered = (procedureCodes, diagnosisCodes) => {
  // For simulation, most codes will be covered
  return Math.random() > 0.1; // 90% coverage rate
};

// Determine if authorization is required
const getAuthorizationRequired = (procedureCodes, serviceType) => {
  if (serviceType === 'inpatient' || serviceType === 'outpatient') {
    return true;
  }
  
  // For simulation, some procedures require authorization
  return Math.random() > 0.6; // 40% require authorization
};

// Generate service limitations
const getServiceLimitations = (procedureCodes, serviceType) => {
  const limitations = [];
  
  if (serviceType === 'physical_therapy') {
    limitations.push('20 visits per calendar year');
  }
  
  if (serviceType === 'mental_health') {
    limitations.push('30 visits per calendar year');
  }
  
  if (Math.random() > 0.7) {
    limitations.push('Frequency limitation may apply');
  }
  
  return limitations;
};

// Generate benefit notes
const generateBenefitNotes = (insuranceCarrier, serviceType) => {
  return `Benefits verified for ${serviceType} services with ${insuranceCarrier}. This verification is not a guarantee of payment.`;
};

// Determine if referral is required
const getReferralRequired = (insuranceCarrier, serviceType) => {
  if (insuranceCarrier.toLowerCase().includes('hmo')) {
    return true;
  }
  
  if (serviceType === 'specialist') {
    return Math.random() > 0.5; // 50% chance for specialists
  }
  
  return false;
};

// Generate random ID
const generateRandomId = (length) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// Generate estimated amount for a service
const generateEstimatedAmount = (procedureCodes, facilityType) => {
  // In a real system, this would use fee schedules
  // For simulation, generate based on facility type
  
  let baseAmount;
  
  switch (facilityType) {
    case 'inpatient':
      baseAmount = getRandomAmount(5000, 30000);
      break;
    case 'outpatient':
      baseAmount = getRandomAmount(1000, 8000);
      break;
    case 'office':
      baseAmount = getRandomAmount(100, 1500);
      break;
    case 'emergency':
      baseAmount = getRandomAmount(1500, 12000);
      break;
    default:
      baseAmount = getRandomAmount(500, 5000);
  }
  
  return baseAmount;
};

// Calculate estimated allowed amount
const getEstimatedAllowedAmount = (billedAmount, providerStatus, planType) => {
  let discountRate;
  
  if (providerStatus === 'inNetwork') {
    // Network discounts vary by plan type
    switch (planType) {
      case 'HMO':
        discountRate = 0.6; // 60% discount
        break;
      case 'PPO':
        discountRate = 0.5; // 50% discount
        break;
      case 'HDHP':
        discountRate = 0.45; // 45% discount
        break;
      case 'Medicare Advantage':
        discountRate = 0.7; // 70% discount
        break;
      default:
        discountRate = 0.55; // 55% discount
    }
  } else {
    // Out of network has lower discounts
    discountRate = 0.2; // 20% discount
  }
  
  return Math.round(billedAmount * (1 - discountRate));
};

// Calculate potential recovery for an appeal
const calculatePotentialRecovery = (baseAmount, appealInfo) => {
  const { successProbability = 0.6, appealType } = appealInfo;
  let recoveryRate;
  
  // Different appeal types have different recovery rates
  switch (appealType) {
    case 'medicalNecessity':
      recoveryRate = 0.7;
      break;
    case 'codingError':
      recoveryRate = 0.9;
      break;
    case 'outOfNetwork':
      recoveryRate = 0.6;
      break;
    case 'priorAuthorization':
      recoveryRate = 0.5;
      break;
    case 'clinicalTrial':
      recoveryRate = 0.75;
      break;
    default:
      recoveryRate = 0.65;
  }
  
  // Calculate expected value of appeal
  return Math.round(baseAmount * recoveryRate * successProbability);
};

// Estimate time to resolution based on appeal type
const estimateResolutionTime = (appealType) => {
  // Return days to resolution
  switch (appealType) {
    case 'medicalNecessity':
      return 45;
    case 'codingError':
      return 30;
    case 'outOfNetwork':
      return 60;
    case 'priorAuthorization':
      return 45;
    case 'urgencyOverride':
      return 15;
    case 'clinicalTrial':
      return 60;
    default:
      return 45;
  }
};

// Determine if appeal is recommended based on factors
const determineRecommendedAction = (amount, appealInfo) => {
  const { successProbability, appealType } = appealInfo;
  
  // High-value appeals almost always recommended
  if (amount > 5000) {
    return 'appeal_highly_recommended';
  }
  
  // Low-value appeals with low success probability not recommended
  if (amount < 500 && successProbability < 0.4) {
    return 'appeal_not_recommended';
  }
  
  // Coding errors usually worth appealing
  if (appealType === 'codingError') {
    return 'appeal_recommended';
  }
  
  // Default to maybe
  return 'appeal_may_be_worthwhile';
};

// Get patient-friendly next steps based on appeal status
const getNextStepsForPatient = (status, appeal, language) => {
  if (language === 'English') {
    switch (status) {
      case 'draft':
        return ['Your appeal is being prepared. No action is needed at this time.'];
      case 'generated':
        return ['Your appeal letter has been generated and is ready for review.', 'Your healthcare provider will submit the appeal soon.'];
      case 'pending':
        return ['Your appeal has been prepared but not yet submitted. Watch for updates soon.'];
      case 'submitted':
        return ['Your appeal has been submitted to your insurance company.', 'The insurance company typically takes 30-60 days to respond.'];
      case 'responded':
        return ['Your insurance company has responded to your appeal.', 'Check the outcome details for more information.'];
      case 'approved':
        return ['Good news! Your appeal has been approved.', 'Your insurance will process payment according to your benefits.'];
      case 'denied':
        return ['Unfortunately, your appeal was denied.', 'You may have options for further appeal or external review.'];
      case 'closed':
        return ['This appeal process has been completed.'];
      default:
        return ['Check back for updates on your appeal status.'];
    }
  } else if (language === 'Spanish') {
    switch (status) {
      case 'draft':
        return ['Su apelación está siendo preparada. No se necesita ninguna acción en este momento.'];
      case 'generated':
        return ['Su carta de apelación ha sido generada y está lista para revisión.', 'Su proveedor de atención médica enviará la apelación pronto.'];
      case 'pending':
        return ['Su apelación ha sido preparada pero aún no ha sido enviada. Esté atento a las actualizaciones pronto.'];
      case 'submitted':
        return ['Su apelación ha sido enviada a su compañía de seguros.', 'La compañía de seguros generalmente tarda de 30 a 60 días en responder.'];
      case 'responded':
        return ['Su compañía de seguros ha respondido a su apelación.', 'Consulte los detalles del resultado para obtener más información.'];
      case 'approved':
        return ['¡Buenas noticias! Su apelación ha sido aprobada.', 'Su seguro procesará el pago de acuerdo con sus beneficios.'];
      case 'denied':
        return ['Desafortunadamente, su apelación fue denegada.', 'Es posible que tenga opciones para una apelación adicional o una revisión externa.'];
      case 'closed':
        return ['Este proceso de apelación ha sido completado.'];
      default:
        return ['Consulte las actualizaciones sobre el estado de su apelación.'];
    }
  } else {
    return getNextStepsForPatient(status, appeal, 'English');
  }
};

// Get English status message for patient
const getEnglishStatusMessage = (status, appeal, formatDate) => {
  switch (status) {
    case 'draft':
      return `Your appeal is currently being drafted by your healthcare provider. It was started on ${formatDate(appeal.createdAt)}.`;
    case 'generated':
      return `Your appeal letter has been generated on ${formatDate(appeal.createdAt)} and is ready for submission.`;
    case 'pending':
      return `Your appeal has been prepared but is pending submission to your insurance company.`;
    case 'submitted':
      return `Your appeal was submitted to your insurance company on ${formatDate(appeal.submissionDetails?.submittedDate)}. We are awaiting their response.`;
    case 'responded':
      return `Your insurance company responded to your appeal on ${formatDate(appeal.outcomeDetails?.responseDate)}.`;
    case 'approved':
      return `Great news! Your appeal was approved on ${formatDate(appeal.outcomeDetails?.responseDate)}. Your insurance will process payment according to your benefits.`;
    case 'denied':
      return `We regret to inform you that your appeal was denied on ${formatDate(appeal.outcomeDetails?.responseDate)}. You may have options for further appeal.`;
    case 'closed':
      return `This appeal process has been completed and closed on ${formatDate(appeal.updatedAt)}.`;
    default:
      return `Your appeal is being processed. Current status: ${status}.`;
  }
};

// Get Spanish status message for patient
const getSpanishStatusMessage = (status, appeal, formatDate) => {
  switch (status) {
    case 'draft':
      return `Su apelación está siendo redactada por su proveedor de atención médica. Se inició el ${formatDate(appeal.createdAt)}.`;
    case 'generated':
      return `Su carta de apelación ha sido generada el ${formatDate(appeal.createdAt)} y está lista para ser enviada.`;
    case 'pending':
      return `Su apelación ha sido preparada pero está pendiente de envío a su compañía de seguros.`;
    case 'submitted':
      return `Su apelación fue enviada a su compañía de seguros el ${formatDate(appeal.submissionDetails?.submittedDate)}. Estamos esperando su respuesta.`;
    case 'responded':
      return `Su compañía de seguros respondió a su apelación el ${formatDate(appeal.outcomeDetails?.responseDate)}.`;
    case 'approved':
      return `¡Buenas noticias! Su apelación fue aprobada el ${formatDate(appeal.outcomeDetails?.responseDate)}. Su seguro procesará el pago de acuerdo con sus beneficios.`;
    case 'denied':
      return `Lamentamos informarle que su apelación fue denegada el ${formatDate(appeal.outcomeDetails?.responseDate)}. Es posible que tenga opciones para una apelación adicional.`;
    case 'closed':
      return `Este proceso de apelación ha sido completado y cerrado el ${formatDate(appeal.updatedAt)}.`;
    default:
      return `Su apelación está siendo procesada. Estado actual: ${status}.`;
  }
};

// Get estimated time to resolution
const getEstimatedTimeToResolution = (status, appeal) => {
  switch (status) {
    case 'draft':
    case 'generated':
    case 'pending':
      return '30-60 days';
    case 'submitted':
      // Calculate based on submission date
      const submissionDate = appeal.submissionDetails?.submittedDate;
      if (submissionDate) {
        const daysElapsed = Math.round((new Date() - new Date(submissionDate)) / (1000 * 60 * 60 * 24));
        return daysElapsed > 30 ? '1-30 days' : '15-45 days';
      }
      return '30-60 days';
    case 'responded':
    case 'approved':
    case 'denied':
    case 'closed':
      return 'Complete';
    default:
      return 'Unknown';
  }
};

// Get suggested actions for patient
const getSuggestedPatientActions = (status, appeal, language) => {
  const actions = [];
  
  if (language === 'English') {
    switch (status) {
      case 'draft':
      case 'generated':
        actions.push('Check with your provider if additional information is needed.');
        break;
      case 'pending':
        actions.push('Confirm with your provider that all necessary documents have been submitted.');
        break;
      case 'submitted':
        actions.push('No action needed at this time. Check back for updates.');
        break;
      case 'responded':
        // Add different actions based on decision
        if (appeal.outcomeDetails?.decision === 'denied') {
          actions.push('Contact your provider to discuss next steps and possible further appeals.');
        } else if (appeal.outcomeDetails?.decision === 'approved') {
          actions.push('No further action needed. Check your explanation of benefits when received.');
        }
        break;
      case 'denied':
        // Check if external review is available
        if (appeal.externalReview?.isEligibleForExternalReview) {
          actions.push('Ask your provider about requesting an external review of your case.');
        }
        actions.push('Contact your provider to discuss alternative payment options if needed.');
        break;
      default:
        actions.push('Contact your provider with any questions about your appeal.');
    }
  } else if (language === 'Spanish') {
    switch (status) {
      case 'draft':
      case 'generated':
        actions.push('Consulte con su proveedor si se necesita información adicional.');
        break;
      case 'pending':
        actions.push('Confirme con su proveedor que se han enviado todos los documentos necesarios.');
        break;
      case 'submitted':
        actions.push('No se necesita ninguna acción en este momento. Vuelva a consultar para ver las actualizaciones.');
        break;
      case 'responded':
        // Add different actions based on decision
        if (appeal.outcomeDetails?.decision === 'denied') {
          actions.push('Comuníquese con su proveedor para discutir los próximos pasos y posibles apelaciones adicionales.');
        } else if (appeal.outcomeDetails?.decision === 'approved') {
          actions.push('No se necesita ninguna acción adicional. Verifique su explicación de beneficios cuando la reciba.');
        }
        break;
      case 'denied':
        // Check if external review is available
        if (appeal.externalReview?.isEligibleForExternalReview) {
          actions.push('Pregúntele a su proveedor sobre cómo solicitar una revisión externa de su caso.');
        }
        actions.push('Comuníquese con su proveedor para discutir opciones de pago alternativas si es necesario.');
        break;
      default:
        actions.push('Comuníquese con su proveedor si tiene alguna pregunta sobre su apelación.');
    }
  } else {
    return getSuggestedPatientActions(status, appeal, 'English');
  }
  
  return actions;
};

module.exports = {
  verifyEligibility,
  estimatePatientCost,
  recordPatientConsent,
  generatePatientStatusUpdate
};