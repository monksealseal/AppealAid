import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  AppBar,
  Toolbar,
  Stack,
  Divider,
} from '@mui/material';
import { HealthAndSafety as HealthIcon } from '@mui/icons-material';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  const sections = [
    {
      title: '1. Introduction',
      content: `AppealAid, Inc. ("AppealAid," "we," "our," or "us") is committed to protecting the privacy and security of your personal information. This Privacy Policy describes how we collect, use, disclose, and safeguard your information when you use our insurance appeal automation platform and related services (the "Service"). We handle protected health information (PHI) in compliance with the Health Insurance Portability and Accountability Act (HIPAA) and applicable state privacy laws.`,
    },
    {
      title: '2. Information We Collect',
      content: `We collect the following types of information:

Account Information: Name, email address, phone number, date of birth, and password when you create an account.

Insurance Information: Insurance carrier name, member ID, group number, and policy details that you provide for appeal processing.

Health Information: Medical records, explanation of benefits (EOBs), denial letters, clinical notes, and other healthcare documents you upload to the Service. This information may constitute Protected Health Information (PHI) under HIPAA.

Usage Data: Information about how you interact with the Service, including pages visited, features used, appeal outcomes, and session duration.

Device Information: Browser type, operating system, IP address, and device identifiers collected automatically when you access the Service.

Payment Information: Billing address and payment method details processed securely through our third-party payment processor (Stripe). We do not store full credit card numbers on our servers.`,
    },
    {
      title: '3. How We Use Your Information',
      content: `We use your information to:

- Provide, maintain, and improve the Service
- Process and manage your insurance appeals
- Generate AI-powered appeal letters and analysis
- Process payments and manage subscriptions
- Send you important service notifications
- Provide customer support
- Analyze usage patterns to improve our platform
- Comply with legal obligations
- Detect and prevent fraud or abuse

We will never sell your personal information or health data to third parties.`,
    },
    {
      title: '4. HIPAA Compliance',
      content: `AppealAid processes Protected Health Information (PHI) and maintains compliance with HIPAA requirements:

- We implement administrative, physical, and technical safeguards to protect PHI
- All PHI is encrypted at rest (AES-256) and in transit (TLS 1.3)
- Access to PHI is limited to authorized personnel on a need-to-know basis
- We maintain comprehensive audit logs of all PHI access
- We conduct regular security risk assessments
- We execute Business Associate Agreements (BAAs) with Enterprise customers
- We train all employees on HIPAA requirements
- We have established breach notification procedures compliant with HIPAA requirements

For Enterprise customers requiring a BAA, please contact us at compliance@appealaid.com.`,
    },
    {
      title: '5. Data Sharing and Disclosure',
      content: `We may share your information in the following circumstances:

Service Providers: With trusted third-party vendors who assist in operating our Service (hosting, payment processing, analytics), bound by confidentiality agreements.

AI Processing: Document content is processed by AI models to generate appeals. We use enterprise-grade AI services with data processing agreements that prohibit using your data for model training.

Legal Requirements: When required by law, court order, or governmental regulation.

Business Transfers: In connection with a merger, acquisition, or sale of assets, with notice to affected users.

With Your Consent: When you explicitly authorize us to share information.

We do not share your information with advertisers or data brokers.`,
    },
    {
      title: '6. Data Security',
      content: `We implement industry-leading security measures to protect your data:

- AES-256 encryption for data at rest
- TLS 1.3 encryption for data in transit
- Multi-factor authentication support
- Regular penetration testing and security audits
- SOC 2 Type II compliant infrastructure
- Role-based access controls
- Automated threat detection and monitoring
- Secure, redundant data backups
- Incident response procedures

Despite our efforts, no method of electronic transmission or storage is 100% secure. We cannot guarantee absolute security but are committed to maintaining the highest standards.`,
    },
    {
      title: '7. Data Retention',
      content: `We retain your information for as long as your account is active or as needed to provide services. Specifically:

- Account data: Retained while your account is active, deleted 30 days after account closure
- Appeal documents and records: Retained for 7 years to comply with healthcare record retention requirements, unless you request earlier deletion
- Usage analytics: Retained in anonymized form for up to 3 years
- Payment records: Retained for 7 years for tax and compliance purposes

You may request deletion of your data at any time by contacting us at privacy@appealaid.com.`,
    },
    {
      title: '8. Your Rights',
      content: `Depending on your jurisdiction, you may have the following rights:

- Access: Request a copy of your personal data
- Correction: Request correction of inaccurate data
- Deletion: Request deletion of your data (subject to legal retention requirements)
- Portability: Request your data in a machine-readable format
- Restriction: Request restricted processing of your data
- Objection: Object to certain types of processing
- Withdrawal: Withdraw consent for data processing

California residents have additional rights under the CCPA/CPRA. To exercise any of these rights, contact us at privacy@appealaid.com. We will respond within 30 days.`,
    },
    {
      title: '9. Cookies and Tracking',
      content: `We use essential cookies required for the Service to function properly (authentication, session management). We use analytics cookies to understand how the Service is used. You can control cookie preferences through your browser settings. We do not use advertising cookies or tracking pixels.`,
    },
    {
      title: '10. Children\'s Privacy',
      content: `The Service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we discover that we have collected information from a child under 13, we will delete it promptly.`,
    },
    {
      title: '11. International Data Transfers',
      content: `Your information is processed and stored in the United States. If you access the Service from outside the United States, your information will be transferred to and processed in the United States, where data protection laws may differ from those in your jurisdiction.`,
    },
    {
      title: '12. Changes to This Policy',
      content: `We may update this Privacy Policy periodically. We will notify you of material changes by email or through the Service at least 30 days before changes take effect. Your continued use of the Service after the effective date constitutes acceptance of the updated policy.`,
    },
    {
      title: '13. Contact Us',
      content: `For questions about this Privacy Policy or our data practices, contact us at:

AppealAid, Inc.
Privacy Officer
Email: privacy@appealaid.com
Address: 123 Innovation Drive, Suite 400, Wilmington, DE 19801

For HIPAA-related inquiries: compliance@appealaid.com`,
    },
  ];

  return (
    <Box sx={{ bgcolor: '#fff', minHeight: '100vh' }}>
      <AppBar position="fixed" color="inherit" elevation={1} sx={{ bgcolor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)' }}>
        <Toolbar sx={{ justifyContent: 'space-between', maxWidth: 1200, width: '100%', mx: 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }} onClick={() => navigate('/landing')}>
            <HealthIcon sx={{ color: 'primary.main', fontSize: 32 }} />
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>AppealAid</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button variant="outlined" onClick={() => navigate('/login')}>Sign In</Button>
            <Button variant="contained" onClick={() => navigate('/register')} disableElevation>Start Free Trial</Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ pt: 14, pb: 8 }}>
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, fontSize: { xs: '1.8rem', md: '2.4rem' } }}>
          Privacy Policy
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4 }}>
          Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </Typography>
        <Divider sx={{ mb: 4 }} />

        <Stack spacing={4}>
          {sections.map((section, index) => (
            <Box key={index}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>{section.title}</Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                {section.content}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Container>

      <Box sx={{ py: 4, bgcolor: '#1a1a2e' }}>
        <Container maxWidth="lg">
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" spacing={2}>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
              &copy; {new Date().getFullYear()} AppealAid, Inc.
            </Typography>
            <Stack direction="row" spacing={3}>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', cursor: 'pointer', '&:hover': { color: '#fff' } }} onClick={() => navigate('/terms')}>Terms of Service</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', cursor: 'pointer', '&:hover': { color: '#fff' } }} onClick={() => navigate('/landing')}>Home</Typography>
            </Stack>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};

export default PrivacyPolicy;
