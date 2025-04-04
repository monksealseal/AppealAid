/**
 * Main App Component
 * 
 * Root component that sets up routing and global app structure
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Layout components
import Layout from './components/layout/Layout';

// Auth components
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Appeal pages
import Appeals from './pages/Appeals';
import AppealCreate from './pages/AppealCreate';
import AppealDetail from './components/appeals/AppealDetail';

// Provider pages
import ProviderDocumentUpload from './components/provider/ProviderDocumentUpload';

// Other pages
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';

// Create theme
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

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Public provider routes - no authentication required */}
          <Route path="/provider/document-upload/:token" element={<ProviderDocumentUpload />} />

          {/* Protected routes wrapped in layout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            
            {/* Appeal routes */}
            <Route path="appeals" element={<Appeals />} />
            <Route path="appeals/create" element={<AppealCreate />} />
            <Route path="appeals/:appealId" element={<AppealDetail />} />
            <Route path="appeals/:appealId/edit" element={<AppealCreate />} />
            
            {/* Redirect to dashboard if route doesn't match */}
            <Route path="*" element={<NotFound />} />
          </Route>
          
          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;