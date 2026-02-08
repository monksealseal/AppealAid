/**
 * AI-Enhanced Appeal Service
 * Responsible for generating appeal letters, managing templates,
 * evaluating appeal effectiveness, and automated appeal follow-ups
 */

// Dependencies
const Appeal = require('../models/appealModel');
const Document = require('../models/documentModel');
const aiService = require('./aiService');

// Map of denial types to appeal strategies and templates
const DENIAL_TYPE_MAPPINGS = {
  'medical necessity': {
    appealType: 'medicalNecessity',
    templateId: 'medical_necessity_standard',
    suggestedEvidence: [
      'Physician letter explaining necessity',
      'Medical records documenting condition',
      'Clinical guidelines supporting necessity'
    ]
  },
  'prior authorization': {
    appealType: 'priorAuthorization',
    templateId: 'prior_authorization_standard',
    suggestedEvidence: [
      'Evidence of emergency situation',
      'Evidence of attempt to obtain authorization',
      'Medical necessity documentation'
    ]
  },
  'out of network': {
    appealType: 'outOfNetwork',
    templateId: 'out_of_network_standard',
    suggestedEvidence: [
      'Evidence no in-network provider was available',
      'Documentation of specialized care needed',
      'Evidence of referral from in-network provider'
    ]
  },
  'experimental treatment': {
    appealType: 'experimentalTreatment',
    templateId: 'experimental_treatment_standard',
    suggestedEvidence: [
      'Peer-reviewed studies showing effectiveness',
      'Physician statement on standard of care',
      'Similar cases where treatment was approved'
    ]
  },
  'coding error': {
    appealType: 'codingError',
    templateId: 'coding_error_standard',
    suggestedEvidence: [
      'Corrected claim forms',
      'Coding reference materials',
      'Documentation supporting correct code'
    ]
  },
  'not covered': {
    appealType: 'notCovered',
    templateId: 'benefit_coverage_standard',
    suggestedEvidence: [
      'Policy documents showing coverage',
      'Documentation of medical necessity',
      'Alternative coverage provisions'
    ]
  },
  'pre-authorization conflict': {
    appealType: 'preAuthConflict',
    templateId: 'pre_auth_conflict_standard',
    suggestedEvidence: [
      'Documentation of initial pre-authorization',
      'Documentation of attempt to obtain second pre-authorization',
      'Medical urgency documentation showing delay risks',
      'Evidence of multiple facility options investigation'
    ]
  },
  'urgency override': {
    appealType: 'urgencyOverride',
    templateId: 'urgency_override_standard',
    suggestedEvidence: [
      'Medical documentation supporting urgency of procedure',
      'Physician statement on risks of delayed treatment',
      'Timeline showing potential disease progression',
      'Comparison of wait times between authorization options'
    ]
  },
  'clinical trial': {
    appealType: 'clinicalTrial',
    templateId: 'clinical_trial_standard',
    suggestedEvidence: [
      'Clinical trial protocol documents',
      'IRB approval documentation',
      'Medicare Clinical Trial Policy reference',
      'Costing sheet separating routine vs. investigational costs',
      'Documentation showing trial is FDA approved'
    ]
  },
  'academic exception': {
    appealType: 'academicException',
    templateId: 'academic_exception_standard',
    suggestedEvidence: [
      'Letter from department chair/medical director',
      'Documentation of case\'s educational or research value',
      'Literature showing academic medical center expertise required',
      'Evidence of rarity of condition requiring academic treatment',
      'Previous precedents for similar academic exceptions'
    ]
  },
  'teaching physician': {
    appealType: 'teachingPhysician',
    templateId: 'teaching_physician_standard',
    suggestedEvidence: [
      'Documentation meeting teaching physician guidelines',
      'Attestation of teaching physician supervision',
      'Medical record with proper GC/GE modifiers',
      'Evidence of direct involvement by teaching physician',
      'Medicare teaching physician rule compliance documentation'
    ]
  }
};

// Additional denial codes and reasons mapping
const DENIAL_CODE_MAPPINGS = {
  'A0': { reason: 'Medical necessity not established', type: 'medicalNecessity' },
  'B1': { reason: 'Prior authorization required but not obtained', type: 'priorAuthorization' },
  'C2': { reason: 'Services provided by out-of-network provider', type: 'outOfNetwork' },
  'D3': { reason: 'Experimental or investigational treatment', type: 'experimentalTreatment' },
  'E4': { reason: 'Coding error or incorrect diagnosis code', type: 'codingError' },
  'F5': { reason: 'Service not covered under plan benefits', type: 'notCovered' },
  'P1': { reason: 'Conflicting pre-authorization requests', type: 'preAuthConflict' },
  'P2': { reason: 'Second pre-authorization denied due to existing pre-authorization', type: 'preAuthConflict' },
  'U1': { reason: 'Delay in treatment poses significant medical risk', type: 'urgencyOverride' },
  'U2': { reason: 'Potential disease progression due to administrative delay', type: 'urgencyOverride' },
  // Clinical trial specific codes
  'CT1': { reason: 'Clinical trial not qualifying under CMS National Coverage Determination', type: 'clinicalTrial' },
  'CT2': { reason: 'Clinical trial routine costs not separated from research costs', type: 'clinicalTrial' },
  'CT3': { reason: 'Clinical trial lacks required documentation or approvals', type: 'clinicalTrial' },
  // Teaching physician specific codes
  'TP1': { reason: 'Teaching physician documentation requirements not met', type: 'teachingPhysician' },
  'TP2': { reason: 'Incorrect teaching modifier used', type: 'teachingPhysician' },
  'TP3': { reason: 'Missing attending physician supervision documentation', type: 'teachingPhysician' },
  // Academic exception codes
  'AE1': { reason: 'Specialized academic medical center exception not applicable', type: 'academicException' },
  'AE2': { reason: 'Academic center involvement not sufficiently justified', type: 'academicException' },
  // Florida specific codes
  'FL1': { reason: 'Florida prompt pay law violation', type: 'notCovered' },
  'FL2': { reason: 'Florida Blue authorization protocol not followed', type: 'priorAuthorization' }
};

// Insurer-specific appeal requirements
const INSURER_REQUIREMENTS = {
  'Florida Blue': {
    formats: ['electronic', 'fax', 'mail'],
    timeframes: { 
      standard: 180, 
      expedited: 72 
    },
    portalUrl: 'https://provider.floridablue.com',
    appealFormLocation: 'Provider Portal > Claims > Submit Appeal',
    requirements: [
      'Provider NPI',
      'Claim number',
      'Member ID',
      'Date of service',
      'FL Provider ID'
    ],
    appealFormName: 'Florida Blue Provider Claim Dispute Form',
    floridaSpecific: {
      promptPayReferences: true,
      stateLawReferences: ['Florida Statute 627.6131', 'Florida Statute 641.3155'],
      specialPrograms: ['Medicare Advantage', 'Florida Blue MyBlue'],
      contractHierarchy: ['UHealthy Florida Blue Alliance', 'Florida Blue Community Network']
    }
  },
  'AvMed': {
    formats: ['electronic', 'fax', 'mail'],
    timeframes: { 
      standard: 180, 
      expedited: 72 
    },
    portalUrl: 'https://providers.avmed.org',
    appealFormLocation: 'Claims and Payments > Submit Appeal',
    requirements: [
      'Provider NPI',
      'Claim number',
      'Member ID',
      'Date of service'
    ],
    appealFormName: 'AvMed Provider Appeal Form',
    floridaSpecific: {
      promptPayReferences: true,
      stateLawReferences: ['Florida Statute 627.6131', 'Florida Statute 641.3155'],
      specialPrograms: ['AvMed Gold', 'AvMed Empower']
    }
  },
  'Blue Cross Blue Shield': {
    formats: ['electronic', 'fax', 'mail'],
    timeframes: { 
      standard: 180, 
      expedited: 72 
    },
    portalUrl: 'https://provider.bcbs.com',
    appealFormLocation: 'Provider Portal > Claims > Appeals',
    requirements: [
      'Provider NPI',
      'Claim number',
      'Member ID',
      'Date of service'
    ],
    appealFormName: 'BCBS Provider Appeal Request Form'
  },
  'Aetna': {
    formats: ['electronic', 'fax', 'mail'],
    timeframes: { 
      standard: 180, 
      expedited: 72 
    },
    portalUrl: 'https://navinet.navimedix.com',
    appealFormLocation: 'Claims > Appeal Request',
    requirements: [
      'Provider NPI',
      'Claim number',
      'Member ID',
      'Date of service',
      'CPT/HCPCS codes'
    ],
    appealFormName: 'Aetna Provider Claim Appeal Form'
  },
  'UnitedHealthcare': {
    formats: ['electronic', 'fax', 'mail'],
    timeframes: { 
      standard: 180, 
      expedited: 72 
    },
    portalUrl: 'https://www.unitedhealthcareonline.com',
    appealFormLocation: 'Claims & Payments > Submit Appeal',
    requirements: [
      'Provider NPI and TIN',
      'Claim number',
      'Member ID',
      'Date of service'
    ],
    appealFormName: 'UHC Provider Formal Claim Reconsideration Request Form'
  },
  'Cigna': {
    formats: ['electronic', 'fax', 'mail'],
    timeframes: { 
      standard: 180, 
      expedited: 72 
    },
    portalUrl: 'https://cignaforhcp.cigna.com',
    appealFormLocation: 'Claims > Claim Reconsiderations',
    requirements: [
      'Provider information',
      'Claim number',
      'Patient information',
      'Date of service',
      'Explanation of reconsideration request'
    ],
    appealFormName: 'Cigna Claim Reconsideration/Appeal Request Form'
  },
  'Humana': {
    formats: ['electronic', 'fax', 'mail'],
    timeframes: { 
      standard: 180, 
      expedited: 60 
    },
    portalUrl: 'https://www.availity.com',
    appealFormLocation: 'Claims > Claims Status > Appeals',
    requirements: [
      'Provider NPI',
      'Provider Tax ID',
      'Member ID',
      'Claim number',
      'Date of service'
    ],
    appealFormName: 'Humana Provider Payment Appeal Form'
  },
  'Medicare': {
    formats: ['mail', 'fax'],
    timeframes: { 
      standard: 120, 
      expedited: 72 
    },
    portalUrl: 'https://www.cms.gov/Medicare/Appeals-and-Grievances/MedPrescriptDrugApplGriev',
    appealFormLocation: 'N/A - Use Medicare Redetermination Request Form',
    requirements: [
      'Provider NPI',
      'Provider PTAN',
      'Beneficiary Medicare number',
      'Beneficiary name',
      'Date of service',
      'Claim Control Number (CCN)'
    ],
    appealFormName: 'Medicare Redetermination Request Form (CMS-20027)'
  },
  'Medicaid': {
    formats: ['mail', 'fax'],
    timeframes: { 
      standard: 90, 
      expedited: 72 
    },
    portalUrl: 'Varies by state',
    appealFormLocation: 'Varies by state',
    requirements: [
      'Provider NPI',
      'Provider Medicaid ID',
      'Recipient Medicaid ID',
      'Date of service',
      'Control number'
    ],
    appealFormName: 'Medicaid Appeal Request Form (varies by state)'
  }
};

