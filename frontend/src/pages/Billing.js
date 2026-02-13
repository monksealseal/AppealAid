import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Stack,
  Chip,
  Divider,
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  CreditCard as CreditCardIcon,
  TrendingUp as TrendingUpIcon,
  Receipt as ReceiptIcon,
  Star as StarIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import apiWrapper from '../services/apiWrapper';

const Billing = () => {
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState(null);
  const [usage, setUsage] = useState(null);
  const [limits, setLimits] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [upgradeSuccess, setUpgradeSuccess] = useState(false);

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      const data = await apiWrapper.get('/subscriptions/me');
      if (data.success !== false) {
        setSubscription(data.data?.subscription || data.subscription || { plan: 'starter', status: 'active' });
        setUsage(data.data?.usage || data.usage || { appealsThisMonth: 0, documentsThisMonth: 0, aiGenerationsThisMonth: 0 });
        setLimits(data.data?.limits || data.limits || { appealsPerMonth: 3, documentsPerMonth: 10, aiGenerationsPerMonth: 0 });
      }
    } catch (error) {
      // Default to starter plan if API not available
      setSubscription({ plan: 'starter', status: 'active' });
      setUsage({ appealsThisMonth: 0, documentsThisMonth: 0, aiGenerationsThisMonth: 0 });
      setLimits({ appealsPerMonth: 3, documentsPerMonth: 10, aiGenerationsPerMonth: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (plan, interval) => {
    try {
      const data = await apiWrapper.post('/subscriptions/checkout', { plan, interval });
      if (data.data?.checkoutUrl) {
        window.location.href = data.data.checkoutUrl;
      } else {
        setUpgradeSuccess(true);
        fetchSubscriptionData();
        setTimeout(() => setUpgradeSuccess(false), 5000);
      }
    } catch (error) {
      // Simulate upgrade in mock mode
      setSubscription({ ...subscription, plan, status: 'trialing' });
      setLimits(plan === 'professional'
        ? { appealsPerMonth: -1, documentsPerMonth: -1, aiGenerationsPerMonth: -1, teamMembers: 10 }
        : { appealsPerMonth: -1, documentsPerMonth: -1, aiGenerationsPerMonth: -1, teamMembers: -1 }
      );
      setUpgradeSuccess(true);
      setTimeout(() => setUpgradeSuccess(false), 5000);
    }
  };

  const handleCancel = async () => {
    try {
      await apiWrapper.post('/subscriptions/cancel');
    } catch (error) {
      // Mock cancel
    }
    setSubscription({ ...subscription, cancelAtPeriodEnd: true });
    setCancelDialogOpen(false);
  };

  const getUsagePercentage = (current, limit) => {
    if (limit === -1) return 0; // unlimited
    if (limit === 0) return 100;
    return Math.min((current / limit) * 100, 100);
  };

  const formatLimit = (value) => (value === -1 ? 'Unlimited' : value);

  const planColors = {
    starter: 'default',
    professional: 'primary',
    enterprise: 'secondary',
  };

  const planPrices = {
    starter: '$0',
    professional: '$49',
    enterprise: '$199',
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <LinearProgress />
      </Container>
    );
  }

  const currentPlan = subscription?.plan || 'starter';

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>Billing & Subscription</Typography>
      <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4 }}>
        Manage your subscription, view usage, and update billing details.
      </Typography>

      {upgradeSuccess && (
        <Alert severity="success" sx={{ mb: 3 }} icon={<CheckIcon />}>
          Plan upgraded successfully! Your 14-day free trial has started.
        </Alert>
      )}

      {subscription?.cancelAtPeriodEnd && (
        <Alert severity="warning" sx={{ mb: 3 }} icon={<WarningIcon />}>
          Your subscription will be canceled at the end of the current billing period.
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Current Plan */}
        <Grid item xs={12} md={8}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>Current Plan</Typography>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                    <Chip
                      label={currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}
                      color={planColors[currentPlan]}
                      size="small"
                    />
                    <Chip
                      label={subscription?.status === 'trialing' ? 'Trial' : 'Active'}
                      color={subscription?.status === 'trialing' ? 'warning' : 'success'}
                      size="small"
                      variant="outlined"
                    />
                  </Stack>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>{planPrices[currentPlan]}</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>/month</Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Stack direction="row" spacing={2}>
                {currentPlan !== 'enterprise' && (
                  <Button
                    variant="contained"
                    startIcon={<StarIcon />}
                    onClick={() => handleUpgrade(currentPlan === 'starter' ? 'professional' : 'enterprise', 'monthly')}
                    disableElevation
                  >
                    Upgrade to {currentPlan === 'starter' ? 'Professional' : 'Enterprise'}
                  </Button>
                )}
                {currentPlan !== 'starter' && !subscription?.cancelAtPeriodEnd && (
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => setCancelDialogOpen(true)}
                  >
                    Cancel Subscription
                  </Button>
                )}
                <Button variant="outlined" onClick={() => navigate('/pricing')}>
                  Compare Plans
                </Button>
              </Stack>
            </CardContent>
          </Card>

          {/* Usage */}
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <TrendingUpIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Usage This Month</Typography>
              </Box>
              <Stack spacing={3}>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>Appeals</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {usage?.appealsThisMonth || 0} / {formatLimit(limits?.appealsPerMonth)}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={getUsagePercentage(usage?.appealsThisMonth || 0, limits?.appealsPerMonth)}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>Documents</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {usage?.documentsThisMonth || 0} / {formatLimit(limits?.documentsPerMonth)}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={getUsagePercentage(usage?.documentsThisMonth || 0, limits?.documentsPerMonth)}
                    color="secondary"
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>AI Generations</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {usage?.aiGenerationsThisMonth || 0} / {formatLimit(limits?.aiGenerationsPerMonth)}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={getUsagePercentage(usage?.aiGenerationsThisMonth || 0, limits?.aiGenerationsPerMonth)}
                    color="info"
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions Sidebar */}
        <Grid item xs={12} md={4}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <CreditCardIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>Payment Method</Typography>
              </Box>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                {currentPlan === 'starter' ? 'No payment method on file' : 'Visa ending in ****4242'}
              </Typography>
              {currentPlan !== 'starter' && (
                <Button variant="outlined" size="small" fullWidth>
                  Update Payment Method
                </Button>
              )}
            </CardContent>
          </Card>

          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <ReceiptIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>Recent Invoices</Typography>
              </Box>
              {currentPlan === 'starter' ? (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  No invoices yet. Upgrade to a paid plan to see invoices here.
                </Typography>
              ) : (
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">Current period</Typography>
                    <Chip label="Trial" size="small" color="warning" variant="outlined" />
                  </Box>
                </Stack>
              )}
            </CardContent>
          </Card>

          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'primary.main', bgcolor: 'rgba(45,125,210,0.04)' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Need help?</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                Contact our sales team for custom Enterprise pricing or volume discounts.
              </Typography>
              <Button variant="outlined" size="small" fullWidth>
                Contact Sales
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)}>
        <DialogTitle>Cancel Subscription?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Your subscription will remain active until the end of the current billing period.
            After that, you'll be moved to the free Starter plan. You can reactivate at any time.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>Keep Subscription</Button>
          <Button onClick={handleCancel} color="error">Cancel Subscription</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Billing;
