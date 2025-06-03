import React, { useState } from "react";
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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import WertWidget from "@wert-io/widget-initializer";
import { signSmartContractData } from "@wert-io/widget-sc-signer";
import { generateScInputData } from "../Player/dialog/GenerateInput";
import { Parse } from "parse";
const privateKey =
  "0x2bcb9fc6533713d0705a9f15850a027ec26955d96c22ae02075f3544e6842f74";
Parse.initialize(process.env.REACT_APP_APPID, process.env.REACT_APP_MASTER_KEY);
Parse.serverURL = process.env.REACT_APP_URL;
const RechargeWidgetPopup = ({
  open,
  onClose,
  userId,
  walletId,
  remark,
  walletLoading = false,
  onOptionClick,
}) => {
  const [iframeUrl, setIframeUrl] = useState(null);

  const [loadingMessage, setLoadingMessage] = useState("");
  const [isCoinbaseFlow, setIsCoinbaseFlow] = useState(false);

  if (!open) return null;

  const rechargeAmount = 50;
  const projectId = "64b19e33-9599-4a15-b3de-4728b5e8ead6";

  const handleOptionClick = async (id) => {
    if (id === "quick-debit") {
      try {
        setLoadingMessage("Generating session token...");
        setIsCoinbaseFlow(true);

        // Open a blank tab immediately
        const newWindow = window.open("about:blank", "_blank");

        const identity = { walletAddr: walletId };
        const partnerUserRef = `${userId}-${Date.now()}`;

        const sessionToken = await fetchCoinbaseSessionToken(
          "0xb69b947183c5a4434bb028e295947a3496e12298",
          rechargeAmount,
          partnerUserRef
        );

        if (!sessionToken) {
          alert("Could not generate session token for Coinbase.");
          newWindow?.close();
          setLoadingMessage("");
          setIsCoinbaseFlow(false);
          return;
        }

        const referralUrl = `https://pay.coinbase.com/buy/select-asset?sessionToken=${sessionToken}&defaultAsset=USDC&defaultPaymentMethod=CARD&presetCryptoAmount=${rechargeAmount}&redirectUrl=${process.env.REACT_APP_REFERRAL_URL}`;

        // Navigate the blank window to the referral URL
        newWindow.location.href = referralUrl;
        setLoadingMessage("Processing your Payments...");

        // Wait for the window to close
        const pollWindowClose = setInterval(() => {
          if (newWindow.closed) {
            clearInterval(pollWindowClose);
            setLoadingMessage("Checking payment status...");
            // Simulate checking logic or call a Parse function if needed
            setTimeout(() => {
              setLoadingMessage("");
              setIsCoinbaseFlow(false);
            }, 3000); // Simulated delay
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
        const rechargeUrl = `https://crypto.link.com?ref=lb&source_amount=${rechargeAmount}&source_currency=usd&destination_currency=usdc&destination_network=ethereum`;
        setIframeUrl(rechargeUrl);
      } catch (err) {
        alert("Could not initiate Crypto flow.");
        console.error(err);
      }
    } else if (id === "wert") {
      handleOpenWert(50);
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
    if (!amount || isNaN(amount)) {
      alert("Please enter a valid amount.");
      return;
    }

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
        sc_input_data: sc_input_data,
      },
      privateKey
    );
    const wertWidget = new WertWidget({
      ...signedData,
      partner_id: "01JS1S88TZANH9XQGZYHDTE9S5",
      origin: "https://widget.wert.io",
      click_id: clickId,
      redirect_url: process.env.REACT_APP_REFERRAL_URL,
      currency: "USD",
      is_crypto_hidden: true,
      listeners: {
        "payment-status": async (status) => {
          console.log("Wert Payment Status:", status);
        },
        close: () => {
          onClose();
        },
      },
    });

    wertWidget.open();
  };
  const paymentOptions = [
    {
      id: "quick-debit",
      title: "Quick Debit Recharge",
      subtext: "No KYC needed",
      description: "Instant • Most debit cards supported",
      color: "#14B8A6",
      hoverColor: "#F6FEFD",
    },
    {
      id: "wert",
      title: "Instant Crypto Recharge",
      subtext: "No KYC required",
      description: "Visa / Mastercard / Apple Pay",
      color: "#3B82F6",
      hoverColor: "#EFF6FF",
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

  return (
    <>
      {open && (
        <Box
          onClick={onClose}
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            bgcolor: "rgba(0, 0, 0, 0.5)",
            zIndex: 1399,
          }}
        />
      )}

      <Paper
        elevation={4}
        onClick={(e) => e.stopPropagation()} // Prevent backdrop click from closing when clicking inside
        sx={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 360,
          maxWidth: "90%",
          borderRadius: 3,
          bgcolor: "#fff",
          zIndex: 1400,
          boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            px: 2,
            py: 1.5,
            borderBottom: "1px solid #eee",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "#F9FAFB",
          }}
        >
          <Typography variant="subtitle1" fontWeight={600}>
            {iframeUrl ? "Complete Recharge" : "Recharge Options"}
          </Typography>
          <IconButton
            onClick={iframeUrl ? () => setIframeUrl(null) : onClose}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <Box sx={{ p: 2, maxHeight: "460px", overflowY: "auto" }}>
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
              <Box sx={{ mb: 1 }}>
                <Button
                  onClick={() => setIframeUrl(null)}
                  fullWidth
                  size="small"
                  variant="outlined"
                >
                  ← Back to Options
                </Button>
              </Box>
              <Box sx={{ height: 400 }}>
                <iframe
                  src={iframeUrl}
                  title="Recharge Payment"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  allow="payment"
                />
              </Box>
            </>
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
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {option.subtext}
                        </Typography>
                      </Box>
                      <ChevronRightIcon sx={{ color: "#9CA3AF" }} />
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          )}
        </Box>
      </Paper>
    </>
  );
};

export default RechargeWidgetPopup;
