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
import useDeviceType from "../../Utils/Hooks/useDeviceType";
import Docs from "../../Assets/icons/Docs.svg";
import TransactionRecords from "./TransactionRecords";
import { dataProvider } from "../../Provider/parseDataProvider";
import { useGetIdentity, useNotify, useRefresh } from "react-admin";
import RechargeDialog from "../RechargeRecords/dialog/RechargeDialog";
import { checkActiveRechargeLimit } from "../../Utils/utils";
import { Parse } from "parse";

Parse.initialize(process.env.REACT_APP_APPID, process.env.REACT_APP_MASTER_KEY);
Parse.serverURL = process.env.REACT_APP_URL;

const Recharge = () => {
  const { isMobile } = useDeviceType();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState(50);
  const { identity } = useGetIdentity();
  const [transactionData, setTransactionData] = useState([]);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [rechargeDialogOpen, setRechargeDialogOpen] = useState(false);
  const refresh = useRefresh();
  //   const [errorMessage, setErrorMessage] = useState("");
  const [redeemFees, setRedeemFees] = useState(0);
  const [loading, setLoading] = useState(false);

  const notify = useNotify(); // React-Admin's notification hook
  const [remark, setRemark] = useState("");
  const [paymentSource, setPaymentSource] = useState("wallet");
  const [walletBalance, setWalletBalance] = useState(0);
  const [isTransactionNoteVisible, setIsTransactionNoteVisible] =
    useState(false);

  const [expanded, setExpanded] = useState(false);
  const [displayMethod, setDisplayMethod] = useState("Wallet");

  function convertTransactions(transactions) {
    const formattedData = {};

    transactions.forEach((txn) => {
      const dateObj = new Date(txn.transactionDate);
      const formattedDate = dateObj.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });

      const formattedTime = dateObj.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });

      const getColor = (status) => {
        switch (status) {
          case 3:
            return "#22C55E";
          case 2:
            return "#22C55E";
          case 1:
            return "#F59E0B";
          case 0:
            return "#F59E0B";
          case 9:
            return "Red";
          case 10:
            return "Red";
          default:
            return "default";
        }
      };

      const statusMessage = {
        0: "Pending Referral Link",
        1: "Pending Confirmation",
        2: "Confirmed",
        3: "Coins Credited",
        9: "Expired",
        10: "Failed Transaction",
      };

      const transactionItem = {
        type: statusMessage[txn.status] || "Unknown Status",
        time: formattedTime,
        // tag: "D",
        amount: txn.transactionAmount,
        color: getColor(txn.status),
      };

      if (!formattedData[formattedDate]) {
        formattedData[formattedDate] = {
          date: formattedDate,
          items: [],
        };
      }

      formattedData[formattedDate].items.push(transactionItem);
    });

    return Object.values(formattedData);
  }

  const rechargeData = async () => {
    try {
      console.log("Fetching recharge records...");
      const { data, total } = await dataProvider.getList("rechargeRecords", {
        pagination: { page: 1, perPage: 10 },
        sort: { field: "id", order: "DESC" },
      });
      console.log("Data from rechargeRecords:", data);
      return {data, total};
    } catch (error) {
      console.error("Error fetching data for export:", error);
      return [];
    }
  };

  const handleToggleDropdown = async () => {
    setDropdownOpen((prevState) => !prevState);
  };

  useEffect(() => {
    const fetchData = async () => {
      const data = await rechargeData();
      const transactionData = convertTransactions(data.data);
      console.log(data, "bhavin");

      if (data) {
        setTransactionData(transactionData);
        setTotalTransactions(data.total);
      } else {
        setTransactionData([]);
        setTotalTransactions(0);
      }
    };
    fetchData();
  }, []);

  const handlePaymentMethodChange = (event) => {
    setPaymentSource(event.target.value);
    // Update the header display based on selected payment method
    if (event.target.value === "wallet") {
      setDisplayMethod("Wallet");
    } else if (event.target.value === "paymentportal") {
      setDisplayMethod("Payment Portal");
    }
  };

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  useEffect(() => {
    const fetchWalletBalance = async () => {
      try {
        const walletQuery = new Parse.Query("Wallet");
        walletQuery.equalTo("userID", identity.objectId);
        const wallet = await walletQuery.first();
        if (wallet) {
          setWalletBalance(wallet.get("balance") || 0);
        }
      } catch (error) {
        console.error("Error fetching wallet balance:", error);
      }
    };

    if (identity) {
      fetchWalletBalance();
      parentServiceFee();
    } else {
      resetFields();
    }
  }, [identity]);

  const transformedIdentity = {
    id: identity?.objectId,
    ...identity,
  };

  const handleRefresh = async () => {
    refresh();
  };

  const resetFields = () => {
    setRechargeAmount("");
    setRemark("");
    setPaymentSource("stripe");
    // setErrorMessage(""); // Reset error message
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

  const handleSubmit = async (event) => {
    event.preventDefault();

    // setErrorMessage(""); // Clear previous errors

    if (parseFloat(rechargeAmount) < redeemFees) {
      //   setErrorMessage(
      //     `Recharge amount must be at least $${redeemFees.toFixed(2)}.`
      //   );
      notify(`Recharge amount must be at least $${redeemFees.toFixed(2)}.`, {
        type: "warning",
      });
      return;
    }

    const transactionCheck = await checkActiveRechargeLimit(
      identity.userParentId,
      rechargeAmount
    );
    if (!transactionCheck.success) {
      //   setErrorMessage(transactionCheck.message); // Show error if the limit is exceeded
      notify(transactionCheck.message, { type: "warning" });
      return;
    }

    if (paymentSource === "wallet") {
      // Ensure wallet balance is sufficient
      if (parseFloat(rechargeAmount) > walletBalance) {
        // setErrorMessage("Insufficient wallet balance."); // Set error message
        notify("Insufficient wallet balance.", { type: "warning" });
        return;
      }

      const rawData = {
        id: identity.objectId,
        type: "recharge",
        username: identity.username,
        transactionAmount: rechargeAmount * 100,
        remark,
        balance: walletBalance,
        useWallet: true,
      };

      setLoading(true);
      try {
        const response = await dataProvider.userTransaction(rawData);
        if (response?.success) {
          // Display success message using useNotify
          notify("Recharge successful!", { type: "success" });
          handleRefresh();
          resetFields();
        } else {
          //   setErrorMessage(
          //     response?.message || "Recharge failed. Please try again."
          //   );
          notify(response?.message || "Recharge failed. Please try again.", {
            type: "warning",
          });
        }
      } catch (error) {
        console.error("Error processing wallet recharge:", error);
        // setErrorMessage("An unexpected error occurred. Please try again.");
        notify("An unexpected error occurred. Please try again.", {
          type: "warning",
        });
      } finally {
        setLoading(false);
      }
    } else if (paymentSource === "stripe") {
      const amount = parseFloat(rechargeAmount);

      if (paymentSource === "stripe" && amount < 10) {
        // setErrorMessage("Non-Wallet transaction must be at least $10.");
        notify("Non-Wallet transaction must be at least $10.", {
          type: "warning",
        });
        return;
      }
      const rawData = {
        id: identity.objectId,
        type: "recharge",
        username: identity.username,
        transactionAmount: rechargeAmount * 100,
        remark,
      };

      setLoading(true);
      try {
        const response = await dataProvider.userTransaction(rawData);
        if (response?.success) {
          const paymentUrl = response?.apiResponse?.url;
          if (paymentUrl) {
            window.open(paymentUrl, "_blank");
          } else {
            // setErrorMessage("Payment URL is missing. Please try again.");
            notify("Payment URL is missing. Please try again.", {
              type: "warning",
            });
          }
        } else {
          //   setErrorMessage(
          //     response?.message || "Stripe recharge failed. Please try again."
          //   );
          notify(
            response?.message || "Stripe recharge failed. Please try again.",
            { type: "warning" }
          );
        }
        handleRefresh();
        resetFields();
      } catch (error) {
        console.error("Error processing Stripe payment:", error);
        // setErrorMessage("An unexpected error occurred. Please try again.");
        notify("An unexpected error occurred. Please try again.", {
          type: "warning",
        });
      } finally {
        setLoading(false);
      }
    }
  };

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
              // mt: "8px",
              mb: "8px",
            }}
          >
            Seamless Recharge: Add Funds Instantly
          </Typography>
        )}
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
                    amount !== rechargeAmount ? "1px dashed #7e57c2" : "none",
                  bgcolor:
                    amount === rechargeAmount ? "#7e57c2" : "transparent",
                  color: amount === rechargeAmount ? "white" : "black",
                  ":hover": {
                    border: "none",
                    bgcolor: "#7e57c2",
                    color: "white",
                  },
                }}
                onClick={() => setRechargeAmount(amount)}
              >
                {amount}
              </Button>
            ))}
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

          
        </Box>

        <Box sx={{ height: "52px", gap: "8px", padding: "8px 0" }}>
          <Box
            sx={{
              height: "36px",
              display: "flex",
              justifyContent: "space-between",
              padding: "8px 0",
            }}
          >
            <Box
            sx={{
              height: "40px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingTop: "8px",
              paddingRight: "24px",
              paddingBottom: "8px",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <img
                src={AOG_Symbol}
                alt="AOG Symbol"
                style={{ width: "16px", height: "16px" }}
              />
              <Typography
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 600,
                  fontSize: "18px",
                  lineHeight: "100%",
                  letterSpacing: "0px",
                  color: "#000000",
                }}
              >
                {rechargeAmount}
              </Typography>
            </Box>
          </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
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
                variant="contained"
                sx={{
                  width: "118px",
                  height: "40px",
                  gap: "24px",
                  paddingTop: "8px",
                  paddingRight: "20px",
                  paddingBottom: "8px",
                  paddingLeft: "20px",
                  borderRadius: "4px",
                  backgroundColor: "#28A745",
                  color: "#FFFFFF",
                  "&:disabled": {
                    backgroundColor: "#A5D6A7", // Optional: Lighter green for disabled state
                  },
                }}
                disabled={identity?.isBlackListed || loading}
                onClick={() => {
                  if (!identity?.isBlackListed) {
                    setRechargeDialogOpen(true);
                  }
                }}
              >
                RECHARGE
              </Button>
            </Box>
          </Box>

          {/* Wallet Selection Header */}
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
                  bgcolor: paymentSource === "wallet" ? "#D6F5DD" : "#f5f5f5",
                  width: "24px",
                  height: "24px",
                  borderRadius: "4px",
                  mr: 1,
                }}
              >
                <img
                  src={paymentSource === "wallet" ? WalletIcon : Docs}
                  alt="Payment Method Icon"
                  style={{ width: "14px", height: "14px" }}
                />
              </Box>
              <Typography sx={{ fontWeight: 500 }}>{displayMethod}</Typography>
            </Box>
            <IconButton>
              <ExpandMoreIcon
                sx={{
                  transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.3s",
                }}
              />
            </IconButton>
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
                        color: "#7e57c2",
                        "&.Mui-checked": { color: "#7e57c2" },
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
                          bgcolor:
                            paymentSource === "wallet" ? "#D6F5DD" : "#f5f5f5",
                          width: "24px",
                          height: "24px",
                          borderRadius: "4px",
                          mr: 1,
                        }}
                      >
                        <img
                          src={paymentSource === "wallet" ? WalletIcon : Docs}
                          alt="Payment Method Icon"
                          style={{ width: "14px", height: "14px" }}
                        />
                      </Box>
                      <Typography>Wallet</Typography>
                    </Box>
                  }
                />
                <FormControlLabel
                  value="paymentportal"
                  control={
                    <Radio
                      sx={{
                        color: "#7e57c2",
                        "&.Mui-checked": { color: "#7e57c2" },
                      }}
                    />
                  }
                  label={
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <img
                        src={Docs}
                        alt="PayPal Icon"
                        style={{
                          width: "20px",
                          height: "20px",
                          marginRight: "8px",
                        }}
                      />
                      <Typography>Payment Protal</Typography>
                    </Box>
                  }
                />
              </RadioGroup>
            </Box>
          )}
        <TransactionRecords
          totalTransactions={totalTransactions}
          transactionData={transactionData}
          redirectUrl={"rechargeRecords"}
        />
        </Box>
      </Box>
      <RechargeDialog
        open={rechargeDialogOpen}
        onClose={() => setRechargeDialogOpen(false)}
        handleRefresh={handleRefresh}
      />
    </>
  );
};

export default Recharge;
