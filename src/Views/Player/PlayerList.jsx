import React, { useEffect, useState } from "react";
import { Box, Stack, Button } from "@mui/material";
import { walletService } from "../../Provider/WalletManagement";
import { Loader } from "../Loader";
import { useNavigate } from "react-router-dom";
import Recharge from "./Recharge";
import Redeem from "./Redeem";
import { dataProvider } from "../../Provider/parseDataProvider";
import RechargeDark from "../../Assets/icons/recharge-dark.svg";
import RechargeLight from "../../Assets/icons/recharge-light.svg";
import RedeemDark from "../../Assets/icons/redeem-dark.svg";
import RedeemLight from "../../Assets/icons/redeem-light.svg";
import WalletDark from "../../Assets/icons/wallet-dark.svg";
import WalletLight from "../../Assets/icons/wallet-light.svg";
import GiftCardDark from "../../Assets/icons/gift-card-dark.svg";
import GiftCardLight from "../../Assets/icons/gift-card-light.svg";
import { WalletDetails } from "./dialog/WalletDetails";
import GiftCardsDisplay from "./GiftCardDisplay";
import Parse from "parse";
import { useGetIdentity } from "react-admin";

Parse.initialize(
  process.env.REACT_APP_APPID,
  process.env.REACT_APP_JAVASCRIPT_KEY,
  process.env.REACT_APP_MASTER_KEY
);
Parse.serverURL = process.env.REACT_APP_URL;
Parse.masterKey = process.env.REACT_APP_MASTER_KEY;

