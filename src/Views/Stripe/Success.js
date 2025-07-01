import React, { useState, useEffect } from "react";
import { dataProvider } from "../../Provider/parseDataProvider";
import { useNavigate, useSearchParams } from "react-router-dom";
import "../../Assets/css/Success.css"; // Add styles for the loader
import { Box, Button } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
export const Success = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [dataTransaction, setDatTransaction] = useState();
  const [timestamp, setTimestamp] = useState("");

  const getCurrentTimestamp = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0"); // Add leading zero
    const day = String(now.getDate()).padStart(2, "0"); // Add leading zero
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    return `${month}-${day}-${year} ${hours}:${minutes}:${seconds} ${timeZone}`;
  };
  const checkTransactionStatus = async (sessionId) => {
    setLoading(true);
    try {
      const response = await dataProvider.retrieveCheckoutSessionNew(sessionId);
      console.log(response,"stripeSessionstripeSessionstripeSession")

      setDatTransaction(response?.stripeSession)
      setTimestamp(getCurrentTimestamp()); // Set timestamp after fetching transaction
      if (response?.transaction.status === 2) {
        setStatus("Completed Payment");
      } else if (response?.transaction.status === 1) {  
        setStatus("Pending Payment"); 
      } else {
        setStatus("Payment Failed");
      }
    } catch (error) {
      console.log(error,"stripeSessionstripeSessionstripeSession")

      setStatus("Error verifying payment.");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (sessionId) {
      console.log(sessionId,"sessionIdsessionIdsessionId")
      checkTransactionStatus(sessionId);
    }
  }, [searchParams]);
  return (
    <>
    <Box display="flex" justifyContent="start" mb={2} p={4} mt={2}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/playerDashboard")}
        >
          Back
        </Button>
      </Box>
    <div className="success-container">
      {loading ? (
        <div className="loader-container">
          <div className="spinner"></div>
          <p>Verifying Your Payment, Please Wait...</p>
        </div>
      ) : (
        <div
        className={`status-message ${
          status === "Completed Payment" ? "success" : "error"
        }`}
      >
        <div className="message-content">
          <h2>{status}</h2>
          {status === "Completed Payment" ? (
            <div className="success-animation">
              <div className="checkmark-circle">
                <div className="checkmark"></div>
              </div>
              <p>Payment Amount: <strong>${dataTransaction?.amount_total / 100}</strong></p>
            </div>
          ) : (
            <p>Amount: <strong>${dataTransaction?.amount_total / 100}</strong></p>
          )}
           <p className="timestamp">{timestamp} Time</p>
        </div>
      </div>
      )}
    </div>
    </>
  );
};
