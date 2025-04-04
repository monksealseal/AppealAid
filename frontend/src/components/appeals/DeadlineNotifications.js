import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Chip,
  Button,
  Divider,
  CircularProgress,
  Collapse,
  Alert,
  Tooltip
} from '@mui/material';
import {
  NotificationsActive as NotificationIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  ErrorOutline as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CheckCircleOutline as CheckIcon,
  HighlightOff as DismissIcon,
  CalendarToday as CalendarIcon,
  Send as SendIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Laptop as ElectronicIcon,
  Fax as FaxIcon,
  Sort as SortIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Styled component for expandable section
const ExpandButton = styled(IconButton)(({ theme }) => ({
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));

// Mock API call to fetch notifications
const fetchNotifications = async () => {
  // Simulate API delay
  await new Promise(r => setTimeout(r, 600));
  
  // Today's date
  const today = new Date();
  
  return [
    {
      id: 'n1',
      type: 'deadline',
      appealId: 'a005',
      appealTitle: 'Appeal for Prescription Denial - Humana',
      message: 'Appeal deadline approaching in 2 days',
      date: new Date(today.getTime() + 2 * 86400000), // 2 days from now
      priority: 'high',
      status: 'active',
      actions: [
        { 
          label: 'View Appeal', 
          link: '/appeals/a005'
        },
        { 
          label: 'Extend Deadline', 
          link: '/appeals/a005/deadline'
        }
      ]
    },
    {
      id: 'n2',
      type: 'followup',
      appealId: 'a004',
      appealTitle: 'Appeal for ER Visit - Cigna',
      message: 'Initial inquiry follow-up due tomorrow',
      date: new Date(today.getTime() + 1 * 86400000), // 1 day from now
      priority: 'medium',
      status: 'active',
      method: 'phone',
      actions: [
        { 
          label: 'View Appeal', 
          link: '/appeals/a004'
        },
        { 
          label: 'Mark Complete', 
          link: '/appeals/tracking'
        }
      ]
    },
    {
      id: 'n3',
      type: 'followup',
      appealId: 'a003',
      appealTitle: 'Appeal for Denied Surgery Pre-Auth - UHC',
      message: 'Escalation follow-up is overdue by 2 days',
      date: new Date(today.getTime() - 2 * 86400000), // 2 days ago
      priority: 'urgent',
      status: 'active',
      method: 'fax',
      actions: [
        { 
          label: 'View Appeal', 
          link: '/appeals/a003'
        },
        { 
          label: 'Mark Complete', 
          link: '/appeals/tracking'
        }
      ]
    },
    {
      id: 'n4',
      type: 'deadline',
      appealId: 'a003',
      appealTitle: 'Appeal for Denied Surgery Pre-Auth - UHC',
      message: 'Appeal deadline has passed. Consider requesting an extension',
      date: new Date(today.getTime() - 5 * 86400000), // 5 days ago
      priority: 'urgent',
      status: 'active',
      actions: [
        { 
          label: 'View Appeal', 
          link: '/appeals/a003'
        }
      ]
    },
    {
      id: 'n5',
      type: 'followup',
      appealId: 'a005',
      appealTitle: 'Appeal for Prescription Denial - Humana',
      message: 'Status check follow-up due today',
      date: today,
      priority: 'high',
      status: 'active',
      method: 'phone',
      actions: [
        { 
          label: 'View Appeal', 
          link: '/appeals/a005'
        },
        { 
          label: 'Mark Complete', 
          link: '/appeals/tracking'
        }
      ]
    }
  ];
};

// Helper function to format date
const formatDate = (date) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(date).toLocaleDateString(undefined, options);
};

// Helper function to get days until/since date
const getDaysText = (date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);
  
  const diffTime = targetDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays > 0) {
    return `In ${diffDays} ${diffDays === 1 ? 'day' : 'days'}`;
  } else {
    return `${Math.abs(diffDays)} ${Math.abs(diffDays) === 1 ? 'day' : 'days'} ago`;
  }
};

// Helper function to get notification icon
const getNotificationIcon = (notification) => {
  // By type
  if (notification.type === 'deadline') {
    if (new Date(notification.date) < new Date()) {
      return <ErrorIcon color="error" />;
    } else {
      return <CalendarIcon color="warning" />;
    }
  } else if (notification.type === 'followup') {
    // By method
    switch (notification.method) {
      case 'phone':
        return <PhoneIcon color="info" />;
      case 'email':
        return <EmailIcon color="info" />;
      case 'electronic':
        return <ElectronicIcon color="info" />;
      case 'fax':
        return <FaxIcon color="info" />;
      default:
        return <SendIcon color="info" />;
    }
  }
  
  // By priority
  switch (notification.priority) {
    case 'urgent':
      return <ErrorIcon color="error" />;
    case 'high':
      return <WarningIcon color="warning" />;
    case 'medium':
      return <InfoIcon color="info" />;
    case 'low':
      return <CheckIcon color="success" />;
    default:
      return <InfoIcon color="info" />;
  }
};

// Helper function to get notification color
const getNotificationColor = (notification) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const notificationDate = new Date(notification.date);
  notificationDate.setHours(0, 0, 0, 0);
  
  // If date is in the past
  if (notificationDate < today) {
    return 'error';
  }
  
  // If date is today
  if (notificationDate.getTime() === today.getTime()) {
    return 'warning';
  }
  
  // If priority is urgent
  if (notification.priority === 'urgent') {
    return 'error';
  }
  
  // If priority is high
  if (notification.priority === 'high') {
    return 'warning';
  }
  
  return 'info';
};

const DeadlineNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  // Fetch notifications
  useEffect(() => {
    const getNotifications = async () => {
      try {
        setLoading(true);
        const data = await fetchNotifications();
        
        // Sort notifications by date (soonest/most overdue first)
        const sortedData = data.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        setNotifications(sortedData);
      } catch (err) {
        setError('Failed to load notifications');
        console.error('Error fetching notifications:', err);
      } finally {
        setLoading(false);
      }
    };
    
    getNotifications();
  }, []);

  // Toggle expanded state
  const handleExpandToggle = () => {
    setExpanded(!expanded);
  };

  // Dismiss a notification
  const handleDismiss = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'deadline') return notification.type === 'deadline';
    if (activeFilter === 'followup') return notification.type === 'followup';
    if (activeFilter === 'urgent') return notification.priority === 'urgent';
    if (activeFilter === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const notificationDate = new Date(notification.date);
      notificationDate.setHours(0, 0, 0, 0);
      return notificationDate.getTime() === today.getTime();
    }
    return true;
  });

  // Get notification count by priority
  const urgentCount = notifications.filter(n => 
    n.priority === 'urgent' || 
    new Date(n.date) < new Date()
  ).length;
  
  const todayCount = notifications.filter(n => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const notificationDate = new Date(n.date);
    notificationDate.setHours(0, 0, 0, 0);
    return notificationDate.getTime() === today.getTime();
  }).length;

  return (
    <Paper>
      {/* Header */}
      <Box 
        sx={{ 
          p: 2, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          bgcolor: 'primary.main',
          color: 'primary.contrastText'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <NotificationIcon sx={{ mr: 1 }} />
          <Typography variant="h6">
            Deadline Alerts
          </Typography>
          {urgentCount > 0 && (
            <Chip 
              label={`${urgentCount} Urgent`} 
              color="error" 
              size="small" 
              sx={{ ml: 1 }}
            />
          )}
          {todayCount > 0 && (
            <Chip 
              label={`${todayCount} Today`} 
              color="warning" 
              size="small" 
              sx={{ ml: 1 }}
            />
          )}
        </Box>
        <ExpandButton
          onClick={handleExpandToggle}
          sx={{
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            color: 'primary.contrastText'
          }}
        >
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </ExpandButton>
      </Box>
      
      <Collapse in={expanded}>
        {/* Filter buttons */}
        <Box sx={{ p: 1, display: 'flex', justifyContent: 'space-between', bgcolor: 'background.paper' }}>
          <Box sx={{ display: 'flex', overflowX: 'auto', gap: 1, pb: 0.5 }}>
            <Chip 
              label="All" 
              onClick={() => setActiveFilter('all')}
              color={activeFilter === 'all' ? 'primary' : 'default'}
            />
            <Chip 
              label="Deadlines" 
              onClick={() => setActiveFilter('deadline')}
              color={activeFilter === 'deadline' ? 'primary' : 'default'}
            />
            <Chip 
              label="Follow-ups" 
              onClick={() => setActiveFilter('followup')}
              color={activeFilter === 'followup' ? 'primary' : 'default'}
            />
            <Chip 
              label="Urgent" 
              onClick={() => setActiveFilter('urgent')}
              color={activeFilter === 'urgent' ? 'primary' : 'default'}
            />
            <Chip 
              label="Today" 
              onClick={() => setActiveFilter('today')}
              color={activeFilter === 'today' ? 'primary' : 'default'}
            />
          </Box>
          
          <RouterLink to="/appeals/tracking" style={{ textDecoration: 'none' }}>
            <Button size="small" variant="outlined">
              View All
            </Button>
          </RouterLink>
        </Box>
        
        <Divider />
        
        {/* Notifications list */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        ) : filteredNotifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No notifications to display
            </Typography>
          </Box>
        ) : (
          <List sx={{ maxHeight: '400px', overflow: 'auto' }}>
            {filteredNotifications.map((notification) => (
              <React.Fragment key={notification.id}>
                <ListItem 
                  sx={{ 
                    py: 2, 
                    borderLeft: `4px solid ${
                      getNotificationColor(notification) === 'error' ? '#f44336' : 
                      getNotificationColor(notification) === 'warning' ? '#ed6c02' : 
                      '#0288d1'
                    }`
                  }}
                >
                  <ListItemIcon>
                    {getNotificationIcon(notification)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                        <Typography variant="body1" component="span" fontWeight="medium">
                          {notification.message}
                        </Typography>
                        <Chip
                          label={getDaysText(notification.date)}
                          color={getNotificationColor(notification)}
                          size="small"
                        />
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          {notification.appealTitle}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                          {notification.actions.map((action, index) => (
                            <Button
                              key={index}
                              component={RouterLink}
                              to={action.link}
                              size="small"
                              variant={index === 0 ? "contained" : "outlined"}
                            >
                              {action.label}
                            </Button>
                          ))}
                        </Box>
                      </Box>
                    }
                  />
                  <Tooltip title="Dismiss">
                    <IconButton 
                      edge="end" 
                      onClick={() => handleDismiss(notification.id)}
                      sx={{ ml: 1 }}
                    >
                      <DismissIcon />
                    </IconButton>
                  </Tooltip>
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        )}
      </Collapse>
      
      {/* Collapsed preview */}
      {!expanded && !loading && notifications.length > 0 && (
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {notifications.length} active {notifications.length === 1 ? 'notification' : 'notifications'}
            {urgentCount > 0 && ` (${urgentCount} urgent)`}
          </Typography>
          <Button 
            size="small" 
            component={RouterLink} 
            to="/appeals/tracking"
          >
            View All
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default DeadlineNotifications;