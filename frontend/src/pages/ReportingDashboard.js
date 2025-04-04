import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Breadcrumbs,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  CircularProgress,
  Alert,
  TextField,
  IconButton,
  Tooltip,
  Divider
} from '@mui/material';
import {
  NavigateNext as NavigateNextIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  BarChart as ChartIcon,
  Settings as SettingsIcon,
  TimelineOutlined as TimelineIcon,
  PieChartOutline as PieChartIcon,
  FileDownload as ExportIcon,
  LocalPrintshop as PrintReportIcon,
  ShowChart as TrendIcon,
  BarChart
} from '@mui/icons-material';

// Sample data - in a real app, this would come from an API call
const fetchReportingData = async () => {
  // Simulate API call
  await new Promise(r => setTimeout(r, 1000));
  
  return {
    summary: {
      totalAppeals: 28,
      pendingAppeals: 12,
      approvedAppeals: 9,
      deniedAppeals: 7,
      totalRecovered: 47250.75,
      averageResponseTime: 18, // days
      successRate: 56.25, // percentage
    },
    topDenialReasons: [
      { reason: 'Not Medically Necessary', count: 14, percentage: 50 },
      { reason: 'Out of Network', count: 6, percentage: 21.4 },
      { reason: 'Prior Authorization Required', count: 5, percentage: 17.9 },
      { reason: 'Duplicate Claim', count: 2, percentage: 7.1 },
      { reason: 'Other', count: 1, percentage: 3.6 },
    ],
    byInsurer: [
      { insurer: 'Blue Cross Blue Shield', success: 64, pending: 5, denied: 31 },
      { insurer: 'UnitedHealthcare', success: 42, pending: 48, denied: 10 },
      { insurer: 'Aetna', success: 71, pending: 15, denied: 14 },
      { insurer: 'Cigna', success: 39, pending: 39, denied: 22 },
      { insurer: 'Humana', success: 57, pending: 29, denied: 14 },
    ],
    recentAppeals: [
      { id: 'a001', title: 'Appeal for MRI Denial', insurer: 'BCBS', date: '2023-05-01', amount: 1250.00, status: 'approved' },
      { id: 'a002', title: 'Surgery Pre-Auth Appeal', insurer: 'UHC', date: '2023-04-25', amount: 8750.50, status: 'pending' },
      { id: 'a003', title: 'Appeal for Out-of-Network PT', insurer: 'Aetna', date: '2023-04-20', amount: 2340.00, status: 'approved' },
      { id: 'a004', title: 'ER Visit Appeal', insurer: 'Cigna', date: '2023-04-15', amount: 4567.25, status: 'denied' },
      { id: 'a005', title: 'Prescription Denial Appeal', insurer: 'Humana', date: '2023-04-10', amount: 540.80, status: 'approved' },
    ],
    aiInsights: {
      topRejectionFactors: [
        "Incomplete medical documentation",
        "Inconsistent diagnosis and procedure codes",
        "Missing prior authorization references",
        "Inadequate demonstration of medical necessity"
      ],
      successPatterns: [
        "Including peer-reviewed literature supporting medical necessity",
        "Citing specific insurance policy language",
        "Providing detailed physician statements",
        "Referencing relevant legal frameworks" 
      ],
      recommendedImprovements: [
        "Include more detailed clinical documentation",
        "Add specific references to policy provisions",
        "Obtain and include specialist opinions",
        "Follow up more aggressively on pending appeals"
      ]
    }
  };
};

const ReportingDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [timeframe, setTimeframe] = useState('year');
  
  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await fetchReportingData();
        setReportData(data);
      } catch (err) {
        console.error('Error loading reporting data:', err);
        setError('Failed to load reporting data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [timeframe]); // Reload when timeframe changes
  
  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };
  
  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };
  
  // Handle report export
  const handleExportReport = () => {
    console.log('Exporting report...');
    // In a real app, this would generate and download a report
    alert('Report would be exported in a real implementation');
  };
  
  // Handle report print
  const handlePrintReport = () => {
    console.log('Printing report...');
    // In a real app, this would open the print dialog
    window.print();
  };
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }
  
  return (
    <Box>
      {/* Breadcrumbs */}
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 2 }}>
        <RouterLink to="/" style={{ color: 'inherit', textDecoration: 'none' }}>
          Dashboard
        </RouterLink>
        <Typography color="text.primary">Reporting</Typography>
      </Breadcrumbs>
      
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Appeals Reporting Dashboard
        </Typography>
        <Stack direction="row" spacing={1}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="timeframe-label">Timeframe</InputLabel>
            <Select
              labelId="timeframe-label"
              value={timeframe}
              label="Timeframe"
              onChange={(e) => setTimeframe(e.target.value)}
            >
              <MenuItem value="month">Last Month</MenuItem>
              <MenuItem value="quarter">Last Quarter</MenuItem>
              <MenuItem value="year">Last Year</MenuItem>
              <MenuItem value="all">All Time</MenuItem>
            </Select>
          </FormControl>
          <Button 
            variant="outlined" 
            startIcon={<ExportIcon />}
            onClick={handleExportReport}
          >
            Export
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<PrintReportIcon />}
            onClick={handlePrintReport}
          >
            Print
          </Button>
        </Stack>
      </Box>
      
      {/* Summary Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Total Appeals
            </Typography>
            <Typography variant="h4">
              {reportData.summary.totalAppeals}
            </Typography>
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                mt: 1, 
                pt: 1,
                borderTop: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Pending
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {reportData.summary.pendingAppeals}
              </Typography>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Success Rate
            </Typography>
            <Typography variant="h4">
              {reportData.summary.successRate}%
            </Typography>
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                mt: 1, 
                pt: 1,
                borderTop: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography variant="body2" color="success.main">
                Approved: {reportData.summary.approvedAppeals}
              </Typography>
              <Typography variant="body2" color="error.main">
                Denied: {reportData.summary.deniedAppeals}
              </Typography>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Total Recovered
            </Typography>
            <Typography variant="h4">
              {formatCurrency(reportData.summary.totalRecovered)}
            </Typography>
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                mt: 1, 
                pt: 1,
                borderTop: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Per Appeal (Avg)
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {formatCurrency(reportData.summary.totalRecovered / reportData.summary.approvedAppeals)}
              </Typography>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Avg Response Time
            </Typography>
            <Typography variant="h4">
              {reportData.summary.averageResponseTime} days
            </Typography>
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                mt: 1, 
                pt: 1,
                borderTop: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography variant="body2" color="text.secondary">
                From submission to decision
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Charts and Tables */}
      <Grid container spacing={3}>
        {/* Top Denial Reasons */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Top Denial Reasons</Typography>
              <PieChartIcon color="primary" />
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Reason</TableCell>
                    <TableCell align="right">Count</TableCell>
                    <TableCell align="right">Percentage</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportData.topDenialReasons.map((row) => (
                    <TableRow key={row.reason}>
                      <TableCell component="th" scope="row">
                        {row.reason}
                      </TableCell>
                      <TableCell align="right">{row.count}</TableCell>
                      <TableCell align="right">{row.percentage}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
        
        {/* Success Rate by Insurer */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Success Rate by Insurer</Typography>
              <BarChart color="primary" />
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Insurer</TableCell>
                    <TableCell align="right">Success %</TableCell>
                    <TableCell align="right">Pending %</TableCell>
                    <TableCell align="right">Denied %</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportData.byInsurer.map((row) => (
                    <TableRow key={row.insurer}>
                      <TableCell component="th" scope="row">
                        {row.insurer}
                      </TableCell>
                      <TableCell align="right" sx={{ color: 'success.main' }}>
                        {row.success}%
                      </TableCell>
                      <TableCell align="right" sx={{ color: 'info.main' }}>
                        {row.pending}%
                      </TableCell>
                      <TableCell align="right" sx={{ color: 'error.main' }}>
                        {row.denied}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
        
        {/* Recent Appeals */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Recent Appeals</Typography>
              <TimelineIcon color="primary" />
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Appeal Title</TableCell>
                    <TableCell>Insurer</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportData.recentAppeals.map((appeal) => (
                    <TableRow key={appeal.id}>
                      <TableCell>{appeal.title}</TableCell>
                      <TableCell>{appeal.insurer}</TableCell>
                      <TableCell>{formatDate(appeal.date)}</TableCell>
                      <TableCell align="right">{formatCurrency(appeal.amount)}</TableCell>
                      <TableCell>
                        <Box 
                          component="span" 
                          sx={{ 
                            px: 1, 
                            py: 0.5, 
                            borderRadius: 1, 
                            typography: 'body2',
                            fontWeight: 'medium',
                            textTransform: 'capitalize',
                            bgcolor: 
                              appeal.status === 'approved' ? 'success.light' : 
                              appeal.status === 'pending' ? 'info.light' : 
                              'error.light',
                            color: 
                              appeal.status === 'approved' ? 'success.dark' : 
                              appeal.status === 'pending' ? 'info.dark' : 
                              'error.dark',
                          }}
                        >
                          {appeal.status}
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Button 
                          variant="outlined" 
                          size="small"
                          component={RouterLink}
                          to={`/appeals/${appeal.id}`}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
        
        {/* AI Insights */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">AI Denial Analysis & Insights</Typography>
              <TrendIcon color="primary" />
            </Box>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" color="error.main" gutterBottom>
                      Top Rejection Factors
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Box component="ul" sx={{ pl: 2, m: 0 }}>
                      {reportData.aiInsights.topRejectionFactors.map((factor, index) => (
                        <Box component="li" key={index} sx={{ mb: 1 }}>
                          <Typography variant="body2">{factor}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" color="success.main" gutterBottom>
                      Success Patterns
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Box component="ul" sx={{ pl: 2, m: 0 }}>
                      {reportData.aiInsights.successPatterns.map((pattern, index) => (
                        <Box component="li" key={index} sx={{ mb: 1 }}>
                          <Typography variant="body2">{pattern}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" color="info.main" gutterBottom>
                      Recommended Improvements
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Box component="ul" sx={{ pl: 2, m: 0 }}>
                      {reportData.aiInsights.recommendedImprovements.map((improvement, index) => (
                        <Box component="li" key={index} sx={{ mb: 1 }}>
                          <Typography variant="body2">{improvement}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ReportingDashboard;