// Normal appeal follow-up schedule (days after submission)
const FOLLOW_UP_SCHEDULE = [
  { days: 14, action: 'initial_inquiry', method: 'electronic' },
  { days: 30, action: 'status_check', method: 'phone' },
  { days: 45, action: 'escalation', method: 'fax' },
  { days: 60, action: 'final_notice', method: 'mail' }
];

// Urgent appeal follow-up schedule (days after submission)
const URGENT_FOLLOW_UP_SCHEDULE = [
  { days: 5, action: 'initial_inquiry', method: 'electronic' },
  { days: 10, action: 'status_check', method: 'phone' },
  { days: 15, action: 'escalation', method: 'fax' },
  { days: 25, action: 'final_notice', method: 'mail' }
];

/**
 * Identify appropriate appeal type and template based on denial code and reason
 * @param {string} denialReason - The reason for denial from the EOB
 * @param {string} denialCode - The denial code if available
 * @returns {Object} Appeal strategy information
 */
const identifyAppealStrategy = (denialReason, denialCode) => {
  // First check if we have a denial code mapping
  if (denialCode && DENIAL_CODE_MAPPINGS[denialCode]) {
    const codeMapping = DENIAL_CODE_MAPPINGS[denialCode];
    return {
      appealType: codeMapping.type,
      templateId: `${codeMapping.type}_standard`,
      suggestedEvidence: DENIAL_TYPE_MAPPINGS[codeMapping.type]?.suggestedEvidence || ['Medical records', 'Physician statement']
    };
  }
  
  if (!denialReason) {
    return {
      appealType: 'other',
      templateId: 'general_appeal',
      suggestedEvidence: ['Medical records', 'Physician statement']
    };
  }
  
  const denialLower = denialReason.toLowerCase();
  
  // Check for keywords in the denial reason
  for (const [keyword, strategy] of Object.entries(DENIAL_TYPE_MAPPINGS)) {
    if (denialLower.includes(keyword)) {
      return strategy;
    }
  }
  
  // Default strategy if no specific match
  return {
    appealType: 'other',
    templateId: 'general_appeal',
    suggestedEvidence: ['Medical records', 'Physician statement']
  };
};

/**
 * Get template content by template ID
 * In a real implementation, this would query the database
 * @param {string} templateId - Template identifier
 * @returns {string} Template content
 */
