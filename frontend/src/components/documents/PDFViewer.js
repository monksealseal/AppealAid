import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
} from '@mui/material';
import {
  Download as DownloadIcon,
} from '@mui/icons-material';

// Simple PDF viewer for testing
const PDFViewer = ({ pdfUrl, documentName, onDownload }) => {
  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        bgcolor: '#f5f5f5',
        minHeight: '60vh',
        width: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Document title */}
      <Typography variant="h6" gutterBottom>
        {documentName || 'Document Preview'}
      </Typography>
      
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1" gutterBottom>
          PDF Viewer (Simplified Version for Testing)
        </Typography>
        
        <Typography variant="body2" color="text.secondary" gutterBottom>
          PDF URL: {pdfUrl || 'No URL provided'}
        </Typography>
        
        {onDownload && (
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={onDownload}
            sx={{ mt: 2 }}
          >
            Download PDF
          </Button>
        )}
      </Box>
    </Paper>
  );
};

export default PDFViewer;