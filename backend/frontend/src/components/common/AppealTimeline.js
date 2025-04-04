/**
 * Appeal Timeline Component
 * 
 * A timeline visualization of key events in an appeal's history
 */

import React from 'react';
import PropTypes from 'prop-types';
import { 
  Timeline, 
  TimelineItem, 
  TimelineSeparator, 
  TimelineConnector, 
  TimelineContent, 
  TimelineDot,
  TimelineOppositeContent
} from '@mui/lab';
import { 
  Typography, 
  Paper, 
  Box,
  Tooltip
} from '@mui/material';
import {
  Create as CreateIcon,
  Edit as EditIcon,
  Send as SubmitIcon,
  Refresh as UpdateIcon,
  Email as ResponseIcon,
  CheckCircle as ApprovedIcon,
  Cancel as DeniedIcon,
  Note as DocumentIcon,
  LocalHospital as ProviderIcon
} from '@mui/icons-material';
import { formatDistanceToNow, differenceInDays } from 'date-fns';

const AppealTimeline = ({ appeal }) => {
  // Generate timeline items from appeal data
  const generateTimelineItems = () => {
    const items = [];
    
    // Always include creation date
    if (appeal.createdAt) {
      items.push({
        date: new Date(appeal.createdAt),
        title: 'Appeal Created',
        description: 'Initial appeal draft was created',
        icon: <CreateIcon />,
        color: 'grey'
      });
    }
    
    // Add submission date if available
    if (appeal.submissionDate) {
      items.push({
        date: new Date(appeal.submissionDate),
        title: 'Appeal Submitted',
        description: 'Appeal was submitted to the insurance company',
        icon: <SubmitIcon />,
        color: 'primary'
      });
    }
    
    // Add provider collaboration events if any
    if (appeal.collaborationRequests && appeal.collaborationRequests.length > 0) {
      appeal.collaborationRequests.forEach(request => {
        // Add request date
        items.push({
          date: new Date(request.requestDate),
          title: 'Provider Collaboration Requested',
          description: `Requested ${request.requestType.replace('_', ' ')} from provider`,
          icon: <ProviderIcon />,
          color: 'secondary'
        });
        
        // Add response date if completed
        if (request.status === 'completed' && request.responseDate) {
          items.push({
            date: new Date(request.responseDate),
            title: 'Provider Documentation Received',
            description: request.responseNotes || 'Provider submitted requested documentation',
            icon: <DocumentIcon />,
            color: 'success'
          });
        }
      });
    }
    
    // Add documents by upload date
    if (appeal.documents && appeal.documents.length > 0) {
      appeal.documents.forEach(doc => {
        if (doc.uploadDate && !doc.providerSubmitted) { // Skip provider docs as they're covered above
          items.push({
            date: new Date(doc.uploadDate),
            title: 'Document Added',
            description: `Added ${doc.name} (${doc.documentType.replace('_', ' ')})`,
            icon: <DocumentIcon />,
            color: 'info'
          });
        }
      });
    }
    
    // Add response date if available
    if (appeal.responseDate) {
      items.push({
        date: new Date(appeal.responseDate),
        title: 'Insurance Response Received',
        description: appeal.responseDetails?.decisionText || `Appeal was ${appeal.decision || 'processed'}`,
        icon: <ResponseIcon />,
        color: appeal.decision === 'approved' ? 'success' : 
               appeal.decision === 'partiallyApproved' ? 'warning' : 'error'
      });
    }
    
    // Add last activity if it's different from other events
    if (appeal.lastActivity && appeal.lastActivity.date) {
      const lastActivityDate = new Date(appeal.lastActivity.date);
      // Only add if it's not already covered by another event
      const isUnique = !items.some(item => 
        Math.abs(item.date - lastActivityDate) < 1000 * 60 * 5 // Within 5 minutes
      );
      
      if (isUnique) {
        items.push({
          date: lastActivityDate,
          title: appeal.lastActivity.action?.replace(/_/g, ' ') || 'Appeal Updated',
          description: appeal.lastActivity.details || 'Appeal was updated',
          icon: <UpdateIcon />,
          color: 'default'
        });
      }
    }
    
    // Sort by date (oldest first)
    return items.sort((a, b) => a.date - b.date);
  };
  
  const timelineItems = generateTimelineItems();
  
  if (timelineItems.length === 0) {
    return null;
  }
  
  return (
    <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Appeal Timeline
      </Typography>
      
      <Timeline position="alternate">
        {timelineItems.map((item, index) => (
          <TimelineItem key={index}>
            <TimelineOppositeContent sx={{ m: 'auto 0' }}>
              <Typography variant="body2" color="text.secondary">
                {item.date.toLocaleDateString()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatDistanceToNow(item.date, { addSuffix: true })}
              </Typography>
            </TimelineOppositeContent>
            
            <TimelineSeparator>
              <TimelineDot color={item.color}>
                <Tooltip title={item.title}>
                  {item.icon}
                </Tooltip>
              </TimelineDot>
              {index < timelineItems.length - 1 && <TimelineConnector />}
            </TimelineSeparator>
            
            <TimelineContent sx={{ py: '12px', px: 2 }}>
              <Paper elevation={2} sx={{ p: 2 }}>
                <Typography variant="subtitle2">{item.title}</Typography>
                <Typography variant="body2">{item.description}</Typography>
              </Paper>
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </Paper>
  );
};

AppealTimeline.propTypes = {
  appeal: PropTypes.object.isRequired
};

export default AppealTimeline;