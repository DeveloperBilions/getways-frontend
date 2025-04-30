import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Typography,
} from "@mui/material";
import Parse from "parse";
import { useRefresh } from "react-admin";

Parse.initialize(process.env.REACT_APP_APPID, process.env.REACT_APP_MASTER_KEY);
Parse.serverURL = process.env.REACT_APP_URL;
const generateUniqueCheckNumber = (userId) => {
  const timestamp = Date.now(); // milliseconds since epoch
  return `${timestamp}`;
};

const CheckbookPaymentDialog = ({ open, onClose, amount, handleRefresh }) => {
  const [email, setEmail] = useState("");
  const [userEmailExists, setUserEmailExists] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const refresh = useRefresh();

  let currentUser = null;

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        currentUser = await Parse.User.currentAsync();
        if (currentUser) {
          const checkbookEmail = currentUser.get("checkbookEmail") || "";
          if (checkbookEmail) {
            setEmail(checkbookEmail);
            setUserEmailExists(true);
          } else {
            setEmail("");
            setUserEmailExists(false);
          }
        } else {
          setErrorMessage("User not logged in.");
        }
      } catch (err) {
        console.error("Error fetching current user:", err);
        setErrorMessage("Unable to fetch user.");
      }
    };

    if (open) {
      fetchCurrentUser();
    }
  }, [open]);

  const handleSubmit = async () => {
    setLoading(true);
    setErrorMessage("");
    const user = await Parse.User.currentAsync();
    const number = generateUniqueCheckNumber(user.id);
    try {
      const response = await fetch(
        "https://sandbox.checkbook.io/v3/check/digital",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization:
              "57834abba5ef49dea102b57561a56524:zuVmx7yC0rzx7edpgSNnzL1MpbOP7i",
          },
          body: JSON.stringify({
            amount: amount,
            deposit_options: ["MAIL"],
            description: "Cashout Rquest",
            name: user.get("username"),
            number: number,
            pin: {
              description: "Please enter your payments pin #",
              value: "1234",
            },
            recipient: email,
          }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        setSuccess(true);
        console.log("Payment successful", data);

        // ✅ Create transaction entry in TransactionRecords
        const user = await Parse.User.currentAsync();
        const Transaction = Parse.Object.extend("TransactionRecords");
        const txn = new Transaction();

        txn.set("status", 11); // cashout status
        txn.set("userId", user.id);
        txn.set("username", user.get("username"));
        txn.set("userParentId", user.get("userParentId") || "");
        txn.set("type", "redeem");
        txn.set("transactionAmount", parseFloat(amount));
        txn.set("gameId", "786");
        txn.set("transactionDate", new Date());
        txn.set("transactionIdFromStripe", number);

        await txn.save(null, { useMasterKey: true });
        const Wallet = Parse.Object.extend("Wallet");
        const walletQuery = new Parse.Query(Wallet);
        walletQuery.equalTo("userID", user.id);

        const wallet = await walletQuery.first({ useMasterKey: true });

        if (wallet) {
          const currentBalance = wallet.get("balance") || 0;
          const newBalance = currentBalance - parseFloat(amount);

          if (newBalance < 0) {
            throw new Error("Insufficient wallet balance");
          }

          wallet.set("balance", newBalance);
          await wallet.save(null, { useMasterKey: true });

          console.log("Wallet balance updated:", newBalance);
        } else {
          console.error("Wallet not found for user");
          throw new Error("Wallet not found for user.");
        }
        setTimeout(() => {
          handleClose();
          refresh(); // Triggers react-admin to refetch data
          handleRefresh()
        }, 3000);        
      } else {
        setErrorMessage(data?.error || "Payment failed. Please try again.");
        console.error("Payment failed", data);
      }
    } catch (err) {
      console.error("Error sending check", err);
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setSuccess(false);
    setErrorMessage("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Send Payment</DialogTitle>
      <DialogContent>
        <Typography mb={1}>
          Amount: <strong>${amount}</strong>
        </Typography>

        {userEmailExists ? (
          <Typography mb={2}>
            Payment will be sent to: <strong>{email}</strong>
          </Typography>
        ) : (
          <TextField
            fullWidth
            label="Recipient Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="dense"
          />
        )}

        {errorMessage && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {errorMessage}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mt: 2 }}>
            Payment sent successfully!
          </Alert>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !email}
        >
          {loading ? <CircularProgress size={24} /> : "Send"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CheckbookPaymentDialog;
