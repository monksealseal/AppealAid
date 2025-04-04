/**
 * Mock Data Provider
 * 
 * This module provides mock data and simulated API responses for development and testing.
 * It should only be used in development environments before the real backend is integrated.
 */

// Mock Documents
export const mockDocuments = [
  {
    id: 'd001',
    name: 'Blue Cross Explanation of Benefits - 05/15/2023',
    type: 'Explanation of Benefits',
    status: 'Processed',
    uploadDate: '2023-05-20T08:00:00Z',
    provider: 'Blue Cross Blue Shield',
    claimNumber: 'BCBS-2023-078945',
    denialReason: 'Not Medically Necessary',
    serviceDate: '2023-05-10T00:00:00Z',
    patientName: 'John Smith',
    amount: 1250.75,
    deniedAmount: 875.50,
    thumbnailUrl: '/images/documents/eob-thumbnail.png',
    extractedData: {
      policyNumber: 'BCBS-POL-12345',
      serviceDescription: 'MRI Lower Back - CPT 72148',
      denialCode: 'B445',
      appealDeadline: '2023-08-18T00:00:00Z',
      providerInfo: {
        name: 'City Medical Imaging',
        address: '1234 Medical Way, Boston, MA 02115',
        phone: '(555) 123-4567',
        npi: '1234567890',
      }
    }
  },
  {
    id: 'd002',
    name: 'Aetna Denial Letter - 06/02/2023',
    type: 'Denial Letter',
    status: 'Processed',
    uploadDate: '2023-06-05T14:30:00Z',
    provider: 'Aetna Health Insurance',
    claimNumber: 'AET-2023-123456',
    denialReason: 'Out of Network',
    serviceDate: '2023-05-28T00:00:00Z',
    patientName: 'Jane Doe',
    amount: 2340.00,
    deniedAmount: 2340.00,
    thumbnailUrl: '/images/documents/denial-thumbnail.png',
    extractedData: {
      policyNumber: 'AET-POL-67890',
      serviceDescription: 'Physical Therapy Sessions x5',
      denialCode: 'OON-243',
      appealDeadline: '2023-09-02T00:00:00Z',
      providerInfo: {
        name: 'Elite Physical Therapy',
        address: '789 Health Blvd, Cambridge, MA 02139',
        phone: '(555) 987-6543',
        npi: '9876543210',
      }
    }
  },
  {
    id: 'd003',
    name: 'UnitedHealthcare EOB - 07/12/2023',
    type: 'Explanation of Benefits',
    status: 'Processed',
    uploadDate: '2023-07-15T10:15:00Z',
    provider: 'UnitedHealthcare',
    claimNumber: 'UHC-2023-987654',
    denialReason: 'Prior Authorization Required',
    serviceDate: '2023-07-05T00:00:00Z',
    patientName: 'Michael Johnson',
    amount: 3450.25,
    deniedAmount: 3450.25,
    thumbnailUrl: '/images/documents/eob-thumbnail.png',
    extractedData: {
      policyNumber: 'UHC-POL-56789',
      serviceDescription: 'Outpatient Surgery - Knee Arthroscopy',
      denialCode: 'PA-112',
      appealDeadline: '2023-10-10T00:00:00Z',
      providerInfo: {
        name: 'Boston Surgical Center',
        address: '567 Medical Plaza, Boston, MA 02210',
        phone: '(555) 234-5678',
        npi: '2345678901',
      }
    }
  },
  {
    id: 'd004',
    name: 'Medical Report - Dr. Williams - 06/30/2023',
    type: 'Medical Report',
    status: 'Processed',
    uploadDate: '2023-07-02T09:45:00Z',
    provider: 'Dr. Sarah Williams',
    patientName: 'John Smith',
    thumbnailUrl: '/images/documents/report-thumbnail.png',
    extractedData: {
      doctorName: 'Dr. Sarah Williams',
      specialty: 'Orthopedic Surgery',
      diagnosisCodes: ['M54.5', 'M51.26'],
      diagnosis: 'Lumbar disc herniation with radiculopathy',
      recommendedTreatment: 'MRI of lumbar spine to assess herniated disc',
      medicalNecessity: 'Patient has failed 6 weeks of conservative treatment including PT and NSAIDs'
    }
  },
  {
    id: 'd005',
    name: 'Lab Results - Boston Clinical Labs - 07/20/2023',
    type: 'Lab Results',
    status: 'Processed',
    uploadDate: '2023-07-22T13:20:00Z',
    provider: 'Boston Clinical Laboratories',
    patientName: 'Jane Doe',
    thumbnailUrl: '/images/documents/lab-thumbnail.png',
    extractedData: {
      testType: 'Comprehensive Metabolic Panel',
      orderingPhysician: 'Dr. Robert Chen',
      abnormalResults: ['Elevated ALT', 'Elevated AST'],
      clinicalIndications: 'Suspected liver dysfunction',
    }
  }
];

