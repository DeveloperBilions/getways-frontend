import React, { useEffect, useState } from "react";
import { Box, Typography, IconButton, Button } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import WalletIcon from "../../Assets/icons/WalletIcon.svg";
import AOG_Symbol from "../../Assets/icons/AOGsymbol.png";
import useDeviceType from "../../Utils/Hooks/useDeviceType";
import Docs from "../../Assets/icons/Docs.svg";
import { useGetIdentity } from "react-admin";
import TransactionRecords from "./TransactionRecords";
import { dataProvider } from "../../Provider/parseDataProvider";

const Recharge = () => {
  const { isMobile } = useDeviceType();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedRechargeAmount, setSelectedRechargeAmount] = useState(50);
  const { identity } = useGetIdentity();
  const [transactionData, setTransactionData] = useState([]);
  const [totalTransactions, setTotalTransactions] = useState(0);

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
      const { data } = await dataProvider.getList("rechargeRecords", {
        pagination: { page: 1, perPage: 10 },
        sort: { field: "id", order: "DESC" },
      });
      console.log("Data from rechargeRecords:", data);
      return data; // Return the fetched data
    } catch (error) {
      console.error("Error fetching data for export:", error);
      return []; // Return empty array on error
    }
  };

  const handleToggleDropdown = async () => {
    setDropdownOpen((prevState) => !prevState);
  };

  useEffect(() => {
    const fetchData = async () => {
      const data = await rechargeData();
      const transactionData = convertTransactions(data);
      console.log(transactionData, "bhavin");

      if (data) {
        setTransactionData(transactionData);
        setTotalTransactions(data.length);
      } else {
        setTransactionData([]);
        setTotalTransactions(0);
      }
    };
    fetchData();
  }, []);

  return (
    <Box sx={{ borderBottomWidth: "1px", padding: "10px 16px" }}>
      {isMobile && (
        <Typography
          variant="body2"
          sx={{
            height: "19px",
            fontFamily: "Inter, sans-serif",
            fontWeight: 500,
            fontSize: "16px",
            color: "#4D4D4D",
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
                  amount !== selectedRechargeAmount
                    ? "1px dashed #7e57c2"
                    : "none",
                bgcolor:
                  amount === selectedRechargeAmount ? "#7e57c2" : "transparent",
                color: amount === selectedRechargeAmount ? "white" : "black",
                ":hover": {
                  border: "none",
                  bgcolor: "#7e57c2",
                  color: "white",
                },
              }}
              onClick={() => setSelectedRechargeAmount(amount)}
            >
              {amount}
            </Button>
          ))}
        </Box>

        <Box
          sx={{
            height: "56px",
            display: "flex",
            justifyContent: "space-between",
            paddingTop: "8px",
            paddingBottom: "8px",
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
                {selectedRechargeAmount}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <img
              src={Docs}
              alt="Docs Icon"
              style={{ width: "24px", height: "24px", marginRight: 8 }}
            />
            <Button
              variant="contained"
              sx={{
                width: "118px",
                height: "40px",
                padding: "8px 20px",
                borderRadius: "4px",
                backgroundColor: "#28A745",
                color: "#FFFFFF",
                "&:disabled": { backgroundColor: "#A5D6A7" },
              }}
              disabled={identity?.isBlackListed}
            >
              RECHARGE
            </Button>
          </Box>
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
            <Box sx={{ display: "flex", alignItems: "center", gap: "6.67px" }}>
              <img
                src={WalletIcon}
                alt="Wallet Icon"
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "3.33px",
                  padding: "6.67px",
                }}
              />
              <Box
                sx={{
                  height: "17px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 500,
                    fontSize: "14px",
                    lineHeight: "100%",
                    letterSpacing: "0px",
                  }}
                >
                  Wallet
                </Typography>
              </Box>
              <Button onClick={handleToggleDropdown}>
                <IconButton>
                  <ExpandMoreIcon
                    sx={{
                      transform: dropdownOpen
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
                      transition: "transform 0.3s",
                    }}
                  />
                </IconButton>
              </Button>
            </Box>
          </Box>
        </Box>
        <TransactionRecords
          totalTransactions={totalTransactions}
          transactionData={transactionData}
          redirectUrl={"rechargeRecords"}
        />
      </Box>
    </Box>
  );
};

export default Recharge;
