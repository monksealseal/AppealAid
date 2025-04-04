import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Typography,
  Box,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  Menu,
  MenuItem,
  Fab,
  Divider,
  LinearProgress,
  CircularProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Add as AddIcon,
  MoreVert as MoreIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Assignment as AssignmentIcon,
  Send as SendIcon,
  Psychology as AIIcon,
} from '@mui/icons-material';

// Simulated data - would be fetched from API in real implementation
const getAppeals = () => [
  {
    id: '1',
    title: 'Appeal for Surgery Claim Denial',
    status: 'Pending',
    createdDate: '2023-05-15T10:30:00Z',
    submittedDate: null,
    claimNumber: 'BCBS123456789',
    provider: 'Blue Cross Blue Shield',
    denialReason: 'Not Medically Necessary',
    progress: 60,
  },
  {
    id: '2',
    title: 'Appeal for Out-of-Network Denial',
    status: 'Draft',
    createdDate: '2023-05-14T16:45:00Z',
    submittedDate: null,
    claimNumber: 'UHC987654321',
    provider: 'UnitedHealthcare',
    denialReason: 'Out of Network',
    progress: 30,
  },
  {
    id: '3',
    title: 'Appeal for Prior Auth Denial',
    status: 'Submitted',
    createdDate: '2023-05-10T14:20:00Z',
    submittedDate: '2023-05-12T09:15:00Z',
    claimNumber: 'AET567891234',
    provider: 'Aetna',
    denialReason: 'Prior Authorization Required',
    progress: 100,
  },
  {
    id: '4',
    title: 'Appeal for Medication Coverage',
    status: 'Approved',
    createdDate: '2023-04-20T11:30:00Z',
    submittedDate: '2023-04-22T15:45:00Z',
    claimNumber: 'CIG123789456',
    provider: 'Cigna',
    denialReason: 'Non-Formulary Medication',
    progress: 100,
  },
  {
    id: '5',
    title: 'Appeal for Physical Therapy',
    status: 'Denied',
    createdDate: '2023-04-05T10:15:00Z',
    submittedDate: '2023-04-07T14:30:00Z',
    claimNumber: 'HUM456123789',
    provider: 'Humana',
    denialReason: 'Exceeds Benefit Limit',
    progress: 100,
  },
];

const statusColors = {
  Draft: 'default',
  Pending: 'warning',
  Submitted: 'info',
  Approved: 'success',
  Denied: 'error',
};

