import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  IconButton,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import LocalAtmIcon from "@mui/icons-material/LocalAtm";
import Parse from "parse";

export default function SelectCashoutMethodModal({ open, onClose, onSelect, agentId }) {
  const [loading, setLoading] = useState(false);
  const [methods, setMethods] = useState([]);

  const ALL_METHODS = {
    giftcard: { label: "Gift Card", icon: <CardGiftcardIcon /> },
    paypal: { label: "PayPal", icon: <AccountBalanceWalletIcon /> },
    venmo: { label: "Venmo", icon: <AccountBalanceWalletIcon /> },
    card: { label: "Card", icon: <CreditCardIcon /> },
  };

  const fetchAllowedMethods = async () => {
    if (!agentId) return;
    setLoading(true);
    try {
      const q = new Parse.Query("Settings");
      q.startsWith("type", "allowedCashoutAgentsFor_");
      const results = await q.find({ useMasterKey: true });

      const allowed = [];
      results.forEach((r) => {
        const ids = r.get("settings") || [];
        if (ids.includes(agentId)) {
          // type looks like "allowedCashoutAgentsFor_paypal"
          const type = r.get("type");
          const methodKey = type.replace("allowedCashoutAgentsFor_", "");
          if (ALL_METHODS[methodKey]) {
            allowed.push({ key: methodKey, ...ALL_METHODS[methodKey] });
          }
        }
      });

      setMethods(allowed);
    } catch (err) {
      console.error("Error fetching allowed cashout methods:", err);
      setMethods([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchAllowedMethods();
    }
  }, [open, agentId]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h6">Select Cashout Method</Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <CircularProgress sx={{ display: "block", mx: "auto", my: 4 }} />
        ) : methods.length === 0 ? (
          <Typography>No cashout methods available for your account.</Typography>
        ) : (
          <Grid container spacing={2}>
            {methods.map((m) => (
              <Grid item xs={6} key={m.key}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={m.icon}
                  onClick={() => {
                    onSelect(m.key);
                    onClose();
                  }}
                  sx={{
                    py: 2,
                    fontSize: "16px",
                    textTransform: "none",
                  }}
                >
                  {m.label}
                </Button>
              </Grid>
            ))}
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}
