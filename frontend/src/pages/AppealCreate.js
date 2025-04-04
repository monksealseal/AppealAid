import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import {
  Typography,
  Box,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Button,
  Breadcrumbs,
  Link,
  Alert,
  CircularProgress,
  Badge,
} from '@mui/material';
import { 
  NavigateNext as NavigateNextIcon,
  AttachFile as AttachmentIcon,
  Send as SendIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

// Components for each step
import DocumentSelection from '../components/appeals/DocumentSelection';
import AppealInformation from '../components/appeals/AppealInformation';
import AppealLetter from '../components/appeals/AppealLetter';
import AppealReview from '../components/appeals/AppealReview';
import SubmissionMethod from '../components/appeals/SubmissionMethod';
import SubmissionConfirmation from '../components/appeals/SubmissionConfirmation';

// Actions
import { getDocuments } from '../actions/documentActions';
import { createAppeal, generateAppealLetter, submitAppeal } from '../actions/appealActions';
import { APPEAL_CREATE_RESET, APPEAL_SUBMIT_RESET } from '../constants/appealConstants';

// Validation
import { validateAppealForm } from '../utils/validation';

const steps = ['Select Document', 'Appeal Information', 'Review Letter', 'Submission Method', 'Confirmation'];

const AppealCreate = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract document ID from URL query params if provided
  const queryParams = new URLSearchParams(location.search);
  const documentIdFromUrl = queryParams.get('documentId');
  
  // Component state
  const [activeStep, setActiveStep] = useState(0);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [appealInfo, setAppealInfo] = useState({
    title: '',
    description: '',
    denialReason: '',
    additionalDetails: '',
    attachments: [],
    templateId: 'default',
  });
  const [submissionInfo, setSubmissionInfo] = useState({
    method: 'mail',
    address: '',
    faxNumber: '',
    email: '',
    portalLink: '',
  });
  const [generatedLetter, setGeneratedLetter] = useState(null);
  const [editedLetter, setEditedLetter] = useState(null);
  const [letterGenerating, setLetterGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  
  // Redux state
  const { documents, loading: documentsLoading } = useSelector((state) => state.documentList);
  const { 
    appeal: createdAppeal, 
    loading: appealCreating, 
    success: appealCreated, 
    error: appealError 
  } = useSelector((state) => state.appealCreate);
  const {
    appeal: submittedAppeal,
    loading: appealSubmitting,
    success: appealSubmitted,
    error: submitError
  } = useSelector((state) => state.appealSubmit);
  
  // Form validation
  const validateForm = (step) => {
    const { isValid, errors } = validateAppealForm({
      documentId: selectedDocument?.id,
      ...appealInfo,
      letter: editedLetter,
      ...submissionInfo
    }, step);
    
    setFormErrors(errors);
    return isValid;
  };
  
  // Fetch documents on component mount
  useEffect(() => {
    dispatch(getDocuments());
    
    // Reset appeal creation state when component unmounts
    return () => {
      dispatch({ type: APPEAL_CREATE_RESET });
      dispatch({ type: APPEAL_SUBMIT_RESET });
    };
  }, [dispatch]);
  
  // Handle pre-selected document from URL
  useEffect(() => {
    if (documentIdFromUrl && documents && documents.length > 0) {
      const doc = documents.find(d => d.id === documentIdFromUrl);
      if (doc) {
        setSelectedDocument(doc);
        
        // Auto-populate appeal title if document is found
        setAppealInfo(prev => ({
          ...prev,
          title: `Appeal for ${doc.name}`,
          denialReason: doc.denialReason || '',
        }));
        
        // Move to step 2 if document was provided via URL
        setActiveStep(1);
      }
    }
  }, [documentIdFromUrl, documents]);
  
  // Move to confirmation step after successful submission
  useEffect(() => {
    if (appealSubmitted && submittedAppeal) {
      setActiveStep(4); // Move to confirmation step
    }
  }, [appealSubmitted, submittedAppeal]);
  
  // Generate letter when document and appeal info are ready
  useEffect(() => {
    const generateLetter = async () => {
      if (activeStep === 2 && selectedDocument && !generatedLetter && !letterGenerating) {
        setLetterGenerating(true);
        setError(null);
        
        try {
          // Validate appeal info before generating letter
          if (!validateForm(1)) {
            setActiveStep(1);
            setLetterGenerating(false);
            setError('Please complete the appeal information before generating a letter');
            return;
          }
          
          const letterData = await dispatch(generateAppealLetter(
            selectedDocument.id, 
            appealInfo.templateId
          ));
          setGeneratedLetter(letterData);
          setEditedLetter(letterData); // Initialize edited letter with generated content
        } catch (error) {
          setError('Failed to generate appeal letter. Please try again.');
        } finally {
          setLetterGenerating(false);
        }
      }
    };
    
    generateLetter();
  }, [activeStep, selectedDocument, generatedLetter, letterGenerating, dispatch, appealInfo]);
  
  const handleNext = () => {
    // Validate current step
    if (!validateForm(activeStep)) {
      return;
    }
    
    // Clear any existing errors
    setError(null);
    
    // Move to next step
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
    setError(null);
  };

  const handleSubmit = async () => {
    // Validate submission info
    if (!validateForm(activeStep)) {
      return;
    }

    try {
      // If appeal hasn't been created yet, create it first
      if (!createdAppeal) {
        const appealData = {
          documentId: selectedDocument.id,
          title: appealInfo.title,
          description: appealInfo.description,
          denialReason: appealInfo.denialReason,
          additionalDetails: appealInfo.additionalDetails,
          attachments: appealInfo.attachments,
          templateId: appealInfo.templateId,
          letter: editedLetter,
        };
        
        const newAppeal = await dispatch(createAppeal(appealData));
        
        // Submit the appeal with submission method data
        if (newAppeal && newAppeal.id) {
          await dispatch(submitAppeal(newAppeal.id, submissionInfo));
        }
      } else {
        // If appeal has already been created, just submit it
        await dispatch(submitAppeal(createdAppeal.id, submissionInfo));
      }
    } catch (error) {
      setError(`Failed to submit appeal: ${error.message}`);
    }
  };
  
  // Render content for current step
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <DocumentSelection
            documents={documents}
            loading={documentsLoading}
            selectedDocument={selectedDocument}
            setSelectedDocument={setSelectedDocument}
            setAppealInfo={setAppealInfo}
          />
        );
      case 1:
        return (
          <AppealInformation
            appealInfo={appealInfo}
            setAppealInfo={setAppealInfo}
            document={selectedDocument}
            errors={formErrors}
          />
        );
      case 2:
        return (
          <AppealLetter
            isGenerating={letterGenerating}
            letter={editedLetter}
            setLetter={setEditedLetter}
            document={selectedDocument}
            appealInfo={appealInfo}
            error={formErrors.letter}
          />
        );
      case 3:
        return (
          <Box>
            <AppealReview
              document={selectedDocument}
              appealInfo={appealInfo}
              letter={editedLetter}
            />
            <Box sx={{ mt: 4 }}>
              <SubmissionMethod
                document={selectedDocument}
                appealInfo={appealInfo}
                submissionInfo={submissionInfo}
                setSubmissionInfo={setSubmissionInfo}
                error={formErrors.submissionMethod}
              />
            </Box>
          </Box>
        );
      case 4:
        return (
          <SubmissionConfirmation
            appeal={submittedAppeal || {
              ...createdAppeal,
              document: selectedDocument,
              submissionInfo
            }}
          />
        );
      default:
        return 'Unknown step';
    }
  };

  // Get step icon with attachment badge
  const getStepIcon = (stepIndex) => {
    // Show badge on Appeal Information step if there are attachments
    if (stepIndex === 1 && appealInfo.attachments && appealInfo.attachments.length > 0) {
      return (
        <Badge 
          badgeContent={appealInfo.attachments.length} 
          color="primary"
          sx={{ 
            '& .MuiBadge-badge': { 
              right: -8, 
              top: 8,
            },
          }}
        >
          <AttachmentIcon fontSize="small" />
        </Badge>
      );
    }
    
    // Show success icon on completed steps
    if (stepIndex === 4 && activeStep === 4) {
      return <CheckCircleIcon color="success" />;
    }
    
    return null;
  };

  return (
    <>
      {/* Breadcrumbs */}
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/" color="inherit">
          Dashboard
        </Link>
        <Link component={RouterLink} to="/appeals" color="inherit">
          Appeals
        </Link>
        <Typography color="text.primary">Create Appeal</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Create New Appeal
        </Typography>
      </Box>

      {/* Content */}
      <Paper sx={{ p: 3, mb: 3 }}>
        {/* Error display */}
        {(error || appealError || submitError) && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error || appealError || submitError}
          </Alert>
        )}
        
        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel StepIconComponent={() => getStepIcon(index)}>
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {/* Step content */}
        <Box sx={{ mt: 2, mb: 4, minHeight: '300px' }}>
          {getStepContent(activeStep)}
        </Box>
        
        {/* Navigation buttons */}
        {activeStep !== 4 && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 2 }}>
            <Button
              variant="outlined"
              disabled={activeStep === 0 || appealCreating || appealSubmitting}
              onClick={handleBack}
            >
              Back
            </Button>
            <Box>
              <Button 
                variant="outlined" 
                component={RouterLink} 
                to="/appeals" 
                sx={{ mr: 1 }}
                disabled={appealCreating || appealSubmitting}
              >
                Cancel
              </Button>
              {activeStep === 3 ? (
                <Button 
                  variant="contained" 
                  onClick={handleSubmit}
                  disabled={appealCreating || appealSubmitting}
                  startIcon={appealSubmitting ? <CircularProgress size={20} /> : <SendIcon />}
                >
                  {appealSubmitting ? 'Submitting...' : 'Submit Appeal'}
                </Button>
              ) : (
                <Button 
                  variant="contained" 
                  onClick={handleNext}
                  disabled={
                    activeStep === 0 && !selectedDocument || 
                    activeStep === 2 && letterGenerating || 
                    appealCreating ||
                    appealSubmitting
                  }
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>
        )}
        
        {/* Completed state buttons */}
        {activeStep === 4 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, pt: 2 }}>
            <Button 
              variant="outlined" 
              component={RouterLink} 
              to="/appeals"
            >
              View All Appeals
            </Button>
            <Button 
              variant="contained" 
              component={RouterLink} 
              to="/"
            >
              Return to Dashboard
            </Button>
          </Box>
        )}
      </Paper>
    </>
  );
};

export default AppealCreate;