const formatDate = (dateString) => {
  if (!dateString) return '—';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const Appeals = () => {
  const [appeals, setAppeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedAppeal, setSelectedAppeal] = useState(null);

  // Filters
  const openFilterMenu = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const closeFilterMenu = () => {
    setFilterAnchorEl(null);
  };

  const handleFilterChange = (filterType, value) => {
    if (filterType === 'status') {
      setStatusFilter(value);
    }
    closeFilterMenu();
  };

  // Appeal action menu
  const openMenu = (event, appeal) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setSelectedAppeal(appeal);
  };

  const closeMenu = () => {
    setMenuAnchorEl(null);
    setSelectedAppeal(null);
  };

  // Simulate API call
  useEffect(() => {
    const fetchAppeals = async () => {
      try {
        // Simulate API delay
        await new Promise(r => setTimeout(r, 800));
        setAppeals(getAppeals());
      } catch (error) {
        console.error('Error fetching appeals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppeals();
  }, []);

  // Apply filters and search
  const filteredAppeals = appeals.filter((appeal) => {
    const matchesSearch = appeal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appeal.claimNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appeal.provider.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter ? appeal.status === statusFilter : true;

    return matchesSearch && matchesStatus;
  });

  // Get unique values for filters
  const statusOptions = [...new Set(appeals.map((appeal) => appeal.status))];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Appeals
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<AIIcon />}
            component={RouterLink}
            to="/appeals/ai-generator"
          >
            AI Letter Generator
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            component={RouterLink}
            to="/appeals/new"
          >
            Create Appeal
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search appeals"
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <IconButton
            aria-label="filter"
            onClick={openFilterMenu}
            size="small"
            sx={{ ml: 1 }}
          >
            <FilterIcon />
          </IconButton>
          <Menu
            anchorEl={filterAnchorEl}
            open={Boolean(filterAnchorEl)}
            onClose={closeFilterMenu}
          >
            <MenuItem disabled>Filter by Status</MenuItem>
            <MenuItem
              onClick={() => handleFilterChange('status', '')}
              selected={statusFilter === ''}
            >
              All
            </MenuItem>
            {statusOptions.map((status) => (
              <MenuItem
                key={status}
                onClick={() => handleFilterChange('status', status)}
                selected={statusFilter === status}
              >
                {status}
              </MenuItem>
            ))}
          </Menu>
        </Box>

        {filteredAppeals.length === 0 ? (
          <Box textAlign="center" py={3}>
            <Typography variant="body1" color="textSecondary">
              No appeals found matching your criteria.
            </Typography>
          </Box>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Appeal</TableCell>
                  <TableCell>Insurance Provider</TableCell>
                  <TableCell>Claim Number</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Progress</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAppeals.map((appeal) => (
                  <TableRow
                    key={appeal.id}
                    hover
                    onClick={() => { /* Navigate to appeal detail */ }}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>{appeal.title}</TableCell>
                    <TableCell>{appeal.provider}</TableCell>
                    <TableCell>{appeal.claimNumber}</TableCell>
                    <TableCell>{formatDate(appeal.createdDate)}</TableCell>
                    <TableCell>
                      <Chip
                        label={appeal.status}
                        color={statusColors[appeal.status] || 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell sx={{ width: '15%' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ width: '100%', mr: 1 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={appeal.progress} 
                            color={
                              appeal.status === 'Denied' ? 'error' :
                              appeal.status === 'Approved' ? 'success' : 'primary'
                            }
                          />
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {`${appeal.progress}%`}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        component={RouterLink}
                        to={`/appeals/${appeal.id}`}
                        size="small"
                        sx={{ mr: 1 }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ViewIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        aria-label="more"
                        size="small"
                        onClick={(e) => openMenu(e, appeal)}
                      >
                        <MoreIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Appeal action menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={closeMenu}
      >
        <MenuItem
          component={RouterLink}
          to={selectedAppeal ? `/appeals/${selectedAppeal.id}` : '#'}
          onClick={closeMenu}
        >
          <ViewIcon fontSize="small" sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        
        {selectedAppeal?.status === 'Draft' && (
          <MenuItem
            component={RouterLink}
            to={`/appeals/${selectedAppeal?.id}/edit`}
            onClick={closeMenu}
          >
            <EditIcon fontSize="small" sx={{ mr: 1 }} />
            Edit Appeal
          </MenuItem>
        )}
        
        {selectedAppeal?.status === 'Draft' && (
          <MenuItem onClick={closeMenu}>
            <AssignmentIcon fontSize="small" sx={{ mr: 1 }} />
            View Generated Letter
          </MenuItem>
        )}
        
        {(selectedAppeal?.status === 'Draft' || selectedAppeal?.status === 'Pending') && (
          <MenuItem onClick={closeMenu}>
            <SendIcon fontSize="small" sx={{ mr: 1 }} />
            Submit Appeal
          </MenuItem>
        )}
        
        <Divider />
        
        {(selectedAppeal?.status === 'Draft') && (
          <MenuItem onClick={closeMenu} sx={{ color: 'error.main' }}>
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
            Delete
          </MenuItem>
        )}
      </Menu>

      {/* Create FAB - visible on mobile */}
      <Box sx={{ display: { xs: 'block', sm: 'none' }, position: 'fixed', bottom: 16, right: 16 }}>
        <Fab
          color="primary"
          aria-label="create appeal"
          component={RouterLink}
          to="/appeals/new"
        >
          <AddIcon />
        </Fab>
      </Box>
    </>
  );
};

export default Appeals;