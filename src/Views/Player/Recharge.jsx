import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Button,
  TextField,
  FormControlLabel,
  Radio,
  RadioGroup,
  CardContent,
  Card,
  Stack,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import WalletIcon from "../../Assets/icons/WalletIcon.svg";
import AOG_Symbol from "../../Assets/icons/AOGsymbol.png";
import Docs from "../../Assets/icons/Docs.svg";
import TransactionRecords from "./TransactionRecords";
import { useGetIdentity, useRefresh } from "react-admin";
import { Parse } from "parse";
import Star from "../../Assets/icons/Star.svg";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import RechargeDialog from "./dialog/RechargeDialog";
import SubmitKYCDialog from "./dialog/SubmitKYCDialog";
import { Alert } from "@mui/material"; // Make sure this is imported
import { checkActiveRechargeLimit, isPayarcAllowed, isRechargeEnabledForAgent } from "../../Utils/utils";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import DialogContentText from "@mui/material/DialogContentText";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import Tooltip from "@mui/material/Tooltip";
import Snackbar from "@mui/material/Snackbar";
import CreditCardIcon from "@mui/icons-material/CreditCard";

import { BsFillCreditCard2FrontFill } from "react-icons/bs";
import { initOnRamp } from "@coinbase/cbpay-js";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import quickRecharge from "../../Assets/icons/quickRecharge.svg";
import instantRecharge from "../../Assets/icons/instantRecharge.svg";
import cryptoRecharge from "../../Assets/icons/cryptoRecharge.svg";
// import bankTransfer from "../../Assets/icons/bankTransfer.svg";
import mastercard from "../../Assets/icons/mastercard.svg";
import visa from "../../Assets/icons/visa.svg";
import venmo from "../../Assets/icons/venmo.svg";
import payPal from "../../Assets/icons/logo_paypal.svg";
import Chime from "../../Assets/icons/Chime.svg";
import Logo1 from "../../Assets/icons/Logo1.svg";
import Gpay from "../../Assets/icons/google-pay.png";
import applep from "../../Assets/icons/apple-pay.png";
import { isPaymentMethodAllowed } from "../../Utils/paymentAccess";
import { CircularProgress } from "@mui/material";
import PayArcHostedFields from "./PayArcHostedFields";
import { useNavigate } from "react-router-dom";
//const projectId = "5df50487-d8a7-4d6f-8a0c-714d18a559ed";
//Live
// const projectId = "9535b482-f3b2-4716-98e0-ad0ec3fe249e";

const projectId = "64b19e33-9599-4a15-b3de-4728b5e8ead6";

///New Live
// const projectId = "981aec85-7141-44af-929c-51c2954b6c64";
Parse.initialize(process.env.REACT_APP_APPID, process.env.REACT_APP_MASTER_KEY);
Parse.serverURL = process.env.REACT_APP_URL;

const Recharge = ({ data, totalData, handleRechargeRefresh,RechargeLimitOfAgent }) => {
  const [rechargeAmount, setRechargeAmount] = useState(50);
  const { identity } = useGetIdentity();
  const refresh = useRefresh();
  const navigate = useNavigate();
  const [RechargeDialogOpen, setRechargeDialogOpen] = useState(false);
  const [remark, setRemark] = useState("");
  const [paymentSource, setPaymentSource] = useState("stripe");
  const [processingCryptoRecharge, setProcessingCryptoRecharge] =
    useState(false);
  const [isTransactionNoteVisible, setIsTransactionNoteVisible] =
    useState(false);
  const [submitKycDialogOpen, setSubmitKycDialogOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [displayMethod, setDisplayMethod] = useState("Payment Portal");
  const [showKycSuccessMsg, setShowKycSuccessMsg] = useState(false); // ✅ new
  const [rechargeDisabled, setRechargeDisabled] = useState(false);
  const [rechargeLinkDialogOpen, setRechargeLinkDialogOpen] = useState(false);
  const [copyTooltipOpen, setCopyTooltipOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletCopied, setWalletCopied] = useState(false); // Add this at the top with other states
  const [popupBlocked, setPopupBlocked] = useState(false);
  const [popupDialogOpen, setPopupDialogOpen] = useState(false);
  const [storedBuyUrl, setStoredBuyUrl] = useState("");
  const [showSafariHelp, setShowSafariHelp] = useState(false);
  const [loadingSessionToken, setLoadingSessionToken] = useState(false);
  const [showCoinbase, setShowCoinbase] = useState(false);
  const [showWert, setShowWert] = useState(false);
  const [showLink, setShowLink] = useState(false);
  const [showPayarc, setshowPayarc] = useState(false);
  const [showStripe, setshowStripe] = useState(false)
  const [payarcLimit,setPayArcLimit] = useState(false)
  const [rechargeMethodLoading, setRechargeMethodLoading] = useState(false);
  const [rechargeError, setRechargeError] = useState("");
  const [checkingRechargeLimit, setCheckingRechargeLimit] = useState(false);

  useEffect(() => {
    const checkPayarcLimit = async () => {
      try {
        const result = await isPayarcAllowed();
        setPayArcLimit(result.allowed);
      } catch (err) {
        console.error("Payarc limit check failed:", err);
        setPayArcLimit(false);
      }
    };
  
    checkPayarcLimit();
  }, []);
  
  useEffect(() => {
    const checkRechargeAccess = async () => {
      const disabled = !(await isRechargeEnabledForAgent(
        identity?.userParentId
      ));
      setRechargeDisabled(disabled);
    };

    if (identity?.userParentId) {
      checkRechargeAccess();
      //handlecheck();
    }
  }, [identity]);
  const handlePaymentMethodChange = (event) => {
    setPaymentSource(event.target.value);
    // Update the header display based on selected payment method
    if (event.target.value === "wallet") {
      setDisplayMethod("Wallet");
    } else if (event.target.value === "stripe") {
      setDisplayMethod("Payment Portal");
    }
  };
  const handleCopy = () => {
    if (identity?.walletAddr) {
      navigator.clipboard.writeText(identity.walletAddr).then(() => {
        setWalletCopied(true); // Mark as copied
        setSnackbarOpen(true); // Show success message
      });
    }
  };

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  const handleRefresh = async () => {
    handleRechargeRefresh();
    refresh();
    resetFields();
  };
  useEffect(() => {
    const checkAccess = async () => {
      const parentId = identity?.userParentId;
      if (!parentId) return;

      setRechargeMethodLoading(true); // loader while checking
      const isCoinbaseAllowed = await isPaymentMethodAllowed(
        parentId,
        "coinbase"
      );
      const isWertAllowed = await isPaymentMethodAllowed(parentId, "wert");
      const isLinkAllowed = await isPaymentMethodAllowed(parentId, "link");
      const isPayarcAllowed = await isPaymentMethodAllowed(parentId, "payarc");
      const isStripeAllowed = await isPaymentMethodAllowed(parentId, "stripe");

      setShowCoinbase(isCoinbaseAllowed);
      setShowWert(isWertAllowed);
      setShowLink(isLinkAllowed);
      setshowPayarc(isPayarcAllowed)
      setshowStripe(isStripeAllowed)

      setRechargeMethodLoading(false);
    };

    if (identity?.userParentId) {
      checkAccess();
    }
  }, [identity]);
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     handlecheck();
  //   }, 30000); // 1 minute = 60000ms

  //   return () => clearInterval(interval); // Cleanup on unmount
  // }, []);

  // const handlecheck = async () => {
  //   try {
  //     const TransfiUserInfo = Parse.Object.extend("TransfiUserInfo");
  //     const query = new Parse.Query(TransfiUserInfo);
  //     query.equalTo("userId", identity?.objectId);
  //     const result = await query.first({ useMasterKey: true });

  //     const kycStatus = result?.get("kycStatus")?.trim().toLowerCase();
  //     const wasJustCompleted = localStorage.getItem("kycCompletedOnce");

  //     if (kycStatus === "kyc_success") {
  //       let currentCount = parseInt(
  //         localStorage.getItem("kycRechargeCount") || "0",
  //         10
  //       );
  //       console.log(currentCount, "currentCountcurrentCount");
  //       // If just completed, reset count to 0 if not already set
  //       if (wasJustCompleted?.trim() === "true") {
  //         if (isNaN(currentCount)) {
  //           localStorage.setItem("kycRechargeCount", "0");
  //           currentCount = 0;
  //         }
  //         localStorage.removeItem("kycCompletedOnce");
  //       }

  //       // Show KYC message only if count is less than 10
  //       if (currentCount < 10) {
  //         setShowKycSuccessMsg(true);
  //       } else {
  //         setShowKycSuccessMsg(false);
  //       }
  //     }
  //   } catch (err) {
  //     console.error("Error checking KYC after refresh:", err);
  //   }
  // };

  const resetFields = () => {
    setRechargeAmount(50);
    setRemark("");
    setPaymentSource("strike");
    // setErrorMessage(""); // Reset error message
  };

  const handleRechargeClick = async () => {
    if (identity?.isBlackListed) return;

    // try {
    //   const TransfiUserInfo = Parse.Object.extend("TransfiUserInfo");
    //   const query = new Parse.Query(TransfiUserInfo);
    //   query.equalTo("userId", identity.objectId);
    //   const record = await query.first({ useMasterKey: true });

    //   if (record && record.get("kycVerified") === true) {
    setRechargeDialogOpen(true);
    //   } else {
    //     setSubmitKycDialogOpen(true);
    //   }
    // } catch (error) {
    //   console.error("Error checking KYC:", error);
    //   setSubmitKycDialogOpen(true);
    // }
  };
  const rechargeUrl = `https://crypto.link.com?ref=lb&source_amount=${rechargeAmount}&source_currency=usd&destination_currency=usdc&destination_network=ethereum`;
  const debounce = (func, delay = 3000) => {
    let inDebounce;
    return (...args) => {
      if (inDebounce) return;
      inDebounce = setTimeout(() => (inDebounce = null), delay);
      func(...args);
    };
  };

  const handleCoinbaseOnramp = async () => {
    try {
      if (!identity?.walletAddr) {
        setWalletLoading(true);
        const walletResp = await Parse.Cloud.run(
          "assignRandomWalletAddrIfMissing",
          {
            userId: identity?.objectId,
          }
        );

        if (walletResp?.walletAddr) {
          identity.walletAddr = walletResp.walletAddr;
          setSnackbarOpen(true);
        } else {
          alert("Failed to assign wallet address.");
          return;
        }
      }

      const sessionToken = await fetchCoinbaseSessionToken(
        identity.walletAddr,
        rechargeAmount
      );
      if (!sessionToken) {
        alert("Could not generate session token for Coinbase.");
        return;
      }

      let savedTransaction = null;

      const options = {
        sessionToken,
        experienceLoggedIn: "popup",
        experienceLoggedOut: "popup",
        onSuccess: async () => {
          console.log("✅ Coinbase payment completed.");
          if (savedTransaction) {
            savedTransaction.set("status", 2);
            await savedTransaction.save(null, { useMasterKey: true });
          }
        },
        onExit: async () => {
          console.log("❌ User exited the Coinbase widget.");
          if (savedTransaction) {
            savedTransaction.set("status", 10);
            await savedTransaction.save(null, { useMasterKey: true });
          }
        },
        onEvent: (event) => {
          console.log("📦 Coinbase event received:", event);
        },
      };

      const instance = await initOnRamp(options);
      instance.open();

      // Save transaction as PENDING
      const TransactionDetails = Parse.Object.extend("TransactionRecords");
      const transactionDetails = new TransactionDetails();
      const user = await Parse.User.current()?.fetch();

      transactionDetails.set("type", "recharge");
      transactionDetails.set("gameId", "786");
      transactionDetails.set("username", identity?.username || "");
      transactionDetails.set("userId", identity?.objectId);
      transactionDetails.set("transactionDate", new Date());
      transactionDetails.set("transactionAmount", rechargeAmount);
      transactionDetails.set("remark", remark);
      transactionDetails.set("useWallet", false);
      transactionDetails.set("userParentId", user?.get("userParentId") || "");
      transactionDetails.set("status", 1); // pending
      transactionDetails.set("portal", "Coinbase");
      transactionDetails.set("referralLink", "Coinbase Widget");
      transactionDetails.set("walletAddr", identity?.walletAddr);

      savedTransaction = await transactionDetails.save(null, {
        useMasterKey: true,
      });
    } catch (error) {
      console.error("Coinbase Onramp Error:", error);
      alert("Something went wrong with Coinbase Recharge.");
    } finally {
      setWalletLoading(false);
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
  const [hoveredOption, setHoveredOption] = useState(null);
  const paymentOptions = [
    {
      id: "stripe",
      title: "Pay By Stripe",
      description: "Secure payment • No KYC needed",
      icon: <CreditCardIcon sx={{ color: "#32325D", fontSize: 24 }} />,
      color: "#32325D",         // Stripe brand dark blue
      hoverColor: "#F5F7FA",    // Soft grey tint            
      paymentIcons: [Logo1, visa, mastercard],
      onClick: debounce(async () => {
        try {
          setCheckingRechargeLimit(true);
    
          // Validate minimum recharge
          if (rechargeAmount < RechargeLimitOfAgent) {
            setRechargeError(`Minimum recharge amount must be greater than ${RechargeLimitOfAgent}`);
            return;
          }
    
          // Check limit
          const transactionCheck = await checkActiveRechargeLimit(
            identity?.userParentId,
            rechargeAmount
          );
    
          if (!transactionCheck.success) {
            setRechargeError(transactionCheck.message || "Recharge Limit Reached");
            return;
          }
    
          setRechargeError(""); // Clear old errors
    
          // Everything good → navigate with rechargeAmount
          navigate("/stripe-payment", {
            state: { rechargeAmount , remark}
          });
        } catch (err) {
          console.error("Stripe error:", err);
          alert("Something went wrong with Stripe Recharge.");
        } finally {
          setCheckingRechargeLimit(false);
        }
      }),
      disabled: identity?.isBlackListed || rechargeDisabled || checkingRechargeLimit
    }
    ,
    payarcLimit && {
      id: "payarc",
      title: "Pay By card",
      description: "Secure payment • No KYC needed",
      icon: <BsFillCreditCard2FrontFill size={24} />,
      color: "#FF9900",
      hoverColor: "#FFF7E6",
      paymentIcons: [visa, mastercard],
      onClick: debounce(async () => {
        navigate("/payment-checkout",{state:{rechargeAmount:rechargeAmount}})
        // try {
        //   setCheckingRechargeLimit(true);
    
        //   if (rechargeAmount < RechargeLimitOfAgent) {
        //     setRechargeError(`Minimum recharge amount must be greater than ${RechargeLimitOfAgent}`);
        //     return;
        //   }
    
        //   const transactionCheck = await checkActiveRechargeLimit(identity?.userParentId, rechargeAmount);
        //   if (!transactionCheck.success) {
        //     setRechargeError(transactionCheck.message || "Recharge Limit Reached");
        //     return;
        //   }
    
        //   setRechargeError("");
    
        //   const payarcResponse = await Parse.Cloud.run("createPayarcOrder", {
        //     amount: rechargeAmount * 100, // assuming Payarc expects cents
        //     surcharge_percent: 0
        //   });
    
        //   const TransactionDetails = Parse.Object.extend("TransactionRecords");
        //   const transaction = new TransactionDetails();
        //   const user = await Parse.User.current()?.fetch();
    
        //   transaction.set("type", "recharge");
        //   transaction.set("gameId", "786");
        //   transaction.set("username", identity?.username || "");
        //   transaction.set("userId", identity?.objectId);
        //   transaction.set("transactionDate", new Date());
        //   transaction.set("transactionAmount", rechargeAmount);
        //   transaction.set("remark", remark);
        //   transaction.set("useWallet", false);
        //   transaction.set("userParentId", user?.get("userParentId") || "");
        //   transaction.set("status", 1);
        //   transaction.set("portal", "Payarc");
        //   transaction.set("transactionIdFromStripe", payarcResponse?.id);
        //   transaction.set("referralLink", payarcResponse?.payment_form_url || "");
        //   transaction.set("walletAddr", identity?.walletAddr || "");
    
        //   await transaction.save(null, { useMasterKey: true });
    
        //   const popup = window.open(payarcResponse?.payment_form_url, "_blank");
        //   setStoredBuyUrl(payarcResponse?.payment_form_url); // Store for retry

        //   if (!popup || popup.closed || typeof popup.closed === "undefined") {
        //     setPopupBlocked(true);
        //     setPopupDialogOpen(true);
        //   }
        // } catch (err) {
        //   console.error("Payarc order error:", err);
        //   alert("Something went wrong with Payarc Recharge.");
        // } finally {
        //   setCheckingRechargeLimit(false);
        // }
      }),
      disabled: identity?.isBlackListed || rechargeDisabled || checkingRechargeLimit
    },   
    {
      id: "quick-debit",
      title: "Quick Debit Recharge",
      description: "Instant • Most debit cards supported",
      subtext: "No KYC needed",
      icon: <img src={quickRecharge} alt="quickRecharge" />, // Credit card icon
      color: "#14B8A6",
      hoverColor: "#F6FEFD",
      paymentIcons: [venmo, payPal, visa, mastercard],
      onClick: debounce(async () => {
        try {
          setCheckingRechargeLimit(true);
          if (rechargeAmount < RechargeLimitOfAgent) {
            setRechargeError(`Minimum recharge amount must be greater than ${RechargeLimitOfAgent}`);
            return;
          }
          const transactionCheck = await checkActiveRechargeLimit(
            identity?.userParentId,
            rechargeAmount
          );
          if (!transactionCheck.success) {
            setCheckingRechargeLimit(false);
            setRechargeError(transactionCheck.message || "Recharge Limit Reached");
            return;
          }
          else{
            setCheckingRechargeLimit(false); 
          }
        
          setRechargeError(""); // Clear any previous error
          const testPopup = window.open("", "_blank", "width=1,height=1");
          if (
            !testPopup ||
            testPopup.closed ||
            typeof testPopup.closed === "undefined"
          ) {
            setPopupBlocked(true);
            setPopupDialogOpen(true);
            return;
          }
          testPopup.close();
          // Assign wallet if missing
          if (!identity?.walletAddr) {
            setWalletLoading(true);
            const walletResp = await Parse.Cloud.run(
              "assignRandomWalletAddrIfMissing",
              {
                userId: identity?.objectId,
              }
            );

            if (walletResp?.walletAddr) {
              identity.walletAddr = walletResp.walletAddr;
              setSnackbarOpen(true);
            } else {
              alert("Failed to assign wallet address. Please try again.");
              return;
            }
          }

          // Generate Onramp URL
          // const buyUrl = getOnrampBuyUrl({
          //   projectId,
          //   addresses: { "0x1": [identity.walletAddr] }, // Ethereum mainnet
          //   assets: ["USDC"],
          //   presetFiatAmount: rechargeAmount,
          //   fiatCurrency: "USD",
          //   redirectUrl: "https://yourapp.com/onramp-return",
          // });

          //const buyUrl = `https://pay.coinbase.com/buy/select-asset?appId=${projectId}&destinationWallets=[{"address":"0xb69b947183c5a4434bb028e295947a3496e12298","blockchains":["ethereum"]}]&defaultAsset=USDC&defaultPaymentMethod=CARD&presetCryptoAmount=${rechargeAmount}`;
          const encodedAddresses = encodeURIComponent(
            JSON.stringify({ [identity.walletAddr]: ["base"] })
          );

          const buyUrl = `https://pay.coinbase.com/buy/select-asset?appId=${projectId}&addresses=${encodedAddresses}&defaultAsset=USDC&defaultPaymentMethod=CARD&presetCryptoAmount=${rechargeAmount}`;

          //           const partnerUserRef = `${identity.objectId}-${Date.now()}`;

          //           const sessionToken = await fetchCoinbaseSessionToken(identity.walletAddr, rechargeAmount,partnerUserRef);
          // if (!sessionToken) {
          //   alert("Could not generate session token for Coinbase.");
          //   return;
          // }
          ///const buyUrl = `https://pay.coinbase.com/buy/select-asset?appId=${projectId}&sessionToken=${sessionToken}`;

          //  const buyUrl = `https://pay.coinbase.com/buy/select-asset?appId=${projectId}&addresses={${identity.walletAddr}:["base"]}&defaultAsset=USDC&defaultPaymentMethod=CARD&presetCryptoAmount=${rechargeAmount}`;

          // Save the transaction
          const TransactionDetails = Parse.Object.extend("TransactionRecords");
          const transactionDetails = new TransactionDetails();
          const user = await Parse.User.current()?.fetch();

          transactionDetails.set("type", "recharge");
          transactionDetails.set("gameId", "786");
          transactionDetails.set("username", identity?.username || "");
          transactionDetails.set("userId", identity?.objectId);
          transactionDetails.set("transactionDate", new Date());
          transactionDetails.set("transactionAmount", rechargeAmount);
          transactionDetails.set("remark", remark);
          transactionDetails.set("useWallet", false);
          transactionDetails.set(
            "userParentId",
            user?.get("userParentId") || ""
          );
          transactionDetails.set("status", 1); // pending
          transactionDetails.set("portal", "Coinbase");
          transactionDetails.set("referralLink", buyUrl);
          transactionDetails.set("transactionIdFromStripe", buyUrl);
          transactionDetails.set("walletAddr", identity?.walletAddr);
          //transactionDetails.set("partnerUserRef",partnerUserRef)
          await transactionDetails.save(null, { useMasterKey: true });
          setStoredBuyUrl(buyUrl); // Store for retry
          const popup = window.open(buyUrl, "_blank");
          if (!popup || popup.closed || typeof popup.closed === "undefined") {
            setPopupBlocked(true);
            setPopupDialogOpen(true);
          }
        } catch (error) {
          console.error("Coinbase Onramp Error:", error);
          alert("Something went wrong with Coinbase Recharge.");
        } finally {
          setWalletLoading(false);
        }
      }),
      disabled: identity?.isBlackListed || rechargeDisabled || walletLoading || checkingRechargeLimit,
    },
    {
      id: "instant",
      title: "Instant Recharge",
      description: "Instant • Limited debit card support",
      subtext: "No KYC needed",
      icon: <img src={instantRecharge} alt="instantRecharge" />, // Lightning icon
      color: "#3B82F6",
      hoverColor: "#F5F9FF",
      paymentIcons: [Chime, venmo, payPal, visa, mastercard],
      onClick: debounce(() => {
        if (!identity?.isBlackListed) {
          if (paymentSource === "stripe") {
            handleRechargeClick();
          } else {
            setRechargeDialogOpen(true);
          }
        }
      }),
      disabled: identity?.isBlackListed || rechargeDisabled,
    },
    {
      id: "crypto",
      title: "Standard Recharge",
      description: "",
      subtext: "KYC Required",
      subtextColor: "#4B5563", // Red color for KYC required
      icon: <img src={cryptoRecharge} alt="cryptoRecharge" />, // Bitcoin icon
      paymentIcons: [Logo1, visa, mastercard],
      color: "#A855F7",
      hoverColor: "#FAF5FF",
      onClick: debounce(async () => {
        setCheckingRechargeLimit(true);
        if (rechargeAmount < RechargeLimitOfAgent) {
          setRechargeError(`Minimum recharge amount must be greater than ${RechargeLimitOfAgent}`);
          return;
        }
        const transactionCheck = await checkActiveRechargeLimit(
          identity?.userParentId,
          rechargeAmount
        );
  
        if (!transactionCheck.success) {
          setCheckingRechargeLimit(false);
          setRechargeError(transactionCheck.message || "Recharge Limit Reached");
          return;
        }else{
          setCheckingRechargeLimit(false);
        }
        
        setRechargeError(""); // Clear any previous error
        if (walletLoading) return; // prevent spamming

        if (!identity?.walletAddr) {
          try {
            setWalletLoading(true);

            const walletResp = await Parse.Cloud.run(
              "assignRandomWalletAddrIfMissing",
              {
                userId: identity?.objectId,
              }
            );

            if (walletResp?.walletAddr) {
              identity.walletAddr = walletResp.walletAddr;
              setSnackbarOpen(true);
            } else {
              alert("Failed to assign wallet address. Please try again.");
              return;
            }
          } catch (err) {
            console.error("Error assigning wallet:", err);
            alert("Something went wrong while assigning wallet address.");
            return;
          } finally {
            setWalletLoading(false);
          }
        }

        setRechargeLinkDialogOpen(true);
      }),
      disabled: identity?.isBlackListed || rechargeDisabled || walletLoading || checkingRechargeLimit,
    } 
    // {
    //   id: "bank",
    //   title: "Bank Transfer",
    //   description: "2-3 Days • Manual confirmation",
    //   subtext: "KYC Required",
    //   subtextColor: "#ED580C", // Red color for KYC required
    //   icon: <img src={bankTransfer} alt="bankTransfer" />, // Bank icon
    //   color: "#6B7280",
    //   hoverColor: "#F9FAFA",
    //   onClick: () => console.log("Bank Transfer selected"),
    // },
  ].filter(Boolean);

  return (
    <>
      <Box
        sx={{
          padding: "24px",
          borderRadius: "8px",
          border: "1px solid #E7E7E7",
          mb: 2,
          bgcolor: "white",
        }}
      >
        <Typography
          variant="body2"
          sx={{
            height: "29px",
            fontFamily: "Inter, sans-serif",
            fontWeight: 500,
            fontSize: "24px",
            mb: "16px",
          }}
        >
          Recharge your account
        </Typography>
        <Box sx={{ width: "100%", paddingTop: "8px" }}>
          <Box
            sx={{
              width: "100%",
              border: "1px solid #E7E7E7",
              borderRadius: "8px",
              padding: "12px",
            }}
          >
            {/* {isTransactionNoteVisible && (
              <>
               
                <Box sx={{ borderBottom: "1px solid #e0e0e0", my: 1 }} />
              </>
            )} */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "52px",
                gap: "8px",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  width: "100%",
                  flexDirection: { xs: "column", md: "row" },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      bgcolor: "#EFF6FF",
                      borderRadius: "40px",
                      padding: "11.5px 24px",
                    }}
                  >
                    <img
                      src={AOG_Symbol}
                      alt="AOG Symbol"
                      style={{ width: "32px", height: "32px" }}
                    />
                    <Typography
                      sx={{
                        fontFamily: "Inter, sans-serif",
                        fontWeight: 600,
                        fontSize: "32px",
                        lineHeight: "100%",
                        letterSpacing: "0px",
                        color: "#000000",
                      }}
                    >
                      {rechargeAmount}
                    </Typography>
                  </Box>
                  <Box>
                    <TextField
                      fullWidth
                      label="Add Transaction Note"
                      value={remark}
                      onChange={(e) => setRemark(e.target.value)}
                      variant="outlined"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": {
                            border: "none",
                          },
                          "&:hover fieldset": {
                            border: "none",
                          },
                        },
                      }}
                    />
                  </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center" }}>
                  {/* <img
                    src={Docs}
                    alt="Docs Icon"
                    style={{ width: "24px", height: "24px", cursor: "pointer" }}
                    onClick={() =>
                      setIsTransactionNoteVisible(!isTransactionNoteVisible)
                    }
                  />
                  <Typography sx={{ color: "#E7E7E7", m: "0px 12px" }}>
                    |
                  </Typography> */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "12px 0",
                      cursor: "pointer",
                    }}
                    onClick={toggleExpand}
                  >
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          bgcolor:
                            paymentSource !== "wallet" ? "none" : "#F4F3FC",
                          width: "24px",
                          height: "24px",
                          borderRadius: "4px",
                          mr: 1,
                        }}
                      >
                        <img
                          src={paymentSource !== "wallet" ? Docs : WalletIcon}
                          alt="Payment Method Icon"
                          style={{ width: "16px", height: "16px" }}
                        />
                      </Box>
                      <Typography sx={{ fontWeight: 500 }}>
                        {displayMethod}
                      </Typography>
                    </Box>
                    <IconButton>
                      <ExpandMoreIcon
                        sx={{
                          transform: expanded
                            ? "rotate(180deg)"
                            : "rotate(0deg)",
                          transition: "transform 0.3s",
                        }}
                      />
                    </IconButton>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Expanded Payment Methods */}
            {expanded && (
              <Box sx={{ mt: 1, mb: 2, pl: 2 }}>
                <RadioGroup
                  value={paymentSource}
                  onChange={handlePaymentMethodChange}
                >
                  <FormControlLabel
                    value="wallet"
                    control={
                      <Radio
                        sx={{
                          color: "#2E5BFF",
                          "&.Mui-checked": { color: "#2E5BFF" },
                        }}
                      />
                    }
                    label={
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            bgcolor: "#F4F3FC",
                            width: "24px",
                            height: "24px",
                            borderRadius: "4px",
                            mr: 1,
                          }}
                        >
                          <img
                            src={WalletIcon}
                            alt="Wallet Icon"
                            style={{ width: "14px", height: "14px" }}
                          />
                        </Box>
                        <Typography>Wallet</Typography>
                      </Box>
                    }
                  />
                  <FormControlLabel
                    value="stripe"
                    control={
                      <Radio
                        sx={{
                          color: "#2E5BFF",
                          "&.Mui-checked": { color: "#2E5BFF" },
                        }}
                      />
                    }
                    label={
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <img
                          src={Docs}
                          alt="Payment Portal Icon"
                          style={{
                            width: "20px",
                            height: "20px",
                            marginRight: "8px",
                          }}
                        />
                        <Typography>Payment Portal</Typography>
                      </Box>
                    }
                  />
                </RadioGroup>
              </Box>
            )}
          </Box>
          {/* <Box
            sx={{
              display: "flex",
              gap: "6px",
              justifyContent: "center",
              alignItems: "center",
              mt: 2,
              mb: 2,
              flexWrap: { xs: "wrap", md: "nowrap" },
            }}
          >
            {[10, 15, 20, 30, 40, 50, 75, 100].map((amount) => (
              <Button
                key={amount}
                variant="outlined"
                sx={{
                  borderRadius: "40px",
                  width: { xs: "45%", sm: "30%", md: "100%" },
                  padding: { xs: "6px 12px", md: "8px 16px" },
                  border:
                    amount !== rechargeAmount ? "1px dashed #93B1D2" : "none",
                  bgcolor:
                    amount === rechargeAmount ? "#2E5BFF" : "transparent",
                  color: amount === rechargeAmount ? "white" : "black",
                  ":hover": {
                    border: "none",
                    bgcolor: "#2E5BFF",
                    color: "white",
                  },
                  gap: "8px",
                }}
                onClick={() => setRechargeAmount(amount)}
              >
                <img
                  src={AOG_Symbol}
                  alt="AOG Symbol"
                  style={{ width: "24px", height: "24px" }}
                />
                <Typography
                  sx={{ fontWeight: 400, fontSize: { xs: "16px", md: "18px" } }}
                >
                  {amount}
                </Typography>
              </Button>
            ))}
          </Box> */}
          <Box
            sx={{
              display: "flex",
              gap: "6px",
              justifyContent: "center",
              alignItems: "center",
              mt: 2,
              mb: 2,
              flexWrap: "wrap", // Always wrap on all screen sizes
              maxWidth: "100%",
            }}
          >
            {[10, 15, 20, 30, 40, 50, 75, 100].map((amount) => (
              <Button
                key={amount}
                variant="outlined"
                sx={{
                  borderRadius: "40px",
                  width: {
                    xs: "calc(50% - 8px)", // 2 buttons per row on extra small screens
                    sm: "calc(33.33% - 10px)", // 3 buttons per row on small screens
                    md: "calc(25% - 12px)", // 4 buttons per row on medium screens
                    lg: "auto", // Flexible width on large screens
                  },
                  padding: { xs: "6px 12px", md: "8px 16px" },
                  border:
                    amount !== rechargeAmount ? "1px dashed#93B1D2" : "none",
                  bgcolor:
                    amount === rechargeAmount ? "#2E5BFF" : "transparent",
                  color: amount === rechargeAmount ? "white" : "black",
                  ":hover": {
                    border: "none",
                    bgcolor: "#2E5BFF",
                    color: "white",
                  },
                  gap: "8px",
                }}
                onClick={() => setRechargeAmount(amount)}
              >
                <img
                  src={AOG_Symbol}
                  alt="AOG Symbol"
                  style={{ width: "24px", height: "24px" }}
                />
                <Typography
                  sx={{ fontWeight: 400, fontSize: { xs: "16px", md: "18px" } }}
                >
                  {amount}
                </Typography>
              </Button>
            ))}
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              mt: 3,
              mb: 1,
            }}
          >
            <Typography sx={{ fontSize: "12px", fontWeight: 400 }}>
              Recharge now and keep playing!
            </Typography>
            <img
              src={Star}
              alt="Star Icon"
              style={{ width: "12px", height: "12px", marginLeft: "4px" }}
            />
          </Box>
          {showKycSuccessMsg && (
            <Alert severity="success" sx={{ mb: 2 }}>
              KYC completed successfully! You can now proceed with recharge.
            </Alert>
          )}
          {rechargeDisabled && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Recharges are not available at this time. Please try again later.
            </Alert>
          )}
          {rechargeError && (
  <Alert severity="error" sx={{ mt: 1, mb: 2 }}>
    {rechargeError}
  </Alert>
)}

          {/* {walletLoading ? (
  <CircularProgress />
) : (
<> */}
          {/* {showCoinbase && <Button
            variant="contained"
            sx={{
              width: "100%",
              height: "52px",
              borderRadius: "4px",
              backgroundColor: "#00695C", // Slightly lighter than #0052FF
              color: "#FFFFFF",
              mt: 2,
              textTransform: "none",
              fontWeight: 500,
              fontSize: "18px",
              ":hover": {
                backgroundColor: "#004D40", // deeper teal-green on hover
              },
            }}
            //onClick={handleCoinbaseOnramp}

            onClick={debounce(async () => {
              try {
                const testPopup = window.open("", "_blank", "width=1,height=1");
                if (
                  !testPopup ||
                  testPopup.closed ||
                  typeof testPopup.closed === "undefined"
                ) {
                  setPopupBlocked(true);
                  setPopupDialogOpen(true);
                  return;
                }
                testPopup.close();
                // Assign wallet if missing
                if (!identity?.walletAddr) {
                  setWalletLoading(true);
                  const walletResp = await Parse.Cloud.run(
                    "assignRandomWalletAddrIfMissing",
                    {
                      userId: identity?.objectId,
                    }
                  );

                  if (walletResp?.walletAddr) {
                    identity.walletAddr = walletResp.walletAddr;
                    setSnackbarOpen(true);
                  } else {
                    alert("Failed to assign wallet address. Please try again.");
                    return;
                  }
                }

                // Generate Onramp URL
                // const buyUrl = getOnrampBuyUrl({
                //   projectId,
                //   addresses: { "0x1": [identity.walletAddr] }, // Ethereum mainnet
                //   assets: ["USDC"],
                //   presetFiatAmount: rechargeAmount,
                //   fiatCurrency: "USD",
                //   redirectUrl: "https://yourapp.com/onramp-return",
                // });

                //const buyUrl = `https://pay.coinbase.com/buy/select-asset?appId=${projectId}&destinationWallets=[{"address":"0xb69b947183c5a4434bb028e295947a3496e12298","blockchains":["ethereum"]}]&defaultAsset=USDC&defaultPaymentMethod=CARD&presetCryptoAmount=${rechargeAmount}`;
                const encodedAddresses = encodeURIComponent(
                  JSON.stringify({ [identity.walletAddr]: ["base"] })
                );

                const buyUrl = `https://pay.coinbase.com/buy/select-asset?appId=${projectId}&addresses=${encodedAddresses}&defaultAsset=USDC&defaultPaymentMethod=CARD&presetCryptoAmount=${rechargeAmount}`;

                //           const partnerUserRef = `${identity.objectId}-${Date.now()}`;

                //           const sessionToken = await fetchCoinbaseSessionToken(identity.walletAddr, rechargeAmount,partnerUserRef);
                // if (!sessionToken) {
                //   alert("Could not generate session token for Coinbase.");
                //   return;
                // }
                ///const buyUrl = `https://pay.coinbase.com/buy/select-asset?appId=${projectId}&sessionToken=${sessionToken}`;

                //  const buyUrl = `https://pay.coinbase.com/buy/select-asset?appId=${projectId}&addresses={${identity.walletAddr}:["base"]}&defaultAsset=USDC&defaultPaymentMethod=CARD&presetCryptoAmount=${rechargeAmount}`;

                // Save the transaction
                const TransactionDetails =
                  Parse.Object.extend("TransactionRecords");
                const transactionDetails = new TransactionDetails();
                const user = await Parse.User.current()?.fetch();

                transactionDetails.set("type", "recharge");
                transactionDetails.set("gameId", "786");
                transactionDetails.set("username", identity?.username || "");
                transactionDetails.set("userId", identity?.objectId);
                transactionDetails.set("transactionDate", new Date());
                transactionDetails.set("transactionAmount", rechargeAmount);
                transactionDetails.set("remark", remark);
                transactionDetails.set("useWallet", false);
                transactionDetails.set(
                  "userParentId",
                  user?.get("userParentId") || ""
                );
                transactionDetails.set("status", 1); // pending
                transactionDetails.set("portal", "Coinbase");
                transactionDetails.set("referralLink", buyUrl);
                transactionDetails.set("transactionIdFromStripe", buyUrl);
                transactionDetails.set("walletAddr", identity?.walletAddr);
                //transactionDetails.set("partnerUserRef",partnerUserRef)
                await transactionDetails.save(null, { useMasterKey: true });
                setStoredBuyUrl(buyUrl); // Store for retry
                const popup = window.open(buyUrl, "_blank");
                if (
                  !popup ||
                  popup.closed ||
                  typeof popup.closed === "undefined"
                ) {
                  setPopupBlocked(true);
                  setPopupDialogOpen(true);
                }
              } catch (error) {
                console.error("Coinbase Onramp Error:", error);
                alert("Something went wrong with Coinbase Recharge.");
              } finally {
                setWalletLoading(false);
              }
            })}
            disabled={
              identity?.isBlackListed || rechargeDisabled || walletLoading
            }
          >
            {walletLoading ? (
              "Assigning Wallet..."
            ) : (
              <>
                <BsFillCreditCard2FrontFill style={{ marginRight: 8 }} />
                Quick Debit Recharge
                <ArrowForwardIcon
                  style={{ width: 24, height: 24, marginLeft: 10 }}
                />
              </>
            )}
          </Button> } */}
          {/* <Button
            variant="contained"
            fullWidth
            sx={{
              width: "100%",
              height: "52px",
              borderRadius: "4px",
              backgroundColor: "#00695C", // Slightly lighter than #0052FF
              color: "#FFFFFF",
              mt: 2,
              textTransform: "none",
              fontWeight: 500,
              fontSize: "18px",
              ":hover": {
                backgroundColor: "#004D40", // deeper teal-green on hover
              },
            }}
            disabled={
              loadingSessionToken || identity?.isBlackListed || rechargeDisabled
            }
            onClick={debounce(async () => {
              if (loadingSessionToken) return;
             
              setLoadingSessionToken(true);
              try {
                // Assign wallet if missing
                if (!identity?.walletAddr) {
                  setWalletLoading(true);
                  const walletResp = await Parse.Cloud.run(
                    "assignRandomWalletAddrIfMissing",
                    {
                      userId: identity?.objectId,
                    }
                  );

                  if (walletResp?.walletAddr) {
                    identity.walletAddr = walletResp.walletAddr;
                    setSnackbarOpen(true);
                  } else {
                    alert("Failed to assign wallet address.");
                    return;
                  }
                }

                // Generate partnerUserRef
                const partnerUserRef = `${identity.objectId}-${Date.now()}`;

                // Generate session token
                const sessionToken = await fetchCoinbaseSessionToken(
                  identity.walletAddr,
                  rechargeAmount,
                  partnerUserRef
                );
                if (!sessionToken) {
                  alert("Could not generate session token for Coinbase.");
                  return;
                }
                const referralUrl = `https://pay.coinbase.com/buy/select-asset?sessionToken=${sessionToken}&defaultAsset=USDC&defaultPaymentMethod=CARD&presetCryptoAmount=${rechargeAmount}&redirectUrl=${process.env.REACT_APP_REFERRAL_URL}`;

                // Save transaction
                const TransactionDetails =
                  Parse.Object.extend("TransactionRecords");
                const transactionDetails = new TransactionDetails();
                const user = await Parse.User.current()?.fetch();

                transactionDetails.set("type", "recharge");
                transactionDetails.set("gameId", "786");
                transactionDetails.set("username", identity?.username || "");
                transactionDetails.set("userId", identity?.objectId);
                transactionDetails.set("transactionDate", new Date());
                transactionDetails.set("transactionAmount", rechargeAmount);
                transactionDetails.set("remark", remark);
                transactionDetails.set("useWallet", false);
                transactionDetails.set(
                  "userParentId",
                  user?.get("userParentId") || ""
                );
                transactionDetails.set("status", 1); // pending
                transactionDetails.set("portal", "Coinbase");
                transactionDetails.set("walletAddr", identity?.walletAddr);
                transactionDetails.set("partnerUserRef", partnerUserRef);
                transactionDetails.set("referralLink", referralUrl);
                transactionDetails.set("transactionIdFromStripe", referralUrl);

                const savedTransaction = await transactionDetails.save(null, {
                  useMasterKey: true,
                });
                let onrampInstance;

                await initOnRamp(
                  {
                    widgetParameters: {
                      sessionToken,
                      appId: "16201d2e-a55f-4634-8327-631dfe30fab2",
                      addresses: {
                        [identity.walletAddr]: ["base"],
                      },
                      presetCryptoAmount: rechargeAmount,
                      defaultAsset: "USDC",
                      defaultPaymentMethod: "CARD",
                      partnerUserId: partnerUserRef,
                      redirectUrl: process.env.REACT_APP_REFERRAL_URL,
                    },
                    onSuccess: async () => {
                      if (savedTransaction) {
                        savedTransaction.set("status", 2); // success
                        await savedTransaction.save(null, {
                          useMasterKey: true,
                        });
                      }
                    },
                    onExit: async () => {
                      if (savedTransaction) {
                        savedTransaction.set("status", 10); // cancelled
                        await savedTransaction.save(null, {
                          useMasterKey: true,
                        });
                      }
                    },
                    onEvent: (event) => {
                      console.log("Coinbase Widget Event:", event);
                    },
                    experienceLoggedIn: "popup",
                    experienceLoggedOut: "popup",
                    closeOnExit: true,
                    closeOnSuccess: true,
                  },
                  (error, instance) => {
                    onrampInstance = instance;
                  }
                );

                  // ✅ Step 1: Popup blocker test
              const testPopup = window.open("", "_blank", "width=1,height=1");
              if (
                !testPopup ||
                testPopup.closed ||
                typeof testPopup.closed === "undefined"
              ) {
                setPopupBlocked(true);
                setPopupDialogOpen(true);
                setStoredBuyUrl(referralUrl)
                return;
              }
              testPopup.close();

              onrampInstance.open();

              } catch (err) {
                console.error("Recharge with session token failed:", err);
                alert(
                  "Something went wrong during the session token recharge."
                );
              } finally {
                setLoadingSessionToken(false);
                setWalletLoading(false);
              }
            })}
          >
            <BsFillCreditCard2FrontFill style={{ marginRight: 8 }} />

            {loadingSessionToken
              ? "Generating Token..."
              : "Quick Debit Recharge"}
            <ArrowForwardIcon
              style={{ width: 24, height: 24, marginLeft: 10 }}
            />
          </Button> */}

          {/* {showWert && <Button
            variant="contained"
            sx={{
              width: "100%",
              height: "52px",
              borderRadius: "4px",
              backgroundColor: "#2E5BFF",
              color: "#FFFFFF",
              "&.Mui-disabled": {
                bgcolor: "#A0AEC0", // Disabled background color (grayish)
                color: "#E2E8F0", // Disabled text color (light gray)
              },
              ":hover": {
                backgroundColor: "#2448D8", // soft dark blue hover
              },
              marginTop: "10px",
            }}
            disabled={identity?.isBlackListed || rechargeDisabled}
            onClick={debounce(() => {
              if (!identity?.isBlackListed) {
                if (paymentSource === "stripe") {
                  handleRechargeClick();
                } else {
                  setRechargeDialogOpen(true);
                }
              }
            })}
          >
            <Typography
              sx={{ fontWeight: 500, fontSize: "18px", textTransform: "none" }}
            >
              ⚡️ Instant Recharge
            </Typography>
            <ArrowForwardIcon
              style={{ width: "24px", height: "24px", marginLeft: "10px" }}
            />
          </Button>} */}

          {/* {showLink &&   <Button
            variant="contained"
            sx={{
              width: "100%",
              height: "52px",
              borderRadius: "4px",
              backgroundColor: "green",
              color: "#FFFFFF",
              "&.Mui-disabled": {
                bgcolor: "#A0AEC0",
                color: "#E2E8F0",
              },
              ":hover": {
                backgroundColor: "#2E7D32", // deeper material green
              },
              marginTop: "10px",
            }}
            disabled={
              identity?.isBlackListed || rechargeDisabled || walletLoading
            }
            onClick={debounce(async () => {
              if (walletLoading) return; // prevent spamming

              if (!identity?.walletAddr) {
                try {
                  setWalletLoading(true);

                  const walletResp = await Parse.Cloud.run(
                    "assignRandomWalletAddrIfMissing",
                    {
                      userId: identity?.objectId,
                    }
                  );

                  if (walletResp?.walletAddr) {
                    identity.walletAddr = walletResp.walletAddr;
                    setSnackbarOpen(true);
                  } else {
                    alert("Failed to assign wallet address. Please try again.");
                    return;
                  }
                } catch (err) {
                  console.error("Error assigning wallet:", err);
                  alert("Something went wrong while assigning wallet address.");
                  return;
                } finally {
                  setWalletLoading(false);
                }
              }

              setRechargeLinkDialogOpen(true);
            })}
            // onClick={() => setRechargeLinkDialogOpen(true)} // ✅ Add this
          >
            {walletLoading ? (
              <Typography sx={{ fontSize: "16px", fontWeight: 500 }}>
                Assigning Wallet...
              </Typography>
            ) : (
              <>
                <Typography
                  sx={{
                    fontWeight: 500,
                    fontSize: "18px",
                    textTransform: "none",
                  }}
                >
                  ⏳ Standard Recharge
                </Typography>
                <ArrowForwardIcon
                  style={{ width: "24px", height: "24px", marginLeft: "10px" }}
                />
              </>
            )}
          </Button>} */}
          {/* </>
)} */}
{rechargeMethodLoading ? 
 <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
 <CircularProgress size={32} />
</Box>
:
          <Stack spacing={2}>
            {/* <Button className="btn btn-theme-outline" onClick={()=>{
              navigate("/checkout",{state:{rechargeAmount}})
            }} >Payarc</Button> */}
            
            {/* <PayArcHostedFields  rechargeAmount={rechargeAmount}/> */}
            {paymentOptions
              .filter((option) => {
                if (option.id === "quick-debit" && !showCoinbase) return false;
                if (option.id === "instant" && !showWert) return false;
                if (option.id === "crypto" && !showLink) return false;
                if (option.id === "payarc" && !showPayarc) return false;
                if (option.id === "stripe" && !showStripe) return false;
                return true;
              })
              .map((option) => (
                <Card
                  key={option.id}
                  sx={{
                    borderRadius: 2,
                    border: "1px solid #E2E8F0",
                    boxShadow: "none",
                    transition: "all 0.2s ease",
                    cursor: "pointer",
                    "&:hover": option.disabled
                      ? ""
                      : {
                          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                          bgcolor: option.hoverColor,
                        },
                    borderLeft: `4px solid ${option.color}`,
                    bgcolor: option.disabled ? "#E7E7E7" : "",
                  }}
                  onMouseEnter={() => setHoveredOption(option.id)}
                  onMouseLeave={() => setHoveredOption(null)}
                  onClick={!option.disabled ? option.onClick : undefined}
                >
                  <CardContent sx={{ p: "16px !important" }}>
                    <Box
                      sx={{
                        display: "flex",
                        // flexDirection: {xs: "column", md: "row"},
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            mr: 1,
                            fontSize: "24px",
                          }}
                        >
                          {option.icon}
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 1,
                          }}
                        >
                          <Box>
                            <Typography
                              sx={{ fontWeight: 500, fontSize: "16px" }}
                            >
                              {option.title}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 400,
                                fontSize: "14px",
                                color: "#4B5563",
                              }}
                            >
                              {option.description}
                            </Typography>
                            <Typography
                              variant="body2"
                              color={option.subtextColor || "text.secondary"}
                              sx={{
                                fontWeight: 500,
                                fontSize: "14px",
                              }}
                            >
                              {option.subtext}
                            </Typography>
                          </Box>
                          {option.paymentIcons && (
                            <Box
                              sx={{
                                display: { xs: "flex", md: "none" },
                                // flexDirection: { md: "row", xs: "column" },
                                alignItems: "center",
                                gap: 2,
                              }}
                            >
                              {option.paymentIcons.map((icon, index) => (
                                <Box
                                  key={index}
                                  sx={{
                                    mr: 1,
                                    color: "text.secondary",
                                    fontWeight: "bold",
                                    fontSize: "14px",
                                  }}
                                >
                                  <img
                                    src={icon}
                                    alt={`Payment Icon ${index}`}
                                    style={{
                                      width: "100%",
                                      padding:
                                        icon === visa ? "8px 12px" : undefined,
                                      border:
                                        icon === visa
                                          ? "1px solid #E7E7E7"
                                          : undefined,
                                      borderRadius:
                                        icon === visa ? "4px" : undefined,
                                    }}
                                  />
                                </Box>
                              ))}
                            </Box>
                          )}
                        </Box>
                      </Box>

                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        {option.paymentIcons && (
                          <Box
                            sx={{
                              display: { xs: "none", md: "flex" },
                              // flexDirection: { md: "row", xs: "column" },
                              alignItems: "center",
                              gap: { xs: 1, md: 0 },
                            }}
                          >
                            {option.paymentIcons.map((icon, index) => (
                              <Box
                                key={index}
                                sx={{
                                  mr: 2,
                                  color: "text.secondary",
                                  fontWeight: "bold",
                                  fontSize: "14px",
                                }}
                              >
                                <img
                                  src={icon}
                                  alt={`Payment Icon ${index}`}
                                  style={{
                                    width: "100%",
                                    padding:
                                      icon === visa ? "8px 12px" : undefined,
                                    border:
                                      icon === visa
                                        ? "1px solid #E7E7E7"
                                        : undefined,
                                    borderRadius:
                                      icon === visa ? "4px" : undefined,
                                  }}
                                />
                              </Box>
                            ))}
                          </Box>
                        )}
                        <ChevronRightIcon sx={{ color: "#9CA3AF" }} />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
          </Stack>
}
        </Box>
      </Box>
      {totalData > 0 && data.length !== 0 && (
        <TransactionRecords
          message={"Recent Recharges"}
          totalTransactions={totalData}
          transactionData={data}
          redirectUrl={"rechargeRecords"}
        />
      )}
      <Dialog
        open={rechargeLinkDialogOpen}
        onClose={() => setRechargeLinkDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Recharge Wallet Address</DialogTitle>
        <DialogContent>
          <Alert
            severity="warning"
            sx={{
              mb: 2,
              borderRadius: "8px",
              backgroundColor: "#e8f4fd",
              color: "#0c5460",
              fontWeight: 500,
            }}
          >
            Leave all details as they are to avoid issues with your transaction.
            <br />
            When prompted, you’ll need to enter your wallet key 🔑.
          </Alert>
          {/* <Box
            sx={{
              display: "flex",
              alignItems: "center",
              border: "1px solid #ccc",
              borderRadius: "4px",
              padding: "10px",
              background: "#f9f9f9",
              mt: 1,
            }}
          >
            <Typography
              variant="body1"
              sx={{ wordBreak: "break-all", flex: 1 }}
            >
              {identity?.walletAddr || "No Wallet Address Found"}
            </Typography>
            <Tooltip
              title="Copy"
              open={copyTooltipOpen}
              onClose={() => setCopyTooltipOpen(false)}
              arrow
            >
              <IconButton onClick={handleCopy}>
                <ContentCopyIcon />
              </IconButton>
            </Tooltip>
          </Box> */}
          {/* Wallet Copy Button with same styling as Recharge Now */}
          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              fullWidth
              onClick={handleCopy}
              sx={{
                height: "52px",
                borderRadius: "4px",
                backgroundColor: "#2E5BFF",
                color: "#FFFFFF",
                textTransform: "none",
                fontWeight: 500,
                fontSize: "18px",
                ":hover": {
                  backgroundColor: "#2E5BFF",
                },
              }}
            >
              Copy Wallet Key
            </Button>
          </Box>

          {/* External Recharge Link */}
          <Box sx={{ mt: 3 }}>
            <Button
              variant="outlined"
              fullWidth
              onClick={async () => {
                if (processingCryptoRecharge) return;
                try {
                  setProcessingCryptoRecharge(true);

                  const TransactionDetails =
                    Parse.Object.extend("TransactionRecords");
                  const transactionDetails = new TransactionDetails();

                  const user = await Parse.User.current()?.fetch();

                  transactionDetails.set("type", "recharge");
                  transactionDetails.set("gameId", "786");
                  transactionDetails.set("username", identity?.username || "");
                  transactionDetails.set("userId", identity?.objectId);
                  transactionDetails.set("transactionDate", new Date());
                  transactionDetails.set("transactionAmount", rechargeAmount);
                  transactionDetails.set("remark", remark);
                  transactionDetails.set(
                    "useWallet",
                    paymentSource === "wallet"
                  );
                  transactionDetails.set(
                    "userParentId",
                    user?.get("userParentId") || ""
                  );
                  transactionDetails.set("status", 1);
                  transactionDetails.set("referralLink", rechargeUrl);
                  transactionDetails.set(
                    "transactionIdFromStripe",
                    rechargeUrl
                  );
                  transactionDetails.set("portal", "Stripe");
                  transactionDetails.set("walletAddr", identity?.walletAddr);

                  await transactionDetails.save(null, { useMasterKey: true });
                  setStoredBuyUrl(rechargeUrl); // Store for retry
                  const popup = window.open(rechargeUrl, "_blank");
                  if (
                    !popup ||
                    popup.closed ||
                    typeof popup.closed === "undefined"
                  ) {
                    setPopupBlocked(true);
                    setPopupDialogOpen(true);
                  }
                  //setRechargeLinkDialogOpen(false); // optional: close dialog
                } catch (err) {
                  console.error("Failed to save transaction:", err);
                  alert("Failed to initiate transaction. Please try again.");
                } finally {
                  setProcessingCryptoRecharge(false);
                }
              }}
              sx={{
                textTransform: "none",
                fontWeight: 500,
                borderRadius: "8px",
                bgcolor:
                  walletCopied && !processingCryptoRecharge
                    ? "green"
                    : "grey.400",
                color: "white",
                "&:hover": {
                  bgcolor:
                    walletCopied && !processingCryptoRecharge
                      ? "darkgreen"
                      : "grey.500",
                },
                "&.Mui-disabled": {
                  bgcolor: "grey.400",
                  color: "white",
                  borderColor: "grey.400",
                },
              }}
              disabled={processingCryptoRecharge || !walletCopied}
              // sx={{
              //   textTransform: "none",
              //   fontWeight: 500,
              //   borderRadius: "8px",
              // }}
            >
              {processingCryptoRecharge
                ? "Processing..."
                : !walletCopied
                ? "Copy Wallet Key First"
                : "Go to Payment Portal"}
            </Button>
          </Box>
          <Snackbar
            open={snackbarOpen}
            autoHideDuration={3000}
            onClose={() => setSnackbarOpen(false)}
            message="Wallet address copied!"
            //anchorOrigin={{ vertical: "top", horizontal: "center" }}
            sx={{
              zIndex: (theme) => theme.zIndex.tooltip + 1000, // Keep it on top
              "& .MuiSnackbarContent-root": {
                backgroundColor: "#323232",
                color: "#fff",
                fontWeight: 500,
                fontSize: "14px",
                borderRadius: "6px",
                padding: "10px 16px",
                boxShadow: "0px 4px 20px rgba(0,0,0,0.2)",
              },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRechargeLinkDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <RechargeDialog
        open={RechargeDialogOpen}
        onClose={() => setRechargeDialogOpen(false)}
        handleRefresh={handleRefresh}
        data={{
          rechargeAmount: rechargeAmount,
          remark: remark,
          paymentSource: paymentSource,
        }}
      />
      <SubmitKYCDialog
        open={submitKycDialogOpen}
        onClose={() => setSubmitKycDialogOpen(false)}
        onSuccess={handleRefresh}
        identity={identity}
      />
      <Dialog open={popupDialogOpen} onClose={() => setPopupDialogOpen(false)}>
        <DialogTitle>Enable Pop-up Windows</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Popups have been blocked in your browser. Please unblock popup
            blocker for <a href="https://getways.us/">getways.us</a> for a
            better and smoother experience.
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setShowSafariHelp(true);
              }}
              style={{ color: "#1976d2", cursor: "pointer", marginLeft: 4 }}
            >
              How?
            </a>
            <br /> <br />
            Click proceed to continue.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setPopupDialogOpen(false);
              if (storedBuyUrl) {
                const popup = window.open(storedBuyUrl, "_blank");
                if (
                  !popup ||
                  popup.closed ||
                  typeof popup.closed === "undefined"
                ) {
                  alert("Still blocked. Please check popup settings.");
                }
              }
            }}
            color="primary"
            autoFocus
          >
            Proceed
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showSafariHelp} onClose={() => setShowSafariHelp(false)}>
        <DialogTitle>Enable Popups in Safari</DialogTitle>
        <DialogContent>
          <DialogContentText component="div">
            <Typography variant="body1" gutterBottom>
              Follow these steps to allow pop-ups in Safari on iPhone or Mac:
            </Typography>
            <Typography variant="body2" component="ol">
              <li>Update to the latest version of iOS</li>
              <li>
                Go to <strong>Settings</strong> on your iPhone or iPad. Scroll
                down and tap <strong>Apps</strong>
              </li>
              <li>
                Scroll down and tap <strong>Safari</strong>.
              </li>
              <li>
                Find the option <strong>"Block Pop-ups"</strong>.
              </li>
              <li>
                Make sure it's <strong>turned OFF</strong>.
              </li>
              <li>
                Return to the &nbsp;{" "}
                <img
                  src="/assets/company_logo_black.svg"
                  alt="Company Logo"
                  loading="lazy"
                  style={{
                    maxHeight: "2em",
                    width: "auto",
                  }}
                />
                &nbsp;&nbsp; and click <strong>Proceed</strong> again.
              </li>
            </Typography>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSafariHelp(false)} autoFocus>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Recharge;
