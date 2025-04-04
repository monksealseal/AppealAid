/**
 * Provider Collaboration Component
 * 
 * Component for appeal owners to request and manage provider input
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Box, Typography, Button, Card, CardContent, CardHeader,
  TextField, Grid, Divider, Chip, CircularProgress, Alert,
  List, ListItem, ListItemText, ListItemIcon, Dialog,
  DialogTitle, DialogContent, DialogActions, FormControl,
  InputLabel, Select, MenuItem, Accordion, AccordionSummary,
  AccordionDetails, Tabs, Tab, IconButton, Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Email as EmailIcon,
  CloudUpload as UploadIcon,
  Assignment as AssignmentIcon,
  ContentCopy as CopyIcon,
  ExpandMore as ExpandMoreIcon,
  LocalHospital as HospitalIcon,
  Description as DescriptionIcon,
  Visibility as ViewIcon,
  FileDownload as DownloadIcon,
  CalendarToday as DateIcon,
  CheckCircle as CompletedIcon
} from '@mui/icons-material';

const ProviderCollaboration = ({ appealId, appealData }) => {
  const [loading, setLoading] = useState(true);
  const [collaborationRequests, setCollaborationRequests] = useState([]);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [newRequest, setNewRequest] = useState({
    message: 'Please provide supporting documentation for this appeal.',
    requestType: 'documentation',
    requestedItems: [''],
    providerEmail: '',
    providerPhone: '',
    responseDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });
  const [activeTab, setActiveTab] = useState(0);
  const [ehrDataLoading, setEhrDataLoading] = useState(false);
  const [clinicalSummaryLoading, setClinicalSummaryLoading] = useState(false);
  
  // Fetch collaboration requests
  useEffect(() => {
    const fetchCollaborationRequests = async () => {
      if (!appealId) return;
      
      try {
        setLoading(true);
        const response = await axios.get(`/api/provider-collaboration/requests/${appealId}`);
        
        if (response.data.success) {
          setCollaborationRequests(response.data.collaborationRequests || []);
        } else {
          setError(response.data.message || 'Failed to load collaboration requests');
        }
      } catch (error) {
        console.error('Error fetching collaboration requests:', error);
        setError('Error loading collaboration requests. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCollaborationRequests();
  }, [appealId]);
  
  // Handle dialog open/close
  const handleOpenDialog = () => {
    setOpenDialog(true);
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
  
  // Handle form input changes
  const handleInputChange = (field, value) => {
    setNewRequest({
      ...newRequest,
      [field]: value
    });
  };
  
  // Handle requested items array
  const handleRequestedItemChange = (index, value) => {
    const updatedItems = [...newRequest.requestedItems];
    updatedItems[index] = value;
    handleInputChange('requestedItems', updatedItems);
  };
  
  const handleAddRequestedItem = () => {
    handleInputChange('requestedItems', [...newRequest.requestedItems, '']);
  };
  
  const handleRemoveRequestedItem = (index) => {
    const updatedItems = [...newRequest.requestedItems];
    updatedItems.splice(index, 1);
    handleInputChange('requestedItems', updatedItems);
  };
  
  // Create new collaboration request
  const handleCreateRequest = async () => {
    try {
      // Filter out empty requested items
      const filteredItems = newRequest.requestedItems.filter(item => item.trim() !== '');
      
      const requestData = {
        ...newRequest,
        appealId,
        requestedItems: filteredItems
      };
      
      const response = await axios.post('/api/provider-collaboration/request', requestData);
      
      if (response.data.success) {
        setCollaborationRequests([
          response.data.collaborationRequest,
          ...collaborationRequests
        ]);
        setOpenDialog(false);
        setNewRequest({
          message: 'Please provide supporting documentation for this appeal.',
          requestType: 'documentation',
          requestedItems: [''],
          providerEmail: '',
          providerPhone: '',
          responseDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        });
      } else {
        setError(response.data.message || 'Failed to create collaboration request');
      }
    } catch (error) {
      console.error('Error creating collaboration request:', error);
      setError('Error creating collaboration request. Please try again.');
    }
  };
  
  // Copy provider link to clipboard
  const copyProviderLink = (link) => {
    navigator.clipboard.writeText(link)
      .then(() => {
        alert('Provider link copied to clipboard!');
      })
      .catch((error) => {
        console.error('Error copying link to clipboard:', error);
        alert('Failed to copy link. Please copy it manually.');
      });
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Fetch EHR data
  const handleFetchEHRData = async (dataTypes = ['diagnoses', 'medications', 'labs', 'vitals']) => {
    try {
      setEhrDataLoading(true);
      setError(null);
      
      const response = await axios.post('/api/provider-collaboration/ehr-data', {
        appealId,
        dataTypes
      });
      
      if (response.data.success) {
        // Data will be automatically stored in the appeal
        alert('Clinical data successfully imported from EHR!');
        // Reload appeal data or update state as needed
      } else {
        setError(response.data.message || 'Failed to import EHR data');
      }
    } catch (error) {
      console.error('Error importing EHR data:', error);
      setError('Error importing clinical data. Please try again.');
    } finally {
      setEhrDataLoading(false);
    }
  };
  
  // Generate clinical summary
  const handleGenerateClinicalSummary = async () => {
    try {
      setClinicalSummaryLoading(true);
      setError(null);
      
      const response = await axios.post('/api/provider-collaboration/clinical-summary', {
        appealId
      });
      
      if (response.data.success) {
        // Summary will be automatically stored in the appeal
        alert('Clinical summary successfully generated!');
        // Reload appeal data or update state as needed
      } else {
        setError(response.data.message || 'Failed to generate clinical summary');
      }
    } catch (error) {
      console.error('Error generating clinical summary:', error);
      setError('Error generating clinical summary. Please try again.');
    } finally {
      setClinicalSummaryLoading(false);
    }
  };
  
  const renderCollaborationRequests = () => {
    if (collaborationRequests.length === 0) {
      return (
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography color="textSecondary" sx={{ mb: 2 }}>
              No provider collaboration requests yet
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenDialog}
            >
              Request Provider Documentation
            </Button>
          </CardContent>
        </Card>
      );
    }
    
    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Provider Collaboration Requests</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
          >
            New Request
          </Button>
        </Box>
        
        {collaborationRequests.map((request, index) => (
          <Card key={index} variant="outlined" sx={{ mb: 3 }}>
            <CardHeader
              title={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="h6">
                    {request.requestType.replace('_', ' ')} Request
                  </Typography>
                  <Chip 
                    label={request.status}
                    color={request.status === 'completed' ? 'success' : 
                           request.status === 'cancelled' ? 'error' : 'primary'}
                    size="small"
                    sx={{ ml: 2 }}
                  />
                </Box>
              }
              subheader={
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                  <DateIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                  <Typography variant="body2" color="textSecondary">
                    Requested: {new Date(request.requestDate).toLocaleDateString()}
                    {request.responseDeadline && 
                      ` | Due: ${new Date(request.responseDeadline).toLocaleDateString()}`}
                  </Typography>
                </Box>
              }
            />
            <CardContent>
              <Typography variant="body1" paragraph>
                {request.message}
              </Typography>
              
              {request.requestedItems && request.requestedItems.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2">Requested Items:</Typography>
                  <List dense>
                    {request.requestedItems.map((item, idx) => (
                      <ListItem key={idx}>
                        <ListItemIcon>
                          <DescriptionIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={item} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
              
              <Grid container spacing={2}>
                {request.providerEmail && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Provider Email:</Typography>
                    <Typography variant="body2">{request.providerEmail}</Typography>
                  </Grid>
                )}
                
                {request.providerPhone && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Provider Phone:</Typography>
                    <Typography variant="body2">{request.providerPhone}</Typography>
                  </Grid>
                )}
              </Grid>
              
              {request.providerPortalLink && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2">Provider Access Link:</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TextField
                      value={request.providerPortalLink}
                      variant="outlined"
                      size="small"
                      fullWidth
                      InputProps={{
                        readOnly: true,
                        endAdornment: (
                          <Tooltip title="Copy Link">
                            <IconButton 
                              onClick={() => copyProviderLink(request.providerPortalLink)}
                            >
                              <CopyIcon />
                            </IconButton>
                          </Tooltip>
                        )
                      }}
                      sx={{ mr: 2 }}
                    />
                    <Button
                      variant="outlined"
                      startIcon={<EmailIcon />}
                      onClick={() => alert('Email functionality will be available in the next release.')}
                      disabled={!request.providerEmail}
                    >
                      Email
                    </Button>
                  </Box>
                </Box>
              )}
              
              {request.status === 'completed' && request.responseDate && (
                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                  <CompletedIcon color="success" sx={{ mr: 1 }} />
                  <Typography>
                    Completed on {new Date(request.responseDate).toLocaleDateString()}
                  </Typography>
                </Box>
              )}
              
              {request.status === 'completed' && request.responseNotes && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2">Provider Notes:</Typography>
                  <Typography variant="body2">{request.responseNotes}</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        ))}
      </Box>
    );
  };
  
  const renderProviderDocuments = () => {
    const providerDocuments = appealData?.documents?.filter(doc => doc.providerSubmitted) || [];
    
    if (providerDocuments.length === 0) {
      return (
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography color="textSecondary">
              No provider documents have been submitted yet
            </Typography>
          </CardContent>
        </Card>
      );
    }
    
    return (
      <Box>
        <Typography variant="h6" sx={{ mb: 2 }}>Provider Submitted Documents</Typography>
        
        <Grid container spacing={2}>
          {providerDocuments.map((doc, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <DescriptionIcon sx={{ mr: 1 }} />
                    <Typography variant="subtitle1" noWrap>
                      {doc.name}
                    </Typography>
                  </Box>
                  
                  <Chip 
                    label={doc.documentType.replace('_', ' ')}
                    size="small"
                    sx={{ mb: 1 }}
                  />
                  
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                    Uploaded: {new Date(doc.uploadDate).toLocaleDateString()}
                  </Typography>
                  
                  {doc.providerNotes && (
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                      Notes: {doc.providerNotes}
                    </Typography>
                  )}
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Button
                      size="small"
                      startIcon={<ViewIcon />}
                      onClick={() => alert('Document viewing will be available in the next release.')}
                    >
                      View
                    </Button>
                    <Button
                      size="small"
                      startIcon={<DownloadIcon />}
                      onClick={() => alert('Document download will be available in the next release.')}
                    >
                      Download
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };
  
  const renderClinicalData = () => {
    const clinicalData = appealData?.clinicalData || {};
    const hasClinicalData = Object.keys(clinicalData).some(key => 
      Array.isArray(clinicalData[key]) && clinicalData[key].length > 0
    );
    
    if (!hasClinicalData) {
      return (
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography color="textSecondary" sx={{ mb: 2 }}>
              No clinical data available
            </Typography>
            <Button
              variant="contained"
              startIcon={<HospitalIcon />}
              onClick={() => handleFetchEHRData()}
              disabled={ehrDataLoading}
            >
              {ehrDataLoading ? (
                <>
                  <CircularProgress size={24} sx={{ mr: 1 }} />
                  Importing...
                </>
              ) : (
                'Import Clinical Data'
              )}
            </Button>
          </CardContent>
        </Card>
      );
    }
    
    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Clinical Data</Typography>
          <Button
            variant="contained"
            startIcon={<HospitalIcon />}
            onClick={() => handleFetchEHRData()}
            disabled={ehrDataLoading}
          >
            {ehrDataLoading ? 'Importing...' : 'Refresh Data'}
          </Button>
        </Box>
        
        {clinicalData.diagnoses && clinicalData.diagnoses.length > 0 && (
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">Diagnoses</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List dense>
                {clinicalData.diagnoses.map((diagnosis, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={`${diagnosis.description} (${diagnosis.code})`}
                      secondary={`Status: ${diagnosis.status} | Provider: ${diagnosis.provider} | Date: ${new Date(diagnosis.date).toLocaleDateString()}`}
                    />
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        )}
        
        {clinicalData.medications && clinicalData.medications.length > 0 && (
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">Medications</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List dense>
                {clinicalData.medications.map((medication, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={`${medication.name} ${medication.dosage}`}
                      secondary={`Frequency: ${medication.frequency} | Status: ${medication.status} | Prescriber: ${medication.prescriber}`}
                    />
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        )}
        
        {clinicalData.labs && clinicalData.labs.length > 0 && (
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">Lab Results</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {clinicalData.labs.map((lab, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Typography variant="subtitle2">
                    {lab.name} - {new Date(lab.date).toLocaleDateString()}
                  </Typography>
                  <List dense>
                    {lab.results.map((result, resultIndex) => (
                      <ListItem key={resultIndex}>
                        <ListItemText
                          primary={`${result.name}: ${result.value} ${result.unit}`}
                          secondary={`Reference Range: ${result.reference}${result.flag ? ` | Flag: ${result.flag}` : ''}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              ))}
            </AccordionDetails>
          </Accordion>
        )}
        
        {clinicalData.vitals && clinicalData.vitals.length > 0 && (
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">Vital Signs</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {clinicalData.vitals.map((vitalSet, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Typography variant="subtitle2">
                    {new Date(vitalSet.date).toLocaleDateString()} - Provider: {vitalSet.provider}
                  </Typography>
                  <List dense>
                    {vitalSet.readings.map((reading, readingIndex) => (
                      <ListItem key={readingIndex}>
                        <ListItemText
                          primary={`${reading.name}: ${reading.value} ${reading.unit}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              ))}
            </AccordionDetails>
          </Accordion>
        )}
        
        {clinicalData.imaging && clinicalData.imaging.length > 0 && (
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">Imaging</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List dense>
                {clinicalData.imaging.map((image, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={`${image.type} - ${image.bodyPart}`}
                      secondary={
                        <>
                          <Typography variant="body2">Date: {new Date(image.date).toLocaleDateString()} | Provider: {image.provider}</Typography>
                          <Typography variant="body2">Findings: {image.findings}</Typography>
                          <Typography variant="body2">Impression: {image.impression}</Typography>
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        )}
        
        {clinicalData.procedures && clinicalData.procedures.length > 0 && (
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">Procedures</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List dense>
                {clinicalData.procedures.map((procedure, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={`${procedure.name}`}
                      secondary={
                        <>
                          <Typography variant="body2">Date: {new Date(procedure.date).toLocaleDateString()} | Provider: {procedure.provider}</Typography>
                          {procedure.notes && <Typography variant="body2">Notes: {procedure.notes}</Typography>}
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        )}
        
        {clinicalData.notes && clinicalData.notes.length > 0 && (
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">Clinical Notes</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {clinicalData.notes.map((note, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Typography variant="subtitle2">
                    {note.type} - {new Date(note.date).toLocaleDateString()} - Provider: {note.provider}
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {note.content}
                  </Typography>
                </Box>
              ))}
            </AccordionDetails>
          </Accordion>
        )}
      </Box>
    );
  };
  
  const renderClinicalSummary = () => {
    const clinicalSummary = appealData?.clinicalSummary;
    
    if (!clinicalSummary || Object.keys(clinicalSummary).length === 0) {
      return (
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography color="textSecondary" sx={{ mb: 2 }}>
              No clinical summary available
            </Typography>
            <Button
              variant="contained"
              startIcon={<AssignmentIcon />}
              onClick={handleGenerateClinicalSummary}
              disabled={clinicalSummaryLoading}
            >
              {clinicalSummaryLoading ? (
                <>
                  <CircularProgress size={24} sx={{ mr: 1 }} />
                  Generating...
                </>
              ) : (
                'Generate Clinical Summary'
              )}
            </Button>
          </CardContent>
        </Card>
      );
    }
    
    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Clinical Summary</Typography>
          <Button
            variant="contained"
            startIcon={<AssignmentIcon />}
            onClick={handleGenerateClinicalSummary}
            disabled={clinicalSummaryLoading}
          >
            {clinicalSummaryLoading ? 'Generating...' : 'Regenerate'}
          </Button>
        </Box>
        
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Clinical Summary for Appeal
            </Typography>
            
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Patient Age:</Typography>
                <Typography variant="body1">{clinicalSummary.patientInfo?.age || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Gender:</Typography>
                <Typography variant="body1">{clinicalSummary.patientInfo?.gender || 'N/A'}</Typography>
              </Grid>
            </Grid>
            
            {clinicalSummary.primaryDiagnosis && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2">Primary Diagnosis:</Typography>
                <Typography variant="body1">
                  {clinicalSummary.primaryDiagnosis.description} ({clinicalSummary.primaryDiagnosis.code})
                </Typography>
              </Box>
            )}
            
            {clinicalSummary.comorbidities && clinicalSummary.comorbidities.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2">Comorbidities:</Typography>
                <List dense>
                  {clinicalSummary.comorbidities.map((diagnosis, index) => (
                    <ListItem key={index}>
                      <ListItemText primary={`${diagnosis.description} (${diagnosis.code})`} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
            
            {clinicalSummary.relevantMedications && clinicalSummary.relevantMedications.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2">Relevant Medications:</Typography>
                <List dense>
                  {clinicalSummary.relevantMedications.map((med, index) => (
                    <ListItem key={index}>
                      <ListItemText primary={`${med.name} ${med.dosage}`} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
            
            {clinicalSummary.relevantLabs && clinicalSummary.relevantLabs.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2">Relevant Lab Results:</Typography>
                <List dense>
                  {clinicalSummary.relevantLabs.map((lab, index) => (
                    <ListItem key={index}>
                      <ListItemText 
                        primary={`${lab.name}: ${lab.value}`}
                        secondary={lab.flag ? `Flag: ${lab.flag}` : ''}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
            
            {clinicalSummary.functionalStatus && Object.values(clinicalSummary.functionalStatus).some(v => v) && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2">Functional Status:</Typography>
                <Typography variant="body2">
                  {clinicalSummary.functionalStatus.mobility && (
                    <span>Mobility: {clinicalSummary.functionalStatus.mobility}<br/></span>
                  )}
                  {clinicalSummary.functionalStatus.adls && (
                    <span>ADLs: {clinicalSummary.functionalStatus.adls}<br/></span>
                  )}
                  {clinicalSummary.functionalStatus.cognition && (
                    <span>Cognition: {clinicalSummary.functionalStatus.cognition}<br/></span>
                  )}
                  {clinicalSummary.functionalStatus.strength && (
                    <span>Strength: {clinicalSummary.functionalStatus.strength}<br/></span>
                  )}
                  {clinicalSummary.functionalStatus.source && (
                    <span>Source: {clinicalSummary.functionalStatus.source}</span>
                  )}
                </Typography>
              </Box>
            )}
            
            {clinicalSummary.clinicalJustification && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2">Clinical Justification:</Typography>
                <Typography variant="body1">
                  {clinicalSummary.clinicalJustification}
                </Typography>
              </Box>
            )}
            
            <Box sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                // In a real app, this would call an API to generate a PDF
                onClick={() => alert('PDF generation would be implemented here')}
              >
                Export as PDF
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Tab navigation */}
      <Tabs 
        value={activeTab} 
        onChange={handleTabChange} 
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="Collaboration Requests" />
        <Tab label="Provider Documents" />
        <Tab label="Clinical Data" />
        <Tab label="Clinical Summary" />
      </Tabs>
      
      {/* Tab panels */}
      <Box sx={{ mt: 2 }}>
        {activeTab === 0 && renderCollaborationRequests()}
        {activeTab === 1 && renderProviderDocuments()}
        {activeTab === 2 && renderClinicalData()}
        {activeTab === 3 && renderClinicalSummary()}
      </Box>
      
      {/* New request dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Request Provider Documentation</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Message to Provider"
                multiline
                rows={4}
                fullWidth
                margin="normal"
                value={newRequest.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                placeholder="Please explain what documentation you need from the provider"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Request Type</InputLabel>
                <Select
                  value={newRequest.requestType}
                  onChange={(e) => handleInputChange('requestType', e.target.value)}
                  label="Request Type"
                >
                  <MenuItem value="documentation">Documentation</MenuItem>
                  <MenuItem value="clarification">Clarification</MenuItem>
                  <MenuItem value="additional_information">Additional Information</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Response Deadline"
                type="date"
                fullWidth
                margin="normal"
                value={newRequest.responseDeadline}
                onChange={(e) => handleInputChange('responseDeadline', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Provider Email"
                fullWidth
                margin="normal"
                value={newRequest.providerEmail}
                onChange={(e) => handleInputChange('providerEmail', e.target.value)}
                placeholder="provider@hospital.org"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Provider Phone"
                fullWidth
                margin="normal"
                value={newRequest.providerPhone}
                onChange={(e) => handleInputChange('providerPhone', e.target.value)}
                placeholder="(555) 123-4567"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                Requested Items
              </Typography>
              
              {newRequest.requestedItems.map((item, index) => (
                <Box key={index} sx={{ display: 'flex', mb: 1 }}>
                  <TextField
                    label={`Item ${index + 1}`}
                    fullWidth
                    value={item}
                    onChange={(e) => handleRequestedItemChange(index, e.target.value)}
                    placeholder="Specific documentation item"
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  {index > 0 && (
                    <Button 
                      color="error" 
                      onClick={() => handleRemoveRequestedItem(index)}
                      variant="outlined"
                    >
                      Remove
                    </Button>
                  )}
                </Box>
              ))}
              
              <Button
                startIcon={<AddIcon />}
                onClick={handleAddRequestedItem}
                sx={{ mt: 1 }}
              >
                Add Item
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleCreateRequest} 
            variant="contained"
            color="primary"
          >
            Create Request
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProviderCollaboration;