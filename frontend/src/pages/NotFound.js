import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Container, Typography, Paper } from '@mui/material';
import { SentimentDissatisfied as SadIcon } from '@mui/icons-material';

const NotFound = () => {
  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <SadIcon color="primary" sx={{ fontSize: 80, mb: 2 }} />
          <Typography component="h1" variant="h4" gutterBottom>
            404 - Page Not Found
          </Typography>
          <Typography variant="body1" align="center" sx={{ mb: 4 }}>
            Sorry, the page you are looking for does not exist or has been moved.
          </Typography>
          <Button
            variant="contained"
            component={RouterLink}
            to="/"
            sx={{ mt: 2 }}
          >
            Go to Dashboard
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

export default NotFound;