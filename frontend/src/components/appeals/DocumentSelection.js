import React, { useState } from 'react';
import {
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  CardMedia,
  TextField,
  InputAdornment,
  Chip,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import { Search as SearchIcon, Description as DocumentIcon } from '@mui/icons-material';

// Mock data to use if no documents are provided
const FALLBACK_DOCUMENTS = [
  {
    id: 'doc1',
    name: 'EOB - MRI Denial',
    type: 'Explanation of Benefits',
    uploadDate: '2023-05-15T10:00:00Z',
    size: 2.3 * 1024 * 1024,
    format: 'pdf',
    status: 'Processed',
    provider: 'Blue Cross Blue Shield',
    claimNumber: 'BCBS123456789',
    denialReason: 'Not Medically Necessary'
  },
  {
    id: 'doc2',
    name: 'Surgery Denial Letter',
    type: 'Authorization Denial',
    uploadDate: '2023-06-10T14:30:00Z',
    size: 1.1 * 1024 * 1024,
    format: 'pdf',
    status: 'Processed',
    provider: 'Blue Cross Blue Shield',
    claimNumber: 'BCBS987654321',
    denialReason: 'Pre-authorization Required'
  },
  {
    id: 'doc3',
    name: 'Medical Records',
    type: 'Supporting Document',
    uploadDate: '2023-06-05T09:15:00Z',
    size: 5.7 * 1024 * 1024,
    format: 'pdf',
    status: 'Processed'
  }
];

const DocumentSelection = ({
  documents,
  loading,
  selectedDocument,
  setSelectedDocument,
  setAppealInfo,
  compact
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Use provided documents or fallback to mock data if documents is not available or not an array
  const docsToUse = Array.isArray(documents) && documents.length > 0 
    ? documents 
    : FALLBACK_DOCUMENTS;
  
  // Filter documents based on search query
  const filteredDocuments = docsToUse.filter(doc => {
    if (!searchQuery) return true;
    
    const lowerCaseQuery = searchQuery.toLowerCase();
    return (
      (doc.name && doc.name.toLowerCase().includes(lowerCaseQuery)) ||
      (doc.type && doc.type.toLowerCase().includes(lowerCaseQuery)) ||
      (doc.claimNumber && doc.claimNumber.toLowerCase().includes(lowerCaseQuery)) ||
      (doc.provider && doc.provider.toLowerCase().includes(lowerCaseQuery))
    );
  });
  
  // Filter to only show documents that can be appealed
  const appealableDocuments = filteredDocuments.filter(
    doc => doc && doc.type && (
      doc.type === 'Explanation of Benefits' || 
      doc.type === 'Denial Letter' || 
      doc.type === 'Authorization Denial'
    )
  );
  
  const handleDocumentSelect = (document) => {
    setSelectedDocument(document);
    
    // Update appeal info with document details if setAppealInfo is provided
    if (typeof setAppealInfo === 'function') {
      setAppealInfo(prev => ({
        ...prev,
        title: `Appeal for ${document.name}`,
        denialReason: document.denialReason || '',
      }));
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Always use fallback documents rather than showing no documents
  if (appealableDocuments.length === 0) {
    // Use the fallback documents instead of showing an alert
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Demo Documents
        </Typography>
        <Alert severity="info" sx={{mb: 2}}>
          These are demo documents for demonstration purposes.
        </Alert>
        
        <Grid container spacing={2}>
          {FALLBACK_DOCUMENTS.filter(doc => 
            doc.type === 'Explanation of Benefits' || 
            doc.type === 'Denial Letter' || 
            doc.type === 'Authorization Denial'
          ).map((document) => (
            <Grid item xs={12} sm={compact ? 12 : 6} md={compact ? 12 : 4} key={document.id}>
              <Card 
                variant={selectedDocument?.id === document.id ? "elevation" : "outlined"}
                elevation={selectedDocument?.id === document.id ? 8 : 1}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderColor: selectedDocument?.id === document.id ? 'primary.main' : undefined,
                  borderWidth: selectedDocument?.id === document.id ? 2 : 1,
                }}
              >
                <CardActionArea 
                  onClick={() => handleDocumentSelect(document)}
                  sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                >
                  <CardMedia
                    component="div"
                    sx={{
                      pt: 2,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      bgcolor: 'grey.100',
                    }}
                  >
                    <DocumentIcon sx={{ fontSize: 60, color: 'text.secondary' }} />
                  </CardMedia>
                  <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="h6" component="h3" gutterBottom noWrap title={document.name}>
                      {document.name}
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ mb: 1 }}>
                      <Chip 
                        label={document.type} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                        sx={{ mr: 1, mb: 1 }}
                      />
                      {document.status && (
                        <Chip 
                          label={document.status} 
                          size="small"
                          sx={{ mb: 1 }}
                        />
                      )}
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {document.provider && (
                        <Box component="span" display="block">
                          Provider: {document.provider}
                        </Box>
                      )}
                      {document.claimNumber && (
                        <Box component="span" display="block">
                          Claim: {document.claimNumber}
                        </Box>
                      )}
                      {document.denialReason && (
                        <Box component="span" display="block">
                          Reason: {document.denialReason}
                        </Box>
                      )}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Select a document to appeal
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Choose an Explanation of Benefits (EOB) or Denial Letter to create your appeal. 
        This document will provide the basis for your appeal letter.
      </Typography>
      
      {/* Search field */}
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search documents..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />
      
      {/* Document grid */}
      <Grid container spacing={2}>
        {appealableDocuments.map((document) => (
          <Grid item xs={12} sm={compact ? 12 : 6} md={compact ? 12 : 4} key={document.id}>
            <Card 
              variant={selectedDocument?.id === document.id ? "elevation" : "outlined"}
              elevation={selectedDocument?.id === document.id ? 8 : 1}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderColor: selectedDocument?.id === document.id ? 'primary.main' : undefined,
                borderWidth: selectedDocument?.id === document.id ? 2 : 1,
              }}
            >
              <CardActionArea 
                onClick={() => handleDocumentSelect(document)}
                sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
              >
                <CardMedia
                  component="div"
                  sx={{
                    pt: 2,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    bgcolor: 'grey.100',
                  }}
                >
                  <DocumentIcon sx={{ fontSize: 60, color: 'text.secondary' }} />
                </CardMedia>
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h6" component="h3" gutterBottom noWrap title={document.name}>
                    {document.name}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ mb: 1 }}>
                    <Chip 
                      label={document.type} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                      sx={{ mr: 1, mb: 1 }}
                    />
                    {document.status && (
                      <Chip 
                        label={document.status} 
                        size="small"
                        sx={{ mb: 1 }}
                      />
                    )}
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {document.provider && (
                      <Box component="span" display="block">
                        Provider: {document.provider}
                      </Box>
                    )}
                    {document.claimNumber && (
                      <Box component="span" display="block">
                        Claim: {document.claimNumber}
                      </Box>
                    )}
                    {document.denialReason && (
                      <Box component="span" display="block">
                        Reason: {document.denialReason}
                      </Box>
                    )}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default DocumentSelection;