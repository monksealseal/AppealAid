import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Divider,
  Tooltip,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  InsertDriveFile as FileIcon,
  Link as LinkIcon,
  FolderOpen as BrowseIcon,
} from '@mui/icons-material';
import { uploadDocument } from '../../actions/documentActions';
import { DOCUMENT_UPLOAD_RESET } from '../../constants/documentConstants';

const documentTypes = [
  'Explanation of Benefits',
  'Medical Record',
  'Denial Letter',
  'Insurance Policy',
  'Medical Bill',
  'Prescription',
  'Other',
];

// TabPanel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`upload-tabpanel-${index}`}
      aria-labelledby={`upload-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

const UploadDocument = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [tabValue, setTabValue] = useState(0);
  const [file, setFile] = useState(null);
  const [filePath, setFilePath] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [documentName, setDocumentName] = useState('');
  const [notes, setNotes] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [validationError, setValidationError] = useState('');

  const { loading, error, success } = useSelector((state) => state.documentUpload || {});

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    // Clear existing file information when switching tabs
    setFile(null);
    setFilePath('');
    setPreviewUrl('');
    setValidationError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Extract filename from complex path
  const extractFilename = (path) => {
    if (!path) return '';
    
    try {
      // Handle Windows and Unix paths
      // First handle Windows UNC paths (\\server\share\path)
      let normalized = path;
      
      // Handle Windows backslashes and normalize to forward slashes
      normalized = normalized.replace(/\\/g, '/');
      
      // Handle WSL paths (/mnt/c/...)
      if (normalized.startsWith('/mnt/')) {
        normalized = normalized.substring(5); // Remove the /mnt/ prefix
      }
      
      // For paths like "wsl.localhost"
      if (normalized.includes('wsl.localhost')) {
        // Extract the part after the distribution name
        const parts = normalized.split('/');
        const distIndex = parts.findIndex(part => part === 'wsl.localhost') + 1;
        if (distIndex > 0 && distIndex < parts.length - 1) {
          normalized = '/' + parts.slice(distIndex + 1).join('/');
        }
      }
      
      // Extract filename from the normalized path
      const filename = normalized.split('/').pop();
      
      return filename || path;
    } catch (error) {
      console.error('Error extracting filename:', error);
      // Return last part of path as a fallback
      const parts = path.split(/[\/\\]/);
      return parts[parts.length - 1] || path;
    }
  };
  
  // Format filename for display
  const formatFilename = (filename) => {
    if (!filename) return '';
    return filename
      .replace(/\.[^/.]+$/, '') // Remove extension
      .replace(/[-_]/g, ' '); // Replace hyphens and underscores with spaces
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (selectedFile) {
      validateAndProcessFile(selectedFile);
    }
  };
  
  const handleFilePathChange = (e) => {
    setFilePath(e.target.value);
    
    if (e.target.value) {
      const filename = extractFilename(e.target.value);
      
      // Only update document name if it hasn't been set or was previously set from a filename
      // Safely check file.name without risking null reference errors
      const currentFileNameFormatted = file ? formatFilename(file.name) : '';
      if (!documentName || (currentFileNameFormatted && documentName === currentFileNameFormatted)) {
        setDocumentName(formatFilename(filename));
      }
    }
  };
  
  const handleFilePathSubmit = async () => {
    if (!filePath) {
      setValidationError('Please enter a file path');
      return;
    }
    
    try {
      // Extract filename for validation
      const filename = extractFilename(filePath);
      const fileExtension = filename.split('.').pop().toLowerCase();
      const validExtensions = ['pdf', 'jpg', 'jpeg', 'png'];
      
      if (!validExtensions.includes(fileExtension)) {
        setValidationError('Invalid file type. Please upload a PDF or image file.');
        return;
      }
      
      // Create a dummy file object for the UI
      const dummyFile = {
        name: filename,
        size: 0, // Unknown until processed on server
        type: fileExtension === 'pdf' ? 'application/pdf' : `image/${fileExtension}`
      };
      
      setFile(dummyFile);
      setValidationError('');
      
      // Set document name from filename if not already set
      if (!documentName) {
        setDocumentName(formatFilename(filename));
      }
    } catch (error) {
      console.error('Error processing file path:', error);
      setValidationError('Invalid file path. Please check and try again.');
    }
  };

  const validateAndProcessFile = (fileToProcess) => {
    if (!fileToProcess) {
      setValidationError('Invalid file selected.');
      return;
    }
    
    try {
      // Check file type
      const filename = fileToProcess.name;
      if (!filename) {
        setValidationError('File has no name.');
        return;
      }
      
      const fileExtension = filename.split('.').pop().toLowerCase();
      const validExtensions = ['pdf', 'jpg', 'jpeg', 'png'];
      
      if (!validExtensions.includes(fileExtension)) {
        setValidationError('Invalid file type. Please upload a PDF or image file.');
        return;
      }
      
      // Check file size (max 10MB)
      if (fileToProcess.size > 10 * 1024 * 1024) {
        setValidationError('File is too large. Maximum size is 10MB.');
        return;
      }
      
      setFile(fileToProcess);
      setValidationError('');
      
      // Auto-set document name from file name if not already set
      if (!documentName) {
        setDocumentName(formatFilename(filename));
      }
      
      // Create preview URL for image files
      if (['jpg', 'jpeg', 'png'].includes(fileExtension)) {
        const fileReader = new FileReader();
        fileReader.onload = () => {
          setPreviewUrl(fileReader.result);
        };
        fileReader.readAsDataURL(fileToProcess);
      } else {
        setPreviewUrl('');
      }
    } catch (error) {
      console.error('Error processing file:', error);
      setValidationError('Error processing file. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file && !filePath) {
      setValidationError('Please select a file or provide a file path');
      return;
    }
    
    if (!documentType) {
      setValidationError('Please select a document type');
      return;
    }
    
    if (!documentName) {
      setValidationError('Please enter a document name');
      return;
    }
    
    const formData = new FormData();
    
    // Handle either file upload or file path upload
    if (tabValue === 0 && file) {
      // Regular file upload
      formData.append('document', file);
    } else if (tabValue === 1 && filePath) {
      // File path upload
      formData.append('filePath', filePath);
    } else {
      setValidationError('Please select a file or provide a valid file path');
      return;
    }
    
    formData.append('documentType', documentType.toLowerCase().replace(/\s+/g, ''));
    formData.append('name', documentName);
    
    if (notes) {
      formData.append('notes', notes);
    }
    
    try {
      const result = await dispatch(uploadDocument(formData));
      
      // If upload was successful, navigate to the document details page
      if (result && result.id) {
        setTimeout(() => {
          dispatch({ type: DOCUMENT_UPLOAD_RESET });
          navigate(`/documents/${result.id}`);
        }, 1500);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      setValidationError(error.message || 'Upload failed. Please try again.');
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setFilePath('');
    setPreviewUrl('');
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleOpenPreview = () => {
    setPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setPreviewOpen(false);
  };

  const handleExternalPathBrowse = () => {
    // Re-use the existing file input by triggering a click
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Upload Document
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {validationError && <Alert severity="error" sx={{ mb: 3 }}>{validationError}</Alert>}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Document uploaded successfully! Redirecting to document details...
        </Alert>
      )}
      
      <form onSubmit={handleSubmit}>
        <Box sx={{ mb: 3 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="upload method tabs"
            variant="fullWidth"
          >
            <Tab icon={<UploadIcon />} iconPosition="start" label="Upload File" id="upload-tab-0" />
            <Tab icon={<LinkIcon />} iconPosition="start" label="File Path" id="upload-tab-1" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Box
            sx={{
              border: '2px dashed',
              borderColor: 'primary.main',
              borderRadius: 2,
              p: 3,
              mb: 3,
              textAlign: 'center',
              bgcolor: 'background.default',
              position: 'relative',
            }}
          >
            <input
              type="file"
              id="document-file-input"
              ref={fileInputRef}
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                opacity: 0,
                cursor: 'pointer',
                width: '100%',
                height: '100%',
              }}
              disabled={loading || success}
            />
            
            {file ? (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                  <FileIcon color="primary" sx={{ fontSize: 40, mr: 1 }} />
                  <Typography variant="body1">{file.name}</Typography>
                  <IconButton 
                    color="error" 
                    onClick={handleRemoveFile} 
                    disabled={loading || success}
                    sx={{ ml: 1 }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
                
                {previewUrl && (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleOpenPreview}
                    sx={{ mt: 1 }}
                  >
                    Preview Image
                  </Button>
                )}
              </Box>
            ) : (
              <Box>
                <UploadIcon sx={{ fontSize: 60, color: 'text.secondary' }} />
                <Typography variant="h6" color="textSecondary" gutterBottom>
                  Drag and drop a file here or click to select
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Supported formats: PDF, JPG, PNG (max 10MB)
                </Typography>
              </Box>
            )}
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Enter the complete file path to the document you want to upload
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TextField
                fullWidth
                label="File Path"
                placeholder="Enter full file path (e.g., C:/Documents/file.pdf)"
                value={filePath}
                onChange={handleFilePathChange}
                disabled={loading || success}
                InputProps={{
                  endAdornment: (
                    <Tooltip title="Browse files">
                      <IconButton 
                        onClick={handleExternalPathBrowse} 
                        edge="end"
                        disabled={loading || success}
                      >
                        <BrowseIcon />
                      </IconButton>
                    </Tooltip>
                  ),
                }}
              />
              <Button
                variant="contained"
                onClick={handleFilePathSubmit}
                disabled={!filePath || loading || success}
              >
                Verify
              </Button>
            </Box>
            
            {file && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <FileIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="body2">
                  File selected: {file.name}
                </Typography>
                <IconButton 
                  color="error" 
                  onClick={handleRemoveFile} 
                  disabled={loading || success}
                  size="small"
                  sx={{ ml: 1 }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            )}
          </Box>
        </TabPanel>

        <Divider sx={{ my: 3 }} />
          
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required disabled={loading || success}>
              <InputLabel id="document-type-label">Document Type</InputLabel>
              <Select
                labelId="document-type-label"
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                label="Document Type"
              >
                {documentTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              label="Document Name"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              fullWidth
              required
              disabled={loading || success}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              label="Notes (Optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              fullWidth
              multiline
              rows={3}
              disabled={loading || success}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button
                type="button"
                variant="outlined"
                onClick={() => navigate('/documents')}
                sx={{ mr: 2 }}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={(tabValue === 0 && !file) || (tabValue === 1 && !filePath) || loading || success}
                startIcon={loading ? <CircularProgress size={20} /> : <UploadIcon />}
              >
                {loading ? 'Uploading...' : 'Upload Document'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
      
      {/* Image Preview Dialog */}
      <Dialog open={previewOpen} onClose={handleClosePreview} maxWidth="md" fullWidth>
        <DialogTitle>Image Preview</DialogTitle>
        <DialogContent>
          {previewUrl && (
            <Box sx={{ textAlign: 'center' }}>
              <img 
                src={previewUrl} 
                alt="Document Preview" 
                style={{ maxWidth: '100%', maxHeight: '70vh' }} 
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePreview} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default UploadDocument;