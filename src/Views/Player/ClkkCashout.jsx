import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
} from "@mui/material";
import Parse from "parse";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function ClkkCashout() {
  const [searchParams] = useSearchParams();
  const recipientId = searchParams.get("recipient_id"); // ✅ from URL
  const amount = searchParams.get("amount");
  const description = searchParams.get("description");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [cardInfo, setCardInfo] = useState(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  // Step 2: Verify card configuration (via backend cloud function)
  const verifyCard = async () => {
    if (!recipientId) {
      setError("Recipient ID missing in URL");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const result = await Parse.Cloud.run("verifyClkkCard", { recipientId });

      if (result?.configuredCard) {
        setCardInfo(result.configuredCard);
      } else {
        setError("No configured card found. Please complete setup.");
      }
    } catch (err) {
      setError("Failed to verify card: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Push-to-card payment (via backend cloud function)
  const pushToCard = async () => {
    if (!recipientId) {
      setError("Recipient ID missing in URL");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const payment = await Parse.Cloud.run("pushClkkCardPayment", {
        recipientId,
        amount,
        description,
        orderId: `ORDER-${Date.now()}`,
      });

      setStatus(`Payment started`);
      if (payment?.recipient?.cardLast4) {
        setCardInfo({
          last4: payment.recipient.cardLast4,
          brand: payment.recipient.cardBrand,
        });
      }


      setTimeout(() => {
        navigate("/wallet",{ state: { from: "clkk-cashout" } })
      }, 3000);
    } catch (err) {
      setError("Payment failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    verifyCard();
  }, [recipientId]);

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
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            CLKK Cashout
          </Typography>
          {/* <Typography>Recipient ID: {recipientId}</Typography> */}
          <Typography>Amount: ${amount}</Typography>
          {/* <Typography>Description: {description}</Typography> */}

          {loading && <CircularProgress sx={{ mt: 2 }} />}
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          {status && <Alert severity="success" sx={{ mt: 2 }}>{status}</Alert>}

          {cardInfo && (
            <Box sx={{ mt: 2 }}>
              <Typography>
                Card: {cardInfo.brand} ****{cardInfo.last4}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                sx={{ mt: 2 }}
                onClick={pushToCard}
                disabled={loading}
              >
                {loading ? "Processing..." : "Confirm Cashout"}
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