export const PlayerList = () => {
  const { identity } = useGetIdentity();
  const [balance, setBalance] = useState();
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState("recharge");
  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("id");
  const navigate = useNavigate();
  const [rechargeTransactionData, setRechargeTransactionData] = useState([]);
  const [totalRechargeData, setTotalRechargeData] = useState(0);
  const [redeemTransactionData, setRedeemTransactionData] = useState([]);
  const [totalRedeemData, setTotalRedeemData] = useState(0);
  const [cashoutTransactionData, setCashoutTransactionData] = useState([]);
  const [totalCashoutData, setTotalCashoutData] = useState(0);
  const [giftCards, setGiftCards] = useState([]);
  const [totalGiftCard, setTotalGiftCard] = useState(0);
  const [totalAvailableGiftCard, setTotalAvailableGiftCard] = useState(0);
  const [totalExpiredGiftCard, setTotalExpiredGiftCard] = useState(0);
  const [walletData, setWalletData] = useState([]);
  const [redeemFees, setRedeemFees] = useState(0);

  useEffect(() => {
    WalletService();
    rechargeData();
    redeemData();
    cashoutData();
  }, []);

  // useEffect(() => {
    
  // }, [identity]);

  useEffect(() => {
    if (identity && identity.objectId) {
      giftCardData(identity.objectId, 0, 10);
    }
    if (identity && identity?.userParentId) {
      parentServiceFee();
    }
  }, [identity]);

  if (!role) {
    navigate("/login");
  }

  async function WalletService() {
    setLoading(true);
    try {
      const wallet = await walletService.getMyWalletData();
      setWalletData(wallet.wallet);
      setBalance(wallet.wallet.balance);
    } catch (error) {
      console.error("Failed to fetch wallet data:", error);
    } finally {
      setLoading(false);
    }
  }

  const parentServiceFee = async () => {
      try {
        const response = await Parse.Cloud.run("redeemParentServiceFee", {
          userId: identity?.userParentId,
        });
        setRedeemFees(response?.redeemService || 0);
      } catch (error) {
        console.error("Error fetching parent service fee:", error);
      }
    };

  const convertTransactions = (transactions,isRecharge) => {
    return transactions.map((txn) => {
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

      const statusMessage = {
        0: "Pending Referral Link",
        1: "Pending Confirmation",
        2: isRecharge?"Confirmed":"Recharge Successful",
        3: "Coins Credited",
        4: "Success",
        5: "Fail",
        6: "Pending Approval",
        7: "Redeem Rejected",
        8: "Redeem Successful",
        9: isRecharge?"Expired":"Redeem Expired",
        10: "Failed Transaction",
        11: "In - Progress",
        12: "Cashout Successful",
        13: "Cashout Rejected",
      };

      return {
        status: statusMessage[txn.status] || "Unknown Status",
        date: formattedDate,
        time: formattedTime,
        amount: txn.transactionAmount,
      };
    });
  };

  const rechargeData = async () => {
    setLoading(true);
    try {
      const { data, totalCount } = await dataProvider.getList("rechargeRecords", {
        pagination: { page: 1, perPage: 5 },
        sort: { field: "id", order: "DESC" },
      });
      const rechargeResponse = convertTransactions(data,true);
      if (rechargeData) {
        setRechargeTransactionData(rechargeResponse);
        setTotalRechargeData(totalCount);
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
      const { data, totalCount } = await dataProvider.getList("redeemRecords", {
        pagination: { page: 1, perPage: 5 },
        sort: { field: "id", order: "DESC" },
      });
      const redeemResponse = convertTransactions(data,false);
      if (redeemData) {
        setRedeemTransactionData(redeemResponse);
        setTotalRedeemData(totalCount);
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

  const cashoutData = async () => {
    setLoading(true);
    try {
      const response = await walletService.getCashoutTransactions({
        page: 1,
        limit: 5,
        userId: userId,
      });
      const formattedData = convertTransactions(
        response.transactions || [],false
      );
      setCashoutTransactionData(formattedData);
      setTotalCashoutData(response.pagination?.totalCount || 0);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const giftCardData = async (id, currentPage, pageSize) => {
    setLoading(true);
    try {
      const query = new Parse.Query("GiftCardHistory");
      query.equalTo("userId", id);
      query.descending("createdAt");
      query.skip(currentPage * pageSize);
      query.limit(pageSize);
      const results = await query.find({ useMasterKey: true });

      const countQuery = new Parse.Query("GiftCardHistory");
      countQuery.equalTo("userId", id);
      const total = await countQuery.count({ useMasterKey: true });
      const countAvailableQuery = new Parse.Query("GiftCardHistory");
      countAvailableQuery.equalTo("userId", id);
      countAvailableQuery.equalTo("status", "Issued");
      const totalAvailable = await countAvailableQuery.count({ useMasterKey: true });
      const countExpiredQuery = new Parse.Query("GiftCardHistory");
      countExpiredQuery.equalTo("userId", id);
      countExpiredQuery.equalTo("status", "Expired");
      const totalExpired = await countExpiredQuery.count({ useMasterKey: true });

      setGiftCards(results.map((record) => record.toJSON()));
      setTotalGiftCard(total);
      setTotalAvailableGiftCard(totalAvailable);
      setTotalExpiredGiftCard(totalExpired);
    } catch (error) {
      console.error("Error fetching gift card history:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRechargeRefresh = () => {
    rechargeData();
  };
  const handleRedeemRefresh = () => {
    redeemData();
    WalletService();
    parentServiceFee();
  };
  const handleCashoutRefresh = () => {
    cashoutData();
    WalletService();
  };

  if (loading) {
    return <Loader />;
  }
  return (
    <Box>
      <Box sx={{ mt: 2, mb: 2 }}>
        <Stack
          direction="row"
          spacing={1}
          sx={{
            display: "flex",
            justifyContent: "space-around",
            padding: "8px",
            borderRadius: "16px",
            border: "1px solid #CFD4DB",
            height: "96px",
            bgcolor: "white",
          }}
        >
          <Button
            variant={selectedTab === "recharge" ? "contained" : "text"}
            size="small"
            onClick={() => setSelectedTab("recharge")}
            sx={{
              width: "25%",
              fontSize: "16px",
              fontWeight: 400,
              textTransform: "none",
              borderRadius: "8px",
              bgcolor: selectedTab === "recharge" ? "#2E5BFF" : "none",
              ":hover": {
                bgcolor: selectedTab === "recharge" ? "#2E5BFF" : "none",
              },
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <img
              src={selectedTab === "recharge" ? RechargeLight : RechargeDark}
              alt="Recharge Icon"
              style={{ width: 18, height: 18, marginRight: 8 }}
            />
            Recharge
          </Button>

          <Button
            variant={selectedTab === "redeem" ? "contained" : "text"}
            size="small"
            onClick={() => setSelectedTab("redeem")}
            sx={{
              width: "25%",
              fontSize: "16px",
              fontWeight: 400,
              textTransform: "none",
              borderRadius: "8px",
              bgcolor: selectedTab === "redeem" ? "#2E5BFF" : "none",
              ":hover": {
                bgcolor: selectedTab === "redeem" ? "#2E5BFF" : "none",
              },
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <img
              src={selectedTab === "redeem" ? RedeemLight : RedeemDark}
              alt="Redeem Icon"
              style={{ width: 18, height: 18, marginRight: 8 }}
            />
            Redeem
          </Button>
          <Button
            variant={selectedTab === "wallet" ? "contained" : "text"}
            size="small"
            onClick={() => setSelectedTab("wallet")}
            sx={{
              width: "25%",
              fontSize: "16px",
              fontWeight: 400,
              textTransform: "none",
              borderRadius: "8px",
              bgcolor: selectedTab === "wallet" ? "#2E5BFF" : "none",
              ":hover": {
                bgcolor: selectedTab === "wallet" ? "#2E5BFF" : "none",
              },
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <img
              src={selectedTab === "wallet" ? WalletLight : WalletDark}
              alt="Wallet Icon"
              style={{ width: 18, height: 18, marginRight: 8 }}
            />
            Wallet
          </Button>
          {/* <Button
            variant={selectedTab === "giftcard" ? "contained" : "text"}
            size="small"
            onClick={() => setSelectedTab("giftcard")}
            sx={{
              width: "25%",
              fontSize: "16px",
              fontWeight: 400,
              textTransform: "none",
              borderRadius: "8px",
              bgcolor: selectedTab === "giftcard" ? "#2E5BFF" : "none",
              ":hover": {
                bgcolor: selectedTab === "giftcard" ? "#2E5BFF" : "none",
              },
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <img
              src={selectedTab === "giftcard" ? GiftCardLight : GiftCardDark}
              alt="Gift Card Icon"
              style={{ width: 18, height: 18, marginRight: 8 }}
            />
            Gift Card
          </Button> */}
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
              handleRechargeRefresh={handleRechargeRefresh}
            />
          </Box>
        )}
        {selectedTab === "redeem" && (
          <Box sx={{ width: "100%" }}>
            <Redeem
              data={redeemTransactionData}
              totalData={totalRedeemData}
              wallet={walletData}
              handleRedeemRefresh={handleRedeemRefresh}
              redeemFees={redeemFees}
            />
          </Box>
        )}
        {selectedTab === "wallet" && (
          <Box sx={{ width: "100%" }}>
            <WalletDetails
              transactionData={cashoutTransactionData}
              totalTransactions={totalCashoutData}
              handleCashoutRefresh={handleCashoutRefresh}
              wallet={walletData}
              balance={balance}
            />
          </Box>
        )}
        {selectedTab === "giftcard" && (
          <Box sx={{ width: "100%" }}>
            <GiftCardsDisplay 
              giftCards={giftCards} 
              totalGiftCard={totalGiftCard}
              totalAvailableGiftCard={totalAvailableGiftCard}
              totalExpiredGiftCard={totalExpiredGiftCard}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
};
