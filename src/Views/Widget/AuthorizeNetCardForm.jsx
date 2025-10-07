import React, { useState } from "react";
import { Parse } from "parse";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  TextField,
  Grid,
  Divider,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import SecurityIcon from "@mui/icons-material/Security";
import { useGetIdentity } from "react-admin";
import { updatePotBalance } from "../../Utils/utils";

// Parse init
Parse.initialize(process.env.REACT_APP_APPID, process.env.REACT_APP_MASTER_KEY);
Parse.serverURL = process.env.REACT_APP_URL;

export const AuthorizeNetCardForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { identity } = useGetIdentity();
  const { amount, type, remark } = location?.state || {};

  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [error, setError] = useState(null);

  // Card form state
  const [cardData, setCardData] = useState({
    cardNumber: "",
    expirationDate: "",
    cardCode: "",
  });

  // Billing form state
  const [billingData, setBillingData] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "US",
  });

  const handleCardChange = (field, value) => {
    let formattedValue = value;
    
    if (field === 'cardNumber') {
      // Remove all non-digits
      formattedValue = value.replace(/\D/g, '');
      // Add spaces every 4 digits
      formattedValue = formattedValue.replace(/(\d{4})(?=\d)/g, '$1 ');
      // Limit to 19 characters (16 digits + 3 spaces)
      formattedValue = formattedValue.substring(0, 19);
    } else if (field === 'expirationDate') {
      // Remove all non-digits
      formattedValue = value.replace(/\D/g, '');
      // Format as MM/YY and convert to YYYY-MM internally
      if (formattedValue.length >= 2) {
        const month = formattedValue.substring(0, 2);
        const year = formattedValue.substring(2, 4);
        if (year.length > 0) {
          formattedValue = `${month}/${year}`;
        } else {
          formattedValue = month;
        }
      }
      // Limit to 5 characters (MM/YY)
      formattedValue = formattedValue.substring(0, 5);
    } else if (field === 'cardCode') {
      // Remove all non-digits and limit to 4 characters
      formattedValue = value.replace(/\D/g, '').substring(0, 4);
    }

    setCardData(prev => ({
      ...prev,
      [field]: formattedValue
    }));
  };

  const handleBillingChange = (field, value) => {
    setBillingData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    const errors = [];
    
    // Card validation
    const cardNumber = cardData.cardNumber.replace(/\s/g, '');
    if (!cardNumber || cardNumber.length < 13 || cardNumber.length > 16) {
      errors.push("Valid card number is required (13-16 digits)");
    }
    
    if (!cardData.expirationDate || cardData.expirationDate.length !== 5) {
      errors.push("Valid expiration date is required (MM/YY format)");
    } else {
      // Check if the expiration date is in the future
      const [month, year] = cardData.expirationDate.split('/');
      const fullYear = `20${year}`;
      const expDate = new Date(parseInt(fullYear), parseInt(month) - 1);
      const now = new Date();
      const currentMonth = new Date(now.getFullYear(), now.getMonth());
      
      if (expDate < currentMonth) {
        errors.push("Card has expired");
      }
    }
    
    if (!cardData.cardCode || cardData.cardCode.length < 3) {
      errors.push("Valid CVV is required (3-4 digits)");
    }

    // Billing validation
    if (!billingData.firstName.trim()) {
      errors.push("First name is required");
    }
    
    if (!billingData.lastName.trim()) {
      errors.push("Last name is required");
    }

    return errors;
  };

  const handleSubmit = async () => {
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(", "));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const cloudFunction = type === "charge" ? "authorizeNetChargeCard" : "authorizeNetAuthorizeCard";
      
      // Convert MM/YY to YYYY-MM format for the API
      const [month, year] = cardData.expirationDate.split('/');
      const apiExpirationDate = `20${year}-${month}`;
      
      const response = await Parse.Cloud.run(cloudFunction, {
        amount: amount,
        creditCard: {
          cardNumber: cardData.cardNumber.replace(/\s/g, ''),
          expirationDate: apiExpirationDate,
          cardCode: cardData.cardCode,
        },
        billingInfo: billingData,
        customerInfo: {
          id: identity?.objectId || "guest"
        }
      });

      console.log(`✅ ${type === "charge" ? "Charge" : "Authorization"} successful:`, response);
      setPaymentStatus({
        status: "success",
        ...response
      });

      // Pot balance is already updated in the backend AuthorizeNet.js
      console.log("✅ Transaction completed - pot balance updated by backend");

      // Redirect after 3 seconds
      setTimeout(() => {
        navigate("/playerDashboard");
      }, 3000);

    } catch (error) {
      console.error(`❌ ${type === "charge" ? "Charge" : "Authorization"} failed:`, error);
      setPaymentStatus({
        status: "failed",
        message: error.message || "Payment processing failed"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!amount || !type) {
    return (
      <Box className="container py-4">
        <Alert severity="error">
          Invalid payment parameters. Please return to the recharge page.
        </Alert>
        <Button
          variant="outlined"
          onClick={() => navigate("/playerDashboard")}
          sx={{ mt: 2 }}
        >
          Back to Dashboard
        </Button>
      </Box>
    );
  }

  return (
    <Box className="container py-4" sx={{ maxWidth: "600px", mx: "auto" }}>
      <Box display="flex" justifyContent="start" mb={2}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/playerDashboard")}
        >
          Back
        </Button>
      </Box>

      <Typography variant="h4" gutterBottom>
        {type === "charge" ? "Charge Credit Card" : "Authorize Credit Card"}
      </Typography>

      <Typography variant="body1" color="text.secondary" gutterBottom>
        Amount: <strong>${amount}</strong>
        {remark && ` • ${remark}`}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {paymentStatus?.status === "success" && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {type === "charge" ? "Payment" : "Authorization"} successful! 
          Transaction ID: {paymentStatus.transactionId}
          {paymentStatus.note && ` • ${paymentStatus.note}`}
        </Alert>
      )}

      {paymentStatus?.status === "failed" && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {type === "charge" ? "Payment" : "Authorization"} failed: {paymentStatus.message}
        </Alert>
      )}

      {!paymentStatus && (
        <Card>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
              <CreditCardIcon sx={{ mr: 1, color: "#1976d2" }} />
              <Typography variant="h6">
                Card Information
              </Typography>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Card Number"
                  value={cardData.cardNumber}
                  onChange={(e) => handleCardChange('cardNumber', e.target.value)}
                  placeholder="1234 5678 9012 3456"
                  inputProps={{ maxLength: 19 }}
                />
              </Grid>
              
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Expiration Date"
                  value={cardData.expirationDate}
                  onChange={(e) => handleCardChange('expirationDate', e.target.value)}
                  placeholder="MM/YY"
                  inputProps={{ maxLength: 5 }}
                />
              </Grid>
              
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="CVV"
                  value={cardData.cardCode}
                  onChange={(e) => handleCardChange('cardCode', e.target.value)}
                  placeholder="123"
                  inputProps={{ maxLength: 4 }}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
              <SecurityIcon sx={{ mr: 1, color: "#1976d2" }} />
              <Typography variant="h6">
                Billing Information
              </Typography>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={billingData.firstName}
                  onChange={(e) => handleBillingChange('firstName', e.target.value)}
                  required
                />
              </Grid>
              
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={billingData.lastName}
                  onChange={(e) => handleBillingChange('lastName', e.target.value)}
                  required
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  value={billingData.address}
                  onChange={(e) => handleBillingChange('address', e.target.value)}
                />
              </Grid>
              
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="City"
                  value={billingData.city}
                  onChange={(e) => handleBillingChange('city', e.target.value)}
                />
              </Grid>
              
              <Grid item xs={3}>
                <TextField
                  fullWidth
                  label="State"
                  value={billingData.state}
                  onChange={(e) => handleBillingChange('state', e.target.value)}
                  placeholder="TX"
                />
              </Grid>
              
              <Grid item xs={3}>
                <TextField
                  fullWidth
                  label="ZIP"
                  value={billingData.zip}
                  onChange={(e) => handleBillingChange('zip', e.target.value)}
                  placeholder="12345"
                />
              </Grid>
            </Grid>

            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={handleSubmit}
              disabled={loading}
              sx={{ 
                mt: 3, 
                py: 1.5,
                bgcolor: type === "charge" ? "#28A745" : "#FFA500",
                "&:hover": {
                  bgcolor: type === "charge" ? "#218838" : "#FF8C00"
                }
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                `${type === "charge" ? "Charge" : "Authorize"} $${amount}`
              )}
            </Button>

            <Typography variant="caption" display="block" sx={{ mt: 2, textAlign: "center", color: "text.secondary" }}>
              {type === "charge" 
                ? "Your card will be charged immediately" 
                : "Your card will be authorized but not charged until captured"
              }
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};