const getTemplateContent = (templateId) => {
  // This would normally retrieve from the database
  // Using hardcoded examples for demonstration
  const templates = {
    'clinical_trial_standard': `[University Letterhead]

[Date]

[Insurance Company]
Attn: Appeals Department
[Insurance Address]
[City, State ZIP]

Re: CLINICAL TRIAL COVERAGE APPEAL
Patient: [Patient Name]
Member ID: [Member ID]
Claim Number: [Claim Number]
Date of Service: [Service Date]
Clinical Trial: [Clinical Trial ID]
IRB Number: [IRB Number]

To Whom It May Concern:

I am writing on behalf of University of Miami Health System regarding the denial of coverage for services provided to [Patient Name] as part of an approved clinical trial. The services were provided on [Service Date] at [Provider Name] and have been denied, citing "[Denial Reason]".

This appeal is based on the following facts:

1. The clinical trial in question ([Clinical Trial ID]) is a [Phase] trial that meets all Medicare Clinical Trial Policy requirements as defined in National Coverage Determination 310.1.
   
2. The trial has been approved by the University of Miami Institutional Review Board (IRB #[IRB Number]) and has been deemed to be of significant scientific and medical value.

3. The services in question represent ROUTINE CARE COSTS that would be covered outside of a clinical trial setting. These specific services are standard of care for the patient's condition and are not investigational in nature.

4. The enclosed costing sheet clearly separates routine care costs (which should be covered) from research-specific costs (which are not being billed to insurance).

5. The patient meets all eligibility criteria for participation in this trial, and the trial represents an appropriate treatment option based on their diagnosis of [Diagnosis Codes].

As an academic medical center, the University of Miami Health System has a responsibility to advance medical knowledge while providing optimal care to patients. Clinical trials represent a critical component of this mission, and coverage for routine care costs is protected under both federal guidelines and most individual insurance policies.

Please note that under Medicare Clinical Trial Policy, routine care costs include:
- Items or services typically provided absent a clinical trial
- Items or services required solely for the provision of the investigational item/service
- Items or services required for the clinically appropriate monitoring of the effects of the investigational item
- Items or services needed for reasonable and necessary care arising from the provision of an investigational item

Enclosed please find the following documentation:
- Copy of IRB approval letter
- Clinical trial protocol summary
- Costing sheet identifying routine vs. research costs
- FDA approval documentation
- Physician statement regarding medical appropriateness

Please reconsider this claim based on the facts presented and approve coverage for these medically necessary routine care costs. If you require additional information, please contact our Clinical Research Billing office at [phone number].

Sincerely,

[Provider Name]
[Provider Credentials]
University of Miami Health System`,

    'academic_exception_standard': `[University Letterhead]

[Date]

[Insurance Company]
Attn: Appeals Department
[Insurance Address]
[City, State ZIP]

Re: ACADEMIC MEDICAL CENTER APPEAL
Patient: [Patient Name]
Member ID: [Member ID]
Claim Number: [Claim Number]
Date of Service: [Service Date]
Department: [Department]

To Whom It May Concern:

I am writing on behalf of University of Miami Health System to appeal the denial of claim [Claim Number] for [Patient Name]. The services provided on [Service Date] have been denied, citing "[Denial Reason]".

This appeal is based on the following consideration: the unique environment and capabilities of our academic medical center were specifically required for the appropriate diagnosis and treatment of this patient's condition.

Justification for academic medical center care:

1. SPECIALIZED EXPERTISE: The University of Miami Health System is one of few facilities in the region with dedicated specialists capable of managing this [rare/complex] condition. The specific services denied required the specialized knowledge of our faculty physicians who have published research and developed protocols for treating this specific condition.

2. DISEASE COMPLEXITY: The patient presented with [Diagnosis Codes], which represents a [rare/complex] condition affecting fewer than [X] patients per year in the United States. Due to the complexity, standard community hospital treatment protocols would be insufficient for proper care.

3. MULTIDISCIPLINARY APPROACH: The patient's care required coordination between multiple subspecialty departments including [list departments], which is only feasible in an academic medical center environment with the full range of subspecialty services available.

4. TEACHING VALUE: While not the primary reason for treatment, this case represents significant teaching value for our medical residents and fellows, contributing to the development of future specialists capable of managing similar cases. This educational component is fundamental to our mission as an academic institution.

5. PREVIOUS AUTHORIZATION: We note that your organization has previously recognized the need for academic medical center care for similar patients, including [reference case number/dates if available].

The University of Miami Health System takes pride in providing the highest level of care to patients who require our unique academic medical environment. This specific case represents a legitimate need for our specialized services, not merely a preference.

Enclosed please find the following:
- Letter from Department Chair outlining specialized expertise
- Documentation of case complexity
- Literature supporting academic medical center management for this condition
- Previous authorization precedents (if applicable)

We respectfully request reconsideration of this claim based on the medical necessity of academic medical center care for this specific patient. If you require additional information, please contact our office at [phone number].

Sincerely,

[Medical Director Name]
[Credentials]
[Department]
University of Miami Health System`,

    'teaching_physician_standard': `[University Letterhead]

[Date]

[Insurance Company]
Attn: Appeals Department
[Insurance Address]
[City, State ZIP]

Re: TEACHING PHYSICIAN RULE APPEAL
Patient: [Patient Name]
Member ID: [Member ID]
Claim Number: [Claim Number]
Date of Service: [Service Date]
Provider: [Provider Name]

To Whom It May Concern:

I am writing on behalf of University of Miami Health System to appeal the denial of claim [Claim Number] for [Patient Name] seen on [Service Date] under the supervision of teaching physician Dr. [Provider Name]. The claim has been denied citing "[Denial Reason]" related to teaching physician documentation.

We are appealing this denial based on the following facts:

1. The services provided were properly documented in accordance with Medicare Teaching Physician Guidelines (Medicare Claims Processing Manual, Chapter 12, Section 100).

2. Dr. [Provider Name], the teaching physician, was physically present during the [critical/key] portion of the service and this presence is clearly documented in the medical record with the following attestation: "[Attestation statement from record]"

3. The appropriate GC modifier (services performed in part by a resident under the direction of a teaching physician) was applied to the claim in accordance with Medicare guidelines.

4. The submitted documentation clearly demonstrates that Dr. [Provider Name]:
   - Personally performed the service or was physically present during the key portion performed by the resident
   - Participated in the management of the patient
   - Reviewed the patient's medical history, examination findings, diagnosis, and treatment plan
   - Documented their presence and participation as required by regulations

5. The medical record contains all elements required under the teaching physician rules, including:
   - Resident documentation of the service
   - Teaching physician's confirmation of key history, exam, and medical decision-making elements
   - Teaching physician's personal involvement statement

As an academic medical center, the University of Miami Health System is committed to both excellent patient care and the education of future physicians. We maintain rigorous compliance with all teaching physician billing requirements while fulfilling our educational mission.

Enclosed please find:
- Complete medical record with teaching physician documentation highlighted
- Copy of our institutional teaching physician policy
- Medicare teaching physician rule references applicable to this case
- Attestation from Dr. [Provider Name] confirming presence during service

Please reconsider this claim based on the proper documentation of teaching physician services. If you require additional information, please contact our billing compliance office at [phone number].

Sincerely,

[Billing Compliance Officer Name]
[Credentials]
University of Miami Health System`,

    'medical_necessity_standard': `[Patient Name]
[Patient Address]
[City, State ZIP]

[Date]

[Insurance Company]
Attn: Appeals Department
[Insurance Address]
[City, State ZIP]

Re: Appeal of Claim Denial
Member Name: [Patient Name]
Member ID: [Member ID]
Claim Number: [Claim Number]
Date of Service: [Service Date]

To Whom It May Concern:

I am writing to appeal the denial of coverage for [Service Description] that was performed on [Service Date]. Your company has denied this claim stating that it was not medically necessary.

I believe this denial is incorrect for the following reasons:

1. My physician determined that this [Service Description] was medically necessary to diagnose/treat my condition.
2. [Description of medical condition and why the service was necessary]
3. [Reference to specific medical guidelines supporting the necessity]

Enclosed please find the following supporting documentation:
- Letter from my physician explaining medical necessity
- Medical records documenting my condition
- [Other relevant documentation]

According to [reference insurance policy section or medical guideline], this [Service Description] meets the criteria for medical necessity as defined in my policy.

Please reconsider this claim and provide the coverage to which I am entitled under my policy. If you require additional information, please contact me at [phone number] or [email].

Thank you for your prompt attention to this matter.

Sincerely,

[Patient Name]`,
    'prior_authorization_standard': `[Patient Name]
[Patient Address]
[City, State ZIP]

[Date]

[Insurance Company]
Attn: Appeals Department
[Insurance Address]
[City, State ZIP]

Re: Appeal of Claim Denial - Prior Authorization
Member Name: [Patient Name]
Member ID: [Member ID]
Claim Number: [Claim Number]
Date of Service: [Service Date]

To Whom It May Concern:

I am writing to appeal the denial of coverage for [Service Description] that was performed on [Service Date]. Your company has denied this claim stating that prior authorization was not obtained.

I believe this denial should be reconsidered for the following reasons:

1. [Explanation of any extenuating circumstances]
2. [Reference to emergency nature of care if applicable]
3. [Explanation of attempts to obtain authorization if applicable]

The [Service Description] was medically necessary as documented in the enclosed medical records. [Additional details about medical necessity].

Please reconsider this claim based on the medical necessity of the service provided. If you require additional information, please contact me at [phone number] or [email].

Thank you for your prompt attention to this matter.

Sincerely,

[Patient Name]`,
    'coding_error_standard': `[Patient Name]
[Patient Address]
[City, State ZIP]

[Date]

[Insurance Company]
Attn: Appeals Department
[Insurance Address]
[City, State ZIP]

Re: Appeal of Claim Denial - Coding Error
Member Name: [Patient Name]
Member ID: [Member ID]
Claim Number: [Claim Number]
Date of Service: [Service Date]
Provider: [Provider Name] 
Provider NPI: [Provider NPI]

To Whom It May Concern:

I am writing to appeal the denial of coverage for [Service Description] that was performed on [Service Date]. Your company has denied this claim due to what appears to be a coding error.

I believe this denial should be reconsidered for the following reasons:

1. The correct diagnosis code(s) for the service should be: [Diagnosis Codes]
2. The correct procedure code(s) for the service should be: [Procedure Codes]
3. The provider has confirmed that the service was performed and properly documented.

Enclosed please find the following supporting documentation:
- Corrected claim form
- Documentation from the provider supporting the correct codes
- Medical records documenting the service provided

Please reprocess this claim with the correct coding information. If you require additional information, please contact me at [phone number] or [email].

Thank you for your prompt attention to this matter.

Sincerely,

[Patient Name]`,
    'out_of_network_standard': `[Patient Name]
[Patient Address]
[City, State ZIP]

[Date]

[Insurance Company]
Attn: Appeals Department
[Insurance Address]
[City, State ZIP]

Re: Appeal of Claim Denial - Out-of-Network Provider
Member Name: [Patient Name]
Member ID: [Member ID]
Claim Number: [Claim Number]
Date of Service: [Service Date]
Provider: [Provider Name]

To Whom It May Concern:

I am writing to appeal the denial of coverage for [Service Description] that was performed on [Service Date] by [Provider Name]. Your company has denied this claim because the provider was out-of-network.

I believe this denial should be reconsidered for the following reasons:

1. [Explain why you needed to use an out-of-network provider]
2. [Note any attempts to find in-network providers]
3. [Mention any referrals from in-network providers]

The service was medically necessary as documented in the enclosed medical records. According to my policy [reference policy section if known], coverage should be provided for out-of-network services when [relevant exception].

Please reconsider this claim based on the circumstances described above. If you require additional information, please contact me at [phone number] or [email].

Thank you for your prompt attention to this matter.

Sincerely,

[Patient Name]`,
    'pre_auth_conflict_standard': `[Patient Name]
[Patient Address]
[City, State ZIP]

[Date]

[Insurance Company]
Attn: Appeals Department
[Insurance Address]
[City, State ZIP]

Re: URGENT Appeal - Pre-Authorization Conflict
Member Name: [Patient Name]
Member ID: [Member ID]
Claim Number: [Claim Number]
Date of Service: [Service Date]
Provider: [Provider Name]

To Whom It May Concern:

I am writing to request an urgent review and resolution regarding a pre-authorization conflict for [Service Description] which is medically necessary for my condition. This request is time-sensitive as it involves a potentially serious medical condition that requires prompt intervention.

Current situation:
1. I initially received pre-authorization for this procedure at [Provider Name] with 50% coverage.
2. I subsequently found that the procedure could be performed at [alternate facility name] with 80% coverage.
3. However, my request for pre-authorization at this second facility has been denied because of the existing pre-authorization.

This procedural barrier is creating a significant medical risk for the following reasons:

1. My physician has diagnosed a [Service Description] which requires immediate diagnostic evaluation due to concerns of malignancy.
2. Delaying this procedure while resolving administrative barriers could allow potential cancer to spread, significantly complicating treatment and reducing chances of successful intervention.
3. The financial difference between the two coverage options ($15,000 vs. $6,000 out-of-pocket) creates a substantial hardship that delays my ability to proceed with necessary care.

I understand that your policies typically prevent multiple pre-authorizations for the same procedure, but I request an exception based on:
- The medical urgency of my situation
- The significant financial hardship posed by the initial authorization
- The fact that the second facility offers substantially better insurance coverage for the same procedure

Enclosed please find:
- Medical documentation from [Doctor's Name] confirming the urgency of diagnostic evaluation
- Copy of initial pre-authorization showing 50% coverage
- Documentation showing 80% coverage availability at the alternate facility
- Financial hardship statement

I respectfully request expedited processing of this appeal. Please contact me immediately at [phone number] or [email] with your decision or if additional information is needed.

Thank you for your prompt attention to this urgent matter.

Sincerely,

[Patient Name]`,
    'urgency_override_standard': `[Patient Name]
[Patient Address]
[City, State ZIP]

[Date]

[Insurance Company]
Attn: URGENT Appeals Department
[Insurance Address]
[City, State ZIP]

Re: URGENT Medical Necessity Override Request
Member Name: [Patient Name]
Member ID: [Member ID]
Claim Number: [Claim Number]
Date of Service: [Service Date]
Provider: [Provider Name]

URGENT: REQUIRES IMMEDIATE ATTENTION

To Whom It May Concern:

I am writing to request an immediate review and expedited authorization for [Service Description] due to the significant risk of medical harm that will result from administrative delay. This is a time-sensitive medical situation requiring prompt resolution.

Medical urgency:
1. I have been diagnosed with a large mass in my kidney which requires immediate biopsy to determine if it is cancerous.
2. My physician, Dr. [Doctor's Name], has determined that delaying this diagnostic procedure creates a substantial risk of allowing potential cancer to spread beyond the kidney.
3. If found to be malignant, immediate surgical intervention would be required, which could be curative if performed before spread occurs.
4. Any administrative delay significantly increases the risk of metastasis, which would dramatically reduce treatment options and survival probability.

The current administrative barrier involves:
- Pre-authorization conflict between facilities with different coverage levels
- Inability to obtain a second pre-authorization for the same procedure at a more affordable facility
- The substantial financial difference makes it impossible for me to proceed at the initially authorized facility

I request that you:
1. Grant an urgent override of standard pre-authorization restrictions based on medical necessity
2. Authorize the procedure at [preferred facility] with the higher coverage level (80%)
3. Process this request within 24-48 hours due to the time-sensitive nature of my condition

Enclosed documentation:
- Medical records documenting the kidney mass
- Physician statement regarding urgency and potential consequences of delay
- Initial pre-authorization document showing 50% coverage
- Evidence of 80% coverage availability at alternate facility

I affirm that this is a genuine medical urgency, not a matter of convenience. Please contact me immediately at [phone number] or my physician at [physician phone number] regarding this request.

Thank you for your immediate attention to this life-threatening situation.

Sincerely,

[Patient Name]`,
    'general_appeal': `[Patient Name]
[Patient Address]
[City, State ZIP]

[Date]

[Insurance Company]
Attn: Appeals Department
[Insurance Address]
[City, State ZIP]

Re: Appeal of Claim Denial
Member Name: [Patient Name]
Member ID: [Member ID]
Claim Number: [Claim Number]
Date of Service: [Service Date]

To Whom It May Concern:

I am writing to appeal the denial of coverage for [Service Description] that was performed on [Service Date]. 

I believe this denial is incorrect for the following reasons:

1. [Primary reason for appeal]
2. [Secondary reason for appeal]
3. [Additional details supporting appeal]

Enclosed please find supporting documentation that substantiates my appeal. 

Please reconsider this claim and provide the coverage to which I am entitled under my policy. If you require additional information, please contact me at [phone number] or [email].

Thank you for your prompt attention to this matter.

Sincerely,

[Patient Name]`
  };
  
  return templates[templateId] || templates.general_appeal;
};

