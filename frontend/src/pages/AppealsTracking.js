import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Tabs,
  Tab,
  Chip,
  Divider,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  TextField,
  MenuItem,
  IconButton,
  Tooltip,
  Breadcrumbs
} from '@mui/material';
import {
  NavigateNext as NavigateNextIcon,
  AssignmentLate as UrgentIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CompleteIcon,
  HighlightOff as OverdueIcon,
  NotificationsActive as AlertIcon,
  Schedule as ScheduleIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  AttachMoney as MoneyIcon,
  Assessment as StatsIcon,
  NotificationImportant as DeadlineIcon,
  PriorityHigh as PriorityHighIcon,
  Flag as FlagIcon
} from '@mui/icons-material';

import FollowUpTracker from '../components/appeals/FollowUpTracker';

// Format date helper
const formatDate = (dateString) => {
  if (!dateString) return '—';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Get days remaining helper
const getDaysRemaining = (deadlineDate) => {
  if (!deadlineDate) return null;
  
  const today = new Date();
  const deadline = new Date(deadlineDate);
  const diffTime = deadline - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

// Mock data - would be fetched from API in real implementation
const fetchAppeals = async () => {
  // Simulate API delay
  await new Promise(r => setTimeout(r, 800));
  
  // Today's date as starting point
  const today = new Date();
  
  return [
    {
      id: 'a001',
      title: 'Appeal for MRI Denial - BCBS',
      insuranceCarrier: 'Blue Cross Blue Shield',
      claimNumber: 'BCBS-2023-078945',
      status: 'submitted',
      submittedDate: new Date(today.getTime() - 20 * 86400000), // 20 days ago
      denialReason: 'Not Medically Necessary',
      deniedAmount: 875.50,
      appealDeadline: new Date(today.getTime() + 15 * 86400000), // 15 days from now
      priority: 'medium',
      deadlineStatus: 'upcoming',
      followUpStatus: {
        nextFollowUpDate: new Date(today.getTime() + 3 * 86400000), // 3 days from now
        followUpType: 'status_check',
        followUpMethod: 'phone',
        totalFollowUps: 4,
        completedFollowUps: 1
      }
    },
    {
      id: 'a002',
      title: 'Appeal for Out-of-Network PT - Aetna',
      insuranceCarrier: 'Aetna',
      claimNumber: 'AET-2023-123456',
      status: 'submitted',
      submittedDate: new Date(today.getTime() - 7 * 86400000), // 7 days ago
      denialReason: 'Out of Network',
      deniedAmount: 2340.00,
      appealDeadline: new Date(today.getTime() + 45 * 86400000), // 45 days from now
      priority: 'high',
      deadlineStatus: 'upcoming',
      followUpStatus: {
        nextFollowUpDate: new Date(today.getTime() + 7 * 86400000), // 7 days from now
        followUpType: 'initial_inquiry',
        followUpMethod: 'electronic',
        totalFollowUps: 4,
        completedFollowUps: 0
      }
    },
    {
      id: 'a003',
      title: 'Appeal for Denied Surgery Pre-Auth - UHC',
      insuranceCarrier: 'UnitedHealthcare',
      claimNumber: 'UHC-2023-987654',
      status: 'submitted',
      submittedDate: new Date(today.getTime() - 40 * 86400000), // 40 days ago
      denialReason: 'Prior Authorization Required',
      deniedAmount: 12450.75,
      appealDeadline: new Date(today.getTime() - 5 * 86400000), // 5 days ago (overdue)
      priority: 'urgent',
      deadlineStatus: 'overdue',
      followUpStatus: {
        nextFollowUpDate: new Date(today.getTime() - 2 * 86400000), // 2 days ago (overdue)
        followUpType: 'escalation',
        followUpMethod: 'fax',
        totalFollowUps: 4,
        completedFollowUps: 2
      }
    },
    {
      id: 'a004',
      title: 'Appeal for ER Visit - Cigna',
      insuranceCarrier: 'Cigna',
      claimNumber: 'CIG-2023-456789',
      status: 'submitted',
      submittedDate: new Date(today.getTime() - 14 * 86400000), // 14 days ago
      denialReason: 'Not Medically Necessary',
      deniedAmount: 3750.25,
      appealDeadline: new Date(today.getTime() + 30 * 86400000), // 30 days from now
      priority: 'medium',
      deadlineStatus: 'upcoming',
      followUpStatus: {
        nextFollowUpDate: new Date(today.getTime() + 1 * 86400000), // 1 day from now
        followUpType: 'initial_inquiry',
        followUpMethod: 'phone',
        totalFollowUps: 4,
        completedFollowUps: 1
      }
    },
    {
      id: 'a005',
      title: 'Appeal for Prescription Denial - Humana',
      insuranceCarrier: 'Humana',
      claimNumber: 'HUM-2023-234567',
      status: 'submitted',
      submittedDate: new Date(today.getTime() - 30 * 86400000), // 30 days ago
      denialReason: 'Not Covered',
      deniedAmount: 540.80,
      appealDeadline: new Date(today.getTime() + 2 * 86400000), // 2 days from now (urgent)
      priority: 'medium',
      deadlineStatus: 'urgent',
      followUpStatus: {
        nextFollowUpDate: new Date(today.getTime() + 0 * 86400000), // today
        followUpType: 'status_check',
        followUpMethod: 'phone',
        totalFollowUps: 4,
        completedFollowUps: 2
      }
    }
  ];
};

// Function to get status color
const getStatusColor = (status) => {
  switch (status) {
    case 'draft':
      return 'default';
    case 'pending':
    case 'generated':
      return 'info';
    case 'submitted':
      return 'primary';
    case 'approved':
      return 'success';
    case 'denied':
      return 'error';
    default:
      return 'default';
  }
};

// Function to get deadline status color
const getDeadlineStatusColor = (status) => {
  switch (status) {
    case 'overdue':
      return 'error';
    case 'urgent':
      return 'warning';
    case 'upcoming':
      return 'info';
    case 'complete':
      return 'success';
    default:
      return 'default';
  }
};

// Function to get priority icon and color
const getPriorityIcon = (priority) => {
  switch (priority) {
    case 'urgent':
      return { icon: <PriorityHighIcon />, color: 'error' };
    case 'high':
      return { icon: <FlagIcon />, color: 'warning' };
    case 'medium':
      return { icon: <FlagIcon />, color: 'info' };
    case 'low':
      return { icon: <FlagIcon />, color: 'success' };
    default:
      return { icon: <FlagIcon />, color: 'default' };
  }
};

// Function to get follow up type display
const getFollowUpTypeDisplay = (type) => {
  switch (type) {
    case 'initial_inquiry':
      return 'Initial Inquiry';
    case 'status_check':
      return 'Status Check';
    case 'escalation':
      return 'Escalation';
    case 'final_notice':
      return 'Final Notice';
    default:
      return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
};

const AppealsTracking = () => {
  const [appeals, setAppeals] = useState([]);
  const [filteredAppeals, setFilteredAppeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedAppealId, setSelectedAppealId] = useState(null);
  const [sortOption, setSortOption] = useState('deadline');
  const [filterOption, setFilterOption] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch appeals data
  useEffect(() => {
    const loadAppeals = async () => {
      try {
        setLoading(true);
        const data = await fetchAppeals();
        setAppeals(data);
        setFilteredAppeals(data);
      } catch (err) {
        setError('Error loading appeals data. Please try again.');
        console.error('Error fetching appeals:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAppeals();
  }, []);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setSelectedAppealId(null);
  };

  // Handle appeal selection
  const handleAppealSelect = (appealId) => {
    setSelectedAppealId(appealId);
  };

  // Handle sort and filter
  useEffect(() => {
    if (!appeals.length) return;
    
    let filtered = [...appeals];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(appeal => 
        appeal.title.toLowerCase().includes(term) ||
        appeal.insuranceCarrier.toLowerCase().includes(term) ||
        appeal.claimNumber.toLowerCase().includes(term)
      );
    }
    
    // Apply category filter
    if (filterOption !== 'all') {
      switch (filterOption) {
        case 'urgent':
          filtered = filtered.filter(appeal => appeal.deadlineStatus === 'urgent' || appeal.deadlineStatus === 'overdue');
          break;
        case 'overdue':
          filtered = filtered.filter(appeal => appeal.deadlineStatus === 'overdue');
          break;
        case 'upcoming':
          filtered = filtered.filter(appeal => appeal.deadlineStatus === 'upcoming');
          break;
        case 'highvalue':
          filtered = filtered.filter(appeal => appeal.deniedAmount > 1000);
          break;
        default:
          break;
      }
    }
    
    // Apply sort
    filtered.sort((a, b) => {
      switch (sortOption) {
        case 'deadline':
          return new Date(a.appealDeadline) - new Date(b.appealDeadline);
        case 'submission':
          return new Date(b.submittedDate) - new Date(a.submittedDate);
        case 'value':
          return b.deniedAmount - a.deniedAmount;
        case 'followup':
          return new Date(a.followUpStatus.nextFollowUpDate) - new Date(b.followUpStatus.nextFollowUpDate);
        default:
          return new Date(a.appealDeadline) - new Date(b.appealDeadline);
      }
    });
    
    setFilteredAppeals(filtered);
  }, [appeals, sortOption, filterOption, searchTerm]);

  // Calculate summary metrics
  const totalAppeals = appeals.length;
  const overdueFollowUps = appeals.filter(a => 
    a.followUpStatus.nextFollowUpDate && new Date(a.followUpStatus.nextFollowUpDate) < new Date()
  ).length;
  const urgentAppeals = appeals.filter(a => a.deadlineStatus === 'urgent' || a.deadlineStatus === 'overdue').length;
  const totalDeniedAmount = appeals.reduce((sum, appeal) => sum + appeal.deniedAmount, 0);
  const upcomingFollowUps = appeals.filter(a => {
    const followUpDate = new Date(a.followUpStatus.nextFollowUpDate);
    const today = new Date();
    const diffDays = Math.ceil((followUpDate - today) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 3;
  }).length;

  // Get selected appeal data
  const selectedAppeal = appeals.find(a => a.id === selectedAppealId);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div>
      {/* Breadcrumbs */}
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 2 }}>
        <RouterLink to="/" style={{ color: 'inherit', textDecoration: 'none' }}>
          Dashboard
        </RouterLink>
        <RouterLink to="/appeals" style={{ color: 'inherit', textDecoration: 'none' }}>
          Appeals
        </RouterLink>
        <Typography color="text.primary">Appeal Tracking</Typography>
      </Breadcrumbs>
      
      {/* Page Title */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Appeal Tracking Dashboard
        </Typography>
      </Box>
      
      {/* Error message if any */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <AlertIcon color="warning" sx={{ mr: 1 }} />
              <Typography variant="h6" component="h2">
                Urgent Appeals
              </Typography>
            </Box>
            <Typography variant="h3" component="p" sx={{ mb: 1 }}>
              {urgentAppeals}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {urgentAppeals === 1 ? 'appeal requires' : 'appeals require'} immediate attention
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <ScheduleIcon color="info" sx={{ mr: 1 }} />
              <Typography variant="h6" component="h2">
                Follow-ups
              </Typography>
            </Box>
            <Typography variant="h3" component="p" sx={{ mb: 1 }}>
              {upcomingFollowUps}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              upcoming in the next 3 days
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <OverdueIcon color="error" sx={{ mr: 1 }} />
              <Typography variant="h6" component="h2">
                Overdue
              </Typography>
            </Box>
            <Typography variant="h3" component="p" sx={{ mb: 1 }}>
              {overdueFollowUps}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              follow-ups past their deadline
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <MoneyIcon color="success" sx={{ mr: 1 }} />
              <Typography variant="h6" component="h2">
                Total Value
              </Typography>
            </Box>
            <Typography variant="h3" component="p" sx={{ mb: 1 }}>
              ${totalDeniedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              in denied claims being appealed
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Main content */}
      <Grid container spacing={3}>
        {/* Left side: Appeals List */}
        <Grid item xs={12} md={selectedAppealId ? 5 : 12}>
          <Paper sx={{ mb: 3 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant="fullWidth"
            >
              <Tab label="All Appeals" />
              <Tab label="Needs Follow-up" />
              <Tab label="Urgent" />
            </Tabs>
            
            {/* Search and filters */}
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <TextField
                placeholder="Search appeals..."
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
                }}
                sx={{ flexGrow: 1, minWidth: '200px' }}
              />
              
              <TextField
                select
                label="Filter"
                value={filterOption}
                onChange={(e) => setFilterOption(e.target.value)}
                size="small"
                sx={{ minWidth: '120px' }}
                InputProps={{
                  startAdornment: <FilterIcon color="action" sx={{ mr: 1 }} />
                }}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="urgent">Urgent</MenuItem>
                <MenuItem value="overdue">Overdue</MenuItem>
                <MenuItem value="upcoming">Upcoming</MenuItem>
                <MenuItem value="highvalue">High Value</MenuItem>
              </TextField>
              
              <TextField
                select
                label="Sort by"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                size="small"
                sx={{ minWidth: '150px' }}
                InputProps={{
                  startAdornment: <SortIcon color="action" sx={{ mr: 1 }} />
                }}
              >
                <MenuItem value="deadline">Deadline (soonest)</MenuItem>
                <MenuItem value="submission">Submission (newest)</MenuItem>
                <MenuItem value="value">Value (highest)</MenuItem>
                <MenuItem value="followup">Follow-up (soonest)</MenuItem>
              </TextField>
            </Box>
            
            <Divider />
            
            {/* Appeals Table */}
            {filteredAppeals.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  No appeals match your search criteria.
                </Typography>
              </Box>
            ) : (
              <TableContainer sx={{ maxHeight: selectedAppealId ? '60vh' : '70vh' }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell width="40%">Appeal</TableCell>
                      <TableCell>Insurer</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Deadline</TableCell>
                      <TableCell>Next Follow-up</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredAppeals.map((appeal) => {
                      const daysUntilDeadline = getDaysRemaining(appeal.appealDeadline);
                      const daysUntilFollowUp = getDaysRemaining(appeal.followUpStatus.nextFollowUpDate);
                      const priorityInfo = getPriorityIcon(appeal.priority);
                      
                      return (
                        <TableRow 
                          key={appeal.id}
                          sx={{ 
                            cursor: 'pointer',
                            backgroundColor: selectedAppealId === appeal.id ? 'rgba(25, 118, 210, 0.08)' : 'inherit',
                            '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
                          }}
                          onClick={() => handleAppealSelect(appeal.id)}
                        >
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                              <Tooltip title={`${appeal.priority.charAt(0).toUpperCase() + appeal.priority.slice(1)} Priority`}>
                                <Box sx={{ color: `${priorityInfo.color}.main`, mt: 0.5 }}>
                                  {priorityInfo.icon}
                                </Box>
                              </Tooltip>
                              <Box>
                                <Typography variant="body2" fontWeight="medium">
                                  {appeal.title}
                                </Typography>
                                <Typography variant="caption" display="block" color="text.secondary">
                                  Claim: {appeal.claimNumber}
                                </Typography>
                                <Chip 
                                  label={appeal.status.charAt(0).toUpperCase() + appeal.status.slice(1)} 
                                  color={getStatusColor(appeal.status)} 
                                  size="small"
                                  sx={{ mt: 0.5 }}
                                />
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>{appeal.insuranceCarrier}</TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              ${appeal.deniedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Typography variant="body2">
                                {formatDate(appeal.appealDeadline)}
                              </Typography>
                              <Chip
                                label={daysUntilDeadline < 0 ? 'Overdue' : 
                                      daysUntilDeadline === 0 ? 'Today' : 
                                      `${daysUntilDeadline} days`}
                                color={daysUntilDeadline < 0 ? 'error' : 
                                       daysUntilDeadline <= 3 ? 'warning' : 'info'}
                                size="small"
                                sx={{ mt: 0.5 }}
                              />
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Typography variant="body2">
                                {getFollowUpTypeDisplay(appeal.followUpStatus.followUpType)}
                              </Typography>
                              <Chip
                                label={daysUntilFollowUp < 0 ? 'Overdue' : 
                                      daysUntilFollowUp === 0 ? 'Today' : 
                                      `${daysUntilFollowUp} days`}
                                color={daysUntilFollowUp < 0 ? 'error' : 
                                       daysUntilFollowUp <= 1 ? 'warning' : 'info'}
                                size="small"
                                sx={{ mt: 0.5 }}
                              />
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outlined"
                              size="small"
                              component={RouterLink}
                              to={`/appeals/${appeal.id}`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              View Appeal
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
          
          {!selectedAppealId && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h5" component="h2" gutterBottom>
                How to Use This Dashboard
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon><UrgentIcon color="warning" /></ListItemIcon>
                  <ListItemText 
                    primary="Monitor Urgent Appeals" 
                    secondary="Focus on appeals with approaching deadlines or high priority rankings"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CalendarIcon color="info" /></ListItemIcon>
                  <ListItemText 
                    primary="Track Follow-up Actions" 
                    secondary="Stay on top of scheduled follow-ups and record results of communication with insurers"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><StatsIcon color="primary" /></ListItemIcon>
                  <ListItemText 
                    primary="Analyze Appeal Performance" 
                    secondary="Monitor statistics to improve appeal success rates and identify patterns"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CompleteIcon color="success" /></ListItemIcon>
                  <ListItemText 
                    primary="Complete Follow-up Actions" 
                    secondary="Mark actions as complete and add notes to maintain a comprehensive record"
                  />
                </ListItem>
              </List>
            </Box>
          )}
        </Grid>
        
        {/* Right side: Selected Appeal Details */}
        {selectedAppealId && (
          <Grid item xs={12} md={7}>
            <Paper sx={{ p: 3 }}>
              {selectedAppeal && (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h5" component="h2">
                        {selectedAppeal.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedAppeal.insuranceCarrier} - Claim #{selectedAppeal.claimNumber}
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
                      component={RouterLink}
                      to={`/appeals/${selectedAppeal.id}`}
                    >
                      View Full Appeal
                    </Button>
                  </Box>
                  
                  <Divider sx={{ mb: 3 }} />
                  
                  {/* Appeal summary */}
                  <Grid container spacing={2} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Status
                      </Typography>
                      <Chip 
                        label={selectedAppeal.status.charAt(0).toUpperCase() + selectedAppeal.status.slice(1)} 
                        color={getStatusColor(selectedAppeal.status)} 
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Denied Amount
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        ${selectedAppeal.deniedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Submitted Date
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(selectedAppeal.submittedDate)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Appeal Deadline
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <DeadlineIcon color={
                          getDaysRemaining(selectedAppeal.appealDeadline) < 0 ? 'error' :
                          getDaysRemaining(selectedAppeal.appealDeadline) <= 3 ? 'warning' : 'info'
                        } />
                        <Typography variant="body1">
                          {formatDate(selectedAppeal.appealDeadline)}
                          {' '}
                          ({getDaysRemaining(selectedAppeal.appealDeadline) < 0 
                            ? `${Math.abs(getDaysRemaining(selectedAppeal.appealDeadline))} days overdue` 
                            : getDaysRemaining(selectedAppeal.appealDeadline) === 0 
                              ? 'Today'
                              : `${getDaysRemaining(selectedAppeal.appealDeadline)} days remaining`})
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Denial Reason
                      </Typography>
                      <Typography variant="body1">
                        {selectedAppeal.denialReason}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Priority
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getPriorityIcon(selectedAppeal.priority).icon}
                        <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                          {selectedAppeal.priority} Priority
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                  
                  {/* Follow-up tracker */}
                  <Typography variant="h6" gutterBottom>
                    Follow-up Timeline
                  </Typography>
                  <FollowUpTracker 
                    appealId={selectedAppeal.id}
                    deadline={selectedAppeal.appealDeadline}
                    insuranceCarrier={selectedAppeal.insuranceCarrier}
                  />
                </>
              )}
            </Paper>
          </Grid>
        )}
      </Grid>
    </div>
  );
};

export default AppealsTracking;