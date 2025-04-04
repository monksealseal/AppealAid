import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Divider,
  Box,
  Avatar,
  Alert,
  Snackbar,
  CircularProgress,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Person as PersonIcon,
  Save as SaveIcon,
  ExpandMore as ExpandMoreIcon,
  Lock as LockIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, updateProfile, loading } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    insuranceProvider: '',
    memberId: '',
    groupNumber: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [consentSettings, setConsentSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    dataSharing: false,
    marketingCommunications: false,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Load user data
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        insuranceProvider: user.insuranceInfo?.provider || '',
        memberId: user.insuranceInfo?.memberId || '',
        groupNumber: user.insuranceInfo?.groupNumber || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      // Load consent settings
      if (user.consents) {
        setConsentSettings({
          emailNotifications: user.consents.emailNotifications || true,
          smsNotifications: user.consents.smsNotifications || false,
          dataSharing: user.consents.dataSharing || false,
          marketingCommunications: user.consents.marketingCommunications || false,
        });
      }
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleConsentChange = (e) => {
    const { name, checked } = e.target;
    setConsentSettings((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      // Create submission data
      const profileData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        insuranceInfo: {
          provider: formData.insuranceProvider,
          memberId: formData.memberId,
          groupNumber: formData.groupNumber,
        },
      };

      // Add password change if provided
      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          setError('New passwords do not match');
          return;
        }
        profileData.currentPassword = formData.currentPassword;
        profileData.newPassword = formData.newPassword;
      }

      await updateProfile(profileData);
      setIsEditing(false);
      setSaveSuccess(true);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleUpdateConsent = async () => {
    // This would be implemented as a separate API call in a real application
    console.log('Updating consent settings:', consentSettings);
    setSaveSuccess(true);
  };

  // Generate initials for avatar
  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
    }
    return user?.email?.charAt(0)?.toUpperCase() || 'U';
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom>
        Profile
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Information */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: 'primary.main',
                  fontSize: '2rem',
                  mr: 2,
                }}
              >
                {getInitials()}
              </Avatar>
              <Box>
                <Typography variant="h5" gutterBottom>
                  {user?.firstName} {user?.lastName}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
                </Typography>
              </Box>
              <Button
                variant="outlined"
                sx={{ ml: 'auto' }}
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </Button>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    fullWidth
                    disabled={!isEditing}
                    required
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    fullWidth
                    disabled={!isEditing}
                    required
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Email Address"
                    name="email"
                    value={formData.email}
                    fullWidth
                    disabled={true} // Email can't be changed
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Phone Number"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    fullWidth
                    disabled={!isEditing}
                    margin="normal"
                  />
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    Insurance Information
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Insurance Provider"
                    name="insuranceProvider"
                    value={formData.insuranceProvider}
                    onChange={handleInputChange}
                    fullWidth
                    disabled={!isEditing}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Member ID"
                    name="memberId"
                    value={formData.memberId}
                    onChange={handleInputChange}
                    fullWidth
                    disabled={!isEditing}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Group Number (Optional)"
                    name="groupNumber"
                    value={formData.groupNumber}
                    onChange={handleInputChange}
                    fullWidth
                    disabled={!isEditing}
                    margin="normal"
                  />
                </Grid>

                {isEditing && (
                  <>
                    <Grid item xs={12}>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                        Change Password (Optional)
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="Current Password"
                        name="currentPassword"
                        type="password"
                        value={formData.currentPassword}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="New Password"
                        name="newPassword"
                        type="password"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Confirm New Password"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                      />
                    </Grid>
                  </>
                )}

                {isEditing && (
                  <Grid item xs={12} sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={<SaveIcon />}
                      disabled={loading}
                    >
                      {loading ? <CircularProgress size={24} /> : 'Save Changes'}
                    </Button>
                  </Grid>
                )}
              </Grid>
            </form>
          </Paper>
        </Grid>

        {/* Privacy & Consent Settings */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <SecurityIcon sx={{ mr: 1 }} />
              Privacy & Consent Settings
            </Typography>

            <Box sx={{ mt: 3 }}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography sx={{ display: 'flex', alignItems: 'center' }}>
                    <NotificationsIcon sx={{ mr: 1, fontSize: 20 }} />
                    Notification Preferences
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={consentSettings.emailNotifications}
                        onChange={handleConsentChange}
                        name="emailNotifications"
                        color="primary"
                      />
                    }
                    label="Email Notifications"
                  />
                  <Typography variant="body2" color="textSecondary" sx={{ ml: 4, mb: 2 }}>
                    Receive updates about your appeals, document processing, and account activity.
                  </Typography>

                  <FormControlLabel
                    control={
                      <Switch
                        checked={consentSettings.smsNotifications}
                        onChange={handleConsentChange}
                        name="smsNotifications"
                        color="primary"
                      />
                    }
                    label="SMS Notifications"
                  />
                  <Typography variant="body2" color="textSecondary" sx={{ ml: 4, mb: 1 }}>
                    Receive text message alerts for important updates. Standard messaging rates may
                    apply.
                  </Typography>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography sx={{ display: 'flex', alignItems: 'center' }}>
                    <LockIcon sx={{ mr: 1, fontSize: 20 }} />
                    Data Sharing & Privacy
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={consentSettings.dataSharing}
                        onChange={handleConsentChange}
                        name="dataSharing"
                        color="primary"
                      />
                    }
                    label="Anonymous Data Sharing"
                  />
                  <Typography variant="body2" color="textSecondary" sx={{ ml: 4, mb: 2 }}>
                    Help us improve our services by allowing anonymous usage data collection.
                  </Typography>

                  <FormControlLabel
                    control={
                      <Switch
                        checked={consentSettings.marketingCommunications}
                        onChange={handleConsentChange}
                        name="marketingCommunications"
                        color="primary"
                      />
                    }
                    label="Marketing Communications"
                  />
                  <Typography variant="body2" color="textSecondary" sx={{ ml: 4, mb: 1 }}>
                    Receive information about new features, tips, and related services.
                  </Typography>
                </AccordionDetails>
              </Accordion>
            </Box>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                onClick={handleUpdateConsent}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Update Preferences'}
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Snackbar
        open={saveSuccess}
        autoHideDuration={6000}
        onClose={() => setSaveSuccess(false)}
      >
        <Alert onClose={() => setSaveSuccess(false)} severity="success">
          Your changes have been saved successfully!
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Profile;