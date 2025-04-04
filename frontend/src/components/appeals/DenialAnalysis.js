import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Paper,
  Grid,
  Button,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  Alert,
  Chip,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  NotInterested as BlockIcon,
  CheckCircle as CheckCircleIcon,
  ExpandMore as ExpandMoreIcon,
  Article as ArticleIcon,
  FactCheck as FactCheckIcon,
  Policy as PolicyIcon,
  HealthAndSafety as HealthIcon,
  Gavel as LegalIcon,
  ArrowCircleUp as IncreaseIcon,
  ErrorOutline as WarningIcon,
  Psychology as AIIcon,
} from '@mui/icons-material';

// Mock API call for denial analysis
const fetchDenialAnalysis = async (denialReason, documentId) => {
  // In a real app, this would actually call your backend API
  await new Promise(r => setTimeout(r, 1500));
  
  // Default analysis
  const defaultAnalysis = {
    overallAssessment: {
      appealProbability: 0.65,
      keyIssue: "Medical necessity not sufficiently established",
      recommendedApproach: "Gather clinical evidence showing why the procedure meets medical necessity requirements",
    },
    commonDenialReasons: [
      {
        reason: "Medical necessity not established",
        frequency: "68% of similar cases",
        suggestions: [
          "Obtain detailed letter from physician explaining necessity",
          "Include relevant clinical guidelines supporting necessity",
          "Document failed attempts at more conservative treatments"
        ]
      },
      {
        reason: "Insufficient documentation",
        frequency: "42% of similar cases",
        suggestions: [
          "Include complete medical records",
          "Provide detailed diagnostic test results",
          "Get supporting statements from specialists"
        ]
      },
      {
        reason: "Policy exclusions",
        frequency: "31% of similar cases",
        suggestions: [
          "Review policy documents for exceptions or special provisions",
          "Check if procedure is covered under different coding",
          "Verify if recent policy updates have changed coverage"
        ]
      }
    ],
    legalContext: {
      relevantRegulations: [
        "Affordable Care Act §2719 - Appeals process requirements",
        "ERISA §503 - Claims procedures for employer plans",
        "State Insurance Code §10123.135 - Independent Medical Review"
      ],
      successfulArgumentsInSimilarCases: [
        "Standard of care requirements",
        "Medical consensus on treatment approach",
        "Ambiguity in policy language should favor the insured"
      ]
    },
    statisticalContext: {
      overallAppealSuccessRate: "38%",
      successFactors: [
        {
          factor: "Detailed physician letter",
          impact: "+24% success rate"
        },
        {
          factor: "Peer-reviewed medical literature",
          impact: "+18% success rate"
        },
        {
          factor: "Evidence of failed alternatives",
          impact: "+15% success rate"
        }
      ],
      timeframeData: {
        optimalSubmissionWindow: "10-30 days after denial",
        averageProcessingTime: "24 days"
      }
    }
  };

  // Adjust based on denial reason
  if (denialReason && denialReason.toLowerCase().includes('medical necessity')) {
    return {
      ...defaultAnalysis,
      overallAssessment: {
        appealProbability: 0.72,
        keyIssue: "Medical necessity determination challenged",
        recommendedApproach: "Focus on clinical evidence and specialist opinions"
      },
      commonDenialReasons: [
        {
          reason: "Medical necessity criteria not met",
          frequency: "76% of similar cases",
          suggestions: [
            "Obtain detailed letter from physician explaining necessity",
            "Reference official clinical guidelines that support necessity",
            "Document how condition meets insurer's own medical necessity criteria"
          ]
        },
        {
          reason: "Experimental/investigational determination",
          frequency: "31% of similar cases",
          suggestions: [
            "Provide peer-reviewed research showing treatment efficacy",
            "Include statistics on treatment outcomes",
            "Get statements from multiple specialists supporting treatment approach"
          ]
        },
        {
          reason: "Alternative treatments not exhausted",
          frequency: "29% of similar cases",
          suggestions: [
            "Document all previous treatments attempted",
            "Explain why alternatives are inappropriate or ineffective",
            "Include timeline showing progression of treatment approaches"
          ]
        }
      ]
    };
  }
  
  if (denialReason && denialReason.toLowerCase().includes('network')) {
    return {
      ...defaultAnalysis,
      overallAssessment: {
        appealProbability: 0.58,
        keyIssue: "Out-of-network care coverage dispute",
        recommendedApproach: "Focus on network inadequacy or emergency circumstances"
      },
      commonDenialReasons: [
        {
          reason: "Out-of-network provider used",
          frequency: "82% of similar cases",
          suggestions: [
            "Document unavailability of in-network providers",
            "Prove excessive wait times for in-network care",
            "Demonstrate specialized expertise only available out-of-network"
          ]
        },
        {
          reason: "No referral or authorization",
          frequency: "54% of similar cases",
          suggestions: [
            "Show emergency nature of care needed",
            "Document attempts to contact insurer beforehand",
            "Provide evidence of referral attempts"
          ]
        },
        {
          reason: "Non-covered facility",
          frequency: "23% of similar cases",
          suggestions: [
            "Check if facility has partial coverage agreement",
            "Document medical necessity of using that specific facility",
            "Research if facility should qualify under policy terms"
          ]
        }
      ]
    };
  }
  
  return defaultAnalysis;
};

