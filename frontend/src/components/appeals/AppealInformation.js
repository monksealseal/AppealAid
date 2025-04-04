import React from 'react';
import { Box, Paper, Typography, Grid, Divider } from '@mui/material';

const AppealInformation = ({ appeal }) => {
  return (
    <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom>
        Appeal Information
      </Typography>
      <Divider sx={{ mb: 3 }} />
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Reason for Appeal
            </Typography>
            <Typography variant="body1">
              {appeal.reason || 'No reason provided'}
            </Typography>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Service Provider
            </Typography>
            <Typography variant="body1">
              {appeal.serviceProvider || 'Not specified'}
            </Typography>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Service Description
            </Typography>
            <Typography variant="body1">
              {appeal.serviceDescription || 'No description provided'}
            </Typography>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Service Location
            </Typography>
            <Typography variant="body1">
              {appeal.serviceLocation || 'Not specified'}
            </Typography>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Insurance Plan
            </Typography>
            <Typography variant="body1">
              {appeal.insurancePlan || 'Not specified'}
            </Typography>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Member ID
            </Typography>
            <Typography variant="body1">
              {appeal.insuranceMemberId || 'Not provided'}
            </Typography>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Requested Amount
            </Typography>
            <Typography variant="body1">
              {appeal.requestedAmount ? `$${appeal.requestedAmount.toFixed(2)}` : 'Not specified'}
            </Typography>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Submission Date
            </Typography>
            <Typography variant="body1">
              {appeal.submissionDate ? new Date(appeal.submissionDate).toLocaleDateString() : 'Not yet submitted'}
            </Typography>
          </Box>
        </Grid>
        
        {/* Show response details if available */}
        {appeal.responseDate && (
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" gutterBottom>
              Response Information
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Response Date
                  </Typography>
                  <Typography variant="body1">
                    {new Date(appeal.responseDate).toLocaleDateString()}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Decision
                  </Typography>
                  <Typography variant="body1">
                    {appeal.decision === 'approved' ? 'Approved' :
                     appeal.decision === 'denied' ? 'Denied' :
                     appeal.decision === 'partiallyApproved' ? 'Partially Approved' : 'Pending'}
                  </Typography>
                </Box>
              </Grid>
              
              {appeal.responseDetails?.reason && (
                <Grid item xs={12}>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Reason
                    </Typography>
                    <Typography variant="body1">
                      {appeal.responseDetails.reason}
                    </Typography>
                  </Box>
                </Grid>
              )}
              
              {(appeal.approvedAmount > 0 || appeal.deniedAmount > 0) && (
                <>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Approved Amount
                      </Typography>
                      <Typography variant="body1">
                        ${appeal.approvedAmount.toFixed(2)}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Denied Amount
                      </Typography>
                      <Typography variant="body1">
                        ${appeal.deniedAmount.toFixed(2)}
                      </Typography>
                    </Box>
                  </Grid>
                </>
              )}
            </Grid>
          </Grid>
        )}
      </Grid>
    </Paper>
  );
};

export default AppealInformation;