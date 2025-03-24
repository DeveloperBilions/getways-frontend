import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Divider,
  // RadioGroup,
  // FormControlLabel,
  // Radio,
  // CardContent,
  // Stack,
  // IconButton,
  TextField,
  Paper,
} from "@mui/material";
import AOG_Symbol from "../../../Assets/icons/AOGsymbol.png";
// import Docs from "../../../Assets/icons/Docs.svg";
import CashAppLogo from "../../../Assets/icons/cashapp_logo.svg";
import PayPalLogo from "../../../Assets/icons/paypal_logo.svg";
import VenmoLogo from "../../../Assets/icons/venmo_logo.svg";
import ZelleLogo from "../../../Assets/icons/zelle_logo.svg";
// import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
// import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { walletService } from "../../../Provider/WalletManagement";
import { useGetIdentity, useNotify, useRefresh } from "react-admin";
import AddPaymentMethods from "./AddPayementMethods";
import CashOutDialog from "./CashOutDialog";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import WalletIcon from "../../../Assets/icons/WalletIcon.svg";
// import { Card } from "reactstrap";
// import MoneyReceiveWhite from "../../../Assets/icons/money-recive-light.svg";
// import WalletIconBlack from "../../../Assets/icons/WalletIcon_black.svg";
import TransactionRecords from "../TransactionRecords";
import { Loader } from "../../Loader";
import { Parse } from "parse";
import CashOutModal from "./CashOutDialogCopy";
Parse.initialize(process.env.REACT_APP_APPID, process.env.REACT_APP_MASTER_KEY);
Parse.serverURL = process.env.REACT_APP_URL;

