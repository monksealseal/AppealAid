import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Paper,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Grid,
  Button,
  Alert,
  Collapse,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Link,
} from '@mui/material';
import {
  Email as EmailIcon,
  Print as PrintIcon,
  CloudUpload as UploadIcon,
  Fax as FaxIcon,
  Description as InstructionsIcon,
  Check as CheckIcon,
} from '@mui/icons-material';

// Submission method options with their associated data
const submissionMethods = {
  mail: {
    label: 'Mail',
    icon: <PrintIcon />,
    description: 'Print and mail your appeal to the insurance company',
    instructions: [
      'Print your appeal letter and all supporting documents',
      'Send via certified mail with return receipt',
      'Keep a copy of all documents for your records',
    ],
    requiresAddress: true,
  },
  fax: {
    label: 'Fax',
    icon: <FaxIcon />,
    description: 'Fax your appeal directly to the insurance company',
    instructions: [
      'Print your appeal letter and all supporting documents',
      'Send via fax to the number provided',
      'Keep a fax confirmation sheet for your records',
    ],
    requiresFaxNumber: true,
  },
  email: {
    label: 'Email',
    icon: <EmailIcon />,
    description: 'Email your appeal and attachments to the insurance company',
    instructions: [
      'Download your appeal letter PDF',
      'Attach it along with any supporting documents to an email',
      'Send to the email address provided',
      'Keep a copy of the sent email for your records',
    ],
    requiresEmail: true,
  },
  portal: {
    label: 'Insurance Portal',
    icon: <UploadIcon />,
    description: 'Upload your appeal to the insurance company\'s online portal',
    instructions: [
      'Download your appeal letter PDF',
      'Log in to your insurance company\'s online portal',
      'Navigate to the appeal or claim submission section',
      'Upload your appeal letter and supporting documents',
      'Save or print the confirmation page',
    ],
    requiresPortalLink: true,
  },
};

const SubmissionMethod = ({ 
  document, 
  appealInfo,
  submissionInfo,
  setSubmissionInfo,
  error
}) => {
  const [method, setMethod] = useState(submissionInfo?.method || 'mail');
  const [address, setAddress] = useState(submissionInfo?.address || '');
  const [faxNumber, setFaxNumber] = useState(submissionInfo?.faxNumber || '');
  const [email, setEmail] = useState(submissionInfo?.email || '');
  const [portalLink, setPortalLink] = useState(submissionInfo?.portalLink || '');

  // Get insurance company info from document if available
  const insuranceInfo = document?.insuranceInfo || {
    name: 'Your Insurance Company',
    address: '',
    faxNumber: '',
    emailAddress: '',
    portalUrl: '',
  };

  // Update parent component state when our local state changes
  useEffect(() => {
    setSubmissionInfo({
      method,
      address: method === 'mail' ? address : '',
      faxNumber: method === 'fax' ? faxNumber : '',
      email: method === 'email' ? email : '',
      portalLink: method === 'portal' ? portalLink : '',
      timestamp: new Date().toISOString(),
    });
  }, [method, address, faxNumber, email, portalLink, setSubmissionInfo]);

  const handleMethodChange = (event) => {
    setMethod(event.target.value);
  };

  // Auto-populate fields with insurance company info if available
  useEffect(() => {
    if (insuranceInfo) {
      if (insuranceInfo.address && method === 'mail' && !address) {
        setAddress(insuranceInfo.address);
      }
      if (insuranceInfo.faxNumber && method === 'fax' && !faxNumber) {
        setFaxNumber(insuranceInfo.faxNumber);
      }
      if (insuranceInfo.emailAddress && method === 'email' && !email) {
        setEmail(insuranceInfo.emailAddress);
      }
      if (insuranceInfo.portalUrl && method === 'portal' && !portalLink) {
        setPortalLink(insuranceInfo.portalUrl);
      }
    }
  }, [method, insuranceInfo, address, faxNumber, email, portalLink]);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Choose Submission Method
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Select how you would like to submit your appeal to {insuranceInfo.name}.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <RadioGroup
              aria-label="submission method"
              name="submission-method"
              value={method}
              onChange={handleMethodChange}
            >
              {Object.entries(submissionMethods).map(([key, methodInfo]) => (
                <FormControlLabel
                  key={key}
                  value={key}
                  control={<Radio />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ mr: 1 }}>{methodInfo.icon}</Box>
                      <Typography variant="subtitle2">{methodInfo.label}</Typography>
                    </Box>
                  }
                  sx={{ 
                    mb: 1, 
                    p: 1, 
                    border: '1px solid',
                    borderColor: method === key ? 'primary.main' : 'divider',
                    borderRadius: 1,
                    bgcolor: method === key ? 'primary.50' : 'transparent',
                    width: '100%',
                  }}
                />
              ))}
            </RadioGroup>
          </Paper>
        </Grid>

        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              {submissionMethods[method].icon}
              <Typography variant="subtitle1" sx={{ ml: 1 }}>
                {submissionMethods[method].label} Instructions
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {submissionMethods[method].description}
            </Typography>
            
            <Divider sx={{ mb: 2 }} />
            
            {/* Specific fields for the selected method */}
            {method === 'mail' && (
              <TextField
                label="Mailing Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                multiline
                rows={3}
                fullWidth
                variant="outlined"
                margin="normal"
                helperText="Enter the complete mailing address for the insurance appeals department"
                required
              />
            )}
            
            {method === 'fax' && (
              <TextField
                label="Fax Number"
                value={faxNumber}
                onChange={(e) => setFaxNumber(e.target.value)}
                fullWidth
                variant="outlined"
                margin="normal"
                helperText="Enter the fax number for the insurance appeals department"
                required
              />
            )}
            
            {method === 'email' && (
              <TextField
                label="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                variant="outlined"
                margin="normal"
                helperText="Enter the email address for the insurance appeals department"
                required
              />
            )}
            
            {method === 'portal' && (
              <TextField
                label="Portal URL"
                value={portalLink}
                onChange={(e) => setPortalLink(e.target.value)}
                fullWidth
                variant="outlined"
                margin="normal"
                helperText="Enter the URL for the insurance company's claims portal"
                required
              />
            )}
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <InstructionsIcon fontSize="small" sx={{ mr: 1 }} />
                Steps to Submit
              </Typography>
              <List dense>
                {submissionMethods[method].instructions.map((instruction, index) => (
                  <ListItem key={index}>
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      <CheckIcon fontSize="small" color="primary" />
                    </ListItemIcon>
                    <ListItemText primary={instruction} />
                  </ListItem>
                ))}
              </List>
            </Box>
            
            {method === 'mail' || method === 'fax' ? (
              <Button 
                variant="contained" 
                startIcon={<PrintIcon />}
                sx={{ mt: 2 }}
                onClick={() => window.print()}
              >
                Print Appeal Documents
              </Button>
            ) : method === 'email' || method === 'portal' ? (
              <Button 
                variant="contained" 
                startIcon={<UploadIcon />}
                sx={{ mt: 2 }}
              >
                Download Appeal PDF
              </Button>
            ) : null}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SubmissionMethod;