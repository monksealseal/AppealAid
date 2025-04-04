import React, { useState } from 'react';
import {
  Typography,
  Box,
  Paper,
  TextField,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Grid,
  Divider,
  FormHelperText,
  Button,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
} from '@mui/material';
import {
  Description as LetterIcon,
  ContentCopy as CopyIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  ExpandMore as ExpandMoreIcon,
  Psychology as AIIcon,
  LocalHospital as MedicalIcon,
  GavelRounded as LegalIcon,
} from '@mui/icons-material';

const RealTimeAppealGenerator = ({
  documentId,
  isGenerating,
  setIsGenerating,
  letter,
  setLetter,
  document,
  appealInfo,
  setAppealInfo,
  error: propError,
  aiAnalysis,
  setAiAnalysis,
}) => {
  const [customPrompt, setCustomPrompt] = useState('');
  const [showPromptInput, setShowPromptInput] = useState(false);
  const [deadlineWarning, setDeadlineWarning] = useState(null);
  const [showAiInsights, setShowAiInsights] = useState(true);
  const [selectedLLM, setSelectedLLM] = useState('default');
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [error, setError] = useState(propError);

  // Function to handle letter generation
  const handleGenerateLetter = async () => {
    setIsGenerating(true);
    
    try {
      // This would be an actual API call in a real implementation
      // For demo, we'll simulate a response
      let requestBody = {
        documentId,
        customPrompt: customPrompt || undefined,
        llmModel: selectedLLM
      };
      
      // Add API key if Claude is selected
      if (selectedLLM === 'claude') {
        requestBody.apiKey = apiKey;
      }
      
      // In a real implementation, you would call your backend API:
      // const response = await fetch('/api/appeals/generate-letter', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(requestBody),
      // });
      // const data = await response.json();
      
      // Simulate API response time based on model
      const delay = selectedLLM === 'claude' ? 3000 : 2000;
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Generate different mock data based on selected model
      let mockData;
      
      if (selectedLLM === 'claude') {
        // More detailed and personalized mock response for Claude
        mockData = {
          appealType: 'medicalNecessity',
          appealContent: `[Patient Name]
[Patient Address]
[City, State ZIP]

${new Date().toLocaleDateString()}

[Insurance Company]
Attn: Appeals Department
[Insurance Address]
[City, State ZIP]

Re: Appeal of Claim Denial
Member Name: [Patient Name]
Member ID: ${appealInfo.memberId || "ABC123456"}
Claim Number: ${appealInfo.claimNumber || "CLM987654321"}
Date of Service: ${appealInfo.serviceDate || "01/15/2023"}

To Whom It May Concern:

I am writing to formally appeal the denial of coverage for the ${appealInfo.serviceDescription || "MRI scan"} that was performed on ${appealInfo.serviceDate || "01/15/2023"}. According to the Explanation of Benefits received on [date], this claim was denied citing "${appealInfo.denialReason || "lack of medical necessity"}".

I believe this denial warrants reconsideration for the following substantial reasons:

1. Medical Necessity: This procedure was explicitly prescribed by Dr. [Physician Name] as medically necessary to diagnose and properly treat my condition of ${appealInfo.diagnosisCodes ? appealInfo.diagnosisCodes.join(", ") : "lower back pain with radiculopathy"}.

2. Standard of Care: The ${appealInfo.serviceDescription || "MRI scan"} represents the standard of care for my diagnosis according to multiple peer-reviewed clinical guidelines, including those from the American College of Radiology and the American Academy of Orthopedic Surgeons.

3. Prior Conservative Treatment: Before recommending this procedure, my physician pursued a comprehensive course of conservative treatment including physical therapy for 8 weeks, prescription anti-inflammatory medication, and activity modification - all without sufficient improvement in my symptoms.

4. Policy Coverage: My health insurance policy specifically includes coverage for diagnostic imaging when deemed medically necessary by a licensed physician. Section [X] of my policy states that such services are covered when "ordered by a physician to diagnose a suspected medical condition."

In support of this appeal, I am enclosing the following documentation:
1. A letter from Dr. [Physician Name] detailing the medical necessity of this procedure
2. My complete medical records documenting my condition and prior treatments
3. Clinical practice guidelines supporting this procedure for my diagnosis
4. Scientific literature demonstrating the diagnostic value of this procedure
5. Relevant sections of my insurance policy indicating coverage

Under both state regulations and the Affordable Care Act, I am entitled to a full and fair review of this claim denial. Additionally, according to 45 CFR § 147.136, I have the right to appeal this determination within 180 days of receiving notice of the denial.

I respectfully request that you reconsider this denial and provide the coverage to which I am entitled under my policy. If you require any additional information, please contact me at [phone number] or [email address].

Thank you for your prompt attention to this matter.

Sincerely,

[Patient Name]

cc: [State Insurance Commissioner]
    [Physician Name]`,
          aiConfidence: 0.92,
          deadlineWarning: {
            type: 'warning',
            message: 'Warning: Only 7 days remaining to submit this appeal.',
            daysRemaining: 7,
            severity: 'medium',
            recommendedAction: 'Consider filing immediately or requesting a deadline extension'
          },
          suggestedEvidence: [
            'Physician letter explaining medical necessity in detail',
            'Complete medical records documenting condition and prior treatments',
            'Clinical practice guidelines supporting this procedure',
            'Scientific literature demonstrating diagnostic value',
            'Relevant insurance policy sections'
          ],
          aiAnalysis: {
            keyArguments: [
              'Focus on establishing clear medical necessity with clinical documentation',
              'Demonstrate that all conservative treatment options were exhausted',
              'Reference specific policy language supporting coverage',
              'Cite relevant healthcare regulations and laws supporting your appeal',
              'Consider requesting external review if initial appeal is denied'
            ],
            successProbability: 0.82,
            recommendedEvidence: [
              'Detailed medical records showing progressive symptoms and failed treatments',
              'Expert physician letter citing clinical guidelines and necessity',
              'Insurance policy documentation specifically addressing diagnostic procedures',
              'Additional medical opinions supporting the necessity of the procedure',
              'Research articles demonstrating efficacy for your specific condition'
            ]
          }
        };
      } else {
        // Standard mock response for default model
        mockData = {
          appealType: 'medicalNecessity',
          appealContent: `[Patient Name]
[Patient Address]
[City, State ZIP]

${new Date().toLocaleDateString()}

[Insurance Company]
Attn: Appeals Department
[Insurance Address]
[City, State ZIP]

Re: Appeal of Claim Denial
Member Name: [Patient Name]
Member ID: ${appealInfo.memberId || "ABC123456"}
Claim Number: ${appealInfo.claimNumber || "CLM987654321"}
Date of Service: ${appealInfo.serviceDate || "01/15/2023"}

To Whom It May Concern:

I hope this letter finds you well. I am facing significant financial burden due to this unexpected medical expense, which is creating hardship for me and my family. I am writing to appeal the denial of coverage for ${appealInfo.serviceDescription || "MRI scan"} that was performed on ${appealInfo.serviceDate || "01/15/2023"}. Your company has denied this claim stating that it was not medically necessary.

I believe this denial is incorrect for the following reasons:

1. My healthcare provider determined that ${appealInfo.serviceDescription || "MRI scan"} was medically necessary based on my specific health condition and medical history.
2. The treatment aligns with standard medical practice for my diagnosis of ${appealInfo.diagnosisCodes || "lower back pain"}.
3. The denial cited "${appealInfo.denialReason || "lack of medical necessity"}" which contradicts my provider's clinical assessment of my specific situation.

Enclosed please find the following supporting documentation:
- Letter from my physician explaining medical necessity
- Medical records documenting my condition
- Clinical guidelines supporting necessity

Under the Affordable Care Act, health plans must cover medically necessary treatments as determined by healthcare providers. Additionally, I am exercising my right to appeal as guaranteed by federal regulation 45 CFR § 147.136.

Please reconsider this claim and provide the coverage to which I am entitled under my policy. If you require additional information, please contact me at [phone number] or [email].

Thank you for your prompt attention to this matter.

Sincerely,

[Patient Name]`,
          aiConfidence: 0.85,
          deadlineWarning: {
            type: 'warning',
            message: 'Warning: Only 7 days remaining to submit this appeal.',
            daysRemaining: 7,
            severity: 'medium'
          },
          suggestedEvidence: [
            'Physician letter explaining necessity',
            'Medical records documenting condition',
            'Clinical guidelines supporting necessity'
          ],
          aiAnalysis: {
            keyArguments: [
              'Focus on demonstrating that the procedure meets medical necessity criteria',
              'Include specific references to insurance policy provisions',
              'Provide detailed medical justification from provider'
            ],
            successProbability: 0.75,
            recommendedEvidence: [
              'Medical records showing condition severity',
              'Letter from physician explaining necessity',
              'Insurance policy documentation showing coverage'
            ]
          }
        };
      }
      
      // Update state with mock data
      setLetter(mockData.appealContent);
      setDeadlineWarning(mockData.deadlineWarning);
      setAiAnalysis(mockData.aiAnalysis);
      
      // Update appeal info with additional data if needed
      setAppealInfo(prevInfo => ({
        ...prevInfo,
        appealType: mockData.appealType,
        suggestedEvidence: mockData.suggestedEvidence,
        usedLlmModel: selectedLLM // Track which model was used
      }));
    } catch (err) {
      console.error('Error generating letter:', err);
      setError('Failed to generate appeal letter. Please try again or use a different model.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyLetter = () => {
    if (letter) {
      navigator.clipboard.writeText(letter);
    }
  };

  const renderDeadlineWarning = () => {
    if (!deadlineWarning) return null;
    
    const severity = 
      deadlineWarning.type === 'expired' ? 'error' : 
      deadlineWarning.type === 'urgent' ? 'error' :
      deadlineWarning.type === 'warning' ? 'warning' : 'info';
    
    return (
      <Alert 
        severity={severity} 
        icon={<WarningIcon />}
        sx={{ mt: 2, mb: 2 }}
      >
        <Typography variant="body2" fontWeight="bold">
          {deadlineWarning.message}
        </Typography>
        {deadlineWarning.recommendedAction && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            Recommended action: {deadlineWarning.recommendedAction}
          </Typography>
        )}
      </Alert>
    );
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Real-Time AI Appeal Letter Generator
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Generate a personalized appeal letter based on your document using our AI-enhanced system.
        You can customize the generation by providing specific instructions.
      </Typography>

      {!letter && !isGenerating && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Generate Appeal Letter
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" gutterBottom>
              Document: <strong>{document?.name || 'No document selected'}</strong>
            </Typography>
            {appealInfo.denialReason && (
              <Typography variant="body2" gutterBottom>
                Denial Reason: <strong>{appealInfo.denialReason}</strong>
              </Typography>
            )}
          </Box>
          
          {/* LLM Selection */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Choose AI Model
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box 
                  onClick={() => {
                    setSelectedLLM('default');
                    setShowApiKeyInput(false);
                  }}
                  sx={{
                    p: 2,
                    border: '1px solid',
                    borderColor: selectedLLM === 'default' ? 'primary.main' : 'divider',
                    borderRadius: 1,
                    cursor: 'pointer',
                    bgcolor: selectedLLM === 'default' ? 'primary.light' : 'background.paper',
                    opacity: selectedLLM === 'default' ? 1 : 0.7,
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: 'primary.main',
                      opacity: 1,
                    }
                  }}
                >
                  <Typography variant="subtitle2">Default System AI</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Uses our built-in AI system for appeal generation
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box 
                  onClick={() => {
                    setSelectedLLM('claude');
                    setShowApiKeyInput(true);
                  }}
                  sx={{
                    p: 2,
                    border: '1px solid',
                    borderColor: selectedLLM === 'claude' ? 'primary.main' : 'divider',
                    borderRadius: 1,
                    cursor: 'pointer',
                    bgcolor: selectedLLM === 'claude' ? 'primary.light' : 'background.paper',
                    opacity: selectedLLM === 'claude' ? 1 : 0.7,
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: 'primary.main',
                      opacity: 1,
                    }
                  }}
                >
                  <Typography variant="subtitle2">Claude 3.7 Sonnet</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Use your own Claude API for enhanced appeals (requires API key)
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>

          {showApiKeyInput && (
            <TextField
              fullWidth
              label="Claude API Key"
              placeholder="Enter your Anthropic API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              variant="outlined"
              sx={{ mb: 3 }}
              type="password"
              helperText="Your API key is used only for this request and not stored"
            />
          )}
          
          {showPromptInput && (
            <TextField
              fullWidth
              label="Custom Instructions (Optional)"
              placeholder="E.g., Include information about my chronic condition, mention specific policy provisions..."
              multiline
              rows={3}
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              variant="outlined"
              sx={{ mb: 3 }}
              helperText="Add any specific details you want included in your appeal letter"
            />
          )}
          
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <Button 
              variant="contained" 
              color="primary"
              onClick={handleGenerateLetter}
              startIcon={<AIIcon />}
              disabled={!documentId || isGenerating || (selectedLLM === 'claude' && !apiKey)}
            >
              Generate AI Appeal Letter
            </Button>
            
            <Button
              variant="outlined"
              onClick={() => setShowPromptInput(!showPromptInput)}
            >
              {showPromptInput ? 'Hide Custom Instructions' : 'Add Custom Instructions'}
            </Button>
          </Box>
        </Paper>
      )}

      {isGenerating && (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 6 }}>
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Generating Appeal Letter with AI
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            We're analyzing your document and creating a personalized appeal letter...
          </Typography>
          
          <Box sx={{ width: '100%', maxWidth: 400 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Analyzing document data...
            </Typography>
            <LinearProgress sx={{ mb: 2, height: 6, borderRadius: 3 }} />
            
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Identifying appeal strategy...
            </Typography>
            <LinearProgress sx={{ mb: 2, height: 6, borderRadius: 3 }} />
            
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Generating persuasive content...
            </Typography>
            <LinearProgress sx={{ mb: 2, height: 6, borderRadius: 3 }} />
          </Box>
        </Box>
      )}

      {letter && !isGenerating && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AIIcon color="primary" sx={{ mr: 1 }} />
                  AI-Enhanced Appeal
                </Box>
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {renderDeadlineWarning()}
              
              {aiAnalysis && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" gutterBottom>
                    Success Probability: 
                    <Box component="span" sx={{ 
                      color: aiAnalysis.successProbability > 0.7 ? 'success.main' : 
                             aiAnalysis.successProbability > 0.4 ? 'warning.main' : 'error.main',
                      fontWeight: 'bold',
                      ml: 1
                    }}>
                      {Math.round(aiAnalysis.successProbability * 100)}%
                    </Box>
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, mb: 1 }}>
                    <Box 
                      sx={{ 
                        width: '100%', 
                        bgcolor: 'grey.300', 
                        height: 8, 
                        borderRadius: 4,
                        overflow: 'hidden' 
                      }}
                    >
                      <Box
                        sx={{
                          width: `${aiAnalysis.successProbability * 100}%`,
                          height: '100%',
                          bgcolor: aiAnalysis.successProbability > 0.7 ? 'success.main' : 
                                 aiAnalysis.successProbability > 0.4 ? 'warning.main' : 'error.main',
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
              )}
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" gutterBottom>
                  <strong>Document:</strong> {document?.name}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Appeal Type:</strong> {appealInfo.appealType || 'Medical Necessity'}
                </Typography>
                <Typography variant="body2" paragraph>
                  <strong>Denial Reason:</strong> {appealInfo.denialReason}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', mt: 2, gap: 1 }}>
                <Tooltip title="Copy letter to clipboard">
                  <IconButton onClick={handleCopyLetter} color="primary">
                    <CopyIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Regenerate letter">
                  <IconButton onClick={handleGenerateLetter} color="primary">
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Paper>
            
            {/* AI Analysis Accordion */}
            {aiAnalysis && showAiInsights && (
              <Box sx={{ mt: 2 }}>
                <Accordion defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <MedicalIcon color="primary" sx={{ mr: 1 }} />
                      <Typography>Key Arguments</Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box component="ul" sx={{ pl: 2, mt: 0 }}>
                      {aiAnalysis.keyArguments.map((arg, index) => (
                        <Box component="li" key={index} sx={{ mb: 1 }}>
                          <Typography variant="body2">{arg}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </AccordionDetails>
                </Accordion>
                
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LegalIcon color="primary" sx={{ mr: 1 }} />
                      <Typography>Recommended Evidence</Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box component="ul" sx={{ pl: 2, mt: 0 }}>
                      {aiAnalysis.recommendedEvidence.map((evidence, index) => (
                        <Box component="li" key={index} sx={{ mb: 1 }}>
                          <Typography variant="body2">{evidence}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </AccordionDetails>
                </Accordion>
              </Box>
            )}
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LetterIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="subtitle1">
                  Appeal Letter
                </Typography>
                <EditIcon sx={{ ml: 1, fontSize: 18, color: 'text.secondary' }} />
                <Chip 
                  size="small" 
                  label="AI Enhanced" 
                  color="primary" 
                  sx={{ ml: 2 }}
                  icon={<AIIcon />}
                />
              </Box>
              <TextField
                fullWidth
                multiline
                rows={20}
                value={letter}
                onChange={(e) => setLetter(e.target.value)}
                variant="outlined"
                error={!!error}
                InputProps={{
                  sx: { 
                    fontFamily: '"Times New Roman", Times, serif',
                    fontSize: '0.95rem',
                    lineHeight: 1.8,
                  },
                }}
              />
              {error && (
                <FormHelperText error>{error}</FormHelperText>
              )}
              <FormHelperText>
                Edit the letter as needed before submitting your appeal.
              </FormHelperText>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default RealTimeAppealGenerator;