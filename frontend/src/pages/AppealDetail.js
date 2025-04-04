import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Typography,
  Box,
  Paper,
  Button,
  Breadcrumbs,
  Link,
  Grid,
  Chip,
  Divider,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Card,
  CardContent,
  CardActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  LinearProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
} from '@mui/material';
import {
  NavigateNext as NavigateNextIcon,
  Edit as EditIcon,
  DeleteOutline as DeleteIcon,
  Print as PrintIcon,
  Send as SendIcon,
  Assignment as AssignmentIcon,
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
  Article as ArticleIcon,
  MailOutline as MailOutlineIcon,
  History as HistoryIcon,
  VisibilityOutlined as ViewIcon,
  Download as DownloadIcon,
  ContentCopy as CopyIcon,
  DateRange as TrackingIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';

// Import components
import FollowUpTracker from '../components/appeals/FollowUpTracker';
import PeerReview from '../components/appeals/PeerReview';

// Simulated data - would be fetched from API in real implementation
const getAppeal = (id) => ({
  id,
  title: 'Appeal for Surgery Claim Denial',
  status: 'Pending',
  createdDate: '2023-05-15T10:30:00Z',
  submittedDate: null,
  claimNumber: 'BCBS123456789',
  provider: 'Blue Cross Blue Shield',
  denialReason: 'Not Medically Necessary',
  progress: 60,
  document: {
    id: '1',
    name: 'EOB - Blue Cross Blue Shield',
    type: 'Explanation of Benefits',
  },
  patient: {
    name: 'John Doe',
    dob: '1980-06-15',
    insuranceId: 'BCBS12345678',
    insuranceProvider: 'Blue Cross Blue Shield',
  },
  appealLetter: {
    greeting: 'To Whom It May Concern:',
    introduction: 'I am writing to appeal the denial of coverage for the MRI of my lower back that was performed on April 20, 2023. The claim number is BCBS123456789.',
    body: 'This procedure was recommended by my primary care physician, Dr. Jane Smith, due to persistent lower back pain that has not responded to conservative treatment over the past three months. Prior to the MRI, I completed six weeks of physical therapy and tried multiple pain medications without significant improvement.\n\nAccording to my plan documents, diagnostic tests that are ordered by a physician to determine the cause of symptoms are covered services. The MRI was medically necessary to diagnose the cause of my persistent pain and to guide appropriate treatment decisions.\n\nEnclosed with this appeal, I have included:\n1. A letter from Dr. Smith explaining the medical necessity of this procedure\n2. My physical therapy records showing lack of improvement with conservative treatment\n3. The relevant section of my insurance policy document showing coverage for diagnostic tests',
    conclusion: 'Based on this information, I request that you reconsider your decision and provide coverage for this medically necessary procedure. If you require any additional information, please contact me at the number listed below.\n\nThank you for your prompt attention to this matter.',
    signature: 'Sincerely,\nJohn Doe',
  },
  steps: [
    {
      label: 'Create Appeal',
      description: 'Gather necessary documents and information to start the appeal process.',
      completed: true,
      date: '2023-05-15T10:30:00Z',
    },
    {
      label: 'Review & Edit Letter',
      description: 'Review and customize the appeal letter with specific details about your case.',
      completed: true,
      date: '2023-05-15T11:15:00Z',
    },
    {
      label: 'Submit Appeal',
      description: 'Submit your appeal to the insurance company through mail, fax, or online portal.',
      completed: false,
      date: null,
    },
    {
      label: 'Track Status',
      description: 'Monitor the status of your appeal and follow up if necessary.',
      completed: false,
      date: null,
    },
    {
      label: 'Receive Decision',
      description: 'Receive and review the insurance company\'s decision on your appeal.',
      completed: false,
      date: null,
    },
  ],
  history: [
    {
      action: 'Appeal created',
      date: '2023-05-15T10:30:00Z',
      user: 'You',
    },
    {
      action: 'Letter generated',
      date: '2023-05-15T10:32:00Z',
      user: 'System',
    },
    {
      action: 'Letter edited',
      date: '2023-05-15T11:15:00Z',
      user: 'You',
    },
    {
      action: 'Supporting documents attached',
      date: '2023-05-15T11:20:00Z',
      user: 'You',
    },
  ],
});

const formatDate = (dateString) => {
  if (!dateString) return '—';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const AppealDetail = () => {
  const { id } = useParams();
  const [appeal, setAppeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(0);
  const [showLetterDialog, setShowLetterDialog] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // Simulate API call
  useEffect(() => {
    const fetchAppeal = async () => {
      try {
        // Simulate API delay
        await new Promise(r => setTimeout(r, 800));
        const data = getAppeal(id);
        setAppeal(data);
        
        // Set active step based on appeal progress
        const completedSteps = data.steps.filter(step => step.completed).length;
        setActiveStep(completedSteps > 0 ? completedSteps - 1 : 0);
      } catch (error) {
        console.error('Error fetching appeal:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppeal();
  }, [id]);

  const handleViewLetter = () => {
    setShowLetterDialog(true);
  };

  const handleCloseLetterDialog = () => {
    setShowLetterDialog(false);
  };

  const handleOpenConfirmDialog = () => {
    setConfirmDialogOpen(true);
  };

  const handleCloseConfirmDialog = () => {
    setConfirmDialogOpen(false);
  };
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!appeal) {
    return (
      <Box textAlign="center" py={5}>
        <Typography variant="h6">Appeal not found</Typography>
        <Button component={RouterLink} to="/appeals" sx={{ mt: 2 }}>
          Back to Appeals
        </Button>
      </Box>
    );
  }

  const getStatusColor = (status) => {
    const statusColors = {
      Draft: 'default',
      Pending: 'warning',
      Submitted: 'info',
      Approved: 'success',
      Denied: 'error',
    };
    return statusColors[status] || 'default';
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
        <Typography color="text.primary">{appeal.title}</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          {appeal.title}
        </Typography>
        <Box>
          {appeal.status === 'Draft' && (
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              component={RouterLink}
              to={`/appeals/${appeal.id}/edit`}
              sx={{ mr: 1 }}
            >
              Edit
            </Button>
          )}
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            sx={{ mr: 1 }}
            onClick={handleViewLetter}
          >
            View Letter
          </Button>
          {(appeal.status === 'Draft' || appeal.status === 'Pending') && (
            <Button
              variant="contained"
              startIcon={<SendIcon />}
              onClick={handleOpenConfirmDialog}
            >
              Submit Appeal
            </Button>
          )}
        </Box>
      </Box>

      {/* Content */}
      <Grid container spacing={3}>
        {/* Appeal details */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Appeal Details
              </Typography>
              <Chip
                label={appeal.status}
                color={getStatusColor(appeal.status)}
                size="small"
              />
            </Box>
            
            <LinearProgress 
              variant="determinate" 
              value={appeal.progress} 
              sx={{ mb: 2, height: 8, borderRadius: 4 }}
              color={appeal.status === 'Denied' ? 'error' : 'primary'}
            />
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2, textAlign: 'right' }}>
              Progress: {appeal.progress}%
            </Typography>
            
            <TableContainer>
              <Table size="small">
                <TableBody>
                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 'medium' }}>
                      Created
                    </TableCell>
                    <TableCell>{formatDate(appeal.createdDate)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 'medium' }}>
                      Submitted
                    </TableCell>
                    <TableCell>{formatDate(appeal.submittedDate)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 'medium' }}>
                      Insurance Provider
                    </TableCell>
                    <TableCell>{appeal.provider}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 'medium' }}>
                      Claim Number
                    </TableCell>
                    <TableCell>{appeal.claimNumber}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 'medium' }}>
                      Denial Reason
                    </TableCell>
                    <TableCell>{appeal.denialReason}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
            
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" gutterBottom>
              Related Document
            </Typography>
            <Box mb={1}>
              <Button
                component={RouterLink}
                to={`/documents/${appeal.document.id}`}
                startIcon={<DescriptionIcon />}
                sx={{ textAlign: 'left', justifyContent: 'flex-start' }}
              >
                {appeal.document.name}
              </Button>
              <Typography variant="caption" display="block" color="text.secondary">
                Type: {appeal.document.type}
              </Typography>
            </Box>
            
            {appeal.status === 'Draft' && (
              <Box mt={3} sx={{ display: 'flex', justifyContent: 'center' }}>
                <Button
                  color="error"
                  startIcon={<DeleteIcon />}
                  size="small"
                >
                  Delete Appeal
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* Appeal progress, follow-up and history */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange} 
              sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
            >
              <Tab 
                label="Appeal Progress" 
                icon={<CheckCircleIcon />} 
                iconPosition="start"
              />
              <Tab 
                label="Follow-up Tracker" 
                icon={<TrackingIcon />} 
                iconPosition="start"
              />
              <Tab 
                label="Peer-to-Peer" 
                icon={<PhoneIcon />} 
                iconPosition="start"
              />
              <Tab 
                label="History" 
                icon={<HistoryIcon />} 
                iconPosition="start"
              />
            </Tabs>
            
            {/* Appeal Progress Tab */}
            {activeTab === 0 && (
              <>
                <Typography variant="h6" gutterBottom>
                  Appeal Progress
                </Typography>
                
                <Stepper activeStep={activeStep} orientation="vertical" sx={{ mt: 2 }}>
              {appeal.steps.map((step, index) => (
                <Step key={step.label} completed={step.completed}>
                  <StepLabel>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                      <Typography variant="subtitle1">{step.label}</Typography>
                      {step.completed && (
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(step.date)}
                        </Typography>
                      )}
                    </Box>
                  </StepLabel>
                  <StepContent>
                    <Typography variant="body2" color="text.secondary">
                      {step.description}
                    </Typography>
                    
                    {index === 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<ViewIcon />}
                          component={RouterLink}
                          to={`/documents/${appeal.document.id}`}
                        >
                          View Document
                        </Button>
                      </Box>
                    )}
                    
                    {index === 1 && (
                      <Box sx={{ mt: 2 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<ArticleIcon />}
                          onClick={handleViewLetter}
                        >
                          View Appeal Letter
                        </Button>
                      </Box>
                    )}
                    
                    {index === 2 && appeal.status === 'Draft' && (
                      <Box sx={{ mt: 2 }}>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<SendIcon />}
                          color="primary"
                          onClick={handleOpenConfirmDialog}
                        >
                          Submit Appeal
                        </Button>
                      </Box>
                    )}
                  </StepContent>
                </Step>
              ))}
            </Stepper>
              </>
            )}
            
            {/* Follow-up Tracker Tab */}
            {activeTab === 1 && (
              <>
                {appeal.status === 'Draft' ? (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="h6" gutterBottom color="text.secondary">
                      Follow-up tracking is available after submission
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Once you submit your appeal, you'll be able to track follow-up activities and deadlines here.
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<SendIcon />}
                      onClick={handleOpenConfirmDialog}
                      sx={{ mt: 2 }}
                    >
                      Submit Appeal
                    </Button>
                  </Box>
                ) : (
                  <FollowUpTracker 
                    appealId={appeal.id}
                    deadline={appeal.submittedDate ? new Date(new Date(appeal.submittedDate).getTime() + 45 * 86400000) : null}
                    insuranceCarrier={appeal.provider}
                  />
                )}
              </>
            )}
            
            {/* Peer-to-Peer Tab */}
            {activeTab === 2 && (
              <PeerReview 
                appealId={appeal.id}
                appeal={appeal}
              />
            )}
            
            {/* History Tab */}
            {activeTab === 3 && (
              <>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <HistoryIcon sx={{ mr: 1 }} />
                  Appeal History
                </Typography>
                
                {appeal.history && appeal.history.length > 0 ? (
                  <Box sx={{ ml: 2 }}>
                    {appeal.history.map((event, index) => (
                      <Box 
                        key={index} 
                        sx={{
                          display: 'flex',
                          mb: 2,
                          position: 'relative',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            left: '-12px',
                            top: '10px',
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            bgcolor: 'primary.main',
                            zIndex: 1,
                          },
                          '&::after': {
                            content: index === appeal.history.length - 1 ? 'none' : '""',
                            position: 'absolute',
                            left: '-7px',
                            top: '18px',
                            bottom: '-18px',
                            width: '2px',
                            bgcolor: 'grey.300',
                          }
                        }}
                      >
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {event.action}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(event.date).toLocaleString()} • {event.user}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No history available for this appeal.
                  </Typography>
                )}
              </>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Appeal Letter Dialog */}
      <Dialog
        open={showLetterDialog}
        onClose={handleCloseLetterDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Appeal Letter
          <Box>
            <Tooltip title="Copy to clipboard">
              <IconButton size="small" sx={{ mr: 1 }}>
                <CopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Download as PDF">
              <IconButton size="small" sx={{ mr: 1 }}>
                <DownloadIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Print">
              <IconButton size="small">
                <PrintIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              fontFamily: '"Times New Roman", Times, serif',
              fontSize: '1rem',
              lineHeight: 1.6,
            }}
          >
            <Box sx={{ mb: 4 }}>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                {appeal.patient.name}
              </Typography>
              <Typography variant="body1">
                Member ID: {appeal.patient.insuranceId}
              </Typography>
              <Typography variant="body1">
                Date of Birth: {formatDate(appeal.patient.dob)}
              </Typography>
              <Typography variant="body1">
                Date: {formatDate(appeal.createdDate)}
              </Typography>
            </Box>

            <Typography variant="body1" paragraph>
              {appeal.appealLetter.greeting}
            </Typography>

            <Typography variant="body1" paragraph>
              {appeal.appealLetter.introduction}
            </Typography>

            <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-line' }}>
              {appeal.appealLetter.body}
            </Typography>

            <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-line' }}>
              {appeal.appealLetter.conclusion}
            </Typography>

            <Typography variant="body1" sx={{ whiteSpace: 'pre-line', mt: 4 }}>
              {appeal.appealLetter.signature}
            </Typography>
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseLetterDialog}>Close</Button>
          {appeal.status === 'Draft' && (
            <Button 
              component={RouterLink} 
              to={`/appeals/${appeal.id}/edit`}
              variant="contained"
            >
              Edit Letter
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Submit Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={handleCloseConfirmDialog}
      >
        <DialogTitle>Submit Appeal</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You're about to submit your appeal to {appeal.provider}. This cannot be undone.
            How would you like to submit your appeal?
          </DialogContentText>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography color="primary" variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <MailOutlineIcon sx={{ mr: 1 }} />
                    Mail
                  </Typography>
                  <Typography variant="body2">
                    Print and mail your appeal to the insurance company's appeal department.
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" startIcon={<PrintIcon />}>
                    Print Letter
                  </Button>
                </CardActions>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography color="primary" variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <SendIcon sx={{ mr: 1 }} />
                    Email
                  </Typography>
                  <Typography variant="body2">
                    Email your appeal directly to the insurance company's appeals department.
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" startIcon={<SendIcon />}>
                    Send Email
                  </Button>
                </CardActions>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography color="primary" variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <AssignmentIcon sx={{ mr: 1 }} />
                    Portal
                  </Typography>
                  <Typography variant="body2">
                    Upload your appeal through the insurance company's online member portal.
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" startIcon={<DownloadIcon />}>
                    Download PDF
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleCloseConfirmDialog} 
            startIcon={<CheckCircleIcon />}
          >
            Mark as Submitted
          </Button>
          <Button 
            variant="outlined" 
            color="secondary"
            onClick={() => {
              handleCloseConfirmDialog();
              window.location.href = "/appeals/tracking";
            }}
          >
            Setup Follow-ups
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AppealDetail;