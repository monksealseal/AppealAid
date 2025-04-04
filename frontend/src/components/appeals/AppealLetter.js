import React from 'react';
import { Box, Paper, Typography, Divider, Button } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import DownloadIcon from '@mui/icons-material/Download';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const AppealLetter = ({ appeal }) => {
  // Function to copy letter to clipboard
  const handleCopyLetter = () => {
    if (appeal.letter) {
      navigator.clipboard.writeText(appeal.letter);
    } else {
      // Generate a sample letter for copying
      const sampleLetter = generateSampleLetter();
      navigator.clipboard.writeText(sampleLetter);
    }
  };
  
  // Function to generate a sample letter based on appeal data
  const generateSampleLetter = () => {
    return `[Appeal Letter]

${new Date().toLocaleDateString()}

${appeal.insuranceCompany || "Insurance Company"}
Attn: Appeals Department

Re: Appeal for Claim #${appeal.claimId || "[Claim Number]"}
Patient: ${appeal.patient?.name || "[Patient Name]"}
Member ID: ${appeal.insuranceMemberId || "[Member ID]"}

To Whom It May Concern:

I am writing to appeal the denial of coverage for ${appeal.serviceName || "[Service Name]"}. This letter serves as my formal request for reconsideration of this claim.

[... Detailed appeal content would appear here ...]

Thank you for your prompt attention to this matter. If you require any additional information, please contact me at [Contact Information].

Sincerely,

[Patient Name]`;
  };

  return (
    <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Appeal Letter
        </Typography>
        
        <Box>
          <Button 
            startIcon={<PrintIcon />}
            sx={{ mr: 1 }}
            size="small"
            onClick={() => window.print()}
          >
            Print
          </Button>
          <Button 
            startIcon={<DownloadIcon />} 
            sx={{ mr: 1 }}
            size="small"
          >
            Download
          </Button>
          <Button 
            startIcon={<ContentCopyIcon />}
            size="small"
            onClick={handleCopyLetter}
          >
            Copy
          </Button>
        </Box>
      </Box>
      
      <Divider sx={{ mb: 3 }} />
      
      <Box sx={{ p: 2, border: '1px solid #eee', borderRadius: 1, bgcolor: '#fafafa', mb: 3 }}>
        <Typography variant="body1" sx={{ whiteSpace: 'pre-line', fontFamily: '"Roboto Mono", monospace' }}>
          {/* This would be the actual appeal letter content */}
          {appeal.letter || 
            `[Appeal Letter Placeholder - In a real implementation, this would be the full appeal letter text generated based on the appeal data and template.]

${new Date().toLocaleDateString()}

${appeal.insuranceCompany || "Insurance Company"}
Attn: Appeals Department

Re: Appeal for Claim #${appeal.claimId || "[Claim Number]"}
Patient: ${appeal.patient?.name || "[Patient Name]"}
Member ID: ${appeal.insuranceMemberId || "[Member ID]"}

To Whom It May Concern:

I am writing to appeal the denial of coverage for ${appeal.serviceName || "[Service Name]"}. This letter serves as my formal request for reconsideration of this claim.

[... Detailed appeal content would appear here ...]

Thank you for your prompt attention to this matter. If you require any additional information, please contact me at [Contact Information].

Sincerely,

[Patient Name]
`
          }
        </Typography>
      </Box>
    </Paper>
  );
};

export default AppealLetter;