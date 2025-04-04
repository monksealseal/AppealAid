import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Grid,
  Paper,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  Box,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
} from '@mui/material';
import { 
  Assessment as ChartIcon,
  CloudUpload as UploadIcon,
  Description as DocumentIcon,
  GavelRounded as AppealIcon,
  Psychology as AIIcon,
  DateRange as TrackingIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

// Import Deadline Notifications component
import DeadlineNotifications from '../components/appeals/DeadlineNotifications';

// Simulated data - would be fetched from API in real implementation
const getStatistics = () => ({
  totalDocuments: 12,
  pendingDocuments: 3,
  totalAppeals: 8,
  pendingAppeals: 2,
  successfulAppeals: 5,
  urgentActions: 3,
});

const getRecentActivity = () => [
  { id: 1, type: 'document', title: 'EOB - UnitedHealthcare', date: '2023-05-15T10:30:00Z', status: 'Processed' },
  { id: 2, type: 'appeal', title: 'Appeal for Claim #12345', date: '2023-05-14T16:45:00Z', status: 'Pending' },
  { id: 3, type: 'document', title: 'Medical Record - Dr. Smith', date: '2023-05-13T09:15:00Z', status: 'Processed' },
  { id: 4, type: 'appeal', title: 'Appeal for Claim #67890', date: '2023-05-10T14:20:00Z', status: 'Submitted' },
];

const statusColors = {
  Pending: 'warning.main',
  Processed: 'success.main',
  Submitted: 'info.main',
  Approved: 'success.main',
  Denied: 'error.main',
};

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const Dashboard = () => {
  const { user } = useAuth();
  const [statistics, setStatistics] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  // Simulate API calls
  useEffect(() => {
    // This would be actual API calls in production
    const fetchDashboardData = async () => {
      try {
        // Simulate API delay
        await new Promise(r => setTimeout(r, 500));
        
        setStatistics(getStatistics());
        setRecentActivity(getRecentActivity());
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {/* Welcome Section */}
      <Grid item xs={12}>
        <Paper 
          sx={{ 
            p: 3, 
            display: 'flex', 
            flexDirection: 'column',
            background: 'linear-gradient(to right, #2D7DD2, #97CC04)',
            color: 'white'
          }}
        >
          <Typography variant="h4" gutterBottom>
            Welcome back, {user?.firstName || 'User'}!
          </Typography>
          <Typography variant="body1">
            Here's an overview of your appeals and documents.
          </Typography>
        </Paper>
      </Grid>
      
      {/* Deadline Notifications */}
      <Grid item xs={12}>
        <DeadlineNotifications />
      </Grid>

      {/* Stats Cards */}
      <Grid item xs={12} md={6} lg={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Total Documents
            </Typography>
            <Typography variant="h3" component="div">
              {statistics?.totalDocuments || 0}
            </Typography>
            <Typography color="textSecondary">
              {statistics?.pendingDocuments || 0} pending
            </Typography>
          </CardContent>
          <CardActions>
            <Button 
              size="small" 
              component={RouterLink} 
              to="/documents"
              startIcon={<DocumentIcon />}
            >
              View All
            </Button>
          </CardActions>
        </Card>
      </Grid>

      <Grid item xs={12} md={6} lg={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Total Appeals
            </Typography>
            <Typography variant="h3" component="div">
              {statistics?.totalAppeals || 0}
            </Typography>
            <Typography color="textSecondary">
              {statistics?.pendingAppeals || 0} pending
            </Typography>
          </CardContent>
          <CardActions>
            <Button 
              size="small" 
              component={RouterLink} 
              to="/appeals"
              startIcon={<AppealIcon />}
            >
              View All
            </Button>
          </CardActions>
        </Card>
      </Grid>

      <Grid item xs={12} md={6} lg={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Success Rate
            </Typography>
            <Typography variant="h3" component="div">
              {statistics?.totalAppeals ? 
                Math.round((statistics.successfulAppeals / statistics.totalAppeals) * 100) : 0}%
            </Typography>
            <Typography color="textSecondary">
              {statistics?.successfulAppeals || 0} successful appeals
            </Typography>
          </CardContent>
          <CardActions>
            <Button 
              size="small" 
              component={RouterLink} 
              to="/appeals"
              startIcon={<ChartIcon />}
            >
              View Stats
            </Button>
          </CardActions>
        </Card>
      </Grid>

      <Grid item xs={12} md={6} lg={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
              <Button 
                variant="contained" 
                color="primary" 
                component={RouterLink} 
                to="/documents/upload"
                startIcon={<UploadIcon />}
                fullWidth
              >
                Upload Document
              </Button>
              <Button 
                variant="outlined" 
                color="primary" 
                component={RouterLink} 
                to="/appeals/new"
                startIcon={<AppealIcon />}
                fullWidth
              >
                Start New Appeal
              </Button>
              <Button 
                variant="outlined" 
                color="primary" 
                component={RouterLink} 
                to="/appeals/tracking"
                startIcon={<TrackingIcon />}
                fullWidth
              >
                Appeal Tracking
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Recent Activity */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Recent Activity
          </Typography>
          <List>
            {recentActivity.map((activity, index) => (
              <React.Fragment key={activity.id}>
                <ListItem 
                  button 
                  component={RouterLink} 
                  to={`/${activity.type}s/${activity.id}`}
                >
                  <ListItemText 
                    primary={activity.title} 
                    secondary={formatDate(activity.date)}
                  />
                  <Box 
                    component="span" 
                    sx={{ 
                      color: statusColors[activity.status] || 'text.primary',
                      fontWeight: 'medium',
                      ml: 2
                    }}
                  >
                    {activity.status}
                  </Box>
                </ListItem>
                {index < recentActivity.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
          {recentActivity.length === 0 && (
            <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 2 }}>
              No recent activity to show
            </Typography>
          )}
        </Paper>
      </Grid>
      
      {/* Get Started Card */}
      <Grid item xs={12} md={6}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Appeal Follow-up & Tracking
            </Typography>
            <Typography variant="body2" paragraph>
              Stay on top of your appeal deadlines and follow-up tasks with our new tracking dashboard.
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="error">
                {statistics?.urgentActions || 0} urgent actions require your attention
              </Typography>
            </Box>
            <List dense>
              <ListItem sx={{ px: 0 }}>
                <ListItemText 
                  primary="Track appeal deadlines" 
                  secondary="Never miss important deadlines with automated reminders"
                />
              </ListItem>
              <ListItem sx={{ px: 0 }}>
                <ListItemText 
                  primary="Schedule follow-ups" 
                  secondary="System automatically creates recommended follow-up schedules"
                />
              </ListItem>
              <ListItem sx={{ px: 0 }}>
                <ListItemText 
                  primary="Prioritize appeals" 
                  secondary="Focus on high-value, time-sensitive appeals first"
                />
              </ListItem>
            </List>
          </CardContent>
          <CardActions>
            <Button 
              variant="contained" 
              color="primary" 
              component={RouterLink} 
              to="/appeals/tracking"
              startIcon={<TrackingIcon />}
              fullWidth
            >
              Go to Appeal Tracking
            </Button>
          </CardActions>
        </Card>
      </Grid>
    </Grid>
  );
};

export default Dashboard;