import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Divider,
  RadioGroup,
  FormControlLabel,
  Radio,
  CardContent,
  Stack,
  IconButton,
  TextField,
} from "@mui/material";
import AOG_Symbol from "../../../Assets/icons/AOGsymbol.png";
import Docs from "../../../Assets/icons/Docs.svg";
import CashAppLogo from "../../../Assets/icons/cashapp_logo.svg";
import PayPalLogo from "../../../Assets/icons/paypal_logo.svg";
import VenmoLogo from "../../../Assets/icons/venmo_logo.svg";
import ZelleLogo from "../../../Assets/icons/zelle_logo.svg";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { walletService } from "../../../Provider/WalletManagement";
import { useGetIdentity, useNotify, useRefresh } from "react-admin";
import AddPaymentMethods from "./AddPayementMethods";
import CashOutDialog from "./CashOutDialog";
import { useNavigate } from "react-router-dom";
import { Card } from "reactstrap";
import MoneyReceiveWhite from "../../../Assets/icons/money-recive-light.svg";
import WalletIconBlack from "../../../Assets/icons/WalletIcon_black.svg";
import TransactionRecords from "../TransactionRecords";
import { Loader } from "../../Loader";
import { Parse } from "parse";
Parse.initialize(process.env.REACT_APP_APPID, process.env.REACT_APP_MASTER_KEY);
Parse.serverURL = process.env.REACT_APP_URL;

