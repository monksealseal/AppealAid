import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Divider,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Chip,
  Stack,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormLabel,
  LinearProgress
} from '@mui/material';
import {
  Save as SaveIcon,
  PersonAdd as PersonAddIcon,
  Send as SendIcon,
  FormatQuote as QuoteIcon,
  LocalHospital as MedicalIcon,
  Assignment as AssignmentIcon,
  AddCircle as AddCircleIcon,
  Edit as EditIcon,
  ContentCopy as CopyIcon,
  History as HistoryIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon
} from '@mui/icons-material';

const ProviderReview = ({ appealLetter, onSave, onApprove, currentUser }) => {
  const [editedLetter, setEditedLetter] = useState(appealLetter || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [medicalDetails, setMedicalDetails] = useState({
    diagnosis: '',
    treatmentHistory: '',
    recommendedProcedure: '',
    medicalJustification: '',
    clinicalGuidelines: '',
    additionalNotes: ''
  });
  const [openMedicalDialog, setOpenMedicalDialog] = useState(false);
  const [providerAssessment, setProviderAssessment] = useState('');
  const [medicalNecessity, setMedicalNecessity] = useState('high');
  const [highlightedSection, setHighlightedSection] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  
  // Mock edit history data
  const editHistory = [
    { 
      user: 'Dr. Sarah Johnson', 
      date: '2023-05-10T14:30:00', 
      change: 'Added medical necessity justification based on imaging results.' 
    },
    { 
      user: 'Dr. Michael Chen', 
      date: '2023-05-09T10:15:00', 
      change: 'Modified treatment history section to include failed conservative approaches.' 
    },
    { 
      user: 'Dr. Robert Williams', 
      date: '2023-05-08T16:45:00', 
      change: 'Initial medical assessment added.' 
    }
  ];
  
  const handleLetterChange = (e) => {
    setEditedLetter(e.target.value);
  };
  
  const handleSave = async () => {
    try {
      setSaving(true);
      // In a real app, this would call your backend API
      await new Promise(r => setTimeout(r, 1000));
      
      if (onSave) {
        onSave(editedLetter);
      }
    } catch (err) {
      setError('Failed to save changes. Please try again.');
      console.error('Error saving provider review:', err);
    } finally {
      setSaving(false);
    }
  };
  
  const handleApprove = async () => {
    try {
      setSaving(true);
      // In a real app, this would call your backend API
      await new Promise(r => setTimeout(r, 1000));
      
      if (onApprove) {
        onApprove({
          letter: editedLetter,
          providerAssessment,
          medicalNecessity,
          medicalDetails
        });
      }
    } catch (err) {
      setError('Failed to approve. Please try again.');
      console.error('Error approving appeal:', err);
    } finally {
      setSaving(false);
    }
  };
  
  const handleMedicalDetailsChange = (field, value) => {
    setMedicalDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleAddMedicalDetails = () => {
    // Close dialog
    setOpenMedicalDialog(false);
    
    // Generate text to insert based on medical details
    const medicalDetailsText = `
Medical Assessment:
- Diagnosis: ${medicalDetails.diagnosis}
- Treatment History: ${medicalDetails.treatmentHistory}
- Recommended Procedure: ${medicalDetails.recommendedProcedure}

Medical Justification:
${medicalDetails.medicalJustification}

Applicable Clinical Guidelines:
${medicalDetails.clinicalGuidelines}

${medicalDetails.additionalNotes ? `Additional Notes:\n${medicalDetails.additionalNotes}` : ''}
    `.trim();
    
    // Insert at cursor position or append to end
    setEditedLetter(prev => {
      return prev + '\n\n' + medicalDetailsText;
    });
  };

  const handleInsertTemplate = (templateType) => {
    let templateText = '';
    
    switch (templateType) {
      case 'medicalNecessity':
        templateText = `Based on my medical assessment as a licensed physician, I confirm that this procedure is medically necessary for this patient. The patient has demonstrated [specific symptoms/condition] which requires this intervention because [medical justification]. Alternative treatments including [list treatments] have been attempted without sufficient improvement. This treatment is consistent with the standard of care for this diagnosis according to [clinical guidelines/medical consensus].`;
        break;
      case 'specialistAssessment':
        templateText = `As a board-certified specialist in [specialty], I have evaluated this patient and determined that the requested treatment is appropriate and necessary based on their clinical presentation. The patient's diagnostic findings, including [specific test results], indicate the medical necessity of this procedure.`;
        break;
      case 'treatmentHistory':
        templateText = `The patient has undergone the following conservative treatments without adequate improvement:
1. [Treatment 1] from [date] to [date], which resulted in [outcome]
2. [Treatment 2] from [date] to [date], which resulted in [outcome]
3. [Treatment 3] from [date] to [date], which resulted in [outcome]

Despite these interventions, the patient continues to experience [symptoms], which significantly impacts their daily functioning and quality of life.`;
        break;
      default:
        templateText = '';
    }
    
    // Insert at cursor position or append to end
    if (templateText) {
      setEditedLetter(prev => {
        return prev + '\n\n' + templateText;
      });
    }
  };
  
  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <MedicalIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h5">
              Provider Review & Approval
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Chip 
              icon={<PersonAddIcon />} 
              label="Dr. Provider View" 
              color="primary" 
              variant="outlined" 
            />
            <FormControlLabel
              control={
                <Switch 
                  checked={showHistory} 
                  onChange={(e) => setShowHistory(e.target.checked)}
                  size="small"
                />
              }
              label="Show Edit History"
            />
          </Stack>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={showHistory ? 8 : 12}>
            <Typography variant="subtitle1" gutterBottom>
              Appeal Letter Review
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={15}
              value={editedLetter}
              onChange={handleLetterChange}
              variant="outlined"
              InputProps={{
                sx: { 
                  fontFamily: '"Times New Roman", Times, serif',
                  fontSize: '0.95rem',
                  lineHeight: 1.8,
                },
              }}
              sx={{ 
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: highlightedSection ? 'warning.main' : undefined,
                    borderWidth: highlightedSection ? 2 : undefined,
                  },
                },
              }}
            />
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mr: 2 }}>
                Quick Templates:
              </Typography>
              <Stack direction="row" spacing={1}>
                <Chip 
                  label="Medical Necessity" 
                  color="primary" 
                  onClick={() => handleInsertTemplate('medicalNecessity')}
                  size="small"
                />
                <Chip 
                  label="Specialist Assessment" 
                  color="primary" 
                  onClick={() => handleInsertTemplate('specialistAssessment')}
                  size="small"
                />
                <Chip 
                  label="Treatment History" 
                  color="primary" 
                  onClick={() => handleInsertTemplate('treatmentHistory')}
                  size="small"
                />
              </Stack>
              <Button
                startIcon={<AddCircleIcon />}
                sx={{ ml: 'auto' }}
                onClick={() => setOpenMedicalDialog(true)}
              >
                Add Medical Details
              </Button>
            </Box>
          </Grid>
          
          {showHistory && (
            <Grid item xs={12} md={4}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <HistoryIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="subtitle1">
                      Provider Edit History
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  
                  {editHistory.map((edit, index) => (
                    <Box 
                      key={index} 
                      sx={{ 
                        mb: 2, 
                        pb: 2, 
                        borderBottom: index < editHistory.length - 1 ? '1px solid' : 'none',
                        borderBottomColor: 'divider'
                      }}
                    >
                      <Typography variant="subtitle2">
                        {edit.user}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                        {new Date(edit.date).toLocaleString()}
                      </Typography>
                      <Typography variant="body2">
                        {edit.change}
                      </Typography>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
        
        <Divider sx={{ my: 3 }} />
        
        <Typography variant="subtitle1" gutterBottom>
          Medical Assessment
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <FormLabel id="medical-necessity-label">Medical Necessity Assessment</FormLabel>
              <RadioGroup
                row
                aria-labelledby="medical-necessity-label"
                name="medical-necessity"
                value={medicalNecessity}
                onChange={(e) => setMedicalNecessity(e.target.value)}
              >
                <FormControlLabel value="high" control={<Radio />} label="High" />
                <FormControlLabel value="moderate" control={<Radio />} label="Moderate" />
                <FormControlLabel value="low" control={<Radio />} label="Low" />
              </RadioGroup>
            </FormControl>
            
            <TextField
              fullWidth
              label="Provider Assessment"
              placeholder="Enter your medical assessment of this case..."
              multiline
              rows={4}
              value={providerAssessment}
              onChange={(e) => setProviderAssessment(e.target.value)}
              variant="outlined"
              required
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Alert severity="info" sx={{ mb: 2 }}>
              <AlertTitle>Physician Responsibility</AlertTitle>
              By approving this appeal, you are attesting to the medical necessity of the treatment/procedure based on your professional medical judgment.
            </Alert>
            
            <Box sx={{ textAlign: 'center' }}>
              <LinearProgress 
                variant="determinate" 
                value={
                  (editedLetter.length > 0 ? 33 : 0) + 
                  (providerAssessment.length > 0 ? 33 : 0) + 
                  (medicalNecessity ? 34 : 0)
                } 
                sx={{ mb: 2 }}
              />
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                {providerAssessment ? 'Ready for approval' : 'Please complete the assessment'}
              </Typography>
              
              <Stack direction="row" spacing={2} justifyContent="center">
                <Button
                  variant="outlined"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                  disabled={saving || !editedLetter}
                >
                  Save Draft
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<CheckCircleIcon />}
                  onClick={handleApprove}
                  disabled={saving || !editedLetter || !providerAssessment}
                >
                  Approve Appeal
                </Button>
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Medical Details Dialog */}
      <Dialog open={openMedicalDialog} onClose={() => setOpenMedicalDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <MedicalIcon color="primary" sx={{ mr: 1 }} />
            Add Medical Details
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Diagnosis"
                placeholder="e.g., L4-L5 herniated disc with radiculopathy"
                value={medicalDetails.diagnosis}
                onChange={(e) => handleMedicalDetailsChange('diagnosis', e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Treatment History"
                placeholder="e.g., 6 weeks of physical therapy, NSAIDs, steroid injections"
                value={medicalDetails.treatmentHistory}
                onChange={(e) => handleMedicalDetailsChange('treatmentHistory', e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Recommended Procedure"
                placeholder="e.g., MRI of lumbar spine"
                value={medicalDetails.recommendedProcedure}
                onChange={(e) => handleMedicalDetailsChange('recommendedProcedure', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Medical Justification"
                placeholder="Explain why this procedure is medically necessary..."
                multiline
                rows={3}
                value={medicalDetails.medicalJustification}
                onChange={(e) => handleMedicalDetailsChange('medicalJustification', e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Applicable Clinical Guidelines"
                placeholder="e.g., American College of Radiology guidelines..."
                multiline
                rows={2}
                value={medicalDetails.clinicalGuidelines}
                onChange={(e) => handleMedicalDetailsChange('clinicalGuidelines', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Additional Notes"
                placeholder="Any additional medical information relevant to this appeal..."
                multiline
                rows={2}
                value={medicalDetails.additionalNotes}
                onChange={(e) => handleMedicalDetailsChange('additionalNotes', e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenMedicalDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleAddMedicalDetails} 
            variant="contained" 
            color="primary"
            disabled={!medicalDetails.diagnosis || !medicalDetails.medicalJustification}
          >
            Add to Letter
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProviderReview;