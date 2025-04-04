/**
 * Provider Collaboration Service
 * 
 * Handles integration with provider systems, EHRs, and provider-submitted
 * documentation to strengthen appeals
 */

const mongoose = require('mongoose');
const Appeal = require('../models/appealModel');
const Patient = require('../models/patientModel');
const logger = require('../utils/logger');
const { uploadDocument } = require('./documentService');

/**
 * Create a new provider collaboration request
 * 
 * @param {Object} appealId - The appeal ID
 * @param {Object} requestData - Data for the collaboration request
 * @returns {Object} The created collaboration request
 */
async function createCollaborationRequest(appealId, requestData) {
  try {
    logger.info('Creating provider collaboration request', { appealId });
    
    // Find the appeal
    const appeal = await Appeal.findById(appealId).populate('patient');
    if (!appeal) {
      return {
        success: false,
        message: `No appeal found with ID ${appealId}`
      };
    }
    
    // Create collaboration request record
    const collaborationRequest = {
      requestDate: new Date(),
      status: 'pending',
      requestType: requestData.requestType || 'documentation',
      message: requestData.message || 'Please provide supporting documentation for this appeal',
      requestedItems: requestData.requestedItems || [],
      responseDeadline: requestData.responseDeadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      providerEmail: requestData.providerEmail,
      providerPhone: requestData.providerPhone,
      providerPortalLink: generateProviderLink(appeal._id, appeal.patient._id)
    };
    
    // Add collaboration request to appeal
    if (!appeal.collaborationRequests) {
      appeal.collaborationRequests = [];
    }
    
    appeal.collaborationRequests.push(collaborationRequest);
    await appeal.save();
    
    // Send notification to provider if email is available
    if (requestData.providerEmail) {
      await sendProviderNotification(requestData.providerEmail, collaborationRequest, appeal, appeal.patient);
    }
    
    return {
      success: true,
      collaborationRequest,
      message: 'Collaboration request created successfully'
    };
  } catch (error) {
    logger.error('Error creating collaboration request:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Generate secure provider access link
 * 
 * @param {String} appealId - Appeal ID
 * @param {String} patientId - Patient ID
 * @returns {String} Secure provider link
 */
function generateProviderLink(appealId, patientId) {
  // In production, this would generate a secure, time-limited token
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const token = Buffer.from(`${appealId}:${patientId}:${Date.now()}`).toString('base64');
  return `${baseUrl}/provider/document-upload/${token}`;
}

/**
 * Send notification to provider
 * 
 * @param {String} email - Provider email
 * @param {Object} request - Collaboration request
 * @param {Object} appeal - Appeal object
 * @param {Object} patient - Patient object
 */
async function sendProviderNotification(email, request, appeal, patient) {
  // This would be implemented with your email service provider
  logger.info(`Provider notification would be sent to ${email} for appeal ${appeal._id}`);
  
  // Mock implementation
  return {
    success: true,
    message: `Notification sent to ${email}`
  };
}

/**
 * Process provider documentation submission
 * 
 * @param {Object} files - Uploaded files
 * @param {String} appealId - Appeal ID 
 * @param {String} providerNotes - Provider notes
 * @param {String} documentTypes - Types of documents
 * @returns {Object} Processing result
 */
async function processProviderSubmission(files, appealId, providerNotes, documentTypes = []) {
  try {
    logger.info('Processing provider submission', { appealId });
    
    // Find the appeal
    const appeal = await Appeal.findById(appealId);
    if (!appeal) {
      return {
        success: false,
        message: `No appeal found with ID ${appealId}`
      };
    }
    
    // Upload and process each file
    const uploadedDocuments = [];
    
    for (const file of files) {
      // Determine document type from provided types or default to 'medical_record'
      const documentType = documentTypes[uploadedDocuments.length] || 'medical_record';
      
      // Save document to storage
      const document = await uploadDocument(file, {
        documentType: documentType,
        patientId: appeal.patient,
        metadata: {
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          providerSubmitted: true,
          providerNotes: providerNotes
        }
      });
      
      // Add document to appeal
      appeal.documents.push({
        documentId: document.id,
        documentType: documentType,
        name: file.originalname,
        path: document.path,
        uploadDate: new Date(),
        providerSubmitted: true
      });
      
      uploadedDocuments.push(document);
    }
    
    // Update last activity on appeal
    appeal.lastActivity = {
      date: new Date(),
      action: 'provider_documentation_added',
      details: `Provider submitted ${uploadedDocuments.length} document(s)`
    };
    
    // Update collaboration request status if found
    if (appeal.collaborationRequests && appeal.collaborationRequests.length > 0) {
      const pendingRequest = appeal.collaborationRequests.find(req => req.status === 'pending');
      if (pendingRequest) {
        pendingRequest.status = 'completed';
        pendingRequest.responseDate = new Date();
        pendingRequest.responseNotes = providerNotes;
      }
    }
    
    await appeal.save();
    
    return {
      success: true,
      uploadedDocuments,
      appeal,
      message: `Successfully processed ${uploadedDocuments.length} documents from provider`
    };
  } catch (error) {
    logger.error('Error processing provider submission:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Fetch clinical data from EHR system
 * 
 * @param {String} appealId - Appeal ID
 * @param {Object} ehrConnection - EHR connection details
 * @param {Array} dataTypes - Types of data to fetch
 * @returns {Object} Fetched clinical data
 */
async function fetchEHRData(appealId, ehrConnection, dataTypes = ['diagnoses', 'medications', 'labs', 'vitals']) {
  try {
    logger.info('Fetching EHR data', { appealId, dataTypes });
    
    // Find the appeal
    const appeal = await Appeal.findById(appealId).populate('patient');
    if (!appeal) {
      return {
        success: false,
        message: `No appeal found with ID ${appealId}`
      };
    }
    
    // In a real implementation, this would connect to an EHR API
    // using FHIR, HL7, or a vendor-specific API
    
    // Mock implementation for development
    const mockEHRData = generateMockEHRData(appeal.patient, dataTypes);
    
    // Save the EHR data to the appeal
    if (!appeal.clinicalData) {
      appeal.clinicalData = {};
    }
    
    dataTypes.forEach(type => {
      if (mockEHRData[type]) {
        appeal.clinicalData[type] = mockEHRData[type];
      }
    });
    
    // Update last activity
    appeal.lastActivity = {
      date: new Date(),
      action: 'ehr_data_imported',
      details: `Imported clinical data: ${dataTypes.join(', ')}`
    };
    
    await appeal.save();
    
    return {
      success: true,
      clinicalData: mockEHRData,
      message: 'Successfully imported clinical data from EHR'
    };
  } catch (error) {
    logger.error('Error fetching EHR data:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Generate mock EHR data for development
 * 
 * @param {Object} patient - Patient object
 * @param {Array} dataTypes - Types of data to generate
 * @returns {Object} Mock EHR data
 */
function generateMockEHRData(patient, dataTypes) {
  const mockData = {};
  
  if (dataTypes.includes('diagnoses')) {
    mockData.diagnoses = [
      {
        code: 'I63.9',
        description: 'Cerebral infarction, unspecified',
        date: new Date('2023-06-01'),
        status: 'active',
        provider: 'Dr. Sarah Johnson'
      },
      {
        code: 'I10',
        description: 'Essential (primary) hypertension',
        date: new Date('2023-01-15'),
        status: 'active',
        provider: 'Dr. Sarah Johnson'
      },
      {
        code: 'E11.9',
        description: 'Type 2 diabetes mellitus without complications',
        date: new Date('2022-08-22'),
        status: 'active',
        provider: 'Dr. Michael Chen'
      }
    ];
  }
  
  if (dataTypes.includes('medications')) {
    mockData.medications = [
      {
        name: 'Aspirin',
        dosage: '81mg',
        frequency: 'Once daily',
        startDate: new Date('2023-06-02'),
        endDate: null,
        status: 'active',
        prescriber: 'Dr. Sarah Johnson'
      },
      {
        name: 'Atorvastatin',
        dosage: '40mg',
        frequency: 'Once daily',
        startDate: new Date('2023-06-02'),
        endDate: null,
        status: 'active',
        prescriber: 'Dr. Sarah Johnson'
      },
      {
        name: 'Metoprolol',
        dosage: '25mg',
        frequency: 'Twice daily',
        startDate: new Date('2023-06-02'),
        endDate: null,
        status: 'active',
        prescriber: 'Dr. Sarah Johnson'
      }
    ];
  }
  
  if (dataTypes.includes('labs')) {
    mockData.labs = [
      {
        name: 'Complete Blood Count (CBC)',
        date: new Date('2023-06-02'),
        results: [
          { name: 'WBC', value: '8.2', unit: 'K/uL', reference: '4.5-11.0' },
          { name: 'RBC', value: '4.8', unit: 'M/uL', reference: '4.5-5.9' },
          { name: 'Hemoglobin', value: '13.8', unit: 'g/dL', reference: '13.5-17.5' },
          { name: 'Hematocrit', value: '42', unit: '%', reference: '41-50' },
          { name: 'Platelets', value: '210', unit: 'K/uL', reference: '150-400' }
        ],
        provider: 'Dr. Sarah Johnson'
      },
      {
        name: 'Basic Metabolic Panel (BMP)',
        date: new Date('2023-06-02'),
        results: [
          { name: 'Sodium', value: '138', unit: 'mmol/L', reference: '135-145' },
          { name: 'Potassium', value: '4.2', unit: 'mmol/L', reference: '3.5-5.0' },
          { name: 'Chloride', value: '102', unit: 'mmol/L', reference: '98-107' },
          { name: 'CO2', value: '24', unit: 'mmol/L', reference: '23-29' },
          { name: 'BUN', value: '15', unit: 'mg/dL', reference: '7-20' },
          { name: 'Creatinine', value: '0.9', unit: 'mg/dL', reference: '0.6-1.2' },
          { name: 'Glucose', value: '110', unit: 'mg/dL', reference: '70-99', flag: 'High' }
        ],
        provider: 'Dr. Sarah Johnson'
      }
    ];
  }
  
  if (dataTypes.includes('vitals')) {
    mockData.vitals = [
      {
        date: new Date('2023-06-08'),
        readings: [
          { name: 'Blood Pressure', value: '138/88', unit: 'mmHg' },
          { name: 'Heart Rate', value: '78', unit: 'bpm' },
          { name: 'Respiratory Rate', value: '16', unit: 'breaths/min' },
          { name: 'Temperature', value: '98.6', unit: 'F' },
          { name: 'SpO2', value: '97', unit: '%' }
        ],
        provider: 'Emily Williams, RN'
      },
      {
        date: new Date('2023-06-04'),
        readings: [
          { name: 'Blood Pressure', value: '142/90', unit: 'mmHg' },
          { name: 'Heart Rate', value: '82', unit: 'bpm' },
          { name: 'Respiratory Rate', value: '18', unit: 'breaths/min' },
          { name: 'Temperature', value: '98.8', unit: 'F' },
          { name: 'SpO2', value: '96', unit: '%' }
        ],
        provider: 'Robert Thompson, RN'
      }
    ];
  }
  
  if (dataTypes.includes('imaging')) {
    mockData.imaging = [
      {
        type: 'CT Scan',
        bodyPart: 'Head',
        date: new Date('2023-06-01'),
        findings: 'Acute infarct in the territory of the right middle cerebral artery. No evidence of hemorrhage.',
        impression: 'Acute ischemic stroke, right MCA territory.',
        provider: 'Dr. James Wilson'
      },
      {
        type: 'MRI',
        bodyPart: 'Brain',
        date: new Date('2023-06-02'),
        findings: 'Confirmed right MCA territory infarct involving the right parietal lobe. No evidence of hemorrhagic transformation.',
        impression: 'Acute to subacute right MCA ischemic stroke.',
        provider: 'Dr. James Wilson'
      }
    ];
  }
  
  if (dataTypes.includes('procedures')) {
    mockData.procedures = [
      {
        name: 'Tissue Plasminogen Activator (tPA) administration',
        date: new Date('2023-06-01'),
        provider: 'Dr. Sarah Johnson',
        notes: 'Patient received IV tPA within 3 hours of symptom onset. No complications during administration.'
      },
      {
        name: 'Carotid Doppler Ultrasound',
        date: new Date('2023-06-03'),
        provider: 'Dr. Elizabeth Roberts',
        notes: 'Moderate stenosis of right internal carotid artery (approximately 50-69%). Left carotid artery without significant stenosis.'
      }
    ];
  }
  
  if (dataTypes.includes('notes')) {
    mockData.notes = [
      {
        type: 'Progress Note',
        date: new Date('2023-06-05'),
        provider: 'Dr. Sarah Johnson',
        content: 'Patient continues to show improvement in right-sided weakness. Speech remains slightly slurred but improved from admission. Patient able to ambulate with assistance. Plan to continue current medications and physical therapy.'
      },
      {
        type: 'PT Evaluation',
        date: new Date('2023-06-03'),
        provider: 'Jason Martinez, PT',
        content: 'Patient presents with right-sided hemiparesis, more pronounced in upper extremity. Strength 3/5 in right arm, 4/5 in right leg. Decreased coordination and balance. Patient requires moderate assistance with transfers and minimal assistance with ambulation using a quad cane. Recommend daily PT sessions x 2 weeks.'
      },
      {
        type: 'Discharge Summary',
        date: new Date('2023-06-10'),
        provider: 'Dr. Sarah Johnson',
        content: 'Patient admitted for acute ischemic stroke. During hospitalization, patient received tPA and showed gradual improvement in neurological deficits. Patient now has mild right arm weakness and minimal speech difficulties. Patient discharged to inpatient rehabilitation facility for continued therapy. Medications at discharge include: Aspirin 81mg daily, Atorvastatin 40mg daily, Metoprolol 25mg BID.'
      }
    ];
  }
  
  return mockData;
}

/**
 * Generate clinical summary for appeal
 * 
 * @param {String} appealId - Appeal ID
 * @returns {Object} Clinical summary
 */
async function generateClinicalSummary(appealId) {
  try {
    logger.info('Generating clinical summary', { appealId });
    
    // Find the appeal
    const appeal = await Appeal.findById(appealId);
    if (!appeal) {
      return {
        success: false,
        message: `No appeal found with ID ${appealId}`
      };
    }
    
    // Check if we have clinical data
    if (!appeal.clinicalData || Object.keys(appeal.clinicalData).length === 0) {
      return {
        success: false,
        message: 'No clinical data available for summary generation'
      };
    }
    
    // In a real implementation, this would use NLP/ML to generate
    // a concise, relevant clinical summary for the appeal
    
    // For now, generate a template-based summary
    const summary = {
      patientInfo: {
        age: calculateAge(appeal.patient.dateOfBirth),
        gender: appeal.patient.gender || 'Unknown'
      },
      primaryDiagnosis: appeal.clinicalData.diagnoses?.[0] || null,
      comorbidities: appeal.clinicalData.diagnoses?.slice(1) || [],
      relevantMedications: appeal.clinicalData.medications || [],
      relevantLabs: [],
      relevantVitals: [],
      functionalStatus: extractFunctionalStatus(appeal.clinicalData),
      clinicalJustification: generateClinicalJustification(appeal)
    };
    
    // Add relevant labs if available
    if (appeal.clinicalData.labs) {
      summary.relevantLabs = appeal.clinicalData.labs.flatMap(lab => 
        lab.results.filter(result => result.flag === 'High' || result.flag === 'Low' || result.flag === 'Critical')
      );
    }
    
    // Add abnormal vitals if available
    if (appeal.clinicalData.vitals && appeal.clinicalData.vitals.length > 0) {
      const latestVitals = appeal.clinicalData.vitals[0];
      
      // Check for abnormal BP
      const bpReading = latestVitals.readings.find(r => r.name === 'Blood Pressure');
      if (bpReading) {
        const [systolic, diastolic] = bpReading.value.split('/').map(v => parseInt(v));
        if (systolic > 140 || systolic < 90 || diastolic > 90 || diastolic < 60) {
          summary.relevantVitals.push(bpReading);
        }
      }
      
      // Add other abnormal vitals
      const hrReading = latestVitals.readings.find(r => r.name === 'Heart Rate');
      if (hrReading && (parseInt(hrReading.value) > 100 || parseInt(hrReading.value) < 60)) {
        summary.relevantVitals.push(hrReading);
      }
      
      const o2Reading = latestVitals.readings.find(r => r.name === 'SpO2');
      if (o2Reading && parseInt(o2Reading.value) < 95) {
        summary.relevantVitals.push(o2Reading);
      }
    }
    
    // Save the summary to the appeal
    appeal.clinicalSummary = summary;
    await appeal.save();
    
    return {
      success: true,
      clinicalSummary: summary,
      message: 'Clinical summary generated successfully'
    };
  } catch (error) {
    logger.error('Error generating clinical summary:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Calculate age from date of birth
 * 
 * @param {Date} dateOfBirth - Date of birth
 * @returns {Number} Age in years
 */
function calculateAge(dateOfBirth) {
  if (!dateOfBirth) return null;
  
  const dob = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Extract functional status from clinical data
 * 
 * @param {Object} clinicalData - Clinical data
 * @returns {Object} Functional status information
 */
function extractFunctionalStatus(clinicalData) {
  // In a real implementation, this would use more sophisticated
  // NLP to extract functional status information from notes
  
  const status = {
    mobility: null,
    adls: null,
    cognition: null,
    source: null
  };
  
  // Check PT notes if available
  if (clinicalData.notes) {
    const ptNote = clinicalData.notes.find(note => 
      note.type.includes('PT') || note.provider.includes('PT')
    );
    
    if (ptNote) {
      status.source = `${ptNote.type} by ${ptNote.provider} on ${new Date(ptNote.date).toLocaleDateString()}`;
      
      // Simple keyword extraction for mobility
      if (ptNote.content.includes('requires moderate assistance')) {
        status.mobility = 'Requires moderate assistance';
      } else if (ptNote.content.includes('requires minimal assistance')) {
        status.mobility = 'Requires minimal assistance';
      } else if (ptNote.content.includes('independent')) {
        status.mobility = 'Independent';
      }
      
      // Extract strength if mentioned
      const strengthMatch = ptNote.content.match(/Strength (\d+)\/5/);
      if (strengthMatch) {
        status.strength = strengthMatch[1] + '/5';
      }
    }
  }
  
  return status;
}

/**
 * Generate clinical justification for service
 * 
 * @param {Object} appeal - Appeal object
 * @returns {String} Clinical justification
 */
function generateClinicalJustification(appeal) {
  // This would be more sophisticated in a real implementation
  
  // Basic template-based justification
  let justification = '';
  
  // For post-stroke rehabilitation
  if (appeal.clinicalData.diagnoses?.some(d => d.code.startsWith('I63') || d.description.toLowerCase().includes('stroke'))) {
    justification = `Patient is status post acute ischemic stroke with resulting right-sided weakness and functional deficits requiring intensive rehabilitation. Patient currently requires assistance with mobility and activities of daily living. Continued inpatient rehabilitation is medically necessary to prevent further deterioration and maximize functional recovery.`;
  }
  // For joint replacement rehab
  else if (appeal.clinicalData.procedures?.some(p => p.name.toLowerCase().includes('joint replacement'))) {
    justification = `Patient is status post joint replacement surgery with limited mobility and requiring physical therapy to regain function. Continued rehabilitation services are medically necessary to restore functional status and prevent complications.`;
  }
  // Default justification
  else {
    justification = `Patient's current clinical condition requires the requested service/treatment based on accepted clinical guidelines and standards of care. The patient's functional limitations and medical complexity necessitate the level of care requested.`;
  }
  
  return justification;
}

module.exports = {
  createCollaborationRequest,
  processProviderSubmission,
  fetchEHRData,
  generateClinicalSummary
};