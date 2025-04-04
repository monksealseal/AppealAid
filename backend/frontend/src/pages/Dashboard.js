/**
 * Dashboard Page
 * 
 * Main dashboard for the application
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  CardActionArea,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  ErrorOutline as ErrorOutlineIcon,
  HourglassEmpty as HourglassEmptyIcon,
  Notifications as NotificationsIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';

// Mock appeal data
const mockAppeals = [
  {
    _id: '60d21b4667d0d8992e610c85',
    appealId: 'AP001',
    claimId: 'CL12345',
    patientName: 'John Doe',
    serviceName: 'Post-Stroke Rehabilitation',
    status: 'denied',
    insuranceCompany: 'UnitedHealthcare',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-02-15')
  },
  {
    _id: '60d21b4667d0d8992e610c86',
    appealId: 'AP002',
    claimId: 'CL67890',
    patientName: 'Jane Smith',
    serviceName: 'MRI - Lumbar Spine',
    status: 'pending',
    insuranceCompany: 'Blue Cross Blue Shield',
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-02-05')
  }
];

// Mock notifications
const mockNotifications = [
  {
    id: 1,
    message: 'Provider submitted documentation for appeal AP001',
    date: new Date('2024-02-15T09:30:00'),
    type: 'info'
  },
  {
    id: 2,
    message: 'Appeal deadline approaching for AP002 - Due in 3 days',
    date: new Date('2024-02-16T14:15:00'),
    type: 'warning'
  }
];

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [appeals, setAppeals] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    denied: 0,
    pending: 0
  });

  useEffect(() => {
    // Simulate API loading delay
    const timer = setTimeout(() => {
      setAppeals(mockAppeals);
      setNotifications(mockNotifications);
      setStats({
        total: mockAppeals.length,
        approved: mockAppeals.filter(a => a.status === 'approved').length,
        denied: mockAppeals.filter(a => a.status === 'denied').length,
        pending: mockAppeals.filter(a => a.status === 'pending').length
      });
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Dashboard</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          component={Link}
          to="/appeals/create"
        >
          New Appeal
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
            <Typography variant="h4" color="primary">{stats.total}</Typography>
            <Typography variant="body1">Total Appeals</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', height: '100%', bgcolor: '#e8f5e9' }}>
            <Typography variant="h4" color="success.main">{stats.approved}</Typography>
            <Typography variant="body1">Approved</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', height: '100%', bgcolor: '#ffebee' }}>
            <Typography variant="h4" color="error.main">{stats.denied}</Typography>
            <Typography variant="body1">Denied</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', height: '100%', bgcolor: '#fff8e1' }}>
            <Typography variant="h4" color="warning.main">{stats.pending}</Typography>
            <Typography variant="body1">Pending</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Main Dashboard Content */}
      <Grid container spacing={3}>
        {/* Recent Appeals */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Recent Appeals</Typography>
              <Button
                component={Link}
                to="/appeals"
                endIcon={<ArrowForwardIcon />}
              >
                View All
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            {appeals.length > 0 ? (
              <List>
                {appeals.map((appeal) => (
                  <ListItem
                    key={appeal._id}
                    button
                    component={Link}
                    to={`/appeals/${appeal._id}`}
                    divider
                  >
                    <ListItemIcon>
                      {appeal.status === 'approved' && <CheckCircleIcon color="success" />}
                      {appeal.status === 'denied' && <ErrorOutlineIcon color="error" />}
                      {appeal.status === 'pending' && <HourglassEmptyIcon color="warning" />}
                      {!appeal.status && <AssignmentIcon color="primary" />}
                    </ListItemIcon>
                    <ListItemText
                      primary={appeal.serviceName}
                      secondary={`${appeal.patientName} | ${appeal.insuranceCompany} | Last updated: ${new Date(appeal.updatedAt).toLocaleDateString()}`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Alert severity="info">
                No appeals found. Create a new appeal to get started.
              </Alert>
            )}
          </Paper>
        </Grid>

        {/* Notifications */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <NotificationsIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Notifications</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            {notifications.length > 0 ? (
              <List>
                {notifications.map((notification) => (
                  <ListItem key={notification.id} divider>
                    <ListItemText
                      primary={notification.message}
                      secondary={`${new Date(notification.date).toLocaleString()}`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Alert severity="info">
                No new notifications.
              </Alert>
            )}
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Typography variant="h6" sx={{ mb: 2 }}>Quick Actions</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardActionArea component={Link} to="/appeals/create">
                  <CardContent sx={{ textAlign: 'center' }}>
                    <AddIcon color="primary" sx={{ fontSize: 48, mb: 1 }} />
                    <Typography variant="h6">New Appeal</Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardActionArea component={Link} to="/appeals">
                  <CardContent sx={{ textAlign: 'center' }}>
                    <AssignmentIcon color="primary" sx={{ fontSize: 48, mb: 1 }} />
                    <Typography variant="h6">Manage Appeals</Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardActionArea onClick={() => alert('Feature coming soon')}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <ArrowForwardIcon color="primary" sx={{ fontSize: 48, mb: 1 }} />
                    <Typography variant="h6">View Demo Appeals</Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardActionArea component={Link} to="/provider/document-upload/YWJjMTIz">
                  <CardContent sx={{ textAlign: 'center' }}>
                    <AssignmentIcon color="secondary" sx={{ fontSize: 48, mb: 1 }} />
                    <Typography variant="h6">Provider Portal Demo</Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;