import React, { useState, useEffect } from "react";
import { Parse } from "parse";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Paper,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

Parse.initialize(process.env.REACT_APP_APPID, process.env.REACT_APP_MASTER_KEY);
Parse.serverURL = process.env.REACT_APP_URL;

const FiservCheckoutWidget = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [checkoutData, setCheckoutData] = useState(null);

  const { amount, remark, platform, gc_coins, sc_coins, userId } = location.state || {};

  useEffect(() => {
    if (!amount) {
      setError("No amount specified for recharge");
      setTimeout(() => navigate("/recharge"), 2000);
    }
  }, [amount, navigate]);

  const handleCreateCheckout = async () => {
    setLoading(true);
    setError(null);

    try {
      const currentUser = Parse.User.current();
      
      if (!currentUser) {
        throw new Error("Please log in to continue");
      }

      const response = await Parse.Cloud.run("fiservCreateCheckout", {
        amount: parseFloat(amount),
        remark: remark ,
        platform: platform || "web",
        gc_coins: gc_coins || null,
        sc_coins: sc_coins || null,
        customerInfo: {
          email: currentUser.get("email") || null,
          firstName: currentUser.get("firstName") || null,
          lastName: currentUser.get("lastName") || null,
          name: currentUser.get("username") || null,
        }
      });

      if (response.success && response.redirectionUrl) {
        setCheckoutData(response);
        // Redirect to Fiserv checkout page
        window.location.href = response.redirectionUrl;
      } else {
        throw new Error("Failed to create checkout session");
      }
    } catch (err) {
      console.error("Fiserv checkout error:", err);
      setError(err.message || "Failed to create checkout. Please try again.");
      setLoading(false);
    }
  };

  const handleBackClick = () => {
    navigate("/recharge");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#f5f5f5",
        p: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          maxWidth: 500,
          width: "100%",
          p: 4,
          borderRadius: 2,
        }}
      >
        <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleBackClick}
            disabled={loading}
            sx={{ minWidth: "auto" }}
          >
            Back
          </Button>
          <Typography variant="h5" fontWeight={600}>
            Fiserv Checkout
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            Recharge Amount
          </Typography>
          <Typography variant="h4" fontWeight={600} color="primary">
            ${amount}
          </Typography>
        </Box>

        {remark && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Remark: {remark}
            </Typography>
          </Box>
        )}

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" paragraph>
            You will be redirected to Fiserv's secure payment page to complete your transaction.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ✓ Secure payment processing
            <br />
            ✓ Multiple payment methods supported
            <br />
            ✓ Instant confirmation
          </Typography>
        </Box>

        <Button
          variant="contained"
          fullWidth
          size="large"
          onClick={handleCreateCheckout}
          disabled={loading || !amount}
          sx={{
            mt: 2,
            py: 1.5,
            textTransform: "none",
            fontSize: "1rem",
          }}
        >
          {loading ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CircularProgress size={20} color="inherit" />
              <span>Redirecting to Fiserv...</span>
            </Box>
          ) : (
            "Proceed to Payment"
          )}
        </Button>
      </Paper>
    </Box>
  );
};

export default FiservCheckoutWidget;