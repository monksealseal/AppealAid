import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createAppeal } from '../../services/appealService';
import { analyzeAppealPotential } from '../../services/appealService';
import LoadingSpinner from '../common/LoadingSpinner';

const DocumentAnalysis = ({ document, onStartAppeal }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        setLoading(true);
        const result = await analyzeAppealPotential(document._id);
        setAnalysis(result);
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Failed to analyze document');
        setLoading(false);
      }
    };

    if (document && document._id) {
      fetchAnalysis();
    }
  }, [document]);

  const handleStartAppeal = async () => {
    try {
      if (onStartAppeal) {
        onStartAppeal(document._id, analysis);
      } else {
        // If no callback is provided, navigate to create appeal
        navigate(`/appeals/create?documentId=${document._id}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to start appeal process');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  if (!analysis) {
    return <div className="alert alert-info">No analysis available for this document</div>;
  }

  return (
    <div className="document-analysis">
      <h3>Appeal Analysis</h3>
      
      {/* Success Probability */}
      <div className="card mb-3">
        <div className="card-header">
          <h4>
            Appeal Success Probability: 
            <span className={`ms-2 badge ${
              analysis.successProbability > 0.7 ? 'bg-success' : 
              analysis.successProbability > 0.4 ? 'bg-warning' : 'bg-danger'
            }`}>
              {Math.round(analysis.successProbability * 100)}%
            </span>
          </h4>
        </div>
        <div className="card-body">
          <p className="mb-2">
            <strong>Recommendation:</strong> {analysis.recommendedAction === 'appeal' ? 
              'This claim should be appealed' : 
              'Review this claim carefully before appealing'}
          </p>
          
          {analysis.factors && analysis.factors.length > 0 && (
            <>
              <p className="mb-1"><strong>Factors affecting success:</strong></p>
              <ul className="mb-3">
                {analysis.factors.map((factor, index) => (
                  <li key={index}>{factor}</li>
                ))}
              </ul>
            </>
          )}
          
          {analysis.recommendedActions && analysis.recommendedActions.length > 0 && (
            <>
              <p className="mb-1"><strong>Recommended actions:</strong></p>
              <ul>
                {analysis.recommendedActions.map((action, index) => (
                  <li key={index}>{action}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
      
      {/* Deadline Warning */}
      {analysis.deadlineWarning && (
        <div className={`alert ${
          analysis.deadlineWarning.type === 'expired' ? 'alert-danger' :
          analysis.deadlineWarning.type === 'urgent' ? 'alert-warning' : 'alert-info'
        }`}>
          <strong>
            {analysis.deadlineWarning.type === 'expired' ? '⚠️ ' : 
             analysis.deadlineWarning.type === 'urgent' ? '⏰ ' : 'ℹ️ '}
          </strong>
          {analysis.deadlineWarning.message}
        </div>
      )}
      
      {/* Extracted Key Data */}
      <div className="card mb-3">
        <div className="card-header">
          <h4>Extracted Information</h4>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <div className="mb-3">
                <label className="fw-bold">Claim Number:</label>
                <div>{analysis.extractedKeyFields.claimNumber || 'Not detected'}</div>
              </div>
              <div className="mb-3">
                <label className="fw-bold">Service Date:</label>
                <div>
                  {analysis.extractedKeyFields.serviceDate ? 
                    new Date(analysis.extractedKeyFields.serviceDate).toLocaleDateString() : 
                    'Not detected'}
                </div>
              </div>
              <div className="mb-3">
                <label className="fw-bold">Denial Code:</label>
                <div>{analysis.extractedKeyFields.denialCode || 'Not detected'}</div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="fw-bold">Billed Amount:</label>
                <div>
                  {analysis.extractedKeyFields.billedAmount ? 
                    `$${analysis.extractedKeyFields.billedAmount.toFixed(2)}` : 
                    'Not detected'}
                </div>
              </div>
              <div className="mb-3">
                <label className="fw-bold">Allowed Amount:</label>
                <div>
                  {analysis.extractedKeyFields.allowedAmount ? 
                    `$${analysis.extractedKeyFields.allowedAmount.toFixed(2)}` : 
                    'Not detected'}
                </div>
              </div>
              <div className="mb-3">
                <label className="fw-bold">Patient Responsibility:</label>
                <div>
                  {analysis.extractedKeyFields.patientResponsibility ? 
                    `$${analysis.extractedKeyFields.patientResponsibility.toFixed(2)}` : 
                    'Not detected'}
                </div>
              </div>
            </div>
          </div>
          <div className="mb-3">
            <label className="fw-bold">Denial Reason:</label>
            <div>{analysis.extractedKeyFields.denialReason || 'Not detected'}</div>
          </div>
        </div>
      </div>
      
      {/* Suggested Evidence */}
      {analysis.suggestedEvidence && analysis.suggestedEvidence.length > 0 && (
        <div className="card mb-3">
          <div className="card-header">
            <h4>Suggested Evidence</h4>
          </div>
          <div className="card-body">
            <p className="mb-2">We recommend gathering the following evidence for your appeal:</p>
            <ul>
              {analysis.suggestedEvidence.map((evidence, index) => (
                <li key={index}>{evidence}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
      
      <div className="d-grid">
        <button 
          className="btn btn-primary btn-lg" 
          onClick={handleStartAppeal}
          disabled={analysis.deadlineWarning?.type === 'expired'}
        >
          {analysis.deadlineWarning?.type === 'expired' 
            ? 'Appeal Deadline Expired' 
            : 'Start Appeal Process'}
        </button>
        {analysis.deadlineWarning?.type === 'expired' && (
          <div className="text-muted text-center mt-2">
            <small>
              You can still try to appeal, but it may be rejected due to being past the deadline.
            </small>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentAnalysis;