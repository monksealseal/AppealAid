import React, { useState, useEffect } from 'react';
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
  IconButton,
  Card,
  CardContent,
  CardActions,
  Tooltip,
  Tab,
  Tabs,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  LinearProgress
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import EmailIcon from '@mui/icons-material/Email';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CancelIcon from '@mui/icons-material/Cancel';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import DescriptionIcon from '@mui/icons-material/Description';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import VideoFileIcon from '@mui/icons-material/VideoFile';
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import SendIcon from '@mui/icons-material/Send';
import { styled } from '@mui/material/styles';
import api from '../../services/api';

// Tab panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`provider-collab-tabpanel-${index}`}
      aria-labelledby={`provider-collab-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Request item chip
const RequestItemChip = ({ item, onDelete }) => (
  <Chip 
    label={item}
    onDelete={onDelete}
    sx={{ m: 0.5 }}
  />
);

// Provider Collaboration component
const ProviderCollaboration = ({ appealId, appeal }) => {
  // State variables
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [clinicalData, setClinicalData] = useState(null);
  const [clinicalSummary, setClinicalSummary] = useState(null);
  
  // New request form state
  const [openRequestForm, setOpenRequestForm] = useState(false);
  const [requestType, setRequestType] = useState('documentation');
  const [message, setMessage] = useState('');
  const [requestedItems, setRequestedItems] = useState([]);
  const [newItem, setNewItem] = useState('');
  const [providerEmail, setProviderEmail] = useState('');
  const [providerPhone, setProviderPhone] = useState('');
  const [responseDeadline, setResponseDeadline] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)); // 7 days from now
  const [submitting, setSubmitting] = useState(false);
  
  // EHR fetch state
  const [openEhrDialog, setOpenEhrDialog] = useState(false);
  const [ehrDataTypes, setEhrDataTypes] = useState(['diagnoses', 'medications', 'labs', 'vitals']);
  const [fetchingEhr, setFetchingEhr] = useState(false);
  
  // Clinial summary state
  const [generatingSummary, setGeneratingSummary] = useState(false);
  
  // Fetch collaboration requests on load
  useEffect(() => {
    if (appealId) {
      fetchCollaborationRequests();
    }
  }, [appealId]);
  
  // Fetch collaboration requests
  const fetchCollaborationRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/provider-collaboration/requests/${appealId}`);
      
      if (response.data.success) {
        setRequests(response.data.collaborationRequests || []);
        
        // Check if appeal has clinical data or summary
        if (appeal.clinicalData && Object.keys(appeal.clinicalData).length > 0) {
          setClinicalData(appeal.clinicalData);
        }
        
        if (appeal.clinicalSummary) {
          setClinicalSummary(appeal.clinicalSummary);
        }
      } else {
        setErrorMessage('Failed to load collaboration requests');
      }
    } catch (err) {
      console.error('Error fetching collaboration requests:', err);
      setErrorMessage('Error loading collaboration requests');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Open new request form
  const handleOpenRequestForm = () => {
    setOpenRequestForm(true);
    
    // Set default message
    setMessage(
      `Dear Healthcare Provider,\n\nWe are requesting additional clinical documentation to support an insurance appeal for your patient. Please provide the following documentation through this secure portal.\n\nThank you for your assistance.`
    );
  };
  
  // Close new request form
  const handleCloseRequestForm = () => {
    setOpenRequestForm(false);
    resetForm();
  };
  
  // Reset form
  const resetForm = () => {
    setRequestType('documentation');
    setMessage('');
    setRequestedItems([]);
    setNewItem('');
    setProviderEmail('');
    setProviderPhone('');
    setResponseDeadline(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
    setSubmitting(false);
  };
  
  // Add requested item
  const handleAddItem = () => {
    if (newItem.trim()) {
      setRequestedItems([...requestedItems, newItem.trim()]);
      setNewItem('');
    }
  };
  
  // Remove requested item
  const handleRemoveItem = (index) => {
    const newItems = [...requestedItems];
    newItems.splice(index, 1);
    setRequestedItems(newItems);
  };
  
  // Submit collaboration request
  const handleSubmitRequest = async () => {
    // Validate form
    if (!message.trim()) {
      setErrorMessage('Please enter a message for the provider');
      return;
    }
    
    try {
      setSubmitting(true);
      setErrorMessage('');
      
      const requestData = {
        appealId,
        requestType,
        message: message.trim(),
        requestedItems,
        responseDeadline,
        providerEmail: providerEmail.trim() || undefined,
        providerPhone: providerPhone.trim() || undefined
      };
      
      const response = await api.post('/provider-collaboration/request', requestData);
      
      if (response.data.success) {
        setSuccessMessage('Collaboration request created successfully');
        handleCloseRequestForm();
        fetchCollaborationRequests();
      } else {
        setErrorMessage(response.data.message || 'Failed to create collaboration request');
      }
    } catch (err) {
      console.error('Error creating collaboration request:', err);
      setErrorMessage('Error creating collaboration request');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Copy link to clipboard
  const copyLinkToClipboard = (link) => {
    navigator.clipboard.writeText(link)
      .then(() => {
        setSuccessMessage('Link copied to clipboard');
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      })
      .catch(err => {
        console.error('Error copying link:', err);
        setErrorMessage('Failed to copy link');
      });
  };
  
  // Send email to provider
  const sendEmailToProvider = (email, link) => {
    const subject = encodeURIComponent(`Documentation Request for Patient ${appeal.patient?.name || 'Appeal'}`);
    const body = encodeURIComponent(
      `Dear Healthcare Provider,\n\nWe are requesting additional clinical documentation to support an insurance appeal. Please use the following link to securely upload the requested documentation:\n\n${link}\n\nThank you for your assistance.`
    );
    
    window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_blank');
  };
  
  // Open EHR data dialog
  const handleOpenEhrDialog = () => {
    setOpenEhrDialog(true);
  };
  
  // Close EHR data dialog
  const handleCloseEhrDialog = () => {
    setOpenEhrDialog(false);
  };
  
  // Handle EHR data type selection
  const handleEhrDataTypeChange = (event) => {
    setEhrDataTypes(event.target.value);
  };
  
  // Fetch EHR data
  const handleFetchEhrData = async () => {
    try {
      setFetchingEhr(true);
      setErrorMessage('');
      
      const response = await api.post('/provider-collaboration/ehr-data', {
        appealId,
        dataTypes: ehrDataTypes
      });
      
      if (response.data.success) {
        setClinicalData(response.data.clinicalData);
        setSuccessMessage('Clinical data imported successfully');
        handleCloseEhrDialog();
      } else {
        setErrorMessage(response.data.message || 'Failed to import clinical data');
      }
    } catch (err) {
      console.error('Error fetching EHR data:', err);
      setErrorMessage('Error importing clinical data');
    } finally {
      setFetchingEhr(false);
    }
  };
  
  // Generate clinical summary
  const handleGenerateSummary = async () => {
    if (!clinicalData) {
      setErrorMessage('No clinical data available. Please import data first.');
      return;
    }
    
    try {
      setGeneratingSummary(true);
      setErrorMessage('');
      
      const response = await api.post('/provider-collaboration/clinical-summary', {
        appealId
      });
      
      if (response.data.success) {
        setClinicalSummary(response.data.clinicalSummary);
        setSuccessMessage('Clinical summary generated successfully');
      } else {
        setErrorMessage(response.data.message || 'Failed to generate clinical summary');
      }
    } catch (err) {
      console.error('Error generating clinical summary:', err);
      setErrorMessage('Error generating clinical summary');
    } finally {
      setGeneratingSummary(false);
    }
  };
  
  // Get request status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon color="success" />;
      case 'pending':
        return <AccessTimeIcon color="warning" />;
      case 'cancelled':
        return <CancelIcon color="error" />;
      default:
        return <WarningIcon color="info" />;
    }
  };
  
  // Get document icon based on type
  const getDocumentIcon = (documentType) => {
    switch (documentType) {
      case 'medical_record':
        return <DescriptionIcon />;
      case 'imaging':
        return <VideoFileIcon />;
      case 'lab_results':
        return <DescriptionIcon />;
      case 'clinical_documentation':
        return <DescriptionIcon />;
      default:
        return <PictureAsPdfIcon />;
    }
  };
  
  // Format date string
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (err) {
      return 'Invalid Date';
    }
  };
  
  // If loading
  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <LinearProgress />
      </Box>
    );
  }
  
  return (
    <Box sx={{ mt: 2 }}>
      {/* Messages */}
      {errorMessage && (
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          onClose={() => setErrorMessage('')}
        >
          {errorMessage}
        </Alert>
      )}
      
      {successMessage && (
        <Alert 
          severity="success" 
          sx={{ mb: 2 }}
          onClose={() => setSuccessMessage('')}
        >
          {successMessage}
        </Alert>
      )}
      
      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          aria-label="provider collaboration tabs"
        >
          <Tab label="Collaboration Requests" id="provider-collab-tab-0" />
          <Tab label="Clinical Data" id="provider-collab-tab-1" />
          <Tab label="Clinical Summary" id="provider-collab-tab-2" />
        </Tabs>
      </Box>
      
      {/* Collaboration Requests Tab */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Provider Collaboration Requests
          </Typography>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenRequestForm}
          >
            New Request
          </Button>
        </Box>
        
        {requests.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No collaboration requests found.
            </Typography>
            <Button
              variant="text"
              color="primary"
              onClick={handleOpenRequestForm}
              sx={{ mt: 2 }}
            >
              Create a Request
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={2}>
            {requests.map((request, index) => (
              <Grid item xs={12} key={index}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          {request.requestType === 'documentation' ? 'Documentation Request' : 
                          request.requestType === 'clarification' ? 'Clarification Request' : 
                          request.requestType === 'additional_information' ? 'Additional Information Request' : 
                          'Other Request'}
                        </Typography>
                        
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Created: {formatDate(request.requestDate)} • 
                          Due: {formatDate(request.responseDeadline)}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ mr: 1 }}>
                          Status:
                        </Typography>
                        <Chip
                          icon={getStatusIcon(request.status)}
                          label={request.status === 'completed' ? 'Completed' : 
                                request.status === 'pending' ? 'Pending' : 
                                request.status === 'cancelled' ? 'Cancelled' : 'Unknown'}
                          color={request.status === 'completed' ? 'success' : 
                                request.status === 'pending' ? 'warning' : 
                                request.status === 'cancelled' ? 'error' : 'default'}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Typography variant="body1">
                      {request.message}
                    </Typography>
                    
                    {request.requestedItems && request.requestedItems.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Requested Items:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                          {request.requestedItems.map((item, i) => (
                            <Chip 
                              key={i}
                              label={item}
                              size="small"
                              sx={{ mr: 1, mb: 1 }}
                            />
                          ))}
                        </Box>
                      </Box>
                    )}
                    
                    {request.status === 'completed' && request.responseDate && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Response received on {formatDate(request.responseDate)}
                        </Typography>
                        {request.responseNotes && (
                          <Typography variant="body2">
                            {request.responseNotes}
                          </Typography>
                        )}
                      </Box>
                    )}
                  </CardContent>
                  
                  {request.status === 'pending' && (
                    <CardActions sx={{ justifyContent: 'flex-end', p: 2, pt: 0 }}>
                      {request.providerEmail && (
                        <Tooltip title={`Send email to ${request.providerEmail}`}>
                          <IconButton 
                            color="primary"
                            onClick={() => sendEmailToProvider(request.providerEmail, request.providerPortalLink)}
                          >
                            <EmailIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      
                      {request.providerPortalLink && (
                        <Tooltip title="Copy link to clipboard">
                          <IconButton 
                            color="primary"
                            onClick={() => copyLinkToClipboard(request.providerPortalLink)}
                          >
                            <ContentCopyIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      
                      <Button
                        startIcon={<OpenInNewIcon />}
                        href={request.providerPortalLink}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Open Portal Link
                      </Button>
                    </CardActions>
                  )}
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>
      
      {/* Clinical Data Tab */}
      <TabPanel value={tabValue} index={1}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Clinical Data
          </Typography>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenEhrDialog}
          >
            Import Clinical Data
          </Button>
        </Box>
        
        {!clinicalData || Object.keys(clinicalData).length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No clinical data available. Import data from an EHR system or wait for provider submission.
            </Typography>
            <Button
              variant="text"
              color="primary"
              onClick={handleOpenEhrDialog}
              sx={{ mt: 2 }}
            >
              Import Data
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {/* Diagnoses */}
            {clinicalData.diagnoses && clinicalData.diagnoses.length > 0 && (
              <Grid item xs={12}>
                <Paper sx={{ p: 2 }} variant="outlined">
                  <Typography variant="h6" gutterBottom>
                    Diagnoses
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <List dense>
                    {clinicalData.diagnoses.map((diagnosis, index) => (
                      <ListItem key={index}>
                        <ListItemText
                          primary={
                            <Box>
                              <Typography variant="subtitle2" component="span">
                                {diagnosis.description}
                              </Typography>
                              {diagnosis.code && (
                                <Typography variant="body2" component="span" color="text.secondary" sx={{ ml: 1 }}>
                                  ({diagnosis.code})
                                </Typography>
                              )}
                            </Box>
                          }
                          secondary={
                            <Typography variant="body2" color="text.secondary">
                              {diagnosis.date ? `Date: ${formatDate(diagnosis.date)}` : ''}
                              {diagnosis.provider ? ` • Provider: ${diagnosis.provider}` : ''}
                              {diagnosis.status ? ` • Status: ${diagnosis.status}` : ''}
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Grid>
            )}
            
            {/* Medications */}
            {clinicalData.medications && clinicalData.medications.length > 0 && (
              <Grid item xs={12}>
                <Paper sx={{ p: 2 }} variant="outlined">
                  <Typography variant="h6" gutterBottom>
                    Medications
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <List dense>
                    {clinicalData.medications.map((medication, index) => (
                      <ListItem key={index}>
                        <ListItemText
                          primary={
                            <Box>
                              <Typography variant="subtitle2" component="span">
                                {medication.name}
                              </Typography>
                              {medication.dosage && (
                                <Typography variant="body2" component="span" sx={{ ml: 1 }}>
                                  {medication.dosage}
                                </Typography>
                              )}
                              {medication.frequency && (
                                <Typography variant="body2" component="span" sx={{ ml: 1 }}>
                                  {medication.frequency}
                                </Typography>
                              )}
                            </Box>
                          }
                          secondary={
                            <Typography variant="body2" color="text.secondary">
                              {medication.startDate ? `Started: ${formatDate(medication.startDate)}` : ''}
                              {medication.prescriber ? ` • Prescriber: ${medication.prescriber}` : ''}
                              {medication.status ? ` • Status: ${medication.status}` : ''}
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Grid>
            )}
            
            {/* Labs */}
            {clinicalData.labs && clinicalData.labs.length > 0 && (
              <Grid item xs={12}>
                <Paper sx={{ p: 2 }} variant="outlined">
                  <Typography variant="h6" gutterBottom>
                    Laboratory Results
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  {clinicalData.labs.map((lab, index) => (
                    <Box key={index} sx={{ mb: 3 }}>
                      <Typography variant="subtitle1">
                        {lab.name} {lab.date ? `(${formatDate(lab.date)})` : ''}
                      </Typography>
                      
                      {lab.provider && (
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Provider: {lab.provider}
                        </Typography>
                      )}
                      
                      <Grid container spacing={1} sx={{ mt: 1 }}>
                        <Grid item xs={4}>
                          <Typography variant="caption" color="text.secondary">
                            Test
                          </Typography>
                        </Grid>
                        <Grid item xs={3}>
                          <Typography variant="caption" color="text.secondary">
                            Result
                          </Typography>
                        </Grid>
                        <Grid item xs={2}>
                          <Typography variant="caption" color="text.secondary">
                            Units
                          </Typography>
                        </Grid>
                        <Grid item xs={3}>
                          <Typography variant="caption" color="text.secondary">
                            Reference
                          </Typography>
                        </Grid>
                      </Grid>
                      
                      <Divider sx={{ my: 1 }} />
                      
                      {lab.results && lab.results.map((result, i) => (
                        <Grid container spacing={1} key={i} sx={{ py: 0.5 }}>
                          <Grid item xs={4}>
                            <Typography variant="body2">
                              {result.name}
                            </Typography>
                          </Grid>
                          <Grid item xs={3}>
                            <Typography 
                              variant="body2"
                              color={result.flag ? 'error.main' : 'text.primary'}
                              fontWeight={result.flag ? 'medium' : 'normal'}
                            >
                              {result.value}
                              {result.flag && (
                                <Chip 
                                  label={result.flag} 
                                  size="small" 
                                  color="error" 
                                  sx={{ ml: 1, height: 16, fontSize: '0.625rem' }}
                                />
                              )}
                            </Typography>
                          </Grid>
                          <Grid item xs={2}>
                            <Typography variant="body2" color="text.secondary">
                              {result.unit}
                            </Typography>
                          </Grid>
                          <Grid item xs={3}>
                            <Typography variant="body2" color="text.secondary">
                              {result.reference}
                            </Typography>
                          </Grid>
                        </Grid>
                      ))}
                    </Box>
                  ))}
                </Paper>
              </Grid>
            )}
            
            {/* Vitals */}
            {clinicalData.vitals && clinicalData.vitals.length > 0 && (
              <Grid item xs={12}>
                <Paper sx={{ p: 2 }} variant="outlined">
                  <Typography variant="h6" gutterBottom>
                    Vital Signs
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  {clinicalData.vitals.map((vital, index) => (
                    <Box key={index} sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        {formatDate(vital.date)} {vital.provider ? `• ${vital.provider}` : ''}
                      </Typography>
                      
                      <Grid container spacing={2}>
                        {vital.readings && vital.readings.map((reading, i) => (
                          <Grid item xs={6} sm={4} md={3} key={i}>
                            <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center' }}>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                {reading.name}
                              </Typography>
                              <Typography variant="h6">
                                {reading.value}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {reading.unit}
                              </Typography>
                            </Paper>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  ))}
                </Paper>
              </Grid>
            )}
            
            {/* Imaging */}
            {clinicalData.imaging && clinicalData.imaging.length > 0 && (
              <Grid item xs={12}>
                <Paper sx={{ p: 2 }} variant="outlined">
                  <Typography variant="h6" gutterBottom>
                    Imaging
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  {clinicalData.imaging.map((image, index) => (
                    <Box key={index} sx={{ mb: 3 }}>
                      <Typography variant="subtitle1">
                        {image.type} - {image.bodyPart} {image.date ? `(${formatDate(image.date)})` : ''}
                      </Typography>
                      
                      {image.provider && (
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Provider: {image.provider}
                        </Typography>
                      )}
                      
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="subtitle2">
                          Findings:
                        </Typography>
                        <Typography variant="body2" paragraph>
                          {image.findings}
                        </Typography>
                        
                        <Typography variant="subtitle2">
                          Impression:
                        </Typography>
                        <Typography variant="body2">
                          {image.impression}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Paper>
              </Grid>
            )}
            
            {/* Clinical Notes */}
            {clinicalData.notes && clinicalData.notes.length > 0 && (
              <Grid item xs={12}>
                <Paper sx={{ p: 2 }} variant="outlined">
                  <Typography variant="h6" gutterBottom>
                    Clinical Notes
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  {clinicalData.notes.map((note, index) => (
                    <Box key={index} sx={{ mb: 3 }}>
                      <Typography variant="subtitle1">
                        {note.type} {note.date ? `(${formatDate(note.date)})` : ''}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Provider: {note.provider || 'Unknown'}
                      </Typography>
                      
                      <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-line' }}>
                        {note.content}
                      </Typography>
                    </Box>
                  ))}
                </Paper>
              </Grid>
            )}
          </Grid>
        )}
      </TabPanel>
      
      {/* Clinical Summary Tab */}
      <TabPanel value={tabValue} index={2}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Clinical Summary
          </Typography>
          
          <Button
            variant="contained"
            color="primary"
            disabled={!clinicalData || generatingSummary}
            startIcon={generatingSummary ? <CircularProgress size={20} /> : null}
            onClick={handleGenerateSummary}
          >
            {generatingSummary ? 'Generating...' : 'Generate Summary'}
          </Button>
        </Box>
        
        {!clinicalSummary ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No clinical summary available. Generate a summary from the clinical data to include in your appeal.
            </Typography>
            {clinicalData ? (
              <Button
                variant="text"
                color="primary"
                onClick={handleGenerateSummary}
                disabled={generatingSummary}
                sx={{ mt: 2 }}
              >
                {generatingSummary ? 'Generating...' : 'Generate Summary'}
              </Button>
            ) : (
              <Button
                variant="text"
                color="primary"
                onClick={() => setTabValue(1)}
                sx={{ mt: 2 }}
              >
                Import Clinical Data First
              </Button>
            )}
          </Paper>
        ) : (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Clinical Summary for Appeal
            </Typography>
            
            <Divider sx={{ mb: 3 }} />
            
            {/* Patient Info */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Patient Information
              </Typography>
              <Typography variant="body1">
                {appeal.patient?.name || 'Patient'}, {clinicalSummary.patientInfo?.age || 'Unknown'} year old {clinicalSummary.patientInfo?.gender || 'Unknown'}
              </Typography>
            </Box>
            
            {/* Primary Diagnosis */}
            {clinicalSummary.primaryDiagnosis && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Primary Diagnosis
                </Typography>
                <Typography variant="body1">
                  {clinicalSummary.primaryDiagnosis.description} {clinicalSummary.primaryDiagnosis.code ? `(${clinicalSummary.primaryDiagnosis.code})` : ''}
                </Typography>
              </Box>
            )}
            
            {/* Comorbidities */}
            {clinicalSummary.comorbidities && clinicalSummary.comorbidities.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Comorbidities
                </Typography>
                <List dense>
                  {clinicalSummary.comorbidities.map((diagnosis, index) => (
                    <ListItem key={index} sx={{ py: 0 }}>
                      <ListItemText
                        primary={`${diagnosis.description} ${diagnosis.code ? `(${diagnosis.code})` : ''}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
            
            {/* Functional Status */}
            {clinicalSummary.functionalStatus && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Functional Status
                </Typography>
                
                <Grid container spacing={2}>
                  {clinicalSummary.functionalStatus.mobility && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Mobility:
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {clinicalSummary.functionalStatus.mobility}
                      </Typography>
                    </Grid>
                  )}
                  
                  {clinicalSummary.functionalStatus.strength && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Strength:
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {clinicalSummary.functionalStatus.strength}
                      </Typography>
                    </Grid>
                  )}
                  
                  {clinicalSummary.functionalStatus.adls && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Activities of Daily Living:
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {clinicalSummary.functionalStatus.adls}
                      </Typography>
                    </Grid>
                  )}
                  
                  {clinicalSummary.functionalStatus.cognition && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Cognition:
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {clinicalSummary.functionalStatus.cognition}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
                
                {clinicalSummary.functionalStatus.source && (
                  <Typography variant="caption" color="text.secondary">
                    Source: {clinicalSummary.functionalStatus.source}
                  </Typography>
                )}
              </Box>
            )}
            
            {/* Relevant Lab Abnormalities */}
            {clinicalSummary.relevantLabs && clinicalSummary.relevantLabs.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Relevant Laboratory Abnormalities
                </Typography>
                <List dense>
                  {clinicalSummary.relevantLabs.map((lab, index) => (
                    <ListItem key={index} sx={{ py: 0 }}>
                      <ListItemText
                        primary={`${lab.name}: ${lab.value} ${lab.flag ? `(${lab.flag})` : ''}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
            
            {/* Clinical Justification */}
            {clinicalSummary.clinicalJustification && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Clinical Justification
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f8f9fa' }}>
                  <Typography variant="body1">
                    {clinicalSummary.clinicalJustification}
                  </Typography>
                </Paper>
              </Box>
            )}
            
            {/* Export Options */}
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                startIcon={<DescriptionIcon />}
                sx={{ mr: 2 }}
              >
                Export to PDF
              </Button>
              
              <Button
                variant="contained"
                startIcon={<SendIcon />}
              >
                Include in Appeal
              </Button>
            </Box>
          </Paper>
        )}
      </TabPanel>
      
      {/* New Request Dialog */}
      <Dialog
        open={openRequestForm}
        onClose={handleCloseRequestForm}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create Provider Collaboration Request</DialogTitle>
        
        <DialogContent>
          {errorMessage && (
            <Alert 
              severity="error" 
              sx={{ mb: 2 }}
              onClose={() => setErrorMessage('')}
            >
              {errorMessage}
            </Alert>
          )}
          
          <DialogContentText sx={{ mb: 2 }}>
            Create a request for a healthcare provider to submit clinical documentation for this appeal.
          </DialogContentText>
          
          <Grid container spacing={2}>
            {/* Request Type */}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="request-type-label">Request Type</InputLabel>
                <Select
                  labelId="request-type-label"
                  value={requestType}
                  label="Request Type"
                  onChange={(e) => setRequestType(e.target.value)}
                >
                  <MenuItem value="documentation">Documentation Request</MenuItem>
                  <MenuItem value="clarification">Clarification Request</MenuItem>
                  <MenuItem value="additional_information">Additional Information Request</MenuItem>
                  <MenuItem value="other">Other Request</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {/* Message */}
            <Grid item xs={12}>
              <TextField
                label="Message to Provider"
                multiline
                rows={6}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                fullWidth
                required
              />
            </Grid>
            
            {/* Requested Items */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Requested Items
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', mb: 1 }}>
                {requestedItems.map((item, index) => (
                  <RequestItemChip
                    key={index}
                    item={item}
                    onDelete={() => handleRemoveItem(index)}
                  />
                ))}
              </Box>
              
              <Box sx={{ display: 'flex' }}>
                <TextField
                  label="New Item"
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  fullWidth
                  size="small"
                  placeholder="e.g., Physical Therapy Notes"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddItem();
                    }
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleAddItem}
                  disabled={!newItem.trim()}
                  sx={{ ml: 1 }}
                >
                  Add
                </Button>
              </Box>
            </Grid>
            
            {/* Provider Contact */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Provider Email"
                type="email"
                value={providerEmail}
                onChange={(e) => setProviderEmail(e.target.value)}
                fullWidth
                placeholder="doctor@example.com"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Provider Phone"
                value={providerPhone}
                onChange={(e) => setProviderPhone(e.target.value)}
                fullWidth
                placeholder="(555) 123-4567"
              />
            </Grid>
            
            {/* Response Deadline */}
            <Grid item xs={12}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Response Deadline"
                  value={responseDeadline}
                  onChange={(newDate) => setResponseDeadline(newDate)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                  minDate={new Date()}
                />
              </LocalizationProvider>
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCloseRequestForm} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmitRequest}
            variant="contained"
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={20} /> : null}
          >
            {submitting ? 'Creating...' : 'Create Request'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* EHR Data Dialog */}
      <Dialog
        open={openEhrDialog}
        onClose={handleCloseEhrDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Import Clinical Data</DialogTitle>
        
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Select the types of clinical data you want to import from the EHR system.
          </DialogContentText>
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="ehr-data-types-label">Data Types</InputLabel>
            <Select
              labelId="ehr-data-types-label"
              multiple
              value={ehrDataTypes}
              onChange={handleEhrDataTypeChange}
              label="Data Types"
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} />
                  ))}
                </Box>
              )}
            >
              <MenuItem value="diagnoses">Diagnoses</MenuItem>
              <MenuItem value="medications">Medications</MenuItem>
              <MenuItem value="labs">Laboratory Results</MenuItem>
              <MenuItem value="vitals">Vital Signs</MenuItem>
              <MenuItem value="imaging">Imaging</MenuItem>
              <MenuItem value="procedures">Procedures</MenuItem>
              <MenuItem value="notes">Clinical Notes</MenuItem>
            </Select>
          </FormControl>
          
          <Alert severity="info">
            In a production environment, this would connect to the patient's EHR system using FHIR or HL7 integration.
            For demonstration purposes, this will load sample clinical data.
          </Alert>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCloseEhrDialog} disabled={fetchingEhr}>
            Cancel
          </Button>
          <Button
            onClick={handleFetchEhrData}
            variant="contained"
            disabled={fetchingEhr || ehrDataTypes.length === 0}
            startIcon={fetchingEhr ? <CircularProgress size={20} /> : null}
          >
            {fetchingEhr ? 'Importing...' : 'Import Data'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProviderCollaboration;