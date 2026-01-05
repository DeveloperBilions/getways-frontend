import React, { useState } from "react";
import {
  Button,
  Box,
  Typography,
  Alert,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
} from "@mui/material";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Parse } from "parse";
import { useNavigate } from "react-router-dom";
import { SeonIdVerification } from "@seontechnologies/seon-id-verification";

const IdVerificationButton = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [error, setError] = useState(null);

  const IDV_LICENSE_KEY = "350136b7-6874-48a9-b715-9085c3d7a3e1";
  const BASE_URL = "https://idv-us.seon.io"; // US region base URL

  const handleVerifyIdentity = async () => {
    setLoading(true);
    setError(null);
    setVerificationStatus(null);

    try {
      console.log("🆔 Starting ID Verification...");

      const currentUser = Parse.User.current();
      if (!currentUser) {
        throw new Error("User not logged in");
      }

      // Step 1: Create verification session in backend
      const session = await Parse.Cloud.run("createIDVSession", {
        userId: currentUser.id,
        email: currentUser.get("email"),
        name: currentUser.get("username"),
      });

      console.log("✅ Session created:", session.referenceId);

      // Step 2: Setup event handlers
      SeonIdVerification.on("opened", () => {
        console.log("📱 SDK opened");
      });

      SeonIdVerification.on("closed", () => {
        console.log("📱 SDK closed");
        setLoading(false);
      });

      SeonIdVerification.on("started", () => {
        console.log("🎬 Verification flow started");
      });

      SeonIdVerification.on("completed", async (status) => {
        console.log("✅ Verification completed with status:", status);

        try {
          // Step 3: Send result to backend
          const finalResult = await Parse.Cloud.run("completeIDVSession", {
            referenceId: session.referenceId,
            status: status,
          });

          setVerificationStatus(status);

          if (status === "success") {
            setVerificationStatus("success");
          } else if (status === "pending") {
            setVerificationStatus("pending");
          } else {
            setVerificationStatus("failed");
          }
        } catch (err) {
          console.error("❌ Error saving result:", err);
          setError("Verification completed but failed to save result");
        }

        setLoading(false);
      });

      SeonIdVerification.on("cancelled", () => {
        console.log("❌ Verification cancelled by user");
        setError("Verification cancelled");
        setLoading(false);
      });

      SeonIdVerification.on("error", (errorCode) => {
        console.error("❌ Verification error:", errorCode);

        // Handle specific error codes
        if (errorCode === 401 || errorCode === "401") {
          setError(
            "License key not authorized for this domain. Please check SEON dashboard settings."
          );
        } else if (errorCode === "CAMERA_PERMISSION_DENIED") {
          setError("Camera permission denied. Please enable camera access.");
        } else {
          setError(`Verification error: ${errorCode}`);
        }

        setLoading(false);
      });

      // Step 3: Start verification flow with v2.0.0 config
      SeonIdVerification.start({
        baseUrl: BASE_URL,
        licenseKey: IDV_LICENSE_KEY,
        referenceId: session.referenceId,
        type: "id-verification",
        language: "en",
        customerData: {
          email: currentUser.get("email"),
          name: currentUser.get("username"),
          userId: currentUser.id,
        },
        renderingMode: "fullscreen",
      });
    } catch (err) {
      console.error("❌ ID Verification Error:", err);
      setError(err.message || "Failed to start verification");
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', pb: 4 }}>
      {/* Header */}
      <Box
        sx={{
          bgcolor: 'white',
          borderBottom: '1px solid #E7E7E7',
          py: 2,
          px: 3,
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate('/playerDashboard')} size="small">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Identity Verification
          </Typography>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ maxWidth: 800, mx: 'auto', mt: 3 }}>
        <Card sx={{ maxWidth: 600, mx: "auto" }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ textAlign: "center", mb: 4 }}>
              <VerifiedUserIcon sx={{ fontSize: 80, color: "#1976d2", mb: 2 }} />
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
                Identity Verification
              </Typography>
            </Box>

        {!verificationStatus && (
          <Button
            fullWidth
            variant="contained"
            size="large"
            startIcon={
              loading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <CameraAltIcon />
              )
            }
            onClick={handleVerifyIdentity}
            disabled={loading}
            sx={{
              py: 2,
              textTransform: "none",
              fontSize: "18px",
              fontWeight: 600,
            }}
          >
            {loading ? "Opening Camera..." : "Verify My Identity"}
          </Button>
        )}

        {verificationStatus === "success" && (
          <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mt: 2 }}>
            ✅ Identity Verified Successfully!
          </Alert>
        )}

        {verificationStatus === "pending" && (
          <Alert severity="info" sx={{ mt: 2 }}>
            ⏳ Verification Pending - Under Review
          </Alert>
        )}

        {verificationStatus === "failed" && (
          <Alert severity="error" sx={{ mt: 2 }}>
            ❌ Verification Failed - Please Try Again
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default IdVerificationButton;