/**
 * Generate personalized appeal content based on document data and template
 * @param {Object} documentData - Extracted data from the document
 * @param {string} templateId - Template identifier
 * @returns {string} Personalized appeal content
 */
const generateAppealContent = (documentData, templateId) => {
  let templateContent = getTemplateContent(templateId);
  
  // Format date values for better readability
  const formattedServiceDate = documentData.serviceDate ? 
    new Date(documentData.serviceDate).toLocaleDateString() : '[Service Date]';
  
  const formattedDocDate = documentData.documentDate ? 
    new Date(documentData.documentDate).toLocaleDateString() : '[Document Date]';

  // Combine procedure codes into comma-separated string if available
  const procedureCodes = documentData.procedureCodes && documentData.procedureCodes.length > 0 ? 
    documentData.procedureCodes.join(', ') : '[Procedure Codes]';
    
  // Combine diagnosis codes into comma-separated string if available
  const diagnosisCodes = documentData.diagnosisCodes && documentData.diagnosisCodes.length > 0 ? 
    documentData.diagnosisCodes.join(', ') : '[Diagnosis Codes]';
    
  // Calculate the appeal deadline date if available
  const appealDeadlineDate = documentData.appealDeadline ? 
    new Date(documentData.appealDeadline).toLocaleDateString() : '[Appeal Deadline]';
  
  // Handle null or undefined values for amounts
  const billedAmount = documentData.billedAmount ? 
    `$${documentData.billedAmount.toFixed(2)}` : '[Billed Amount]';
    
  const allowedAmount = documentData.allowedAmount ? 
    `$${documentData.allowedAmount.toFixed(2)}` : '[Allowed Amount]';
    
  const patientResponsibility = documentData.patientResponsibility ? 
    `$${documentData.patientResponsibility.toFixed(2)}` : '[Patient Responsibility]';
  
  // Extract provider information
  const providerName = documentData.providerName || 
    (documentData.providerInfo && documentData.providerInfo.name) || '[Provider Name]';
    
  const providerNPI = documentData.providerInfo && documentData.providerInfo.npi ?
    documentData.providerInfo.npi : '[Provider NPI]';
    
  const providerAddress = documentData.providerInfo && documentData.providerInfo.address ?
    documentData.providerInfo.address : '[Provider Address]';
    
  const providerPhone = documentData.providerInfo && documentData.providerInfo.phone ?
    documentData.providerInfo.phone : '[Provider Phone]';
  
  // Build a comprehensive replacements map
  const replacements = {
    '[Patient Name]': documentData.patientName || '[Patient Name]',
    '[Member ID]': documentData.memberId || '[Member ID]',
    '[Claim Number]': documentData.claimNumber || '[Claim Number]',
    '[Service Date]': formattedServiceDate,
    '[Document Date]': formattedDocDate,
    '[Insurance Company]': documentData.insuranceCarrier || '[Insurance Company]',
    '[Service Description]': documentData.serviceDescription || '[Service Description]',
    '[Date]': new Date().toLocaleDateString(),
    '[Procedure Codes]': procedureCodes,
    '[Diagnosis Codes]': diagnosisCodes,
    '[Appeal Deadline]': appealDeadlineDate,
    '[Denial Reason]': documentData.denialReason || '[Denial Reason]',
    '[Denial Code]': documentData.denialCode || '[Denial Code]',
    '[Billed Amount]': billedAmount,
    '[Allowed Amount]': allowedAmount,
    '[Patient Responsibility]': patientResponsibility,
    '[Provider Name]': providerName,
    '[Provider NPI]': providerNPI,
    '[Provider Address]': providerAddress,
    '[Provider Phone]': providerPhone,
    '[Group Number]': documentData.groupNumber || '[Group Number]'
  };
  
  // Replace all occurrences of each placeholder
  for (const [placeholder, value] of Object.entries(replacements)) {
    templateContent = templateContent.replace(new RegExp(placeholder, 'g'), value);
  }
  
  return templateContent;
};

/**
 * Generate AI-enhanced appeal content by customizing the letter with
 * additional arguments and more persuasive language
 * @param {Object} documentData - Extracted document data 
 * @param {string} templateId - Selected template ID
 * @param {string} appealType - Type of appeal (medical necessity, etc.)
 * @returns {string} Enhanced appeal letter content
 */
