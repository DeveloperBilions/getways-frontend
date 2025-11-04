import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Grid,
  Divider,
  Paper,
  Chip
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { Parse } from 'parse';


const COMMERCE_HUB_SDK_VERSION = '3.5.5';
const COMMERCE_HUB_SDK_URL = `https://commercehub-secure-data-capture.fiservapps.com/${COMMERCE_HUB_SDK_VERSION}/checkout.js`;

const PazeDialog = ({ open, onClose, onSuccess, initialAmount = '', initialRemark = '' }) => {
  const [amount, setAmount] = useState(initialAmount);
  const [remark, setRemark] = useState(initialRemark);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [transactionData, setTransactionData] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [pazeComponent, setPazeComponent] = useState(null);
  const [pazeSelection, setPazeSelection] = useState(null);
  const [showPazeButton, setShowPazeButton] = useState(false);

  // Customer email (required for Paze)
  const [customerEmail, setCustomerEmail] = useState('');

  // Load Commerce Hub SDK script
  useEffect(() => {
    if (open && !sdkLoaded) {
      loadCommerceHubSDK();
    }
  }, [open]);

  // Update amount when initialAmount changes
  useEffect(() => {
    if (initialAmount) {
      setAmount(initialAmount);
    }
  }, [initialAmount]);

  // Update remark when initialRemark changes
  useEffect(() => {
    if (initialRemark) {
      setRemark(initialRemark);
    }
  }, [initialRemark]);

  const loadCommerceHubSDK = () => {
    // Check if SDK is already loaded
    if (window.fiserv) {
      setSdkLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = COMMERCE_HUB_SDK_URL;
    script.async = true;
    script.onload = () => {
      console.log('✅ Commerce Hub SDK loaded successfully');
      setSdkLoaded(true);
    };
    script.onerror = () => {
      console.error('❌ Failed to load Commerce Hub SDK');
      setError('Failed to load payment SDK. Please try again.');
    };
    document.body.appendChild(script);
  };

  const validateForm = () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return false;
    }

    if (!customerEmail || !customerEmail.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleInitializePaze = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      // STEP 2-5: Initialize recharge and get credentials from backend
      const sessionToken = Parse.User.current().getSessionToken();
      
      const response = await Parse.Cloud.run('pazeInitRecharge', {
        amount: parseFloat(amount),
        remark: remark || 'Paze Digital Wallet Recharge',
        customerInfo: {
          email: customerEmail
        }
      }, { sessionToken });

      if (!response.success) {
        throw new Error('Failed to initialize Paze payment session');
      }

      console.log('✅ STEP 2 Complete - Paze payment session initialized:', response);
      setTransactionData(response);

      // STEP 2: Initialize the SDK with credentials
      await initializeSDK(response.credentials);

      setLoading(false);

    } catch (err) {
      console.error('Paze payment initialization error:', err);
      setError(err.message || 'Failed to initialize Paze payment. Please try again.');
      setLoading(false);
    }
  };

  const initializeSDK = async (credentials) => {
    if (!window.fiserv) {
      throw new Error('Payment SDK not loaded');
    }

    try {
      console.log('🔧 STEP 2: Initializing Commerce Hub SDK for Paze...');

      // STEP 2: Initialize the SDK with credentials
      // From Documentation: "Use the await window.fiserv.init function to initialize the SDK"
      await window.fiserv.init({
        environment: process.env.REACT_APP_COMMERCE_HUB_ENVIRONMENT || 'CERT',
        accessToken: credentials.accessToken,
        apiKey: process.env.REACT_APP_COMMERCE_HUB_API_KEY,
        merchantId: process.env.REACT_APP_COMMERCE_HUB_MERCHANT_ID,
        terminalId: process.env.REACT_APP_COMMERCE_HUB_TERMINAL_ID,
        publicKey: credentials.publicKey,
        keyId: credentials.keyId
      });

      console.log('✅ STEP 2 Complete - SDK initialized successfully');

      // STEP 3: Initialize Paze component
      await initializePazeComponent();

    } catch (err) {
      console.error('SDK initialization error:', err);
      throw new Error('Failed to initialize Paze payment: ' + err.message);
    }
  };

  const initializePazeComponent = async () => {
    try {
      console.log('🔧 STEP 3: Initializing Paze component...');

      // STEP 3: Initialize the Paze component
      // From Documentation:
      // "The return of this function is a Promise that will resolve to a JavaScript 
      // object that can be used to interact with Paze"
      const pazePromise = window.fiserv.components.paze({
        displayName: process.env.REACT_APP_COMMERCE_HUB_DISPLAY_NAME || "Getways",
        cspNonce: crypto.randomUUID() // Optional CSP nonce
      });

      const paze = await pazePromise;
      setPazeComponent(paze);

      console.log('✅ STEP 3 Complete - Paze component initialized');
      setShowPazeButton(true);

    } catch (err) {
      console.error('Paze component initialization error:', err);
      throw new Error('Failed to initialize Paze component: ' + err.message);
    }
  };

  const handleLaunchPaze = async () => {
    if (!pazeComponent) {
      setError('Paze component not initialized');
      return;
    }

    try {
      setProcessingPayment(true);
      setError('');

      console.log('🔧 STEP 4: Launching Paze UI...');

      // STEP 4: Launch the Paze UI
      // From Documentation:
      // "On invoking selectPaymentMethod the SDK sets up and hands over control to Paze SDK.
      // The SDK will first create an iFrame overlay then a pop-up will open where the 
      // Paze experience is located."
      const selectionPromise = pazeComponent.selectPaymentMethod({
        customer: {
          email: customerEmail
        },
        amount: {
          currency: "USD",
          total: parseFloat(amount).toFixed(2)
        }
        // ecom fields are optional - can be added if shipping physical goods
      });

      const selection = await selectionPromise;
      
      console.log('✅ STEP 4 Complete - Paze selection received:', selection);
      setPazeSelection(selection);

      // STEP 5: Submit Paze payment method
      await handleSubmitPaze(selection);

    } catch (err) {
      console.error('Paze launch error:', err);
      setError('Failed to complete Paze selection: ' + (err.message || 'User may have cancelled'));
      setProcessingPayment(false);
    }
  };

  const handleSubmitPaze = async (selection) => {
    try {
      console.log('🔧 STEP 5: Submitting Paze payment method...');

      // STEP 5: Submit Paze payment method
      // From Documentation: "The submitPromise will resolve to the card capture API"
      const submitPromise = pazeComponent.submit({
        customer: {
          email: customerEmail
        },
        amount: {
          currency: "USD",
          total: parseFloat(amount).toFixed(2)
        }
      });

      await submitPromise;

      console.log('✅ STEP 5 Complete - Paze payment method submitted');

      // STEP 6: Complete payment via backend (Charges API)
      await handleCompletePayment(selection);

    } catch (err) {
      console.error('Paze submit error:', err);
      throw new Error('Failed to submit Paze payment: ' + err.message);
    }
  };

  const handleCompletePayment = async (pazeData) => {
    try {
      console.log('🔧 STEP 6: Completing payment via Charges API...');

      const sessionToken = Parse.User.current().getSessionToken();

      // STEP 6: Submit Charges API request
      // From Documentation:
      // "Submit a Charges API request with the sourceType of PaymentSession 
      // and the sessionID from the credentials request"
      const response = await Parse.Cloud.run('pazeCompleteRecharge', {
        transactionId: transactionData.transactionId,
        pazeData: pazeData
      }, { sessionToken });

      console.log('✅ STEP 6 Complete - Payment completed:', response);

      if (response.success) {
        setProcessingPayment(false);
        if (onSuccess) {
          onSuccess(response);
        }
        handleClose();
      } else {
        throw new Error(response.message || 'Payment not completed');
      }

    } catch (err) {
      console.error('Complete payment error:', err);
      setError('Failed to complete payment: ' + err.message);
      setProcessingPayment(false);
    }
  };

  const handleClose = () => {
    setAmount('');
    setRemark('');
    setCustomerEmail('');
    setError('');
    setLoading(false);
    setTransactionData(null);
    setProcessingPayment(false);
    setPazeComponent(null);
    setPazeSelection(null);
    setShowPazeButton(false);
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={loading || processingPayment ? null : handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccountBalanceWalletIcon color="primary" />
          <Typography variant="h6">Paze Digital Wallet</Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {!sdkLoaded && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
              <Typography sx={{ ml: 2 }}>Loading Paze SDK...</Typography>
            </Box>
          )}

          {sdkLoaded && !transactionData && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Pay with your Paze digital wallet. Fast, secure, and easy checkout.
                </Alert>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Amount (USD)"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  inputProps={{ min: 0, step: 0.01 }}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  required
                  helperText="Required for Paze authentication"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Remark (Optional)"
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  multiline
                  rows={2}
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                  <strong>How Paze Works:</strong>
                </Typography>
                <Typography variant="body2" color="textSecondary" component="ul" sx={{ mt: 1, pl: 2 }}>
                  <li>Authenticate via mobile phone one-time code</li>
                  <li>Select your saved card</li>
                  <li>Confirm payment (CVV required on first use)</li>
                  <li>Fast and secure checkout</li>
                </Typography>
              </Grid>
            </Grid>
          )}

          {transactionData && showPazeButton && !pazeSelection && (
            <Box>
              <Alert severity="info" sx={{ mb: 3 }}>
                Click the button below to launch Paze and select your payment method.
              </Alert>

              <Paper 
                elevation={0}
                sx={{ 
                  p: 3, 
                  textAlign: 'center',
                  border: '1px solid #e0e0e0',
                  borderRadius: 2,
                  mb: 2
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Total Amount
                </Typography>
                <Typography variant="h4" color="primary" gutterBottom>
                  ${parseFloat(amount).toFixed(2)}
                </Typography>
                
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleLaunchPaze}
                  disabled={processingPayment}
                  startIcon={<AccountBalanceWalletIcon />}
                  sx={{ mt: 2 }}
                >
                  Launch Paze Wallet
                </Button>
              </Paper>

              {processingPayment && (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 3 }}>
                  <CircularProgress size={24} sx={{ mr: 2 }} />
                  <Typography>
                    Processing Paze payment...
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {pazeSelection && (
            <Box>
              <Alert severity="success" sx={{ mb: 2 }}>
                Card selected successfully! Completing payment...
              </Alert>

              <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                <Typography variant="subtitle2" gutterBottom>
                  Selected Card
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <Chip 
                    label={pazeSelection.card?.brand || 'Card'} 
                    color="primary" 
                    size="small" 
                  />
                  <Typography variant="body2">
                    •••• {pazeSelection.card?.last4 || '****'}
                  </Typography>
                  {pazeSelection.card?.type && (
                    <Chip 
                      label={pazeSelection.card.type} 
                      size="small" 
                      variant="outlined"
                    />
                  )}
                </Box>
                {pazeSelection.customer?.fullName && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {pazeSelection.customer.fullName}
                  </Typography>
                )}
              </Paper>

              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 3 }}>
                <CircularProgress size={24} sx={{ mr: 2 }} />
                <Typography>
                  Completing payment...
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button 
          onClick={handleClose} 
          disabled={loading || processingPayment}
        >
          Cancel
        </Button>
        
        {!transactionData && (
          <Button
            onClick={handleInitializePaze}
            variant="contained"
            disabled={loading || !sdkLoaded}
            startIcon={loading ? <CircularProgress size={20} /> : <AccountBalanceWalletIcon />}
          >
            {loading ? 'Initializing...' : 'Continue to Paze'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default PazeDialog;
