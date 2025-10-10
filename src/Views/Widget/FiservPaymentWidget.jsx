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

// Parse init
Parse.initialize(process.env.REACT_APP_APPID, process.env.REACT_APP_MASTER_KEY);
Parse.serverURL = process.env.REACT_APP_URL;

const FiservPaymentWidget = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { identity } = useGetIdentity();
  const response = location?.state?.response;

  const iframeRef = useRef(null);
  const [loading, setLoading] = useState(false); 
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [error, setError] = useState(null);
  const [showIframe, setShowIframe] = useState(true);

  // Get recharge amount and remark from navigation state
  const { rechargeAmount, remark } = location.state || {};

  useEffect(() => {
    if (!rechargeAmount && !response) {
      navigate("/recharge");
    }
  }, [rechargeAmount, response, navigate]);

  const allowedOrigins = [
    "https://prod.emea.api.fiservapps.com",
    "https://www.checkout-lane.com", // Fiserv checkout domain
    "https://checkout-lane.com",
    "https://sandbox.checkout-lane.com",
    "https://api.fiservapps.com"
  ];

  const updateTransactionStatus = async (paymentLinkId, status) => {
    try {
      const TransactionRecords = Parse.Object.extend("TransactionRecords");
      const query = new Parse.Query(TransactionRecords);
      query.equalTo("transactionIdFromStripe", paymentLinkId);
      const txn = await query.first({ useMasterKey: true });
      
      if (!txn) {
        console.warn("⚠️ No transaction found for payment link:", paymentLinkId);
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
      if (!allowedOrigins.some(origin => event.origin.includes(origin))) return;

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
            transactionId: message.data?.transactionId,
          });

          updateTransactionStatus(message.data?.paymentLinkId, 2); // Success
          navigate("/playerDashboard");
          break;

        case "PAYMENT_FAILED":
          console.error("❌ PAYMENT FAILED", message.data);
          setShowIframe(false);
          setPaymentStatus({
            status: "failed",
            reason: message.data?.reason || "Unknown error",
          });

          updateTransactionStatus(message.data?.paymentLinkId, 10);
          setTimeout(() => navigate("/playerDashboard"), 1500);
          break;

        case "PAYMENT_CANCELLED":
          setPaymentStatus({ status: "cancelled" });
          setTimeout(() => {
            navigate("/playerDashboard");
          }, 1000);
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
    [navigate, identity]
  );

  // Simple status checking function
  const checkStatus = async () => {
    try {
      const result = await Parse.Cloud.run("fiservGetPaymentLinkDetails", {
        paymentLinkId: response?.paymentLink?.paymentLinkId
      });

      if (result.success && result.paymentLinkDetails) {
        const details = result.paymentLinkDetails;
        const transactionStatus = details.transactionStatus;
        const ipgStatus = details.ipgTransactionDetails?.transactionStatus;

        if (transactionStatus === "APPROVED" && ipgStatus === "APPROVED") {
          setPaymentStatus({ status: "success" });
          navigate("/playerDashboard");
        } else if (["FAILED", "DECLINED", "FRAUD"].includes(transactionStatus) || 
                   ["FAILED", "DECLINED", "FRAUD"].includes(ipgStatus)) {
          setPaymentStatus({ status: "failed" });
          setShowIframe(false);
          setTimeout(() => navigate("/playerDashboard"), 2000);
        }
      }
    } catch (error) {
      console.error("Status check error:", error);
    }
  };

  useEffect(() => {
    window.addEventListener("message", handleMessage);
    
    // Start simple polling after iframe loads
    if (response?.paymentLink?.paymentLinkId) {
      const interval = setInterval(checkStatus, 5000); // Check every 5 seconds
      
      // Stop after 10 minutes
      setTimeout(() => clearInterval(interval), 600000);
      
      return () => {
        clearInterval(interval);
        window.removeEventListener("message", handleMessage);
      };
    }
    
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [handleMessage, response]);

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

      {loading && (
        <Box
          display="flex"
          justifyContent={"center"}
          alignItems="center"
          mb={2}
        >
          <CircularProgress size={20} />
          <Typography variant="body2" ml={1}>
            Loading Fiserv Checkout...
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
            Payment failed!
          </Alert>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {showIframe && response?.publicUrl ? (
        <iframe
          ref={iframeRef}
          id="fiserv-checkout"
          src={response.publicUrl}
          title="Fiserv Checkout"
          width="100%"
          height="600"
          style={{
            border: "1px solid #ccc",
            borderRadius: "8px",
            display: loading ? "none" : "block",
          }}
          allow="payment *; microphone *; camera *; geolocation *; autoplay *"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation allow-top-navigation-by-user-activation"
          frameBorder="0"
          allowFullScreen
        />
      ) : showIframe && (
        <Typography variant="body1" color="text.secondary">
          No payment URL provided.
        </Typography>
      )}
    </Box>
  );
};

export default FiservPaymentWidget;
