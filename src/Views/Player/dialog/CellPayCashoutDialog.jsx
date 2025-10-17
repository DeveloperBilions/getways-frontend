import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Chip,
} from "@mui/material";
import { Parse } from "parse";
import { useNotify } from "react-admin";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import CurrencyBitcoinIcon from "@mui/icons-material/CurrencyBitcoin";

Parse.initialize(process.env.REACT_APP_APPID, process.env.REACT_APP_MASTER_KEY);
Parse.serverURL = process.env.REACT_APP_URL;

const CellPayCashoutDialog = ({ open, onClose, amount, method, userWallet, availableBalance, onSuccess }) => {
  // Determine payout type based on method passed from parent
  const payoutType = method === "getpaycard" ? "card" : "crypto";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const notify = useNotify();

  // Card Payout Fields
  const [cardData, setCardData] = useState({
    name: "",
    mobileNumber: "",
    recipient: "",
    amount: amount || "",
    description: "",
  });

  // Crypto Payout Fields
  const [cryptoData, setCryptoData] = useState({
    walletAddress: "",
    cryptoType: "BTC",
    phoneNumber: "",
    amount: amount || "",
    description: "",
  });

  const supportedCryptoTypes = [
    { value: "BTC", label: "Bitcoin (BTC)" },
    { value: "ETH", label: "Ethereum (ETH)" },
    { value: "LTC", label: "Litecoin (LTC)" },
    { value: "BCH", label: "Bitcoin Cash (BCH)" },
    { value: "USDT", label: "Tether (USDT)" },
    { value: "USDC", label: "USD Coin (USDC)" },
  ];

  const resetForm = () => {
    setCardData({
      name: "",
      mobileNumber: "",
      recipient: "",
      amount: amount || "",
      description: "",
    });
    setCryptoData({
      walletAddress: "",
      cryptoType: "BTC",
      phoneNumber: "",
      amount: amount || "",
      description: "",
    });
    setError("");
    setSuccess("");
  };

  const validateCardForm = () => {
    const { name, mobileNumber, recipient, amount } = cardData;
    
    if (!name || !mobileNumber || !recipient || !amount) {
      setError("All card payout fields are required");
      return false;
    }
    if (parseFloat(amount) <= 0) {
      setError("Amount must be greater than 0");
      return false;
    }
    
    if (parseFloat(amount) > parseFloat(availableBalance || 0)) {
      setError(`Insufficient wallet balance. Available: ${availableBalance}, Requested: ${amount}`);
      return false;
    }
    return true;
  };

  const validateCryptoForm = () => {
    const { walletAddress, cryptoType, phoneNumber, amount } = cryptoData;
    
    if (!walletAddress || !cryptoType || !phoneNumber || !amount) {
      setError("All crypto payout fields are required");
      return false;
    }
    if (parseFloat(amount) <= 0) {
      setError("Amount must be greater than 0");
      return false;
    }
    
    if (parseFloat(amount) > parseFloat(availableBalance || 0)) {
      setError(`Insufficient wallet balance. Available: ${availableBalance}, Requested: ${amount}`);
      return false;
    }
    return true;
  };

  const handleCardPayout = async () => {
    if (!validateCardForm()) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const result = await Parse.Cloud.run("cardPayout", cardData);
      
      if (result.success) {
        setSuccess(`Card payout successful! Transaction ID: ${result.transactionId}`);
        notify("Card payout processed successfully", { type: "success" });
        onSuccess(); // Refresh parent component
        setTimeout(() => {
          resetForm();
          onClose();
        }, 2000);
      } else {
        setError(result.message || "Card payout failed");
        notify("Card payout failed", { type: "error" });
      }
    } catch (error) {
      console.error("Card payout error:", error);
      // CellPay API response is stored in DB even for failures
      const errorMessage = error.message || "Failed to process card payout";
      setError(errorMessage);
      notify(`Card payout failed: ${errorMessage}`, { type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleCryptoPayout = async () => {
    if (!validateCryptoForm()) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const result = await Parse.Cloud.run("cryptoPayout", cryptoData);
      
      if (result.success) {
        setSuccess(`Crypto payout successful! Transaction ID: ${result.transactionId}`);
        notify("Crypto payout processed successfully", { type: "success" });
        onSuccess(); // Refresh parent component
        setTimeout(() => {
          resetForm();
          onClose();
        }, 2000);
      } else {
        setError(result.message || "Crypto payout failed");
        notify("Crypto payout failed", { type: "error" });
      }
    } catch (error) {
      console.error("Crypto payout error:", error);
      // CellPay API response is stored in DB even for failures
      const errorMessage = error.message || "Failed to process crypto payout";
      setError(errorMessage);
      notify(`Crypto payout failed: ${errorMessage}`, { type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (payoutType === "card") {
      handleCardPayout();
    } else {
      handleCryptoPayout();
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open, amount]);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          {payoutType === "card" ? <CreditCardIcon /> : <CurrencyBitcoinIcon />}
          <Typography variant="h6">
            GetPay {payoutType === "card" ? "Card" : "Crypto"} Cashout
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          {/* Card Payout Form */}
          {payoutType === "card" && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Recipient Name"
                  value={cardData.name}
                  onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Mobile Number"
                  placeholder="9999999999"
                  value={cardData.mobileNumber}
                  onChange={(e) => setCardData({ ...cardData, mobileNumber: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Recipient Email"
                  type="email"
                  value={cardData.recipient}
                  onChange={(e) => setCardData({ ...cardData, recipient: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Amount"
                  type="number"
                  value={cardData.amount}
                  onChange={(e) => setCardData({ ...cardData, amount: e.target.value })}
                  inputProps={{ min: 0, step: 0.01 }}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  value={cardData.description}
                  onChange={(e) => setCardData({ ...cardData, description: e.target.value })}
                  placeholder="Optional description for this payout"
                />
              </Grid>
            </Grid>
          )}

          {/* Crypto Payout Form */}
          {payoutType === "crypto" && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Crypto Type</InputLabel>
                  <Select
                    value={cryptoData.cryptoType}
                    label="Crypto Type"
                    onChange={(e) => setCryptoData({ ...cryptoData, cryptoType: e.target.value })}
                  >
                    {supportedCryptoTypes.map((crypto) => (
                      <MenuItem key={crypto.value} value={crypto.value}>
                        {crypto.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Amount"
                  type="number"
                  value={cryptoData.amount}
                  onChange={(e) => setCryptoData({ ...cryptoData, amount: e.target.value })}
                  inputProps={{ min: 0, step: 0.01 }}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Wallet Address"
                  value={cryptoData.walletAddress}
                  onChange={(e) => setCryptoData({ ...cryptoData, walletAddress: e.target.value })}
                  placeholder="Enter destination wallet address"
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  placeholder="+14081234567"
                  value={cryptoData.phoneNumber}
                  onChange={(e) => setCryptoData({ ...cryptoData, phoneNumber: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  value={cryptoData.description}
                  onChange={(e) => setCryptoData({ ...cryptoData, description: e.target.value })}
                  placeholder="Optional description for this payout"
                />
              </Grid>
            </Grid>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? "Processing..." : `Process ${payoutType === "card" ? "Card" : "Crypto"} Payout`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CellPayCashoutDialog;