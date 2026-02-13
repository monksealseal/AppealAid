import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Provider } from 'react-redux';
import store from './store';

// Layout components
import Layout from './components/layout/Layout';
import Notification from './components/common/Notification';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Documents from './pages/Documents';
import DocumentDetail from './pages/DocumentDetail';
import DocumentUpload from './pages/DocumentUpload';
import Appeals from './pages/Appeals';
import AppealDetail from './pages/AppealDetail';
import AppealCreate from './pages/AppealCreate';
import AIAppealGenerator from './pages/AIAppealGenerator';
import AppealsTracking from './pages/AppealsTracking';
import ReportingDashboard from './pages/ReportingDashboard';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

// Public pages
import Landing from './pages/Landing';
import Pricing from './pages/Pricing';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Billing from './pages/Billing';

// Auth components and context
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/auth/PrivateRoute';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#2D7DD2',
    },
    secondary: {
      main: '#97CC04',
    },
    error: {
      main: '#D62828',
    },
    warning: {
      main: '#FF9800',
    },
    info: {
      main: '#0288D1',
    },
    success: {
      main: '#4CAF50',
    },
    background: {
      default: '#F8F9FA',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 600,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
  },
});

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <Routes>
            {/* Public marketing pages */}
            <Route path="/landing" element={<Landing />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />

            {/* Auth routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes */}
            <Route path="/" element={<Layout />}>
              <Route index element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="documents" element={<PrivateRoute><Documents /></PrivateRoute>} />
              <Route path="documents/upload" element={<PrivateRoute><DocumentUpload /></PrivateRoute>} />
              <Route path="documents/:id" element={<PrivateRoute><DocumentDetail /></PrivateRoute>} />
              <Route path="appeals" element={<PrivateRoute><Appeals /></PrivateRoute>} />
              <Route path="appeals/new" element={<PrivateRoute><AppealCreate /></PrivateRoute>} />
              <Route path="appeals/ai-generator" element={<PrivateRoute><AIAppealGenerator /></PrivateRoute>} />
              <Route path="appeals/tracking" element={<PrivateRoute><AppealsTracking /></PrivateRoute>} />
              <Route path="appeals/reporting" element={<PrivateRoute><ReportingDashboard /></PrivateRoute>} />
              <Route path="appeals/:id" element={<PrivateRoute><AppealDetail /></PrivateRoute>} />
              <Route path="billing" element={<PrivateRoute><Billing /></PrivateRoute>} />
              <Route path="profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            </Route>

            {/* Fallback routes */}
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
          <Notification />
        </AuthProvider>
      </ThemeProvider>
    </Provider>
  );
}

export default App;