const generateAIEnhancedContent = (documentData, templateId, appealType) => {
  // First get the template-filled content
  let appealContent = generateAppealContent(documentData, templateId);
  
  // Enhanced content specific to each appeal type
  const enhancedArgumentsByType = {
    'medicalNecessity': generateMedicalNecessityArguments(documentData),
    'priorAuthorization': generatePriorAuthArguments(documentData),
    'outOfNetwork': generateOutOfNetworkArguments(documentData),
    'codingError': generateCodingErrorArguments(documentData),
    'notCovered': generateNotCoveredArguments(documentData),
    'preAuthConflict': generatePreAuthConflictArguments(documentData),
    'urgencyOverride': generateUrgencyOverrideArguments(documentData),
    'clinicalTrial': generateClinicalTrialArguments(documentData),
    'academicException': generateAcademicExceptionArguments(documentData),
    'teachingPhysician': generateTeachingPhysicianArguments(documentData),
    'other': generateGenericArguments(documentData)
  };
  
  // Get enhanced arguments for this appeal type
  const enhancedArguments = enhancedArgumentsByType[appealType] || enhancedArgumentsByType.other;
  
  // Insert the enhanced arguments into appropriate sections of the letter
  if (enhancedArguments && enhancedArguments.length > 0) {
    // Find where to insert enhanced arguments
    const insertPoint = appealContent.indexOf('I believe this denial is incorrect for the following reasons:');
    
    if (insertPoint !== -1) {
      // Split content at insert point
      const beforeInsert = appealContent.substring(0, insertPoint + 'I believe this denial is incorrect for the following reasons:'.length);
      const afterInsert = appealContent.substring(insertPoint + 'I believe this denial is incorrect for the following reasons:'.length);
      
      // Replace the numbered points section with enhanced arguments
      const numberedArgsRegex = /\n\n1\.\s.*\n2\.\s.*\n3\.\s.*/;
      const newArguments = '\n\n' + enhancedArguments.map((arg, index) => `${index + 1}. ${arg}`).join('\n');
      
      // If there are numbered points, replace them; otherwise, insert before the next paragraph
      if (afterInsert.match(numberedArgsRegex)) {
        appealContent = beforeInsert + afterInsert.replace(numberedArgsRegex, newArguments);
      } else {
        const nextParagraphIndex = afterInsert.indexOf('\n\n');
        if (nextParagraphIndex !== -1) {
          appealContent = beforeInsert + newArguments + afterInsert.substring(nextParagraphIndex);
        } else {
          appealContent = beforeInsert + newArguments + afterInsert;
        }
      }
    }
  }
  
  // Add a personalized, empathetic opening if this is a significant amount
  if (documentData.billedAmount && documentData.billedAmount > 1000) {
    const openingPara = appealContent.match(/To Whom It May Concern:\n\n([^]*)I am writing to appeal/);
    if (openingPara && openingPara[1] === '') {
      const newOpening = 'To Whom It May Concern:\n\nI hope this letter finds you well. I am facing significant financial burden due to this unexpected medical expense, which is creating hardship for me and my family. ';
      appealContent = appealContent.replace('To Whom It May Concern:\n\nI am writing to appeal', newOpening + 'I am writing to appeal');
    }
  }
  
  // Add legal references based on appeal type
  const legalReferences = generateLegalReferences(appealType, documentData);
  if (legalReferences) {
    // Find a good insertion point near the end of the letter
    const insertionPoints = [
      'Please reconsider this claim',
      'Thank you for your prompt attention',
      'Sincerely,'
    ];
    
    for (const point of insertionPoints) {
      const insertIndex = appealContent.indexOf(point);
      if (insertIndex !== -1) {
        // Insert before this point
        appealContent = appealContent.substring(0, insertIndex) +
          `${legalReferences}\n\n` +
          appealContent.substring(insertIndex);
        break;
      }
    }
  }
  
  return appealContent;
};

/**
 * Generate enhanced arguments for medical necessity appeals
 */
const generateMedicalNecessityArguments = (documentData) => {
  const args = [
    `My healthcare provider determined that ${documentData.serviceDescription || 'this service'} was medically necessary based on my specific health condition and medical history.`,
    `The treatment aligns with standard medical practice for my diagnosis of ${documentData.diagnosisCodes && documentData.diagnosisCodes.length > 0 ? documentData.diagnosisCodes.join(', ') : 'my condition'}.`,
    `The denial cited "${documentData.denialReason || 'lack of medical necessity'}" which contradicts my provider's clinical assessment of my specific situation.`
  ];
  
  // Add additional argument if procedure codes are available
  if (documentData.procedureCodes && documentData.procedureCodes.length > 0) {
    args.push(`The procedure codes (${documentData.procedureCodes.join(', ')}) accurately reflect the medically necessary services I received.`);
  }
  
  return args;
};

/**
 * Generate enhanced arguments for prior authorization appeals
 */
const generatePriorAuthArguments = (documentData) => {
  return [
    `The urgency of my medical situation made it impossible to obtain prior authorization before receiving this ${documentData.serviceDescription || 'treatment'}.`,
    `My provider made reasonable attempts to secure authorization but was unable to complete the process due to circumstances beyond our control.`,
    `Delaying treatment to wait for authorization would have posed significant risk to my health and well-being.`
  ];
};

/**
 * Generate enhanced arguments for out-of-network appeals
 */
const generateOutOfNetworkArguments = (documentData) => {
  return [
    `No in-network providers were available who could provide the specialized care I needed for ${documentData.serviceDescription || 'my condition'}.`,
    `The quality of care and expertise required for my specific medical situation necessitated the use of ${documentData.providerName || 'this out-of-network provider'}.`,
    `My insurance policy includes provisions for out-of-network coverage when in-network providers are inadequate or unavailable.`
  ];
};

/**
 * Generate enhanced arguments for coding error appeals
 */
const generateCodingErrorArguments = (documentData) => {
  const args = [
    `The denial appears to be based on a coding or billing error that does not reflect the actual service provided.`,
    `The correct procedure should be classified under ${documentData.procedureCodes && documentData.procedureCodes.length > 0 ? documentData.procedureCodes.join(', ') : 'the appropriate billing code'}.`
  ];
  
  if (documentData.diagnosisCodes && documentData.diagnosisCodes.length > 0) {
    args.push(`My diagnosis codes (${documentData.diagnosisCodes.join(', ')}) support the medical necessity of this procedure.`);
  } else {
    args.push(`My documented medical condition supports the necessity of this procedure.`);
  }
  
  return args;
};

/**
 * Generate enhanced arguments for not covered appeals
 */
const generateNotCoveredArguments = (documentData) => {
  return [
    `My policy documentation indicates that ${documentData.serviceDescription || 'this type of service'} should be covered under my plan benefits.`,
    `The denial incorrectly categorizes this service as not covered when it falls under my policy's provisions for covered medical care.`,
    `Similar services have been covered by my plan in the past, establishing precedent for coverage of this type of care.`
  ];
};

/**
 * Generate generic enhanced arguments
 */
const generateGenericArguments = (documentData) => {
  const args = [
    `The service I received was medically appropriate and necessary for my health condition.`,
    `The denial does not properly consider the specific circumstances of my case and medical needs.`
  ];
  
  // Add financial impact if we have amount data
  if (documentData.billedAmount) {
    args.push(`This denial creates significant financial burden for me, as the total bill amounts to ${documentData.billedAmount ? '$' + documentData.billedAmount.toFixed(2) : 'a substantial amount'}.`);
  } else {
    args.push(`My provider has confirmed the appropriateness of this care for my specific medical situation.`);
  }
  
  return args;
};

/**
 * Generate enhanced arguments for pre-authorization conflict appeals
 */
const generatePreAuthConflictArguments = (documentData) => {
  return [
    `The initial pre-authorization at [Provider Name] with 50% coverage creates a significant financial barrier to obtaining medically necessary care for a potentially serious condition.`,
    `Insurance policies should not prevent patients from seeking more cost-effective treatment options, particularly when the treatment itself is already deemed medically necessary through an existing pre-authorization.`,
    `Multiple facilities routinely provide identical medical services with different coverage levels; inflexible pre-authorization policies that prevent utilizing better-covered options create undue financial hardship and jeopardize patient care.`,
    `Administrative barriers to obtaining a second pre-authorization create dangerous treatment delays for a potentially life-threatening condition that requires immediate diagnosis and intervention.`
  ];
};

/**
 * Generate enhanced arguments for urgency override appeals
 */
const generateUrgencyOverrideArguments = (documentData) => {
  return [
    `My physician has confirmed that this kidney mass requires immediate diagnostic biopsy to determine if cancer is present, and any administrative delay significantly increases the risk of metastasis.`,
    `Standard insurance protocols should have medical exceptions for clinically urgent situations where treatment delays could result in disease progression and significantly worse outcomes.`,
    `While I understand insurance has standard authorization protocols, this case presents an unusual combination of administrative barriers and medical urgency that requires immediate intervention to protect my health.`,
    `Medical evidence clearly demonstrates that early intervention for potential kidney cancer significantly improves survival rates, making this issue one of genuine life-threatening urgency rather than mere convenience.`
  ];
};

/**
 * Generate enhanced arguments for clinical trial appeals
 */
const generateClinicalTrialArguments = (documentData) => {
  const clinicalTrialId = 
    (documentData.academicInfo && documentData.academicInfo.clinicalTrialId) || 
    '[Clinical Trial ID]';
  
  const irbNumber = 
    (documentData.academicInfo && documentData.academicInfo.irbNumber) || 
    '[IRB Number]';
    
  const trialPhase = 
    (documentData.academicInfo && documentData.academicInfo.studyPhase) || 
    '[Phase]';
  
  return [
    `This clinical trial (${clinicalTrialId}) is a ${trialPhase} trial that fully meets all requirements defined in the Medicare Clinical Trial Policy (NCD 310.1) for coverage of routine costs.`,
    `The services being billed represent ROUTINE CARE COSTS that would be covered outside of a clinical trial setting and are not specifically research-related charges, as clearly documented in the trial's costing sheet.`,
    `As a designated NCI Cancer Center, the University of Miami Sylvester Comprehensive Cancer Center's clinical trials undergo rigorous review, and this trial has received full IRB approval (IRB #${irbNumber}).`,
    `The patient meets all eligibility criteria for participation in this trial, which represents an appropriate and potentially superior treatment option for their specific diagnosis based on current medical literature.`,
    `The distinction between routine care costs (which are covered) and research costs (which are not billed to insurance) has been clearly documented and adhered to in accordance with Medicare guidelines and standard billing practices for clinical trials.`
  ];
};

/**
 * Generate enhanced arguments for academic exception appeals
 */
const generateAcademicExceptionArguments = (documentData) => {
  return [
    `The University of Miami Health System is the ONLY academic medical center in South Florida with the full range of subspecialty expertise required to properly diagnose and treat this patient's condition.`,
    `The complexity of this case required academic subspecialty expertise that is not available at community hospitals, as evidenced by the need for coordinated care across multiple specialized departments.`,
    `Our faculty physicians have specialized training, research experience, and treatment protocols specifically for this condition that are not available elsewhere in the region.`,
    `The patient's diagnosis represents a rare or complex condition that requires the level of expertise, technology, and multidisciplinary approach only available at a major academic medical center.`,
    `Previous cases of this nature have been approved for academic medical center care by your organization, establishing precedent for coverage of these specialized services when community facilities lack equivalent capabilities.`
  ];
};

/**
 * Generate enhanced arguments for teaching physician appeals
 */
const generateTeachingPhysicianArguments = (documentData) => {
  const teachingPhysician = 
    (documentData.academicInfo && documentData.academicInfo.teachingPhysician && documentData.academicInfo.teachingPhysician.name) || 
    '[Teaching Physician Name]';
  
  return [
    `Dr. ${teachingPhysician} was physically present during the key portions of this service and personally performed or supervised all aspects of patient care as fully documented in the medical record.`,
    `The documentation fully meets all Medicare teaching physician guidelines as specified in the Medicare Claims Processing Manual, Chapter 12, Section 100, with appropriate attestations recorded.`,
    `The proper GC modifier was applied to the claim to indicate services performed in part by a resident under the direction of a teaching physician, in full compliance with Medicare billing requirements.`,
    `The teaching physician's personal presence and participation in the service is clearly documented with appropriate attestation statements in the medical record, meeting all regulatory requirements.`,
    `The University of Miami Health System maintains rigorous compliance with all teaching physician billing guidelines while fulfilling our educational mission as South Florida's only academic medical center.`
  ];
};

/**
 * Generate legal references based on appeal type
 */
const generateLegalReferences = (appealType, documentData) => {
  const references = {
    'medicalNecessity': 'Under the Affordable Care Act, health plans must cover medically necessary treatments as determined by healthcare providers. Additionally, I am exercising my right to appeal as guaranteed by federal regulation 45 CFR § 147.136.',
    'priorAuthorization': 'Federal regulations under ERISA (29 CFR § 2560.503-1) ensure my right to appeal coverage denials and provide for review of extenuating circumstances affecting prior authorization.',
    'outOfNetwork': 'The No Surprises Act protects patients from certain unexpected medical bills and ensures appropriate coverage for necessary out-of-network care when in-network providers are insufficient.',
    'codingError': 'CMS guidelines stipulate that medical billing codes must accurately reflect the services provided, and administrative errors should not result in denial of medically necessary care.',
    'notCovered': 'My appeal is submitted under my rights established in the Employee Retirement Income Security Act (ERISA) and subsequent regulations that mandate fair claims handling practices.',
    'preAuthConflict': 'The Affordable Care Act prohibits unreasonable barriers to necessary medical care. Under 29 CFR § 2560.503-1(f)(2)(i), expedited review must be provided where "the application of the time periods for making determinations would seriously jeopardize the life or health of the claimant." This situation clearly qualifies for expedited review.',
    'urgencyOverride': 'Under both State and Federal law, insurers must provide coverage for emergency and urgent care. Per 29 CFR § 2590.715-2719A(b), health insurance issuers must cover emergency services without prior authorization, and must not restrict coverage based on administrative requirements that delay essential treatment for serious medical conditions. Furthermore, insurance internal review procedures must provide for expedited consideration of cases involving urgent care, per 29 CFR § 2560.503-1(g)(2).',
    'clinicalTrial': 'Coverage for routine costs associated with qualifying clinical trials is mandated under Section 2709 of the Public Health Service Act, as added by the Affordable Care Act. Additionally, Medicare NCD 310.1 establishes coverage criteria for routine costs in clinical trials. As a designated NCI cancer center, the University of Miami Sylvester Comprehensive Cancer Center\'s clinical trials meet these established criteria for coverage.',
    'academicException': 'Under Florida Statute 641.513 and the Federal EMTALA regulations, patients requiring specialized services must be treated at facilities with appropriate capabilities. The University of Miami Health System\'s unique capabilities as South Florida\'s only academic medical center with comprehensive subspecialty expertise qualifies these services for coverage under both statutory requirements and the patient\'s benefit plan provisions for specialized care.',
    'teachingPhysician': 'Medicare Claims Processing Manual, Chapter 12, Section 100 explicitly outlines the documentation requirements for teaching physicians, which have been fully met in this case. Additionally, CMS Transmittal 4283 clarifies the teaching physician requirements which this claim satisfies. The denial contradicts established Medicare teaching physician billing guidelines that our institution has rigorously followed.'
  };
  
  // Add Florida-specific legal references if applicable
  if (documentData && documentData.floridaPayerInfo) {
    const floridaReferences = {
      'medicalNecessity': ' Furthermore, Florida Statute 627.6131 and 641.3155 establish specific requirements for claim payment and denial, including detailed explanation requirements for denials based on medical necessity.',
      'priorAuthorization': ' Additionally, under Florida Statute 627.42392, when prior authorization has been received, payment for the authorized service cannot be denied as not medically necessary.',
      'outOfNetwork': ' As required by Florida Statute 627.64194, certain out-of-network services must be covered at in-network rates when no in-network provider with appropriate training and experience is available to treat the insured.',
      'clinicalTrial': ' Florida Statute 627.4239 further requires coverage for routine patient care costs when a patient participates in approved clinical trials for life-threatening diseases.'
    };
    
    // Append Florida-specific references when available
    if (floridaReferences[appealType]) {
      references[appealType] += floridaReferences[appealType];
    }
  }
  
  return references[appealType] || 'I am exercising my legal right to appeal this decision as provided by state and federal regulations governing health insurance claims.';
};

/**
 * Analyze denial reason to identify appeal strategy and generate content
 * @param {Object} documentData - Extracted data from document
 * @returns {Object} Appeal strategy and content
 */
const generateAppeal = (documentData) => {
  // Identify appropriate appeal strategy
  const appealStrategy = identifyAppealStrategy(documentData.denialReason, documentData.denialCode);
  
  // Generate enhanced appeal content using AI
  const appealContent = generateAIEnhancedContent(
    documentData, 
    appealStrategy.templateId,
    appealStrategy.appealType
  );
  
  // Calculate confidence score based on available data
  const aiConfidence = calculateConfidence(documentData, appealStrategy);
  
  // Generate appeal deadline warning if needed
  let deadlineWarning = null;
  if (documentData.appealDeadline) {
    const now = new Date();
    const deadline = new Date(documentData.appealDeadline);
    const daysRemaining = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
    
    if (daysRemaining < 0) {
      deadlineWarning = {
        type: 'expired',
        message: 'The appeal deadline has already passed. The insurance company may reject this appeal due to timeliness.',
        daysRemaining: daysRemaining
      };
    } else if (daysRemaining <= 3) {
      deadlineWarning = {
        type: 'urgent',
        message: `Urgent: Only ${daysRemaining} day(s) remaining to submit this appeal. Submit immediately.`,
        daysRemaining: daysRemaining
      };
    } else if (daysRemaining <= 7) {
      deadlineWarning = {
        type: 'warning',
        message: `Warning: Only ${daysRemaining} days remaining to submit this appeal.`,
        daysRemaining: daysRemaining
      };
    }
  }
  
  // Suggest additional evidence based on available data
  const suggestedEvidence = generateSuggestedEvidence(documentData, appealStrategy);
  
  return {
    appealType: appealStrategy.appealType,
    appealTemplate: appealStrategy.templateId,
    appealContent,
    suggestedEvidence,
    aiConfidence,
    deadlineWarning,
    relevantCodes: {
      procedureCodes: documentData.procedureCodes || [],
      diagnosisCodes: documentData.diagnosisCodes || []
    }
  };
};

/**
 * Generate more customized suggested evidence based on the document data
 * @param {Object} documentData - Extracted data from document
 * @param {Object} appealStrategy - Identified appeal strategy
 * @returns {Array} Customized suggested evidence
 */
