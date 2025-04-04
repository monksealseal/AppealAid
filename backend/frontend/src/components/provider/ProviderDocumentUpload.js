/**
 * Provider Document Upload Component
 * 
 * Secure access portal for providers to submit documentation
 * with a special tokenized link (no login required)
 */

import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container, Paper, Typography, Button, TextField, Grid,
  FormControl, InputLabel, Select, MenuItem, CircularProgress,
  Box, Alert, Card, CardHeader, CardContent, Divider,
  List, ListItem, ListItemText, ListItemIcon
} from '@mui/material';
import { 
  Upload as UploadIcon, 
  InsertDriveFile as FileIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon 
} from '@mui/icons-material';

const ProviderDocumentUpload = () => {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [appealData, setAppealData] = useState(null);
  const [error, setError] = useState(null);
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [notes, setNotes] = useState('');
  const [documentTypes, setDocumentTypes] = useState([]);
  const [submissionComplete, setSubmissionComplete] = useState(false);
  
  // Document type options
  const documentTypeOptions = [
    'clinical_documentation',
    'medical_record',
    'imaging',
    'lab_results',
    'other'
  ];
  
  // Fetch appeal data using token
  useEffect(() => {
    // For the demo, use mock data instead of making an API call
    const mockAppealData = {
      appealId: 'AP001', 
      patientName: 'John Doe',
      patientDOB: '1985-05-15',
      serviceName: 'Post-Stroke Rehabilitation',
      serviceDate: '2023-12-01',
      insuranceCompany: 'UnitedHealthcare',
      collaborationRequests: [
        {
          message: 'Please provide clinical documentation showing medical necessity for inpatient rehabilitation.',
          requestedItems: ['Therapy assessments', 'Physician notes', 'Functional status reports'],
          responseDeadline: '2025-04-10'
        }
      ]
    };
    
    // Simulate loading delay
    setTimeout(() => {
      if (token === 'YWJjMTIz') { // Demo token
        setAppealData(mockAppealData);
        setError(null);
      } else {
        setError('Invalid or expired access token. Please contact the patient or their representative for a new link.');
      }
      setLoading(false);
    }, 1000);
    
    /* In a real implementation, this would be used:
    const fetchAppealData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/provider-collaboration/access/${token}`);
        setAppealData(response.data.appealData);
        setError(null);
      } catch (error) {
        console.error('Error fetching appeal data:', error);
        setError('Invalid or expired access token. Please contact the patient or their representative for a new link.');
      } finally {
        setLoading(false);
      }
    };
    
    if (token) {
      fetchAppealData();
    }
    */
  }, [token]);
  
  // Handle file selection
  const handleFileChange = (event) => {
    const newFiles = Array.from(event.target.files);
    setFiles([...files, ...newFiles]);
    
    // Initialize document types for new files
    const newTypes = [...documentTypes];
    newFiles.forEach(() => newTypes.push('clinical_documentation'));
    setDocumentTypes(newTypes);
  };
  
  // Handle document type change for a specific file
  const handleDocumentTypeChange = (index, value) => {
    const newDocumentTypes = [...documentTypes];
    newDocumentTypes[index] = value;
    setDocumentTypes(newDocumentTypes);
  };
  
  // Remove file from the list
  const handleRemoveFile = (index) => {
    const newFiles = [...files];
    const newDocumentTypes = [...documentTypes];
    newFiles.splice(index, 1);
    newDocumentTypes.splice(index, 1);
    setFiles(newFiles);
    setDocumentTypes(newDocumentTypes);
  };
  
  // Submit documentation
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (files.length === 0) {
      setError('Please select at least one file to upload.');
      return;
    }
    
    // For the demo, just simulate a successful submission
    setSubmitting(true);
    
    // Simulate API call delay
    setTimeout(() => {
      setSubmissionComplete(true);
      setSubmitting(false);
    }, 2000);
    
    // In a real implementation, this would be used:
    /*
    try {
      setSubmitting(true);
      setError(null);
      
      const formData = new FormData();
      formData.append('appealId', appealData.appealId);
      formData.append('providerNotes', notes);
      formData.append('documentTypes', JSON.stringify(documentTypes));
      
      files.forEach(file => {
        formData.append('documents', file);
      });
      
      const response = await axios.post('/api/provider-collaboration/submit', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        setSubmissionComplete(true);
      } else {
        setError(response.data.message || 'Failed to upload documents.');
      }
    } catch (error) {
      console.error('Error submitting documents:', error);
      setError('Error submitting documents. Please try again.');
    } finally {
      setSubmitting(false);
    }
    */
  };
  
  // If loading, show loading indicator
  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading secure provider portal...</Typography>
      </Container>
    );
  }
  
  // If error, show error message
  if (error && !appealData) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Typography variant="body1" sx={{ mt: 2 }}>
          If you believe this is an error, please contact the patient or their representative.
        </Typography>
      </Container>
    );
  }
  
  // If submission is complete, show success message
  if (submissionComplete) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <SuccessIcon color="success" sx={{ fontSize: 64 }} />
          <Typography variant="h4" gutterBottom sx={{ mt: 2 }}>
            Thank You!
          </Typography>
          <Typography variant="body1" paragraph>
            Your documentation has been successfully submitted.
          </Typography>
          <Typography variant="body2" color="textSecondary">
            The patient or their representative may contact you if additional information is needed.
          </Typography>
        </Paper>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        {/* Header */}
        <Typography variant="h4" gutterBottom>
          Provider Documentation Portal
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        {/* Patient Information */}
        <Card variant="outlined" sx={{ mb: 4 }}>
          <CardHeader title="Patient Information" />
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Patient Name:</Typography>
                <Typography variant="body1">{appealData?.patientName}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Date of Birth:</Typography>
                <Typography variant="body1">
                  {appealData?.patientDOB ? new Date(appealData.patientDOB).toLocaleDateString() : 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Service:</Typography>
                <Typography variant="body1">{appealData?.serviceName}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Service Date:</Typography>
                <Typography variant="body1">
                  {appealData?.serviceDate ? new Date(appealData.serviceDate).toLocaleDateString() : 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2">Insurance Company:</Typography>
                <Typography variant="body1">{appealData?.insuranceCompany}</Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        
        {/* Request Information */}
        {appealData?.collaborationRequests && appealData.collaborationRequests.length > 0 && (
          <Card variant="outlined" sx={{ mb: 4 }}>
            <CardHeader title="Requested Documentation" />
            <CardContent>
              <Typography variant="body1" paragraph>
                {appealData.collaborationRequests[0].message}
              </Typography>
              
              {appealData.collaborationRequests[0].requestedItems && 
               appealData.collaborationRequests[0].requestedItems.length > 0 && (
                <Box>
                  <Typography variant="subtitle2">Requested Items:</Typography>
                  <List dense>
                    {appealData.collaborationRequests[0].requestedItems.map((item, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <FileIcon />
                        </ListItemIcon>
                        <ListItemText primary={item} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
              
              {appealData.collaborationRequests[0].responseDeadline && (
                <Typography variant="subtitle2" color="error">
                  Please submit by: {new Date(appealData.collaborationRequests[0].responseDeadline).toLocaleDateString()}
                </Typography>
              )}
            </CardContent>
          </Card>
        )}
        
        {/* Upload Form */}
        <Box component="form" onSubmit={handleSubmit} noValidate>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          {/* File Upload */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Upload Documentation
            </Typography>
            
            <Box 
              sx={{
                border: '2px dashed #ccc',
                borderRadius: 2,
                p: 3,
                textAlign: 'center',
                mb: 2,
                backgroundColor: '#f8f8f8'
              }}
            >
              <input
                type="file"
                multiple
                id="file-upload"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <label htmlFor="file-upload">
                <Button
                  variant="contained"
                  component="span"
                  startIcon={<UploadIcon />}
                >
                  Select Files
                </Button>
              </label>
              <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                Drag and drop files here or click to select files
              </Typography>
            </Box>
            
            {/* File List */}
            {files.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Selected Files:
                </Typography>
                <List>
                  {files.map((file, index) => (
                    <ListItem key={index} alignItems="flex-start">
                      <ListItemIcon>
                        <FileIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={file.name}
                        secondary={`${(file.size / 1024 / 1024).toFixed(2)} MB`}
                      />
                      <FormControl sx={{ width: 200, mr: 2 }}>
                        <InputLabel>Document Type</InputLabel>
                        <Select
                          value={documentTypes[index] || 'clinical_documentation'}
                          onChange={(e) => handleDocumentTypeChange(index, e.target.value)}
                          label="Document Type"
                          size="small"
                        >
                          {documentTypeOptions.map((type) => (
                            <MenuItem key={type} value={type}>
                              {type.replace('_', ' ')}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <Button 
                        color="error" 
                        onClick={() => handleRemoveFile(index)}
                      >
                        Remove
                      </Button>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Box>
          
          {/* Notes */}
          <TextField
            label="Provider Notes"
            multiline
            rows={4}
            fullWidth
            margin="normal"
            variant="outlined"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes or context about the uploaded documentation here..."
            sx={{ mb: 3 }}
          />
          
          {/* Submit Button */}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            disabled={submitting || files.length === 0}
            sx={{ mt: 2 }}
          >
            {submitting ? (
              <>
                <CircularProgress size={24} sx={{ mr: 1 }} />
                Submitting...
              </>
            ) : (
              'Submit Documentation'
            )}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default ProviderDocumentUpload;