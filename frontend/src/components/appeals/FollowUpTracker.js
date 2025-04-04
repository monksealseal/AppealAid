import React, { useState, useEffect } from 'react';
import {
  Typography,
  Paper,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  Tooltip
} from '@mui/material';
import {
  HighlightOff as CancelIcon,
  CheckCircle as CompleteIcon,
  Notes as NotesIcon,
  Refresh as RefreshIcon,
  Send as SendIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocalPostOffice as MailIcon,
  Laptop as ElectronicIcon,
  Fax as FaxIcon,
  Info as InfoIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Mock API service - would be replaced with actual API calls
const fetchFollowUpPlan = async (appealId) => {
  // Simulate API delay
  await new Promise(r => setTimeout(r, 500));
  
  // Simulate follow-up data
  const submissionDate = new Date();
  submissionDate.setDate(submissionDate.getDate() - 15); // Submitted 15 days ago
  
  return [
    {
      id: 'fu1',
      type: 'initial_inquiry',
      scheduled: new Date(submissionDate.getTime() + 14 * 86400000), // 14 days after submission
      daysAfterSubmission: 14,
      contactMethod: 'electronic',
      contactDetails: 'https://provider.bcbs.com',
      isComplete: true,
      completedDate: new Date(),
      notes: 'Submitted inquiry through provider portal, reference #12345',
      appealId
    },
    {
      id: 'fu2',
      type: 'status_check',
      scheduled: new Date(submissionDate.getTime() + 30 * 86400000), // 30 days after submission
      daysAfterSubmission: 30,
      contactMethod: 'phone',
      contactDetails: '1-800-123-4567',
      isComplete: false,
      notes: '',
      appealId
    },
    {
      id: 'fu3',
      type: 'escalation',
      scheduled: new Date(submissionDate.getTime() + 45 * 86400000), // 45 days after submission
      daysAfterSubmission: 45,
      contactMethod: 'fax',
      contactDetails: '1-800-987-6543',
      isComplete: false,
      notes: '',
      appealId
    },
    {
      id: 'fu4',
      type: 'final_notice',
      scheduled: new Date(submissionDate.getTime() + 60 * 86400000), // 60 days after submission
      daysAfterSubmission: 60,
      contactMethod: 'mail',
      contactDetails: 'Appeals Department, PO Box 12345, Anytown, USA',
      isComplete: false,
      notes: '',
      appealId
    }
  ];
};

// Mock API service to update follow-up
const updateFollowUp = async (followUp) => {
  // Simulate API delay
  await new Promise(r => setTimeout(r, 500));
  return { ...followUp, completedDate: new Date() };
};

// Styled components for the timeline
const TimelineContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  padding: theme.spacing(2, 0),
  '&::before': {
    content: '""',
    position: 'absolute',
    left: '16px',
    top: 0,
    bottom: 0,
    width: '2px',
    backgroundColor: theme.palette.divider
  }
}));

