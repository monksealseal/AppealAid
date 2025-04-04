import React from 'react';
import ReactDOM from 'react-dom';
import AppealDetail from './components/appeals/AppealDetail';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProviderDocumentUpload from './components/provider/ProviderDocumentUpload';

// Mock data for testing
const mockAppeal = {
  _id: '60d21b4667d0d8992e610c85',
  appealId: 'AP001',
  claimId: 'CL12345',
  patient: {
    _id: '60d21b4667d0d8992e610c80',
    name: 'John Doe',
    dateOfBirth: new Date('1985-05-15')
  },
  serviceDate: new Date('2023-12-01'),
  serviceName: 'Post-Stroke Rehabilitation',
  serviceDescription: 'Inpatient rehabilitation following stroke',
  serviceProvider: 'Memorial Rehabilitation Center',
  serviceLocation: 'Memorial Hospital',
  insuranceCompany: 'UnitedHealthcare',
  insurancePlan: 'UHC Choice Plus',
  insuranceMemberId: 'UHC1234567',
  requestedAmount: 12500.00,
  approvedAmount: 0,
  deniedAmount: 12500.00,
  status: 'denied',
  decision: 'denied',
  reason: 'The claim for inpatient rehabilitation was denied using the nH Predict algorithm.',
  documents: [],
  collaborationRequests: [],
  clinicalData: {},
  clinicalSummary: {},
  lastActivity: {
    date: new Date(),
    action: 'created',
    details: 'Appeal created'
  },
  createdAt: new Date(),
  updatedAt: new Date()
};

function TestApp() {
  return (
    <Router>
      <Routes>
        <Route path="/appeal/:appealId" element={<AppealDetail />} />
        <Route path="/provider/document-upload/:token" element={<ProviderDocumentUpload />} />
        <Route path="/" element={<div>Test Home Page - Go to /appeal/60d21b4667d0d8992e610c85</div>} />
      </Routes>
    </Router>
  );
}

ReactDOM.render(<TestApp />, document.getElementById('root'));