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
          padding: { xs: "16px", sm: "20px", md: "24px" }, 
          backgroundColor: "#FFFFFF",
          borderRadius: "8px",
          border: "1px solid #E7E7E7",
          boxShadow: "0px 4px 16px rgba(0, 0, 0, 0.05)",
          mb: 2,
          maxWidth: "100%", 
        }}
      >
        <Typography
          sx={{
            fontFamily: "Inter",
            fontWeight: 500,
            fontSize: { xs: "20px", sm: "22px", md: "24px" }, 
            marginBottom: { xs: "12px", md: "16px" }, 
            color: "#000000",
          }}
        >
          Redeem
        </Typography>
  
        <Box
          sx={{
            width: "100%",
            border: "1px solid #E7E7E7",
            borderRadius: "8px",
            padding: { xs: "8px", sm: "10px", md: "12px" }, 
            background: "#FFFFFF",
            marginBottom: "16px",
          }}
        >
          {isTransactionNoteVisible && (
            <>
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
                    "& .MuiInputBase-input": {
                      fontSize: { xs: "14px", md: "16px" }, 
                    },
                  }}
                />
              </Box>
              <Box sx={{ borderBottom: "1px solid #e0e0e0", my: 1 }} />
            </>
          )}
  
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              minHeight: "52px", 
              gap: "8px",
              // flexDirection: { xs: "column", md: "row" },  responsive behavior
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
                style={{width:"40px", height:"40px"}}
              />
              <Typography
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 600,
                  fontSize: "40px",
                  lineHeight: "100%",
                  letterSpacing: "0px",
                  color: "#000000",
                }}
              >
                {redeemAmount}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <img
                src={Docs}
                alt="Docs Icon"
                style={{
                  width: "24px", 
                  height: "24px", 
                  cursor: "pointer",
                }}
                onClick={() =>
                  setIsTransactionNoteVisible(!isTransactionNoteVisible)
                }
              />
            </Box>
          </Box>
        </Box>
  
        <Box
          sx={{
            display: "flex",
            gap: "6px",
            justifyContent: "center",
            alignItems: "center",
            m: 2,
            flexWrap: { xs: "wrap", md: "nowrap" }, 
          }}
        >
          {[10, 20, 50, 100, 200, 500].map((amount) => (
            <Button
              key={amount}
              variant="outlined"
              sx={{
                borderRadius: "40px",
                width: { xs: "45%", sm: "30%", md: "100%" }, 
                padding: { xs: "6px 12px", md: "8px 16px" }, 
                border: amount !== redeemAmount ? "1px dashed #93B1D2" : "none",
                bgcolor: amount === redeemAmount ? "#2E5BFF" : "transparent",
                color: amount === redeemAmount ? "white" : "black",
                ":hover": {
                  border: "none",
                  bgcolor: "#2E5BFF",
                  color: "white",
                },
                gap: "8px", 
              }}
              onClick={() => setRedeemAmount(amount)}
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
              flexDirection: { xs: "column", md: "row" },
              gap: { xs: "12px", md: "0" }, 
            }}
          >
            <Typography
              sx={{
                fontFamily: "Inter",
                fontWeight: 400,
                fontSize: { xs: "10px", md: "12px" }, 
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
                fontSize: { xs: "10px", md: "12px" }, 
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
              height: "52px", 
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              borderRadius: "4px", 
              padding: { xs: "10px", md: "inherit" }, 
              backgroundColor: "#2E5BFF",
              color: "#FFFFFF",
              fontFamily: "Inter",
              fontWeight: 500,
              fontSize: { xs: "16px", md: "18px" }, 
              textTransform: "none",
              "&:hover": {
                backgroundColor: "#2E5BFF",
              },
            }}
          >
            Redeem Request
            <ArrowForwardIcon style={{ width: "24px", height: "24px", marginLeft: "10px" }} /> {/* Matches Recharge */}
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
        onConfirm={handleConfirm}
        redeemAmount={redeemAmount}
        remark={remark}
        record={transformedIdentity}
        handleRefresh={handleRefresh}
      />
    </>
  );
  };
  
  export default Redeem;