const TimelineItem = styled(Box)(({ theme }) => ({
  position: 'relative',
  padding: theme.spacing(1, 0, 1, 5),
  '&::before': {
    content: '""',
    position: 'absolute',
    left: '10px',
    top: '22px',
    width: '14px',
    height: '14px',
    borderRadius: '50%',
    backgroundColor: theme.palette.primary.main,
    zIndex: 1
  }
}));

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return '—';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Helper function to get days until scheduled follow-up
const getDaysUntil = (scheduledDate) => {
  const today = new Date();
  const scheduled = new Date(scheduledDate);
  const diffTime = scheduled - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

// Helper function to get status text and color
const getStatusInfo = (followUp) => {
  if (followUp.isComplete) {
    return { text: 'Complete', color: 'success' };
  }
  
  const daysUntil = getDaysUntil(followUp.scheduled);
  
  if (daysUntil < 0) {
    return { text: 'Overdue', color: 'error' };
  } else if (daysUntil === 0) {
    return { text: 'Due today', color: 'warning' };
  } else if (daysUntil <= 3) {
    return { text: `Due in ${daysUntil} days`, color: 'warning' };
  } else {
    return { text: `Due in ${daysUntil} days`, color: 'info' };
  }
};

// Helper function to get contact method icon
const getContactMethodIcon = (method) => {
  switch (method) {
    case 'electronic':
      return <ElectronicIcon />;
    case 'phone':
      return <PhoneIcon />;
    case 'email':
      return <EmailIcon />;
    case 'fax':
      return <FaxIcon />;
    case 'mail':
      return <MailIcon />;
    default:
      return <SendIcon />;
  }
};

// Helper function to get follow-up type display name
const getFollowUpTypeDisplay = (type) => {
  switch (type) {
    case 'initial_inquiry':
      return 'Initial Inquiry';
    case 'status_check':
      return 'Status Check';
    case 'escalation':
      return 'Escalation';
    case 'final_notice':
      return 'Final Notice';
    default:
      return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
};

const FollowUpTracker = ({ appealId, deadline, insuranceCarrier, onUpdateComplete }) => {
  const [followUps, setFollowUps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFollowUp, setSelectedFollowUp] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [outcome, setOutcome] = useState('completed');
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Fetch follow-up plan
  useEffect(() => {
    const getFollowUpPlan = async () => {
      try {
        setLoading(true);
        const data = await fetchFollowUpPlan(appealId);
        // Sort by scheduled date
        const sortedData = data.sort((a, b) => new Date(a.scheduled) - new Date(b.scheduled));
        setFollowUps(sortedData);
      } catch (err) {
        setError('Could not load follow-up plan. Please try again.');
        console.error('Error fetching follow-up plan:', err);
      } finally {
        setLoading(false);
      }
    };

    getFollowUpPlan();
  }, [appealId]);

  // Handle dialog open
  const handleOpenDialog = (followUp) => {
    setSelectedFollowUp(followUp);
    setNotes(followUp.notes || '');
    setOutcome(followUp.isComplete ? 'completed' : 'completed');
    setDialogOpen(true);
  };

  // Handle dialog close
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedFollowUp(null);
    setNotes('');
    setOutcome('completed');
  };

  // Handle follow-up update
  const handleUpdateFollowUp = async () => {
    if (!selectedFollowUp) return;

    try {
      const updatedFollowUp = {
        ...selectedFollowUp,
        isComplete: outcome === 'completed',
        notes: notes,
        completedDate: new Date()
      };

      const result = await updateFollowUp(updatedFollowUp);
      
      // Update follow-ups state
      setFollowUps(prevFollowUps => 
        prevFollowUps.map(f => 
          f.id === result.id ? result : f
        )
      );
      
      setSuccessMessage('Follow-up updated successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
      
      // Notify parent component
      if (onUpdateComplete) {
        onUpdateComplete(result);
      }
      
      handleCloseDialog();
    } catch (err) {
      setError('Could not update follow-up. Please try again.');
      console.error('Error updating follow-up:', err);
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    try {
      setLoading(true);
      const data = await fetchFollowUpPlan(appealId);
      // Sort by scheduled date
      const sortedData = data.sort((a, b) => new Date(a.scheduled) - new Date(b.scheduled));
      setFollowUps(sortedData);
      setSuccessMessage('Follow-up plan refreshed!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError('Could not refresh follow-up plan. Please try again.');
      console.error('Error refreshing follow-up plan:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  // Calculate progress metrics
  const totalFollowUps = followUps.length;
  const completedFollowUps = followUps.filter(fu => fu.isComplete).length;
  const overdueTasks = followUps.filter(fu => !fu.isComplete && getDaysUntil(fu.scheduled) < 0).length;
  const upcomingTasks = followUps.filter(fu => !fu.isComplete && getDaysUntil(fu.scheduled) >= 0 && getDaysUntil(fu.scheduled) <= 7).length;

  // Get the next follow-up
  const nextFollowUp = followUps.find(fu => !fu.isComplete) || null;

  return (
    <div>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" component="h2">
          Appeal Follow-up Tracker
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          size="small"
        >
          Refresh
        </Button>
      </Box>
      
      {/* Summary metrics */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
        <Paper sx={{ p: 2, flex: '1 1 200px', minWidth: '140px' }}>
          <Typography variant="body2" color="text.secondary">Follow-up Progress</Typography>
          <Typography variant="h5">{completedFollowUps}/{totalFollowUps}</Typography>
          <Typography variant="body2" color="text.secondary">tasks completed</Typography>
        </Paper>
        
        <Paper sx={{ p: 2, flex: '1 1 200px', minWidth: '140px' }}>
          <Typography variant="body2" color="text.secondary">Overdue Tasks</Typography>
          <Typography variant="h5" color={overdueTasks > 0 ? 'error.main' : 'text.primary'}>
            {overdueTasks}
          </Typography>
          <Typography variant="body2" color="text.secondary">require attention</Typography>
        </Paper>
        
        <Paper sx={{ p: 2, flex: '1 1 200px', minWidth: '140px' }}>
          <Typography variant="body2" color="text.secondary">Upcoming</Typography>
          <Typography variant="h5" color={upcomingTasks > 0 ? 'warning.main' : 'text.primary'}>
            {upcomingTasks}
          </Typography>
          <Typography variant="body2" color="text.secondary">in the next 7 days</Typography>
        </Paper>
      </Box>
      
      {/* Next follow-up alert */}
      {nextFollowUp && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'info.light', color: 'info.contrastText' }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
            <InfoIcon color="inherit" />
            <Box>
              <Typography variant="subtitle1" fontWeight="medium">
                Next follow-up: {getFollowUpTypeDisplay(nextFollowUp.type)}
              </Typography>
              <Typography variant="body2">
                Due {getDaysUntil(nextFollowUp.scheduled) === 0 ? 'today' : 
                     getDaysUntil(nextFollowUp.scheduled) < 0 ? `${Math.abs(getDaysUntil(nextFollowUp.scheduled))} days ago` : 
                     `in ${getDaysUntil(nextFollowUp.scheduled)} days`} via {nextFollowUp.contactMethod}
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => handleOpenDialog(nextFollowUp)}
                  sx={{ bgcolor: 'white', color: 'info.main', '&:hover': { bgcolor: 'grey.100' } }}
                >
                  Mark Complete
                </Button>
              </Box>
            </Box>
          </Box>
        </Paper>
      )}
      
      {/* Follow-up table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Action</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Method</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {followUps.map((followUp) => {
              const statusInfo = getStatusInfo(followUp);
              
              return (
                <TableRow key={followUp.id} sx={{ opacity: followUp.isComplete ? 0.7 : 1 }}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {getFollowUpTypeDisplay(followUp.type)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {followUp.daysAfterSubmission} days after submission
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        {formatDate(followUp.scheduled)}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getContactMethodIcon(followUp.contactMethod)}
                      <Typography variant="body2">
                        {followUp.contactMethod.charAt(0).toUpperCase() + followUp.contactMethod.slice(1)}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      {followUp.contactDetails?.length > 25 ? 
                        followUp.contactDetails.substring(0, 25) + '...' : 
                        followUp.contactDetails}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={statusInfo.text}
                      color={statusInfo.color}
                      size="small"
                    />
                    {followUp.isComplete && followUp.completedDate && (
                      <Typography variant="caption" display="block" color="text.secondary">
                        {formatDate(followUp.completedDate)}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {followUp.isComplete ? (
                        <Tooltip title="View notes">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleOpenDialog(followUp)}
                          >
                            <NotesIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Mark complete">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleOpenDialog(followUp)}
                          >
                            <CompleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Timeline view */}
      <Typography variant="h6" component="h3" sx={{ mt: 4, mb: 2 }}>
        Follow-up Timeline
      </Typography>
      
      <TimelineContainer>
        {followUps.map((followUp) => {
          const statusInfo = getStatusInfo(followUp);
          
          return (
            <TimelineItem key={followUp.id}>
              <Paper
                elevation={1}
                sx={{
                  p: 2,
                  borderLeft: followUp.isComplete ? 
                    '4px solid' : 
                    `4px solid ${statusInfo.color === 'error' ? '#f44336' : 
                                statusInfo.color === 'warning' ? '#ed6c02' : 
                                statusInfo.color === 'info' ? '#0288d1' : '#1976d2'}`
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography variant="subtitle1" fontWeight="medium">
                    {getFollowUpTypeDisplay(followUp.type)}
                  </Typography>
                  <Chip
                    label={statusInfo.text}
                    color={statusInfo.color}
                    size="small"
                  />
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Scheduled for {formatDate(followUp.scheduled)} ({followUp.daysAfterSubmission} days after submission)
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  {getContactMethodIcon(followUp.contactMethod)}
                  <Typography variant="body2">
                    {followUp.contactMethod.charAt(0).toUpperCase() + followUp.contactMethod.slice(1)}: {followUp.contactDetails}
                  </Typography>
                </Box>
                
                {followUp.isComplete && followUp.notes && (
                  <>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="body2" sx={{ fontStyle: 'italic', mt: 1 }}>
                      "{followUp.notes}"
                    </Typography>
                    {followUp.completedDate && (
                      <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
                        Completed on {formatDate(followUp.completedDate)}
                      </Typography>
                    )}
                  </>
                )}
                
                {!followUp.isComplete && (
                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleOpenDialog(followUp)}
                    >
                      Mark as Complete
                    </Button>
                  </Box>
                )}
              </Paper>
            </TimelineItem>
          );
        })}
      </TimelineContainer>
      
      {/* Update dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedFollowUp?.isComplete ? 'Follow-up Details' : 'Update Follow-up Status'}
        </DialogTitle>
        <DialogContent>
          {selectedFollowUp && (
            <>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1">
                  {getFollowUpTypeDisplay(selectedFollowUp.type)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Scheduled for {formatDate(selectedFollowUp.scheduled)}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  {getContactMethodIcon(selectedFollowUp.contactMethod)}
                  <Typography variant="body2">
                    {selectedFollowUp.contactMethod.charAt(0).toUpperCase() + selectedFollowUp.contactMethod.slice(1)}: {selectedFollowUp.contactDetails}
                  </Typography>
                </Box>
              </Box>
              
              {!selectedFollowUp.isComplete && (
                <TextField
                  select
                  label="Outcome"
                  value={outcome}
                  onChange={(e) => setOutcome(e.target.value)}
                  fullWidth
                  margin="normal"
                >
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="skipped">Skip (Not Needed)</MenuItem>
                </TextField>
              )}
              
              <TextField
                label="Notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                fullWidth
                margin="normal"
                multiline
                rows={4}
                placeholder="Enter details about the follow-up action, such as who you spoke with, reference numbers, or what was discussed."
                disabled={selectedFollowUp.isComplete}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            {selectedFollowUp?.isComplete ? 'Close' : 'Cancel'}
          </Button>
          {!selectedFollowUp?.isComplete && (
            <Button onClick={handleUpdateFollowUp} variant="contained" color="primary">
              Save
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default FollowUpTracker;