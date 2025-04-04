import React from 'react';
import {
  Typography,
  Box,
  Paper,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Check as CheckIcon,
  Description as DocumentIcon,
  Assignment as AppealIcon,
  Create as EditIcon,
  AttachFile as AttachmentIcon,
  InsertDriveFile as FileIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  Assignment as TemplateIcon,
} from '@mui/icons-material';
import { formatFileSize } from '../../utils/helpers';

// Template info for display in review
const letterTemplates = {
  default: {
    name: 'Standard Appeal Letter',
    description: 'A comprehensive letter covering all standard appeal requirements.',
  },
  detailed: {
    name: 'Detailed Medical Necessity',
    description: 'Emphasizes medical necessity with detailed clinical references.',
  },
  network: {
    name: 'Out-of-Network Appeal',
    description: 'Focuses on network adequacy and emergency/specialty care needs.',
  },
  authorization: {
    name: 'Prior Authorization',
    description: 'Addresses prior authorization issues and timely filing requirements.',
  },
  coding: {
    name: 'Coding and Billing',
    description: 'Addresses coding and billing errors with specific reference to standard codes.',
  },
};

const AppealReview = ({ document, appealInfo, letter }) => {
  // Get appropriate icon for file type
  const getFileIcon = (file) => {
    if (file.type.includes('pdf')) {
      return <PdfIcon />;
    } else if (file.type.includes('image')) {
      return <ImageIcon />;
    } else {
      return <FileIcon />;
    }
  };

  // Get template info
  const templateInfo = letterTemplates[appealInfo.templateId] || letterTemplates.default;

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Review Your Appeal
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Please review all details before submitting your appeal. You can go back to previous steps to make changes if needed.
      </Typography>

      <Grid container spacing={3}>
        {/* Document Information */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <DocumentIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="subtitle1">
                Document Information
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <List dense>
              <ListItem>
                <ListItemText 
                  primary="Document Name" 
                  secondary={document?.name} 
                  primaryTypographyProps={{ color: 'text.secondary', fontSize: '0.875rem' }}
                  secondaryTypographyProps={{ color: 'text.primary', fontWeight: 'medium' }}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Document Type" 
                  secondary={document?.type} 
                  primaryTypographyProps={{ color: 'text.secondary', fontSize: '0.875rem' }}
                  secondaryTypographyProps={{ color: 'text.primary', fontWeight: 'medium' }}
                />
              </ListItem>
              {document?.claimNumber && (
                <ListItem>
                  <ListItemText 
                    primary="Claim Number" 
                    secondary={document.claimNumber} 
                    primaryTypographyProps={{ color: 'text.secondary', fontSize: '0.875rem' }}
                    secondaryTypographyProps={{ color: 'text.primary', fontWeight: 'medium' }}
                  />
                </ListItem>
              )}
              {document?.provider && (
                <ListItem>
                  <ListItemText 
                    primary="Provider" 
                    secondary={document.provider} 
                    primaryTypographyProps={{ color: 'text.secondary', fontSize: '0.875rem' }}
                    secondaryTypographyProps={{ color: 'text.primary', fontWeight: 'medium' }}
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>

        {/* Appeal Information */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <AppealIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="subtitle1">
                Appeal Information
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <List dense>
              <ListItem>
                <ListItemText 
                  primary="Appeal Title" 
                  secondary={appealInfo.title} 
                  primaryTypographyProps={{ color: 'text.secondary', fontSize: '0.875rem' }}
                  secondaryTypographyProps={{ color: 'text.primary', fontWeight: 'medium' }}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Denial Reason" 
                  secondary={appealInfo.denialReason} 
                  primaryTypographyProps={{ color: 'text.secondary', fontSize: '0.875rem' }}
                  secondaryTypographyProps={{ color: 'text.primary', fontWeight: 'medium' }}
                />
              </ListItem>
              {appealInfo.description && (
                <ListItem>
                  <ListItemText 
                    primary="Description" 
                    secondary={appealInfo.description} 
                    primaryTypographyProps={{ color: 'text.secondary', fontSize: '0.875rem' }}
                    secondaryTypographyProps={{ color: 'text.primary', fontWeight: 'medium' }}
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>

        {/* Template Information */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TemplateIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="subtitle1">
                Letter Template
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <List dense>
              <ListItem>
                <ListItemText 
                  primary="Selected Template" 
                  secondary={templateInfo.name} 
                  primaryTypographyProps={{ color: 'text.secondary', fontSize: '0.875rem' }}
                  secondaryTypographyProps={{ color: 'text.primary', fontWeight: 'medium' }}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Template Description" 
                  secondary={templateInfo.description} 
                  primaryTypographyProps={{ color: 'text.secondary', fontSize: '0.875rem' }}
                  secondaryTypographyProps={{ color: 'text.primary', fontWeight: 'medium' }}
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* Supporting Documents */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <AttachmentIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="subtitle1">
                Supporting Documents
              </Typography>
              {appealInfo.attachments?.length > 0 && (
                <Chip 
                  label={`${appealInfo.attachments.length} attached`} 
                  size="small" 
                  color="primary" 
                  sx={{ ml: 1 }} 
                />
              )}
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            {appealInfo.attachments?.length > 0 ? (
              <List dense>
                {appealInfo.attachments.map((file, index) => (
                  <ListItem key={file.id}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      {getFileIcon(file)}
                    </ListItemIcon>
                    <ListItemText 
                      primary={file.name} 
                      secondary={formatFileSize(file.size)}
                      primaryTypographyProps={{ 
                        variant: 'body2', 
                        sx: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } 
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No supporting documents attached.
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Appeal Letter */}
        <Grid item xs={12}>
          <Accordion defaultExpanded>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="appeal-letter-content"
              id="appeal-letter-header"
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <EditIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="subtitle1">Appeal Letter</Typography>
                <Chip 
                  label="Ready to Submit" 
                  color="success" 
                  size="small" 
                  icon={<CheckIcon />} 
                  sx={{ ml: 2 }} 
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 3, 
                  fontFamily: '"Times New Roman", Times, serif',
                  fontSize: '0.95rem',
                  lineHeight: 1.8,
                  whiteSpace: 'pre-line'
                }}
              >
                {letter}
              </Paper>
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* Submission Notes */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, bgcolor: 'primary.50' }}>
            <Typography variant="subtitle1" color="primary.main" gutterBottom>
              Ready to Submit
            </Typography>
            <Typography variant="body2">
              Your appeal is ready to be submitted. Once created, you'll be able to track its status and 
              you'll receive notifications about any updates. You'll also be guided through the submission process, 
              which may involve printing and mailing, submitting electronically, or uploading to your 
              insurance provider's portal.
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Stack direction="row" spacing={1}>
                <Chip 
                  icon={<CheckIcon />} 
                  label="Document selected" 
                  color="success" 
                  size="small" 
                  variant="outlined" 
                />
                <Chip 
                  icon={<CheckIcon />} 
                  label="Appeal information provided" 
                  color="success" 
                  size="small" 
                  variant="outlined" 
                />
                <Chip 
                  icon={<CheckIcon />} 
                  label="Letter generated" 
                  color="success" 
                  size="small" 
                  variant="outlined" 
                />
                {appealInfo.attachments?.length > 0 && (
                  <Chip 
                    icon={<CheckIcon />} 
                    label={`${appealInfo.attachments.length} documents attached`} 
                    color="success" 
                    size="small" 
                    variant="outlined" 
                  />
                )}
              </Stack>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AppealReview;