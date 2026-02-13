import React from 'react';
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
  Avatar,
  Chip,
  Divider,
  useTheme,
  useMediaQuery,
  AppBar,
  Toolbar,
  IconButton,
} from '@mui/material';
import {
  Description as DescriptionIcon,
  AutoAwesome as AIIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  Analytics as AnalyticsIcon,
  Group as GroupIcon,
  CheckCircle as CheckIcon,
  ArrowForward as ArrowForwardIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  Gavel as GavelIcon,
  HealthAndSafety as HealthIcon,
} from '@mui/icons-material';

const Landing = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const features = [
    {
      icon: <AIIcon sx={{ fontSize: 40 }} />,
      title: 'AI-Powered Appeals',
      description: 'Generate compelling appeal letters using advanced AI that analyzes denial reasons and builds evidence-based arguments.',
    },
    {
      icon: <DescriptionIcon sx={{ fontSize: 40 }} />,
      title: 'Smart Document Processing',
      description: 'Upload EOBs, denial letters, and medical records. Our OCR engine extracts key data automatically.',
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 40 }} />,
      title: 'Fast Turnaround',
      description: 'Reduce appeal preparation from days to minutes. Pre-built templates and AI drafting accelerate every step.',
    },
    {
      icon: <AnalyticsIcon sx={{ fontSize: 40 }} />,
      title: 'Analytics & Reporting',
      description: 'Track success rates, identify patterns, and optimize your appeal strategy with real-time dashboards.',
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40 }} />,
      title: 'HIPAA Compliant',
      description: 'Enterprise-grade security with encryption at rest and in transit. Your patient data stays protected.',
    },
    {
      icon: <GroupIcon sx={{ fontSize: 40 }} />,
      title: 'Team Collaboration',
      description: 'Coordinate between providers, billing staff, and peer reviewers in one unified platform.',
    },
  ];

  const steps = [
    { number: '01', title: 'Upload Documents', description: 'Upload your denial letter, EOB, and supporting medical records.' },
    { number: '02', title: 'AI Analysis', description: 'Our AI analyzes the denial reason and identifies the strongest grounds for appeal.' },
    { number: '03', title: 'Generate Appeal', description: 'Get a professionally drafted appeal letter with clinical evidence and legal citations.' },
    { number: '04', title: 'Track & Win', description: 'Submit your appeal and track its progress through resolution.' },
  ];

  const testimonials = [
    {
      name: 'Dr. Sarah Chen',
      role: 'Director of Revenue Cycle, Metro Health',
      text: 'AppealAid increased our appeal success rate from 42% to 78%. The AI-generated letters are thorough and persuasive.',
      rating: 5,
    },
    {
      name: 'James Rodriguez',
      role: 'Billing Manager, Valley Medical Group',
      text: 'We recovered $2.3M in denied claims last quarter alone. The ROI is incredible.',
      rating: 5,
    },
    {
      name: 'Lisa Park',
      role: 'Patient Advocate',
      text: 'Finally a tool that levels the playing field for patients fighting unfair denials. Game changer.',
      rating: 5,
    },
  ];

  const stats = [
    { value: '78%', label: 'Appeal Success Rate' },
    { value: '$4.2M+', label: 'Claims Recovered' },
    { value: '10,000+', label: 'Appeals Filed' },
    { value: '< 5 min', label: 'Average Draft Time' },
  ];

  return (
    <Box sx={{ bgcolor: '#fff', minHeight: '100vh' }}>
      {/* Navigation */}
      <AppBar position="fixed" color="inherit" elevation={1} sx={{ bgcolor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)' }}>
        <Toolbar sx={{ justifyContent: 'space-between', maxWidth: 1200, width: '100%', mx: 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }} onClick={() => navigate('/landing')}>
            <HealthIcon sx={{ color: 'primary.main', fontSize: 32 }} />
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
              AppealAid
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {!isMobile && (
              <>
                <Button color="inherit" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>Features</Button>
                <Button color="inherit" onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}>How It Works</Button>
                <Button color="inherit" onClick={() => navigate('/pricing')}>Pricing</Button>
              </>
            )}
            <Button variant="outlined" onClick={() => navigate('/login')}>Sign In</Button>
            <Button variant="contained" onClick={() => navigate('/register')} disableElevation>
              Start Free Trial
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Box
        sx={{
          pt: { xs: 14, md: 18 },
          pb: { xs: 8, md: 12 },
          background: 'linear-gradient(135deg, #f0f7ff 0%, #e8f4f8 50%, #f0faf0 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', bgcolor: 'rgba(45,125,210,0.06)' }} />
        <Box sx={{ position: 'absolute', bottom: -50, left: -50, width: 300, height: 300, borderRadius: '50%', bgcolor: 'rgba(151,204,4,0.06)' }} />
        <Container maxWidth="lg" sx={{ position: 'relative' }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Chip label="Now with GPT-4 powered analysis" color="primary" variant="outlined" sx={{ mb: 2, fontWeight: 500 }} />
              <Typography variant="h2" sx={{ fontWeight: 800, mb: 3, fontSize: { xs: '2.2rem', md: '3.2rem' }, lineHeight: 1.2, color: '#1a1a2e' }}>
                Win More Insurance Appeals with{' '}
                <Box component="span" sx={{ color: 'primary.main' }}>AI-Powered</Box>{' '}
                Automation
              </Typography>
              <Typography variant="h6" sx={{ mb: 4, color: 'text.secondary', fontWeight: 400, maxWidth: 560, lineHeight: 1.6 }}>
                Stop losing revenue to denied claims. AppealAid uses artificial intelligence to draft compelling appeals, process documents, and track outcomes — turning denials into approvals.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/register')}
                  endIcon={<ArrowForwardIcon />}
                  sx={{ py: 1.5, px: 4, fontSize: '1.05rem', fontWeight: 600 }}
                  disableElevation
                >
                  Start Free Trial
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/login')}
                  sx={{ py: 1.5, px: 4, fontSize: '1.05rem' }}
                >
                  Try Instant Demo
                </Button>
              </Stack>
              <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                No credit card required. 14-day free trial.
              </Typography>
            </Grid>
            <Grid item xs={12} md={5}>
              <Box
                sx={{
                  bgcolor: '#fff',
                  borderRadius: 3,
                  p: 3,
                  boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
                  border: '1px solid rgba(0,0,0,0.06)',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#ff5f57' }} />
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#ffbd2e' }} />
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#28c840' }} />
                </Box>
                <Box sx={{ bgcolor: '#f8f9fa', borderRadius: 2, p: 2, mb: 2 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>AI Analysis Complete</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>Denial Reason: Medical Necessity (Code: CO-50)</Typography>
                  <Typography variant="body2" sx={{ color: 'success.main', mt: 1, fontWeight: 500 }}>
                    Appeal confidence: 87% — Strong clinical evidence found
                  </Typography>
                </Box>
                <Box sx={{ bgcolor: '#f0f7ff', borderRadius: 2, p: 2, mb: 2 }}>
                  <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600 }}>Generated Appeal Letter</Typography>
                  <Typography variant="body2" sx={{ mt: 0.5, color: 'text.secondary', fontSize: '0.8rem' }}>
                    "Dear Claims Review Department, I am writing to formally appeal the denial of coverage for the medically necessary procedure performed on..."
                  </Typography>
                </Box>
                <Chip label="Ready to submit" color="success" size="small" icon={<CheckIcon />} />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Stats Bar */}
      <Box sx={{ bgcolor: 'primary.main', py: 4 }}>
        <Container maxWidth="lg">
          <Grid container spacing={3} justifyContent="center">
            {stats.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: '#fff', fontSize: { xs: '1.8rem', md: '2.4rem' } }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
                    {stat.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box id="features" sx={{ py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Chip label="Features" color="primary" variant="outlined" sx={{ mb: 2 }} />
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 2, fontSize: { xs: '1.8rem', md: '2.4rem' } }}>
              Everything You Need to Win Appeals
            </Typography>
            <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 400, maxWidth: 600, mx: 'auto' }}>
              A complete platform for managing insurance denials from document intake to successful resolution.
            </Typography>
          </Box>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card
                  elevation={0}
                  sx={{
                    height: '100%',
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'all 0.3s ease',
                    '&:hover': { borderColor: 'primary.main', transform: 'translateY(-4px)', boxShadow: '0 12px 40px rgba(45,125,210,0.12)' },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ color: 'primary.main', mb: 2 }}>{feature.icon}</Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>{feature.title}</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>{feature.description}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* How It Works */}
      <Box id="how-it-works" sx={{ py: { xs: 8, md: 12 }, bgcolor: '#f8f9fa' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Chip label="How It Works" color="primary" variant="outlined" sx={{ mb: 2 }} />
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 2, fontSize: { xs: '1.8rem', md: '2.4rem' } }}>
              From Denial to Approval in 4 Steps
            </Typography>
          </Box>
          <Grid container spacing={4}>
            {steps.map((step, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Box sx={{ textAlign: 'center', position: 'relative' }}>
                  <Typography
                    variant="h2"
                    sx={{ fontWeight: 800, color: 'rgba(45,125,210,0.1)', fontSize: '4rem', mb: 1 }}
                  >
                    {step.number}
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>{step.title}</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>{step.description}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Testimonials */}
      <Box sx={{ py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Chip label="Testimonials" color="primary" variant="outlined" sx={{ mb: 2 }} />
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 2, fontSize: { xs: '1.8rem', md: '2.4rem' } }}>
              Trusted by Healthcare Professionals
            </Typography>
          </Box>
          <Grid container spacing={4}>
            {testimonials.map((t, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card elevation={0} sx={{ height: '100%', border: '1px solid', borderColor: 'divider', p: 1 }}>
                  <CardContent>
                    <Stack direction="row" spacing={0.5} sx={{ mb: 2 }}>
                      {[...Array(t.rating)].map((_, i) => (
                        <StarIcon key={i} sx={{ color: '#FFB400', fontSize: 20 }} />
                      ))}
                    </Stack>
                    <Typography variant="body1" sx={{ mb: 3, fontStyle: 'italic', color: 'text.secondary', lineHeight: 1.7 }}>
                      "{t.text}"
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                        {t.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{t.name}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>{t.role}</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ py: { xs: 8, md: 10 }, background: 'linear-gradient(135deg, #2D7DD2 0%, #1a5fa8 100%)' }}>
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h3" sx={{ fontWeight: 700, color: '#fff', mb: 2, fontSize: { xs: '1.8rem', md: '2.4rem' } }}>
              Ready to Stop Losing Revenue?
            </Typography>
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.85)', fontWeight: 400, mb: 4, maxWidth: 500, mx: 'auto' }}>
              Join thousands of healthcare professionals who are winning more appeals with AppealAid.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
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
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/pricing')}
                sx={{
                  py: 1.5, px: 4, fontSize: '1.05rem',
                  color: '#fff', borderColor: 'rgba(255,255,255,0.5)',
                  '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.1)' },
                }}
              >
                View Pricing
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ py: 6, bgcolor: '#1a1a2e' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <HealthIcon sx={{ color: '#fff', fontSize: 28 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff' }}>AppealAid</Typography>
              </Box>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mb: 2, maxWidth: 300 }}>
                AI-powered insurance appeal automation for healthcare providers and patients.
              </Typography>
            </Grid>
            <Grid item xs={6} md={2}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#fff', mb: 2 }}>Product</Typography>
              <Stack spacing={1}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', cursor: 'pointer', '&:hover': { color: '#fff' } }} onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>Features</Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', cursor: 'pointer', '&:hover': { color: '#fff' } }} onClick={() => navigate('/pricing')}>Pricing</Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', cursor: 'pointer', '&:hover': { color: '#fff' } }} onClick={() => navigate('/login')}>Demo</Typography>
              </Stack>
            </Grid>
            <Grid item xs={6} md={2}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#fff', mb: 2 }}>Company</Typography>
              <Stack spacing={1}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>About</Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>Blog</Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>Careers</Typography>
              </Stack>
            </Grid>
            <Grid item xs={6} md={2}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#fff', mb: 2 }}>Legal</Typography>
              <Stack spacing={1}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', cursor: 'pointer', '&:hover': { color: '#fff' } }} onClick={() => navigate('/terms')}>Terms of Service</Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', cursor: 'pointer', '&:hover': { color: '#fff' } }} onClick={() => navigate('/privacy')}>Privacy Policy</Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>HIPAA</Typography>
              </Stack>
            </Grid>
            <Grid item xs={6} md={2}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#fff', mb: 2 }}>Support</Typography>
              <Stack spacing={1}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>Help Center</Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>Contact Us</Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>Status</Typography>
              </Stack>
            </Grid>
          </Grid>
          <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.1)' }} />
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>
            &copy; {new Date().getFullYear()} AppealAid, Inc. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Landing;
