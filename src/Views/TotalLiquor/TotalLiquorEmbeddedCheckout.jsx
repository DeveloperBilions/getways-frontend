import React, { useCallback, useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";
import { Parse } from "parse";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  TextField, 
  Alert, 
  Stack, 
  Divider,
  Card,
  CardContent 
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PaymentIcon from "@mui/icons-material/Payment";
import { parseConfig } from "../../parseConfig";

// Parse initialization
Parse.initialize(parseConfig.APP_ID, parseConfig.MASTER_KEY);
Parse.serverURL = parseConfig.URL;

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_KEY_PRIVATE);

export const TotalLiquorEmbeddedCheckout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Form state
  const [formData, setFormData] = useState({
    userId: searchParams.get("userId") || "",
    orderId: searchParams.get("orderId") || "",
    totalAmount: searchParams.get("amount") || "",
  });

  const [showCheckout, setShowCheckout] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  // Auto-fill from URL parameters and auto-proceed if all params provided
  useEffect(() => {
    const urlParams = {
      userId: searchParams.get("userId"),
      orderId: searchParams.get("orderId"),
      totalAmount: searchParams.get("amount"),
    };

    if (urlParams.userId && urlParams.orderId && urlParams.totalAmount) {
      setFormData((prev) => ({ ...prev, ...urlParams }));
      
      // Auto-proceed if all params are valid
      if (parseFloat(urlParams.totalAmount) > 0) {
        setShowCheckout(true);
      }
    }
    // Reset the URL to remove query parameters after autofill
    if (urlParams.userId && urlParams.orderId && urlParams.totalAmount) {
      navigate(location.pathname, { replace: true });
    }
  }, [searchParams]);

  // Form validation
  const validateForm = () => {
    const errors = {};

    if (!formData.userId.trim()) {
      errors.userId = "User ID is required";
    }

    if (!formData.orderId.trim()) {
      errors.orderId = "Order ID is required";
    }

    if (!formData.totalAmount || parseFloat(formData.totalAmount) <= 0) {
      errors.totalAmount = "Valid amount is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  // Proceed to embedded checkout
  const handleProceedToPayment = () => {
    if (!validateForm()) return;
    
    setError(null);
    setShowCheckout(true);
  };

  // Get current values for checkout
  const userId = formData.userId;
  const orderId = formData.orderId;
  const totalAmount = parseFloat(formData.totalAmount || 0);

  const fetchClientSecret = useCallback(() => {
    if (!userId || !orderId || !totalAmount || totalAmount <= 0) {
      console.error("Missing required parameters for Total Liquor checkout");
      return Promise.reject(new Error("Missing required parameters"));
    }

    setLoading(true);
    return Parse.Cloud.run("totalLiquorStripeCheckout", {
      UserId: userId,
      OrderId: orderId,
      totalAmount: totalAmount
    })
      .then((data) => {
        setLoading(false);
        if (data.clientSecret) {
          return data.clientSecret;
        }
        throw new Error("No client secret received");
      })
      .catch((err) => {
        console.error("Failed to create Total Liquor checkout session:", err);
        setLoading(false);
        setError(`Failed to initialize payment: ${err.message || "Please try again."}`);
        return null;
      });
  }, [userId, orderId, totalAmount]);

  const options = { fetchClientSecret };

  // Show form if checkout is not ready
  if (!showCheckout || !userId || !orderId || !totalAmount) {
    return (
      <Box sx={{ maxWidth: 800, margin: "0 auto", padding: 3 }}>
        {/* Header */}
        <Paper elevation={1} sx={{ p: 3, mb: 3, textAlign: "center" }}>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            display="flex"
            alignItems="center"
            justifyContent="center"
            gap={1}
          >
            <ShoppingCartIcon fontSize="large" />
            Total Liquor Checkout
          </Typography>
        </Paper>

        {/* Checkout Form */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Order Details
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Stack spacing={3}>
              <TextField
                label="User ID"
                value={formData.userId}
                onChange={(e) => handleInputChange("userId", e.target.value)}
                error={!!validationErrors.userId}
                helperText={validationErrors.userId}
                fullWidth
                required
                placeholder="Enter your user ID"
              />

              <TextField
                label="Order ID"
                value={formData.orderId}
                onChange={(e) => handleInputChange("orderId", e.target.value)}
                error={!!validationErrors.orderId}
                helperText={validationErrors.orderId}
                fullWidth
                required
                placeholder="Enter your order ID"
              />

              <TextField
                label="Total Amount"
                type="number"
                value={formData.totalAmount}
                onChange={(e) => handleInputChange("totalAmount", e.target.value)}
                error={!!validationErrors.totalAmount}
                helperText={validationErrors.totalAmount || "Amount in USD"}
                fullWidth
                required
                inputProps={{ min: 0.01, step: 0.01 }}
                placeholder="0.00"
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                }}
              />

              <Divider />

              {formData.totalAmount && parseFloat(formData.totalAmount) > 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Order Summary
                  </Typography>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography>Order ID:</Typography>
                    <Typography fontWeight="bold">
                      {formData.orderId || "N/A"}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography>Amount:</Typography>
                    <Typography fontWeight="bold" color="primary">
                      ${parseFloat(formData.totalAmount).toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              )}

              <Button
                variant="contained"
                size="large"
                onClick={handleProceedToPayment}
                disabled={
                  loading ||
                  !formData.userId ||
                  !formData.orderId ||
                  !formData.totalAmount
                }
                startIcon={<PaymentIcon />}
                sx={{ py: 1.5 }}
              >
                {loading ? "Processing..." : "Proceed to Payment"}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    );
  }

  // Show embedded checkout
  return (
    <Box sx={{ maxWidth: 1000, margin: "0 auto", padding: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        {/* <Button
          variant="outlined"
          size="small"
          startIcon={<ArrowBackIcon />}
          onClick={() => setShowCheckout(false)}
        >
          Back to Form
        </Button> */}
        <Typography variant="h5" component="h1" display="flex" alignItems="center" gap={1}>
          <ShoppingCartIcon />
          Total Liquor Payment
        </Typography>
      </Box>

      {/* Order Summary */}
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Order Summary
        </Typography>
        <Box display="flex" justifyContent="space-between" mb={1}>
          <Typography>Order ID:</Typography>
          <Typography fontWeight="bold">{orderId}</Typography>
        </Box>
        <Box display="flex" justifyContent="space-between" mb={1}>
          <Typography>Amount:</Typography>
          <Typography fontWeight="bold" color="primary">
            ${totalAmount.toFixed(2)}
          </Typography>
        </Box>
      </Paper>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Embedded Stripe Checkout */}
      <Paper elevation={1} sx={{ p: 1 }}>
        <div id="total-liquor-checkout">
          <EmbeddedCheckoutProvider stripe={stripePromise} options={options}>
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        </div>
      </Paper>
    </Box>
  );
};

export default TotalLiquorEmbeddedCheckout;