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

Parse.initialize(process.env.REACT_APP_APPID, process.env.REACT_APP_MASTER_KEY);
Parse.serverURL = process.env.REACT_APP_URL;

const Redeem = ({data,totalData}) => {
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
    async function WalletService() {
      setLoading(true);
      const wallet = await walletService.getMyWalletData();
      const { cashAppId, paypalId, venmoId, objectId } = wallet?.wallet;
      setPaymentMethods({ cashAppId, paypalId, venmoId });
      setWalletId(objectId);
      setLoading(false);
    }
    WalletService();
  }, []);

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
          borderBottomWidth: "1px",
          padding: "10px 16px",
        }}
      >
        {isMobile && (
          <Typography
            variant="body2"
            sx={{
              height: "19px",
              fontFamily: "Inter, sans-serif",
              fontWeight: 500,
              fontSize: "16px",
              color: "#4D4D4D", // Corrected text color
              mb: "8px",
            }}
          >
            Withdraw Your Winnings: Easy & Secure
          </Typography>
        )}
        <Box
          sx={{
            height: "32px",
            gap: "8px",
            display: "flex",
            alignItems: "center",
            bgcolor: " #EDF7FF",
            borderRadius: "4px",
            paddingLeft: "8px",
            marginBottom:"16px"
          }}
        >
          {/* Icon */}
          <img
            src={iIcon}
            alt="Info Icon"
            style={{ width: "16px", height: "16px" }}
          />

          {/* Text Box */}
          <Box
            sx={{
              height: "15px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Typography
              sx={{
                fontFamily: "Inter",
                fontWeight: 400,
                fontSize: "12px",
                lineHeight: "100%",
                letterSpacing: "0px",
                textAlign: "center",
              }}
            >
              Redeems may take up to 2 hours
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            height: "89px",
            gap: "16px",
          }}
        >
          <Box
            sx={{
              height: "40px",
              gap: "8px",
              paddingBottom: "8px",
            }}
          >
            {/* Amount Selection */}
            <Box sx={{ width: "100%", paddingTop: "8px" }}>
              <Box sx={{ display: "flex", gap: "6px" }}>
                {[10, 20, 50, 100].map((amount) => (
                  <Button
                    key={amount}
                    variant="outlined"
                    sx={{
                      borderRadius: "20px",
                      width: "64px",
                      padding: "2px 12px",
                      border:
                        amount !== redeemAmount ? "1px dashed #7e57c2" : "none",
                      bgcolor:
                        amount === redeemAmount ? "#7e57c2" : "transparent",
                      color: amount === redeemAmount ? "white" : "black",
                      ":hover": {
                        border: "none",
                        bgcolor: "#7e57c2",
                        color: "white",
                      },
                    }}
                    onClick={() => setRedeemAmount(amount)}
                  >
                    {amount}
                  </Button>
                ))}
              </Box>
            </Box>
          </Box>

          {isTransactionNoteVisible && (
            <>
              <Box sx={{ borderBottom: "1px solid #e0e0e0", my: 1 }} />
              <Box sx={{ mt: 1, mb: 1 }}>
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
              <Box sx={{ borderBottom: "1px solid #e0e0e0", my: 1 }} />
            </>
          )}
          <Box sx={{ borderBottom: "1px solid #e0e0e0", my: 1, mb: 1 }} />
          <Box
            sx={{
              height: "48px",
              display: "flex", // Ensure flex container for proper alignment
              justifyContent: "space-between",
              alignItems: "center", // Align items vertically
              paddingTop: "8px",
              paddingBottom: "4px",
            }}
          >
            {/* Redeem Action */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <img src={AOG_Symbol} alt="AOG Symbol" width={16} height={16} />
              <Typography sx={{ fontSize: "16px", fontWeight: 600 }}>
                {redeemAmount}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <IconButton
                onClick={() =>
                  setIsTransactionNoteVisible(!isTransactionNoteVisible)
                }
                sx={{ mr: 1 }}
              >
                <img
                  src={Docs}
                  alt="Docs Icon"
                  style={{ width: "24px", height: "24px" }}
                />
              </IconButton>
              <Button
                variant="outlined"
                sx={{
                  border: "1px solid #D9DCE1",
                  borderRadius: "6px",
                  fontSize: "14px",
                  fontWeight: "bold",
                  textTransform: "none",
                  padding: "6px 16px",
                  bgcolor:"#F8FBFF",
                  ":hover":{
                    bgcolor:"#F8FBFF"
                  }
                }}
                onClick={() => handleConfirm()}
              >
                {!isMobile && "REDEEM"} REQUEST
              </Button>
            </Box>
          </Box>
          <Box
            sx={{
              paddingLeft: "2px", // Small left padding for alignment
            }}
          >
            <Typography
              sx={{
                fontFamily: "Inter",
                fontWeight: 500,
                fontSize: "14px",
                color: "#4D4D4D",
              }}
            >
              Redeem Service Fee @ {redeemFees}%
              <Box sx={{ borderBottom: "1px solid #e0e0e0", my: 1, mb: 1 }} />
            </Typography>
            <TransactionRecords
              totalTransactions={totalData}
              transactionData={data}
              redirectUrl={"redeemRecords"}
            />
          </Box>
        </Box>
      </Box>
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
