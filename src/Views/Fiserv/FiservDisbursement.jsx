import React, { useState, useEffect } from 'react';
import { Box, Alert, Snackbar } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import FiservDisbursementDialog from './FiservDisbursementDialog';

/**
 * Fiserv Digital Disbursements Widget Component
 * Handles cashout/redeem operations for PayPal and Venmo
 */
const FiservDisbursementWidget = () => {
  const [searchParams] = useSearchParams();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Get URL parameters for widget mode
  const amount = searchParams.get('amount');
  const userId = searchParams.get('userId');
  const type = searchParams.get('type');
  const method = searchParams.get('method'); // 'paypal' or 'venmo'
  const remark = searchParams.get('remark');

  // Auto-open dialog if URL parameters are present (widget mode)
  useEffect(() => {
    if (amount && userId && type === 'AOG' && method) {
      setDialogOpen(true);
    }
  }, [amount, userId, type, method]);

  const handleCloseDialog = () => {
    setDialogOpen(false);
    
    // If in widget mode, notify parent window
    if (type === 'AOG') {
      window.parent.postMessage({ type: 'CASHOUT_CANCELLED' }, '*');
    }
  };

  const handleSuccess = (response) => {
    console.log('Cashout successful:', response);
    setSnackbar({
      open: true,
      message: `Cashout successful! Transaction ID: ${response.merchantTransactionId}`,
      severity: 'success'
    });
    
    // If in widget mode, notify parent window
    if (type === 'AOG') {
      window.parent.postMessage({ type: 'CASHOUT_SUCCESS', data: response }, '*');
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Widget mode - minimal UI
  return (
    <Box sx={{ p: 2 }}>
      <FiservDisbursementDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        amount={amount || ''}
        method={method || 'paypal'}
        handleRefresh={() => {}}
        widgetMode={true}
        widgetUserId={userId}
        widgetType={type}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FiservDisbursementWidget;
