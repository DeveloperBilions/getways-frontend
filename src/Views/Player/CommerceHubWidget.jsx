import React, { useCallback, useEffect, useState, useRef } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
} from "@mui/material";
import { Parse } from "parse";
import { useLocation, useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useGetIdentity } from "react-admin";

Parse.initialize(process.env.REACT_APP_APPID, process.env.REACT_APP_MASTER_KEY);
Parse.serverURL = process.env.REACT_APP_URL;

const CommerceHubWidget = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { identity } = useGetIdentity();
  
  // Get data from URL query parameters (for widget) or navigation state (for regular flow)
  const searchParams = new URLSearchParams(location.search);
  const sessionIdFromUrl = searchParams.get('sessionId');
  const accessTokenFromUrl = searchParams.get('accessToken');
  const amountFromUrl = searchParams.get('amount');
  const transactionIdFromUrl = searchParams.get('transactionId');
  const merchantIdFromUrl = searchParams.get('merchantId');
  
  // Get recharge amount and remark from navigation state (regular flow)
  const { rechargeAmount, remark } = location.state || {};
  
  // Use URL params if available (widget flow), otherwise use state (regular flow)
  const isWidgetFlow = !!sessionIdFromUrl;
  const finalAmount = isWidgetFlow ? parseFloat(amountFromUrl) : rechargeAmount;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [credentialsData, setCredentialsData] = useState(null);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [formMounted, setFormMounted] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  // Check if we have required data
  useEffect(() => {
    if (!finalAmount && !isWidgetFlow) {
      navigate("/playerDashboard");
    }
  }, [finalAmount, isWidgetFlow, navigate]);
  
  // If widget flow with credentials from URL, set them directly
  useEffect(() => {
    if (isWidgetFlow && sessionIdFromUrl && accessTokenFromUrl) {
      setCredentialsData({
        sessionId: sessionIdFromUrl,
        accessToken: accessTokenFromUrl,
        amount: parseFloat(amountFromUrl),
        transactionId: transactionIdFromUrl,
        merchantId: merchantIdFromUrl
      });
    }
  }, [isWidgetFlow, sessionIdFromUrl, accessTokenFromUrl, amountFromUrl, transactionIdFromUrl, merchantIdFromUrl]);

  // Step 4: Load SDK in browser
  useEffect(() => {
    const loadCommerceHubSDK = () => {
      // Check if script already exists
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
        setError("Failed to load payment widget. Please refresh and try again.");
      };

      document.body.appendChild(script);
    };

    loadCommerceHubSDK();

    return () => {
      // Cleanup on unmount
      const script = document.getElementById("commercehub-sdk");
      if (script) {
        script.remove();
      }
    };
  }, []);

  // Initialize when component mounts (only for regular flow, not widget flow)
  useEffect(() => {
    if (finalAmount && !credentialsData && !isWidgetFlow) {
      getCredentialsAndInitialize();
    }
  }, [finalAmount, credentialsData, isWidgetFlow]);

  // Step 3: Acquire credentials
  const getCredentialsAndInitialize = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("🔑 Acquiring Commerce Hub credentials...");

      // Call backend to get security credentials
      const response = await Parse.Cloud.run("commerceHubGetCredentials", {
        amount: finalAmount,
        remark: remark,
        customerInfo: {
          name: Parse.User.current()?.get("username") || "Customer",
          email: Parse.User.current()?.get("email") || undefined,
        },
      });

      if (!response.success || !response.sessionId) {
        throw new Error("Failed to get payment credentials");
      }

      console.log("✅ Credentials acquired:", response);
      setCredentialsData(response);

      // Wait for SDK to be loaded before creating form
      if (sdkLoaded) {
        createPaymentForm(response);
      }
    } catch (err) {
      console.error("Commerce Hub credentials error:", err);
      setError(err.message || "Failed to initialize payment. Please try again.");
      setLoading(false);
    }
  };

  // Step 5: Create the payment form
  useEffect(() => {
    if (sdkLoaded && credentialsData && !formMounted) {
      createPaymentForm(credentialsData);
    }
  }, [sdkLoaded, credentialsData, formMounted]);

  const createPaymentForm = async (credentials) => {
    try {
      if (!window.fiserv || !window.fiserv.components) {
        console.error("Fiserv SDK not available");
        setError("Payment SDK not loaded. Please refresh the page.");
        setLoading(false);
        return;
      }

      console.log("🎨 Creating Commerce Hub payment form...");

      // Get environment
      const environment = process.env.REACT_APP_COMMERCE_HUB_ENVIRONMENT || "CERT";
      const apiKey = process.env.REACT_APP_COMMERCE_HUB_API_KEY;
      const merchantId = process.env.REACT_APP_COMMERCE_HUB_MERCHANT_ID;
      
      // pageId and pageVersion MUST come from Checkout Configurator
      const pageId = process.env.REACT_APP_COMMERCE_HUB_PAGE_ID;
      const pageVersion = process.env.REACT_APP_COMMERCE_HUB_PAGE_VERSION;
      
      // Validate all required parameters
      if (!apiKey) {
        throw new Error("API Key is missing. Please configure REACT_APP_COMMERCE_HUB_API_KEY");
      }
      if (!credentials.accessToken) {
        throw new Error("Access Token is missing from credentials");
      }
      if (!merchantId) {
        throw new Error("Merchant ID is missing. Please configure REACT_APP_COMMERCE_HUB_MERCHANT_ID");
      }
      if (!pageId || !pageVersion) {
        throw new Error("PageId and PageVersion are required. Please get these from Fiserv Checkout Configurator and add to .env file");
      }
      
      console.log("📋 SDK Parameters:", {
        environment,
        apiKey,
        accessToken: credentials.accessToken,
        merchantId,
        terminalId: "10000001",
        pageId,
        pageVersion
      });
      
      // Create hosted checkout form
      const formInstance = window.fiserv.components.hostedCheckout({
        credentials: {
          environment: environment,
          apiKey: apiKey,
          accessToken: credentials.accessToken,
          merchantId: merchantId,
          terminalId: "10000001",
          pageId: pageId,
          pageVersion: pageVersion
        },
        integrationOptions: {
          type: "REDIRECT",
          onCompleteUrl: `${window.location.origin}/commerce-hub-success?transactionId=${credentials.transactionId}`
        }
      });

      console.log("📝 Form instance created:", formInstance);

      // Mount the form
      formInstance.mount("#commerce-hub-checkout-form");
      setFormMounted(true);
      setLoading(false);

      console.log("✅ Commerce Hub form mounted successfully");

      // Handle form events
      formInstance.on("success", async (result) => {
        console.log("💳 Form submitted successfully:", result);
        handlePaymentCompletion(credentials);
      });

      formInstance.on("error", (error) => {
        console.error("❌ Form error:", error);
        setError(error.message || "Payment form error. Please try again.");
      });

    } catch (err) {
      console.error("Form creation error:", err);
      console.error("Error details:", {
        name: err.name,
        message: err.message,
        stack: err.stack
      });
      setError(err.message || "Failed to create payment form. Please check configuration.");
      setLoading(false);
    }
  };

  const handlePaymentCompletion = async (credentials) => {
    try {
      console.log("🔄 Processing payment...");

      // Step 6: Submit charges API request
      const response = await Parse.Cloud.run("commerceHubProcessPayment", {
        sessionId: credentials.sessionId,
        transactionId: credentials.transactionId
      });

      if (response.success && response.status === "APPROVED") {
        console.log("✅ Payment successful");
        
        setPaymentStatus({
          status: "success",
          amount: credentials.amount,
          transactionId: credentials.transactionId,
        });

        setShowSuccessAnimation(true);

        // Redirect after 3 seconds
        setTimeout(() => {
          navigate("/playerDashboard");
        }, 3000);
      } else {
        const errorMsg = response.message || "Payment was not approved";
        setError(errorMsg);
        setPaymentStatus({
          status: "failed",
          reason: errorMsg,
        });
        console.log("❌ Payment not approved:", errorMsg);
      }
    } catch (err) {
      console.error("❌ Payment processing error:", err);
      setError(err.message || "Failed to process payment");
      setPaymentStatus({
        status: "failed",
        reason: err.message || "Failed to process payment",
      });
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
      }}
    >
      {/* Success Animation */}
      {showSuccessAnimation && (
        <Box
          sx={{
            textAlign: "center",
            py: 6,
          }}
        >
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
            Redirecting to dashboard...
          </Typography>
        </Box>
      )}

      {/* Loading State */}
      {loading && !showSuccessAnimation && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
          }}
        >
          <CircularProgress size={50} sx={{ color: "#0066CC" }} />
          <Typography variant="body1" sx={{ mt: 2, color: "#6B7280" }}>
            Loading secure payment form...
          </Typography>
        </Box>
      )}

      {/* Error Alert */}
      {error && !showSuccessAnimation && (
        <Box sx={{ p: 2 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      )}

      {/* Commerce Hub Form Container - Renders directly without any wrapper */}
      {!showSuccessAnimation && (
        <Box
          id="commerce-hub-checkout-form"
          sx={{
            width: "100%",
            height: "100vh",
            display: loading ? "none" : "block",
          }}
        />
      )}
    </Box>
  );
};

export default CommerceHubWidget;
