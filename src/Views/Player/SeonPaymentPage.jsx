import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  TextField,
  Grid,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  Chip,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SecurityIcon from "@mui/icons-material/Security";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";
import CancelIcon from "@mui/icons-material/Cancel";
import { Parse } from "parse";
import { useGetIdentity } from "react-admin";

const SeonPaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { identity } = useGetIdentity();

  const { rechargeAmount = 50, remark = "" } = location.state || {};

  // Form state
  const [formData, setFormData] = useState({
    email: identity?.email || "",
    phone: identity?.username || "",
    userName: identity?.username || "",
    cardNumber: "",
    cardExpiry: "",
    cvv: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "US",
    // Transaction details for SEON
    paymentProvider: "manual_entry",
    cardHash: "",
    avsResult: "Y", // Address Verification System result (Y/N/U)
    status3d: "not_attempted", // 3D Secure status: authenticated, attempted, not_attempted, failed
    scaMethod: "none", // Strong Customer Authentication: 3ds, biometric, none
  });

  // Generate session and device IDs on mount
  const [sessionId] = useState(`sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [deviceId] = useState(`DEV_${Math.random().toString(36).substr(2, 9).toUpperCase()}`);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleInputChange = (field, value) => {
    let formattedValue = value;

    // Card number formatting
    if (field === "cardNumber") {
      // Remove all non-digits
      formattedValue = value.replace(/\D/g, "");
      // Add spaces every 4 digits
      formattedValue = formattedValue.replace(/(\d{4})(?=\d)/g, "$1 ");
      // Limit to 19 characters (16 digits + 3 spaces)
      formattedValue = formattedValue.substring(0, 19);
    }
    
    // Expiration date formatting (MM/YY)
    else if (field === "cardExpiry") {
      // Remove all non-digits
      formattedValue = value.replace(/\D/g, "");
      // Format as MM/YY
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
    }
    
    // CVV formatting
    else if (field === "cvv") {
      // Remove all non-digits and limit to 4 characters
      formattedValue = value.replace(/\D/g, "").substring(0, 4);
    }

    setFormData({ ...formData, [field]: formattedValue });
  };

  const handleSeonCheck = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log("🔍 Calling SEON Fraud Check...");

      // Get user's IP address (frontend can't directly access IP, backend will use request.ip)
      const response = await Parse.Cloud.run("seonFraudCheck", {
        email: formData.email,
        phone: formData.phone,
        userName: formData.userName,
        cardNumber: formData.cardNumber,
        cardExpiry: formData.cardExpiry,
        cvv: formData.cvv,
        firstName: formData.firstName,
        lastName: formData.lastName,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip: formData.zip,
        country: formData.country,
        amount: rechargeAmount,
        userId: identity?.objectId,
        // SEON Transaction Monitoring fields
        sessionId: sessionId,
        deviceId: deviceId,
        paymentProvider: formData.paymentProvider,
        avsResult: formData.avsResult,
        status3d: formData.status3d,
        scaMethod: formData.scaMethod,
        // IP will be automatically extracted from request.ip in backend
      });

      console.log("✅ SEON Response:", response);
      setResult(response);
    } catch (err) {
      console.error("❌ SEON Error:", err);
      setError(err.message || "Failed to check fraud");
    } finally {
      setLoading(false);
    }
  };

  const getStateColor = (state) => {
    switch (state) {
      case "APPROVE":
        return "success";
      case "REVIEW":
        return "warning";
      case "DECLINE":
        return "error";
      default:
        return "default";
    }
  };

  const getStateIcon = (state) => {
    switch (state) {
      case "APPROVE":
        return <CheckCircleIcon />;
      case "REVIEW":
        return <WarningIcon />;
      case "DECLINE":
        return <CancelIcon />;
      default:
        return <SecurityIcon />;
    }
  };

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
        SEON
      </Typography>

      <Typography variant="body1" color="text.secondary" gutterBottom>
        Amount: <strong>${rechargeAmount}</strong>
        {remark && ` • ${remark}`}
      </Typography>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <strong>Error:</strong> {error}
        </Alert>
      )}

      {/* Payment Form */}
      {!result && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
              <SecurityIcon sx={{ mr: 1, color: "#1976d2" }} />
              <Typography variant="h6">Card Information</Typography>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Card Number"
                  placeholder="4242 4242 4242 4242"
                  value={formData.cardNumber}
                  onChange={(e) =>
                    handleInputChange("cardNumber", e.target.value)
                  }
                  inputProps={{ maxLength: 19 }}
                  helperText="Use test card: 4242424242424242"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Expiration Date"
                  placeholder="MM/YY"
                  value={formData.cardExpiry}
                  onChange={(e) =>
                    handleInputChange("cardExpiry", e.target.value)
                  }
                  inputProps={{ maxLength: 5 }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="CVV"
                  placeholder="123"
                  value={formData.cvv}
                  onChange={(e) => handleInputChange("cvv", e.target.value)}
                  inputProps={{ maxLength: 4 }}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
              <SecurityIcon sx={{ mr: 1, color: "#1976d2" }} />
              <Typography variant="h6">Billing Information</Typography>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="First Name *"
                  value={formData.firstName}
                  onChange={(e) =>
                    handleInputChange("firstName", e.target.value)
                  }
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Last Name *"
                  value={formData.lastName}
                  onChange={(e) =>
                    handleInputChange("lastName", e.target.value)
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="City"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="State"
                  placeholder="CA"
                  value={formData.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="ZIP"
                  value={formData.zip}
                  onChange={(e) => handleInputChange("zip", e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Country"
                  value={formData.country}
                  onChange={(e) => handleInputChange("country", e.target.value)}
                  helperText="Default: US"
                />
              </Grid>
            </Grid>

            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleSeonCheck}
              disabled={loading || !formData.firstName || !formData.lastName}
              sx={{
                mt: 3,
                backgroundColor: "#28a745",
                "&:hover": { backgroundColor: "#218838" },
                textTransform: "none",
                fontWeight: "bold",
                py: 1.5,
              }}
            >
              {loading ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1, color: "white" }} />
                  Checking Fraud Score...
                </>
              ) : (
                `Pay $${rechargeAmount}`
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Results Display */}
      {result && (
        <Card sx={{ mt: 3, borderRadius: 2, border: "2px solid #E2E8F0" }}>
          <CardContent>
            <Box sx={{ textAlign: "center", mb: 3 }}>
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  bgcolor: `${getStateColor(result.state)}.light`,
                  color: `${getStateColor(result.state)}.main`,
                  mb: 2,
                }}
              >
                {getStateIcon(result.state)}
              </Box>

              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Fraud Score: {result.fraud_score}
              </Typography>

              <Chip
                label={result.state}
                color={getStateColor(result.state)}
                icon={getStateIcon(result.state)}
                sx={{ fontWeight: "bold", fontSize: "16px", px: 2, py: 2.5 }}
              />

              <Typography
                variant="body1"
                sx={{ mt: 2, color: "text.secondary", fontWeight: 500 }}
              >
                {result.recommendation}
              </Typography>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Details */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                📊 Transaction Details
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Transaction ID: {result.transaction_id}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                SEON ID: {result.seon_id}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Calculation Time: {result.calculation_time}ms
              </Typography>
            </Box>

            {/* Applied Rules */}
            {result.applied_rules && result.applied_rules.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  🚨 Applied Rules ({result.applied_rules.length})
                </Typography>
                {result.applied_rules.map((rule, index) => (
                  <Box
                    key={index}
                    sx={{
                      p: 1,
                      mb: 1,
                      bgcolor: "#F7FAFC",
                      borderRadius: 1,
                      border: "1px solid #E2E8F0",
                    }}
                  >
                    <Typography variant="body2" fontWeight="500">
                      {rule.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Score Impact: {rule.operation}
                      {rule.score}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}

            {/* Email Details */}
            {result.email_details && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  📧 Email Analysis
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Email: {result.email_details.email}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Deliverable:{" "}
                  {result.email_details.email_details?.deliverable ? "✅ Yes" : "❌ No"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Disposable:{" "}
                  {result.email_details.email_domain_details?.disposable
                    ? "⚠️ Yes"
                    : "✅ No"}
                </Typography>
                {result.email_details.breach_details?.number_of_breaches >
                  0 && (
                  <Typography variant="body2" color="error">
                    ⚠️ Found in{" "}
                    {result.email_details.breach_details.number_of_breaches}{" "}
                    data breaches
                  </Typography>
                )}
              </Box>
            )}

            {/* Phone Details */}
            {result.phone_details && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  📱 Phone Analysis
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Valid: {result.phone_details.provider_carrier_details?.phone_is_valid ? "✅ Yes" : "❌ No"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Type: {result.phone_details.provider_carrier_details?.type || "Unknown"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Country: {result.phone_details.provider_carrier_details?.country || "Unknown"}
                </Typography>
              </Box>
            )}

            {/* IP Details */}
            {result.ip_details && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  🌍 IP Analysis
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  IP: {result.ip_details.ip}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Location: {result.ip_details.city},{" "}
                  {result.ip_details.state_prov}, {result.ip_details.country}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ISP: {result.ip_details.isp_name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  VPN: {result.ip_details.vpn ? "⚠️ Detected" : "✅ None"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Proxy:{" "}
                  {result.ip_details.data_center_proxy
                    ? "⚠️ Detected"
                    : "✅ None"}
                </Typography>
              </Box>
            )}

            {/* BIN Details */}
            {result.bin_details && (
              <Box>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  💳 Card BIN Analysis
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Bank: {result.bin_details.bin_bank || "Unknown"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Card: {result.bin_details.bin_card || "Unknown"} {result.bin_details.bin_type || ""}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Country: {result.bin_details.bin_country || "Unknown"}
                </Typography>
              </Box>
            )}

            <Button
              fullWidth
              variant="outlined"
              sx={{ mt: 3 }}
              onClick={() => setResult(null)}
            >
              Test Another Transaction
            </Button>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default SeonPaymentPage;
