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
  walletLoading = false,
  onOptionClick,
}) => {
  const [iframeUrl, setIframeUrl] = useState(null);
  const [showWertWidget, setShowWertWidget] = useState(false);
  const [actionType, setActionType] = useState(null); // null | 'recharge' | 'redeem'
  const [loadingMessage, setLoadingMessage] = useState("");
  const [isCoinbaseFlow, setIsCoinbaseFlow] = useState(false);
  const [wertLoading, setWertLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [confirmedAmount, setConfirmedAmount] = useState(null);
  const [amountError, setAmountError] = useState("");

  if (!open) return null;

  const rechargeAmount = 50;
  const projectId = "64b19e33-9599-4a15-b3de-4728b5e8ead6";

  const handleOptionClick = async (id) => {
    if (id === "quick-debit") {
      try {
        setLoadingMessage("Preparing URL for you...");
        setIsCoinbaseFlow(true);

        // Open a blank tab immediately

        const identity = { walletAddr: walletId };
        const partnerUserRef = `${userId}-${Date.now()}`;
        const sessionToken = await fetchCoinbaseSessionToken(
          "0xb69b947183c5a4434bb028e295947a3496e12298",
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
        const referralUrl = `https://pay.coinbase.com/buy/select-asset?sessionToken=${sessionToken}&defaultAsset=USDC&defaultPaymentMethod=CARD&presetCryptoAmount=${rechargeAmount}&redirectUrl=${process.env.REACT_APP_REFERRAL_URL}`;

        const newWindow = window.open(referralUrl, "_blank");

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
          width: 560,
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
          {!actionType ? (
            <Stack spacing={2} alignItems="center" py={3}>
              <Typography variant="h6">What would you like to do?</Typography>
              <Box sx={{ display: "flex", gap: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setActionType("recharge")}
                >
                  Recharge
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setActionType("redeem")}
                >
                  Redeem
                </Button>
              </Box>
            </Stack>
          ) : (actionType === "recharge" || actionType === "redeem") &&
            !confirmedAmount ? (
            <Stack spacing={2} alignItems="center" py={3}>
              <Button
                variant="text"
                size="small"
                onClick={() => {
                  setAmount("");
                  setConfirmedAmount(null);
                  setActionType(null);
                }}
              >
                ← Back
              </Button>

              <Typography variant="h6">
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
                  padding: "10px",
                  width: "200px",
                  fontSize: "14px",
                  border: "1px solid #ccc",
                  borderRadius: "6px",
                }}
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
                  <Box sx={{ mb: 2 }}>
                    <Button
                      onClick={() => setIframeUrl(null)}
                      variant="outlined"
                      size="small"
                      fullWidth
                    >
                      ← Back to Recharge Options
                    </Button>
                  </Box>

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
                    <Box sx={{ height: "100vh" }}>
                      <iframe
                        src={iframeUrl}
                        width="100%"
                        height="100%"
                        style={{ border: "none", borderRadius: 8 }}
                        allow="payment"
                        title="Wert Recharge"
                      />
                    </Box>
                  )}
                </>
              ) : (
                <Stack spacing={2}>
                  <Button
                    variant="text"
                    size="small"
                    onClick={() => {
                      setConfirmedAmount("")
                      setAmount("");
                      setActionType(null);
                    }}
                  >
                    ← Back
                  </Button>
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
            <RedeemGiftCardFlow
              amount={50}
              onClose
              onBack={() => {
                setAmount(null)
                setConfirmedAmount(null)
                setActionType(null)}}
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
