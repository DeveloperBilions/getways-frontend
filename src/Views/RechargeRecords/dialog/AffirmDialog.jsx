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
  Paper
} from '@mui/material';
import { Parse } from 'parse';

const COMMERCE_HUB_SDK_VERSION = '3.5.5';
const COMMERCE_HUB_SDK_URL = `https://commercehub-secure-data-capture.fiservapps.com/${COMMERCE_HUB_SDK_VERSION}/checkout.js`;

const AffirmDialog = ({ open, onClose, onSuccess, initialAmount = '', initialRemark = '' }) => {
  const [amount, setAmount] = useState(initialAmount);
  const [remark, setRemark] = useState(initialRemark);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [transactionData, setTransactionData] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [affirmButtonRendered, setAffirmButtonRendered] = useState(false);

  // Customer info fields (required for Affirm)
  const [customerInfo, setCustomerInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });

  // Billing address fields (required for Affirm)
  const [billingAddress, setBillingAddress] = useState({
    firstName: '',
    lastName: '',
    street: '',
    houseNumberOrName: '',
    city: '',
    stateOrProvince: '',
    postalCode: '',
    country: 'US'
  });

  // Shipping address fields (optional - only for physical goods)
  const [shippingAddress, setShippingAddress] = useState({
    firstName: '',
    lastName: '',
    street: '',
    houseNumberOrName: '',
    city: '',
    stateOrProvince: '',
    postalCode: '',
    country: 'US'
  });

  const [useShipping, setUseShipping] = useState(false);

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

  const handleCustomerInfoChange = (field, value) => {
    setCustomerInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleBillingAddressChange = (field, value) => {
    setBillingAddress(prev => ({ ...prev, [field]: value }));
  };

  const handleShippingAddressChange = (field, value) => {
    setShippingAddress(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return false;
    }

    if (!customerInfo.firstName || !customerInfo.lastName || !customerInfo.email) {
      setError('Customer first name, last name, and email are required for Affirm');
      return false;
    }

    if (!billingAddress.street || !billingAddress.city || !billingAddress.postalCode) {
      setError('Complete billing address is required for Affirm');
      return false;
    }

    return true;
  };

  const handleInitializePayment = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      // STEP 2: Initialize recharge and get credentials from backend
      // This calls the Security Credentials API via backend with Affirm data
      const sessionToken = Parse.User.current().getSessionToken();
      
      const initParams = {
        amount: parseFloat(amount),
        remark: remark || 'Affirm BNPL Recharge',
        customerInfo: customerInfo,
        billingAddress: {
          ...billingAddress,
          firstName: billingAddress.firstName || customerInfo.firstName,
          lastName: billingAddress.lastName || customerInfo.lastName
        }
      };

      // Add shipping address if provided
      if (useShipping && shippingAddress.city && shippingAddress.postalCode) {
        initParams.shippingAddress = {
          ...shippingAddress,
          firstName: shippingAddress.firstName || customerInfo.firstName,
          lastName: shippingAddress.lastName || customerInfo.lastName
        };
      }

      const response = await Parse.Cloud.run('affirmInitRecharge', initParams, {
        sessionToken
      });

      if (!response.success) {
        throw new Error('Failed to initialize Affirm payment session');
      }

      console.log('✅ STEP 2 Complete - Affirm payment session initialized:', response);
      setTransactionData(response);

      // STEP 3: Initialize the SDK with credentials
      await initializeSDK(response.credentials);

      setLoading(false);

    } catch (err) {
      console.error('Affirm payment initialization error:', err);
      setError(err.message || 'Failed to initialize Affirm payment. Please try again.');
      setLoading(false);
    }
  };

  const initializeSDK = async (credentials) => {
    if (!window.fiserv) {
      throw new Error('Payment SDK not loaded');
    }

    try {
      console.log('🔧 STEP 3: Initializing Commerce Hub SDK for Affirm...');

      // STEP 3: Initialize the SDK with credentials
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

      console.log('✅ STEP 3 Complete - SDK initialized successfully');

      // STEP 4: Initialize Affirm component
      await initializeAffirmComponent();

    } catch (err) {
      console.error('SDK initialization error:', err);
      throw new Error('Failed to initialize Affirm payment: ' + err.message);
    }
  };

  const initializeAffirmComponent = async () => {
    try {
      console.log('🔧 STEP 4: Initializing Affirm component...');
      setProcessingPayment(false); // Allow user to see the Affirm button

      // STEP 4: Initialize the Affirm component
      // From Documentation:
      // "Call the window.fiserv.components.affirm method to initialize the Affirm component"
      // 
      // The onApprove hook will contain orderId and transactionId from Affirm
      await window.fiserv.components.affirm({
        data: {
          intent: "CAPTURE",
          button: {
            parentElementId: "affirm-button-container",
            color: "default"
          }
        },
        hooks: {
          onApprove: async (data) => {
            // STEP 5 & 6: Handle Affirm approval
            console.log('✅ STEP 4 Complete - Affirm onApprove callback:', data);
            await handleAffirmApproval(data);
          },
          onError: (error) => {
            console.error('❌ Affirm error:', error);
            setError('Affirm payment failed: ' + (error.message || 'Unknown error'));
            setProcessingPayment(false);
          }
        }
      });

      console.log('✅ Affirm component initialized - button rendered');
      setAffirmButtonRendered(true);

    } catch (err) {
      console.error('Affirm component initialization error:', err);
      throw new Error('Failed to initialize Affirm component: ' + err.message);
    }
  };

  const handleAffirmApproval = async (affirmData) => {
    try {
      setProcessingPayment(true);
      console.log('🔄 STEP 5: Creating Affirm checkout order...');

      const sessionToken = Parse.User.current().getSessionToken();

      // STEP 5: Submit Checkouts Orders request
      // From Documentation:
      // "The onApprove hook will contain the orderId and transactionId, fields which can be 
      // leveraged to make the payment transactions with the Checkouts Orders API."
      const orderResponse = await Parse.Cloud.run('affirmCreateOrder', {
        transactionId: transactionData.transactionId,
        affirmOrderId: affirmData.orderId,
        affirmTransactionId: affirmData.transactionId
      }, { sessionToken });

      console.log('✅ STEP 5 Complete - Checkout order created:', orderResponse);

      // STEP 6: Authorize the order
      // From Documentation:
      // "An Affirm BNPL integration creates a checkout order only, requiring a subsequent 
      // authorize request using the orderId to authorize the funds."
      console.log('🔄 STEP 6: Authorizing Affirm order...');

      const authResponse = await Parse.Cloud.run('affirmAuthorizeOrder', {
        transactionId: transactionData.transactionId
      }, { sessionToken });

      console.log('✅ STEP 6 Complete - Order authorized:', authResponse);

      if (authResponse.success) {
        setProcessingPayment(false);
        if (onSuccess) {
          onSuccess(authResponse);
        }
        handleClose();
      } else {
        throw new Error(authResponse.message || 'Authorization not completed');
      }

    } catch (err) {
      console.error('Affirm approval handling error:', err);
      setError('Failed to complete Affirm payment: ' + err.message);
      setProcessingPayment(false);
    }
  };

  const handleClose = () => {
    setAmount('');
    setRemark('');
    setCustomerInfo({ firstName: '', lastName: '', email: '', phone: '' });
    setBillingAddress({ firstName: '', lastName: '', street: '', houseNumberOrName: '', city: '', stateOrProvince: '', postalCode: '', country: 'US' });
    setShippingAddress({ firstName: '', lastName: '', street: '', houseNumberOrName: '', city: '', stateOrProvince: '', postalCode: '', country: 'US' });
    setUseShipping(false);
    setError('');
    setLoading(false);
    setTransactionData(null);
    setProcessingPayment(false);
    setAffirmButtonRendered(false);
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={loading || processingPayment ? null : handleClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        Affirm - Buy Now, Pay Later
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
              <Typography sx={{ ml: 2 }}>Loading Affirm SDK...</Typography>
            </Box>
          )}

          {sdkLoaded && !transactionData && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Pay over time with Affirm. No hidden fees, just flexible monthly payments.
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
                  label="Remark (Optional)"
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  multiline
                  rows={2}
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 1 }}>
                  <Typography variant="body2" color="textSecondary">
                    Customer Information
                  </Typography>
                </Divider>
              </Grid>

              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={customerInfo.firstName}
                  onChange={(e) => handleCustomerInfoChange('firstName', e.target.value)}
                  required
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={customerInfo.lastName}
                  onChange={(e) => handleCustomerInfoChange('lastName', e.target.value)}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => handleCustomerInfoChange('email', e.target.value)}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={customerInfo.phone}
                  onChange={(e) => handleCustomerInfoChange('phone', e.target.value)}
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 1 }}>
                  <Typography variant="body2" color="textSecondary">
                    Billing Address
                  </Typography>
                </Divider>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Street Address"
                  value={billingAddress.street}
                  onChange={(e) => handleBillingAddressChange('street', e.target.value)}
                  required
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Apt/Suite"
                  value={billingAddress.houseNumberOrName}
                  onChange={(e) => handleBillingAddressChange('houseNumberOrName', e.target.value)}
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="City"
                  value={billingAddress.city}
                  onChange={(e) => handleBillingAddressChange('city', e.target.value)}
                  required
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="State/Province"
                  value={billingAddress.stateOrProvince}
                  onChange={(e) => handleBillingAddressChange('stateOrProvince', e.target.value)}
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Postal Code"
                  value={billingAddress.postalCode}
                  onChange={(e) => handleBillingAddressChange('postalCode', e.target.value)}
                  required
                />
              </Grid>
            </Grid>
          )}

          {transactionData && affirmButtonRendered && (
            <Box>
              <Alert severity="info" sx={{ mb: 3 }}>
                Click the Affirm button below to complete your purchase with flexible payment options.
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
                
                {/* STEP 4: Affirm button will be rendered here */}
                <Box 
                  id="affirm-button-container" 
                  sx={{ 
                    mt: 3,
                    minHeight: '50px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                />
              </Paper>

              {processingPayment && (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 3 }}>
                  <CircularProgress size={24} sx={{ mr: 2 }} />
                  <Typography>
                    Processing Affirm payment...
                  </Typography>
                </Box>
              )}
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
            onClick={handleInitializePayment}
            variant="contained"
            disabled={loading || !sdkLoaded}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Initializing...' : 'Continue to Affirm'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AffirmDialog;
