import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  TextField, 
  Grid, 
  CircularProgress,
  Divider,
  Alert,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  FormHelperText,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import ArticleIcon from '@mui/icons-material/Article';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import api from '../../services/api';

// Styled components
const UploadBox = styled(Box)(({ theme }) => ({
  border: `2px dashed ${theme.palette.primary.main}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  backgroundColor: theme.palette.background.default,
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const FilePreview = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  padding: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  marginBottom: theme.spacing(2),
  maxHeight: '200px',
  overflowY: 'auto',
}));

const HiddenInput = styled('input')({
  display: 'none',
});

const ProviderDocumentUpload = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  // State variables
  const [appealData, setAppealData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [files, setFiles] = useState([]);
  const [notes, setNotes] = useState('');
  const [documentTypes, setDocumentTypes] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Document type options
  const typeOptions = [
    { value: 'medical_record', label: 'Medical Record' },
    { value: 'clinical_documentation', label: 'Clinical Documentation' },
    { value: 'imaging', label: 'Imaging Report' },
    { value: 'lab_results', label: 'Laboratory Results' },
    { value: 'other', label: 'Other' }
  ];
  
  // Load appeal data with token
  useEffect(() => {
    const fetchAppealData = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/provider-collaboration/access/${token}`);
        
        if (response.data.success) {
          setAppealData(response.data.appealData);
        } else {
          setError('Failed to load appeal data. Please check your link and try again.');
        }
      } catch (err) {
        setError('Invalid or expired access link. Please contact the patient or AppealAid support.');
        console.error('Error fetching appeal data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (token) {
      fetchAppealData();
    }
  }, [token]);
  
  // Handle file input change
  const handleFileChange = (event) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      setFiles([...files, ...newFiles]);
      
      // Add document types placeholders
      setDocumentTypes(prevTypes => {
        const newTypes = [...prevTypes];
        for (let i = 0; i < newFiles.length; i++) {
          newTypes.push('medical_record');
        }
        return newTypes;
      });
    }
  };
  
  // Handle document type change
  const handleDocumentTypeChange = (index, value) => {
    const newTypes = [...documentTypes];
    newTypes[index] = value;
    setDocumentTypes(newTypes);
  };
  
  // Handle drag and drop
  const handleDrop = (event) => {
    event.preventDefault();
    if (event.dataTransfer.files) {
      const newFiles = Array.from(event.dataTransfer.files);
      setFiles([...files, ...newFiles]);
      
      // Add document types placeholders
      setDocumentTypes(prevTypes => {
        const newTypes = [...prevTypes];
        for (let i = 0; i < newFiles.length; i++) {
          newTypes.push('medical_record');
        }
        return newTypes;
      });
    }
  };
  
  // Handle drag over
  const handleDragOver = (event) => {
    event.preventDefault();
  };
  
  // Remove file from list
  const removeFile = (index) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
    
    const newTypes = [...documentTypes];
    newTypes.splice(index, 1);
    setDocumentTypes(newTypes);
  };
  
  // Get icon based on file type
  const getFileIcon = (file) => {
    if (file.type.includes('pdf')) {
      return <PictureAsPdfIcon color="error" />;
    } else if (file.type.includes('image')) {
      return <ImageIcon color="primary" />;
    } else if (file.type.includes('text')) {
      return <ArticleIcon color="info" />;
    } else {
      return <InsertDriveFileIcon color="action" />;
    }
  };
  
  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (files.length === 0) {
      setError('Please select at least one file to upload');
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Create form data
      const formData = new FormData();
      formData.append('appealId', appealData.appealId);
      formData.append('providerNotes', notes);
      formData.append('documentTypes', JSON.stringify(documentTypes));
      
      // Append files
      files.forEach((file) => {
        formData.append('documents', file);
      });
      
      // Submit form
      const response = await api.post('/provider-collaboration/submit', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        setSuccess(true);
        // Clear form after successful submission
        setFiles([]);
        setDocumentTypes([]);
        setNotes('');
      } else {
        setError(response.data.message || 'Failed to submit documentation');
      }
    } catch (err) {
      setError('Error submitting documentation. Please try again.');
      console.error('Error submitting documentation:', err);
    } finally {
      setSubmitting(false);
    }
  };
  
  // If loading
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // If error loading data
  if (error && !appealData) {
    return (
      <Box sx={{ p: 4, maxWidth: 800, mx: 'auto', mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Typography variant="body1" sx={{ mt: 2 }}>
          If you believe this is an error, please contact AppealAid support or the patient who sent you this link.
        </Typography>
      </Box>
    );
  }
  
  // If successful submission
  if (success) {
    return (
      <Box sx={{ p: 4, maxWidth: 800, mx: 'auto', mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <CheckCircleOutlineIcon color="success" sx={{ fontSize: 64, mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              Thank You!
            </Typography>
            <Typography variant="body1">
              Your documentation has been successfully submitted.
            </Typography>
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => setSuccess(false)}
              sx={{ mr: 2 }}
            >
              Submit More Documents
            </Button>
            
            <Button 
              variant="outlined"
              onClick={() => window.close()}
            >
              Close Window
            </Button>
          </Box>
        </Paper>
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 900, mx: 'auto', mt: 2 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom>
          Provider Documentation Upload
        </Typography>
        
        <Divider sx={{ mb: 3 }} />
        
        {/* Appeal Info */}
        <Paper variant="outlined" sx={{ p: 2, mb: 4, backgroundColor: '#f8f9fa' }}>
          <Typography variant="h6" gutterBottom>
            Appeal Information
          </Typography>
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Patient:
              </Typography>
              <Typography variant="body1" gutterBottom>
                {appealData?.patientName}
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Date of Birth:
              </Typography>
              <Typography variant="body1" gutterBottom>
                {appealData?.patientDOB ? new Date(appealData.patientDOB).toLocaleDateString() : 'Not provided'}
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Service:
              </Typography>
              <Typography variant="body1" gutterBottom>
                {appealData?.serviceName}
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Service Date:
              </Typography>
              <Typography variant="body1" gutterBottom>
                {appealData?.serviceDate ? new Date(appealData.serviceDate).toLocaleDateString() : 'Not provided'}
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                Insurance:
              </Typography>
              <Typography variant="body1">
                {appealData?.insuranceCompany}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
        
        {/* Request Details */}
        {appealData?.collaborationRequests && appealData.collaborationRequests.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Requested Documentation
            </Typography>
            
            {appealData.collaborationRequests
              .filter(req => req.status === 'pending')
              .map((request, index) => (
                <Paper key={index} variant="outlined" sx={{ p: 2, mb: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    {request.requestType === 'documentation' ? 'Documentation Request' : 
                     request.requestType === 'clarification' ? 'Clarification Request' : 
                     request.requestType === 'additional_information' ? 'Additional Information Request' : 
                     'Other Request'}
                  </Typography>
                  
                  <Typography variant="body1" gutterBottom>
                    {request.message}
                  </Typography>
                  
                  {request.requestedItems && request.requestedItems.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Specifically requested:
                      </Typography>
                      <List dense>
                        {request.requestedItems.map((item, i) => (
                          <ListItem key={i} sx={{ py: 0 }}>
                            <ListItemText primary={item} />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}
                  
                  {request.responseDeadline && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Please respond by: {new Date(request.responseDeadline).toLocaleDateString()}
                    </Typography>
                  )}
                </Paper>
              ))}
          </Box>
        )}
        
        {/* Upload Form */}
        <form onSubmit={handleSubmit}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          {/* File Upload */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Upload Documents
            </Typography>
            
            <label htmlFor="file-upload">
              <HiddenInput
                id="file-upload"
                type="file"
                multiple
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.tiff,.txt"
              />
              <UploadBox
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                component="div"
              >
                <CloudUploadIcon fontSize="large" color="primary" sx={{ mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Drag & Drop Files Here
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  or
                </Typography>
                <Button
                  variant="contained"
                  component="span"
                  startIcon={<FileUploadIcon />}
                >
                  Select Files
                </Button>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Accepted formats: PDF, DOC, DOCX, JPG, PNG, TIFF, TXT
                </Typography>
              </UploadBox>
            </label>
            
            {/* File Preview */}
            {files.length > 0 && (
              <FilePreview>
                <Typography variant="subtitle2" gutterBottom>
                  Selected Files ({files.length})
                </Typography>
                <List dense>
                  {files.map((file, index) => (
                    <Box key={index} sx={{ mb: 2, p: 1, borderRadius: 1, bgcolor: 'background.default' }}>
                      <Grid container alignItems="center" spacing={2}>
                        <Grid item xs={1}>
                          {getFileIcon(file)}
                        </Grid>
                        <Grid item xs={5}>
                          <Typography variant="body2" noWrap title={file.name}>
                            {file.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {(file.size / 1024).toFixed(2)} KB
                          </Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <FormControl size="small" fullWidth>
                            <InputLabel id={`document-type-label-${index}`}>Document Type</InputLabel>
                            <Select
                              labelId={`document-type-label-${index}`}
                              value={documentTypes[index] || 'medical_record'}
                              label="Document Type"
                              onChange={(e) => handleDocumentTypeChange(index, e.target.value)}
                            >
                              {typeOptions.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                  {option.label}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={2} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <Button 
                            size="small" 
                            color="error" 
                            onClick={() => removeFile(index)}
                          >
                            Remove
                          </Button>
                        </Grid>
                      </Grid>
                    </Box>
                  ))}
                </List>
              </FilePreview>
            )}
          </Box>
          
          {/* Provider Notes */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Additional Notes
            </Typography>
            <TextField
              fullWidth
              label="Notes about the documentation"
              multiline
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any relevant notes or context about the provided documentation..."
              variant="outlined"
            />
          </Box>
          
          {/* Submit Button */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={files.length === 0 || submitting}
              startIcon={submitting ? <CircularProgress size={20} /> : null}
            >
              {submitting ? 'Uploading...' : 'Submit Documentation'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default ProviderDocumentUpload;