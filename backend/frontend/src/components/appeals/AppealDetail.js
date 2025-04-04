/**
 * Appeal Detail Component
 * 
 * Main component for viewing and editing an appeal
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box, Tab, Tabs, Typography, Paper, CircularProgress, Alert,
  Button, Grid, Divider, Chip, Card, CardContent,
  List, ListItem, ListItemText
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Description as DescriptionIcon,
  MedicalServices as MedicalIcon,
  LocalHospital as HospitalIcon,
  Edit as EditIcon,
  History as HistoryIcon,
  Send as SendIcon
} from '@mui/icons-material';

// Import appeal tab components
import ProviderCollaboration from './ProviderCollaboration';
import AppealProgressStepper from '../common/AppealProgressStepper';
import AppealTimeline from '../common/AppealTimeline';
import TermDefinition from '../common/TermDefinition';

// Tab Panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`appeal-tabpanel-${index}`}
      aria-labelledby={`appeal-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const AppealDetail = () => {
  const { appealId } = useParams();
  const navigate = useNavigate();
  const [appeal, setAppeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  // Fetch appeal data
  useEffect(() => {
    const fetchAppeal = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/appeals/${appealId}`);

        if (response.data.success) {
          setAppeal(response.data.appeal);
        } else {
          setError(response.data.message || 'Failed to load appeal data');
        }
      } catch (error) {
        console.error('Error fetching appeal:', error);
        setError('Error loading appeal data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (appealId) {
      fetchAppeal();
    }
  }, [appealId]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Render a loading spinner while data is being fetched
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Render an error message if the appeal data could not be loaded
  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  // Render a message if the appeal was not found
  if (!appeal) {
    return (
      <Alert severity="warning" sx={{ m: 2 }}>
        Appeal not found. It may have been deleted or you don't have permission to view it.
      </Alert>
    );
  }

  // Handle submission of appeal
  const handleSubmitAppeal = async () => {
    if (window.confirm('Are you sure you want to submit this appeal? Once submitted, you cannot change it.')) {
      try {
        const response = await axios.post(`/api/appeals/${appealId}/submit`, {
          status: 'submitted',
          submissionDate: new Date()
        });
        
        if (response.data.success) {
          // Update the appeal state with the new status
          setAppeal({
            ...appeal,
            status: 'submitted',
            submissionDate: new Date()
          });
          
          alert('Appeal has been successfully submitted!');
        } else {
          alert('Failed to submit appeal. Please try again.');
        }
      } catch (error) {
        console.error('Error submitting appeal:', error);
        alert('Error submitting appeal. Please check your connection and try again.');
      }
    }
  };

  // Render the appeal detail view
  return (
    <Box sx={{ width: '100%' }}>
      {/* Appeal header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h4" gutterBottom>
              Appeal for {appeal.serviceName}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {appeal.claimId ? `Claim ID: ${appeal.claimId}` : 'New Appeal'}
            </Typography>
            
            {/* Compact appeal progress indicator */}
            <AppealProgressStepper 
              appeal={appeal}
              compact={true}
            />
          </Grid>

          <Grid item xs={12} md={6} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
            <Box sx={{ mb: 2 }}>
              {appeal.status === 'draft' && (
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  sx={{ mr: 1 }}
                  onClick={() => alert('Edit feature will be available in the next release.')}
                >
                  Edit Appeal
                </Button>
              )}
              
              {appeal.status === 'pending' && (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<SendIcon />}
                  sx={{ mr: 1 }}
                  onClick={handleSubmitAppeal}
                >
                  Submit to Insurance
                </Button>
              )}
              
              <Button
                variant="contained"
                color={appeal.status === 'pending' ? 'secondary' : 'primary'}
                onClick={() => alert('Appeal letter view will be available in the next release.')}
              >
                View Appeal Letter
              </Button>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle2">Insurance Company:</Typography>
            <Typography variant="body1">{appeal.insuranceCompany}</Typography>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle2">Service Date:</Typography>
            <Typography variant="body1">
              {new Date(appeal.serviceDate).toLocaleDateString()}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle2">Requested Amount:</Typography>
            <Typography variant="body1">
              ${appeal.requestedAmount ? appeal.requestedAmount.toFixed(2) : '0.00'}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle2">Last Updated:</Typography>
            <Typography variant="body1">
              {new Date(appeal.updatedAt).toLocaleDateString()}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Full Appeal Progress Stepper */}
      <AppealProgressStepper 
        appeal={appeal}
        onEditClick={() => alert('Edit feature will be available in the next release.')}
        onSubmitClick={handleSubmitAppeal}
      />

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="appeal tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<AssignmentIcon />} label="Summary" />
          <Tab icon={<DescriptionIcon />} label="Documents" />
          <Tab icon={<HospitalIcon />} label="Provider Collaboration" />
          <Tab icon={<MedicalIcon />} label="Clinical Data" />
          <Tab icon={<HistoryIcon />} label="History" />
        </Tabs>
      </Box>

      {/* Tab panels */}
      <TabPanel value={tabValue} index={0}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Appeal Summary
            </Typography>
            
            {/* Add contextual help for key terms */}
            <Box sx={{ mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Key Insurance Terms:
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <TermDefinition term="Appeal" showDialog>
                    What is an appeal?
                  </TermDefinition>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TermDefinition term="Medical Necessity" showDialog>
                    Medical necessity
                  </TermDefinition>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  {appeal.insuranceCompany === 'UnitedHealthcare' && (
                    <TermDefinition term="nH Predict" showDialog>
                      nH Predict algorithm
                    </TermDefinition>
                  )}
                </Grid>
              </Grid>
            </Box>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle2">Reason for Appeal:</Typography>
                <Typography variant="body1" paragraph>
                  {appeal.reason}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Service Description:</Typography>
                <Typography variant="body1">
                  {appeal.serviceDescription || 'No description provided'}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Service Provider:</Typography>
                <Typography variant="body1">
                  {appeal.serviceProvider || 'Not specified'}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Service Location:</Typography>
                <Typography variant="body1">
                  {appeal.serviceLocation || 'Not specified'}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">
                  <TermDefinition term="Insurance Plan">
                    Insurance Plan
                  </TermDefinition>:
                </Typography>
                <Typography variant="body1">
                  {appeal.insurancePlan || 'Not specified'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">
                  Status:
                </Typography>
                <Typography variant="body1">
                  {appeal.status === 'denied' ? (
                    <Box component="span">
                      Denied - <TermDefinition term="denial">What is a denial?</TermDefinition>
                    </Box>
                  ) : appeal.status}
                </Typography>
              </Grid>

              {appeal.responseDetails && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Response Details:</Typography>
                  <Typography variant="body1">
                    {appeal.responseDetails.decisionText || 'No response details available'}
                  </Typography>
                </Grid>
              )}
              
              {/* Financial Summary */}
              {(appeal.requestedAmount || appeal.approvedAmount || appeal.deniedAmount) && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                    Financial Summary:
                  </Typography>
                  <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body2" color="text.secondary">
                          Requested Amount:
                        </Typography>
                        <Typography variant="body1">
                          ${appeal.requestedAmount ? appeal.requestedAmount.toFixed(2) : '0.00'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body2" color="text.secondary">
                          Approved Amount:
                        </Typography>
                        <Typography variant="body1" color={appeal.approvedAmount > 0 ? 'success.main' : 'text.primary'}>
                          ${appeal.approvedAmount ? appeal.approvedAmount.toFixed(2) : '0.00'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body2" color="text.secondary">
                          <TermDefinition term="Denied Amount">
                            Denied Amount
                          </TermDefinition>:
                        </Typography>
                        <Typography variant="body1" color={appeal.deniedAmount > 0 ? 'error.main' : 'text.primary'}>
                          ${appeal.deniedAmount ? appeal.deniedAmount.toFixed(2) : '0.00'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Typography variant="h6" gutterBottom>
          Documents
        </Typography>

        {appeal.documents && appeal.documents.length > 0 ? (
          <List>
            {appeal.documents.map((doc, index) => (
              <ListItem
                key={index}
                divider={index < appeal.documents.length - 1}
                button
                onClick={() => alert('Document viewing will be available in the next release.')}
              >
                <ListItemText
                  primary={doc.name}
                  secondary={`Type: ${doc.documentType.replace('_', ' ')} | Uploaded: ${new Date(
                    doc.uploadDate
                  ).toLocaleDateString()} ${doc.providerSubmitted ? '| Submitted by Provider' : ''}`}
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Alert severity="info">No documents have been added to this appeal.</Alert>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <ProviderCollaboration appealId={appealId} appealData={appeal} />
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <Typography variant="h6" gutterBottom>
          Clinical Data
        </Typography>
        {appeal.clinicalData && Object.keys(appeal.clinicalData).some(key => 
          Array.isArray(appeal.clinicalData[key]) && appeal.clinicalData[key].length > 0) ? (
          <Alert severity="info">
            Clinical data is available. Please view it in the Provider Collaboration tab.
          </Alert>
        ) : (
          <Alert severity="info">
            No clinical data available for this appeal. Use the Provider Collaboration
            tab to request or import clinical data.
          </Alert>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={4}>
        <Typography variant="h6" gutterBottom>
          Appeal History
        </Typography>
        
        {/* Enhanced visual timeline */}
        <AppealTimeline appeal={appeal} />
        
        {/* Traditional list view as fallback/additional detail */}
        <Card>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom>
              Key Events
            </Typography>
            <List>
              <ListItem divider>
                <ListItemText
                  primary="Appeal Created"
                  secondary={`Date: ${new Date(appeal.createdAt).toLocaleString()}`}
                />
              </ListItem>
              
              {appeal.submissionDate && (
                <ListItem divider>
                  <ListItemText
                    primary="Appeal Submitted"
                    secondary={`Date: ${new Date(appeal.submissionDate).toLocaleString()}`}
                  />
                </ListItem>
              )}
              
              {appeal.responseDate && (
                <ListItem divider>
                  <ListItemText
                    primary="Response Received"
                    secondary={`Date: ${new Date(appeal.responseDate).toLocaleString()} | Decision: ${appeal.decision || 'Not specified'}`}
                  />
                </ListItem>
              )}
              
              {appeal.lastActivity && (
                <ListItem>
                  <ListItemText
                    primary={`Last Activity: ${appeal.lastActivity.action?.replace(/_/g, ' ')}`}
                    secondary={`Date: ${new Date(appeal.lastActivity.date).toLocaleString()} | Details: ${appeal.lastActivity.details || 'No details provided'}`}
                  />
                </ListItem>
              )}
            </List>
          </CardContent>
        </Card>
      </TabPanel>
    </Box>
  );
};

export default AppealDetail;