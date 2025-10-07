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
import { updatePotBalance } from "../../Utils/utils";

// Parse init
Parse.initialize(process.env.REACT_APP_APPID, process.env.REACT_APP_MASTER_KEY);
Parse.serverURL = process.env.REACT_APP_URL;

export const CLKKWidget = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { identity } = useGetIdentity();
  const response = location?.state?.response;

  const iframeRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [error, setError] = useState(null);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  const allowedOrigins = [
    "https://pay.clkkapi.io",
    "https://pay-dev.clkkapi.io",
  ];

  const updateTransactionStatus = async (sessionId, status) => {
    try {
      const TransactionRecords = Parse.Object.extend("TransactionRecords");
      const query = new Parse.Query(TransactionRecords);
      query.equalTo("transactionIdFromStripe", sessionId);
      const txn = await query.first({ useMasterKey: true });
      await updatePotBalance(
        identity?.userParentId,
        txn.get("transactionAmount"),
        "recharge"
      );
      if (!txn) {
        console.warn("⚠️ No transaction found for session:", sessionId);
        return;
      }

      txn.set("status", status); // 2: success, 10: fail
      await txn.save(null, { useMasterKey: true });
      console.log("✅ Transaction updated with status:", status);
    } catch (err) {
      console.error("❌ Failed to update transaction:", err);
    }
  };

  const handleMessage = useCallback(
    (event) => {
      if (!allowedOrigins.includes(event.origin)) return;

      const message =
        typeof event.data === "string" ? JSON.parse(event.data) : event.data;

      switch (message?.type) {
        case "CHECKOUT_READY":
          setLoading(false);
          break;

        case "PAYMENT_SUCCESS":
          console.log("✅ PAYMENT SUCCESS", message.data);
          setPaymentStatus({
            status: "success",
            amount: message.data?.amount,
            currency: message.data?.currency,
            description: message.data?.description,
            transactionId: message.data?.transaction?.id,
          });

          setShowSuccessAnimation(true); // Show success animation
          updateTransactionStatus(message.data?.sessionId, 2); // Success

          // Redirect after 3 seconds
          setTimeout(() => {
            navigate("/playerDashboard");
          }, 3000);
          break;

        case "PAYMENT_FAILED":
          console.error("❌ PAYMENT FAILED", message.data);
          setPaymentStatus({
            status: "failed",
            reason: message.data?.reason || "Unknown error",
          });

          updateTransactionStatus(message.data?.sessionId, 10); // Fail
          break;

        case "HEIGHT_CHANGED":
          if (iframeRef.current && message.data?.height) {
            iframeRef.current.height = message.data.height;
          }
          break;
          case "PAYMENT_CANCELLED":
            setPaymentStatus({ status: "cancelled" });
  setTimeout(() => {
    navigate("/playerDashboard");
  }, 1000);
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

  return (
    <Box className="container py-4">
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

      {loading && !showSuccessAnimation && (
        <Box
          display="flex"
          justifyContent={"center"}
          alignItems="center"
          mb={2}
        >
          <CircularProgress size={20} />
          <Typography variant="body2" ml={1}>
            Loading Checkout...
          </Typography>
        </Box>
      )}

      {paymentStatus?.status === "success" && (
        <Box
          display="flex"
          justifyContent={"center"}
          alignItems="center"
          mb={2}
        >
          <Alert severity="success" sx={{ mb: 2 }}>
            Payment succeeded!
          </Alert>
        </Box>
      )}

      {paymentStatus?.status === "failed" && (
        <Box
          display="flex"
          justifyContent={"center"}
          alignItems="center"
          mb={2}
        >
          <Alert severity="error" sx={{ mb: 2 }}>
            Payment failed !
          </Alert>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {showSuccessAnimation ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="300px"
        >
        </Box>
      ) : response?.publicUrl ? (
        <iframe
          ref={iframeRef}
          id="clkk-checkout"
          src={response.publicUrl}
          title="CLKK Checkout"
          width="100%"
          height="600"
          style={{
            border: "1px solid #ccc",
            borderRadius: "8px",
            display: loading ? "none" : "block",
          }}
          allow="payment"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
        />
      ) : (
        <Typography variant="body1" color="text.secondary">
          No payment URL provided.
        </Typography>
      )}
    </Box>
  );
};
