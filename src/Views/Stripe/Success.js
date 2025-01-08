import React, { useState, useEffect } from "react";
import { dataProvider } from "../../Provider/parseDataProvider";
import { useSearchParams } from "react-router-dom";
import "../../Assets/css/Success.css"; // Add styles for the loader

export const Success = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
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
      const { transaction, stripeSession } = await dataProvider.retrieveCheckoutSession(sessionId);

      setDatTransaction(stripeSession)
      setTimestamp(getCurrentTimestamp()); // Set timestamp after fetching transaction
      if (transaction.status === 2) {
        setStatus("Completed Payment");
      } else if (transaction.status === 1) {
        setStatus("Pending Payment"); 
      } else {
        setStatus("Payment Failed");
      }
    } catch (error) {
      setStatus("Error verifying payment.");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (sessionId) {
      checkTransactionStatus(sessionId);
    }
  }, [searchParams]);
  return (
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
  );
};