const generateSuggestedEvidence = (documentData, appealStrategy) => {
  // Start with the basic suggested evidence
  const suggestedEvidence = [...appealStrategy.suggestedEvidence];
  
  // Add specific evidence suggestions based on document data
  switch (appealStrategy.appealType) {
    case 'medicalNecessity':
      if (documentData.diagnosisCodes && documentData.diagnosisCodes.length > 0) {
        suggestedEvidence.push(`Medical documentation confirming diagnosis codes: ${documentData.diagnosisCodes.join(', ')}`);
      }
      break;
      
    case 'codingError':
      if (documentData.procedureCodes && documentData.procedureCodes.length > 0) {
        suggestedEvidence.push(`Documentation supporting procedure codes: ${documentData.procedureCodes.join(', ')}`);
      }
      break;
      
    case 'priorAuthorization':
      suggestedEvidence.push('Proof of any attempts to obtain authorization');
      if (documentData.serviceDate) {
        suggestedEvidence.push('Documentation showing the urgent nature of the service');
      }
      break;
  }
  
  // Add provider documentation if provider info exists
  if (documentData.providerInfo && documentData.providerInfo.name) {
    suggestedEvidence.push(`Letter from ${documentData.providerInfo.name} confirming medical necessity`);
  }
  
  return suggestedEvidence;
};

/**
 * Calculate confidence score for the generated appeal
 * @param {Object} documentData - Extracted data from document
 * @param {Object} appealStrategy - Identified appeal strategy
 * @returns {number} Confidence score between 0 and 1
 */
const calculateConfidence = (documentData, appealStrategy) => {
  // Start with a base confidence
  let confidence = 0.5;
  
  // Adjust based on data completeness - critical fields
  const criticalFields = ['claimNumber', 'serviceDate', 'denialReason', 'denialCode'];
  const presentCriticalFields = criticalFields.filter(field => documentData[field]);
  confidence += (presentCriticalFields.length / criticalFields.length) * 0.2;
  
  // Adjust based on supporting data completeness
  const supportingFields = ['patientName', 'memberId', 'serviceDescription', 'procedureCodes', 'diagnosisCodes'];
  const presentSupportingFields = supportingFields.filter(field => {
    if (Array.isArray(documentData[field])) {
      return documentData[field].length > 0;
    }
    return documentData[field];
  });
  confidence += (presentSupportingFields.length / supportingFields.length) * 0.1;
  
  // Adjust based on denial reason clarity
  if (documentData.denialReason) {
    const denialLower = documentData.denialReason.toLowerCase();
    // Check how clearly the denial matches known patterns
    const matchStrength = Object.keys(DENIAL_TYPE_MAPPINGS).some(keyword => 
      denialLower.includes(keyword)) ? 0.2 : 0.1;
    confidence += matchStrength;
  }
  
  // Adjust based on presence of denial code
  if (documentData.denialCode && DENIAL_CODE_MAPPINGS[documentData.denialCode]) {
    confidence += 0.1;
  }
  
  // Ensure confidence is between 0 and 1
  return Math.min(Math.max(confidence, 0), 1);
};

/**
 * Evaluate the potential success of an appeal based on historical data
 * @param {Object} appealData - Appeal information
 * @returns {Object} Success prediction information
 */
const predictAppealSuccess = (appealData) => {
  // Base success rates by appeal type (mock data)
  const baseSuccessRates = {
    medicalNecessity: 0.72,
    priorAuthorization: 0.65,
    outOfNetwork: 0.58,
    experimentalTreatment: 0.45,
    codingError: 0.85,
    notCovered: 0.50,
    preAuthConflict: 0.62,
    urgencyOverride: 0.70,
    clinicalTrial: 0.78,
    academicException: 0.67,
    teachingPhysician: 0.82,
    other: 0.50
  };
  
  let successProbability = baseSuccessRates[appealData.appealType] || 0.5;
  
  // Adjust based on insurance carrier (mock adjustment)
  const carrierAdjustments = {
    'Blue Cross Blue Shield': 0.05,
    'Florida Blue': 0.08,
    'AvMed': 0.07,
    'Aetna': -0.02,
    'UnitedHealthcare': 0.0,
    'Cigna': 0.03,
    'Humana': -0.05,
    'Medicare': 0.05,
    'Medicaid': -0.08
  };
  
  if (appealData.insuranceCarrier && carrierAdjustments[appealData.insuranceCarrier]) {
    successProbability += carrierAdjustments[appealData.insuranceCarrier];
  }
  
  // Adjust based on denial amount (higher amounts might be harder to appeal)
  if (appealData.deniedAmount) {
    if (appealData.deniedAmount > 5000) {
      successProbability -= 0.1;
    } else if (appealData.deniedAmount < 500) {
      successProbability += 0.05;
    }
  }
  
  // Adjust based on data completeness
  if (appealData.dataCompleteness) {
    successProbability += (appealData.dataCompleteness * 0.1);
  }
  
  // Adjust based on presence of specific codes
  if (appealData.diagnosisCodes && appealData.diagnosisCodes.length > 0) {
    successProbability += 0.05;
  }
  
  if (appealData.procedureCodes && appealData.procedureCodes.length > 0) {
    successProbability += 0.05;
  }
  
  // Ensure probability is between 0 and 1
  successProbability = Math.min(Math.max(successProbability, 0), 1);
  
  // Generate factors affecting success
  const factors = [];
  
  if (successProbability > 0.7) {
    factors.push('High success rate for this type of appeal');
  } else if (successProbability < 0.4) {
    factors.push('Lower historical success rate for this type of appeal');
  }
  
  if (appealData.insuranceCarrier && carrierAdjustments[appealData.insuranceCarrier] > 0) {
    factors.push(`${appealData.insuranceCarrier} typically has better appeal outcomes`);
  } else if (appealData.insuranceCarrier && carrierAdjustments[appealData.insuranceCarrier] < 0) {
    factors.push(`${appealData.insuranceCarrier} can be more challenging for appeals`);
  }
  
  if (appealData.deniedAmount && appealData.deniedAmount > 5000) {
    factors.push('Higher dollar amount appeals face more scrutiny');
  }
  
  if (appealData.diagnosisCodes && appealData.diagnosisCodes.length > 0) {
    factors.push('Specific diagnosis codes strengthen your case');
  }
  
  if (appealData.procedureCodes && appealData.procedureCodes.length > 0) {
    factors.push('Specific procedure codes strengthen your case');
  }
  
  // Suggest specific actions based on appeal type
  const recommendedActions = [];
  
  switch (appealData.appealType) {
    case 'medicalNecessity':
      recommendedActions.push('Get a letter from your provider explaining why the service was medically necessary');
      break;
    case 'codingError':
      recommendedActions.push('Ask your provider to review and confirm the diagnosis and procedure codes');
      break;
    case 'priorAuthorization':
      recommendedActions.push('Collect any evidence showing attempts to obtain authorization or emergency circumstances');
      break;
    case 'outOfNetwork':
      recommendedActions.push('Document why in-network providers were not available or suitable');
      break;
    case 'preAuthConflict':
      recommendedActions.push('Obtain documentation of both pre-authorization attempts (initial 50% and attempted 80%)');
      recommendedActions.push('Get a physician letter emphasizing the medical urgency of kidney biopsy');
      recommendedActions.push('Prepare a financial hardship statement showing inability to afford the 50% option');
      break;
    case 'urgencyOverride':
      recommendedActions.push('Obtain an urgent physician statement detailing risks of delaying kidney biopsy');
      recommendedActions.push('Request your physician call the insurer\'s medical director directly');
      recommendedActions.push('Mark all communications as "URGENT MEDICAL NECESSITY OVERRIDE REQUEST"');
      break;
    case 'clinicalTrial':
      recommendedActions.push('Include IRB approval documentation for the clinical trial');
      recommendedActions.push('Provide costing sheet separating routine costs from research costs');
      recommendedActions.push('Attach the UHealth Clinical Research Billing checklist');
      recommendedActions.push('Include letter from Sylvester Comprehensive Cancer Center Director if applicable');
      break;
    case 'academicException':
      recommendedActions.push('Obtain letter from UHealth department chair/division chief');
      recommendedActions.push('Document why community hospital care would be insufficient');
      recommendedActions.push('Provide literature supporting need for academic medical center expertise');
      recommendedActions.push('List all subspecialties involved in patient\'s care');
      break;
    case 'teachingPhysician':
      recommendedActions.push('Submit complete medical record with teaching physician attestations highlighted');
      recommendedActions.push('Include the UHealth teaching physician billing policy documentation');
      recommendedActions.push('Verify GC/GE modifier was properly applied');
      recommendedActions.push('Get teaching physician attestation of presence during key portions');
      break;
  }
  
  return {
    successProbability,
    factors,
    recommendedActions,
    recommendedAction: successProbability > 0.4 ? 'appeal' : 'review'
  };
};