const DenialAnalysis = ({ denialReason, documentId, onActionSelect }) => {
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const getAnalysis = async () => {
      try {
        setLoading(true);
        const data = await fetchDenialAnalysis(denialReason, documentId);
        setAnalysis(data);
      } catch (err) {
        console.error('Error fetching denial analysis:', err);
        setError('Failed to load denial analysis. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    getAnalysis();
  }, [denialReason, documentId]);
  
  const handleActionSelect = (action) => {
    if (onActionSelect) {
      onActionSelect(action);
    }
  };
  
  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <CircularProgress sx={{ mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          Analyzing Denial Data
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Our AI is analyzing similar cases and preparing insights...
        </Typography>
        
        <Box sx={{ width: '100%', maxWidth: 500 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Analyzing denial patterns...
          </Typography>
          <LinearProgress sx={{ mb: 2, height: 6, borderRadius: 3 }} />
          
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Evaluating legal contexts...
          </Typography>
          <LinearProgress sx={{ mb: 2, height: 6, borderRadius: 3 }} />
          
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Generating recommendations...
          </Typography>
          <LinearProgress sx={{ mb: 2, height: 6, borderRadius: 3 }} />
        </Box>
      </Box>
    );
  }
  
  if (error) {
    return (
      <Alert severity="error">
        {error}
      </Alert>
    );
  }
  
  // Format the success probability
  const formatProbability = (probability) => {
    return `${Math.round(probability * 100)}%`;
  };
  
  // Determine color based on probability
  const getProbabilityColor = (probability) => {
    if (probability >= 0.7) return 'success';
    if (probability >= 0.4) return 'warning';
    return 'error';
  };
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <AIIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h5">
            Denial Analysis
          </Typography>
        </Box>
        <Chip 
          label="AI-Powered Analysis" 
          color="primary" 
          size="small" 
        />
      </Box>
      
      {/* Overall Assessment Card */}
      <Paper sx={{ p: 3, mb: 3, backgroundColor: 'primary.light', color: 'primary.contrastText' }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={3} sx={{ textAlign: { xs: 'center', md: 'center' } }}>
            <Box sx={{ position: 'relative', display: 'inline-block' }}>
              <CircularProgress 
                variant="determinate" 
                value={analysis.overallAssessment.appealProbability * 100} 
                size={90}
                thickness={5}
                sx={{ 
                  color: 'white',
                  opacity: 0.9,
                  backgroundColor: 'rgba(0,0,0,0.2)',
                  borderRadius: '50%',
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="h5" component="div">
                  {formatProbability(analysis.overallAssessment.appealProbability)}
                </Typography>
              </Box>
            </Box>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Appeal Success Probability
            </Typography>
          </Grid>
          <Grid item xs={12} md={9}>
            <Typography variant="h6" gutterBottom>
              Key Appeal Strategy
            </Typography>
            <Typography variant="body1" paragraph>
              {analysis.overallAssessment.keyIssue}
            </Typography>
            <Typography variant="subtitle2" gutterBottom>
              Recommended Approach:
            </Typography>
            <Typography variant="body2">
              {analysis.overallAssessment.recommendedApproach}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Common Denial Reasons Accordion */}
      <Accordion defaultExpanded sx={{ mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <WarningIcon color="error" sx={{ mr: 1 }} />
            <Typography variant="h6">
              Common Denial Reasons
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            {analysis.commonDenialReasons.map((item, index) => (
              <Grid item xs={12} key={index}>
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {item.reason}
                      </Typography>
                      <Chip label={item.frequency} size="small" variant="outlined" />
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="subtitle2" gutterBottom>
                      Suggested Responses:
                    </Typography>
                    <List dense>
                      {item.suggestions.map((suggestion, i) => (
                        <ListItem key={i}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <CheckCircleIcon color="success" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary={suggestion} />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </AccordionDetails>
      </Accordion>
      
      {/* Legal Context Accordion */}
      <Accordion sx={{ mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <LegalIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6">
              Legal & Regulatory Context
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Relevant Regulations
              </Typography>
              <List dense>
                {analysis.legalContext.relevantRegulations.map((regulation, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <PolicyIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary={regulation} />
                  </ListItem>
                ))}
              </List>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Successful Arguments in Similar Cases
              </Typography>
              <List dense>
                {analysis.legalContext.successfulArgumentsInSimilarCases.map((argument, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <FactCheckIcon color="success" />
                    </ListItemIcon>
                    <ListItemText primary={argument} />
                  </ListItem>
                ))}
              </List>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
      
      {/* Statistical Context Accordion */}
      <Accordion sx={{ mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6">
              Statistical Insights
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Overall Appeal Success Rate: {analysis.statisticalContext.overallAppealSuccessRate}
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2" gutterBottom>
                  Success Factors:
                </Typography>
                <List dense>
                  {analysis.statisticalContext.successFactors.map((factor, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <IncreaseIcon color="success" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={factor.factor} 
                        secondary={factor.impact} 
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Timeframe Information
                </Typography>
                <Divider sx={{ my: 1 }} />
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <ArticleIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Optimal Submission Window" 
                      secondary={analysis.statisticalContext.timeframeData.optimalSubmissionWindow} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <ArticleIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Average Processing Time" 
                      secondary={analysis.statisticalContext.timeframeData.averageProcessingTime} 
                    />
                  </ListItem>
                </List>
              </Paper>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
      
      {/* Action Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Button 
          variant="outlined" 
          sx={{ mr: 2 }}
          onClick={() => handleActionSelect('generate_evidence')}
        >
          Generate Evidence Checklist
        </Button>
        <Button 
          variant="contained"
          onClick={() => handleActionSelect('create_appeal')}
        >
          Create Appeal Based on Analysis
        </Button>
      </Box>
    </Box>
  );
};

export default DenialAnalysis;