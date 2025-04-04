/**
 * Appeal Create Page
 * 
 * Form for creating a new appeal
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  CircularProgress,
  Alert
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as BackIcon, ArrowForward as NextIcon } from '@mui/icons-material';

const steps = ['Basic Information', 'Insurance Details', 'Clinical Information', 'Review'];

const AppealCreate = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    patientFirstName: '',
    patientLastName: '',
    patientDOB: '',
    serviceName: '',
    serviceDescription: '',
    serviceDate: '',
    serviceProvider: '',
    serviceLocation: '',
    insuranceCompany: '',
    insurancePlan: '',
    insuranceMemberId: '',
    claimId: '',
    requestedAmount: '',
    reason: '',
    denialReason: ''
  });
  const [errors, setErrors] = useState({});
  const [submissionError, setSubmissionError] = useState('');

  // Handle input change
  const handleChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value
    });

    // Clear error for this field
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: ''
      });
    }
  };

  // Validate basic information
  const validateBasicInfo = () => {
    const newErrors = {};
    
    if (!formData.patientFirstName) newErrors.patientFirstName = 'First name is required';
    if (!formData.patientLastName) newErrors.patientLastName = 'Last name is required';
    if (!formData.patientDOB) newErrors.patientDOB = 'Date of birth is required';
    if (!formData.serviceName) newErrors.serviceName = 'Service name is required';
    if (!formData.serviceDate) newErrors.serviceDate = 'Service date is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate insurance details
  const validateInsuranceDetails = () => {
    const newErrors = {};
    
    if (!formData.insuranceCompany) newErrors.insuranceCompany = 'Insurance company is required';
    if (!formData.insuranceMemberId) newErrors.insuranceMemberId = 'Member ID is required';
    if (!formData.requestedAmount) {
      newErrors.requestedAmount = 'Amount is required';
    } else if (isNaN(formData.requestedAmount) || formData.requestedAmount <= 0) {
      newErrors.requestedAmount = 'Please enter a valid amount';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate clinical information
  const validateClinicalInfo = () => {
    const newErrors = {};
    
    if (!formData.reason) newErrors.reason = 'Reason for appeal is required';
    if (!formData.denialReason) newErrors.denialReason = 'Denial reason is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle step navigation
  const handleNext = () => {
    let isValid = false;
    
    switch (activeStep) {
      case 0:
        isValid = validateBasicInfo();
        break;
      case 1:
        isValid = validateInsuranceDetails();
        break;
      case 2:
        isValid = validateClinicalInfo();
        break;
      default:
        isValid = true;
    }
    
    if (isValid) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  // Handle form submission
  const handleSubmit = async () => {
    setLoading(true);
    setSubmissionError('');
    
    // For demo, simulate API call
    setTimeout(() => {
      setLoading(false);
      // Navigate to a detail page for the "created" appeal
      navigate('/appeals/60d21b4667d0d8992e610c86');
    }, 2000);
  };

  // Render basic information form
  const renderBasicInfoForm = () => (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <TextField
          label="Patient First Name"
          fullWidth
          value={formData.patientFirstName}
          onChange={handleChange('patientFirstName')}
          required
          error={Boolean(errors.patientFirstName)}
          helperText={errors.patientFirstName}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="Patient Last Name"
          fullWidth
          value={formData.patientLastName}
          onChange={handleChange('patientLastName')}
          required
          error={Boolean(errors.patientLastName)}
          helperText={errors.patientLastName}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="Date of Birth"
          type="date"
          fullWidth
          value={formData.patientDOB}
          onChange={handleChange('patientDOB')}
          InputLabelProps={{ shrink: true }}
          required
          error={Boolean(errors.patientDOB)}
          helperText={errors.patientDOB}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Service Name"
          fullWidth
          value={formData.serviceName}
          onChange={handleChange('serviceName')}
          placeholder="e.g., MRI of Lumbar Spine, Post-Stroke Rehabilitation"
          required
          error={Boolean(errors.serviceName)}
          helperText={errors.serviceName}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Service Description"
          fullWidth
          multiline
          rows={2}
          value={formData.serviceDescription}
          onChange={handleChange('serviceDescription')}
          placeholder="Briefly describe the service"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="Service Date"
          type="date"
          fullWidth
          value={formData.serviceDate}
          onChange={handleChange('serviceDate')}
          InputLabelProps={{ shrink: true }}
          required
          error={Boolean(errors.serviceDate)}
          helperText={errors.serviceDate}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="Service Provider"
          fullWidth
          value={formData.serviceProvider}
          onChange={handleChange('serviceProvider')}
          placeholder="e.g., Dr. Smith, Memorial Hospital"
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Service Location"
          fullWidth
          value={formData.serviceLocation}
          onChange={handleChange('serviceLocation')}
          placeholder="Hospital, clinic, or facility name"
        />
      </Grid>
    </Grid>
  );

  // Render insurance details form
  const renderInsuranceDetailsForm = () => (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth required error={Boolean(errors.insuranceCompany)}>
          <InputLabel>Insurance Company</InputLabel>
          <Select
            value={formData.insuranceCompany}
            onChange={handleChange('insuranceCompany')}
            label="Insurance Company"
          >
            <MenuItem value="UnitedHealthcare">UnitedHealthcare</MenuItem>
            <MenuItem value="Blue Cross Blue Shield">Blue Cross Blue Shield</MenuItem>
            <MenuItem value="Aetna">Aetna</MenuItem>
            <MenuItem value="Cigna">Cigna</MenuItem>
            <MenuItem value="Humana">Humana</MenuItem>
            <MenuItem value="Kaiser Permanente">Kaiser Permanente</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
          </Select>
          {errors.insuranceCompany && (
            <FormHelperText>{errors.insuranceCompany}</FormHelperText>
          )}
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="Insurance Plan"
          fullWidth
          value={formData.insurancePlan}
          onChange={handleChange('insurancePlan')}
          placeholder="e.g., PPO, HMO, Medicare Advantage"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="Member ID"
          fullWidth
          value={formData.insuranceMemberId}
          onChange={handleChange('insuranceMemberId')}
          required
          error={Boolean(errors.insuranceMemberId)}
          helperText={errors.insuranceMemberId}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="Claim ID"
          fullWidth
          value={formData.claimId}
          onChange={handleChange('claimId')}
          placeholder="If available"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="Requested Amount ($)"
          fullWidth
          type="number"
          value={formData.requestedAmount}
          onChange={handleChange('requestedAmount')}
          required
          error={Boolean(errors.requestedAmount)}
          helperText={errors.requestedAmount}
        />
      </Grid>
    </Grid>
  );

  // Render clinical information form
  const renderClinicalInfoForm = () => (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          label="Reason for Appeal"
          fullWidth
          multiline
          rows={4}
          value={formData.reason}
          onChange={handleChange('reason')}
          placeholder="Explain why you are appealing this claim. Include any relevant clinical information."
          required
          error={Boolean(errors.reason)}
          helperText={errors.reason}
        />
      </Grid>
      <Grid item xs={12}>
        <FormControl fullWidth required error={Boolean(errors.denialReason)}>
          <InputLabel>Denial Reason</InputLabel>
          <Select
            value={formData.denialReason}
            onChange={handleChange('denialReason')}
            label="Denial Reason"
          >
            <MenuItem value="not_medically_necessary">Not Medically Necessary</MenuItem>
            <MenuItem value="out_of_network">Out of Network</MenuItem>
            <MenuItem value="experimental">Experimental/Investigational</MenuItem>
            <MenuItem value="pre_authorization">No Prior Authorization</MenuItem>
            <MenuItem value="non_covered">Non-Covered Service</MenuItem>
            <MenuItem value="nh_predict">nH Predict Algorithm</MenuItem>
            <MenuItem value="coding_error">Coding Error</MenuItem>
            <MenuItem value="other">Other</MenuItem>
          </Select>
          {errors.denialReason && (
            <FormHelperText>{errors.denialReason}</FormHelperText>
          )}
        </FormControl>
      </Grid>
    </Grid>
  );

  // Render review section
  const renderReviewSection = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>Review Appeal Information</Typography>
        <Alert severity="info" sx={{ mb: 2 }}>
          Please review all information before submitting your appeal.
        </Alert>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1" gutterBottom>Patient Information</Typography>
          <Typography>
            <strong>Name:</strong> {formData.patientFirstName} {formData.patientLastName}
          </Typography>
          <Typography>
            <strong>DOB:</strong> {formData.patientDOB}
          </Typography>
        </Paper>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1" gutterBottom>Service Information</Typography>
          <Typography>
            <strong>Service:</strong> {formData.serviceName}
          </Typography>
          <Typography>
            <strong>Date:</strong> {formData.serviceDate}
          </Typography>
          <Typography>
            <strong>Provider:</strong> {formData.serviceProvider || 'N/A'}
          </Typography>
          <Typography>
            <strong>Location:</strong> {formData.serviceLocation || 'N/A'}
          </Typography>
        </Paper>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1" gutterBottom>Insurance Information</Typography>
          <Typography>
            <strong>Company:</strong> {formData.insuranceCompany}
          </Typography>
          <Typography>
            <strong>Plan:</strong> {formData.insurancePlan || 'N/A'}
          </Typography>
          <Typography>
            <strong>Member ID:</strong> {formData.insuranceMemberId}
          </Typography>
          <Typography>
            <strong>Claim ID:</strong> {formData.claimId || 'N/A'}
          </Typography>
          <Typography>
            <strong>Amount:</strong> ${formData.requestedAmount}
          </Typography>
        </Paper>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1" gutterBottom>Appeal Information</Typography>
          <Typography>
            <strong>Denial Reason:</strong> {formData.denialReason?.replace(/_/g, ' ')}
          </Typography>
          <Typography variant="subtitle2" sx={{ mt: 1 }}>Reason for Appeal:</Typography>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
            {formData.reason}
          </Typography>
        </Paper>
      </Grid>
    </Grid>
  );

  // Render form based on active step
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return renderBasicInfoForm();
      case 1:
        return renderInsuranceDetailsForm();
      case 2:
        return renderClinicalInfoForm();
      case 3:
        return renderReviewSection();
      default:
        return 'Unknown step';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Create New Appeal
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {submissionError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {submissionError}
          </Alert>
        )}
        
        <form>
          {getStepContent(activeStep)}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              startIcon={<BackIcon />}
              onClick={handleBack}
              disabled={activeStep === 0 || loading}
            >
              Back
            </Button>
            
            <Box>
              <Button
                variant="outlined"
                onClick={() => navigate('/appeals')}
                sx={{ mr: 1 }}
                disabled={loading}
              >
                Cancel
              </Button>
              
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Submit Appeal'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  endIcon={<NextIcon />}
                  onClick={handleNext}
                  disabled={loading}
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default AppealCreate;