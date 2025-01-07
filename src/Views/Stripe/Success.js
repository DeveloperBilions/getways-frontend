import React, { useState, useEffect } from "react";
import { dataProvider } from "../../Provider/parseDataProvider";
import { useSearchParams } from "react-router-dom";
import "../../Assets/css/Success.css"; // Add styles for the loader

export const Success = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [dataTransaction, setDatTransaction] = useState();
  const checkTransactionStatus = async (sessionId) => {
    setLoading(true);
    try {
      const { transaction, stripeSession } = await dataProvider.retrieveCheckoutSession(sessionId);

      setDatTransaction(stripeSession)
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
          {status} , Amount : ${dataTransaction?.amount_total / 100}
        </div>
      )}
    </div>
  );
};
