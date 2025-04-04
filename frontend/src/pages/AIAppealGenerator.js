import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import {
  Typography,
  Box,
  Paper,
  Breadcrumbs,
  Link,
  Alert,
  Button,
  CircularProgress,
  Divider,
  Container,
  Grid,
} from '@mui/material';
import { 
  NavigateNext as NavigateNextIcon,
  Send as SendIcon,
  Save as SaveIcon,
  Psychology as AIIcon,
  ArrowBack as BackIcon
} from '@mui/icons-material';

// Custom components
import DocumentSelection from '../components/appeals/DocumentSelection';
import RealTimeAppealGenerator from '../components/appeals/RealTimeAppealGenerator';

// Actions
import { getDocuments } from '../actions/documentActions';
import { createAppeal } from '../actions/appealActions';
import { APPEAL_CREATE_RESET } from '../constants/appealConstants';

const AIAppealGenerator = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract document ID from URL query params if provided
  const queryParams = new URLSearchParams(location.search);
  const documentIdFromUrl = queryParams.get('documentId');
  
  // Component state
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [letter, setLetter] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [appealInfo, setAppealInfo] = useState({
    title: '',
    description: '',
    denialReason: '',
    additionalDetails: '',
    attachments: [],
    templateId: 'default',
  });
  
  // Redux state
  const { documents, loading: documentsLoading } = useSelector((state) => state.documentList);
  const { 
    appeal: createdAppeal, 
    loading: appealCreating, 
    success: appealCreated, 
    error: appealError 
  } = useSelector((state) => state.appealCreate);
  
  // Fetch documents on component mount
  useEffect(() => {
    dispatch(getDocuments());
    
    // Reset appeal creation state when component unmounts
    return () => {
      dispatch({ type: APPEAL_CREATE_RESET });
    };
  }, [dispatch]);
  
  // Handle pre-selected document from URL
  useEffect(() => {
    if (documentIdFromUrl && documents && documents.length > 0) {
      const doc = documents.find(d => d.id === documentIdFromUrl);
      if (doc) {
        setSelectedDocument(doc);
        
        // Auto-populate appeal information if available in the document
        if (doc.extractedData) {
          setAppealInfo(prev => ({
            ...prev,
            title: `Appeal for ${doc.name}`,
            denialReason: doc.extractedData.denialReason || '',
            claimNumber: doc.extractedData.claimNumber || '',
            memberId: doc.extractedData.memberId || '',
            serviceDate: doc.extractedData.serviceDate || '',
            serviceDescription: doc.extractedData.serviceDescription || '',
            diagnosisCodes: doc.extractedData.diagnosisCodes || [],
            procedureCodes: doc.extractedData.procedureCodes || [],
          }));
        } else {
          setAppealInfo(prev => ({
            ...prev,
            title: `Appeal for ${doc.name}`,
            denialReason: '',
          }));
        }
      }
    }
  }, [documentIdFromUrl, documents]);
  
  // Navigate to appeal detail after successful creation
  useEffect(() => {
    if (appealCreated && createdAppeal && createdAppeal.id) {
      navigate(`/appeals/${createdAppeal.id}`);
    }
  }, [appealCreated, createdAppeal, navigate]);
  
  const handleSaveAppeal = async () => {
    if (!selectedDocument) {
      setError('Please select a document first');
      return;
    }
    
    if (!letter) {
      setError('Please generate a letter first');
      return;
    }
    
    try {
      // Create appeal with generated letter
      const appealData = {
        documentId: selectedDocument.id,
        title: appealInfo.title || `Appeal for ${selectedDocument.name}`,
        description: appealInfo.description || 'AI-generated appeal letter',
        denialReason: appealInfo.denialReason || 'Not specified',
        additionalDetails: appealInfo.additionalDetails || '',
        attachments: appealInfo.attachments || [],
        letter: letter,
      };
      
      await dispatch(createAppeal(appealData));
    } catch (error) {
      setError(`Failed to save appeal: ${error.message}`);
    }
  };

  return (
    <Container maxWidth="xl">
      {/* Breadcrumbs */}
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/" color="inherit">
          Dashboard
        </Link>
        <Link component={RouterLink} to="/appeals" color="inherit">
          Appeals
        </Link>
        <Typography color="text.primary">AI Appeal Generator</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center">
          <AIIcon color="primary" sx={{ fontSize: 32, mr: 1 }} />
          <Typography variant="h4" component="h1">
            AI Appeal Generator
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<BackIcon />}
          component={RouterLink}
          to="/appeals"
        >
          Back to Appeals
        </Button>
      </Box>

      {/* Error display */}
      {(error || appealError) && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || appealError}
        </Alert>
      )}

      {/* Content */}
      <Grid container spacing={3}>
        {/* Document selection sidebar */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Select Document
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <DocumentSelection
              documents={documents}
              loading={documentsLoading}
              selectedDocument={selectedDocument}
              setSelectedDocument={setSelectedDocument}
              setAppealInfo={setAppealInfo}
              compact={true}
            />
          </Paper>
        </Grid>
        
        {/* Main content area */}
        <Grid item xs={12} md={9}>
          <Paper sx={{ p: 3 }}>
            <RealTimeAppealGenerator
              documentId={selectedDocument?.id}
              isGenerating={isGenerating}
              setIsGenerating={setIsGenerating}
              letter={letter}
              setLetter={setLetter}
              document={selectedDocument}
              appealInfo={appealInfo}
              setAppealInfo={setAppealInfo}
              error={error}
              aiAnalysis={aiAnalysis}
              setAiAnalysis={setAiAnalysis}
            />
            
            {letter && !isGenerating && (
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  variant="outlined"
                  component={RouterLink}
                  to="/appeals"
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  startIcon={appealCreating ? <CircularProgress size={20} /> : <SaveIcon />}
                  onClick={handleSaveAppeal}
                  disabled={appealCreating || !selectedDocument || !letter}
                >
                  {appealCreating ? 'Saving...' : 'Save Appeal'}
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<SendIcon />}
                  disabled={appealCreating || !selectedDocument || !letter}
                  onClick={() => {
                    handleSaveAppeal();
                    // This would normally navigate to the submission step
                  }}
                >
                  Save and Submit
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AIAppealGenerator;