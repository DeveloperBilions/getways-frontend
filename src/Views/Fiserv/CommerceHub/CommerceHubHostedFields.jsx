import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
  TextField,
  Paper,
  Grid,
} from "@mui/material";
import { Parse } from "parse";
import { useLocation, useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

Parse.initialize(process.env.REACT_APP_APPID, process.env.REACT_APP_MASTER_KEY);
Parse.serverURL = process.env.REACT_APP_URL;

const CommerceHubHostedFields = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get recharge amount and remark from navigation state
  const { rechargeAmount, remark } = location.state || {};
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [credentialsData, setCredentialsData] = useState(null);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [sdkInitialized, setSdkInitialized] = useState(false);
  const [fieldsReady, setFieldsReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const paymentFieldsRef = useRef(null);

  // Check if we have required data
  useEffect(() => {
    if (!rechargeAmount) {
      navigate("/playerDashboard");
    }
  }, [rechargeAmount, navigate]);

  // Step 3: Load SDK in browser
  useEffect(() => {
    const loadCommerceHubSDK = () => {
      if (document.getElementById("commercehub-sdk")) {
        setSdkLoaded(true);
        return;
      }

      const script = document.createElement("script");
      script.id = "commercehub-sdk";
      // Latest Version 3.5.5 from documentation
      script.src = "https://commercehub-secure-data-capture.fiservapps.com/3.5.5/checkout.js";
      script.async = true;
      
      script.onload = () => {
        console.log("✅ Commerce Hub SDK loaded (v3.5.5)");
        setSdkLoaded(true);
      };
      
      script.onerror = () => {
        console.error("❌ Failed to load Commerce Hub SDK");
        setError("Failed to load payment SDK. Please refresh and try again.");
      };

      document.body.appendChild(script);
    };

    loadCommerceHubSDK();

    return () => {
      const script = document.getElementById("commercehub-sdk");
      if (script) {
        script.remove();
      }
    };
  }, []);

  // Step 2: Acquire credentials and initialize
  useEffect(() => {
    if (rechargeAmount && !credentialsData) {
      getCredentials();
    }
  }, [rechargeAmount, credentialsData]);

  // Get security credentials from backend
  const getCredentials = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("🔑 Acquiring Commerce Hub credentials...");

      // Call Hosted Fields specific backend function (NOT Hosted Pages)
      const response = await Parse.Cloud.run("commerceHubHostedFieldsGetCredentials", {
        amount: rechargeAmount,
        remark: remark,
        customerInfo: {
          name: Parse.User.current()?.get("username") || "Customer",
          email: Parse.User.current()?.get("email") || undefined,
        },
      });

      if (!response.success || !response.sessionId) {
        throw new Error("Failed to get payment credentials");
      }

      console.log("✅ Credentials acquired");
      console.log("📦 Full credentials response:", JSON.stringify(response, null, 2));
      console.log("🔑 accessToken:", response.accessToken ? response.accessToken.substring(0, 20) + '...' : 'MISSING');
      console.log("🔑 publicKey:", response.publicKey ? response.publicKey.substring(0, 30) + '...' : 'MISSING');
      console.log("🔑 keyId:", response.keyId || 'MISSING');
      console.log("🔑 sessionId:", response.sessionId || 'MISSING');
      setCredentialsData(response);

    } catch (err) {
      console.error("Commerce Hub credentials error:", err);
      setError(err.message || "Failed to initialize payment. Please try again.");
      setLoading(false);
    }
  };

  // Step 4: Initialize SDK when both SDK loaded and credentials available
  useEffect(() => {
    if (sdkLoaded && credentialsData && !sdkInitialized) {
      initializeSDK();
    }
  }, [sdkLoaded, credentialsData, sdkInitialized]);

  // Initialize SDK (Step 4 from Hosted Fields documentation)
  const initializeSDK = async () => {
    try {
      if (!window.fiserv || !window.fiserv.init) {
        console.error("Fiserv SDK not available");
        setError("Payment SDK not loaded. Please refresh the page.");
        setLoading(false);
        return;
      }

      console.log("🔧 Initializing Commerce Hub SDK...");

      const environment = process.env.REACT_APP_COMMERCE_HUB_ENVIRONMENT || "CERT";
      const apiKey = process.env.REACT_APP_COMMERCE_HUB_API_KEY;
      const merchantId = process.env.REACT_APP_COMMERCE_HUB_MERCHANT_ID;

      if (!apiKey || !merchantId) {
        throw new Error("Missing API Key or Merchant ID configuration");
      }

      console.log("📋 SDK Init Parameters:", {
        environment,
        apiKey,
        merchantId,
        terminalId: "10000001",
        hasAccessToken: !!credentialsData.accessToken,
        hasPublicKey: !!credentialsData.publicKey,
        hasKeyId: !!credentialsData.keyId,
        accessToken: credentialsData.accessToken?.substring(0, 10) + "...",
        keyId: credentialsData.keyId,
      });

      // Initialize SDK with credentials (Step 4 from Hosted Fields docs)
      await window.fiserv.init({
        environment: environment,
        accessToken: credentialsData.accessToken,
        apiKey: apiKey,
        merchantId: merchantId,
        terminalId: "10000001",
        publicKey: credentialsData.publicKey,
        keyId: credentialsData.keyId,
        additionalFrameAncestors: ["skynbliss.co"],
      });

      console.log("✅ SDK initialized successfully");
      setSdkInitialized(true);

    } catch (err) {
      console.error("SDK initialization error:", err);
      setError(err.message || "Failed to initialize payment SDK");
      setLoading(false);
    }
  };

  // Step 5: Create payment fields after SDK initialized
  useEffect(() => {
    if (sdkInitialized && !fieldsReady) {
      createHostedFields();
    }
  }, [sdkInitialized, fieldsReady]);

  // Create Hosted Fields (Step 3 from Hosted Fields documentation)
  const createHostedFields = async () => {
    try {
      console.log("🎨 Creating Hosted Fields...");

      const paymentFields = await window.fiserv.components.paymentFields({
        data: {
          paymentMethod: "CREDIT_CARD",
          supportedCardBrands: ["VISA", "MASTERCARD", "AMEX", "DISCOVER"],
          fields: {
            cardNumber: {
              selector: "#card-number",
              placeholder: "1234 5678 9012 3456"
            },
            expirationDate: {
              selector: "#expiration-date",
              placeholder: "MM/YY"
            },
            securityCode: {
              selector: "#security-code",
              placeholder: "CVV"
            },
            nameOnCard: {
              selector: "#name-on-card",
              placeholder: "Cardholder Name"
            }
          },
          contextualCssClassNames: {
            valid: "valid-field",
            invalid: "invalid-field"
          },
          css: {
            base: {
              color: "#1F2937",
              fontSize: "16px",
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              "::placeholder": {
                color: "#9CA3AF"
              }
            },
            invalid: {
              color: "#EF4444"
            }
          }
        },
        hooks: {
          onFieldChange: (field, state) => {
            console.log(`Field ${field} changed:`, state);
          },
          onFormValidityChange: (isValid) => {
            console.log("Form validity:", isValid);
          }
        }
      });

      paymentFieldsRef.current = paymentFields;
      setFieldsReady(true);
      setLoading(false);

      console.log("✅ Hosted Fields created successfully");

    } catch (err) {
      console.error("Hosted Fields creation error:", err);
      setError(err.message || "Failed to create payment fields");
      setLoading(false);
    }
  };

  // Step 4: Submit the form (from Hosted Fields documentation)
  const handleSubmitPayment = async () => {
    if (!paymentFieldsRef.current) {
      setError("Payment form not initialized");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      console.log("📤 Submitting payment form...");

      // Submit form to capture card data
      const captureResponse = await paymentFieldsRef.current.submit();
      
      console.log("✅ Card data captured successfully:", JSON.stringify(captureResponse));

      // Step 5: Submit API request to process payment using Hosted Fields backend
      console.log("🔄 Processing payment with backend...");

      const response = await Parse.Cloud.run("commerceHubHostedFieldsProcessPayment", {
        sessionId: credentialsData.sessionId,
        transactionId: credentialsData.transactionId
      });

      if (response.success && response.status === "APPROVED") {
        console.log("✅ Payment successful");
        
        setShowSuccessAnimation(true);

        // Redirect after 3 seconds
        setTimeout(() => {
          navigate("/playerDashboard");
        }, 3000);
      } else {
        const errorMsg = response.message || "Payment was not approved";
        setError(errorMsg);
        setIsSubmitting(false);
      }

    } catch (err) {
      console.error("❌ Payment submission failed:", err.toString());
      setError(err.message || "Failed to process payment. Please check your card details.");
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate("/playerDashboard");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#F3F4F6",
        py: 4,
      }}
    >
      <Box
        sx={{
          maxWidth: "600px",
          mx: "auto",
          px: 2,
        }}
      >
        {/* Header */}
        <Box sx={{ mb: 3, display: "flex", alignItems: "center" }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Add Payment Method
          </Typography>
        </Box>

        {/* Success Animation */}
        {showSuccessAnimation && (
          <Paper sx={{ p: 4, textAlign: "center" }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                backgroundColor: "#10B981",
                margin: "0 auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 3,
              }}
            >
              <Typography variant="h3" sx={{ color: "#FFFFFF" }}>
                ✓
              </Typography>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
              Payment Successful!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              ${rechargeAmount?.toFixed(2)} has been added to your account
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Redirecting to dashboard...
            </Typography>
          </Paper>
        )}

        {/* Loading State */}
        {loading && !showSuccessAnimation && (
          <Paper sx={{ p: 4, textAlign: "center" }}>
            <CircularProgress size={50} sx={{ color: "#0066CC" }} />
            <Typography variant="body1" sx={{ mt: 2, color: "#6B7280" }}>
              Loading secure payment form...
            </Typography>
          </Paper>
        )}

        {/* Error Alert */}
        {error && !showSuccessAnimation && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Payment Form */}
        {!loading && !showSuccessAnimation && fieldsReady && (
          <Paper sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Payment Details
            </Typography>

            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Amount to Add
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 600, color: "#0066CC" }}>
                ${rechargeAmount?.toFixed(2)}
              </Typography>
            </Box>

            <Grid container spacing={3}>
              {/* Card Number Field */}
              <Grid item xs={12}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                  Card Number
                </Typography>
                <Box
                  id="card-number"
                  sx={{
                    border: "1px solid #D1D5DB",
                    borderRadius: "8px",
                    padding: "12px",
                    minHeight: "48px",
                    backgroundColor: "#FFFFFF",
                    "&.valid-field": {
                      borderColor: "#10B981",
                    },
                    "&.invalid-field": {
                      borderColor: "#EF4444",
                    },
                  }}
                />
              </Grid>

              {/* Expiration Date Field */}
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                  Expiration Date
                </Typography>
                <Box
                  id="expiration-date"
                  sx={{
                    border: "1px solid #D1D5DB",
                    borderRadius: "8px",
                    padding: "12px",
                    minHeight: "48px",
                    backgroundColor: "#FFFFFF",
                    "&.valid-field": {
                      borderColor: "#10B981",
                    },
                    "&.invalid-field": {
                      borderColor: "#EF4444",
                    },
                  }}
                />
              </Grid>

              {/* Security Code Field */}
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                  CVV
                </Typography>
                <Box
                  id="security-code"
                  sx={{
                    border: "1px solid #D1D5DB",
                    borderRadius: "8px",
                    padding: "12px",
                    minHeight: "48px",
                    backgroundColor: "#FFFFFF",
                    "&.valid-field": {
                      borderColor: "#10B981",
                    },
                    "&.invalid-field": {
                      borderColor: "#EF4444",
                    },
                  }}
                />
              </Grid>

              {/* Name on Card Field */}
              <Grid item xs={12}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                  Cardholder Name
                </Typography>
                <Box
                  id="name-on-card"
                  sx={{
                    border: "1px solid #D1D5DB",
                    borderRadius: "8px",
                    padding: "12px",
                    minHeight: "48px",
                    backgroundColor: "#FFFFFF",
                    "&.valid-field": {
                      borderColor: "#10B981",
                    },
                    "&.invalid-field": {
                      borderColor: "#EF4444",
                    },
                  }}
                />
              </Grid>

              {/* Submit Button */}
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={handleSubmitPayment}
                  disabled={isSubmitting}
                  sx={{
                    mt: 2,
                    backgroundColor: "#0066CC",
                    "&:hover": {
                      backgroundColor: "#0052A3",
                    },
                    textTransform: "none",
                    fontSize: "16px",
                    py: 1.5,
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <CircularProgress size={24} sx={{ color: "#FFFFFF", mr: 2 }} />
                      Processing...
                    </>
                  ) : (
                    `Pay $${rechargeAmount?.toFixed(2)}`
                  )}
                </Button>
              </Grid>
            </Grid>

            {/* Security Notice */}
            <Box sx={{ mt: 3, textAlign: "center" }}>
              <Typography variant="caption" color="text.secondary">
                🔒 Your payment information is secure and encrypted
              </Typography>
            </Box>
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default CommerceHubHostedFields;
