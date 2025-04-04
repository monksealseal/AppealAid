import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  Breadcrumbs,
  Link,
  Card,
  CardContent,
  Grid,
  Tabs,
  Tab,
  Button,
  Chip,
  Alert,
  AlertTitle,
  Divider,
  Stack,
} from '@mui/material';
import {
  NavigateNext as NavigateNextIcon,
  Download as DownloadIcon,
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  HourglassEmpty as HourglassEmptyIcon,
  Error as ErrorIcon,
  Description as DocumentIcon,
} from '@mui/icons-material';

import { getDocumentById, downloadDocument } from '../services/documentService';
import DocumentAnalysis from '../components/documents/DocumentAnalysis';
import LoadingSpinner from '../components/common/LoadingSpinner';
import PDFViewer from '../components/documents/PDFViewer';

// Custom tab panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`document-tabpanel-${index}`}
      aria-labelledby={`document-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function DocumentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        setLoading(true);
        const data = await getDocumentById(id);
        setDocument(data);
      } catch (err) {
        setError(err.message || 'Failed to load document');
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [id]);

  const handleCreateAppeal = (documentId, analysis) => {
    navigate(`/appeals/new?documentId=${documentId}`);
  };

  const handleDownload = async () => {
    try {
      await dispatch(downloadDocument(id, document?.fileName));
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
        <Button
          component={RouterLink}
          to="/documents"
          variant="contained"
          sx={{ mt: 2 }}
        >
          Back to Documents
        </Button>
      </Box>
    );
  }

  if (!document) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          <AlertTitle>Document Not Found</AlertTitle>
          This document may have been deleted or you don't have access to it.
        </Alert>
        <Button
          component={RouterLink}
          to="/documents"
          variant="contained"
          sx={{ mt: 2 }}
        >
          Back to Documents
        </Button>
      </Box>
    );
  }

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  // Determine status color and icon
  const getStatusInfo = (status) => {
    switch (status) {
      case 'processed':
        return {
          color: 'success',
          icon: <CheckCircleIcon />,
          text: 'This document has been successfully processed and data has been extracted.',
        };
      case 'processing':
        return {
          color: 'info',
          icon: <HourglassEmptyIcon />,
          text: 'This document is currently being processed. Please check back later.',
        };
      case 'failed':
        return {
          color: 'error',
          icon: <ErrorIcon />,
          text: 'Processing this document failed. Please try uploading it again.',
        };
      default:
        return {
          color: 'default',
          icon: <DocumentIcon />,
          text: 'This document is awaiting processing.',
        };
    }
  };

  const statusInfo = getStatusInfo(document.status);
  
  // Check if it's a PDF (for viewer)
  const isPDF = document.fileType === 'application/pdf' || document.fileName.toLowerCase().endsWith('.pdf');
  
  // Build PDF URL
  const pdfUrl = document.fileUrl || `/api/documents/${id}/download`;

  return (
    <Box>
      {/* Breadcrumbs */}
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        sx={{ mb: 2 }}
      >
        <Link component={RouterLink} to="/" color="inherit">
          Dashboard
        </Link>
        <Link component={RouterLink} to="/documents" color="inherit">
          Documents
        </Link>
        <Typography color="text.primary">{document.fileName}</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1">
          {document.fileName}
        </Typography>
        <Box sx={{ mt: { xs: 2, sm: 0 } }}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleDownload}
            sx={{ mr: 1 }}
          >
            Download
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            component={RouterLink}
            to={`/appeals/new?documentId=${id}`}
          >
            Create Appeal
          </Button>
        </Box>
      </Box>

      {/* Status banner */}
      <Alert
        severity={statusInfo.color}
        icon={statusInfo.icon}
        sx={{ mb: 3 }}
      >
        <AlertTitle>Status: {document.status}</AlertTitle>
        {statusInfo.text}
      </Alert>

      {/* PDF Preview (if applicable) */}
      {isPDF && (
        <Box sx={{ mb: 4 }}>
          <PDFViewer
            pdfUrl={pdfUrl}
            documentName={document.fileName}
            onDownload={handleDownload}
          />
        </Box>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="document tabs">
          <Tab label="Document Details" id="document-tab-0" />
          <Tab label="Extracted Data" id="document-tab-1" />
          <Tab label="Appeal Analysis" id="document-tab-2" />
        </Tabs>
      </Box>

      {/* Details Tab */}
      <TabPanel value={activeTab} index={0}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Document Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      File Name
                    </Typography>
                    <Typography>{document.fileName}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Document Type
                    </Typography>
                    <Typography>{document.documentType}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      File Type
                    </Typography>
                    <Typography>{document.fileType}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      File Size
                    </Typography>
                    <Typography>{Math.round(document.fileSize / 1024)} KB</Typography>
                  </Box>
                </Stack>
              </Grid>
              <Grid item xs={12} md={6}>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Uploaded
                    </Typography>
                    <Typography>{formatDate(document.createdAt)}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Status
                    </Typography>
                    <Chip 
                      label={document.status} 
                      color={statusInfo.color === 'default' ? 'default' : statusInfo.color} 
                      size="small" 
                    />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Last Updated
                    </Typography>
                    <Typography>{formatDate(document.updatedAt)}</Typography>
                  </Box>
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Extracted Data Tab */}
      <TabPanel value={activeTab} index={1}>
        {document.status === 'processed' && document.extractedData ? (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Extracted Information
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Claim Number
                      </Typography>
                      <Typography>
                        {document.extractedData?.claimNumber || 'Not detected'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Provider
                      </Typography>
                      <Typography>
                        {document.extractedData?.providerName || 'Not detected'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Insurance Carrier
                      </Typography>
                      <Typography>
                        {document.extractedData?.insuranceCarrier || 'Not detected'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Service Date
                      </Typography>
                      <Typography>
                        {document.extractedData?.serviceDate
                          ? formatDate(document.extractedData.serviceDate)
                          : 'Not detected'}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Billed Amount
                      </Typography>
                      <Typography>
                        {document.extractedData?.billedAmount
                          ? `$${document.extractedData.billedAmount.toFixed(2)}`
                          : 'Not detected'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Allowed Amount
                      </Typography>
                      <Typography>
                        {document.extractedData?.allowedAmount
                          ? `$${document.extractedData.allowedAmount.toFixed(2)}`
                          : 'Not detected'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Patient Responsibility
                      </Typography>
                      <Typography>
                        {document.extractedData?.patientResponsibility
                          ? `$${document.extractedData.patientResponsibility.toFixed(2)}`
                          : 'Not detected'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Denial Code
                      </Typography>
                      <Typography>
                        {document.extractedData?.denialCode || 'Not detected'}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Denial Reason
                </Typography>
                <Typography>
                  {document.extractedData?.denialReason || 'Not detected'}
                </Typography>
              </Box>

              {document.extractedData?.procedureCodes?.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Procedure Codes
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
                    {document.extractedData.procedureCodes.map((code) => (
                      <Chip key={code} label={code} size="small" />
                    ))}
                  </Box>
                </Box>
              )}

              {document.extractedData?.diagnosisCodes?.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Diagnosis Codes
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
                    {document.extractedData.diagnosisCodes.map((code) => (
                      <Chip key={code} label={code} size="small" />
                    ))}
                  </Box>
                </Box>
              )}

              {document.extractedData?.serviceDescription && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Service Description
                  </Typography>
                  <Typography>
                    {document.extractedData.serviceDescription}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        ) : (
          <Alert severity="info">
            <AlertTitle>Processing Required</AlertTitle>
            This document has not been fully processed yet. Extracted data will be available once processing is complete.
          </Alert>
        )}
      </TabPanel>

      {/* Appeal Analysis Tab */}
      <TabPanel value={activeTab} index={2}>
        {document.status === 'processed' ? (
          <DocumentAnalysis document={document} onStartAppeal={handleCreateAppeal} />
        ) : (
          <Alert severity="info">
            <AlertTitle>Processing Required</AlertTitle>
            Appeal analysis will be available once document processing is complete.
          </Alert>
        )}
      </TabPanel>
    </Box>
  );
}

export default DocumentDetail;