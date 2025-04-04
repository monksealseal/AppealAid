# Response Processing Test Cases

This document outlines the test cases for the insurance response processing system.

## Document Identification Test Cases

| Test Case | Description | Input | Expected Output |
|-----------|-------------|-------|----------------|
| ID-001 | Generic non-response document | Document with normal text | `isResponse: false` |
| ID-002 | Approval document | Document with approval keywords | `isResponse: true` |
| ID-003 | Denial document | Document with denial keywords | `isResponse: true` |
| ID-004 | Partial approval document | Document with partial approval keywords | `isResponse: true` |
| ID-005 | Document with header indicator | Document with "Appeal Decision Letter" header | `isResponse: true, confidence: high` |
| ID-006 | Document with multiple keywords | Document with multiple response keywords | `isResponse: true, keywordMatches: >2` |
| ID-007 | Borderline document | Document with only one response keyword | `isResponse: false` |

## Decision Extraction Test Cases

| Test Case | Description | Input | Expected Output |
|-----------|-------------|-------|----------------|
| DE-001 | Extract approval decision | Approval document | `decision: 'approved'` |
| DE-002 | Extract denial decision | Denial document | `decision: 'denied'` |
| DE-003 | Extract partial approval decision | Partial approval document | `decision: 'partiallyApproved'` |
| DE-004 | Extract decision date | Document with date | `decisionDate: <extracted date>` |
| DE-005 | Extract appeal ID | Document with appeal ID | `appealId: <extracted ID>` |
| DE-006 | Extract claim ID | Document with claim ID | `claimId: <extracted ID>` |
| DE-007 | Extract patient info | Document with patient info | `patientName, patientId` |
| DE-008 | Extract insurance info | Document with insurance info | `insuranceCompany` |
| DE-009 | Extract amounts | Partial approval with amounts | `approvedAmount, deniedAmount` |
| DE-010 | Extract decision reason | Document with reason | `reason: <extracted reason>` |

## Appeal Matching Test Cases

| Test Case | Description | Input | Expected Output |
|-----------|-------------|-------|----------------|
| AM-001 | Match by appeal ID | Decision data with matching appeal ID | Matching appeal found |
| AM-002 | Match by claim ID | Decision data with matching claim ID | Matching appeal found |
| AM-003 | Match by patient and insurance | Decision data with patient and insurance info | Matching appeal found with good score |
| AM-004 | Match by multiple fields | Decision data with partial matches | Matching appeal found with medium score |
| AM-005 | No matching appeal | Decision data with no matches | No match found |
| AM-006 | Multiple potential matches | Decision data matching multiple appeals | Best match found based on score |
| AM-007 | Match to recent appeal | Decision data with recent appeal | Match to recent appeal rather than older one |
| AM-008 | Match to pending appeal | Decision data with pending appeal | Match to pending appeal rather than completed one |

## Appeal Update Test Cases

| Test Case | Description | Input | Expected Output |
|-----------|-------------|-------|----------------|
| AU-001 | Update appeal with approval | Matched appeal, approval data | Appeal status updated to 'approved' |
| AU-002 | Update appeal with denial | Matched appeal, denial data | Appeal status updated to 'denied' |
| AU-003 | Update appeal with partial approval | Matched appeal, partial approval data | Appeal status 'approved', decision 'partiallyApproved' |
| AU-004 | Update financial data for approval | Matched appeal with amount, approval | Appeal approvedAmount = requestedAmount |
| AU-005 | Update financial data for denial | Matched appeal with amount, denial | Appeal deniedAmount = requestedAmount |
| AU-006 | Update financial data for partial | Matched appeal, partial with amounts | Appeal approvedAmount and deniedAmount set |
| AU-007 | Update activity timeline | Any decision update | Appeal lastActivity updated |
| AU-008 | Send patient notification | Appeal with patient, any decision | Patient notification generated |

## Next Steps Test Cases

| Test Case | Description | Input | Expected Output |
|-----------|-------------|-------|----------------|
| NS-001 | Next steps for approval | Approved appeal | Payment tracking steps |
| NS-002 | Next steps for denial | Denied appeal | External review steps |
| NS-003 | Next steps for partial approval | Partially approved appeal | Steps for appealing denied portion |
| NS-004 | External review eligibility - medical necessity | Denied appeal, medical necessity reason | `externalReviewEligible: true, type: 'medical necessity'` |
| NS-005 | External review eligibility - not covered | Denied appeal, not covered reason | `externalReviewEligible: false` |
| NS-006 | Next steps timeframe | Any decision | Appropriate timeframe recommendations |

## API Endpoint Test Cases

| Test Case | Description | Input | Expected Output |
|-----------|-------------|-------|----------------|
| API-001 | Process document endpoint - success | Valid response document upload | Success response with matched appeal |
| API-002 | Process document endpoint - no match | Valid response with no match | Response indicating no match found |
| API-003 | Process document endpoint - not response | Non-response document upload | Response indicating not a response document |
| API-004 | Manual response endpoint - with appeal ID | Valid manual data with appeal ID | Success response with updated appeal |
| API-005 | Manual response endpoint - without appeal ID | Valid manual data without appeal ID | Success with matched appeal or not found |
| API-006 | Check document endpoint | Document upload | Response indicating if document is a response |
| API-007 | Match response endpoint | Document ID and optional appeal ID | Response with match result |
| API-008 | Get next steps endpoint | Decision type and optional appeal ID | Next steps recommendations |
| API-009 | Get recent responses endpoint | Optional limit and patient ID | List of recent responses |

## Edge Cases and Error Handling

| Test Case | Description | Input | Expected Output |
|-----------|-------------|-------|----------------|
| EC-001 | Ambiguous decision language | Document with unclear decision | Appropriate fallback behavior |
| EC-002 | Multiple appeal IDs in document | Document with multiple IDs | Best match determined |
| EC-003 | Response without clear identifiers | Document with minimal info | Matching via scoring system |
| EC-004 | Invalid date formats | Document with unusual date format | Appropriate error handling |
| EC-005 | Document with conflicting information | Document with contradictory data | Appropriate resolution strategy |
| EC-006 | Very long response document | Extra large document | Successful processing without timeout |
| EC-007 | Appeal with previous response | Appeal that already has a response | Appropriate update strategy |
| EC-008 | Response without clear reason | Document missing reason | Default reason handling |
| EC-009 | Network/database errors | System unavailable | Appropriate error response |
| EC-010 | Malformed input | Invalid document or request | Proper validation error response |