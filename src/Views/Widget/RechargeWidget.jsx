import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Stack,
  Card,
  CardContent,
  Typography,
  IconButton,
  CircularProgress,
  Paper,
  Button,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import WertWidget from "@wert-io/widget-initializer";
import { signSmartContractData } from "@wert-io/widget-sc-signer";
import { generateScInputData } from "../Player/dialog/GenerateInput";
import { Parse } from "parse";
import RedeemGiftCardFlow from "./RedeemGiftCardFlow";
const privateKey =
  "0x2bcb9fc6533713d0705a9f15850a027ec26955d96c22ae02075f3544e6842f74";
Parse.initialize(process.env.REACT_APP_APPID, process.env.REACT_APP_MASTER_KEY);
Parse.serverURL = process.env.REACT_APP_URL;
const RechargeWidgetPopup = ({
  open = true,
  onClose,
  userId,
  walletId,
  remark,
  platform,
  type,
  walletLoading = false,
  onOptionClick,
  price,
  gc_coins,
  sc_coins
}) => {
  const [iframeUrl, setIframeUrl] = useState(null);
  const [showWertWidget, setShowWertWidget] = useState(false);
  const [actionType, setActionType] = useState(type || null); // null | 'recharge' | 'redeem'
  const [loadingMessage, setLoadingMessage] = useState("");
  const [isCoinbaseFlow, setIsCoinbaseFlow] = useState(false);
  const [wertLoading, setWertLoading] = useState(false);
  const [amount, setAmount] = useState(price || 0);
  const [confirmedAmount, setConfirmedAmount] = useState(null);
  const [amountError, setAmountError] = useState("");
  const [currentActionType, setCurrentActionType] = useState(type || null);

  // Finix payment form state
  const [showFinixForm, setShowFinixForm] = useState(false);
  const [finixFormInitialized, setFinixFormInitialized] = useState(false);
  const [finixLoading, setFinixLoading] = useState(false);
  const [finixError, setFinixError] = useState("");
  const [finixSuccess, setFinixSuccess] = useState(false);
  const finixFormRef = useRef(null);

  // Finix config
  const FINIX_APPLICATION_ID = process.env.REACT_APP_FINIX_APPLICATION_ID || "APfoMeGZfdKsWmcmjcLhHjER";
  const FINIX_ENVIRONMENT = process.env.REACT_APP_FINIX_ENVIRONMENT || "sandbox";
  const FINIX_MERCHANT_ID = process.env.REACT_APP_FINIX_MERCHANT_ID || "MUeVMGsieX8Dny8dmVbMHTJ9";

  // Finix fraud detection session
  const [finixFraudSessionId, setFinixFraudSessionId] = useState(null);
  const finixFraudSessionRef = useRef(null);

  // Initialize Finix Auth for fraud detection when Finix form is shown
  useEffect(() => {
    if (showFinixForm && window.Finix && !finixFraudSessionRef.current) {
      try {
        const finixAuth = window.Finix.Auth(FINIX_ENVIRONMENT, FINIX_MERCHANT_ID, (sessionKey) => {
          setFinixFraudSessionId(sessionKey);
          finixFraudSessionRef.current = sessionKey;
        });
        // Fallback: get session key synchronously if callback didn't fire
        setTimeout(() => {
          if (!finixFraudSessionRef.current && finixAuth?.getSessionKey) {
            const key = finixAuth.getSessionKey();
            if (key) {
              setFinixFraudSessionId(key);
              finixFraudSessionRef.current = key;
            }
          }
        }, 1000);
      } catch (err) {
        console.error("Finix Auth init error:", err);
      }
    }
  }, [showFinixForm]);

  // Initialize Finix PaymentForm when showFinixForm becomes true
  // (must be above the early return to satisfy rules-of-hooks)
  useEffect(() => {
    if (showFinixForm && !finixFormInitialized) {
      const timer = setTimeout(() => initializeFinixForm(), 300);
      return () => clearTimeout(timer);
    }
  }, [showFinixForm, finixFormInitialized]);

  if (!open) return null;

  const rechargeAmount = 50;

  const handleOptionClick = async (id) => {
    if (id === "quick-debit") {
      try {
        setLoadingMessage("Preparing URL for you...");
        setIsCoinbaseFlow(true);

        // Open a blank tab immediately

        const partnerUserRef = `${userId}-${Date.now()}`;
        const sessionToken = await fetchCoinbaseSessionToken(
          walletId,
          rechargeAmount,
          partnerUserRef
        );

        if (!sessionToken) {
          alert("Could not generate session token for Coinbase.");
          setLoadingMessage("");
          setIsCoinbaseFlow(false);
          return;
        }

        // ✅ Open window only after token is generated
        const referralUrl = `https://pay.coinbase.com/buy/select-asset?sessionToken=${sessionToken}&defaultAsset=USDC&defaultPaymentMethod=CARD&presetCryptoAmount=${amount}&redirectUrl=${process.env.REACT_APP_REFERRAL_URL}`;

        const newWindow = window.open(referralUrl, "_blank");

        const TransactionDetails = Parse.Object.extend("Transactions");
        const transactionDetails = new TransactionDetails();

        transactionDetails.set("type", "recharge");
        transactionDetails.set("userId", userId);
        transactionDetails.set("transactionDate", new Date());
        transactionDetails.set("transactionAmount", parseFloat(amount));
        transactionDetails.set("status", 1);
        transactionDetails.set("portal", "Coinbase");
        transactionDetails.set("platform", platform);
        transactionDetails.set("referralLink", referralUrl);
        transactionDetails.set("transactionIdFromStripe", partnerUserRef);
        transactionDetails.set("walletAddr", walletId);
        //transactionDetails.set("partnerUserRef",partnerUserRef)
        await transactionDetails.save(null);
        if (
          !newWindow ||
          newWindow.closed ||
          typeof newWindow.closed === "undefined"
        ) {
          alert("Popup was blocked. Please allow popups and try again.");
          setLoadingMessage("");
          setIsCoinbaseFlow(false);
          return;
        }

        setLoadingMessage("Processing your Payments...");

        // ✅ Wait for window to close
        const pollWindowClose = setInterval(() => {
          if (newWindow.closed) {
            clearInterval(pollWindowClose);
            setLoadingMessage("Checking payment status...");
            setTimeout(() => {
              setLoadingMessage("");
              setIsCoinbaseFlow(false);
            }, 3000);
          }
        }, 500);
      } catch (err) {
        alert("Could not initiate Coinbase flow.");
        console.error(err);
        setLoadingMessage("");
        setIsCoinbaseFlow(false);
      }
    } else if (id === "crypto") {
      try {
        const rechargeUrl = `https://crypto.link.com?ref=lb&source_amount=${amount}&source_currency=usd&destination_currency=usdc&destination_network=ethereum`;
        setIframeUrl(rechargeUrl);
      } catch (err) {
        alert("Could not initiate Crypto flow.");
        console.error(err);
      }
    } else if (id === "wert") {
      handleOpenWert(amount);
    } else if(id === "payarc"){
      const checkoutUrl = `/payarc-checkout?amount=${confirmedAmount}&userId=${userId}&gc_coins=${gc_coins}&sc_coins=${sc_coins}`;
      setIframeUrl(checkoutUrl);
    } else if(id === "fiserv-payment"){
      try {
        setLoadingMessage("Creating Fiserv payment link...");
        
        const result = await Parse.Cloud.run("fiservCreatePaymentLink", {
          type:"AOG",
          amount: parseFloat(confirmedAmount),
          remark: remark,
          orderId: `ORDER-${userId}-${Date.now()}`,
          userId,
          gc_coins,
          sc_coins,
          customerInfo: {
            firstName: "",
            lastName: "",
            email: "",
            phone: ""
          },
          expiryHours: 24
        }, { useMasterKey: true });

        setLoadingMessage(""); // Clear loading message

        if (result.success && result.publicUrl) {
          // Load Fiserv payment URL directly in iframe
          setIframeUrl(result.publicUrl);
        } else {
          alert("Failed to create Fiserv payment link");
        }
      } catch (err) {
        alert("Failed to initiate Fiserv payment.");
        console.error(err);
        setLoadingMessage("");
      }
    } else if(id === "fiserv-checkout"){
      try {
        setLoadingMessage("Creating Fiserv checkout...");
        
        const result = await Parse.Cloud.run("fiservCreateCheckout", {
          type:"AOG",
          amount: parseFloat(confirmedAmount),
          remark: remark,
          userId,
          customerInfo: {
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            name: ""
          }
        }, { useMasterKey: true });

        setLoadingMessage(""); // Clear loading message

        if (result.success && result.redirectionUrl) {
          // Redirect to Fiserv checkout page
          window.location.href = result.redirectionUrl;
        } else {
          alert("Failed to create Fiserv checkout session");
        }
      } catch (err) {
        alert("Failed to initiate Fiserv checkout.");
        console.error(err);
        setLoadingMessage("");
      }
    } else if(id === "commerce-hub"){
      try {
        setLoadingMessage("Loading Commerce Hub checkout...");
        
        const result = await Parse.Cloud.run("commerceHubGetCredentials", {
          type: "AOG",
          amount: parseFloat(confirmedAmount),
          remark: remark,
          userId,
          customerInfo: {
            name: "",
            email: ""
          }
        }, { useMasterKey: true });

        setLoadingMessage(""); // Clear loading message

        if (result.success && result.sessionId) {
          // Navigate to Commerce Hub widget with credentials
          const commerceHubUrl = `/commerce-hub-payment?sessionId=${result.sessionId}&accessToken=${encodeURIComponent(result.accessToken)}&amount=${confirmedAmount}&transactionId=${result.transactionId}&merchantId=${result.merchantId}`;
          setIframeUrl(commerceHubUrl);
        } else {
          alert("Failed to initialize Commerce Hub checkout");
        }
      } catch (err) {
        alert("Failed to initiate Commerce Hub checkout.");
        console.error(err);
        setLoadingMessage("");
      }
    } else if(id === "commerce-hub-sdk"){
      // Commerce Hub SDK with Affirm, Paze, and card payment options
      const sdkUrl = `/commerce-hub-sdk?amount=${confirmedAmount}&userId=${userId}&type=AOG&remark=${encodeURIComponent(remark || "Recharge")}`;
      setIframeUrl(sdkUrl);
    } else if(id === "finix-payment"){
      // Show inline Finix tokenization form
      setShowFinixForm(true);
      setFinixError("");
      setFinixFormInitialized(false);
      setFinixSuccess(false);
    } else {
      onOptionClick(id, { userId, walletId, remark });
    }
  };

  const fetchCoinbaseSessionToken = async (
    walletAddr,
    rechargeAmount,
    partnerUserRef
  ) => {
    try {
      const result = await Parse.Cloud.run("generateCoinbaseSessionToken", {
        walletAddr,
        rechargeAmount,
        partnerUserRef,
      });
      return result?.token;
    } catch (err) {
      console.error("Failed to generate Coinbase session token:", err);
      return null;
    }
  };

  const handleOpenWert = async (amount) => {
    try {
      const clickId = `txn-${Date.now()}`;
      const path =
        "0x55d398326f99059ff775485246999027b31979550009c4b32d4817908f001c2a53c15bff8c14d8813109be";
      const recipient = "0xb69b947183c5a4434bb028e295947a3496e12298";
      const amountIn = (parseFloat(amount) * Math.pow(10, 18)).toString();
      const amountOutMinimum = "0";

      const sc_input_data = generateScInputData(
        path,
        recipient,
        amountIn,
        amountOutMinimum
      );

      const signedData = signSmartContractData(
        {
          address: recipient,
          commodity: "USDT",
          commodity_amount: amount,
          network: "bsc",
          sc_address: "0x13f4EA83D0bd40E75C8222255bc855a974568Dd4",
          sc_input_data,
        },
        privateKey
      );

      const wertWidget = new WertWidget({
        ...signedData,
        partner_id: "01JS1S88TZANH9XQGZYHDTE9S5",
        origin: "https://widget.wert.io",
        click_id: clickId,
        redirect_url: process.env.REACT_APP_REFERRAL_URL,
        is_crypto_hidden: true,
        autosize: false,
        width: 320,
        height: 500,
        listeners: {
          "payment-status": async (status) => {
            try {
              const Transaction = Parse.Object.extend("Transactions");
              const query = new Parse.Query(Transaction);
              query.equalTo("transactionIdFromStripe", clickId);
              const existingTxn = await query.first();
  
              const transactionDate = new Date();
              let newStatus = 1; // default to expired
              if (existingTxn) {
                existingTxn.set("status", newStatus);
                existingTxn.set("transactionIdFromStripe", clickId);
                existingTxn.set("transactionDate", transactionDate);
                await existingTxn.save(null);
              } else {
                // Create new record if not found
                const txn = new Transaction();
                txn.set("transactionIdFromStripe", clickId);
                txn.set("status", newStatus);
                txn.set("userId", userId);
                txn.set("type", "recharge");
                txn.set("portal", "Wert");
                txn.set("transactionAmount", parseFloat(amount));
                txn.set("transactionDate", transactionDate);
                txn.set("walletAddr", walletId);
                txn.set("platform", platform);

                await txn.save(null);
              }
                if (status?.status === "success") {
                wertWidget.close();
                onClose();
              }
            } catch (err) {
              console.error("Error handling Wert status:", err.message);
            }
          },
          close: () => {
            onClose();
          },
        }
      });

      const iframeSrc = wertWidget.getEmbedUrl();
      setIframeUrl(iframeSrc);
      setWertLoading(true); // Start Wert-specific loader
      setTimeout(() => {
        setWertLoading(false); // Start Wert-specific loader
      }, 4000);
    } catch (err) {
      alert("Failed to load Wert widget.");
      console.error(err);
    } finally {
    }
  };

  const initializeFinixForm = () => {
    if (finixFormInitialized) return;

    if (!window.Finix) {
      setFinixError("Payment library not loaded. Please refresh the page.");
      return;
    }

    const container = document.getElementById("finix-widget-form-container");
    if (!container) {
      setTimeout(() => { if (!finixFormInitialized) initializeFinixForm(); }, 200);
      return;
    }

    try {
      const form = window.Finix.PaymentForm("finix-widget-form-container", FINIX_ENVIRONMENT, FINIX_APPLICATION_ID, {
        paymentMethods: ["card"],
        showAddress: true,
        showLabels: true,
        labels: {
          cardNumber: "Card Number",
          expirationDate: "Expiration Date",
          securityCode: "CVV",
          postalCode: "Postal Code",
        },
        showPlaceholders: true,
        placeholders: {
          cardNumber: "1234 5678 9012 3456",
          expirationDate: "MM/YY",
          securityCode: "123",
          postalCode: "12345",
        },
        requiredFields: ["cardNumber", "expirationDate", "securityCode", "postalCode"],
        onSubmit: async (error, response) => {
          setFinixError("");
          setFinixLoading(true);

          if (error) {
            setFinixError("Payment tokenization failed. Please check your card details.");
            setFinixLoading(false);
            return;
          }
          if (!response) {
            setFinixError("Failed to process payment. Please check your card details and try again.");
            setFinixLoading(false);
            return;
          }

          const tokenData = response.data || response;
          const token = tokenData.id;
          if (!token) {
            setFinixError("Failed to process payment. Please try again.");
            setFinixLoading(false);
            return;
          }

          // Call processFinixRecharge with AOG type
          try {
            const result = await Parse.Cloud.run("processFinixRecharge", {
              token,
              amount: parseFloat(confirmedAmount),
              username: "",
              remark: remark || "Recharge",
              userId,
              userParentId: "",
              instrumentType: tokenData.instrument_type || "PAYMENT_CARD",
              type: "AOG",
              gc_coins,
              sc_coins,
              fraud_session_id: finixFraudSessionRef.current || null,
            });

            if (result?.success) {
              setShowFinixForm(false);
              setFinixFormInitialized(false);
              setFinixSuccess(true);
            } else {
              setFinixError(result?.message || "Recharge failed. Please try again.");
            }
          } catch (err) {
            console.error("Error processing Finix recharge:", err);
            setFinixError(err.message || "An unexpected error occurred. Please try again.");
          } finally {
            setFinixLoading(false);
          }
        },
      });

      finixFormRef.current = form;
      setFinixFormInitialized(true);
    } catch (error) {
      console.error("Error initializing Finix PaymentForm:", error);
      setFinixError("Failed to initialize payment form. Please refresh and try again.");
    }
  };

  const paymentOptions = [
    // {
    //   id: "quick-debit",
    //   title: "Quick Debit Recharge",
    //   subtext: "No KYC needed",
    //   description: "Instant • Most debit cards supported",
    //   color: "#14B8A6",
    //   hoverColor: "#F6FEFD",
    // },
    // {
    //   id: "wert",
    //   title: "Instant Crypto Recharge",
    //   subtext: "No KYC required",
    //   description: "Visa / Mastercard / Apple Pay",
    //   color: "#3B82F6",
    //   hoverColor: "#EFF6FF",
    // },
    // {
    //   id: "payarc",
    //   title: "Pay By card",
    //   description: "Secure payment",
    //   color: "#FF9900",
    //   hoverColor: "#FFF7E6",
    // },
    {
      id: "fiserv-payment",
      title: "Fiserv Payment",
      description: "Secure payment gateway • No KYC needed",
      color: "#0066CC",
      hoverColor: "#E6F3FF",
    },
    {
      id: "fiserv-checkout",
      title: "Fiserv Checkout",
      description: "Secure checkout • Redirect to payment",
      color: "#0052CC",
      hoverColor: "#E6F2FF",
    },
    {
      id: "commerce-hub",
      title: "Commerce Hub",
      description: "Secure payment • Hosted checkout",
      color: "#FF6B00",
      hoverColor: "#FFF4E6",
    },
    {
      id: "commerce-hub-sdk",
      title: "Commerce Hub SDK",
      description: "Card • Affirm • Paze • 3D Secure",
      color: "#DC2626",
      hoverColor: "#FEE2E2",
    },
    {
      id: "finix-payment",
      title: "Finix Payment",
      description: "Secure card payment • No KYC needed",
      color: "#6366F1",
      hoverColor: "#EEF2FF",
    },
    // {
    //   id: "crypto",
    //   title: "Standard Recharge",
    //   subtext: "KYC Required",
    //   description: "",
    //   color: "#A855F7",
    //   hoverColor: "#FAF5FF",
    // },
  ];
  const getHeaderTitle = () => {
    if (finixSuccess) return "Payment Successful";
    if (showFinixForm) return "Finix Payment";
    if (iframeUrl) return "Complete Recharge";
    if (actionType === "recharge" || actionType === "redeem") {
      return `Enter ${
        actionType === "recharge" ? "Recharge" : "Redeem"
      } Amount`;
    }
    return "Recharge Options";
  };

  return (
    <>
      {/* {open && (
        // <Box
        //   onClick={onClose}
        //   sx={{
        //     position: "fixed",
        //     top: 0,
        //     left: 0,
        //     width: "100vw",
        //     height: "100vh",
        //     bgcolor: "rgba(0, 0, 0, 0.7)",
        //     zIndex: 1399,
        //   }}
        // />
      )} */}

      <Paper
        elevation={4}
        onClick={(e) => e.stopPropagation()} // Prevent backdrop click from closing when clicking inside
        sx={{
          // position: "fixed",
          // top: "50%",
          // left: "50%",
          // transform: "translate(-50%, -50%)",
          width: "100%",
          maxWidth: "100vw",
          minWidth: "280px", // Absolute minimum width for very small screens
          borderRadius: {
            xs: 0, // No border radius on mobile for full screen
            sm: 3, // Border radius on larger screens
          },
          bgcolor: "#fff",
          zIndex: 1400,
          height: "100vh",
          boxShadow: {
            xs: "none", // No shadow on very small screens
            sm: "0 8px 24px rgba(0,0,0,0.15)",
          },
          overflow: "hidden",
          // Custom media query for very small screens
          "@media (max-width: 335px)": {
            minWidth: "100%",
            width: "100vw",
          },
        }}
      >
        <Box
          sx={{
            px: {
              xs: 0.5, // Very small padding on mobile
              sm: 1.5, // Medium padding on tablet
              md: 2, // Full padding on desktop
            },
            py: {
              xs: 0.5, // Very small vertical padding on mobile
              sm: 1.5, // Full vertical padding on larger screens
            },
            borderBottom: "1px solid #eee",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "#F9FAFB",
            minHeight: {
              xs: "40px", // Smaller minimum header height on mobile
              sm: "56px", // Standard header height on larger screens
            },
            // Custom media query for very small screens
            "@media (max-width: 335px)": {
              px: 0.25,
              py: 0.25,
              minHeight: "36px",
            },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              {getHeaderTitle()}
            </Typography>
          </Box>

          {/* <IconButton  onClick={() => {
    setIframeUrl(null);         // ✅ Unload the iframe
    setActionType(null);        // ✅ Reset flow state
    setAmount("");              // ✅ Reset input
    setConfirmedAmount(null);   // ✅ Reset confirmation
    onClose();                  // ✅ Call parent close handler
  }}
  size="small">
    <CloseIcon />
  </IconButton> */}
        </Box>

        <Box sx={{ 
          p: {
            xs: 0.5, // Very small padding on mobile
            sm: 1.5, // Medium padding on tablet
            md: 2, // Full padding on desktop
          },
          maxHeight: iframeUrl ? "calc(100vh - 60px)" : "100vh", 
          overflowY: iframeUrl ? "hidden" : "auto",
          overflowX: "hidden", // Prevent horizontal overflow
          // Custom media query for very small screens
          "@media (max-width: 335px)": {
            p: 0.25,
          },
        }}>
          {!actionType ? (
            <Stack spacing={2} alignItems="center" py={3}>
              <Typography 
                variant="h6"
                sx={{
                  fontSize: {
                    xs: "1rem", // Even smaller on very small screens
                    sm: "1.25rem", // Default h6 size on larger screens
                  },
                  textAlign: "center",
                  px: 1, // Add some padding on sides
                }}
              >
                What would you like to do?
              </Typography>
              <Box sx={{ 
                display: "flex", 
                gap: 2,
                flexDirection: {
                  xs: "column", // Stack vertically on mobile
                  sm: "row", // Side by side on larger screens
                },
                width: "100%",
                maxWidth: "260px",
              }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setActionType("recharge")}
                  sx={{ 
                    flex: 1,
                    minHeight: "44px", // Touch-friendly height
                  }}
                >
                  Recharge
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setActionType("redeem")}
                  sx={{ 
                    flex: 1,
                    minHeight: "44px", // Touch-friendly height
                  }}
                >
                  Redeem
                </Button>
              </Box>
            </Stack>
          ) : (actionType === "recharge" || actionType === "redeem") &&
            !confirmedAmount ? (
            <Stack spacing={2} alignItems="center" py={3}>
              <Typography 
                variant="h6"
                sx={{
                  fontSize: {
                    xs: "1rem", // Even smaller on very small screens
                    sm: "1.25rem", // Default h6 size on larger screens
                  },
                  textAlign: "center",
                  px: 1, // Add some padding on sides
                }}
              >
                Enter {actionType === "recharge" ? "Recharge" : "Redeem"} Amount
              </Typography>

              <input
                type="number"
                value={amount}
                min={1}
                placeholder="Amount (must be > 0)"
                onChange={(e) => {
                  setAmount(e.target.value);
                  setAmountError("");
                }}
                style={{
                  padding: "8px",
                  width: "100%",
                  maxWidth: "260px",
                  minWidth: "180px",
                  fontSize: "14px",
                  border: "1px solid #ccc",
                  borderRadius: "6px",
                  boxSizing: "border-box",
                }}
                disabled={price ?  true : false}
              />

              {amountError && (
                <Typography variant="caption" color="error">
                  {amountError}
                </Typography>
              )}

              <Button
                variant="contained"
                onClick={() => {
                  const num = parseFloat(amount);
                  if (isNaN(num) || num <= 0) {
                    setAmountError("Please enter a valid amount > 0");
                    return;
                  }
                  setConfirmedAmount(num.toFixed(2));
                }}
                sx={{
                  width: "100%",
                  maxWidth: "260px",
                  minHeight: "44px", // Touch-friendly height
                }}
              >
                Proceed
              </Button>
            </Stack>
          ) : actionType === "recharge" ? (
            <>
              {walletLoading || loadingMessage ? (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    py: 4,
                  }}
                >
                  <CircularProgress size={32} sx={{ mb: 2 }} />
                  <Typography variant="body2">
                    {loadingMessage || "Loading..."}
                  </Typography>
                </Box>
              ) : iframeUrl ? (
                <>
                  {wertLoading ? (
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        py: 4,
                      }}
                    >
                      <CircularProgress size={32} sx={{ mb: 2 }} />
                      <Typography variant="body2">
                        Loading Wert Widget...
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ 
                      height: {
                        xs: "calc(100vh - 50px)", // Very small screens - minimal header
                        sm: "calc(100vh - 70px)", // Tablet
                        md: "calc(100vh - 80px)", // Desktop
                      },
                      width: "100%",
                      overflow: "hidden",
                      minHeight: {
                        xs: "400px", // Minimum height for mobile
                        sm: "500px", // Minimum height for tablet
                        md: "600px", // Minimum height for desktop
                      }
                    }}>
                      <iframe
                        src={iframeUrl}
                        width="100%"
                        height="100%"
                        style={{ 
                          border: "none", 
                          borderRadius: 8,
                          display: "block"
                        }}
                        allow="payment"
                        title="Wert Recharge"
                      />
                    </Box>
                  )}
                </>
              ) : finixSuccess ? (
                <Box sx={{ p: 2, textAlign: "center" }}>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" color="success.main" fontWeight={600} mb={1}>
                      Payment Submitted Successfully!
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={2}>
                      Your recharge of ${confirmedAmount} has been submitted and is being processed.
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      You will receive confirmation once the payment is verified (usually within 1-2 minutes).
                    </Typography>
                  </Box>
                  {/* <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                      setFinixSuccess(false);
                      if (onClose) onClose();
                    }}
                    sx={{ minWidth: 120 }}
                  >
                    Continue
                  </Button> */}
                </Box>
              ) : showFinixForm ? (
                <Box sx={{ p: 1 }}>
                  <Typography variant="subtitle2" fontWeight={600} mb={1}>
                    Pay ${confirmedAmount} with Finix
                  </Typography>
                  {finixError && (
                    <Alert severity="error" sx={{ mb: 1, py: 0.5, fontSize: "0.85rem" }}>
                      {finixError}
                    </Alert>
                  )}
                  {finixLoading ? (
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 4 }}>
                      <CircularProgress size={32} sx={{ mb: 2 }} />
                      <Typography variant="body2">Processing payment...</Typography>
                    </Box>
                  ) : (
                    <>
                      <Box
                        id="finix-widget-form-container"
                        sx={{
                          minHeight: "200px",
                          p: 1,
                          border: "1px solid #dee2e6",
                          borderRadius: "4px",
                          mb: 1,
                        }}
                      />
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          setShowFinixForm(false);
                          setFinixFormInitialized(false);
                          setFinixError("");
                        }}
                        sx={{ mt: 1 }}
                      >
                        ← Back to options
                      </Button>
                    </>
                  )}
                </Box>
              ) : (
                <Stack spacing={2}>
                  {paymentOptions.map((option) => (
                    <Card
                      key={option.id}
                      onClick={() => handleOptionClick(option.id)}
                      sx={{
                        borderRadius: 2,
                        border: "1px solid #E2E8F0",
                        boxShadow: "none",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        borderLeft: `4px solid ${option.color}`,
                        "&:hover": {
                          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                          bgcolor: option.hoverColor,
                        },
                      }}
                    >
                      <CardContent>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Box>
                            <Typography sx={{ fontWeight: 500 }}>
                              {option.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {option.description}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 500 }}
                            >
                              {option.subtext}
                            </Typography>
                          </Box>
                          <ChevronRightIcon sx={{ color: "#9CA3AF" }} />
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              )}{" "}
            </>
          ) : actionType === "redeem" ? (
            <>
              {iframeUrl ? (
                <Box sx={{ 
                  height: {
                    xs: "calc(100vh - 50px)", // Very small screens - minimal header
                    sm: "calc(100vh - 70px)", // Tablet
                    md: "calc(100vh - 80px)", // Desktop
                  },
                  width: "100%",
                  overflow: "hidden",
                  minHeight: {
                    xs: "400px", // Minimum height for mobile
                    sm: "500px", // Minimum height for tablet
                    md: "600px", // Minimum height for desktop
                  }
                }}>
                  <iframe
                    src={iframeUrl}
                    width="100%"
                    height="100%"
                    style={{ 
                      border: "none", 
                      borderRadius: 8,
                      display: "block"
                    }}
                    allow="payment"
                    title="Cashout"
                  />
                </Box>
              ) : confirmedAmount ? (
                <Stack spacing={2}>
                  {/* Redeem payment options */}
                  {/* <Card
                    onClick={() => {
                      // Gift Card redeem flow
                      setActionType("redeem-giftcard");
                    }}
                    sx={{
                      borderRadius: 2,
                      border: "1px solid #E2E8F0",
                      boxShadow: "none",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      borderLeft: `4px solid #9C27B0`,
                      "&:hover": {
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                        bgcolor: "#F3E5F5",
                      },
                    }}
                  >
                    <CardContent>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Box>
                          <Typography sx={{ fontWeight: 500 }}>
                            Gift Card
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Redeem to gift card
                          </Typography>
                        </Box>
                        <ChevronRightIcon sx={{ color: "#9CA3AF" }} />
                      </Box>
                    </CardContent>
                  </Card> */}

                  <Card
                    onClick={() => {
                      console.log('PayPal clicked', { confirmedAmount, userId, remark });
                      // Fiserv PayPal redeem flow
                      const fiservUrl = `/fiserv-disbursement?amount=${confirmedAmount}&userId=${userId}&type=AOG&method=paypal&remark=${encodeURIComponent(remark || "Cashout")}`;
                      console.log('Setting iframe URL:', fiservUrl);
                      setIframeUrl(fiservUrl);
                    }}
                    sx={{
                      borderRadius: 2,
                      border: "1px solid #E2E8F0",
                      boxShadow: "none",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      borderLeft: `4px solid #003087`,
                      "&:hover": {
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                        bgcolor: "#E6F2FF",
                      },
                    }}
                  >
                    <CardContent>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Box>
                          <Typography sx={{ fontWeight: 500 }}>
                            PayPal
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Cashout to PayPal account
                          </Typography>
                        </Box>
                        <ChevronRightIcon sx={{ color: "#9CA3AF" }} />
                      </Box>
                    </CardContent>
                  </Card>

                  <Card
                    onClick={() => {
                      console.log('Venmo clicked', { confirmedAmount, userId, remark });
                      // Fiserv Venmo redeem flow
                      const fiservUrl = `/fiserv-disbursement?amount=${confirmedAmount}&userId=${userId}&type=AOG&method=venmo&remark=${encodeURIComponent(remark || "Cashout")}`;
                      console.log('Setting iframe URL:', fiservUrl);
                      setIframeUrl(fiservUrl);
                    }}
                    sx={{
                      borderRadius: 2,
                      border: "1px solid #E2E8F0",
                      boxShadow: "none",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      borderLeft: `4px solid #008CFF`,
                      "&:hover": {
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                        bgcolor: "#E6F7FF",
                      },
                    }}
                  >
                    <CardContent>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Box>
                          <Typography sx={{ fontWeight: 500 }}>
                            Venmo
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Cashout to Venmo account
                          </Typography>
                        </Box>
                        <ChevronRightIcon sx={{ color: "#9CA3AF" }} />
                      </Box>
                    </CardContent>
                  </Card>
                </Stack>
              ) : null}
            </>
          ) : actionType === "redeem-giftcard" ? (
            <RedeemGiftCardFlow
              amount={confirmedAmount}
              platform={platform}
              userId={userId}
              onClose={onClose}
              onBack={() => {
                setActionType("redeem");
                setConfirmedAmount(null);
              }}
            />
          ) : (
            ""
          )}
        </Box>
      </Paper>
    </>
  );
};

export default RechargeWidgetPopup;
