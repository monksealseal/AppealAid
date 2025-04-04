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

const DocumentSelection = ({
  documents,
  loading,
  selectedDocument,
  setSelectedDocument,
  setAppealInfo,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter documents based on search query
  const filteredDocuments = Array.isArray(documents) 
    ? documents.filter(doc => {
        if (!searchQuery) return true;
        
        const lowerCaseQuery = searchQuery.toLowerCase();
        return (
          (doc.name && doc.name.toLowerCase().includes(lowerCaseQuery)) ||
          (doc.type && doc.type.toLowerCase().includes(lowerCaseQuery)) ||
          (doc.claimNumber && doc.claimNumber.toLowerCase().includes(lowerCaseQuery)) ||
          (doc.provider && doc.provider.toLowerCase().includes(lowerCaseQuery))
        );
      }) 
    : [];
  
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
    
    // Update appeal info with document details
    setAppealInfo(prev => ({
      ...prev,
      title: `Appeal for ${document.name}`,
      denialReason: document.denialReason || '',
    }));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!documents || documents.length === 0) {
    return (
      <Alert severity="info">
        No documents found. Please upload documents before creating an appeal.
      </Alert>
    );
  }

  if (appealableDocuments.length === 0) {
    return (
      <Alert severity="info">
        No appealable documents found. Please upload an Explanation of Benefits or Denial Letter to create an appeal.
      </Alert>
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
          <Grid item xs={12} sm={6} md={4} key={document.id}>
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