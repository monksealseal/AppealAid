import React, { useState } from 'react';
import { Link as RouterLink, Navigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Link,
  Grid,
  Box,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import { LockOutlined, AccountCircle } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import demoAccountService from '../services/demoAccountService';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState(null);
  const [demoLoading, setDemoLoading] = useState(false);
  const { login, isAuthenticated, loading } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    
    if (!email || !password) {
      setFormError('Please fill in all fields');
      return;
    }
    
    try {
      await login(email, password);
    } catch (error) {
      setFormError(error.message);
    }
  };
  
  const handleDemoLogin = async () => {
    setFormError(null);
    setDemoLoading(true);
    
    try {
      // Get or create a demo account
      const demoUser = await demoAccountService.loginWithDemoAccount();
      
      // Log in with the demo account credentials
      await login(demoUser.email, 'demopassword123');
    } catch (error) {
      setFormError('Could not create demo account. Please try again or register normally.');
      console.error('Demo login error:', error);
    } finally {
      setDemoLoading(false);
    }
  };

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <Container component="main" maxWidth="xs">
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
          <Box
            sx={{
              backgroundColor: 'primary.main',
              color: 'white',
              width: 40,
              height: 40,
              borderRadius: '50%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              mb: 1,
            }}
          >
            <LockOutlined />
          </Box>
          <Typography component="h1" variant="h5">
            Sign in to AppealAid
          </Typography>
          
          {formError && (
            <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
              {formError}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading || demoLoading}
            >
              {loading ? <CircularProgress size={24} /> : 'Sign In'}
            </Button>
            
            <Divider sx={{ my: 2 }}>
              <Typography variant="body2" color="text.secondary">
                OR
              </Typography>
            </Divider>
            
            <Button
              fullWidth
              variant="outlined"
              color="secondary"
              startIcon={<AccountCircle />}
              onClick={handleDemoLogin}
              disabled={loading || demoLoading}
              sx={{ mb: 2 }}
            >
              {demoLoading ? <CircularProgress size={24} /> : 'Try Instant Demo'}
            </Button>
            
            <Grid container>
              <Grid item xs>
                <Link component={RouterLink} to="/forgot-password" variant="body2">
                  Forgot password?
                </Link>
              </Grid>
              <Grid item>
                <Link component={RouterLink} to="/register" variant="body2">
                  Don't have an account? Sign Up
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;