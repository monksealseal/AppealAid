/**
 * Appeals Page
 * 
 * Displays a list of all appeals with filtering and sorting options
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Sort as SortIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  HourglassEmpty as PendingIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';

// Mock appeals data for demonstration
const mockAppeals = [
  {
    _id: '60d21b4667d0d8992e610c85',
    appealId: 'AP001',
    claimId: 'CL12345',
    patientName: 'John Doe',
    serviceName: 'Post-Stroke Rehabilitation',
    insuranceCompany: 'UnitedHealthcare',
    status: 'denied',
    requestedAmount: 12500.00,
    submissionDate: new Date('2024-01-15'),
    responseDate: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-15')
  },
  {
    _id: '60d21b4667d0d8992e610c86',
    appealId: 'AP002',
    claimId: 'CL67890',
    patientName: 'Jane Smith',
    serviceName: 'MRI - Lumbar Spine',
    insuranceCompany: 'Blue Cross Blue Shield',
    status: 'pending',
    requestedAmount: 1800.00,
    submissionDate: null,
    responseDate: null,
    updatedAt: new Date('2024-02-05')
  }
];

const Appeals = () => {
  const [appeals, setAppeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('updatedAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedAppealId, setSelectedAppealId] = useState(null);

  // Fetch appeals data
  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setAppeals(mockAppeals);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Filter appeals based on search term and status filter
  const filteredAppeals = appeals.filter(appeal => {
    const matchesSearch = searchTerm === '' || 
      appeal.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appeal.appealId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appeal.claimId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appeal.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appeal.insuranceCompany.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || appeal.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Sort appeals
  const sortedAppeals = [...filteredAppeals].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    // Handle dates
    if (aValue instanceof Date && bValue instanceof Date) {
      aValue = aValue.getTime();
      bValue = bValue.getTime();
    }
    
    // Handle null values
    if (aValue === null) return 1;
    if (bValue === null) return -1;
    
    // Sort
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Handle menu open/close
  const handleMenuOpen = (event, appealId) => {
    setAnchorEl(event.currentTarget);
    setSelectedAppealId(appealId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedAppealId(null);
  };

  // Render status chip
  const renderStatusChip = (status) => {
    switch (status) {
      case 'approved':
        return <Chip icon={<CheckCircleIcon />} label="Approved" color="success" size="small" />;
      case 'denied':
        return <Chip icon={<ErrorIcon />} label="Denied" color="error" size="small" />;
      case 'pending':
        return <Chip icon={<PendingIcon />} label="Pending" color="warning" size="small" />;
      default:
        return <Chip label={status || 'N/A'} size="small" />;
    }
  };

  // Handle sort change
  const handleSortChange = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Appeals</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          component={Link}
          to="/appeals/create"
        >
          New Appeal
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search appeals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flexGrow: 1 }}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          
          <FormControl sx={{ minWidth: 150 }} size="small">
            <InputLabel id="status-filter-label">Status</InputLabel>
            <Select
              labelId="status-filter-label"
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
              startAdornment={
                <InputAdornment position="start">
                  <FilterListIcon fontSize="small" />
                </InputAdornment>
              }
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="denied">Denied</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl sx={{ minWidth: 150 }} size="small">
            <InputLabel id="sort-filter-label">Sort By</InputLabel>
            <Select
              labelId="sort-filter-label"
              value={sortField}
              label="Sort By"
              onChange={(e) => {
                setSortField(e.target.value);
              }}
              startAdornment={
                <InputAdornment position="start">
                  <SortIcon fontSize="small" />
                </InputAdornment>
              }
            >
              <MenuItem value="updatedAt">Last Updated</MenuItem>
              <MenuItem value="patientName">Patient Name</MenuItem>
              <MenuItem value="insuranceCompany">Insurance Company</MenuItem>
              <MenuItem value="requestedAmount">Amount</MenuItem>
              <MenuItem value="status">Status</MenuItem>
            </Select>
          </FormControl>
          
          <Button
            variant="outlined"
            onClick={() => {
              setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
            }}
          >
            {sortDirection === 'asc' ? 'Ascending' : 'Descending'}
          </Button>
        </Box>
      </Paper>

      {/* Appeals Table */}
      {sortedAppeals.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Appeal ID</TableCell>
                <TableCell>Patient</TableCell>
                <TableCell>Service</TableCell>
                <TableCell>Insurance</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Last Updated</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedAppeals.map((appeal) => (
                <TableRow key={appeal._id}>
                  <TableCell>{appeal.appealId}</TableCell>
                  <TableCell>{appeal.patientName}</TableCell>
                  <TableCell>{appeal.serviceName}</TableCell>
                  <TableCell>{appeal.insuranceCompany}</TableCell>
                  <TableCell>${appeal.requestedAmount.toFixed(2)}</TableCell>
                  <TableCell>{renderStatusChip(appeal.status)}</TableCell>
                  <TableCell>{new Date(appeal.updatedAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <IconButton
                      aria-label="more"
                      onClick={(event) => handleMenuOpen(event, appeal._id)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Alert severity="info">
          No appeals found matching your criteria. Try adjusting your filters or create a new appeal.
        </Alert>
      )}

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem 
          component={Link} 
          to={`/appeals/${selectedAppealId}`}
          onClick={handleMenuClose}
        >
          View Details
        </MenuItem>
        <MenuItem onClick={() => {
          alert('Edit feature will be available in the next release');
          handleMenuClose();
        }}>
          Edit
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Appeals;