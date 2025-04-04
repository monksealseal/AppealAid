import React, { useState } from 'react';
import {
  Typography,
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Paper,
  Divider,
  Alert,
  Chip,
  LinearProgress,
  FormHelperText,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  InsertDriveFile as FileIcon,
  Delete as DeleteIcon,
  AttachFile as AttachmentIcon,
  Description as DocumentIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import { formatFileSize } from '../../utils/helpers';
import config from '../../utils/config';

const FileAttachments = ({ attachments = [], setAttachments, errors = {} }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);

  // Handle file selection
  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setError(null);
    
    // Validate file size
    const oversizedFiles = files.filter(
      file => file.size > config.features.maxFileSize
    );
    
    if (oversizedFiles.length > 0) {
      setError(`Some files exceed the maximum size of ${formatFileSize(config.features.maxFileSize)}`);
      return;
    }
    
    // Validate file type
    const invalidFiles = files.filter(file => {
      const extension = file.name.split('.').pop().toLowerCase();
      return !config.features.allowedFileTypes.includes(extension);
    });
    
    if (invalidFiles.length > 0) {
      setError(`Some files have invalid types. Allowed types: ${config.features.allowedFileTypes.join(', ')}`);
      return;
    }
    
    // Simulate upload
    setUploading(true);
    
    // Progress simulation
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setUploadProgress(progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        setUploading(false);
        setUploadProgress(0);
        
        // Add files to attachments
        const newAttachments = files.map(file => ({
          id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          type: file.type,
          size: file.size,
          uploadDate: new Date().toISOString(),
        }));
        
        setAttachments(prev => [...prev, ...newAttachments]);
      }
    }, 100);
    
    // Reset file input
    event.target.value = null;
  };

  // Handle file deletion
  const handleFileDelete = (id) => {
    setAttachments(prev => prev.filter(attachment => attachment.id !== id));
  };

  // Get appropriate icon for file type
  const getFileIcon = (file) => {
    if (file.type.includes('pdf')) {
      return <PdfIcon />;
    } else if (file.type.includes('image')) {
      return <ImageIcon />;
    } else if (file.type.includes('document') || file.type.includes('word')) {
      return <DocumentIcon />;
    } else {
      return <FileIcon />;
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Supporting Documents
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Upload any additional documents that support your appeal, such as doctor's notes, 
        medical records, or other evidence.
      </Typography>

      {/* Upload button and info */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <AttachmentIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="subtitle1">
            Attach Supporting Documents
          </Typography>
        </Box>
        
        <input
          type="file"
          multiple
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          id="attachment-upload"
          accept={config.features.allowedFileTypes.map(type => `.${type}`).join(',')}
          disabled={uploading}
        />
        
        <Box sx={{ mb: 2 }}>
          <Button
            component="label"
            htmlFor="attachment-upload"
            variant="outlined"
            startIcon={<UploadIcon />}
            disabled={uploading}
            sx={{ mb: 1, mr: 1 }}
          >
            Upload Files
          </Button>
          
          <Chip
            label={`Max size: ${formatFileSize(config.features.maxFileSize)}`}
            size="small"
            variant="outlined"
            sx={{ mr: 1 }}
          />
          
          <Chip
            label={`Allowed: ${config.features.allowedFileTypes.join(', ')}`}
            size="small"
            variant="outlined"
          />
        </Box>
        
        {uploading && (
          <Box sx={{ mb: 2 }}>
            <LinearProgress variant="determinate" value={uploadProgress} sx={{ mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Uploading... {uploadProgress}%
            </Typography>
          </Box>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {errors.attachments && (
          <FormHelperText error sx={{ mb: 1 }}>
            {errors.attachments}
          </FormHelperText>
        )}
      </Paper>

      {/* Attachment list */}
      {attachments.length > 0 && (
        <Paper variant="outlined" sx={{ mb: 3 }}>
          <List dense>
            {attachments.map((file, index) => (
              <React.Fragment key={file.id}>
                {index > 0 && <Divider component="li" />}
                <ListItem>
                  <ListItemIcon>
                    {getFileIcon(file)}
                  </ListItemIcon>
                  <ListItemText
                    primary={file.name}
                    secondary={formatFileSize(file.size)}
                  />
                  <ListItemSecondaryAction>
                    <IconButton 
                      edge="end" 
                      aria-label="delete" 
                      onClick={() => handleFileDelete(file.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}
      
      {attachments.length === 0 && !uploading && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          No documents attached yet. Supporting documents can strengthen your appeal.
        </Typography>
      )}
    </Box>
  );
};

export default FileAttachments;