/**
 * Appeal Progress Stepper Component
 * 
 * A visual representation of the appeal process with contextual guidance
 * for users based on the current appeal status.
 */

import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { 
  Stepper, 
  Step, 
  StepLabel, 
  StepContent, 
  Typography, 
  Box, 
  Paper,
  Alert,
  Button,
  Chip,
  Tooltip
} from '@mui/material';
import {
  Edit as EditIcon,
  Send as SendIcon,
  AccessTime as WaitingIcon,
  Loop as ProcessingIcon,
  CheckCircle as ApprovedIcon,
  Cancel as DeniedIcon,
  HourglassEmpty as DeadlineIcon
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';

/**
 * Maps appeal status to step index and customizes step appearance
 */
const AppealProgressStepper = ({ 
  appeal, 
  compact = false, 
  onEditClick = null, 
  onSubmitClick = null 
}) => {
  // Calculate current step and additional status properties
  const {
    currentStep,
    stepStatus,
    statusInfo,
    deadlineInfo
  } = useMemo(() => {
    // Map status to step number and collect status metadata
    const statusMap = {
      'draft': {
        step: 0,
        icon: <EditIcon />,
        label: 'Draft',
        color: 'default',
        description: 'Your appeal is in draft state. Complete all required information before submission.'
      },
      'pending': {
        step: 1,
        icon: <SendIcon />,
        label: 'Ready for Submission',
        color: 'primary',
        description: 'Your appeal is ready to be submitted to the insurance company.'
      },
      'submitted': {
        step: 2,
        icon: <WaitingIcon />,
        label: 'Submitted',
        color: 'primary',
        description: 'Your appeal has been submitted and is awaiting review by the insurance company.'
      },
      'in_progress': {
        step: 3,
        icon: <ProcessingIcon />,
        label: 'Under Review',
        color: 'primary',
        description: 'Your appeal is currently being reviewed by the insurance company.'
      },
      'approved': {
        step: 4,
        icon: <ApprovedIcon />,
        label: 'Approved',
        color: 'success',
        description: 'Your appeal has been approved!'
      },
      'partially_approved': {
        step: 4,
        icon: <ApprovedIcon />,
        label: 'Partially Approved',
        color: 'warning',
        description: 'Your appeal has been partially approved. You may consider further action for the denied portion.'
      },
      'denied': {
        step: 4,
        icon: <DeniedIcon />,
        label: 'Denied',
        color: 'error',
        description: 'Your appeal has been denied. You may have options for further appeal.'
      },
      'cancelled': {
        step: 4,
        icon: <DeniedIcon />,
        label: 'Cancelled',
        color: 'error',
        description: 'This appeal has been cancelled.'
      },
      'pending_review': {
        step: 2,
        icon: <WaitingIcon />,
        label: 'Pending Review',
        color: 'primary',
        description: 'Your appeal is pending initial review.'
      }
    };

    const currentStatus = appeal?.status || 'draft';
    const currentStep = statusMap[currentStatus]?.step || 0;
    const statusInfo = statusMap[currentStatus] || statusMap['draft'];

    // Calculate deadline information if relevant
    let deadlineInfo = null;
    if (appeal?.submissionDate && currentStatus === 'submitted') {
      // Many insurance companies respond within 30 days
      const expectedResponseDate = new Date(appeal.submissionDate);
      expectedResponseDate.setDate(expectedResponseDate.getDate() + 30);
      
      const now = new Date();
      const daysRemaining = Math.ceil((expectedResponseDate - now) / (1000 * 60 * 60 * 24));
      
      if (daysRemaining > 0) {
        deadlineInfo = {
          date: expectedResponseDate,
          daysRemaining,
          message: `Expected response in ${formatDistanceToNow(expectedResponseDate, { addSuffix: true })}`
        };
      }
    }

    return {
      currentStep,
      stepStatus: statusInfo.color,
      statusInfo,
      deadlineInfo
    };
  }, [appeal]);

  // If compact mode, render a simpler version
  if (compact) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Tooltip title={statusInfo.description}>
          <Chip 
            icon={statusInfo.icon} 
            label={statusInfo.label}
            color={statusInfo.color} 
            sx={{ mr: 2 }}
          />
        </Tooltip>
        
        {deadlineInfo && (
          <Tooltip title="Expected response date based on typical insurance processing times">
            <Chip 
              icon={<DeadlineIcon />} 
              label={deadlineInfo.message}
              variant="outlined"
              color={deadlineInfo.daysRemaining < 5 ? "warning" : "default"} 
            />
          </Tooltip>
        )}
      </Box>
    );
  }

  return (
    <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Appeal Progress
      </Typography>
      
      <Stepper activeStep={currentStep} orientation="vertical">
        {/* Step 1: Draft */}
        <Step>
          <StepLabel>
            <Typography variant="subtitle1">Appeal Draft</Typography>
          </StepLabel>
          <StepContent>
            <Typography variant="body2" paragraph>
              Gather all necessary medical and insurance information. Create a compelling
              appeal letter that clearly explains why the service should be covered.
            </Typography>
            
            {currentStep === 0 && onEditClick && (
              <Button 
                variant="contained" 
                startIcon={<EditIcon />} 
                onClick={onEditClick}
                size="small"
                sx={{ mt: 1 }}
              >
                Continue Editing
              </Button>
            )}
          </StepContent>
        </Step>
        
        {/* Step 2: Ready for Submission */}
        <Step>
          <StepLabel>
            <Typography variant="subtitle1">Ready for Submission</Typography>
          </StepLabel>
          <StepContent>
            <Typography variant="body2" paragraph>
              Review your appeal details and supporting documentation. Make sure everything
              is accurate and complete before submission to the insurance company.
            </Typography>
            
            {currentStep === 1 && onSubmitClick && (
              <Button 
                variant="contained" 
                color="primary"
                startIcon={<SendIcon />} 
                onClick={onSubmitClick}
                size="small"
                sx={{ mt: 1 }}
              >
                Submit Appeal
              </Button>
            )}
          </StepContent>
        </Step>
        
        {/* Step 3: Submitted */}
        <Step>
          <StepLabel>
            <Typography variant="subtitle1">Appeal Submitted</Typography>
          </StepLabel>
          <StepContent>
            <Typography variant="body2" paragraph>
              Your appeal has been submitted to the insurance company. They typically
              take 30 days to review appeals, but timeframes can vary.
            </Typography>
            
            {deadlineInfo && (
              <Alert 
                severity={deadlineInfo.daysRemaining < 5 ? "warning" : "info"}
                icon={<DeadlineIcon />}
                sx={{ mt: 1 }}
              >
                Expected response {formatDistanceToNow(deadlineInfo.date, { addSuffix: true })}
              </Alert>
            )}
          </StepContent>
        </Step>
        
        {/* Step 4: Under Review */}
        <Step>
          <StepLabel>
            <Typography variant="subtitle1">Under Review</Typography>
          </StepLabel>
          <StepContent>
            <Typography variant="body2" paragraph>
              Your appeal is being actively processed by the insurance company. This may
              involve medical review or further investigation of your claim.
            </Typography>
          </StepContent>
        </Step>
        
        {/* Step 5: Decision Received */}
        <Step>
          <StepLabel>
            <Typography variant="subtitle1">Decision Received</Typography>
          </StepLabel>
          <StepContent>
            <Typography variant="body2" paragraph>
              The insurance company has made a decision on your appeal.
            </Typography>
            
            {currentStep === 4 && (
              <Alert 
                severity={
                  appeal?.status === 'approved' ? "success" : 
                  appeal?.status === 'partially_approved' ? "warning" : 
                  "error"
                }
                sx={{ mt: 1 }}
              >
                <Typography variant="body2">
                  <strong>Status: {statusInfo.label}</strong>
                  {appeal?.responseDetails?.decisionText && (
                    <Box component="p" sx={{ mt: 1, mb: 0 }}>
                      {appeal.responseDetails.decisionText}
                    </Box>
                  )}
                </Typography>
              </Alert>
            )}
          </StepContent>
        </Step>
      </Stepper>

      {/* Appeal status summary */}
      <Box sx={{ mt: 3, display: 'flex', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
          Current Status:
        </Typography>
        <Chip 
          icon={statusInfo.icon} 
          label={statusInfo.label}
          color={statusInfo.color} 
          size="small"
        />
      </Box>
    </Paper>
  );
};

AppealProgressStepper.propTypes = {
  appeal: PropTypes.object.isRequired,
  compact: PropTypes.bool,
  onEditClick: PropTypes.func,
  onSubmitClick: PropTypes.func
};

export default AppealProgressStepper;