/**
 * Generate letter content for a document
 * @param {Object} document - Document model
 * @param {string} templateId - Template ID
 * @returns {Object} Generated appeal information
 */
const generateLetterContent = async (document, templateId) => {
  // Extract relevant data from document
  const documentData = document.extractedData || {};
  
  // Add additional fields from document model
  documentData.extractedText = document.extractedText;
  
  // If template ID is not specified, identify it based on document data
  const identifiedTemplate = 
    templateId || 
    identifyAppealStrategy(documentData.denialReason, documentData.denialCode).templateId;
  
  // Generate the appeal with AI enhancement
  return generateAppeal(documentData);
};

/**
 * Get insurer-specific appeal requirements
 * @param {string} insurerName - Name of the insurance company
 * @returns {Object|null} Insurer requirements or null if not found
 */
const getInsurerRequirements = (insurerName) => {
  // Check for exact match
  if (INSURER_REQUIREMENTS[insurerName]) {
    return INSURER_REQUIREMENTS[insurerName];
  }
  
  // Check for partial matches
  for (const [key, requirements] of Object.entries(INSURER_REQUIREMENTS)) {
    if (insurerName && insurerName.includes(key)) {
      return requirements;
    }
  }
  
  // Return null if no match found
  return null;
};

/**
 * Generate follow-up plan for an appeal
 * @param {Object} appeal - Appeal document
 * @returns {Array} Array of follow-up action items
 */
const generateFollowUpPlan = async (appeal) => {
  // Check if it's even a submitted appeal
  if (appeal.status !== 'submitted') {
    return [];
  }

  // Load related document to get insurer info
  const document = await Document.findById(appeal.relatedDocument);
  if (!document) {
    return [];
  }
  
  // Get insurer name from related document
  const insurerName = document.extractedData && document.extractedData.insuranceCarrier;
  
  // Get insurer-specific requirements if available
  const insurerRequirements = getInsurerRequirements(insurerName);
  
  // Determine if this is an urgent appeal
  const isUrgent = appeal.denialInfo && appeal.denialInfo.deniedAmount > 5000;
  
  // Select appropriate follow-up schedule
  const schedule = isUrgent ? URGENT_FOLLOW_UP_SCHEDULE : FOLLOW_UP_SCHEDULE;
  
  // Calculate submission date
  const submissionDate = appeal.submissionDetails.submittedDate || appeal.updatedAt;
  
  // Generate follow-up items
  const followUps = schedule.map(item => {
    // Calculate scheduled date
    const scheduledDate = new Date(submissionDate);
    scheduledDate.setDate(scheduledDate.getDate() + item.days);
    
    // Determine contact method based on insurer requirements if available
    const contactMethod = insurerRequirements && insurerRequirements.formats.includes(item.method) 
      ? item.method 
      : (insurerRequirements ? insurerRequirements.formats[0] : item.method);
    
    // Determine contact details based on method
    let contactDetails = '';
    if (insurerRequirements) {
      switch (contactMethod) {
        case 'electronic':
          contactDetails = insurerRequirements.portalUrl;
          break;
        case 'fax':
          contactDetails = 'See insurer contact information';
          break;
        case 'phone':
          contactDetails = 'See back of insurance card';
          break;
        case 'mail':
          contactDetails = 'Appeals Department';
          break;
      }
    }
    
    return {
      type: item.action,
      scheduled: scheduledDate,
      daysAfterSubmission: item.days,
      contactMethod: contactMethod,
      contactDetails: contactDetails,
      isComplete: false,
      notes: '',
      appealId: appeal._id
    };
  });
  
  return followUps;
};

/**
 * Generate submission requirements list for a specific appeal
 * @param {Object} appeal - Appeal document
 * @returns {Object} Submission requirements and missing items
 */
const getSubmissionRequirements = async (appeal) => {
  // Load related document to get insurer info
  const document = await Document.findById(appeal.relatedDocument);
  if (!document) {
    return {
      requirements: [],
      missing: [],
      complete: false
    };
  }
  
  // Get insurer name from related document
  const insurerName = document.extractedData && document.extractedData.insuranceCarrier;
  
  // Get insurer-specific requirements if available
  const insurerRequirements = getInsurerRequirements(insurerName);
  
  if (!insurerRequirements) {
    // Generic requirements if no insurer-specific ones found
    return {
      requirements: [
        'Copy of denial letter/EOB',
        'Appeal letter',
        'Supporting medical documentation',
        'Provider contact information'
      ],
      missing: [],
      complete: true // Assume complete for generic
    };
  }
  
  // Check which required fields are missing
  const missingItems = [];
  
  // Check document data for missing requirements
  const extractedData = document.extractedData || {};
  const providerInfo = extractedData.providerInfo || {};
  
  // Check each requirement
  for (const req of insurerRequirements.requirements) {
    let isMissing = false;
    
    if (req.includes('Provider NPI') && !providerInfo.npi) {
      isMissing = true;
    } else if (req.includes('Provider TIN') && !providerInfo.tin) {
      isMissing = true;
    } else if (req.includes('Claim number') && !extractedData.claimNumber) {
      isMissing = true;
    } else if (req.includes('Member ID') && !extractedData.memberId) {
      isMissing = true;
    } else if (req.includes('Date of service') && !extractedData.serviceDate) {
      isMissing = true;
    } else if (req.includes('CPT/HCPCS codes') && (!extractedData.procedureCodes || extractedData.procedureCodes.length === 0)) {
      isMissing = true;
    }
    
    if (isMissing) {
      missingItems.push(req);
    }
  }
  
  return {
    requirements: insurerRequirements.requirements,
    missing: missingItems,
    complete: missingItems.length === 0,
    formName: insurerRequirements.appealFormName,
    portalUrl: insurerRequirements.portalUrl,
    appealFormLocation: insurerRequirements.appealFormLocation
  };
};

/**
 * Generate a checklist for appeal submission
 * @param {Object} appeal - Appeal document
 * @returns {Object} Submission checklist with requirements and statuses
 */
const generateSubmissionChecklist = async (appealId) => {
  // Load the appeal
  const appeal = await Appeal.findById(appealId).populate('relatedDocument');
  if (!appeal) {
    throw new Error('Appeal not found');
  }
  
  // Get submission requirements
  const requirementsResult = await getSubmissionRequirements(appeal);
  
  // Generate general checklist items
  const checklist = [
    {
      item: 'Appeal letter prepared',
      isComplete: appeal.appealContent && appeal.appealContent.length > 100,
      importance: 'critical'
    },
    {
      item: 'Original denial documentation attached',
      isComplete: appeal.relatedDocument ? true : false,
      importance: 'critical'
    },
    {
      item: 'Appeal deadline verified',
      isComplete: appeal.relatedDocument && 
                appeal.relatedDocument.extractedData && 
                appeal.relatedDocument.extractedData.appealDeadline ? true : false,
      importance: 'high'
    },
    {
      item: 'Provider contact information included',
      isComplete: appeal.relatedDocument && 
                appeal.relatedDocument.extractedData && 
                appeal.relatedDocument.extractedData.providerInfo &&
                appeal.relatedDocument.extractedData.providerInfo.name ? true : false,
      importance: 'medium'
    }
  ];
  
  // Add insurer-specific requirements
  if (requirementsResult.requirements && requirementsResult.requirements.length > 0) {
    requirementsResult.requirements.forEach(req => {
      checklist.push({
        item: req,
        isComplete: !requirementsResult.missing.includes(req),
        importance: 'high'
      });
    });
  }
  
  // Add form-specific items if known
  if (requirementsResult.formName) {
    checklist.push({
      item: `Complete ${requirementsResult.formName}`,
      isComplete: false, // Need user verification
      importance: 'high',
      formName: requirementsResult.formName,
      portalUrl: requirementsResult.portalUrl
    });
  }
  
  // Calculate completeness
  const criticalItems = checklist.filter(item => item.importance === 'critical');
  const criticalComplete = criticalItems.every(item => item.isComplete);
  
  const highItems = checklist.filter(item => item.importance === 'high');
  const highComplete = highItems.filter(item => item.isComplete).length / highItems.length;
  
  const overallComplete = checklist.filter(item => item.isComplete).length / checklist.length;
  
  // Return the checklist with status
  return {
    appealId: appeal._id,
    checklist,
    status: {
      criticalComplete,
      highItemsCompletionRate: highComplete,
      overallCompletionRate: overallComplete,
      readyToSubmit: criticalComplete && highComplete >= 0.75
    },
    submissionMethods: requirementsResult.formName ? 
      {
        preferred: requirementsResult.appealFormLocation ? 'portal' : 'mail',
        portalUrl: requirementsResult.portalUrl,
        portalLocation: requirementsResult.appealFormLocation,
        formName: requirementsResult.formName
      } : null
  };
};

module.exports = {
  identifyAppealStrategy,
  generateAppealContent,
  generateAppeal,
  predictAppealSuccess,
  generateLetterContent,
  generateFollowUpPlan,
  getSubmissionRequirements,
  generateSubmissionChecklist
};