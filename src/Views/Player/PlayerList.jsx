import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Collapse,
  Stack,
  Button,
  Divider,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import WalletIcon from "../../Assets/icons/WalletIcon.svg";
import MoneyReceiveWhite from "../../Assets/icons/money-recive-light.svg";
import MoneyReceiveBlack from "../../Assets/icons/money-recive-dark.svg";
import MoneySendWhite from "../../Assets/icons/money-send-light.svg";
import MoneySendBlack from "../../Assets/icons/money-send-dark.svg";
import AOG_Symbol from "../../Assets/icons/AOGsymbol.png";
import { WalletDetails } from "./dialog/WalletDetails";
import { walletService } from "../../Provider/WalletManagement";
import useDeviceType from "../../Utils/Hooks/useDeviceType";
import { Loader } from "../Loader";
import { useNavigate } from "react-router-dom";
import Recharge from "./Recharge";
import Redeem from "./Redeem";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import { dataProvider } from "../../Provider/parseDataProvider";

export const PlayerList = () => {
  const { isMobile } = useDeviceType();
  const [balance, setBalance] = useState();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState("recharge");
  const role = localStorage.getItem("role");
  const navigate = useNavigate();
  const [rechargeTransactionData, setRechargeTransactionData] = useState([]);
  const [totalRechargeData, setTotalRechargeData] = useState(0);
  const [redeemTransactionData, setRedeemTransactionData] = useState([]);
  const [totalRedeemData, setTotalRedeemData] = useState(0);
  const [ walletData, setWalletData ] = useState([]);

  useEffect(() => {
    WalletService();
    rechargeData();
    redeemData();
  }, []);

  if (!role) {
    navigate("/login");
  }

  async function WalletService() {
    setLoading(true);
    try {
      const wallet = await walletService.getMyWalletData();
      console.log(wallet.wallet);
      setWalletData(wallet.wallet);
      setBalance(wallet.wallet.balance);
    } catch (error) {
      console.error("Failed to fetch wallet data:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleToggleDropdown = () => {
    setDropdownOpen((prevState) => !prevState);
  };

  const rechargeConvertTransactions = (transactions) => {
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
  };

  const redeemConvertTransactions = (transactions) => {
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
          case 9:
          case 13:
            return "red";
          case 6:
          case 11:
            return "#F59E0B";
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
        11: "In-Progress",
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



  const rechargeData = async () => {
    setLoading(true);
    try {
      console.log("Fetching recharge records...");
      const { data, total } = await dataProvider.getList("rechargeRecords", {
        pagination: { page: 1, perPage: 10 },
        sort: { field: "id", order: "DESC" },
      });
      console.log("Data from rechargeRecords:", data);
      const rechargeResponse = rechargeConvertTransactions(data);
      if (rechargeData) {
        setRechargeTransactionData(rechargeResponse);
        setTotalRechargeData(total);
      } else {
        setRechargeTransactionData([]);
        setTotalRechargeData(0);
      }
    } catch (error) {
      console.error("Error fetching data for export:", error);
      return [];
    } finally {
      setLoading(false);
    }
  };
  const redeemData = async () => {
    setLoading(true);
    try {
      console.log("Fetching redeem records...");
      const { data, total } = await dataProvider.getList("redeemRecords", {
        pagination: { page: 1, perPage: 10 },
        sort: { field: "id", order: "DESC" },
      });
      console.log("Data from redeemRecords:", data);
      const redeemResponse = redeemConvertTransactions(data);
      if (redeemData) {
        setRedeemTransactionData(redeemResponse);
        setTotalRedeemData(total);
      } else {
        setRedeemTransactionData([]);
        setTotalRedeemData(0);
      }
      // Return the fetched data
    } catch (error) {
      console.error("Error fetching data for export:", error);
      return []; // Return empty array on error
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return <Loader />;
  }
  return (
    <Box>
      <Box sx={{ width: "100%", padding: 0, margin: 0 }}>
        <Box
          sx={{
            width: "100%",
            padding: 0,
            margin: 0,
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <Box
            onClick={handleToggleDropdown}
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              width: "fit-content",
            }}
          >
            <Button
              variant="contained"
              startIcon={<CardGiftcardIcon />}
              sx={{
                mt: 2,
                fontSize: "13px",
                textTransform: "capitalize",
                background: "linear-gradient(135deg, #6D5BBA, #8D58BF)",
                boxShadow: "0 4px 14px rgba(109, 91, 186, 0.4)",
                transition: "all 0.3s ease",
                "&:hover": {
                  background: "linear-gradient(135deg, #8D58BF, #A26DD4)",
                  boxShadow: "0 6px 20px rgba(109, 91, 186, 0.5)",
                },
              }}
              onClick={() => {
                navigate("/gift-card-history");
              }}
            >
              Gift Card History
            </Button>
          </Box>
        </Box>

        {/* Wallet Balance */}
        <Paper sx={{ margin: 0, borderRadius: 0, boxShadow: "none" }}>
          {/* Make the entire header area clickable */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: 2,
              bgcolor: "#F7FDF8",
              cursor: "pointer",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "top", gap: 1 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 1,
                  borderRadius: "4px",
                  backgroundColor: "#D6F5DD",
                  height: 40,
                  width: 40,
                }}
              >
                <img
                  src={WalletIcon}
                  alt="Wallet Icon"
                  style={{
                    width: 20,
                    height: 20,
                  }}
                />
              </Box>
              <Box>
                <Typography
                  variant="body1"
                  sx={{
                    marginLeft: "4px",
                    fontWeight: 500,
                    fontSize: "20px",
                  }}
                >
                  Wallet Balance
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    marginTop: "-8px",
                  }}
                >
                  <img
                    src={AOG_Symbol}
                    alt="AOG Symbol"
                    style={{ width: 20, height: 20, marginRight: 2 }}
                  />
                  <Typography
                    sx={{
                      color: "#109E38",
                      fontWeight: "600",
                      fontFamily: "Inter",
                      fontSize: "24px",
                    }}
                  >
                    {balance}
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Button
              onClick={() => {
                navigate(`/wallet-details`);
              }}
            >
              <ArrowForwardIosIcon sx={{ fontSize: 16, color: "#888" }} />
            </Button>
          </Box>

          <Collapse in={dropdownOpen}>
            <Box sx={{ borderTop: "1px solid #e0e0e0" }}>
              <WalletDetails />
            </Box>
          </Collapse>
        </Paper>
      </Box>

      {!dropdownOpen && (
        <>
          <Box sx={{ bgcolor: "background.paper", p: 2 }}>
            <Stack
              direction="row"
              spacing={1}
              sx={{
                display: "flex",
                justifyContent: "space-around",
                padding: "4px",
                borderRadius: "8px",
                border: "1px solid #CFD4DB",
              }}
            >
              <Button
                variant={selectedTab === "recharge" ? "contained" : "text"}
                size="small"
                onClick={() => setSelectedTab("recharge")}
                sx={{
                  width: "50%",
                  height: "40px",
                  fontSize: "16px",
                  fontWeight: 400,
                  textTransform: "none",
                }}
              >
                <img
                  src={
                    selectedTab === "recharge" ? MoneySendWhite : MoneySendBlack
                  }
                  alt="Money Send Icon"
                  style={{ width: 18, height: 18, marginRight: 8 }}
                />
                Recharge
              </Button>

              <Button
                variant={selectedTab === "redeem" ? "contained" : "text"}
                size="small"
                onClick={() => setSelectedTab("redeem")}
                sx={{
                  width: "50%",
                  height: "40px",
                  fontSize: "16px",
                  fontWeight: 400,
                  textTransform: "none",
                }}
              >
                <img
                  src={
                    selectedTab === "redeem"
                      ? MoneyReceiveWhite
                      : MoneyReceiveBlack
                  }
                  alt="Money Receive Icon"
                  style={{ width: 18, height: 18, marginRight: 8 }}
                />
                Redeem
              </Button>
            </Stack>
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              width: "100%",
              justifyContent: "space-between",
            }}
          >
            {selectedTab === "recharge" && (
              <Box sx={{ width: "100%" }}>
                <Recharge
                  data={rechargeTransactionData}
                  totalData={totalRechargeData}
                />
              </Box>
            )}
            {selectedTab === "redeem" && (
              <Box sx={{ width: "100%" }}>
                <Redeem data={redeemTransactionData} totalData={totalRedeemData} wallet={walletData}/>
              </Box>
            )}
          </Box>
        </>
      )}
    </Box>
  );
};
