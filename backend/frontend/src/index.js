import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Typography, Button, Container, Paper, List, ListItem, ListItemText, Tabs, Tab } from '@mui/material';

// Import original App
import OriginalApp from './App';

// Import components we built
import AppealDetail from './components/appeals/AppealDetail';
import ProviderDocumentUpload from './components/provider/ProviderDocumentUpload';

// Create Material UI theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#f50057',
    },
  },
  components: {
    MuiPaper: {
      defaultProps: {
        elevation: 2,
      },
    },
  },
});

// Home page with links to test pages
function HomePage() {
  const [tabValue, setTabValue] = React.useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const testAppeals = [
    {
      id: '60d21b4667d0d8992e610c85',
      name: 'Post-Stroke Rehabilitation Appeal (Denied)',
      description: 'A UnitedHealthcare appeal with nH Predict denial, clinical data, and collaboration'
    },
    {
      id: '60d21b4667d0d8992e610c86',
      name: 'MRI Lumbar Spine Appeal (Pending)',
      description: 'A pending BCBS appeal without clinical data'
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 5 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>AppealAid</Typography>
        
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 4 }}>
          <Tab label="New UI Components" />
          <Tab label="Full Application" />
        </Tabs>

        {tabValue === 0 && (
          <>
            <Typography variant="body1" paragraph>
              These are the new UI components developed to enhance the user experience in the AppealAid application. 
              They provide improved visualization and contextual help for insurance appeals.
            </Typography>
    
            <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>Appeal Detail Pages</Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              These pages showcase the progress stepper, timeline, and term definitions for different types of appeals.
            </Typography>
            
            <List>
              {testAppeals.map(appeal => (
                <ListItem key={appeal.id} divider component={Paper} variant="outlined" sx={{ mb: 2, p: 2 }}>
                  <ListItemText 
                    primary={appeal.name} 
                    secondary={appeal.description}
                    primaryTypographyProps={{ variant: 'h6' }}
                    secondaryTypographyProps={{ variant: 'body2' }}
                  />
                  <Button 
                    variant="contained" 
                    component={Link}
                    to={`/ui-test/appeals/${appeal.id}`}
                  >
                    View Appeal
                  </Button>
                </ListItem>
              ))}
            </List>
    
            <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>Provider Portal</Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Test the secure provider document upload portal.
            </Typography>
            
            <Button 
              variant="contained" 
              color="secondary"
              component={Link}
              to="/ui-test/provider/document-upload/YWJjMTIz"
            >
              Provider Document Upload
            </Button>
          </>
        )}

        {tabValue === 1 && (
          <>
            <Typography variant="body1" paragraph>
              This is the full application with all existing functionality plus the new components integrated.
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Button 
                variant="contained" 
                size="large"
                component={Link}
                to="/app"
              >
                Launch Full Application
              </Button>
            </Box>
          </>
        )}
      </Paper>
    </Container>
  );
}

// Setup the routes
function MainApp() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Home page with options */}
          <Route path="/" element={<HomePage />} />
          
          {/* Original UI test routes */}
          <Route path="/ui-test/appeals/:appealId" element={<AppealDetail />} />
          <Route path="/ui-test/provider/document-upload/:token" element={<ProviderDocumentUpload />} />
          
          {/* Full application route */}
          <Route path="/app/*" element={<OriginalApp />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

// Render app
ReactDOM.render(
  <React.StrictMode>
    <MainApp />
  </React.StrictMode>,
  document.getElementById('root')
);