export const WalletDetails = () => {
  // Sample transaction data
  const [emailDropdownOpen, setEmailDropdownOpen] = useState(false);
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
  const notify = useNotify();
  const [userName, setUserName] = useState(localStorage.getItem("username"));
  const [redeemFees, setRedeemFees] = useState(0);
  const [isTransactionNoteVisible, setIsTransactionNoteVisible] =
    useState(false);
  const [remark, setRemark] = useState("");
  const [isPaymentMethodVisible, setIsPaymentMethodVisible] = useState(true);
  const [loading, setLoading] = useState(false);
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

  const fetchPaymentMethods = async () => {
    setLoading(true);
    const query = new Parse.Query("PaymentMethods");
    const paymentMethodsRecord = await query.first();
    if (paymentMethodsRecord) {
      setPaymentMethods((prev) => ({
        ...prev,
        isCashAppDisabled:
          paymentMethodsRecord.get("isCashAppDisabled") || false,
        isPaypalDisabled: paymentMethodsRecord.get("isPaypalDisabled") || false,
        isVenmoDisabled: paymentMethodsRecord.get("isVenmoDisabled") || false,
        isZelleDisabled: paymentMethodsRecord.get("isZelleDisabled") || false,
        isVirtualCardIdDisabled:
          paymentMethodsRecord.get("isVirtualCardIdDisabled") || false,
      }));
    }
    setLoading(false);
  };

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
      console.log(paymentMethods.isCashAppDisabled);
      console.log(isPaymentMethodVisible, "first");
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
        console.log(isPaymentMethodVisible, "last");
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

  const handleSubmit = async () => {
    const { cashAppId, paypalId, venmoId, zelleId } = paymentMethods;

    if (!cashAppId && !paypalId && !venmoId && !zelleId) {
      notify("Refund cannot be processed without a payment mode.", {
        type: "error",
      });
      return;
    }

    if (!cashoutAmount) {
      notify("Cashout amount cannot be empty. Please enter a valid amount.", {
        type: "error",
      });
      return;
    }

    if (cashoutAmount <= 0) {
      notify(
        "Cashout amount cannot be negative or 0. Please enter a valid amount.",
        { type: "error" }
      );
      return;
    }
    if (cashoutAmount < 15) {
      notify("Cashout request should not be less than $15.", { type: "error" });
      return;
    }
    const rawData = {
      redeemServiceFee: redeemFees,
      transactionAmount: cashoutAmount,
      remark,
      type: "redeem",
      walletId: wallet?.objectId,
      username: userName,
      id: userId,
      isCashOut: true,
      paymentMode: paymentMethod,
      paymentMethodType: paymentMethod,
    };
    console.log(rawData, "rowData");

    setLoading(true);

    try {
      const response = await Parse.Cloud.run("playerRedeemRedords", rawData);
      if (response?.status === "error") {
        notify(response?.message);
      } else {
        notify("Cashout request submitted successfully.", { type: "success" });
        setCashoutAmount(50);
        setRemark("");
        handleRefresh();
        fetchTransactions();
      }
    } catch (error) {
      console.error("Error Redeem Record details:", error);
    } finally {
      setLoading(false);
    }
  };

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

  const handlePaymentMethodChange = (event) => {
    setPaymentMethod(event.target.value);
    switch (event.target.value) {
      case "cashapp":
        setPaymentMethodId(wallet?.cashAppId);
        setPaymentMethodLogo(CashAppLogo);
        break;
      case "paypal":
        setPaymentMethodId(wallet?.paypalId);
        setPaymentMethodLogo(PayPalLogo);
        break;
      case "venmo":
        setPaymentMethodId(wallet?.venmoId);
        setPaymentMethodLogo(VenmoLogo);
        break;
      case "zelle":
        setPaymentMethodId(wallet?.zelleId);
        setPaymentMethodLogo(ZelleLogo);
        break;
      default:
        setPaymentMethodId(null);
        setPaymentMethodLogo(null);
    }
  };

  const toggleEmailDropdown = () => {
    setEmailDropdownOpen(!emailDropdownOpen);
  };

  const handlePaymentMethodBgColor = (method) => {
    if (method === "paypal") {
      return "#CFE6F2";
    } else if (method === "venmo") {
      return "#CCE8FF";
    } else if (method === "zelle") {
      return "#E3D2F9";
    } else {
      return "transparent";
    }
  };

  return (
    <React.Fragment>
      <Box sx={{ padding: 0, bgcolor: "#F7FDF8" }}>
        {/* Header */}
        <Box sx={{ padding: "16px 20px" }}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 500, fontSize: "16px", color: "#333" }}
          >
            Your Winnings: Cash Out Easily
          </Typography>

          {/* Amount options */}
          {/* <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
            {[10, 20, 50, 100].map((amount) => (
              <Box
                key={amount}
                sx={{
                  borderRadius: "20px",
                  width: "64px",
                  padding: "2px 12px",
                  border: "1px dashed #ccc",
                  fontSize: "14px",
                  color: "#333",
                }}
                
              >
                {amount}
              </Box>
            ))}
          </Box> */}
          <Box sx={{ display: "flex", gap: "6px", mt: 2 }}>
            {[10, 20, 50, 100].map((amount) => (
              <Button
                key={amount}
                variant="outlined"
                sx={{
                  borderRadius: "20px",
                  width: "64px",
                  padding: "2px 12px",
                  border:
                    amount !== cashoutAmount ? "1px dashed #7e57c2" : "none",
                  bgcolor: amount === cashoutAmount ? "#7e57c2" : "transparent",
                  color: amount === cashoutAmount ? "white" : "black",
                  ":hover": {
                    border: "none",
                    bgcolor: "#7e57c2",
                    color: "white",
                  },
                }}
                onClick={() => setCashoutAmount(amount)}
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
          <Divider sx={{ mt: 1 }} />
          {/* Current balance */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mt: 1,
              mb: 1,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <img
                src={AOG_Symbol}
                alt="AOG"
                style={{ width: "18px", marginRight: "8px" }}
              />
              <Typography
                component="span"
                sx={{ fontSize: "18px", fontWeight: 500 }}
              >
                {cashoutAmount}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 2 }}>
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
                sx={{
                  bgcolor: "#F8FBFF",
                  color: "black",
                  padding: "4px 12px",
                  border: "1px solid #D9DCE1",
                  borderRadius: "4px",
                  fontWeight: 700,
                  height: "40px",
                }}
                onClick={handleSubmit}
                disabled={identity?.isBlackListed || !isPaymentMethodVisible}
              >
                CASHOUT
              </Button>
            </Box>
          </Box>
          <Divider />
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mt: 1,
              cursor: "pointer",
              py: 1,
            }}
            onClick={toggleEmailDropdown}
          >
            {isPaymentMethodVisible ? (
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box
                  sx={{
                    bgcolor: handlePaymentMethodBgColor(paymentMethod),
                    color: "white",
                    borderRadius: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    mr: 1,
                    width: 20,
                    height: 20,
                  }}
                >
                  <img
                    src={paymentMethodLogo}
                    alt="PaymentMethod"
                    style={{
                      width: 20,
                      height: 20,
                    }}
                  />
                </Box>
                {paymentMethodId ? (
                  <Typography sx={{ fontSize: "14px" }}>
                    {paymentMethodId}
                  </Typography>
                ) : (
                  <Typography sx={{ fontSize: "14px" }}>-</Typography>
                )}
              </Box>
            ) : (
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography sx={{ fontSize: "14px", color: "red" }}>
                  Payment mode is currently not available
                </Typography>
              </Box>
            )}
            {emailDropdownOpen ? (
              <KeyboardArrowUpIcon sx={{ fontSize: 16, color: "black" }} />
            ) : (
              <KeyboardArrowDownIcon sx={{ fontSize: 16, color: "black" }} />
            )}
          </Box>

          {/* Payment method dropdown content */}
          {emailDropdownOpen && (
            <Box sx={{ mt: 1, mb: 2, pl: 2 }}>
              <Typography sx={{ fontSize: "14px", color: "#666", mb: 1 }}>
                Change/Add/Edit payment method
              </Typography>

              <RadioGroup
                value={paymentMethod}
                onChange={handlePaymentMethodChange}
              >
                <FormControlLabel
                  value="cashapp"
                  control={
                    <Radio
                      size="small"
                      disabled={
                        paymentMethods.isCashAppDisabled ||
                        (wallet?.cashAppId ? false : true)
                      }
                    />
                  }
                  label={
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Box
                        sx={{
                          mr: 1,
                        }}
                      >
                        <img
                          src={CashAppLogo}
                          alt="CashApp"
                          style={{ width: 20 }}
                        />
                      </Box>
                      {wallet?.cashAppId ? (
                        <Typography sx={{ fontSize: "14px" }}>
                          {wallet?.cashAppId}
                        </Typography>
                      ) : (
                        <Typography sx={{ fontSize: "14px" }}>-</Typography>
                      )}
                    </Box>
                  }
                />

                <FormControlLabel
                  value="paypal"
                  control={
                    <Radio
                      size="small"
                      disabled={
                        paymentMethods.isPaypalDisabled ||
                        (wallet?.paypalId ? false : true)
                      }
                    />
                  }
                  label={
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Box
                        sx={{
                          bgcolor: "#CFE6F2",
                          color: "white",
                          width: 20,
                          height: 20,
                          borderRadius: "4px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "12px",
                          mr: 1,
                        }}
                      >
                        <img
                          src={PayPalLogo}
                          alt="PayPal"
                          style={{ width: 16 }}
                        />
                      </Box>
                      {wallet?.paypalId ? (
                        <Typography sx={{ fontSize: "14px" }}>
                          {wallet?.paypalId}
                        </Typography>
                      ) : (
                        <Typography sx={{ fontSize: "14px" }}>-</Typography>
                      )}
                    </Box>
                  }
                />

                <FormControlLabel
                  value="venmo"
                  control={
                    <Radio
                      size="small"
                      disabled={
                        paymentMethods.isVenmoDisabled ||
                        (wallet?.venmoId ? false : true)
                      }
                    />
                  }
                  label={
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Box
                        sx={{
                          bgcolor: "#CCE8FF",
                          color: "white",
                          width: 20,
                          height: 20,
                          borderRadius: "4px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "12px",
                          mr: 1,
                        }}
                      >
                        <img
                          src={VenmoLogo}
                          alt="Venmo"
                          style={{ width: 16 }}
                        />
                      </Box>
                      {wallet?.venmoId ? (
                        <Typography sx={{ fontSize: "14px" }}>
                          {wallet?.venmoId}
                        </Typography>
                      ) : (
                        <Typography sx={{ fontSize: "14px" }}>-</Typography>
                      )}
                    </Box>
                  }
                />

                <FormControlLabel
                  value="zelle"
                  control={
                    <Radio
                      size="small"
                      disabled={
                        paymentMethods.isZelleDisabled ||
                        (wallet?.zelleId ? false : true)
                      }
                    />
                  }
                  label={
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Box
                        sx={{
                          bgcolor: "#E3D2F9",
                          color: "white",
                          width: 20,
                          height: 20,
                          borderRadius: "4px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "12px",
                          mr: 1,
                        }}
                      >
                        <img
                          src={ZelleLogo}
                          alt="Zelle"
                          style={{ width: 16 }}
                        />
                      </Box>
                      {wallet?.zelleId ? (
                        <Typography sx={{ fontSize: "14px" }}>
                          {wallet?.zelleId}
                        </Typography>
                      ) : (
                        <Typography sx={{ fontSize: "14px" }}>-</Typography>
                      )}
                    </Box>
                  }
                />
              </RadioGroup>

              <Button
                fullWidth
                sx={{
                  bgcolor: "#6F42C1",
                  color: "white",
                  mt: 2,
                  py: 1,
                  ":hover": {
                    bgcolor: "#6F42C1",
                  },
                }}
                onClick={() => {
                  if (!identity?.isBlackListed) {
                    setPaymentDialogOpen(true);
                  }
                }}
                disabled={identity?.isBlackListed}
              >
                ADD/EDIT PAYMENT METHOD
              </Button>
            </Box>
          )}
        </Box>
        <TransactionRecords
          totalTransactions={totalTransactions}
          transactionData={transactionData}
          redirectUrl={"wallet"}
        />
      </Box>
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
