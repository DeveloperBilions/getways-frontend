import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Parse } from "parse";
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import ErrorIcon from "@mui/icons-material/Error";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

Parse.initialize(process.env.REACT_APP_APPID, process.env.REACT_APP_MASTER_KEY);
Parse.serverURL = process.env.REACT_APP_URL;

const FiservCheckoutFailure = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [error, setError] = useState(null);

  // Get checkoutId from URL - handle both query params and hash
  const getCheckoutId = () => {
    // Try query params first
    let checkoutId = searchParams.get("checkoutId") || searchParams.get("checkout_id");
    
    // If not in query params, check hash (Fiserv uses #/?checkoutId=xxx format)
    if (!checkoutId) {
      const fullUrl = window.location.href;
      
      // Try to extract from hash fragment
      if (window.location.hash) {
        const hash = window.location.hash;
        // Handle format like #/?checkoutId=xxx
        const match = hash.match(/[?&]checkoutId=([^&]+)/);
        if (match) {
          checkoutId = match[1];
        }
      }
      
      // Also try direct URL pattern matching as fallback
      if (!checkoutId) {
        const urlMatch = fullUrl.match(/[?&#]checkoutId=([^&]+)/);
        if (urlMatch) {
          checkoutId = urlMatch[1];
        }
      }
    }
    
    console.log('Extracted checkoutId:', checkoutId);
    return checkoutId;
  };

  const checkoutId = getCheckoutId();

  useEffect(() => {
    const getPaymentDetails = async () => {
      if (!checkoutId) {
        setError("No checkout ID found");
        setLoading(false);
        return;
      }

      try {
        const result = await Parse.Cloud.run("fiservGetCheckoutDetails", {
          checkoutId: checkoutId
        });

        if (result.success) {
          const details = result.checkoutDetails;
          setPaymentStatus({
            status: details.transactionStatus,
            amount: details.approvedAmount?.total,
            currency: details.approvedAmount?.currency,
            checkoutId: details.checkoutId,
            failureReason: details.transactionFailure?.reason || "Payment was not completed"
          });
        }
      } catch (err) {
        console.error("Error getting payment details:", err);
        setError(err.message || "Failed to get payment details");
      } finally {
        setLoading(false);
      }
    };

    getPaymentDetails();
  }, [checkoutId]);

  const handleRetryPayment = () => {
    navigate("/recharge");
  };

  const handleReturnToDashboard = () => {
    navigate("/playerDashboard");
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#F4F3FC",
        }}
      >
        <CircularProgress sx={{ color: "#6366F1" }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#F4F3FC",
        p: 2,
      }}
    >
      {/* Back Button */}
      <Box sx={{ maxWidth: 500, width: "100%", mx: "auto", mb: 2 }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<ArrowBackIcon />}
          onClick={handleReturnToDashboard}
        >
          Back
        </Button>
      </Box>

      <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Paper
          elevation={3}
          sx={{
            maxWidth: 500,
            width: "100%",
            p: 4,
            borderRadius: 2,
            bgcolor: "#fff",
            textAlign: "center",
          }}
        >
          <ErrorIcon
            sx={{
              fontSize: 80,
              color: "#EF4444",
              mb: 2,
            }}
          />
          
          <Typography variant="h4" fontWeight={600} gutterBottom color="#EF4444">
            Payment Failed
          </Typography>

          <Typography variant="body1" color="text.secondary" paragraph>
            Unfortunately, your payment could not be processed.
          </Typography>

          {paymentStatus && (
            <Box sx={{ my: 3 }}>
              {paymentStatus.failureReason && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {paymentStatus.failureReason}
                </Alert>
              )}
              
              <Box sx={{ p: 2, bgcolor: "#F4F3FC", borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Attempted Amount
                </Typography>
                <Typography variant="h6" fontWeight={600}>
                  {paymentStatus.currency} ${paymentStatus.amount}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                  Checkout ID: {paymentStatus.checkoutId}
                </Typography>
              </Box>
            </Box>
          )}

          {error && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Typography variant="body2" color="text.secondary" paragraph sx={{ mt: 3 }}>
            Please check your payment details and try again. If the problem persists, contact support.
          </Typography>

          <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
            <Button
              variant="outlined"
              onClick={handleReturnToDashboard}
              fullWidth
              sx={{ 
                borderColor: "#6366F1", 
                color: "#6366F1",
                "&:hover": { 
                  borderColor: "#4F46E5", 
                  bgcolor: "rgba(99, 102, 241, 0.1)" 
                } 
              }}
            >
              Go to Dashboard
            </Button>
            <Button
              variant="contained"
              onClick={handleRetryPayment}
              fullWidth
              sx={{ 
                bgcolor: "#6366F1", 
                color: "#fff",
                "&:hover": { bgcolor: "#4F46E5" } 
              }}
            >
              Try Again
            </Button>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default FiservCheckoutFailure;
