import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  Button,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const PayNearMeSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get payment details from navigation state
  const paymentDetails = location.state || {};
  const { amount, transactionId, transactionDate } = paymentDetails;

  const handleReturnToDashboard = () => {
    navigate("/playerDashboard");
  };

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
            Your recharge has been processed successfully via PayNearMe.
          </Typography>

          {(amount || transactionId) && (
            <Box sx={{ my: 3, p: 2, bgcolor: "#F4F3FC", borderRadius: 1 }}>
              {amount && (
                <>
                  <Typography variant="body2" color="text.secondary">
                    Amount
                  </Typography>
                  <Typography variant="h5" fontWeight={600} color="#6366F1">
                    ${amount}
                  </Typography>
                </>
              )}
              {transactionId && (
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                  Transaction ID: {transactionId}
                </Typography>
              )}
              {transactionDate && (
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                  Date: {new Date(transactionDate).toLocaleString()}
                </Typography>
              )}
            </Box>
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
        </Paper>
      </Box>
    </Box>
  );
};

export default PayNearMeSuccess;