// Template appeal letters based on denial reasons and template types
const appealLetterTemplates = {
  // Default template variations
  default: {
    'Not Medically Necessary': `
[CURRENT DATE]

[INSURANCE COMPANY NAME]
[INSURANCE COMPANY ADDRESS]
[CITY, STATE ZIP]

Re: Appeal for Claim Denial - Claim #[CLAIM_NUMBER]
Patient: [PATIENT_NAME]
Policy Number: [POLICY_NUMBER]
Date of Service: [SERVICE_DATE]
Service Denied: [SERVICE_DESCRIPTION]

Dear Claims Review Department:

I am writing to appeal the denial of coverage for [SERVICE_DESCRIPTION] that I received on [SERVICE_DATE]. According to the Explanation of Benefits dated [EOB_DATE], this claim was denied because the service was deemed "not medically necessary."

I believe this determination is incorrect for the following reasons:

1. My physician, [DOCTOR_NAME], recommended this procedure based on my medical condition and symptoms. The procedure was not elective but necessary to diagnose and treat my medical condition.

2. Prior to recommending this procedure, I had tried multiple conservative treatments including [LIST PREVIOUS TREATMENTS] which proved ineffective in resolving my symptoms.

3. Medical literature supports the use of [SERVICE_DESCRIPTION] for patients with my condition and symptoms.

4. The denial of this medically necessary treatment could lead to worsening of my condition and potentially more expensive treatments in the future.

I have attached the following documentation to support my appeal:
- A letter from my physician explaining the medical necessity
- My relevant medical records
- Clinical guidelines supporting the use of this procedure for my condition

According to my policy and applicable state law, I am entitled to a full and fair review of this denial. I request that you review this claim and provide coverage in accordance with my policy benefits.

If you require any additional information, please contact me at [PHONE_NUMBER] or [EMAIL]. I expect a written response to this appeal within 30 days, as required by law.

Sincerely,

[YOUR NAME]
[YOUR ADDRESS]
[YOUR PHONE]
[YOUR EMAIL]

cc: [STATE INSURANCE COMMISSIONER]
    [DOCTOR'S NAME]
`,

    'Out of Network': `
[CURRENT DATE]

[INSURANCE COMPANY NAME]
[INSURANCE COMPANY ADDRESS]
[CITY, STATE ZIP]

Re: Appeal for Out-of-Network Claim Denial - Claim #[CLAIM_NUMBER]
Patient: [PATIENT_NAME]
Policy Number: [POLICY_NUMBER]
Date of Service: [SERVICE_DATE]
Service Denied: [SERVICE_DESCRIPTION]

Dear Claims Review Department:

I am writing to appeal the denial of coverage for services provided by [PROVIDER_NAME] on [SERVICE_DATE]. According to the Explanation of Benefits dated [EOB_DATE], this claim was denied because the provider was out-of-network.

I believe this claim should be covered at the in-network benefit level for the following reasons:

1. I made reasonable efforts to find an in-network provider for this service but was unable to locate one within a reasonable distance from my home. The nearest in-network provider was [DISTANCE] miles away.

2. This service was urgently needed, and delaying treatment to find an in-network provider would have been detrimental to my health.

3. My policy states that out-of-network services should be covered at in-network rates when no in-network provider is available within a reasonable distance.

4. [PROVIDER_NAME] has expertise in treating my specific condition that is not available from in-network providers.

I have attached the following documentation to support my appeal:
- A list of in-network providers I contacted
- Documentation showing the distances to available in-network providers
- A letter from my referring physician explaining why this specific provider was recommended

According to my policy and applicable state law, I am entitled to a full and fair review of this denial. I request that you reconsider this claim and provide coverage at the in-network benefit level.

If you require any additional information, please contact me at [PHONE_NUMBER] or [EMAIL]. I expect a written response to this appeal within 30 days, as required by law.

Sincerely,

[YOUR NAME]
[YOUR ADDRESS]
[YOUR PHONE]
[YOUR EMAIL]

cc: [STATE INSURANCE COMMISSIONER]
    [DOCTOR'S NAME]
`,

    'Prior Authorization Required': `
[CURRENT DATE]

[INSURANCE COMPANY NAME]
[INSURANCE COMPANY ADDRESS]
[CITY, STATE ZIP]

Re: Appeal for Prior Authorization Denial - Claim #[CLAIM_NUMBER]
Patient: [PATIENT_NAME]
Policy Number: [POLICY_NUMBER]
Date of Service: [SERVICE_DATE]
Service Denied: [SERVICE_DESCRIPTION]

Dear Claims Review Department:

I am writing to appeal the denial of coverage for [SERVICE_DESCRIPTION] that I received on [SERVICE_DATE]. According to the Explanation of Benefits dated [EOB_DATE], this claim was denied because prior authorization was not obtained.

I believe this claim should be reconsidered for the following reasons:

1. My physician's office attempted to obtain prior authorization on [DATE] by [METHOD] but did not receive a timely response. (OR) I was not aware that this service required prior authorization as it was not clearly stated in my policy documents.

2. This service was medically necessary as documented by my physician, and would have been approved had prior authorization been properly processed.

3. The service was provided during an emergency situation where obtaining prior authorization was not feasible.

4. According to [STATE] law, insurers must provide a reasonable prior authorization process and cannot deny medically necessary treatment solely on the basis of administrative error.

I have attached the following documentation to support my appeal:
- Records showing attempts to obtain prior authorization
- A letter from my physician explaining the medical necessity of the service
- Medical records supporting the urgent nature of the treatment

I request that you review this claim and provide coverage in accordance with my policy benefits. The denial based solely on lack of prior authorization when the service was medically necessary constitutes an unfair practice.

If you require any additional information, please contact me at [PHONE_NUMBER] or [EMAIL]. I expect a written response to this appeal within 30 days, as required by law.

Sincerely,

[YOUR NAME]
[YOUR ADDRESS]
[YOUR PHONE]
[YOUR EMAIL]

cc: [STATE INSURANCE COMMISSIONER]
    [DOCTOR'S NAME]
`,

    'Other': `
[CURRENT DATE]

[INSURANCE COMPANY NAME]
[INSURANCE COMPANY ADDRESS]
[CITY, STATE ZIP]

Re: Appeal for Claim Denial - Claim #[CLAIM_NUMBER]
Patient: [PATIENT_NAME]
Policy Number: [POLICY_NUMBER]
Date of Service: [SERVICE_DATE]
Service Denied: [SERVICE_DESCRIPTION]

Dear Claims Review Department:

I am writing to appeal the denial of coverage for [SERVICE_DESCRIPTION] that I received on [SERVICE_DATE]. According to the Explanation of Benefits dated [EOB_DATE], this claim was denied because [REASON FOR DENIAL].

I believe this determination should be reconsidered for the following reasons:

1. The treatment I received was medically necessary as determined by my healthcare provider based on my diagnosed condition.

2. The denial reason does not appear to align with my policy coverage or the specific circumstances of my case.

3. I have reviewed my policy documents and believe this service should be covered under the [POLICY SECTION] provision.

4. Denial of this claim creates an undue financial burden for necessary medical care that was provided in good faith.

I have attached the following documentation to support my appeal:
- Relevant medical records documenting the necessity of this treatment
- A letter from my physician supporting the medical necessity
- Relevant sections of my policy document that I believe support coverage

According to my policy and applicable state law, I am entitled to a full and fair review of this denial. I request that you review this claim and provide coverage in accordance with my policy benefits.

If you require any additional information, please contact me at [PHONE_NUMBER] or [EMAIL]. I expect a written response to this appeal within 30 days, as required by law.

Sincerely,

[YOUR NAME]
[YOUR ADDRESS]
[YOUR PHONE]
[YOUR EMAIL]

cc: [STATE INSURANCE COMMISSIONER]
    [DOCTOR'S NAME]
`
  },
  
  // Detailed Medical Necessity template variations
  detailed: {
    'Not Medically Necessary': `
[CURRENT DATE]

[INSURANCE COMPANY NAME]
[INSURANCE COMPANY ADDRESS]
[CITY, STATE ZIP]

Re: Medical Necessity Appeal - Claim #[CLAIM_NUMBER]
Patient: [PATIENT_NAME]
Policy Number: [POLICY_NUMBER]
Date of Service: [SERVICE_DATE]
Service Denied: [SERVICE_DESCRIPTION]

Dear Medical Director and Claims Review Board:

I am writing to formally appeal the denial of coverage for [SERVICE_DESCRIPTION] that I received on [SERVICE_DATE]. According to the Explanation of Benefits dated [EOB_DATE], my claim was denied with the explanation that this service was "not medically necessary." After careful review of the clinical evidence, my medical history, and applicable medical guidelines, I firmly believe this determination is incorrect.

MEDICAL HISTORY AND NECESSITY
I have been diagnosed with [DIAGNOSIS] by Dr. [DOCTOR_NAME]. Prior to recommending the [SERVICE_DESCRIPTION], my physician documented the following clinical findings that demonstrate medical necessity:

1. Failed conservative treatment: I underwent [LIST PREVIOUS TREATMENTS] for [TIME PERIOD] with insufficient improvement in symptoms
2. Objective findings: [DESCRIBE OBJECTIVE FINDINGS] documented in medical records from [DATE]
3. Functional impairment: [DESCRIBE HOW CONDITION AFFECTS DAILY FUNCTIONING]
4. Progressive nature: My condition has demonstrated progression as evidenced by [EVIDENCE OF PROGRESSION]

CLINICAL EVIDENCE SUPPORTING MEDICAL NECESSITY
The clinical necessity of this procedure for my specific condition is well-established in peer-reviewed medical literature:

1. [CITATION 1] demonstrates [FINDING] in similar cases
2. [CITATION 2] shows success rates of [PERCENTAGE] for this procedure in patients with my clinical presentation
3. [MEDICAL SOCIETY/ORGANIZATION] clinical guidelines specifically recommend this procedure for patients with my clinical presentation (See attached guideline excerpt)
4. [COMPARATIVE STUDY] shows this procedure is more effective than alternative treatments for my specific condition

STANDARD OF CARE
Multiple medical societies and authoritative bodies recognize this procedure as standard of care for my condition, including:

1. [PROFESSIONAL SOCIETY 1] Clinical Practice Guideline on [TOPIC], page [PAGE NUMBER]
2. [PROFESSIONAL SOCIETY 2] Treatment Recommendations (enclosed)
3. [GOVERNMENT AGENCY] Treatment Guidelines

My physician has provided a detailed letter explaining why this treatment meets medical necessity criteria based on their clinical judgment, my specific circumstances, and established medical standards (see attached).

REBUTTAL TO SPECIFIC DENIAL REASONS
Your denial letter stated [QUOTE SPECIFIC DENIAL REASON]. However:

1. This determination contradicts your own policy language on page [PAGE] which states [POLICY LANGUAGE SUPPORTING COVERAGE]
2. The review does not appear to have considered the full extent of my medical records, specifically [POINT OUT MISSING CONSIDERATION]
3. The reason cited applies to a different clinical scenario than mine

RELEVANT POLICY PROVISIONS
My policy specifically provides coverage for [RELEVANT COVERED SERVICE] under [POLICY SECTION]. The denied service meets these criteria as evidenced by [EXPLANATION].

REQUESTED RESOLUTION
Based on the clinical evidence provided and applicable policy provisions, I respectfully request that you:

1. Overturn the denial and approve coverage for this medically necessary service
2. Process payment according to my policy benefits
3. Provide a written explanation if any portion of this appeal is denied

I have enclosed the following documentation to support my appeal:
- Complete medical records related to this condition
- Physician letter detailing medical necessity
- Relevant medical literature and guidelines
- Diagnostic test results
- Timeline of treatments and outcomes

Thank you for your thorough review of this appeal. I expect a written response within the timeframe required by state law. If you require any additional information, please contact me at [PHONE_NUMBER] or [EMAIL].

Sincerely,

[YOUR NAME]
[YOUR ADDRESS]
[YOUR PHONE]
[YOUR EMAIL]

Enclosures: [LIST]
cc: [STATE INSURANCE COMMISSIONER]
    [DOCTOR'S NAME]
    [STATE DEPARTMENT OF INSURANCE]
`,

    'Experimental or Investigational': `
[CURRENT DATE]

[INSURANCE COMPANY NAME]
[INSURANCE COMPANY ADDRESS]
[CITY, STATE ZIP]

Re: Appeal of "Experimental/Investigational" Denial - Claim #[CLAIM_NUMBER]
Patient: [PATIENT_NAME]
Policy Number: [POLICY_NUMBER]
Date of Service: [SERVICE_DATE]
Service Denied: [SERVICE_DESCRIPTION]

Dear Medical Director and Claims Review Board:

I am writing to formally appeal the denial of coverage for [SERVICE_DESCRIPTION] that I received on [SERVICE_DATE]. According to the Explanation of Benefits dated [EOB_DATE], my claim was denied with the determination that the procedure is "experimental or investigational." After thorough research and consultation with medical experts, I firmly believe this determination is incorrect and not consistent with current medical standards.

ESTABLISHED CLINICAL EVIDENCE
The procedure in question has substantial clinical evidence supporting its use:

1. FDA Approval: This procedure/treatment received FDA approval on [DATE] for the treatment of [CONDITION], which is my diagnosis (see attached FDA approval documentation)

2. Peer-Reviewed Literature: The safety and efficacy of this procedure have been established in multiple peer-reviewed studies:
   - [STUDY 1] published in [JOURNAL] ([YEAR]) included [NUMBER] patients and demonstrated [RESULTS]
   - [STUDY 2] published in [JOURNAL] ([YEAR]) showed [SPECIFIC OUTCOMES]
   - [META-ANALYSIS] published in [JOURNAL] ([YEAR]) analyzed [NUMBER] studies with [NUMBER] patients and concluded [CONCLUSION]

3. Medical Specialty Consensus: Multiple medical societies recognize this procedure as standard of care:
   - The [SPECIALTY SOCIETY] includes this procedure in their [YEAR] clinical practice guidelines (attached)
   - [SPECIALTY SOCIETY 2] endorses this procedure for patients with my clinical presentation in their position statement dated [DATE]
   - [CONSENSUS PANEL] of experts concluded in [YEAR] that this procedure is appropriate for patients with [SPECIFIC CHARACTERISTICS]

4. Coverage by Other Insurers: This procedure is covered by:
   - Medicare/Medicaid (see attached coverage determination)
   - [MAJOR INSURER 1]
   - [MAJOR INSURER 2]
   - [GOVERNMENT HEALTH PLAN]

SPECIFIC TO MY CASE
The medical necessity and appropriateness of this specific procedure for my condition are well-established:

1. My diagnosis of [DIAGNOSIS] was confirmed by [DIAGNOSTIC METHOD]
2. I have failed standard treatments including [LIST FAILED TREATMENTS]
3. My physician, Dr. [DOCTOR NAME], a board-certified specialist in [SPECIALTY], has determined this procedure is medically necessary based on my specific clinical presentation (see attached letter)
4. My case meets all the criteria outlined in the [SPECIALTY SOCIETY] guidelines for appropriate use of this procedure

POLICY PROVISIONS
My insurance policy states that treatments will not be considered experimental when [QUOTE POLICY LANGUAGE]. My case satisfies these requirements because:
1. [EXPLANATION OF HOW TREATMENT MEETS POLICY DEFINITION]
2. [EXPLANATION OF HOW TREATMENT IS NOT EXCLUDED]

LEGAL CONSIDERATIONS
Under [STATE] law, insurers are required to provide coverage for treatments that are:
1. Recognized as appropriate by the medical community
2. Supported by credible scientific evidence published in peer-reviewed literature
3. Not primarily for the convenience of the patient or provider

The denied procedure meets all these criteria, as demonstrated by the evidence provided.

REQUESTED RESOLUTION
Based on the substantial evidence provided, I respectfully request that you:
1. Reverse the determination that this procedure is experimental or investigational
2. Approve coverage for the procedure in accordance with my policy benefits
3. Process payment for the claim

I have enclosed the following documentation to support my appeal:
- FDA approval documentation
- Peer-reviewed studies supporting efficacy
- Guidelines from medical specialty societies
- Letter from my physician explaining medical necessity
- Relevant medical records
- Coverage policies from other major insurers

Thank you for your thorough and prompt review of this appeal. I expect a written response within the timeframe required by state law. If you require any additional information, please contact me at [PHONE_NUMBER] or [EMAIL].

Sincerely,

[YOUR NAME]
[YOUR ADDRESS]
[YOUR PHONE]
[YOUR EMAIL]

Enclosures: [LIST]
cc: [STATE INSURANCE COMMISSIONER]
    [DOCTOR'S NAME]
    [STATE DEPARTMENT OF INSURANCE]
`,

    'Other': `
[CURRENT DATE]

[INSURANCE COMPANY NAME]
[INSURANCE COMPANY ADDRESS]
[CITY, STATE ZIP]

Re: Medical Necessity Appeal - Claim #[CLAIM_NUMBER]
Patient: [PATIENT_NAME]
Policy Number: [POLICY_NUMBER]
Date of Service: [SERVICE_DATE]
Service Denied: [SERVICE_DESCRIPTION]

Dear Medical Director and Claims Review Board:

I am writing to formally appeal the denial of coverage for [SERVICE_DESCRIPTION] that I received on [SERVICE_DATE]. According to the Explanation of Benefits dated [EOB_DATE], this claim was denied because [REASON FOR DENIAL]. After careful review of the clinical evidence, my medical records, and applicable policy provisions, I firmly believe this determination should be reconsidered.

CLINICAL BACKGROUND
I have been diagnosed with [DIAGNOSIS] by Dr. [DOCTOR_NAME], a board-certified [SPECIALTY] specialist. My condition is characterized by:
- Symptoms: [LIST SYMPTOMS]
- Duration: [DURATION OF CONDITION]
- Impact on functioning: [DESCRIBE FUNCTIONAL LIMITATIONS]
- Objective findings: [LIST OBJECTIVE FINDINGS]

MEDICAL NECESSITY DOCUMENTATION
The medical necessity of the denied service is supported by:

1. Detailed clinical assessment by my physician documenting [SPECIFIC FINDINGS]
2. Diagnostic test results showing [TEST RESULTS]
3. Failed prior treatments including:
   - [TREATMENT 1] for [DURATION] with [RESULT]
   - [TREATMENT 2] for [DURATION] with [RESULT]
   - [TREATMENT 3] for [DURATION] with [RESULT]
4. Progressive worsening of my condition as evidenced by [EVIDENCE OF PROGRESSION]

CLINICAL EVIDENCE
The effectiveness and appropriateness of this service for my condition is supported by:

1. [CLINICAL STUDY 1] published in [JOURNAL] ([YEAR]) showing [OUTCOME]
2. [CLINICAL STUDY 2] published in [JOURNAL] ([YEAR]) demonstrating [FINDINGS]
3. [PROFESSIONAL SOCIETY] clinical practice guidelines recommending this intervention for patients with my presentation (see page [PAGE NUMBER] of attached guidelines)
4. [TREATMENT ALGORITHM] published by [AUTHORITATIVE SOURCE] indicating this service as appropriate for my clinical scenario

POLICY PROVISIONS
According to my policy, coverage is provided for [COVERED SERVICE CATEGORY] when [COVERAGE CRITERIA]. My case meets these criteria because:
1. [EXPLANATION OF HOW SERVICE MEETS COVERAGE CRITERIA]
2. [EXPLANATION OF HOW DENIAL REASON IS NOT APPLICABLE]

ADDITIONAL CONSIDERATIONS
1. Cost-effectiveness: Providing coverage for this service now is likely to prevent more costly interventions in the future due to [EXPLANATION]
2. Quality of life: Denial of this service significantly impacts my ability to [DESCRIBE IMPACT]
3. Standard of care: This service represents the standard of care for my condition according to [AUTHORITATIVE SOURCE]

REQUESTED RESOLUTION
I respectfully request that you:
1. Review the comprehensive clinical information provided
2. Reverse the denial of coverage
3. Process this claim according to my policy benefits

I have enclosed the following documentation to support my appeal:
- Complete medical records related to this condition
- Relevant diagnostic test results
- Physician letter explaining medical necessity
- Scientific literature supporting this intervention
- Applicable clinical guidelines
- Previous treatment records and outcomes

Thank you for your thorough consideration of this appeal. I expect a written response within the timeframe required by state law. If you require any additional information, please contact me at [PHONE_NUMBER] or [EMAIL].

Sincerely,

[YOUR NAME]
[YOUR ADDRESS]
[YOUR PHONE]
[YOUR EMAIL]

Enclosures: [LIST]
cc: [STATE INSURANCE COMMISSIONER]
    [DOCTOR'S NAME]
    [STATE DEPARTMENT OF INSURANCE]
`
  },
  
  // Network appeal template
  network: {
    'Out of Network': `
[CURRENT DATE]

[INSURANCE COMPANY NAME]
[INSURANCE COMPANY ADDRESS]
[CITY, STATE ZIP]

Re: Out-of-Network Appeal - Claim #[CLAIM_NUMBER]
Patient: [PATIENT_NAME]
Policy Number: [POLICY_NUMBER]
Date of Service: [SERVICE_DATE]
Provider: [PROVIDER_NAME]
Service Denied: [SERVICE_DESCRIPTION]

Dear Network Adequacy Review Department:

I am writing to appeal the out-of-network denial of my claim for services provided by [PROVIDER_NAME] on [SERVICE_DATE]. I am requesting that these services be processed at the in-network benefit level due to network inadequacy and the specific circumstances of my case.

NETWORK INADEQUACY
My policy promises access to appropriate providers within reasonable time and distance standards. However:

1. Provider Availability: I contacted [NUMBER] in-network providers within a [NUMBER]-mile radius who were either:
   - Not accepting new patients
   - Had appointment wait times exceeding [NUMBER] weeks/months
   - Did not have expertise in treating my specific condition

   Specific providers contacted:
   - [PROVIDER 1]: [DATE], [REASON UNAVAILABLE]
   - [PROVIDER 2]: [DATE], [REASON UNAVAILABLE]
   - [PROVIDER 3]: [DATE], [REASON UNAVAILABLE]

2. Geographic Access: The nearest in-network provider with appropriate expertise is located [DISTANCE] miles from my home, which exceeds your policy's accessibility standards of [STANDARD] miles.

3. Specialist Expertise: My condition of [DIAGNOSIS] requires specialized expertise in [SPECIALTY AREA]. None of the in-network providers in my area have this specific expertise or experience with my rare/complex condition.

4. Continuity of Care: I was previously under the care of [PROVIDER_NAME] for this condition when they were in-network. When this provider left the network, it was medically inappropriate to transfer my care mid-treatment due to [REASON].

5. Timely Access: The urgency of my medical condition required prompt treatment. The earliest available appointment with an in-network provider was [DATE], which would have resulted in harmful delay.

APPLICABLE POLICY PROVISIONS AND REGULATIONS
My insurance policy contains the following relevant provisions:
1. Section [SECTION]: "The plan will provide benefits at the in-network level when an in-network provider is not available within [DISTANCE/TIME]."
2. Section [SECTION]: "Services will be covered at in-network levels when specialized care for complex conditions is not available in-network."

Additionally, [STATE] insurance regulations require:
1. [REGULATION CITATION]: Insurers must provide coverage at in-network rates when the plan's network lacks providers who can provide needed services.
2. [REGULATION CITATION]: Networks must include providers within [STANDARD] miles/minutes of a member's residence.

SUPPORTING DOCUMENTATION
I have enclosed the following documentation:
1. Records of my attempts to find in-network providers (phone logs, emails)
2. Map showing distances to available in-network providers
3. Letter from my referring physician explaining the need for this specific provider
4. Medical records documenting the complexity of my condition
5. Documentation of the provider's specialized expertise
6. Evidence of appointment wait times for in-network providers

REQUESTED RESOLUTION
Based on the network inadequacy documented above, I respectfully request that:
1. The services provided by [PROVIDER_NAME] be processed at the in-network benefit level
2. My out-of-pocket expenses be limited to what they would have been had I seen an in-network provider
3. Any future services from this provider for this condition be covered at in-network levels until an appropriate in-network alternative is available

I would also request a review of your network adequacy for treating [CONDITION] in my geographic area, as this appears to be a significant gap affecting other members as well.

Thank you for your consideration of this appeal. I expect a written response within the timeframe required by state law. If you require any additional information, please contact me at [PHONE_NUMBER] or [EMAIL].

Sincerely,

[YOUR NAME]
[YOUR ADDRESS]
[YOUR PHONE]
[YOUR EMAIL]

Enclosures: [LIST]
cc: [STATE INSURANCE COMMISSIONER]
    [DOCTOR'S NAME]
    [STATE DEPARTMENT OF INSURANCE]
    [PROVIDER_NAME]
`
  },
  
  // Prior authorization template
  authorization: {
    'Prior Authorization Required': `
[CURRENT DATE]

[INSURANCE COMPANY NAME]
[INSURANCE COMPANY ADDRESS]
[CITY, STATE ZIP]

Re: Prior Authorization Appeal - Claim #[CLAIM_NUMBER]
Patient: [PATIENT_NAME]
Policy Number: [POLICY_NUMBER]
Date of Service: [SERVICE_DATE]
Service Denied: [SERVICE_DESCRIPTION]

Dear Prior Authorization Review Department:

I am writing to appeal the denial of coverage for [SERVICE_DESCRIPTION] that I received on [SERVICE_DATE]. According to the Explanation of Benefits dated [EOB_DATE], this claim was denied because prior authorization was not obtained. I am requesting reconsideration based on the specific circumstances of this case and applicable policy provisions and regulations.

CIRCUMSTANCES SURROUNDING AUTHORIZATION
I believe this claim should be reconsidered for the following reasons:

1. Attempts to Obtain Authorization:
   □ My physician's office attempted to obtain prior authorization on [DATE(S)] via [METHOD] (see attached documentation)
   □ Authorization request was submitted on [DATE] but no response was received before the medical necessity of the service required proceeding
   □ Insurance representatives provided incorrect information regarding authorization requirements on [DATE] when we called to inquire (representative name: [NAME], call reference #: [REFERENCE])
   □ We were unaware authorization was required because:
     • The requirement was not clearly communicated in my plan documents
     • Similar services had been covered previously without authorization
     • We were incorrectly informed this service did not require authorization

2. Emergency/Urgent Circumstances:
   □ The service was provided under urgent/emergent circumstances where delaying treatment to obtain authorization would have:
     • Caused significant pain or suffering
     • Risked serious deterioration of my health condition
     • Potentially resulted in more extensive and costly treatment later
   □ My physician determined the service was immediately necessary based on [CLINICAL FINDING]

3. Medical Necessity:
   □ The service was unquestionably medically necessary as documented in my medical records
   □ Had authorization been requested, it would have been approved based on established medical criteria
   □ My condition of [DIAGNOSIS] met all clinical criteria for this service according to [CLINICAL GUIDELINES]

POLICY PROVISIONS AND REGULATIONS
My insurance policy contains the following relevant provisions:
1. Section [SECTION]: "The plan will not deny claims solely for lack of prior authorization when the service is medically necessary and criteria for the service are met."
2. Section [SECTION]: "In emergency situations, members should seek necessary care and notification requirements are waived."

Additionally, [STATE] insurance regulations include:
1. [REGULATION CITATION]: Insurers cannot deny claims solely for lack of prior authorization when the service would have been approved had authorization been requested.
2. [REGULATION CITATION]: Authorization requirements must be reasonable and clearly communicated to members.
3. [REGULATION CITATION]: Utilization review decisions must be based on medical necessity, not administrative requirements.

SUPPORTING DOCUMENTATION
I have enclosed the following to support my appeal:
1. Medical records documenting the necessity of the service
2. Evidence of attempts to obtain authorization (if applicable)
3. Physician statement explaining why the service was necessary and met criteria
4. Documentation of any emergency/urgent circumstances
5. Evidence of misinformation regarding authorization requirements (if applicable)

REQUESTED RESOLUTION
I respectfully request that:
1. The denial be reversed and the claim processed based on medical necessity
2. My financial responsibility be limited to what it would have been had authorization been obtained
3. Any applicable timeframe for retrospective authorization be waived due to the circumstances described

The requirement for prior authorization serves an administrative function but should not override the provision of necessary medical care or create financial hardship when a service is otherwise covered under my policy and meets all medical criteria.

Thank you for your review of this appeal. I expect a written response within the timeframe required by state law. If you require any additional information, please contact me at [PHONE_NUMBER] or [EMAIL].

Sincerely,

[YOUR NAME]
[YOUR ADDRESS]
[YOUR PHONE]
[YOUR EMAIL]

Enclosures: [LIST]
cc: [STATE INSURANCE COMMISSIONER]
    [DOCTOR'S NAME]
    [STATE DEPARTMENT OF INSURANCE]
`
  },
  
  // Coding error template
  coding: {
    'Coding Error': `
[CURRENT DATE]

[INSURANCE COMPANY NAME]
[INSURANCE COMPANY ADDRESS]
[CITY, STATE ZIP]

Re: Coding Error Appeal - Claim #[CLAIM_NUMBER]
Patient: [PATIENT_NAME]
Policy Number: [POLICY_NUMBER]
Date of Service: [SERVICE_DATE]
Service Denied: [SERVICE_DESCRIPTION]

Dear Claims Processing Department:

I am writing to appeal the denial of my claim for [SERVICE_DESCRIPTION] that I received on [SERVICE_DATE]. According to the Explanation of Benefits dated [EOB_DATE], this claim was denied due to a coding error or billing issue. After reviewing the claim details and consulting with my healthcare provider's billing department, I believe this denial was made in error and the claim should be reconsidered.

CLAIM DETAILS
- Date of Service: [SERVICE_DATE]
- Provider: [PROVIDER_NAME]
- Procedure/Service: [SERVICE_DESCRIPTION]
- Billed Amount: [AMOUNT]
- Claim Number: [CLAIM_NUMBER]
- Denial Reason: [EXACT DENIAL REASON FROM EOB]

CODING ISSUE IDENTIFICATION
After review, we have identified the following issue with how this claim was processed:

□ Incorrect Procedure Code
   • Incorrect code submitted: [INCORRECT CODE]
   • Correct code should be: [CORRECT CODE]
   • Explanation: [EXPLANATION OF CORRECT CODING]
   • Reference: [CODING REFERENCE/GUIDELINES]

□ Modifier Issue
   • Missing modifier: [MODIFIER]
   • Incorrectly applied modifier: [INCORRECT MODIFIER]
   • Explanation: [EXPLANATION OF MODIFIER ISSUE]

□ Diagnosis Code Issue
   • Incorrect/incomplete diagnosis code: [INCORRECT CODE]
   • Correct diagnosis code: [CORRECT CODE]
   • Medical documentation supports the diagnosis of [DIAGNOSIS]

□ Bundling/Unbundling Error
   • Services were incorrectly [BUNDLED/UNBUNDLED]
   • According to [CODING GUIDELINES], these services should be billed as [EXPLANATION]

□ Place of Service Error
   • Incorrect place of service code: [INCORRECT CODE]
   • Correct place of service: [CORRECT CODE]
   • Service was provided in [LOCATION]

□ Provider Information Error
   • Incorrect provider information: [INCORRECT INFO]
   • Correct provider information: [CORRECT INFO]

□ Duplicate Claim Issue
   • This service is not a duplicate as it represents a [DIFFERENT SERVICE/DIFFERENT DATE]
   • The supposedly duplicate claim [CLAIM NUMBER] was for [EXPLANATION OF DIFFERENCE]

CORRECTED CLAIM INFORMATION
My healthcare provider has submitted a corrected claim with the proper coding on [DATE]. The corrected claim includes:
• Correct procedure code(s): [CODE(S)]
• Correct diagnosis code(s): [CODE(S)]
• Appropriate modifier(s): [MODIFIER(S)]
• Correct place of service: [POS]

SUPPORTING DOCUMENTATION
I have enclosed the following to support this appeal:
1. Copy of the original claim and denial
2. Corrected claim (if available)
3. Statement from provider's billing department explaining the coding correction
4. Relevant medical records supporting the services provided
5. Applicable coding guidelines or references

POLICY PROVISIONS
My insurance policy provides coverage for [TYPE OF SERVICE] when [COVERAGE CRITERIA]. The service I received meets these criteria as evidenced by the medical documentation. The initial denial was based solely on a coding/billing issue rather than medical necessity or policy coverage.

REQUESTED RESOLUTION
I respectfully request that you:
1. Review the corrected claim information
2. Process the claim with the correct coding
3. Provide benefits according to my policy for this medically necessary service

This issue appears to be a simple administrative error rather than a question of whether the service is covered under my policy. The service provided was medically necessary and is a covered benefit, but was initially processed incorrectly due to a coding issue.

Thank you for your prompt attention to this matter. I expect a written response within the timeframe required by state law. If you require any additional information, please contact me at [PHONE_NUMBER] or [EMAIL].

Sincerely,

[YOUR NAME]
[YOUR ADDRESS]
[YOUR PHONE]
[YOUR EMAIL]

Enclosures: [LIST]
cc: [PROVIDER BILLING DEPARTMENT]
    [STATE INSURANCE COMMISSIONER]
`
  }
};

