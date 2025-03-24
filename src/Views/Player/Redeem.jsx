import React, { useEffect, useState } from "react";
import { Box, Typography, Button, IconButton, TextField } from "@mui/material";
import AOG_Symbol from "../../Assets/icons/AOGsymbol.png";
import useDeviceType from "../../Utils/Hooks/useDeviceType";
import Docs from "../../Assets/icons/Docs.svg";
import iIcon from "../../Assets/icons/Iicon.svg";
import { useGetIdentity, useNotify, useRefresh } from "react-admin";
import RedeemDialog from "./dialog/PlayerRedeemDialog";
import { Parse } from "parse";
import TransactionRecords from "./TransactionRecords";
import { walletService } from "../../Provider/WalletManagement";
import { Loader } from "../Loader";
import { validatePositiveNumber } from "../../Validators/number.validator";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

Parse.initialize(process.env.REACT_APP_APPID, process.env.REACT_APP_MASTER_KEY);
Parse.serverURL = process.env.REACT_APP_URL;

const Redeem = ({ data, totalData, wallet }) => {
  const { isMobile } = useDeviceType();
  const [redeemAmount, setRedeemAmount] = useState(50);
  const { identity } = useGetIdentity();
  const [redeemFees, setRedeemFees] = useState(0);
  const [loading, setLoading] = useState(false);
  const notify = useNotify();

  const [redeemDialogOpen, setRedeemDialogOpen] = useState(false);
  const refresh = useRefresh();
  const [remark, setRemark] = useState("");
  const [isTransactionNoteVisible, setIsTransactionNoteVisible] =
    useState(false);
  const [walletId, setWalletId] = useState("");
  const [paymentMethods, setPaymentMethods] = useState({
    cashAppId: "",
    paypalId: "",
    venmoId: "",
    zelleId: "",
  });

  const resetFields = () => {
    setRedeemAmount(50);
    setRemark("");
  };
  useEffect(() => {
    if (wallet) {
      const { cashAppId, paypalId, venmoId, objectId } = wallet;
      setPaymentMethods({ cashAppId, paypalId, venmoId });
      setWalletId(objectId);
    }
  }, [wallet]);

  const transformedIdentity = {
    id: identity?.objectId,
    ...identity,
  };

  const handleRefresh = async () => {
    refresh();
  };

  const parentServiceFee = async () => {
    try {
      const response = await Parse.Cloud.run("redeemParentServiceFee", {
        userId: transformedIdentity?.userParentId,
      });
      setRedeemFees(response?.redeemService || 0);
    } catch (error) {
      console.error("Error fetching parent service fee:", error);
    }
  };

  useEffect(() => {
    if (transformedIdentity?.userParentId) {
      parentServiceFee();
    }
  }, []);

  const handleConfirm = () => {
    const { cashAppId, paypalId, venmoId } = paymentMethods;
    const methodCount = [cashAppId, paypalId, venmoId].filter(Boolean).length;

    if (methodCount === 0) {
      notify(
        "No payment methods are added. Please add a payment method to proceed.",
        {
          type: "warning",
        }
      );
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    const { cashAppId, paypalId, venmoId, zelleId } = paymentMethods;
    if (!cashAppId && !paypalId && !venmoId && !zelleId) {
      // setErrorMessage("Refund cannot be processed without a payment mode.");
      notify("Refund cannot be processed without a payment mode.", {
        type: "error",
      });
      return;
    }

    const validationResponse = validatePositiveNumber(redeemAmount);
    if (!validationResponse.isValid) {
      // setErrorMessage(validationResponse.error);
      notify(validationResponse.error, {
        type: "error",
      });
      return;
    }

    if (redeemAmount < 15) {
      // setErrorMessage("RedeemAmount amount cannot be less than 15.");
      notify("RedeemAmount amount cannot be less than 15.", {
        type: "error",
      });
      return;
    }
    const rawData = {
      ...transformedIdentity,
      redeemServiceFee: redeemFees,
      transactionAmount: redeemAmount,
      remark,
      type: "redeem",
      walletId: walletId,
    };
    setLoading(true);
    try {
      const response = await Parse.Cloud.run("playerRedeemRedords", rawData);
      if (response?.status === "error") {
        // setErrorMessage(response?.message);
        notify(response?.message, {
          type: "error",
        });
      } else {
        resetFields();
        handleRefresh();
      }
    } catch (error) {
      console.error("Error Redeem Record details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <>
      <Box
          sx={{
            padding: isMobile ? "16px" : "24px",
            backgroundColor: "#FFFFFF",
            borderRadius: "8px",
            border: "1px solid #E7E7E7",
            boxShadow: "0px 4px 16px rgba(0, 0, 0, 0.05)",
            mb:2
          }}
        >
          <Typography
            sx={{
              fontFamily: "Inter",
              fontWeight: 500,
              fontSize: isMobile ? "20px" : "24px",
              marginBottom: "16px",
              color: "#000000",
            }}
          >
            Redeem
          </Typography>

          <Box
            sx={{
              width: "100%",
              height: isMobile ? "60px" : "72px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderRadius: "8px",
              padding: isMobile ? "8px" : "12px",
              background: "#FFFFFF",
              border: "1px solid #E7E7E7",
              marginBottom: "16px",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <img
                src={AOG_Symbol}
                alt="AOG Symbol"
                style={{ width: isMobile ? "32px" : "40px", height: isMobile ? "32px" : "40px" }}
              />
              <Typography
                sx={{
                  fontFamily: "Inter",
                  fontWeight: 600,
                  fontSize: isMobile ? "32px" : "40px",
                  lineHeight: "100%",
                  color: "#000000",
                }}
              >
                {redeemAmount}
              </Typography>
            </Box>
            <img
              src={Docs}
              alt="Docs Icon"
              style={{
                width: isMobile ? "20px" : "24px",
                height: isMobile ? "20px" : "24px",
                cursor: "pointer", // Added cursor pointer for better UX
              }}
              onClick={() => setIsTransactionNoteVisible(!isTransactionNoteVisible)} // Added onClick handler
            />
          </Box>

          {isTransactionNoteVisible && (
            <Box sx={{ mb: "16px" }}>
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
          )}

          <Box
            sx={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: isMobile ? "8px" : "16px",
              marginBottom: "24px",
              flexWrap: "wrap",
              justifyContent: isMobile ? "center" : "flex-start",
            }}
          >
            {[10, 20, 50, 100, 200, 500].map((value, index) => (
              <Box
                key={index}
                onClick={() => setRedeemAmount(value)}
                sx={{
                  minWidth: isMobile ? "80px" : "114px",
                  height: isMobile ? "36px" : "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  borderRadius: "40px",
                  padding: isMobile ? "6px 12px" : "8px 16px",
                  border: value === redeemAmount ? "1px solid #2E5BFF" : "1px dotted #93B1D2",
                  backgroundColor: value === redeemAmount ? "rgba(46, 91, 255, 0.1)" : "transparent",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
              >
                <img
                  src={AOG_Symbol}
                  alt="AOG Symbol"
                  style={{ width: isMobile ? "20px" : "24px", height: isMobile ? "20px" : "24px" }}
                />
                <Typography
                  sx={{
                    fontFamily: "Inter",
                    fontWeight: 400,
                    fontSize: isMobile ? "16px" : "18px",
                    lineHeight: "20px",
                    color: "#000",
                  }}
                >
                  {value}
                </Typography>
              </Box>
            ))}
          </Box>

          <Box
            sx={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <Box
              sx={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography
                sx={{
                  fontFamily: "Inter",
                  fontWeight: 400,
                  fontSize: isMobile ? "10px" : "12px",
                  lineHeight: "100%",
                  color: "#000",
                }}
              >
                Redeem Service Fee @ {redeemFees}%
              </Typography>
              <Typography
                sx={{
                  fontFamily: "Inter",
                  fontWeight: 400,
                  fontSize: isMobile ? "10px" : "12px",
                  lineHeight: "100%",
                  color: "#000",
                }}
              >
                Redeems may take up to 2 hours
              </Typography>
            </Box>

            <Button
              onClick={() => setRedeemDialogOpen(true)}
              sx={{
                width: "100%",
                height: isMobile ? "48px" : "52px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                borderRadius: "8px",
                padding: isMobile ? "12px 24px" : "16px 32px",
                backgroundColor: "#2E5BFF",
                color: "#FFFFFF",
                fontFamily: "Inter",
                fontWeight: 500,
                fontSize: isMobile ? "16px" : "18px",
                textTransform: "none",
                "&:hover": {
                  backgroundColor: "#1A46E0",
                },
              }}
            >
              Redeem Request
              <ArrowForwardIcon />
            </Button>
          </Box>
        </Box>
      <TransactionRecords
        message={"Recent Redeem"}
        totalTransactions={totalData}
        transactionData={data}
        redirectUrl={"redeemRecords"}
      />
      <RedeemDialog
        open={redeemDialogOpen}
        onClose={() => setRedeemDialogOpen(false)}
        record={transformedIdentity}
        handleRefresh={handleRefresh}
      />
    </>
  );
};

export default Redeem;
