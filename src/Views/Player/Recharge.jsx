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
import { isRechargeEnabledForAgent } from "../../Utils/utils";

Parse.initialize(process.env.REACT_APP_APPID, process.env.REACT_APP_MASTER_KEY);
Parse.serverURL = process.env.REACT_APP_URL;

const Recharge = ({ data, totalData, handleRechargeRefresh }) => {
  const [rechargeAmount, setRechargeAmount] = useState(50);
  const { identity } = useGetIdentity();
  const refresh = useRefresh();
  const [RechargeDialogOpen, setRechargeDialogOpen] = useState(false);
  const [remark, setRemark] = useState("");
  const [paymentSource, setPaymentSource] = useState("stripe");
  const [isTransactionNoteVisible, setIsTransactionNoteVisible] =
    useState(false);
  const [submitKycDialogOpen, setSubmitKycDialogOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [displayMethod, setDisplayMethod] = useState("Payment Portal");
  const [showKycSuccessMsg, setShowKycSuccessMsg] = useState(false); // ✅ new
  const [rechargeDisabled, setRechargeDisabled] = useState(false);
  useEffect(() => {
    const checkRechargeAccess = async () => {
        const disabled = !(await isRechargeEnabledForAgent(identity?.userParentId));
        setRechargeDisabled(disabled);
    };
  
    checkRechargeAccess();
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

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  const handleRefresh = async () => {
    handleRechargeRefresh();
    refresh();
    resetFields();
  };
 
  useEffect(() => {
    const interval = setInterval(() => {
      handlecheck()
    
    }, 30000); // 1 minute = 60000ms
  
    return () => clearInterval(interval); // Cleanup on unmount
  }, []);
  
  const handlecheck = async () => {
    try {
      const TransfiUserInfo = Parse.Object.extend("TransfiUserInfo");
      const query = new Parse.Query(TransfiUserInfo);
      query.equalTo("userId", identity?.objectId);
      const result = await query.first({ useMasterKey: true });

      const kycStatus = result?.get("kycStatus");
      const wasJustCompleted = localStorage.getItem("kycCompletedOnce");
if (kycStatus?.trim().toLowerCase() === "kyc_success" && wasJustCompleted?.trim() === "true") {
  setShowKycSuccessMsg(true);
  localStorage.removeItem("kycCompletedOnce");
}

    } catch (err) {
      console.error("Error checking KYC after refresh:", err);
    }  
  };
  const resetFields = () => {
    setRechargeAmount(50);
    setRemark("");
    setPaymentSource("strike");
    // setErrorMessage(""); // Reset error message
  };

  const handleRechargeClick = async () => {
    if (identity?.isBlackListed) return;
  
    try {
      const TransfiUserInfo = Parse.Object.extend("TransfiUserInfo");
      const query = new Parse.Query(TransfiUserInfo);
      query.equalTo("userId", identity.objectId);
      const record = await query.first({ useMasterKey: true });
  
      if (record && record.get("kycVerified") === true) {
        setRechargeDialogOpen(true);
      } else {
        setSubmitKycDialogOpen(true);
      }
    } catch (error) {
      console.error("Error checking KYC:", error);
      setSubmitKycDialogOpen(true);
    }
  };
  
console.log(showKycSuccessMsg,"showKycSuccessMsg")
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
                    }}
                  />
                </Box>
                <Box sx={{ borderBottom: "1px solid #e0e0e0", my: 1 }} />
              </>
            )}
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
                  <img
                    src={AOG_Symbol}
                    alt="AOG Symbol"
                    style={{ width: "40px", height: "40px" }}
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
                    {rechargeAmount}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <img
                    src={Docs}
                    alt="Docs Icon"
                    style={{ width: "24px", height: "24px", cursor: "pointer" }}
                    onClick={() =>
                      setIsTransactionNoteVisible(!isTransactionNoteVisible)
                    }
                  />
                  <Typography sx={{ color: "#E7E7E7", m: "0px 12px" }}>
                    |
                  </Typography>
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
          <Box
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
            {[20, 30, 40, 50, 75, 100].map((amount) => (
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
          <Button
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
                backgroundColor: "#2E5BFF",
              },
            }}
            disabled={identity?.isBlackListed || rechargeDisabled}
            onClick={() => {
              if (!identity?.isBlackListed) {
                if(paymentSource === "stripe")
                {
                  handleRechargeClick()
                }
                else{
                  setRechargeDialogOpen(true);
                }
              }
            }}
          >
            <Typography
              sx={{ fontWeight: 500, fontSize: "18px", textTransform: "none" }}
            >
              Recharge Now
            </Typography>
            <ArrowForwardIcon
              style={{ width: "24px", height: "24px", marginLeft: "10px" }}
            />
          </Button>
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

    </>
  );
};

export default Recharge;
