# Patient Service Features

This document outlines the patient-centric features implemented in the AppealAid system, which enhance the patient experience with clear financial information, consent management, and status updates.

## Table of Contents

1. [Eligibility Verification](#eligibility-verification)
2. [Cost Estimation](#cost-estimation)
3. [Patient Consent Management](#patient-consent-management)
4. [Patient-Friendly Status Updates](#patient-friendly-status-updates)
5. [Appeal Cost Impact Analysis](#appeal-cost-impact-analysis)
6. [API Endpoints](#api-endpoints)

## Eligibility Verification

The eligibility verification feature allows users to check a patient's insurance coverage for specific services.

### Key Features

- Real-time eligibility verification simulation
- Detailed benefit information including deductibles, copays, and coinsurance
- Network-specific coverage details
- Service-specific coverage and authorization requirements

### Usage

```javascript
// Sample usage
const patientInfo = {
  memberId: '123456789',
  dateOfBirth: '1980-05-15',
  firstName: 'John',
  lastName: 'Doe',
  insuranceCarrier: 'Blue Cross Blue Shield'
};

const serviceInfo = {
  serviceType: 'specialist',
  diagnosisCodes: ['J45.901', 'R06.02'],
  procedureCodes: ['99203']
};

const eligibilityResult = await patientService.verifyEligibility(patientInfo, serviceInfo);
```

## Cost Estimation

The cost estimation feature provides detailed estimates of patient financial responsibility for healthcare services.

### Key Features

- Calculation of patient responsibility based on insurance benefits
- Application of deductibles, copays, and coinsurance
- Estimation of insurer contribution
- Appeal-specific cost analysis

### Usage

```javascript
// Sample usage
const eligibilityData = fetchedEligibilityData;
const serviceInfo = {
  procedureCodes: ['99213'],
  facilityType: 'outpatient',
  providerStatus: 'inNetwork',
  billedAmount: 250
};

const appealInfo = {
  appealType: 'medicalNecessity',
  successProbability: 0.75
};

const costEstimate = await patientService.estimatePatientCost(eligibilityData, serviceInfo, appealInfo);
```

## Patient Consent Management

This feature handles the recording and tracking of patient consent for appeals processing.

### Key Features

- Documentation of consent method and date
- Customizable expiration dates
- Granular data sharing permissions
- Compliant with HIPAA regulations
- Automatic timeline updates

### Usage

```javascript
// Sample usage
const appealId = '60d5e...';
const consentInfo = {
  consentObtained: true,
  consentMethod: 'written',
  consentVerifiedBy: 'Dr. Jane Smith',
  dataSharePermissions: {
    allowProviderShare: true,
    allowInsurerShare: true,
    allowExternalReviewShare: false
  }
};

const consentResult = await patientService.recordPatientConsent(appealId, consentInfo);
```

## Patient-Friendly Status Updates

This feature provides clear, non-technical updates about appeal status in patient-friendly language.

### Key Features

- Status updates in plain language
- Multi-language support (English and Spanish)
- Timeline visualization with key dates
- Next steps and suggested actions
- Estimated resolution timeframes

### Usage

```javascript
// Sample usage
const appealId = '60d5e...';
const language = 'English'; // or 'Spanish'

const statusUpdate = await patientService.generatePatientStatusUpdate(appealId, language);
```

## Appeal Cost Impact Analysis

This feature provides patients with a clear understanding of the financial impact of their appeal.

### Key Features

- Current patient responsibility calculation
- Potential savings estimates
- Success probability assessment
- Expected resolution timeline
- Patient action recommendations

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/patient/verify-eligibility` | Verify patient insurance eligibility |
| POST | `/api/patient/estimate-cost` | Estimate patient cost for a service |
| POST | `/api/patient/appeals/:id/consent` | Record patient consent for appeal processing |
| GET | `/api/patient/appeals/:id/status` | Get patient-friendly status update for an appeal |
| GET | `/api/patient/appeals/:id/cost-impact` | Get appeal cost impact analysis |

## Implementation Details

The patient service is implemented in `/backend/services/patientService.js` with corresponding controller logic in `/backend/controllers/patientController.js`.

### Response Format Example: Patient Status Update

```json
{
  "success": true,
  "data": {
    "appealId": "60d5e...",
    "patientName": "John Doe",
    "currentStatus": "submitted",
    "statusMessage": "Your appeal was submitted to your insurance company on July 15, 2023. We are awaiting their response.",
    "lastUpdated": "July 20, 2023",
    "timeline": {
      "created": "July 10, 2023",
      "submitted": "July 15, 2023",
      "responded": null
    },
    "metrics": {
      "daysInGeneration": 5,
      "daysInReview": 5,
      "totalDays": 10
    },
    "nextSteps": [
      "Your appeal has been submitted to your insurance company.",
      "The insurance company typically takes 30-60 days to respond."
    ],
    "appealAmount": 1500,
    "estimatedTimeToResolution": "15-45 days",
    "suggestedActions": [
      "No action needed at this time. Check back for updates."
    ]
  }
}
```

### Response Format Example: Cost Impact Analysis

```json
{
  "success": true,
  "data": {
    "appealId": "60d5e...",
    "appealStatus": "submitted",
    "appealType": "medicalNecessity",
    "currentPatientResponsibility": 2500,
    "potentialSavings": {
      "bestCaseScenario": 1750,
      "expectedValue": 1225,
      "successProbability": 0.7,
      "recoveryRate": 0.7
    },
    "timeline": {
      "submissionDate": "2023-07-15T00:00:00.000Z",
      "estimatedResolutionDays": 45,
      "estimatedResolutionDate": "2023-08-29T00:00:00.000Z"
    },
    "patientActions": [
      "No action needed at this time",
      "Check back for updates on your appeal status"
    ]
  }
}
```

## Best Practices

1. **Always validate eligibility before providing cost estimates** to ensure accuracy.
2. **Record patient consent** before processing appeals to maintain compliance.
3. **Provide clear status updates** to reduce patient anxiety and support calls.
4. **Include cost impact analysis** to help patients understand the financial benefits of appeals.
5. **Support multiple languages** to ensure all patients can understand their information.

## Future Enhancements

- Integration with real eligibility verification APIs
- Integration with actual payer contracts and fee schedules
- Patient portal for direct access to information
- SMS/email notifications for appeal status updates
- Additional language support beyond English and Spanish