/**
 * Term Definition Component
 * 
 * Provides contextual help for insurance and medical terminology
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { 
  Tooltip, 
  Typography, 
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box
} from '@mui/material';
import { 
  HelpOutline as HelpIcon,
  Close as CloseIcon 
} from '@mui/icons-material';

// Dictionary of common insurance and medical terms with their definitions
const TERM_DICTIONARY = {
  // Insurance terminology
  'appeal': 'A formal request to an insurance company to reconsider a denied claim or service.',
  'claim': 'A request for payment or coverage sent to an insurance company for healthcare services.',
  'premium': 'The amount paid to an insurance company for coverage, typically on a monthly basis.',
  'deductible': 'The amount you pay for covered healthcare services before your insurance plan starts to pay.',
  'coinsurance': 'The percentage of costs you pay for a covered healthcare service, after you have paid your deductible.',
  'copay': 'A fixed amount you pay for a covered healthcare service, usually when you receive the service.',
  'out-of-pocket maximum': 'The most you have to pay for covered services in a plan year. After you spend this amount on deductibles, copayments, and coinsurance, your health plan pays 100% of the costs of covered benefits.',
  'eob': 'Explanation of Benefits - A statement from your insurance company explaining what medical treatments and services were paid for on your behalf.',
  'preauthorization': 'Approval from an insurance plan that a service, prescription, or equipment is medically necessary before receiving it.',
  'medical necessity': 'Healthcare services that are considered appropriate and needed for diagnosing or treating a medical condition.',
  'denial': 'When an insurance company refuses to pay for a healthcare service or item.',
  'in-network': 'Providers or facilities that have contracted with your insurance company to provide services at negotiated rates.',
  'out-of-network': 'Providers or facilities that have not contracted with your insurance company, often resulting in higher costs.',
  'prior authorization': 'A decision by your health insurer that a healthcare service is medically necessary before you receive it.',
  
  // Appeal-specific terms
  'level 1 appeal': 'The first appeal submitted to your insurance company, requesting reconsideration of a denied claim.',
  'level 2 appeal': 'A second appeal submitted if the first appeal is denied, often reviewed by different personnel.',
  'external review': 'An independent review by a third party not affiliated with your insurance company.',
  'peer-to-peer review': 'A discussion between your doctor and a medical reviewer from the insurance company about the medical necessity of a service.',
  'expedited appeal': 'A faster appeal process when waiting for a standard appeal decision could jeopardize your health.',
  
  // Common denial reasons
  'experimental': 'Treatment or procedure that is not widely accepted in the medical community or is considered investigational.',
  'not medically necessary': 'The insurance company has determined that a service is not needed for your medical condition based on their criteria.',
  'out of network': 'Services received from providers or facilities that have no contract with your insurance company.',
  'non-covered benefit': 'Services that are specifically excluded from coverage in your insurance policy.',
  'coding error': 'Mistakes in the billing codes submitted to the insurance company.',
  
  // UnitedHealthcare specific terms
  'nh predict': 'UnitedHealthcare\'s algorithm-based system that uses data analytics to predict and automatically deny claims based on various factors.',
  'advance notification': 'UnitedHealthcare\'s term for preauthorization, where providers must notify UHC before certain services are performed.',
  'concurrent review': 'UnitedHealthcare\'s process of reviewing ongoing treatment to determine continued coverage.',
};

/**
 * Component that provides contextual definition tooltips for insurance terminology
 */
const TermDefinition = ({ 
  term, 
  definition, 
  children, 
  iconSize = 'small',
  showDialog = false
}) => {
  const [open, setOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Normalize term for dictionary lookup
  const normalizedTerm = term.toLowerCase();
  
  // Get definition from dictionary or use provided definition
  const definitionText = definition || TERM_DICTIONARY[normalizedTerm] || 
    `No definition available for "${term}". Please consult your insurance documentation.`;

  const handleIconClick = (event) => {
    event.stopPropagation();
    if (showDialog) {
      setDialogOpen(true);
    } else {
      setOpen(!open);
    }
  };

  // For simple tooltip mode
  if (!showDialog) {
    return (
      <Tooltip
        title={
          <Typography variant="body2">
            <strong>{term}:</strong> {definitionText}
          </Typography>
        }
        open={open}
        onClose={() => setOpen(false)}
        onOpen={() => setOpen(true)}
        arrow
      >
        <Typography component="span" sx={{ display: 'inline-flex', alignItems: 'center' }}>
          {children || term}
          <IconButton 
            size="small" 
            onClick={handleIconClick} 
            sx={{ ml: 0.5, p: 0 }}
            aria-label={`Definition of ${term}`}
          >
            <HelpIcon fontSize={iconSize} color="action" />
          </IconButton>
        </Typography>
      </Tooltip>
    );
  }
  
  // For dialog mode with more detailed information
  return (
    <>
      <Typography component="span" sx={{ display: 'inline-flex', alignItems: 'center' }}>
        {children || term}
        <IconButton 
          size="small" 
          onClick={handleIconClick} 
          sx={{ ml: 0.5, p: 0 }}
          aria-label={`Definition of ${term}`}
        >
          <HelpIcon fontSize={iconSize} color="primary" />
        </IconButton>
      </Typography>
      
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        aria-labelledby={`term-dialog-${normalizedTerm}`}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id={`term-dialog-${normalizedTerm}`} sx={{ pr: 6 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              {term}
            </Typography>
            <IconButton
              aria-label="close"
              onClick={() => setDialogOpen(false)}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent dividers>
          <Typography variant="body1" gutterBottom>
            {definitionText}
          </Typography>
          
          {/* Additional related terms if needed */}
          {normalizedTerm === 'appeal' && (
            <Box mt={2}>
              <Typography variant="subtitle2" gutterBottom>
                Related Terms:
              </Typography>
              <Typography variant="body2" paragraph>
                <strong>Level 1 Appeal:</strong> {TERM_DICTIONARY['level 1 appeal']}
              </Typography>
              <Typography variant="body2" paragraph>
                <strong>Level 2 Appeal:</strong> {TERM_DICTIONARY['level 2 appeal']}
              </Typography>
              <Typography variant="body2">
                <strong>External Review:</strong> {TERM_DICTIONARY['external review']}
              </Typography>
            </Box>
          )}
          
          {normalizedTerm === 'nh predict' && (
            <Box mt={2}>
              <Typography variant="subtitle2" color="error" gutterBottom>
                Important Note:
              </Typography>
              <Typography variant="body2">
                UnitedHealthcare's nH Predict algorithm has been criticized for potentially 
                leading to inappropriate claim denials. When appealing denials from this system, 
                it's important to emphasize clinical evidence and highlight any errors in how 
                the algorithm assessed your claim.
              </Typography>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

TermDefinition.propTypes = {
  term: PropTypes.string.isRequired,
  definition: PropTypes.string,
  children: PropTypes.node,
  iconSize: PropTypes.string,
  showDialog: PropTypes.bool
};

export default TermDefinition;