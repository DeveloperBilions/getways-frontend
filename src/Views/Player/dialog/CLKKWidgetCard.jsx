import React, { useCallback, useEffect, useState, useRef } from "react";
import { Parse } from "parse";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useGetIdentity } from "react-admin";

Parse.initialize(process.env.REACT_APP_APPID, process.env.REACT_APP_MASTER_KEY);
Parse.serverURL = process.env.REACT_APP_URL;
export const CLKKWidgetCard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const response = location?.state?.response;
  const iframeRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [iframeVisible, setIframeVisible] = useState(true);

  const allowedOrigins = [
    "https://pay.clkkapi.io",
    "https://pay-dev.clkkapi.io",
  ];

  const handleMessage = useCallback(
    (event) => {
      if (!allowedOrigins.includes(event.origin)) return;

      const message =
        typeof event.data === "string" ? JSON.parse(event.data) : event.data;

      switch (message?.type) {
        case "PUSH_TO_CARD_READY":
          setLoading(false);
          break;

        case "PUSH_TO_CARD_SUCCESS":
          console.log("✅ PAYMENT SUCCESS", message);
          setIframeVisible(false); // ✅ hide iframe
          setLoading(false);
            navigate(`/clkk-cashout?amount=${location?.state?.amount}&description=${location?.state?.description}&recipient_id=${location?.state?.recipientId}`)
          break;

        case "PAYMENT_FAILED":
          console.error("❌ PAYMENT FAILED", message.data);

          break;

        case "HEIGHT_CHANGED":
          if (iframeRef.current && message.data?.height) {
            iframeRef.current.height = message.data.height;
          }
          break;

        case "ERROR":
          console.error("📛 Checkout error:", message.data);
          setError("Checkout error occurred. Please try again.");
          break;

        default:
          console.warn("⚠️ Unknown event type received:", message?.type);
          break;
      }
    },
    [navigate]
  );

  useEffect(() => {
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [handleMessage]);
  console.log(response,"responseresponseresponse")
  return (
    <Box
      className="container py-4"
      style={{ minHeight: "100vh", gap: 2, bgcolor: "black", color: "white" }}
      bgcolor="black"
    >
      <Box display="flex" justifyContent="start" mb={2}>
        {/* <Button
          variant="outlined"
          size="small"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/playerDashboard")}
        >
          Back
        </Button> */}
      </Box>

      {loading && (
        <Box
          display="flex"
          justifyContent={"center"}
          alignItems="center"
          mb={2}
          bgcolor="black"
        >
          <CircularProgress size={20} />
          <Typography variant="body2" ml={1}>
            Loading Checkout...
          </Typography>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <iframe
        ref={iframeRef}
        id="clkk-checkout"
        src={response.publicUrl}
        title="CLKK Checkout"
        width="100%"
        height="600"
        allow="payment"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
      />
    </Box>
  );
};
