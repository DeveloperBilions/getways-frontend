import React, { useEffect, useState } from "react";
import { Box, Typography, Button, Paper } from "@mui/material";
import AOG_Symbol from "../../../Assets/icons/AOGsymbol.png";
import { useGetIdentity, useRefresh } from "react-admin";
import AddPaymentMethods from "./AddPayementMethods";
import CashOutDialog from "./CashOutDialog";
import { useNavigate } from "react-router-dom";
import WalletIcon from "../../../Assets/icons/WalletIcon.svg";
import TransactionRecords from "../TransactionRecords";
import { Parse } from "parse";
import CashOutModal from "./CashOutDialogCopy";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Alert } from "@mui/material"; 
import { isCashoutEnabledForAgent } from "../../../Utils/utils";

Parse.initialize(process.env.REACT_APP_APPID, process.env.REACT_APP_MASTER_KEY);
Parse.serverURL = process.env.REACT_APP_URL;

export const WalletDetails = ({
  transactionData,
  totalTransactions,
  handleCashoutRefresh,
  wallet,
  balance,
}) => {
  // Sample transaction data
  const navigate = useNavigate();
  const { identity } = useGetIdentity();
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const refresh = useRefresh();
  const [cashOutDialogOpen, setcashOutDialogOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [cashoutDisabled, setCashoutDisabled] = useState(false);

  const transformedIdentity = {
    id: identity?.objectId,
    ...identity,
  };

  useEffect(() => {
    const checkRechargeAccess = async () => {
        const disabled = !(await isCashoutEnabledForAgent(identity?.userParentId));
        setCashoutDisabled(disabled);
    }
  
    if(identity?.userParentId){
      checkRechargeAccess();
    }

  }, [identity]);
  const role = localStorage.getItem("role");

  useEffect(() => {
    if (!role) {
      navigate("/login");
    }
  }, [role, navigate]);

  const handleRefresh = async () => {
    refresh();
    handleCashoutRefresh();
  };

  return (
    <React.Fragment>
      <Paper
        sx={{
          margin: 0,
          borderRadius: "8px",
          boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
          border: "1px solid #E0E0E0",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: 2,
            bgcolor: "#FFFFFF",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 1,
                borderRadius: "4px",
                backgroundColor: "#F4F3FC",
                width: "40px",
                height: "40px",
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
            <Typography
              variant="body2"
              sx={{
                color: "#6B7280",
                fontSize: "18px",
                fontWeight: 400,
              }}
            >
              Available balance
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <img
              src={AOG_Symbol}
              alt="AOG Symbol"
              style={{ width: 32, height: 32 }}
            />
            <Typography
              sx={{
                color: "#000000",
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
            marginTop: 1,
          }}
        >
          <Button
            sx={{
              bgcolor: "#2E5BFF",
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
              "&.Mui-disabled": {
                bgcolor: "#A0AEC0", // Disabled background color (grayish)
                color: "#E2E8F0", // Disabled text color (light gray)
              },
            }}
            onClick={() => {
              setIsOpen(true);
            }}
            disabled={identity?.isBlackListed || true}
          >
            Cashout{" "}
            <ArrowForwardIcon
              style={{ width: "24px", height: "24px", marginLeft: "10px" }}
            />
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
{cashoutDisabled && (
  <Alert severity="error" sx={{ mb: 2 }}>
    Cashouts are not available at this time. Please try again later.
  </Alert>
)}
        {/* <Alert severity="error" sx={{ my: 2 }}>
        We're experiencing cashout processing delays due to high demand. Please try again later.
</Alert> */}
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
        {totalTransactions > 0 && transactionData.length !== 0 && (
          <TransactionRecords
            message={"Recent Cash out history"}
            totalTransactions={totalTransactions}
            transactionData={transactionData}
            redirectUrl={"wallet"}
          />
        )}
      </Box>
      <CashOutModal
        setOpen={() => setIsOpen(true)}
        open={isOpen}
        onClose={() => setIsOpen(false)}
        balance={balance}
        record={transformedIdentity}
      />
      <CashOutDialog
        open={cashOutDialogOpen}
        onClose={() => setcashOutDialogOpen(false)}
        record={transformedIdentity}
        handleRefresh={() => {
          handleCashoutRefresh();
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
