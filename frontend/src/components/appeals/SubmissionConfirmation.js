import React from 'react';
import {
  Typography,
  Box,
  Paper,
  Button,
  Grid,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Card,
  CardContent,
  Stack,
  Link,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  AccessTime as AccessTimeIcon,
  ArrowForward as ArrowForwardIcon,
  FileCopy as FileCopyIcon,
  Print as PrintIcon,
  Description as DocumentIcon,
  CloudDownload as DownloadIcon,
  Dashboard as DashboardIcon,
  RemoveRedEye as ViewIcon,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { formatDate } from '../../utils/helpers';

const submissionMethodLabels = {
  mail: 'Mail',
  fax: 'Fax',
  email: 'Email',
  portal: 'Insurance Portal',
};

const SubmissionConfirmation = ({ appeal }) => {
  const { document, submissionInfo } = appeal || {};
  const submissionMethod = submissionInfo?.method || 'mail';
  
  const nextSteps = [
    {
      label: 'Track Your Appeal',
      description: 'Monitor the status of your appeal on the dashboard',
      icon: <DashboardIcon color="primary" />,
      action: <Button component={RouterLink} to="/appeals" variant="outlined" size="small" endIcon={<ArrowForwardIcon />}>Go to Appeals</Button>,
    },
    {
      label: 'Check for Updates',
      description: 'You will receive notifications for any status changes',
      icon: <AccessTimeIcon color="primary" />,
      action: <Button component={RouterLink} to="/notifications" variant="outlined" size="small" endIcon={<ArrowForwardIcon />}>View Notifications</Button>,
    },
    {
      label: 'Keep Your Records',
      description: 'Download all appeal documents for your records',
      icon: <FileCopyIcon color="primary" />,
      action: <Button variant="outlined" size="small" endIcon={<DownloadIcon />}>Download All</Button>,
    },
  ];

  const anticipatedTimeline = [
    {
      label: 'Submitted',
      date: 'Today',
      status: 'complete',
    },
    {
      label: 'Under Review',
      date: '1-2 weeks',
      status: 'pending',
    },
    {
      label: 'Decision',
      date: '30-45 days',
      status: 'future',
    },
  ];

  return (
    <Box>
      <Box sx={{ textAlign: 'center', py: 3 }}>
        <CheckCircleIcon color="success" sx={{ fontSize: 64, mb: 2 }} />
        <Typography variant="h4" gutterBottom>
          Appeal Successfully Created
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Your appeal has been created and is ready for submission
        </Typography>
        <Chip 
          label={`Submission Method: ${submissionMethodLabels[submissionMethod]}`} 
          color="primary" 
          sx={{ mt: 1 }} 
        />
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Next Steps
            </Typography>
            <List>
              {nextSteps.map((step, index) => (
                <React.Fragment key={index}>
                  <ListItem
                    secondaryAction={step.action}
                    sx={{ 
                      py: 2, 
                      px: 0,
                    }}
                  >
                    <ListItemIcon>
                      {step.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={step.label}
                      secondary={step.description}
                      primaryTypographyProps={{ fontWeight: 'medium' }}
                    />
                  </ListItem>
                  {index < nextSteps.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
          
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Anticipated Timeline
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Insurance appeals typically follow this timeline, though exact timing may vary.
            </Typography>
            
            <Box sx={{ 
              display: 'flex', 
              position: 'relative',
              mt: 4,
              mb: 2,
              px: 2,
              '&::before': {
                content: '""',
                position: 'absolute',
                top: '50%',
                left: 0,
                right: 0,
                height: 2,
                bgcolor: 'divider',
                zIndex: 0,
              }
            }}>
              {anticipatedTimeline.map((item, index) => (
                <Box 
                  key={index} 
                  sx={{ 
                    flex: 1, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  <Box 
                    sx={{ 
                      width: 36, 
                      height: 36, 
                      borderRadius: '50%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      bgcolor: item.status === 'complete' 
                        ? 'success.main' 
                        : item.status === 'pending' 
                          ? 'warning.main' 
                          : 'grey.300',
                      color: 'white',
                      mb: 1,
                    }}
                  >
                    {item.status === 'complete' ? (
                      <CheckCircleIcon fontSize="small" />
                    ) : (
                      <AccessTimeIcon fontSize="small" />
                    )}
                  </Box>
                  <Typography variant="subtitle2">
                    {item.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.date}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Appeal Summary
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <List dense disablePadding>
              <ListItem sx={{ px: 0 }}>
                <ListItemText 
                  primary="Appeal ID" 
                  secondary={appeal?.id || 'N/A'} 
                  primaryTypographyProps={{ color: 'text.secondary', variant: 'caption' }}
                  secondaryTypographyProps={{ fontWeight: 'medium', color: 'text.primary' }}
                />
              </ListItem>
              <ListItem sx={{ px: 0 }}>
                <ListItemText 
                  primary="Created On" 
                  secondary={appeal?.createdAt ? formatDate(appeal.createdAt) : 'Today'} 
                  primaryTypographyProps={{ color: 'text.secondary', variant: 'caption' }}
                  secondaryTypographyProps={{ fontWeight: 'medium', color: 'text.primary' }}
                />
              </ListItem>
              <ListItem sx={{ px: 0 }}>
                <ListItemText 
                  primary="Status" 
                  secondary={
                    <Chip 
                      label={appeal?.status || 'Ready for Submission'} 
                      size="small" 
                      color="primary"
                    />
                  } 
                  primaryTypographyProps={{ color: 'text.secondary', variant: 'caption' }}
                />
              </ListItem>
              <ListItem sx={{ px: 0 }}>
                <ListItemText 
                  primary="Document" 
                  secondary={document?.name || 'Insurance Document'} 
                  primaryTypographyProps={{ color: 'text.secondary', variant: 'caption' }}
                  secondaryTypographyProps={{ fontWeight: 'medium', color: 'text.primary' }}
                />
              </ListItem>
            </List>
            
            <Divider sx={{ my: 2 }} />
            
            <Button
              component={RouterLink}
              to={`/appeals/${appeal?.id}`}
              variant="contained"
              fullWidth
              endIcon={<ViewIcon />}
              sx={{ mb: 2 }}
            >
              View Full Appeal
            </Button>
            
            <Button
              variant="outlined"
              fullWidth
              startIcon={<PrintIcon />}
              onClick={() => window.print()}
            >
              Print Appeal Documents
            </Button>
          </Paper>
          
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <DocumentIcon color="info" sx={{ mr: 1 }} />
                <Typography variant="subtitle2">
                  Need Help?
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                If you need assistance with your appeal or have questions about the process, 
                our support team is here to help.
              </Typography>
              <Link component={RouterLink} to="/support" sx={{ display: 'flex', alignItems: 'center' }}>
                Contact Support <ArrowForwardIcon fontSize="small" sx={{ ml: 0.5 }} />
              </Link>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SubmissionConfirmation;