// Function to generate appeal letter based on document and appeal info
export const generateAppealLetter = (document, templateId = 'default') => {
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Get the template based on denial reason and template type
  const templateType = templateId || 'default';
  const templatesByType = appealLetterTemplates[templateType] || appealLetterTemplates.default;
  
  // Get specific template based on denial reason or fall back to 'Other'
  let template = templatesByType[document.denialReason] || 
                 templatesByType['Other'] || 
                 appealLetterTemplates.default['Other'];
  
  // Extract data from document
  const {
    provider,
    claimNumber,
    patientName,
    serviceDate,
    extractedData = {}
  } = document;
  
  const formattedServiceDate = new Date(serviceDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const uploadDate = new Date(document.uploadDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Replace placeholders in template
  let letter = template
    .replace('[CURRENT DATE]', today)
    .replace('[INSURANCE COMPANY NAME]', provider || '[INSURANCE COMPANY NAME]')
    .replace('[INSURANCE COMPANY ADDRESS]', extractedData.providerInfo?.address || '[INSURANCE COMPANY ADDRESS]')
    .replace('[CITY, STATE ZIP]', '[CITY, STATE ZIP]')
    .replace(/\[CLAIM_NUMBER\]/g, claimNumber || '[CLAIM_NUMBER]')
    .replace(/\[PATIENT_NAME\]/g, patientName || '[PATIENT_NAME]')
    .replace(/\[POLICY_NUMBER\]/g, extractedData.policyNumber || '[POLICY_NUMBER]')
    .replace(/\[SERVICE_DATE\]/g, formattedServiceDate || '[SERVICE_DATE]')
    .replace(/\[SERVICE_DESCRIPTION\]/g, extractedData.serviceDescription || '[SERVICE_DESCRIPTION]')
    .replace(/\[EOB_DATE\]/g, uploadDate || '[EOB_DATE]')
    .replace(/\[DOCTOR_NAME\]/g, extractedData.doctorName || '[DOCTOR_NAME]')
    .replace(/\[PROVIDER_NAME\]/g, extractedData.providerInfo?.name || provider || '[PROVIDER_NAME]')
    .replace(/\[YOUR NAME\]/g, patientName || '[YOUR NAME]')
    .replace(/\[YOUR ADDRESS\]/g, '[YOUR ADDRESS]')
    .replace(/\[YOUR PHONE\]/g, '[YOUR PHONE]')
    .replace(/\[YOUR EMAIL\]/g, '[YOUR EMAIL]')
    .replace(/\[STATE INSURANCE COMMISSIONER\]/g, '[STATE INSURANCE COMMISSIONER]')
    .replace(/\[LIST PREVIOUS TREATMENTS\]/g, 'physical therapy, medication, and rest')
    .replace(/\[PHONE_NUMBER\]/g, '[PHONE_NUMBER]')
    .replace(/\[EMAIL\]/g, '[EMAIL]')
    .replace(/\[DIAGNOSIS\]/g, extractedData.diagnosis || '[DIAGNOSIS]')
    .replace(/\[MEDICAL SOCIETY NAMES\]/g, 'American Medical Association, American College of Physicians')
    .replace(/\[CITE SPECIFIC STUDIES IF KNOWN\]/g, 'recent peer-reviewed studies in the Journal of Medicine')
    .replace(/\[DATE\]/g, '2018')
    .replace(/\[NAMES IF KNOWN\]/g, 'Medicare, Cigna, and Humana')
    .replace(/\[RELATED CATEGORY\]/g, 'diagnostic')
    .replace(/\[TYPE OF SERVICE\]/g, 'this type of service')
    .replace(/\[AMOUNT\]/g, '$2,000')
    .replace(/\[DATES\]/g, 'January 15 and February 3, 2023')
    .replace(/\[CORRECT CODE\]/g, 'CPT 12345')
    .replace(/\[DATE OF RESUBMISSION\]/g, 'July 25, 2023')
    .replace(/\[DESCRIBE PREVIOUS SERVICE\]/g, 'an initial consultation')
    .replace(/\[DESCRIBE CURRENT SERVICE\]/g, 'a follow-up procedure')
    .replace(/\[REASON FOR DENIAL\]/g, document.denialReason || 'unspecified reasons')
    .replace(/\[POLICY SECTION\]/g, 'Medical Services and Treatments')
    .replace(/\[STATE\]/g, 'Massachusetts')
    .replace(/\[DISTANCE\]/g, '50')
    .replace(/\[METHOD\]/g, 'phone')
    .replace(/\[TIME PERIOD\]/g, '6 weeks')
    .replace(/\[DESCRIBE OBJECTIVE FINDINGS\]/g, 'decreased range of motion and positive test results')
    .replace(/\[DESCRIBE HOW CONDITION AFFECTS DAILY FUNCTIONING\]/g, 'inability to perform routine activities without severe pain')
    .replace(/\[EVIDENCE OF PROGRESSION\]/g, 'worsening symptoms documented in medical records')
    .replace(/\[CITATION 1\]/g, 'Johnson et al. (2022) in the Journal of Medical Science')
    .replace(/\[CITATION 2\]/g, 'Smith et al. (2021) in the New England Journal of Medicine')
    .replace(/\[PERCENTAGE\]/g, '85%')
    .replace(/\[MEDICAL SOCIETY OR ORGANIZATION\]/g, 'American College of Physicians')
    .replace(/\[COMPARATIVE STUDY\]/g, 'Brown et al. (2023)')
    .replace(/\[PROFESSIONAL SOCIETY 1\]/g, 'American Medical Association')
    .replace(/\[PROFESSIONAL SOCIETY 2\]/g, 'National Institute for Health and Care Excellence')
    .replace(/\[GOVERNMENT AGENCY\]/g, 'Centers for Medicare and Medicaid Services')
    .replace(/\[PAGE\]/g, '24')
    .replace(/\[POINT OUT MISSING CONSIDERATION\]/g, 'my specialist\'s recommendation and recent test results')
    .replace(/\[SPECIALTY\]/g, 'Orthopedics')
    .replace(/\[LIST SYMPTOMS\]/g, 'severe pain, limited mobility, and numbness')
    .replace(/\[DURATION OF CONDITION\]/g, 'over 6 months')
    .replace(/\[DESCRIBE FUNCTIONAL LIMITATIONS\]/g, 'inability to stand or walk for more than 10 minutes')
    .replace(/\[LIST OBJECTIVE FINDINGS\]/g, 'positive MRI findings, abnormal gait, and decreased range of motion')
    .replace(/\[SPECIFIC FINDINGS\]/g, 'progressive symptom severity and failure of conservative management')
    .replace(/\[TEST RESULTS\]/g, 'evidence of disc herniation at L4-L5')
    .replace(/\[TREATMENT 1\]/g, 'physical therapy')
    .replace(/\[DURATION\]/g, '8 weeks')
    .replace(/\[RESULT\]/g, 'minimal improvement')
    .replace(/\[TREATMENT 2\]/g, 'anti-inflammatory medication')
    .replace(/\[TREATMENT 3\]/g, 'activity modification')
    .replace(/\[CLINICAL STUDY 1\]/g, 'Johnson et al.')
    .replace(/\[JOURNAL\]/g, 'Spine')
    .replace(/\[YEAR\]/g, '2022')
    .replace(/\[OUTCOME\]/g, '72% improvement in patients with similar presentations')
    .replace(/\[CLINICAL STUDY 2\]/g, 'Martinez et al.')
    .replace(/\[FINDINGS\]/g, 'statistically significant reduction in pain and disability scores')
    .replace(/\[PAGE NUMBER\]/g, '42')
    .replace(/\[AUTHORITATIVE SOURCE\]/g, 'National Institute for Health')
    .replace(/\[COVERED SERVICE CATEGORY\]/g, 'diagnostic procedures')
    .replace(/\[COVERAGE CRITERIA\]/g, 'medically necessary to diagnose or treat a covered condition')
    .replace(/\[EXPLANATION OF HOW SERVICE MEETS COVERAGE CRITERIA\]/g, 'the service was ordered to diagnose the cause of persistent symptoms')
    .replace(/\[EXPLANATION OF HOW DENIAL REASON IS NOT APPLICABLE\]/g, 'the denial reason cites a policy exclusion that does not apply to diagnostic procedures')
    .replace(/\[EXPLANATION\]/g, 'progression of the condition requiring more invasive treatment')
    .replace(/\[DESCRIBE IMPACT\]/g, 'work, perform daily activities, and maintain quality of life')
    .replace(/\[NUMBER\]/g, '5')
    .replace(/\[REASON UNAVAILABLE\]/g, 'not accepting new patients')
    .replace(/\[PROVIDER 1\]/g, 'Dr. Smith')
    .replace(/\[PROVIDER 2\]/g, 'Dr. Johnson')
    .replace(/\[PROVIDER 3\]/g, 'Metropolitan Medical Group')
    .replace(/\[STANDARD\]/g, '30')
    .replace(/\[SPECIALTY AREA\]/g, 'spinal disorders')
    .replace(/\[REASON\]/g, 'the complexity of my condition and ongoing treatment plan')
    .replace(/\[SECTION\]/g, '4.3.2')
    .replace(/\[REGULATION CITATION\]/g, 'Code 45 CFR § 156.230')
    .replace(/\[NUMBER WEEKS OR MONTHS\]/g, '6 weeks')
    .replace(/\[CLINICAL FINDING\]/g, 'rapidly worsening symptoms and risk of permanent damage')
    .replace(/\[CLINICAL GUIDELINES\]/g, 'American College of Physicians guidelines')
    .replace(/\[EXACT DENIAL REASON FROM EOB\]/g, 'Claim denied: Coding error - procedure code inconsistent with diagnosis')
    .replace(/\[INCORRECT CODE\]/g, 'CPT 99214')
    .replace(/\[CORRECT CODE\]/g, 'CPT 99215')
    .replace(/\[EXPLANATION OF CORRECT CODING\]/g, 'the complexity of the visit required comprehensive history and examination')
    .replace(/\[CODING REFERENCE GUIDELINES\]/g, 'CPT Manual 2023, E/M Services Guidelines')
    .replace(/\[MODIFIER\]/g, '25')
    .replace(/\[INCORRECT MODIFIER\]/g, '59')
    .replace(/\[EXPLANATION OF MODIFIER ISSUE\]/g, 'modifier 25 is required to indicate a significant, separately identifiable E/M service')
    .replace(/\[BUNDLED OR UNBUNDLED\]/g, 'bundled')
    .replace(/\[CODING GUIDELINES\]/g, 'National Correct Coding Initiative')
    .replace(/\[EXPLANATION\]/g, 'separate procedures due to different anatomical sites')
    .replace(/\[INCORRECT CODE\]/g, '11')
    .replace(/\[CORRECT CODE\]/g, '22')
    .replace(/\[LOCATION\]/g, 'outpatient hospital')
    .replace(/\[INCORRECT INFO\]/g, 'referring provider NPI')
    .replace(/\[CORRECT INFO\]/g, 'rendering provider NPI')
    .replace(/\[DIFFERENT SERVICE OR DATE\]/g, 'different procedure performed on the same date')
    .replace(/\[CLAIM NUMBER\]/g, 'CLM-123456')
    .replace(/\[EXPLANATION OF DIFFERENCE\]/g, 'the evaluation service, while this claim is for the procedure')
    .replace(/\[CODE\(S\)\]/g, 'CPT 99215-25')
    .replace(/\[POS\]/g, '22');
  
  return letter;
};

// Mock appeal creation
export const createMockAppeal = (appealData) => {
  // Find the document being appealed
  const document = mockDocuments.find(doc => doc.id === appealData.documentId);
  
  if (!document) {
    throw new Error('Document not found');
  }
  
  // Create a new appeal object
  const newAppeal = {
    id: `a${Date.now().toString().slice(-6)}`,
    documentId: appealData.documentId,
    title: appealData.title,
    description: appealData.description,
    denialReason: appealData.denialReason,
    additionalDetails: appealData.additionalDetails,
    attachments: appealData.attachments || [],
    templateId: appealData.templateId || 'default',
    letter: appealData.letter,
    status: 'Draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    document: {
      id: document.id,
      name: document.name,
      type: document.type,
      provider: document.provider,
      claimNumber: document.claimNumber,
    },
    timeline: [
      {
        date: new Date().toISOString(),
        status: 'Created',
        description: 'Appeal created',
      }
    ],
    nextSteps: [
      {
        id: 'review',
        title: 'Review appeal letter',
        description: 'Carefully review your appeal letter to ensure all information is correct',
        completed: true,
      },
      {
        id: 'print',
        title: 'Print appeal letter',
        description: 'Print your appeal letter for submission',
        completed: false,
      },
      {
        id: 'submit',
        title: 'Submit to insurance',
        description: 'Submit your appeal to your insurance company',
        completed: false,
      },
      {
        id: 'followup',
        title: 'Follow up',
        description: 'Follow up with your insurance company within 7-10 business days',
        completed: false,
      }
    ]
  };
  
  return newAppeal;
};

// Mock appeals list
export const mockAppeals = [
  {
    id: 'a001',
    documentId: 'd001',
    title: 'Appeal for MRI Denial - BCBS',
    description: 'Appeal for denied MRI of lower back',
    denialReason: 'Not Medically Necessary',
    status: 'Submitted',
    createdAt: '2023-06-12T14:35:00Z',
    updatedAt: '2023-06-15T10:20:00Z',
    submittedAt: '2023-06-15T10:20:00Z',
    templateId: 'default',
    document: {
      id: 'd001',
      name: 'Blue Cross Explanation of Benefits - 05/15/2023',
      type: 'Explanation of Benefits',
      provider: 'Blue Cross Blue Shield',
      claimNumber: 'BCBS-2023-078945',
    },
    timeline: [
      {
        date: '2023-06-12T14:35:00Z',
        status: 'Created',
        description: 'Appeal created',
      },
      {
        date: '2023-06-15T10:20:00Z',
        status: 'Submitted',
        description: 'Appeal submitted to insurance',
      }
    ],
    nextSteps: [
      {
        id: 'review',
        title: 'Review appeal letter',
        description: 'Carefully review your appeal letter to ensure all information is correct',
        completed: true,
      },
      {
        id: 'print',
        title: 'Print appeal letter',
        description: 'Print your appeal letter for submission',
        completed: true,
      },
      {
        id: 'submit',
        title: 'Submit to insurance',
        description: 'Submit your appeal to your insurance company',
        completed: true,
      },
      {
        id: 'followup',
        title: 'Follow up',
        description: 'Follow up with your insurance company within 7-10 business days',
        completed: false,
      }
    ],
    attachments: [
      {
        id: 'att001',
        name: 'MRI Requisition.pdf',
        type: 'application/pdf',
        size: 245000,
        uploadDate: '2023-06-12T15:30:00Z',
      },
      {
        id: 'att002',
        name: 'Doctor Note - Medical Necessity.pdf',
        type: 'application/pdf',
        size: 320000,
        uploadDate: '2023-06-12T15:35:00Z',
      }
    ]
  },
  {
    id: 'a002',
    documentId: 'd002',
    title: 'Appeal for Out-of-Network PT - Aetna',
    description: 'Appeal for out-of-network physical therapy sessions',
    denialReason: 'Out of Network',
    status: 'In Review',
    createdAt: '2023-07-05T09:15:00Z',
    updatedAt: '2023-07-08T16:40:00Z',
    submittedAt: '2023-07-08T16:40:00Z',
    templateId: 'network',
    document: {
      id: 'd002',
      name: 'Aetna Denial Letter - 06/02/2023',
      type: 'Denial Letter',
      provider: 'Aetna Health Insurance',
      claimNumber: 'AET-2023-123456',
    },
    timeline: [
      {
        date: '2023-07-05T09:15:00Z',
        status: 'Created',
        description: 'Appeal created',
      },
      {
        date: '2023-07-08T16:40:00Z',
        status: 'Submitted',
        description: 'Appeal submitted to insurance',
      },
      {
        date: '2023-07-20T11:25:00Z',
        status: 'In Review',
        description: 'Insurance company has begun reviewing the appeal',
      }
    ],
    nextSteps: [
      {
        id: 'review',
        title: 'Review appeal letter',
        description: 'Carefully review your appeal letter to ensure all information is correct',
        completed: true,
      },
      {
        id: 'print',
        title: 'Print appeal letter',
        description: 'Print your appeal letter for submission',
        completed: true,
      },
      {
        id: 'submit',
        title: 'Submit to insurance',
        description: 'Submit your appeal to your insurance company',
        completed: true,
      },
      {
        id: 'followup',
        title: 'Follow up',
        description: 'Follow up with your insurance company within 7-10 business days',
        completed: true,
      },
      {
        id: 'addinfo',
        title: 'Provide additional information',
        description: 'Insurance has requested additional information about your claim',
        completed: false,
      }
    ],
    attachments: [
      {
        id: 'att003',
        name: 'Physical Therapy Progress Notes.pdf',
        type: 'application/pdf',
        size: 475000,
        uploadDate: '2023-07-06T10:15:00Z',
      },
      {
        id: 'att004',
        name: 'In-Network Provider Distance Map.jpg',
        type: 'image/jpeg',
        size: 180000,
        uploadDate: '2023-07-06T10:20:00Z',
      },
      {
        id: 'att005',
        name: 'Specialist Referral Letter.pdf',
        type: 'application/pdf',
        size: 215000,
        uploadDate: '2023-07-06T10:25:00Z',
      }
    ]
  }
];