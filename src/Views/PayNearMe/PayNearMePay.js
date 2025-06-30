import React, { useEffect, useRef, useState } from "react";
import Parse from "parse";
import { Box, CircularProgress, Typography,Button } from "@mui/material";
import "./pay.css"
import { useLocation, useNavigate } from "react-router-dom";
import { useGetIdentity } from "react-admin";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function PayNearMePay() {
  const location = useLocation();  
  const { identity } = useGetIdentity();
  const navigate = useNavigate();
  const amount = location?.state?.rechargeAmount;
  const remark = location?.state?.remark;
  const customerId = identity?.objectId;
  const [orderToken, setOrderToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const siteOrderIdentifierRef = useRef("")
  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://www.paynearme-sandbox.com/api/cf/S0234633151/v1/paynearme.js";
    script.async = true;
    script.onload = () => {
      console.log("PayNearMe script loaded");
      setScriptLoaded(true);
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // 2️⃣ Fetch order token and initialize PNM
  useEffect(() => {
    if (!scriptLoaded) return;

    async function fetchOrderToken() {
      setLoading(true);
      try {
        const res = await Parse.Cloud.run("createPNMOrder", {
          customerIdentifier: customerId,
          paymentAmount: amount
        });
        setOrderToken(res.secureSmartToken);
        siteOrderIdentifierRef.current = res.siteOrderIdentifier; // Save to ref

        if (window.PNM) {
          window.PNM.init({
            order_token: res.secureSmartToken,
           // auto_resize: true,
            language: "en",
            header_bkgnd: "#581845",
            header_color: "#ffffff",
            callback: "pnmCallback",
            target: "pnm-iframe-container",
            actions: {
              Deposit: {
                action: "pay",
                payment_amount: amount,
                payment_field_fixed: true,
                debit: true,
                credit: true,
                ach: true,
                paypal: true,
                venmo: true,
                apple_pay: true,
                google_pay: true,
                venmo: true,
                cashapp: true
              }
            }
          });

          // Auto-launch the payment form
          window.PNM.launch("Deposit");
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching order token:", error);
        setLoading(false);
      }
    }

    fetchOrderToken();
  }, [scriptLoaded, amount, customerId]);

  useEffect(() => {
    window.pnmCallback = async function (data) {
      console.log("PNM Callback:", data);

      if (!data.status) {
        console.log("Missing status field");
        return;
      }

      // Save transaction in Parse
      const Transaction = Parse.Object.extend("TransactionRecords");
      const transaction = new Transaction();
      const user = await Parse.User.current()?.fetch();

      transaction.set("type", "recharge");
      transaction.set("gameId", "786");
      transaction.set("username", identity?.username || "");
      transaction.set("userId", identity?.objectId);
      transaction.set("transactionDate", new Date());
      transaction.set("transactionAmount", amount);
      transaction.set("remark", remark);
      transaction.set("useWallet", false);
      transaction.set("userParentId", user?.get("userParentId") || "");
      transaction.set("portal", "PayNearMe");
      transaction.set("walletAddr", identity?.walletAddr || "");
      transaction.set("transactionIdFromStripe", siteOrderIdentifierRef.current);

      if (data.status === "complete") {
        transaction.set("status", 2);
        await transaction.save(null, { useMasterKey: true });
        alert("Payment completed successfully!");
        navigate("/playerDashboard");
      } else if (data.status === "error") {
        transaction.set("status", 10);
        transaction.set("errorMessage", data.message?.join("\n") || "Unknown error");
        await transaction.save(null, { useMasterKey: true });
        alert("Error: " + (data.message?.join("\n") || "Unknown error"));
      } else if (data.status === "exit") {
        // transaction.set("status", 10);
        // await transaction.save(null, { useMasterKey: true });
        alert("User exited payment flow.");
      }
    };
  }, [amount, remark, identity, navigate]);

  return (
    <Box sx={{ width: "100%" }}>
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
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "400px",
            width: "100%"
          }}
        >
          <CircularProgress />
          <Typography variant="body1" sx={{ mt: 2 }}>
            Loading...
          </Typography>
        </Box>
      )}

      <Box
        id="pnm-iframe-container"
        sx={{
          mt: 2,
          width: "100%",
          minHeight: "600px",
          display: loading ? "none" : "block"
        }}
      />
    </Box>
  );
}
