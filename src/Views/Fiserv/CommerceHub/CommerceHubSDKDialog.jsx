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
  FormControlLabel,
  Checkbox,
  Grid,
  Divider,
  Paper
} from '@mui/material';
import { Parse } from 'parse';

/**
 * COMMERCE HUB HOSTED CHECKOUT SDK - FRONTEND INTEGRATION
 * 
 * This component implements the Fiserv Commerce Hub Hosted Checkout SDK
 * following the official documentation with 3-D Secure support.
 * 
 * Integration Steps:
 * - STEP 1: Whitelist domains (done via backend, one-time setup)
 * - STEP 2: Start PaymentSession (get credentials from backend)
 * - STEP 3: Initialize the SDK (load and configure SDK)
 * - STEP 4: Collect payment method (render hosted fields)
 * - STEP 5: Initialize 3DS component (optional, for 3D Secure)
 * - STEP 6: Submit transaction request (complete payment via backend)
 */

const COMMERCE_HUB_SDK_VERSION = '3.5.5';
const COMMERCE_HUB_SDK_URL = `https://commercehub-secure-data-capture.fiservapps.com/${COMMERCE_HUB_SDK_VERSION}/checkout.js`;

const CommerceHubSDKDialog = ({ 
  open, 
  onClose, 
  onSuccess, 
  initialAmount = '', 
  initialRemark = '',
  widgetMode = false,
  widgetUserId = null,
  widgetType = null
}) => {
  const [amount, setAmount] = useState(initialAmount);
  const [remark, setRemark] = useState(initialRemark);
  const [use3DS, setUse3DS] = useState(false);
  const [useAffirm, setUseAffirm] = useState(false);
  const [usePaze, setUsePaze] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [transactionData, setTransactionData] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [affirmButtonRendered, setAffirmButtonRendered] = useState(false);
  const [pazeComponent, setPazeComponent] = useState(null);
  const [pazeSelection, setPazeSelection] = useState(null);
  const [showPazeButton, setShowPazeButton] = useState(false);

  // Customer info fields
  const [customerInfo, setCustomerInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });

  // Billing address fields (required for 3DS and Affirm)
  const [billingAddress, setBillingAddress] = useState({
    street: '',
    houseNumberOrName: '',
    city: '',
    stateOrProvince: '',
    postalCode: '',
    country: 'US'
  });

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

  const validateForm = () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return false;
    }

    // Validation for 3DS
    if (use3DS && !useAffirm && !usePaze) {
      if (!customerInfo.email) {
        setError('Email is required for 3D Secure payments');
        return false;
      }
      if (!billingAddress.street || !billingAddress.city || !billingAddress.postalCode) {
        setError('Complete billing address is required for 3D Secure payments');
        return false;
      }
    }

    // Validation for Affirm
    if (useAffirm) {
      if (!customerInfo.firstName || !customerInfo.lastName || !customerInfo.email) {
        setError('Customer first name, last name, and email are required for Affirm');
        return false;
      }
      if (!billingAddress.street || !billingAddress.city || !billingAddress.postalCode) {
        setError('Complete billing address is required for Affirm');
        return false;
      }
    }

    // Validation for Paze
    if (usePaze) {
      if (!customerInfo.email) {
        setError('Email is required for Paze');
        return false;
      }
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
      // In widget mode, use useMasterKey and pass userId/type
      const cloudOptions = widgetMode ? { useMasterKey: true } : { sessionToken: Parse.User.current().getSessionToken() };
      
      // STEP 2: Check if using Affirm, Paze, or regular Commerce Hub
      if (usePaze) {
        // Initialize Paze recharge
        const initParams = {
          amount: parseFloat(amount),
          remark: remark || 'Paze Digital Wallet Recharge',
          customerInfo: {
            email: customerInfo.email
          }
        };

        // Add widget parameters if in widget mode
        if (widgetMode) {
          initParams.type = widgetType;
          initParams.userId = widgetUserId;
        }

        const response = await Parse.Cloud.run('pazeInitRecharge', initParams, cloudOptions);

        if (!response.success) {
          throw new Error('Failed to initialize Paze payment session');
        }

        console.log('✅ STEP 2 Complete - Paze payment session initialized:', response);
        setTransactionData(response);

        // STEP 3: Initialize the SDK with credentials
        await initializeSDK(response.credentials);

        setLoading(false);
      } else if (useAffirm) {
        // Initialize Affirm recharge
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

        // Add widget parameters if in widget mode
        if (widgetMode) {
          initParams.type = widgetType;
          initParams.userId = widgetUserId;
        }

        const response = await Parse.Cloud.run('affirmInitRecharge', initParams, cloudOptions);

        if (!response.success) {
          throw new Error('Failed to initialize Affirm payment session');
        }

        console.log('✅ STEP 2 Complete - Affirm payment session initialized:', response);
        setTransactionData(response);

        // STEP 3: Initialize the SDK with credentials
        await initializeSDK(response.credentials);

        setLoading(false);
      } else {
        // Regular Commerce Hub flow
        const initParams = {
          amount: parseFloat(amount),
          remark: remark || 'Commerce Hub Recharge',
          use3DS: use3DS
        };

        // Add customer info and billing address if 3DS is enabled
        if (use3DS) {
          initParams.customerInfo = customerInfo;
          initParams.billingAddress = billingAddress;
        }

        // Add widget parameters if in widget mode
        if (widgetMode) {
          initParams.type = widgetType;
          initParams.userId = widgetUserId;
        }

        const response = await Parse.Cloud.run('commerceHubInitRecharge', initParams, cloudOptions);

        if (!response.success) {
          throw new Error('Failed to initialize payment session');
        }

        console.log('✅ STEP 2 Complete - Payment session initialized:', response);
        setTransactionData(response);

        // STEP 3: Initialize the SDK with credentials
        await initializeSDK(response.credentials);

        setLoading(false);
      }

    } catch (err) {
      console.error('Payment initialization error:', err);
      setError(err.message || 'Failed to initialize payment. Please try again.');
      setLoading(false);
    }
  };

  const initializeSDK = async (credentials) => {
    if (!window.fiserv) {
      throw new Error('Payment SDK not loaded');
    }

    try {
      console.log('🔧 STEP 3: Initializing Commerce Hub SDK...');

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

      // Check if using Affirm, Paze, or regular payment
      if (usePaze) {
        // STEP 4: Initialize Paze component
        await initializePazeComponent();
      } else if (useAffirm) {
        // STEP 4: Initialize Affirm component
        await initializeAffirmComponent();
      } else {
        // STEP 4: Load payment fields component
        await loadPaymentFields();

        // STEP 5: If 3DS is enabled, initialize 3DS component
        if (use3DS) {
          await initialize3DSecure();
        } else {
          // If not using 3DS, proceed directly to payment
          await processPayment();
        }
      }

    } catch (err) {
      console.error('SDK initialization error:', err);
      throw new Error('Failed to initialize payment form: ' + err.message);
    }
  };

  const loadPaymentFields = async () => {
    try {
      console.log('🔧 STEP 4: Loading payment fields (Hosted Fields)...');

      // STEP 4: Collect payment method using Hosted Fields
      // From Documentation: "Use Hosted Fields to capture the card details"
      const paymentFields = await window.fiserv.components.paymentFields({
        data: {
          cardNumber: {
            parentElementId: 'card-number-element'
          },
          cardExpiry: {
            parentElementId: 'card-expiry-element'
          },
          cardCvv: {
            parentElementId: 'card-cvv-element'
          }
        },
        style: {
          base: {
            color: '#333',
            fontSize: '16px',
            fontFamily: 'Arial, sans-serif'
          },
          invalid: {
            color: '#d32f2f'
          }
        }
      });

      console.log('✅ STEP 4 Complete - Payment fields loaded');
      return paymentFields;

    } catch (err) {
      console.error('Payment fields error:', err);
      throw err;
    }
  };

  const initialize3DSecure = async () => {
    try {
      console.log('🔧 STEP 5: Initializing 3D Secure component...');
      setProcessingPayment(true);

      // STEP 5: Initialize the 3DS component
      // From 3DS Documentation:
      // "Call the window.fiserv.components.threeDSecure method to initialize the 3DS component 
      // and define the transactionState and authenticationTransactionId which will be used 
      // in Charges API request as a reference of 3DS authentication."
      // 
      // "Do not proceed to the next step if transactionState is DECLINED."
      const result = await window.fiserv.components.threeDSecure();
      
      console.log('✅ STEP 5 Complete - 3DS authentication result:', result);

      if (result.transactionState === 'DECLINED') {
        throw new Error('3D Secure authentication declined');
      }

      // Store 3DS authentication details for STEP 6
      transactionData.authenticationTransactionId = result.authenticationTransactionId;
      transactionData.transactionState = result.transactionState;

      // Proceed to STEP 6: Complete payment with 3DS data
      await completePayment(result.authenticationTransactionId, result.transactionState);

    } catch (err) {
      console.error('3D Secure error:', err);
      setError('3D Secure authentication failed: ' + err.message);
      setProcessingPayment(false);
      throw err;
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

  const initializePazeComponent = async () => {
    try {
      console.log('🔧 STEP 4: Initializing Paze component...');

      // STEP 4: Initialize the Paze component
      const pazePromise = window.fiserv.components.paze({
        displayName: process.env.REACT_APP_COMMERCE_HUB_DISPLAY_NAME || "Getways",
        cspNonce: crypto.randomUUID()
      });

      const paze = await pazePromise;
      setPazeComponent(paze);

      console.log('✅ STEP 4 Complete - Paze component initialized');
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

      console.log('🔧 STEP 5: Launching Paze UI...');

      // STEP 5: Launch Paze with minimal required fields (email + amount only)
      const selectionPromise = pazeComponent.selectPaymentMethod({
        customer: {
          email: customerInfo.email
        },
        amount: {
          currency: "USD",
          total: parseFloat(amount).toFixed(2)
        }
        // Note: ecom object (shipping address, etc.) is OPTIONAL and not needed for simple recharge
      });

      const selection = await selectionPromise;
      
      console.log('✅ STEP 5 Complete - Paze selection received:', selection);
      setPazeSelection(selection);

      // STEP 6: Submit Paze payment method
      await handleSubmitPaze(selection);

    } catch (err) {
      console.error('Paze launch error:', err);
      setError('Failed to complete Paze selection: ' + (err.message || 'User may have cancelled'));
      setProcessingPayment(false);
    }
  };

  const handleSubmitPaze = async (selection) => {
    try {
      console.log('🔧 STEP 6: Submitting Paze payment method...');

      // STEP 6: Submit with same parameters (or omit if unchanged)
      const submitPromise = pazeComponent.submit({
        customer: {
          email: customerInfo.email
        },
        amount: {
          currency: "USD",
          total: parseFloat(amount).toFixed(2)
        }
      });

      await submitPromise;

      console.log('✅ STEP 6 Complete - Paze payment method submitted');

      // STEP 7: Complete payment via backend
      await handleCompletePazePayment(selection);

    } catch (err) {
      console.error('Paze submit error:', err);
      throw new Error('Failed to submit Paze payment: ' + err.message);
    }
  };

  const handleCompletePazePayment = async (pazeData) => {
    try {
      console.log('🔧 STEP 7: Completing payment via Charges API...');

      const cloudOptions = widgetMode ? { useMasterKey: true } : { sessionToken: Parse.User.current().getSessionToken() };

      const completeParams = {
        transactionId: transactionData.transactionId,
        pazeData: pazeData
      };

      // Add widget parameters if in widget mode
      if (widgetMode) {
        completeParams.type = widgetType;
      }

      const response = await Parse.Cloud.run('pazeCompleteRecharge', completeParams, cloudOptions);

      console.log('✅ STEP 7 Complete - Payment completed:', response);

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
      console.error('Complete Paze payment error:', err);
      setError('Failed to complete payment: ' + err.message);
      setProcessingPayment(false);
    }
  };

  const handleAffirmApproval = async (affirmData) => {
    try {
      setProcessingPayment(true);
      console.log('🔄 STEP 5: Creating Affirm checkout order...');

      const cloudOptions = widgetMode ? { useMasterKey: true } : { sessionToken: Parse.User.current().getSessionToken() };

      // STEP 5: Submit Checkouts Orders request
      const orderParams = {
        transactionId: transactionData.transactionId,
        affirmOrderId: affirmData.orderId,
        affirmTransactionId: affirmData.transactionId
      };

      // Add widget parameters if in widget mode
      if (widgetMode) {
        orderParams.type = widgetType;
      }

      const orderResponse = await Parse.Cloud.run('affirmCreateOrder', orderParams, cloudOptions);

      console.log('✅ STEP 5 Complete - Checkout order created:', orderResponse);

      // STEP 6: Authorize the order
      console.log('🔄 STEP 6: Authorizing Affirm order...');

      const authParams = {
        transactionId: transactionData.transactionId
      };

      // Add widget parameters if in widget mode
      if (widgetMode) {
        authParams.type = widgetType;
      }

      const authResponse = await Parse.Cloud.run('affirmAuthorizeOrder', authParams, cloudOptions);

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

  const processPayment = async () => {
    try {
      setProcessingPayment(true);
      console.log('💳 Processing payment...');

      // Get payment token from SDK
      const tokenResponse = await window.fiserv.createToken();
      
      if (!tokenResponse || !tokenResponse.token) {
        throw new Error('Failed to create payment token');
      }

      console.log('✅ Payment token created');

      // Complete the payment
      await completePayment(null, null, tokenResponse.token);

    } catch (err) {
      console.error('Payment processing error:', err);
      setError('Payment failed: ' + err.message);
      setProcessingPayment(false);
      throw err;
    }
  };

  const completePayment = async (authenticationTransactionId = null, transactionState = null, paymentToken = null) => {
    try {
      console.log('🔄 STEP 6: Completing payment (Submit transaction request)...');

      const cloudOptions = widgetMode ? { useMasterKey: true } : { sessionToken: Parse.User.current().getSessionToken() };
      
      // STEP 6: Submit transaction request to backend
      // This will call the Charges API with payment session and optional 3DS data
      const completeParams = {
        transactionId: transactionData.transactionId,
        paymentToken: paymentToken || 'SDK_PAYMENT_TOKEN'
      };

      // Include 3DS authentication data if available (from STEP 5)
      if (authenticationTransactionId && transactionState) {
        completeParams.authenticationTransactionId = authenticationTransactionId;
        completeParams.transactionState = transactionState;
        console.log('Including 3DS authentication data in charges request');
      }

      // Add widget parameters if in widget mode
      if (widgetMode) {
        completeParams.type = widgetType;
      }

      const response = await Parse.Cloud.run('commerceHubCompleteRecharge', completeParams, cloudOptions);

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
      throw err;
    }
  };

  const handleClose = () => {
    setAmount('');
    setRemark('');
    setUse3DS(false);
    setUseAffirm(false);
    setUsePaze(false);
    setCustomerInfo({ firstName: '', lastName: '', email: '', phone: '' });
    setBillingAddress({ street: '', houseNumberOrName: '', city: '', stateOrProvince: '', postalCode: '', country: 'US' });
    setError('');
    setLoading(false);
    setTransactionData(null);
    setProcessingPayment(false);
    setAffirmButtonRendered(false);
    setPazeComponent(null);
    setPazeSelection(null);
    setShowPazeButton(false);
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
        {usePaze ? 'Commerce Hub - Paze Digital Wallet' : useAffirm ? 'Commerce Hub - Affirm (Buy Now, Pay Later)' : 'Commerce Hub - Hosted Checkout SDK'}
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
              <Typography sx={{ ml: 2 }}>Loading payment SDK...</Typography>
            </Box>
          )}

          {sdkLoaded && !transactionData && (
            <Grid container spacing={2}>
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
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={use3DS}
                      onChange={(e) => {
                        setUse3DS(e.target.checked);
                        if (e.target.checked) {
                          setUseAffirm(false); // Disable Affirm when 3DS is enabled
                          setUsePaze(false); // Disable Paze when 3DS is enabled
                        }
                      }}
                      disabled={useAffirm || usePaze}
                    />
                  }
                  label="Enable 3D Secure Authentication"
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={useAffirm}
                      onChange={(e) => {
                        setUseAffirm(e.target.checked);
                        if (e.target.checked) {
                          setUse3DS(false); // Disable 3DS when Affirm is enabled
                          setUsePaze(false); // Disable Paze when Affirm is enabled
                        }
                      }}
                      disabled={use3DS || usePaze}
                    />
                  }
                  label="Use Affirm - Buy Now, Pay Later"
                />
                {useAffirm && (
                  <Typography variant="caption" color="textSecondary" sx={{ ml: 4, display: 'block' }}>
                    Pay over time with flexible monthly payments. No hidden fees.
                  </Typography>
                )}
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={usePaze}
                      onChange={(e) => {
                        setUsePaze(e.target.checked);
                        if (e.target.checked) {
                          setUse3DS(false); // Disable 3DS when Paze is enabled
                          setUseAffirm(false); // Disable Affirm when Paze is enabled
                        }
                      }}
                      disabled={use3DS || useAffirm}
                    />
                  }
                  label="Use Paze Digital Wallet"
                />
                {usePaze && (
                  <Typography variant="caption" color="textSecondary" sx={{ ml: 4, display: 'block' }}>
                    Fast, secure checkout with your saved cards.
                  </Typography>
                )}
              </Grid>

              {(use3DS || useAffirm || usePaze) && (
                <>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }}>
                      <Typography variant="body2" color="textSecondary">
                        {usePaze ? 'Email (Required for Paze)' : useAffirm ? 'Customer Information (Required for Affirm)' : 'Customer Information'}
                      </Typography>
                    </Divider>
                  </Grid>

                  {!usePaze && (
                    <>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="First Name"
                          value={customerInfo.firstName}
                          onChange={(e) => handleCustomerInfoChange('firstName', e.target.value)}
                          required={useAffirm}
                        />
                      </Grid>

                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Last Name"
                          value={customerInfo.lastName}
                          onChange={(e) => handleCustomerInfoChange('lastName', e.target.value)}
                          required={useAffirm}
                        />
                      </Grid>
                    </>
                  )}

                  <Grid item xs={usePaze ? 12 : 12} sm={usePaze ? 12 : 6}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => handleCustomerInfoChange('email', e.target.value)}
                      required
                    />
                  </Grid>

                  {!usePaze && (
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Phone"
                        value={customerInfo.phone}
                        onChange={(e) => handleCustomerInfoChange('phone', e.target.value)}
                        required={useAffirm}
                      />
                    </Grid>
                  )}

                  {!usePaze && (
                    <>
                      <Grid item xs={12}>
                        <Divider sx={{ my: 1 }}>
                          <Typography variant="body2" color="textSecondary">
                            {useAffirm ? 'Billing Address (Required for Affirm)' : 'Billing Address'}
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
                    </>
                  )}
                </>
              )}
            </Grid>
          )}

          {transactionData && !useAffirm && !usePaze && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Enter Payment Details
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Card Number
                </Typography>
                <Box 
                  id="card-number-element" 
                  sx={{ 
                    border: '1px solid #ccc', 
                    borderRadius: 1, 
                    p: 1.5,
                    minHeight: '40px'
                  }}
                />
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Expiry Date
                  </Typography>
                  <Box 
                    id="card-expiry-element" 
                    sx={{ 
                      border: '1px solid #ccc', 
                      borderRadius: 1, 
                      p: 1.5,
                      minHeight: '40px'
                    }}
                  />
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    CVV
                  </Typography>
                  <Box 
                    id="card-cvv-element" 
                    sx={{ 
                      border: '1px solid #ccc', 
                      borderRadius: 1, 
                      p: 1.5,
                      minHeight: '40px'
                    }}
                  />
                </Grid>
              </Grid>

              {processingPayment && (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 3 }}>
                  <CircularProgress size={24} sx={{ mr: 2 }} />
                  <Typography>
                    {use3DS ? 'Authenticating with 3D Secure...' : 'Processing payment...'}
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {transactionData && useAffirm && affirmButtonRendered && (
            <Box>
              <Alert severity="info" sx={{ mb: 3 }}>
                Click the Affirm button below to complete your purchase with flexible payment options.
              </Alert>

              <Box 
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
              </Box>

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

          {transactionData && usePaze && showPazeButton && !pazeSelection && (
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
                  {pazeSelection.card?.brand && (
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {pazeSelection.card.brand}
                    </Typography>
                  )}
                  <Typography variant="body2">
                    •••• {pazeSelection.card?.last4 || '****'}
                  </Typography>
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
            onClick={handleInitializePayment}
            variant="contained"
            disabled={loading || !sdkLoaded}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Initializing...' : usePaze ? 'Continue to Paze' : useAffirm ? 'Continue to Affirm' : 'Continue to Payment'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CommerceHubSDKDialog;
