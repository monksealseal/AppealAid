import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Typography, Box, Breadcrumbs, Link } from '@mui/material';
import { NavigateNext as NavigateNextIcon } from '@mui/icons-material';
import UploadDocument from '../components/documents/UploadDocument';

const DocumentUpload = () => {
  return (
    <>
      {/* Breadcrumbs */}
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/" color="inherit">
          Dashboard
        </Link>
        <Link component={RouterLink} to="/documents" color="inherit">
          Documents
        </Link>
        <Typography color="text.primary">Upload Document</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Upload Document
        </Typography>
      </Box>

      {/* Upload Form */}
      <UploadDocument />
    </>
  );
};

export default DocumentUpload;