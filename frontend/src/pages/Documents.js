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
  CircularProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Add as AddIcon,
  Download as DownloadIcon,
  MoreVert as MoreIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';

// Simulated data - would be fetched from API in real implementation
const getDocuments = () => [
  {
    id: '1',
    name: 'EOB - Blue Cross Blue Shield',
    type: 'Explanation of Benefits',
    status: 'Processed',
    uploadDate: '2023-05-15T10:30:00Z',
    claimNumber: 'BCBS123456789',
    denialReason: 'Not Medically Necessary',
  },
  {
    id: '2',
    name: 'Medical Record - Dr. Johnson',
    type: 'Medical Record',
    status: 'Processed',
    uploadDate: '2023-05-14T16:45:00Z',
    claimNumber: null,
    denialReason: null,
  },
  {
    id: '3',
    name: 'EOB - UnitedHealthcare',
    type: 'Explanation of Benefits',
    status: 'Processing',
    uploadDate: '2023-05-13T09:15:00Z',
    claimNumber: 'UHC987654321',
    denialReason: 'Out of Network',
  },
  {
    id: '4',
    name: 'Prescription - Lisinopril',
    type: 'Prescription',
    status: 'Processed',
    uploadDate: '2023-05-10T14:20:00Z',
    claimNumber: null,
    denialReason: null,
  },
  {
    id: '5',
    name: 'Denial Letter - Aetna',
    type: 'Denial Letter',
    status: 'Processed',
    uploadDate: '2023-05-08T11:00:00Z',
    claimNumber: 'AET567891234',
    denialReason: 'Prior Authorization Required',
  },
];

const statusColors = {
  Processed: 'success',
  Processing: 'warning',
  Error: 'error',
  Pending: 'info',
};

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);

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
    } else if (filterType === 'type') {
      setTypeFilter(value);
    }
    closeFilterMenu();
  };

  // Document action menu
  const openMenu = (event, document) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setSelectedDocument(document);
  };

  const closeMenu = () => {
    setMenuAnchorEl(null);
    setSelectedDocument(null);
  };

  // Simulate API call
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        // Simulate API delay
        await new Promise(r => setTimeout(r, 800));
        setDocuments(getDocuments());
      } catch (error) {
        console.error('Error fetching documents:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  // Apply filters and search
  const filteredDocuments = documents.filter((document) => {
    const matchesSearch = document.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      document.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (document.claimNumber && document.claimNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter ? document.status === statusFilter : true;
    const matchesType = typeFilter ? document.type === typeFilter : true;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Get unique values for filters
  const statusOptions = [...new Set(documents.map((doc) => doc.status))];
  const typeOptions = [...new Set(documents.map((doc) => doc.type))];

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
          Documents
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          component={RouterLink}
          to="/documents/upload"
        >
          Upload Document
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search documents"
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
            <Divider />
            <MenuItem disabled>Filter by Type</MenuItem>
            <MenuItem
              onClick={() => handleFilterChange('type', '')}
              selected={typeFilter === ''}
            >
              All
            </MenuItem>
            {typeOptions.map((type) => (
              <MenuItem
                key={type}
                onClick={() => handleFilterChange('type', type)}
                selected={typeFilter === type}
              >
                {type}
              </MenuItem>
            ))}
          </Menu>
        </Box>

        {filteredDocuments.length === 0 ? (
          <Box textAlign="center" py={3}>
            <Typography variant="body1" color="textSecondary">
              No documents found matching your criteria.
            </Typography>
          </Box>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Upload Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Claim Number</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredDocuments.map((document) => (
                  <TableRow
                    key={document.id}
                    hover
                    onClick={() => { /* Navigate to document detail */ }}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>{document.name}</TableCell>
                    <TableCell>{document.type}</TableCell>
                    <TableCell>{formatDate(document.uploadDate)}</TableCell>
                    <TableCell>
                      <Chip
                        label={document.status}
                        color={statusColors[document.status] || 'default'}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{document.claimNumber || '—'}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        component={RouterLink}
                        to={`/documents/${document.id}`}
                        size="small"
                        sx={{ mr: 1 }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ViewIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        aria-label="download"
                        size="small"
                        sx={{ mr: 1 }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DownloadIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        aria-label="more"
                        size="small"
                        onClick={(e) => openMenu(e, document)}
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

      {/* Document action menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={closeMenu}
      >
        <MenuItem
          component={RouterLink}
          to={selectedDocument ? `/documents/${selectedDocument.id}` : '#'}
          onClick={closeMenu}
        >
          <ViewIcon fontSize="small" sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={closeMenu}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit Document
        </MenuItem>
        <MenuItem onClick={closeMenu}>
          <DownloadIcon fontSize="small" sx={{ mr: 1 }} />
          Download
        </MenuItem>
        <Divider />
        {selectedDocument?.type === 'Explanation of Benefits' && (
          <MenuItem
            component={RouterLink}
            to={`/appeals/new?documentId=${selectedDocument?.id}`}
            onClick={closeMenu}
          >
            <AddIcon fontSize="small" sx={{ mr: 1 }} />
            Create Appeal
          </MenuItem>
        )}
        <MenuItem onClick={closeMenu} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Upload FAB - visible on mobile */}
      <Box sx={{ display: { xs: 'block', sm: 'none' }, position: 'fixed', bottom: 16, right: 16 }}>
        <Fab
          color="primary"
          aria-label="upload document"
          component={RouterLink}
          to="/documents/upload"
        >
          <AddIcon />
        </Fab>
      </Box>
    </>
  );
};

export default Documents;