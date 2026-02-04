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
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

Parse.initialize(process.env.REACT_APP_APPID, process.env.REACT_APP_MASTER_KEY);
Parse.serverURL = process.env.REACT_APP_URL;

const FiservCheckoutSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(true);
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
    const verifyPayment = async () => {
      // Debug: Log the full URL and hash
      console.log('Full URL:', window.location.href);
      console.log('Hash:', window.location.hash);
      console.log('Search:', window.location.search);
      console.log('Extracted checkoutId:', checkoutId);
      
      if (!checkoutId) {
        // Try to get the most recent pending Fiserv Checkout transaction for this user
        console.log('No checkoutId found in URL, trying to find recent transaction...');
        try {
          const query = new Parse.Query("TransactionRecords");
          query.equalTo("portal", "FiservCheckout");
          query.equalTo("status", 1); // pending
          query.equalTo("userId", Parse.User.current()?.id);
          query.descending("createdAt");
          query.limit(1);
          
          const recentTxn = await query.first({ useMasterKey: true });
          if (recentTxn) {
            const txnCheckoutId = recentTxn.get("transactionIdFromStripe");
            console.log('Found recent transaction with checkoutId:', txnCheckoutId);
            
            // Manually set it and continue verification
            if (txnCheckoutId) {
              await verifyCheckout(txnCheckoutId);
              return;
            }
          }
        } catch (err) {
          console.error('Error finding recent transaction:', err);
        }
        
        setError("No checkout ID found");
        setVerifying(false);
        setLoading(false);
        console.error('Failed to extract checkout ID from URL or database');
        return;
      }

      await verifyCheckout(checkoutId);
    };

    const verifyCheckout = async (checkoutId) => {

      try {
        // Get checkout details from Fiserv
        const result = await Parse.Cloud.run("fiservGetCheckoutDetails", {
          checkoutId: checkoutId
        });

        if (result.success) {
          const details = result.checkoutDetails;
          console.log('Checkout details:', details);
          
          setPaymentStatus({
            status: details.transactionStatus,
            amount: details.approvedAmount?.total,
            currency: details.approvedAmount?.currency,
            checkoutId: details.checkoutId
          });

          if (details.transactionStatus === "APPROVED") {
            // Trigger verification process
            setTimeout(() => {
              Parse.Cloud.run("checkFiservCheckoutRecharge").catch(err => {
                console.error("Error triggering verification:", err);
              });
            }, 2000);
          }
        }
      } catch (err) {
        console.error("Error verifying payment:", err);
        setError(err.message || "Failed to verify payment");
      } finally {
        setVerifying(false);
        setLoading(false);
      }
    };

    verifyPayment();
  }, []);

  const handleReturnToDashboard = () => {
    navigate("/playerDashboard");
  };

  const handleViewTransactions = () => {
    navigate("/transactions");
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
          {error ? (
            <>
              <Alert severity="warning" sx={{ mb: 3 }}>
                {error}
              </Alert>
              <Button
                variant="contained"
                onClick={handleReturnToDashboard}
                fullWidth
                sx={{ bgcolor: "#6366F1", "&:hover": { bgcolor: "#4F46E5" } }}
              >
                Return to Dashboard
              </Button>
            </>
          ) : (
            <>
              <CheckCircleIcon
                sx={{
                  fontSize: 80,
                  color: "#10B981",
                  mb: 2,
                }}
              />
              
              <Typography variant="h4" fontWeight={600} gutterBottom sx={{ color: "#111827" }}>
                Payment Successful!
              </Typography>

              <Typography variant="body1" color="text.secondary" paragraph>
                Your recharge has been processed successfully.
              </Typography>

              {paymentStatus && (
                <Box sx={{ my: 3, p: 2, bgcolor: "#F4F3FC", borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Amount
                  </Typography>
                  <Typography variant="h5" fontWeight={600} color="#6366F1">
                    {paymentStatus.currency} ${paymentStatus.amount}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                    Checkout ID: {paymentStatus.checkoutId}
                  </Typography>
                </Box>
              )}

              {verifying && (
                <Alert severity="info" sx={{ mb: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, justifyContent: "center" }}>
                    <CircularProgress size={16} />
                    <span>Verifying payment and updating balance...</span>
                  </Box>
                </Alert>
              )}

              <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
                <Button
                  variant="contained"
                  onClick={handleReturnToDashboard}
                  fullWidth
                  sx={{ 
                    bgcolor: "#6366F1", 
                    color: "#fff",
                    "&:hover": { bgcolor: "#4F46E5" } 
                  }}
                >
                  Go to Dashboard
                </Button>
              </Box>
            </>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default FiservCheckoutSuccess;
