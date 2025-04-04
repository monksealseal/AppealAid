/**
 * Notification Service
 * 
 * Generates and sends patient notifications
 */

const logger = require('../utils/logger');

/**
 * Generate a patient-friendly message based on template and context
 * 
 * @param {Object} patient - Patient data
 * @param {String} templateType - Type of notification template
 * @param {Object} context - Context data for message
 * @returns {Object} Generated message details
 */
async function generatePatientMessage(patient, templateType, context) {
  try {
    // Default to English if patient preference not specified
    const language = patient.preferredLanguage || 'en';
    
    // Get the appropriate template based on type and language
    const template = getTemplateByType(templateType, language);
    
    // Generate message from template and context
    const message = fillTemplate(template, context);
    
    // Return generated message details
    return {
      patientId: patient._id,
      patientName: patient.name,
      message,
      language,
      templateType,
      timestamp: new Date()
    };
  } catch (error) {
    logger.error('Error generating patient message:', error);
    throw error;
  }
}

/**
 * Get notification template by type and language
 * 
 * @param {String} templateType - Type of notification template
 * @param {String} language - Language code
 * @returns {Object} Template object
 */
function getTemplateByType(templateType, language) {
  // In a real implementation, this would fetch templates from database or files
  // For now, we'll use hardcoded templates for demonstration
  
  const templates = {
    appeal_decision: {
      en: {
        subject: 'Update on Your Insurance Appeal',
        body: 'Dear {{patient.name}},\n\nWe have an update on your insurance appeal for {{appeal.serviceName}}. The insurance company has {{decision}} your appeal.\n\n{{#if reason}}Reason provided: {{reason}}{{/if}}\n\nWhat this means for you: {{getDecisionExplanation}}\n\nNext steps: {{getNextSteps}}\n\nIf you have any questions, please contact AppealAid support.\n\nSincerely,\nThe AppealAid Team'
      },
      es: {
        subject: 'Actualización sobre su Apelación de Seguro',
        body: 'Estimado/a {{patient.name}},\n\nTenemos una actualización sobre su apelación de seguro para {{appeal.serviceName}}. La compañía de seguros ha {{getDecisionSpanish}} su apelación.\n\n{{#if reason}}Razón proporcionada: {{reason}}{{/if}}\n\nLo que esto significa para usted: {{getDecisionExplanationSpanish}}\n\nPróximos pasos: {{getNextStepsSpanish}}\n\nSi tiene alguna pregunta, comuníquese con el soporte de AppealAid.\n\nAtentamente,\nEl Equipo de AppealAid'
      }
    },
    // Other template types can be added here
  };
  
  // Get template for specified type and language, fallback to English if not available
  const template = templates[templateType] && templates[templateType][language] 
    ? templates[templateType][language] 
    : templates[templateType]?.en;
  
  if (!template) {
    throw new Error(`Template not found for type ${templateType}`);
  }
  
  return template;
}

/**
 * Fill template with context data
 * 
 * @param {Object} template - Message template
 * @param {Object} context - Context data
 * @returns {Object} Processed message
 */
