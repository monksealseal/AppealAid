import React from 'react';
import {
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  RadioGroup,
  FormControlLabel,
  Radio,
  Paper,
  Divider,
  Chip,
  FormHelperText,
} from '@mui/material';
import {
  Assignment as TemplateIcon,
  Check as CheckIcon,
} from '@mui/icons-material';

// Mock templates data
const letterTemplates = [
  {
    id: 'default',
    name: 'Standard Appeal Letter',
    description: 'A comprehensive letter covering all standard appeal requirements.',
    recommended: true,
    suitableFor: ['All denial reasons'],
  },
  {
    id: 'detailed',
    name: 'Detailed Medical Necessity',
    description: 'Emphasizes medical necessity with detailed clinical references.',
    recommended: false,
    suitableFor: ['Not Medically Necessary', 'Experimental or Investigational'],
  },
  {
    id: 'network',
    name: 'Out-of-Network Appeal',
    description: 'Focuses on network adequacy and emergency/specialty care needs.',
    recommended: false,
    suitableFor: ['Out of Network'],
  },
  {
    id: 'authorization',
    name: 'Prior Authorization',
    description: 'Addresses prior authorization issues and timely filing requirements.',
    recommended: false,
    suitableFor: ['Prior Authorization Required'],
  },
  {
    id: 'coding',
    name: 'Coding and Billing',
    description: 'Addresses coding and billing errors with specific reference to standard codes.',
    recommended: false,
    suitableFor: ['Coding Error', 'Duplicate Claim'],
  },
];

const TemplateSelection = ({ 
  selectedTemplate, 
  setSelectedTemplate, 
  denialReason = '',
  errors = {}
}) => {
  // Filter templates based on denial reason
  const filteredTemplates = denialReason 
    ? letterTemplates.filter(template => 
        template.suitableFor.includes('All denial reasons') || 
        template.suitableFor.includes(denialReason)
      )
    : letterTemplates;
  
  // Handle template selection
  const handleTemplateChange = (event) => {
    const templateId = event.target.value;
    setSelectedTemplate(templateId);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Select Letter Template
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Choose a letter template that best fits your appeal situation. 
        Templates are pre-formatted with language appropriate for your denial reason.
      </Typography>
      
      {errors.template && (
        <FormHelperText error sx={{ mb: 2 }}>
          {errors.template}
        </FormHelperText>
      )}
      
      <RadioGroup
        aria-label="letter template"
        name="letter-template"
        value={selectedTemplate}
        onChange={handleTemplateChange}
      >
        <Grid container spacing={2}>
          {filteredTemplates.map((template) => (
            <Grid item xs={12} md={6} key={template.id}>
              <Card 
                variant={selectedTemplate === template.id ? 'elevation' : 'outlined'}
                elevation={selectedTemplate === template.id ? 4 : 1}
                sx={{
                  borderColor: selectedTemplate === template.id ? 'primary.main' : undefined,
                  borderWidth: selectedTemplate === template.id ? 2 : 1,
                  height: '100%',
                }}
              >
                <CardActionArea 
                  sx={{ height: '100%' }}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                      <TemplateIcon color="primary" sx={{ mr: 1, mt: 0.5 }} />
                      <Box>
                        <Typography variant="subtitle1" component="div">
                          {template.name}
                        </Typography>
                        {template.recommended && (
                          <Chip 
                            icon={<CheckIcon />} 
                            label="Recommended" 
                            color="success" 
                            size="small" 
                            sx={{ mt: 0.5, mb: 1 }}
                          />
                        )}
                      </Box>
                      <Box sx={{ ml: 'auto' }}>
                        <FormControlLabel
                          control={
                            <Radio 
                              checked={selectedTemplate === template.id}
                              value={template.id}
                              name="template-radio"
                            />
                          }
                          label=""
                        />
                      </Box>
                    </Box>
                    <Divider sx={{ mb: 1.5 }} />
                    <Typography variant="body2" color="text.secondary">
                      {template.description}
                    </Typography>
                    <Box sx={{ mt: 1.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        Best for:
                      </Typography>
                      <Box sx={{ mt: 0.5 }}>
                        {template.suitableFor.map((reason) => (
                          <Chip 
                            key={reason}
                            label={reason} 
                            size="small" 
                            variant="outlined"
                            sx={{ mr: 0.5, mb: 0.5 }}
                            color={reason === denialReason ? 'primary' : 'default'}
                          />
                        ))}
                      </Box>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </RadioGroup>
      
      {selectedTemplate && (
        <Paper sx={{ p: 2, mt: 3, bgcolor: 'background.default' }}>
          <Typography variant="subtitle1" gutterBottom>
            Template Info
          </Typography>
          <Typography variant="body2">
            You selected the 
            <strong> {letterTemplates.find(t => t.id === selectedTemplate)?.name} </strong> 
            template. In the next step, you'll be able to review and customize the generated letter.
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default TemplateSelection;