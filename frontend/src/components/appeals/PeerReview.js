import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Divider,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

// Simple test version of PeerReview component 
const PeerReview = ({ appealId, appeal }) => {
  const [successMessage, setSuccessMessage] = useState('');
  
  // Sample data
  const mockDiscussionPoints = [
    {
      topic: 'Medical Necessity',
      notes: 'Discuss how the requested treatment meets medical necessity criteria based on the patient\'s specific clinical presentation and history.'
    },
    {
      topic: 'Failed Conservative Treatments',
      notes: 'Review prior treatments that have been attempted and explain why they were insufficient for this patient\'s condition.'
    },
    {
      topic: 'Clinical Evidence',
      notes: 'Reference clinical guidelines and peer-reviewed literature supporting the use of this treatment for the patient\'s diagnosis.'
    }
  ];
  
  const mockKeyPoints = [
    'Patient has been diagnosed with chronic condition requiring ongoing management',
    'Multiple conservative treatments have been attempted without adequate improvement',
    'Patient\'s functional status continues to decline without this intervention',
    'No contraindications to the requested treatment exist'
  ];
  
  const mockGuideline = {
    title: 'Clinical Practice Guidelines for Treatment of Lower Back Pain',
    source: 'American College of Physicians',
    link: 'https://example.com/guidelines',
    notes: 'Recommends advanced imaging for patients with persistent symptoms after 6 weeks of conservative therapy'
  };
  
  const handleScheduleReview = () => {
    setSuccessMessage('Test peer-to-peer review scheduled successfully');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  return (
    <Box sx={{ mt: 2 }}>
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      )}
    
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">
          Peer-to-Peer Reviews
        </Typography>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleScheduleReview}
        >
          Schedule New Review
        </Button>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Active Reviews
            </Typography>
            
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                No active peer-to-peer reviews found.
              </Typography>
              <Button
                variant="text"
                color="primary"
                onClick={handleScheduleReview}
                sx={{ mt: 2 }}
              >
                Schedule a Review
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Completed Reviews
            </Typography>
            
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                No completed peer-to-peer reviews found.
              </Typography>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Discussion Points
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {mockDiscussionPoints.map((point, index) => (
              <Card key={index} variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    {point.topic}
                  </Typography>
                  <Typography variant="body2">
                    {point.notes}
                  </Typography>
                </CardContent>
              </Card>
            ))}
            
            <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
              Key Medical Points
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              {mockKeyPoints.map((point, index) => (
                <Chip
                  key={index}
                  label={point}
                  sx={{ m: 0.5 }}
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>
            
            <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
              Relevant Guidelines
            </Typography>
            
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  {mockGuideline.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Source: {mockGuideline.source}
                </Typography>
                <Typography variant="body2">
                  {mockGuideline.notes}
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  size="small" 
                  href={mockGuideline.link} 
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Guideline
                </Button>
              </CardActions>
            </Card>
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Tips for Effective Peer-to-Peer Reviews
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Before the Call
                </Typography>
                
                <ul>
                  <li>Review all relevant patient records and clinical data</li>
                  <li>Research the specific payer guidelines for the service/treatment</li>
                  <li>Have the specific denial reason available</li>
                  <li>Prepare a one-page summary of key points</li>
                </ul>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  During the Call
                </Typography>
                
                <ul>
                  <li>Be professional and collaborative</li>
                  <li>Focus on clinical facts and medical necessity</li>
                  <li>Connect treatment to improved patient outcomes</li>
                  <li>Document the reviewer's name and conclusions</li>
                  <li>If unsuccessful, ask about escalation options</li>
                </ul>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PeerReview;