function fillTemplate(template, context) {
  let { subject, body } = template;
  const { appeal, decision, reason } = context;
  
  // Replace basic variables
  subject = subject.replace(/{{appeal\.serviceName}}/g, appeal?.serviceName || 'your medical service');
  body = body.replace(/{{patient\.name}}/g, context.appeal?.patient?.name || 'Patient');
  body = body.replace(/{{appeal\.serviceName}}/g, appeal?.serviceName || 'your medical service');
  body = body.replace(/{{reason}}/g, reason || 'No reason provided');
  
  // Handle conditional sections
  if (reason) {
    body = body.replace(/{{#if reason}}(.*?){{\/if}}/g, '$1');
  } else {
    body = body.replace(/{{#if reason}}(.*?){{\/if}}/g, '');
  }
  
  // Handle decision text
  body = body.replace(/{{decision}}/g, getDecisionText(decision));
  
  // Handle complex replacements
  body = body.replace(/{{getDecisionExplanation}}/g, getDecisionExplanation(decision, appeal));
  body = body.replace(/{{getNextSteps}}/g, getNextSteps(decision, appeal));
  
  // Spanish translations if needed
  body = body.replace(/{{getDecisionSpanish}}/g, getDecisionTextSpanish(decision));
  body = body.replace(/{{getDecisionExplanationSpanish}}/g, getDecisionExplanationSpanish(decision, appeal));
  body = body.replace(/{{getNextStepsSpanish}}/g, getNextStepsSpanish(decision, appeal));
  
  return { subject, body };
}

/**
 * Get human-readable decision text
 * 
 * @param {String} decision - Decision code
 * @returns {String} Human-readable decision text
 */
function getDecisionText(decision) {
  switch (decision) {
    case 'approved':
      return 'approved';
    case 'partiallyApproved':
      return 'partially approved';
    case 'denied':
      return 'denied';
    default:
      return 'made a decision on';
  }
}

/**
 * Get Spanish decision text
 * 
 * @param {String} decision - Decision code
 * @returns {String} Spanish decision text
 */
function getDecisionTextSpanish(decision) {
  switch (decision) {
    case 'approved':
      return 'aprobado';
    case 'partiallyApproved':
      return 'aprobado parcialmente';
    case 'denied':
      return 'denegado';
    default:
      return 'tomado una decisión sobre';
  }
}

/**
 * Get explanation of the decision for the patient
 * 
 * @param {String} decision - Decision code
 * @param {Object} appeal - Appeal data
 * @returns {String} Explanation text
 */
function getDecisionExplanation(decision, appeal) {
  switch (decision) {
    case 'approved':
      return `Your appeal was successful. The insurance should now cover your ${appeal?.serviceName || 'medical service'}.`;
    case 'partiallyApproved':
      return `Part of your appeal was approved. Some portions of your ${appeal?.serviceName || 'medical service'} will be covered by insurance, but others may still require payment.`;
    case 'denied':
      return `Your appeal was not successful at this time. You may have options for further review.`;
    default:
      return 'Please contact us to discuss the details of your appeal outcome.';
  }
}

/**
 * Get Spanish explanation of the decision
 * 
 * @param {String} decision - Decision code
 * @param {Object} appeal - Appeal data
 * @returns {String} Spanish explanation text
 */
function getDecisionExplanationSpanish(decision, appeal) {
  switch (decision) {
    case 'approved':
      return `Su apelación fue exitosa. El seguro ahora debería cubrir su ${appeal?.serviceName || 'servicio médico'}.`;
    case 'partiallyApproved':
      return `Parte de su apelación fue aprobada. Algunas partes de su ${appeal?.serviceName || 'servicio médico'} serán cubiertas por el seguro, pero otras pueden requerir pago.`;
    case 'denied':
      return `Su apelación no tuvo éxito en este momento. Puede tener opciones para una revisión adicional.`;
    default:
      return 'Por favor contáctenos para discutir los detalles del resultado de su apelación.';
  }
}

/**
 * Get next steps based on decision
 * 
 * @param {String} decision - Decision code
 * @param {Object} appeal - Appeal data
 * @returns {String} Next steps text
 */
function getNextSteps(decision, appeal) {
  switch (decision) {
    case 'approved':
      return 'No further action is needed for this appeal. You should see the updated coverage reflected in your account soon.';
    case 'partiallyApproved':
      return 'We recommend scheduling a call with our team to review which parts were approved and discuss options for the denied portions.';
    case 'denied':
      return 'You may have the option to pursue an external review. Please contact us within 30 days to discuss next steps.';
    default:
      return 'Please contact our support team to discuss the details of your appeal and determine the best next steps.';
  }
}

/**
 * Get Spanish next steps based on decision
 * 
 * @param {String} decision - Decision code
 * @param {Object} appeal - Appeal data
 * @returns {String} Spanish next steps text
 */
function getNextStepsSpanish(decision, appeal) {
  switch (decision) {
    case 'approved':
      return 'No se necesita ninguna acción adicional para esta apelación. Pronto debería ver la cobertura actualizada reflejada en su cuenta.';
    case 'partiallyApproved':
      return 'Recomendamos programar una llamada con nuestro equipo para revisar qué partes fueron aprobadas y discutir opciones para las partes denegadas.';
    case 'denied':
      return 'Es posible que tenga la opción de solicitar una revisión externa. Comuníquese con nosotros dentro de los 30 días para discutir los próximos pasos.';
    default:
      return 'Comuníquese con nuestro equipo de soporte para discutir los detalles de su apelación y determinar los mejores pasos a seguir.';
  }
}

module.exports = {
  generatePatientMessage
};