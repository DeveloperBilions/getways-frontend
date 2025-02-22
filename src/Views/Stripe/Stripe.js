import React, { useState , useEffect } from "react";
import { dataProvider } from "../../Provider/parseDataProvider";
import { useSearchParams } from "react-router-dom";
import { validatePositiveNumber } from "../../Validators/number.validator";

export const Stripe = () => {
  const [amount, setAmount] = useState("");
  const [paymentLink, setPaymentLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("");
  const [statusVerify, setStatusVerify] = useState(false);

  const handleGenerateLink = async () => {
    setLoading(true);
    setError("");
    setPaymentLink("");

    const validationResponse = validatePositiveNumber(amount);
    if (!validationResponse.isValid) {
      setError(validationResponse.error);
      setLoading(false);
      return;
    }

    try {
      // Call getLink from dataProvider
      const response = await dataProvider.getLink("paymentLink", {
        amount: amount * 100, // $10 in cents
        currency: "usd",
      }).then((response) => {
        const url = response.data.url;
        window.open(url); // Open in a new tab
      }).catch((error) => {
        console.error("Error creating payment link:", error.message);
      });
      
    } catch (err) {
      setError(err.message || "An error occurred while generating the link.");
    } finally {
      setLoading(false);
    }
  };
  const checkTransactionStatus = async (sessionId) => {
    try {
        setStatusVerify(true)
      const { transaction, stripeSession } = await dataProvider.retrieveCheckoutSession(sessionId);
      if (transaction.status === 2) {
        setStatus("Completed Payment")
        console.log("Payment Successful!");
      } else if (transaction.status === 1) {
        setStatus("Pending Payment")
        console.log("Payment Pending...");
      } else {
        console.log("Payment Failed.");
      }
    } catch (error) {
      console.error("Error checking transaction status:", error.message);
    } finally{
        setStatusVerify(false)
    }
  };
  
  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (sessionId) {
      checkTransactionStatus(sessionId);
    }
  }, [searchParams]);
  return (
    <React.Fragment>

        {statusVerify ? "Verifying Your Payment , Don't clsoe the window" : 
        
        <>
             <div>

        <h1>Stripe Payment Link Generator</h1>
        <label htmlFor="amount">Enter Amount (USD):</label>
        <input
          type="number"
          id="amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
        />
        <button onClick={handleGenerateLink} disabled={loading}>
          {loading ? "Generating..." : "Generate Payment Link"}
        </button>
      </div>

      {error && <div style={{ color: "red" }}>{error}</div>}
      {status && <div style={{ color: "green" }}>{status}</div>}

      {paymentLink && (
        <div>
          <h2>Payment Link:</h2>
          <a href={paymentLink} target="_blank" rel="noopener noreferrer">
            {paymentLink}
          </a>
        </div>
      )}
      </>}
    </React.Fragment>
  );
};
