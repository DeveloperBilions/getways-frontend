import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Alert,
  Snackbar
} from '@mui/material';
import PaymentIcon from '@mui/icons-material/Payment';
import SecurityIcon from '@mui/icons-material/Security';
import CommerceHubSDKDialog from './dialog/CommerceHubSDKDialog';
import { useSearchParams } from 'react-router-dom';

/**
 * Commerce Hub Hosted Checkout SDK Recharge Component
 * This component demonstrates the integration of Fiserv Commerce Hub
 * Hosted Checkout SDK for recharge functionality
 */
const CommerceHubRecharge = () => {
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
  const remark = searchParams.get('remark');

  // Auto-open dialog if URL parameters are present (widget mode)
  useEffect(() => {
    if (amount && userId && type === 'AOG') {
      setDialogOpen(true);
    }
  }, [amount, userId, type]);

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    
    // If in widget mode, notify parent window
    if (type === 'AOG') {
      window.parent.postMessage({ type: 'PAYMENT_CANCELLED' }, '*');
    }
  };

  const handleSuccess = (response) => {
    console.log('Payment successful:', response);
    setSnackbar({
      open: true,
      message: `Payment successful! Transaction ID: ${response.transactionId}`,
      severity: 'success'
    });
    
    // If in widget mode, notify parent window
    if (type === 'AOG') {
      window.parent.postMessage({ type: 'PAYMENT_SUCCESS', data: response }, '*');
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // If in widget mode, show minimal UI
  if (type === 'AOG') {
    return (
      <Box sx={{ p: 2 }}>
        <CommerceHubSDKDialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          onSuccess={handleSuccess}
          initialAmount={amount || ''}
          initialRemark={remark || ''}
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
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Commerce Hub Recharge
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PaymentIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Typography variant="h6">
                  Hosted Checkout SDK
                </Typography>
              </Box>
              
              <Typography variant="body2" color="text.secondary" paragraph>
                Secure payment processing using Fiserv Commerce Hub's Hosted Checkout SDK. 
                The SDK handles payment data collection and PCI compliance.
              </Typography>

              <Button
                variant="contained"
                color="primary"
                onClick={handleOpenDialog}
                fullWidth
                size="large"
              >
                Recharge with Commerce Hub
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SecurityIcon sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                <Typography variant="h6">
                  3D Secure Support
                </Typography>
              </Box>
              
              <Typography variant="body2" color="text.secondary" paragraph>
                Optional 3D Secure authentication for enhanced security. 
                Seamlessly integrated with Commerce Hub's 3DS provider.
              </Typography>

              <Alert severity="info" sx={{ mt: 2 }}>
                3D Secure provides an additional layer of security for card transactions.
              </Alert>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Features
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box>
                    <Typography variant="subtitle2" color="primary">
                      ✓ PCI Compliant
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Hosted fields ensure PCI compliance
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Box>
                    <Typography variant="subtitle2" color="primary">
                      ✓ 3D Secure
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Optional 3DS authentication
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Box>
                    <Typography variant="subtitle2" color="primary">
                      ✓ Real-time Processing
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Instant payment confirmation
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Box>
                    <Typography variant="subtitle2" color="primary">
                      ✓ Secure Tokens
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Tokenization for card data security
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Integration Details
              </Typography>
              
              <Typography variant="body2" paragraph>
                This implementation follows the official Fiserv Commerce Hub documentation:
              </Typography>

              <Box component="ul" sx={{ pl: 2 }}>
                <li>
                  <Typography variant="body2">
                    <strong>Step 1:</strong> Domain whitelisting for CSP
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2">
                    <strong>Step 2:</strong> Security credentials API call
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2">
                    <strong>Step 3:</strong> SDK initialization with credentials
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2">
                    <strong>Step 4:</strong> Payment fields component loading
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2">
                    <strong>Step 5:</strong> Optional 3D Secure authentication
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2">
                    <strong>Step 6:</strong> Submit charges API request
                  </Typography>
                </li>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Commerce Hub SDK Dialog */}
      <CommerceHubSDKDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSuccess={handleSuccess}
      />

      {/* Success/Error Snackbar */}
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

export default CommerceHubRecharge;