export const WalletDetails = () => {
  // Sample transaction data
  // const [emailDropdownOpen, setEmailDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState();
  const [paymentMethodId, setPaymentMethodId] = useState();
  const [paymentMethodLogo, setPaymentMethodLogo] = useState();
  const [wallet, setWallet] = useState({});
  const { identity } = useGetIdentity();
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const refresh = useRefresh();
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [cashOutDialogOpen, setcashOutDialogOpen] = useState(false);
  const [transactionData, setTransactionData] = useState([]);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [cashoutAmount, setCashoutAmount] = useState(50);
  const [isOpen, setIsOpen] = useState(false);
  // const notify = useNotify();
  // const [userName, setUserName] = useState(localStorage.getItem("username"));
  // const [redeemFees, setRedeemFees] = useState(0);
  const [isTransactionNoteVisible, setIsTransactionNoteVisible] =
    useState(false);
  const [remark, setRemark] = useState("");
  const [isPaymentMethodVisible, setIsPaymentMethodVisible] = useState(true);
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState();
  const [paymentMethods, setPaymentMethods] = useState({
    cashAppId: "",
    paypalId: "",
    venmoId: "",
    zelleId: "",
    isCashAppDisabled: false,
    isPaypalDisabled: false,
    isVenmoDisabled: false,
    isZelleDisabled: false,
  });

  const transformedIdentity = {
    id: identity?.objectId,
    ...identity,
  };

  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("id");

  useEffect(() => {
    if (!role) {
      navigate("/login");
    }
  }, [role, navigate]);

  useEffect(() => {
    fetchTransactions(page, pageSize);
  }, [page, pageSize]);

  async function fetchTransactions(page, pageSize) {
    setLoading(true);
    try {
      const response = await walletService.getCashoutTransactions({
        page,
        limit: pageSize,
        userId: userId,
      });
      setTransactions(response.transactions || []);
      setTotalTransactions(response?.pagination?.totalRecords || 0);
      const formattedData = convertTransactions(
        response.transactions.slice(0, 10) || []
      );
      setTransactionData(formattedData);
      setTotalRecords(response.pagination?.totalRecords || 0);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleRefresh = async () => {
    refresh();
    WalletService();
  };

  // const fetchPaymentMethods = async () => {
  //   setLoading(true);
  //   const query = new Parse.Query("PaymentMethods");
  //   const paymentMethodsRecord = await query.first();
  //   if (paymentMethodsRecord) {
  //     setPaymentMethods((prev) => ({
  //       ...prev,
  //       isCashAppDisabled:
  //         paymentMethodsRecord.get("isCashAppDisabled") || false,
  //       isPaypalDisabled: paymentMethodsRecord.get("isPaypalDisabled") || false,
  //       isVenmoDisabled: paymentMethodsRecord.get("isVenmoDisabled") || false,
  //       isZelleDisabled: paymentMethodsRecord.get("isZelleDisabled") || false,
  //       isVirtualCardIdDisabled:
  //         paymentMethodsRecord.get("isVirtualCardIdDisabled") || false,
  //     }));
  //   }
  //   setLoading(false);
  // };

  useEffect(() => {
    // fetchPaymentMethods();
    WalletService();
  }, []);

  if (loading) {
    return <Loader />;
  }

  async function WalletService() {
    setLoading(true);
    try {
      const query = new Parse.Query("PaymentMethods");
      const paymentMethodsRecord = await query.first();
      if (paymentMethodsRecord) {
        setPaymentMethods((prev) => ({
          ...prev,
          isCashAppDisabled:
            paymentMethodsRecord.get("isCashAppDisabled") || false,
          isPaypalDisabled:
            paymentMethodsRecord.get("isPaypalDisabled") || false,
          isVenmoDisabled: paymentMethodsRecord.get("isVenmoDisabled") || false,
          isZelleDisabled: paymentMethodsRecord.get("isZelleDisabled") || false,
          isVirtualCardIdDisabled:
            paymentMethodsRecord.get("isVirtualCardIdDisabled") || false,
        }));
      }
      const wallet = await walletService.getMyWalletData();
      const { cashAppId, paypalId, venmoId, zelleId } = wallet.wallet;
      setWallet(wallet.wallet);
      setBalance(wallet?.wallet?.balance);
      if (
        wallet?.wallet?.cashAppId &&
        !paymentMethodsRecord.get("isCashAppDisabled")
      ) {
        setPaymentMethod("cashapp");
        setPaymentMethodId(wallet?.wallet?.cashAppId);
        setPaymentMethodLogo(CashAppLogo);
        setIsPaymentMethodVisible(true);
      } else if (
        wallet?.wallet?.paypalId &&
        !paymentMethodsRecord.get("isPaypalDisabled")
      ) {
        setPaymentMethod("paypal");
        setPaymentMethodId(wallet?.wallet?.paypalId);
        setPaymentMethodLogo(PayPalLogo);
        setIsPaymentMethodVisible(true);
      } else if (
        wallet?.wallet?.venmoId &&
        !paymentMethodsRecord.get("isVenmoDisabled")
      ) {
        setPaymentMethod("venmo");
        setPaymentMethodId(wallet?.wallet?.venmoId);
        setPaymentMethodLogo(VenmoLogo);
        setIsPaymentMethodVisible(true);
      } else if (
        wallet?.wallet?.zelleId &&
        !paymentMethodsRecord.get("isZelleDisabled")
      ) {
        setPaymentMethod("zelle");
        setPaymentMethodId(wallet?.wallet?.zelleId);
        setPaymentMethodLogo(ZelleLogo);
        setIsPaymentMethodVisible(true);
      } else {
        setIsPaymentMethodVisible(false);
      }
      setPaymentMethods((prev) => ({
        ...prev,
        cashAppId,
        paypalId,
        venmoId,
        zelleId,
      }));
    } catch (error) {
      console.error("Failed to fetch wallet data:", error);
    } finally {
      setLoading(false);
    }
  }

  // const handleSubmit = async () => {
  //   const { cashAppId, paypalId, venmoId, zelleId } = paymentMethods;

  //   if (!cashAppId && !paypalId && !venmoId && !zelleId) {
  //     notify("Refund cannot be processed without a payment mode.", {
  //       type: "error",
  //     });
  //     return;
  //   }

  //   if (!cashoutAmount) {
  //     notify("Cashout amount cannot be empty. Please enter a valid amount.", {
  //       type: "error",
  //     });
  //     return;
  //   }

  //   if (cashoutAmount <= 0) {
  //     notify(
  //       "Cashout amount cannot be negative or 0. Please enter a valid amount.",
  //       { type: "error" }
  //     );
  //     return;
  //   }
  //   if (cashoutAmount < 15) {
  //     notify("Cashout request should not be less than $15.", { type: "error" });
  //     return;
  //   }
  //   const rawData = {
  //     redeemServiceFee: redeemFees,
  //     transactionAmount: cashoutAmount,
  //     remark,
  //     type: "redeem",
  //     walletId: wallet?.objectId,
  //     username: userName,
  //     id: userId,
  //     isCashOut: true,
  //     paymentMode: paymentMethod,
  //     paymentMethodType: paymentMethod,
  //   };
  //   console.log(rawData, "rowData");

  //   setLoading(true);

  //   try {
  //     const response = await Parse.Cloud.run("playerRedeemRedords", rawData);
  //     if (response?.status === "error") {
  //       notify(response?.message);
  //     } else {
  //       notify("Cashout request submitted successfully.", { type: "success" });
  //       setCashoutAmount(50);
  //       setRemark("");
  //       handleRefresh();
  //       fetchTransactions();
  //     }
  //   } catch (error) {
  //     console.error("Error Redeem Record details:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

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
          case 4:
          case 8:
          case 2:
            return "green";
          case 5:
          case 7:
          case 13:
            return "red";
          case 6:
          case 11:
            return "orange";
          case 12:
            return "green";
          default:
            return "black";
        }
      };

      const statusMessage = {
        2: "Recharge Successful",
        4: "Success",
        5: "Fail",
        6: "Pending Approval",
        7: "Redeem Rejected",
        8: "Redeem Successful",
        9: "Redeem Expired",
        11: "In - Progress",
        12: "Cashout Successful",
        13: "Cashout Rejected",
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

  // const handlePaymentMethodChange = (event) => {
  //   setPaymentMethod(event.target.value);
  //   switch (event.target.value) {
  //     case "cashapp":
  //       setPaymentMethodId(wallet?.cashAppId);
  //       setPaymentMethodLogo(CashAppLogo);
  //       break;
  //     case "paypal":
  //       setPaymentMethodId(wallet?.paypalId);
  //       setPaymentMethodLogo(PayPalLogo);
  //       break;
  //     case "venmo":
  //       setPaymentMethodId(wallet?.venmoId);
  //       setPaymentMethodLogo(VenmoLogo);
  //       break;
  //     case "zelle":
  //       setPaymentMethodId(wallet?.zelleId);
  //       setPaymentMethodLogo(ZelleLogo);
  //       break;
  //     default:
  //       setPaymentMethodId(null);
  //       setPaymentMethodLogo(null);
  //   }
  // };

  // const toggleEmailDropdown = () => {
  //   setEmailDropdownOpen(!emailDropdownOpen);
  // };

  // const handlePaymentMethodBgColor = (method) => {
  //   if (method === "paypal") {
  //     return "#CFE6F2";
  //   } else if (method === "venmo") {
  //     return "#CCE8FF";
  //   } else if (method === "zelle") {
  //     return "#E3D2F9";
  //   } else {
  //     return "transparent";
  //   }
  // };

  return (
    <React.Fragment>
      <Paper
        sx={{
          margin: 0,
          borderRadius: "8px", // Rounded corners like the image
          boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)", // Subtle shadow for depth
          border: "1px solid #E0E0E0", // Light border
        }}
      >
        {/* Top Section: Balance and Coin */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: 2,
            bgcolor: "#FFFFFF", // White background
          }}
        >
          {/* Left: Wallet Icon and Available Balance */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 1,
                borderRadius: "4px",
                backgroundColor: "#E6E6E6",
                width: "40px",
                height: "40px",
              }}
            >
              <img
                src={WalletIcon}
                alt="Wallet Icon"
                style={{
                  width: 16,
                  height: 16,
                }}
              />
            </Box>
            <Typography
              variant="body2"
              sx={{
                color: "#6B7280", // Gray color for "Available balance"
                fontSize: "18px",
                fontWeight: 400,
              }}
            >
              Available balance
            </Typography>
          </Box>

          {/* Right: Balance with Coin Icon */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <img
              src={AOG_Symbol}
              alt="AOG Symbol"
              style={{ width: 32, height: 32 }}
            />
            <Typography
              sx={{
                color: "#000000", // Black for the balance
                fontWeight: "600",
                fontFamily: "Inter",
                fontSize: "32px",
              }}
            >
              {balance}
            </Typography>
          </Box>
        </Box>
        <Box
          sx={{
            marginLeft: "16px",
            marginRight: "16px",
            height: "52px",
          }}
        >
          <Button
            sx={{
              bgcolor: "#0d6efd",
              color: "white",
              padding: "12px 16px",
              borderRadius: "8px",
              fontWeight: 500,
              fontSize: "18px",
              textTransform: "none",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              "&:hover": {
                bgcolor: "#1D4ED8",
              },
            }}
            onClick={() => {
              setIsOpen(true);
            }}
            disabled={identity?.isBlackListed || isPaymentMethodVisible}
          >
            Cashout <span style={{ marginLeft: "8px" }}>→</span>
          </Button>
        </Box>
        <Box
          sx={{
            padding: "8px 16px",
            bgcolor: "#FFFFFF",
            textAlign: "center",
            marginBottom: "16px",
          }}
        >
          <Typography
            variant="body2"
            sx={{
              fontSize: "12px",
              fontWeight: 400,
            }}
          >
            Did you know? You can use Wallet funds to do Instant Recharge? Want
            to do Recharge?
          </Typography>
        </Box>
      </Paper>
      <Box sx={{ padding: 0, bgcolor: "#F7FDF8", marginTop: "16px" }}>
        <TransactionRecords
          totalTransactions={totalTransactions}
          transactionData={transactionData}
          redirectUrl={"wallet"}
        />
      </Box>
      <CashOutModal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        balance={balance}
      />
      <CashOutDialog
        open={cashOutDialogOpen}
        onClose={() => setcashOutDialogOpen(false)}
        record={transformedIdentity}
        handleRefresh={() => {
          fetchTransactions(page, pageSize);
          WalletService();
        }}
        wallet={wallet}
      />
      <AddPaymentMethods
        wallet={wallet}
        open={paymentDialogOpen}
        onClose={() => setPaymentDialogOpen(false)}
        record={transformedIdentity}
        handleRefresh={handleRefresh}
      />
    </React.Fragment>
  );
};
