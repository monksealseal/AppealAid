import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useSelector } from 'react-redux';

const LoadingSpinner = ({ local, message }) => {
  const { loading, loadingMessage } = useSelector((state) => state.ui);

  // Show nothing if not loading (global or local)
  if (!loading && !local) {
    return null;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: local ? 'relative' : 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: local ? 'transparent' : 'rgba(255, 255, 255, 0.7)',
        zIndex: local ? 100 : 9999,
        p: local ? 4 : 0,
        minHeight: local ? '200px' : '100vh',
      }}
    >
      <CircularProgress size={local ? 40 : 60} />
      {(message || loadingMessage) && (
        <Typography variant="body1" sx={{ mt: 2 }}>
          {message || loadingMessage}
        </Typography>
      )}
    </Box>
  );
};

export default LoadingSpinner;