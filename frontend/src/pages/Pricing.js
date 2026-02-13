import React, { useState } from 'react';
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
  Switch,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  HealthAndSafety as HealthIcon,
  Star as StarIcon,
} from '@mui/icons-material';

const Pricing = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [annual, setAnnual] = useState(true);

  const plans = [
    {
      name: 'Starter',
      description: 'For individuals getting started with insurance appeals',
      monthlyPrice: 0,
      annualPrice: 0,
      cta: 'Get Started Free',
      ctaVariant: 'outlined',
      popular: false,
      features: [
        { text: '3 appeals per month', included: true },
        { text: 'Basic document upload', included: true },
        { text: 'Standard appeal templates', included: true },
        { text: 'Email support', included: true },
        { text: 'Appeal status tracking', included: true },
        { text: 'AI appeal generation', included: false },
        { text: 'Analytics & reporting', included: false },
        { text: 'Team collaboration', included: false },
        { text: 'API access', included: false },
        { text: 'Priority support', included: false },
      ],
    },
    {
      name: 'Professional',
      description: 'For practices and billing departments',
      monthlyPrice: 49,
      annualPrice: 39,
      cta: 'Start Free Trial',
      ctaVariant: 'contained',
      popular: true,
      features: [
        { text: 'Unlimited appeals', included: true },
        { text: 'Advanced document processing & OCR', included: true },
        { text: 'All appeal templates', included: true },
        { text: 'Priority email & chat support', included: true },
        { text: 'Real-time appeal tracking', included: true },
        { text: 'AI appeal generation (unlimited)', included: true },
        { text: 'Analytics & reporting dashboard', included: true },
        { text: 'Team collaboration (up to 10 users)', included: true },
        { text: 'API access', included: false },
        { text: 'Dedicated account manager', included: false },
      ],
    },
    {
      name: 'Enterprise',
      description: 'For hospitals and large organizations',
      monthlyPrice: 199,
      annualPrice: 159,
      cta: 'Contact Sales',
      ctaVariant: 'outlined',
      popular: false,
      features: [
        { text: 'Unlimited appeals', included: true },
        { text: 'Advanced document processing & OCR', included: true },
        { text: 'Custom appeal templates', included: true },
        { text: '24/7 phone & email support', included: true },
        { text: 'Real-time appeal tracking', included: true },
        { text: 'AI appeal generation (unlimited)', included: true },
        { text: 'Advanced analytics & custom reports', included: true },
        { text: 'Unlimited team members', included: true },
        { text: 'Full API access & webhooks', included: true },
        { text: 'Dedicated account manager & onboarding', included: true },
      ],
    },
  ];

  const faqs = [
    {
      q: 'How does the free trial work?',
      a: 'Start with a 14-day free trial of the Professional plan. No credit card required. If you love it, choose a plan. Otherwise, you\'ll automatically move to the free Starter plan.',
    },
    {
      q: 'Can I change plans at any time?',
      a: 'Yes! You can upgrade, downgrade, or cancel your plan at any time. Changes take effect at the start of your next billing cycle.',
    },
    {
      q: 'Is my data secure and HIPAA compliant?',
      a: 'Absolutely. All data is encrypted at rest and in transit. Our infrastructure is HIPAA compliant, and we sign BAAs with all Enterprise customers.',
    },
    {
      q: 'What payment methods do you accept?',
      a: 'We accept all major credit cards (Visa, Mastercard, AmEx), ACH transfers, and wire transfers for Enterprise plans.',
    },
    {
      q: 'Do you offer discounts for non-profits?',
      a: 'Yes! We offer 30% off for qualified non-profit organizations and patient advocacy groups. Contact us to learn more.',
    },
    {
      q: 'What happens to my data if I cancel?',
      a: 'Your data is retained for 30 days after cancellation. You can export everything at any time. After 30 days, all data is permanently deleted.',
    },
  ];

  return (
    <Box sx={{ bgcolor: '#fff', minHeight: '100vh' }}>
      {/* Navigation */}
      <AppBar position="fixed" color="inherit" elevation={1} sx={{ bgcolor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)' }}>
        <Toolbar sx={{ justifyContent: 'space-between', maxWidth: 1200, width: '100%', mx: 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }} onClick={() => navigate('/landing')}>
            <HealthIcon sx={{ color: 'primary.main', fontSize: 32 }} />
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>AppealAid</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {!isMobile && (
              <>
                <Button color="inherit" onClick={() => navigate('/landing')}>Home</Button>
                <Button color="inherit" sx={{ fontWeight: 600 }}>Pricing</Button>
              </>
            )}
            <Button variant="outlined" onClick={() => navigate('/login')}>Sign In</Button>
            <Button variant="contained" onClick={() => navigate('/register')} disableElevation>Start Free Trial</Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Header */}
      <Box sx={{ pt: { xs: 14, md: 16 }, pb: { xs: 4, md: 6 }, textAlign: 'center' }}>
        <Container maxWidth="md">
          <Chip label="Pricing" color="primary" variant="outlined" sx={{ mb: 2 }} />
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 2, fontSize: { xs: '1.8rem', md: '2.4rem' } }}>
            Simple, Transparent Pricing
          </Typography>
          <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 400, mb: 4 }}>
            Start free. Scale as you grow. No hidden fees.
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
            <Typography variant="body1" sx={{ fontWeight: annual ? 400 : 600 }}>Monthly</Typography>
            <Switch checked={annual} onChange={() => setAnnual(!annual)} color="primary" />
            <Typography variant="body1" sx={{ fontWeight: annual ? 600 : 400 }}>
              Annual <Chip label="Save 20%" size="small" color="success" sx={{ ml: 0.5 }} />
            </Typography>
          </Stack>
        </Container>
      </Box>

      {/* Pricing Cards */}
      <Box sx={{ pb: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={3} alignItems="stretch" justifyContent="center">
            {plans.map((plan, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card
                  elevation={0}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    border: plan.popular ? '2px solid' : '1px solid',
                    borderColor: plan.popular ? 'primary.main' : 'divider',
                    position: 'relative',
                    transition: 'all 0.3s ease',
                    '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 40px rgba(0,0,0,0.1)' },
                  }}
                >
                  {plan.popular && (
                    <Chip
                      label="Most Popular"
                      color="primary"
                      size="small"
                      icon={<StarIcon />}
                      sx={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', fontWeight: 600 }}
                    />
                  )}
                  <CardContent sx={{ p: 4, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>{plan.name}</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>{plan.description}</Typography>
                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                        <Typography variant="h3" sx={{ fontWeight: 800 }}>
                          ${annual ? plan.annualPrice : plan.monthlyPrice}
                        </Typography>
                        {plan.monthlyPrice > 0 && (
                          <Typography variant="body1" sx={{ color: 'text.secondary' }}>/month</Typography>
                        )}
                      </Box>
                      {plan.monthlyPrice > 0 && annual && (
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          Billed annually (${plan.annualPrice * 12}/year)
                        </Typography>
                      )}
                      {plan.monthlyPrice === 0 && (
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>Free forever</Typography>
                      )}
                    </Box>
                    <Button
                      variant={plan.ctaVariant}
                      fullWidth
                      size="large"
                      onClick={() => navigate(plan.monthlyPrice === 0 ? '/register' : '/register')}
                      disableElevation
                      sx={{ py: 1.5, mb: 3, fontWeight: 600 }}
                    >
                      {plan.cta}
                    </Button>
                    <Divider sx={{ mb: 2 }} />
                    <List dense sx={{ flexGrow: 1 }}>
                      {plan.features.map((feature, i) => (
                        <ListItem key={i} disableGutters sx={{ py: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            {feature.included ? (
                              <CheckIcon sx={{ color: 'success.main', fontSize: 20 }} />
                            ) : (
                              <CancelIcon sx={{ color: 'text.disabled', fontSize: 20 }} />
                            )}
                          </ListItemIcon>
                          <ListItemText
                            primary={feature.text}
                            primaryTypographyProps={{
                              variant: 'body2',
                              color: feature.included ? 'text.primary' : 'text.disabled',
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* FAQ Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: '#f8f9fa' }}>
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 2, fontSize: { xs: '1.8rem', md: '2.2rem' } }}>
              Frequently Asked Questions
            </Typography>
          </Box>
          <Stack spacing={3}>
            {faqs.map((faq, index) => (
              <Card key={index} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, fontSize: '1rem' }}>{faq.q}</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>{faq.a}</Typography>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Container>
      </Box>

      {/* CTA */}
      <Box sx={{ py: 8, background: 'linear-gradient(135deg, #2D7DD2 0%, #1a5fa8 100%)' }}>
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#fff', mb: 2 }}>
              Start Winning More Appeals Today
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.85)', mb: 4 }}>
              14-day free trial. No credit card required. Cancel anytime.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/register')}
              sx={{
                py: 1.5, px: 4, fontSize: '1.05rem', fontWeight: 600,
                bgcolor: '#fff', color: 'primary.main',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
              }}
              disableElevation
            >
              Start Free Trial
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ py: 4, bgcolor: '#1a1a2e' }}>
        <Container maxWidth="lg">
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" spacing={2}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <HealthIcon sx={{ color: '#fff', fontSize: 24 }} />
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                &copy; {new Date().getFullYear()} AppealAid, Inc.
              </Typography>
            </Box>
            <Stack direction="row" spacing={3}>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', cursor: 'pointer', '&:hover': { color: '#fff' } }} onClick={() => navigate('/terms')}>Terms</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', cursor: 'pointer', '&:hover': { color: '#fff' } }} onClick={() => navigate('/privacy')}>Privacy</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', cursor: 'pointer', '&:hover': { color: '#fff' } }} onClick={() => navigate('/landing')}>Home</Typography>
            </Stack>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};

export default Pricing;
