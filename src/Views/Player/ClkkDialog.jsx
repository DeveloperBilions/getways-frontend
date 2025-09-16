import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Alert,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import Parse from "parse";
Parse.initialize(process.env.REACT_APP_APPID, process.env.REACT_APP_MASTER_KEY);
Parse.serverURL = process.env.REACT_APP_URL;

const ClkkDialog = ({ open, onClose, handleRefresh }) => {
  const [form, setForm] = useState({
    name: "",
    notes: "",
    vendorId: "",
    amount: "",
    payoutMethod: "",
    venmoEmail: "",
    venmoPhone: "",
    paypalEmail: "",
    paypalPhone: "",
    cardEmail: "",
    cardPhone: "",
  });

  const [existingRecipientId, setExistingRecipientId] = useState(null);
  const [step, setStep] = useState("chooseMethod"); // chooseMethod → addRecipient → payout
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) resetState();
  }, [open]);

  const resetState = () => {
    setForm({
      name: "",
      notes: "",
      vendorId: "",
      amount: "",
      payoutMethod: "",
      venmoEmail: "",
      venmoPhone: "",
      paypalEmail: "",
      paypalPhone: "",
      cardEmail: "",
      cardPhone: "",
    });
    setExistingRecipientId(null);
    setStep("chooseMethod");
    setError("");
  };

  const checkForExistingRecipient = async () => {
    setLoading(true);
    try {
      const user = Parse.User.current();
      if (!user) throw new Error("User not logged in");

      const CLKK = Parse.Object.extend("CLKK");
      const query = new Parse.Query(CLKK);
      query.equalTo("user", user);
      query.descending("createdAt");
      query.limit(1);

      const existing = await query.first({ useMasterKey: true });
      if (existing) {
        const apiResponse = existing.get("apiResponse");
        const metadata = existing.get("metadata") || {};
        if (apiResponse?.recipientId) {
          setExistingRecipientId(apiResponse.recipientId);
          setForm((prev) => ({
            ...prev,
            name: existing.get("name") || "",
            notes: metadata.notes || "",
            vendorId: metadata.vendorId || "",
            venmoEmail: metadata.venmoEmail || "",
            venmoPhone: metadata.venmoPhone || "",
            paypalEmail: metadata.paypalEmail || "",
            paypalPhone: metadata.paypalPhone || "",
            cardEmail: metadata.cardEmail || "",
            cardPhone: metadata.cardPhone || "",
          }));
          setStep("payout");
          return;
        }
      }
      setStep("addRecipient");
    } catch (err) {
      setError(err.message || "Failed to fetch recipient");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmitRecipient = async () => {
    setError("");
    if (!form.name) return setError("Name is required");

    // Mandatory check based on payout method
    if (form.payoutMethod === "venmo" && !form.venmoEmail && !form.venmoPhone) {
      return setError("Provide Venmo Email or Phone");
    }
    if (form.payoutMethod === "paypal" && !form.paypalEmail && !form.paypalPhone) {
      return setError("Provide PayPal Email or Phone");
    }
    if (form.payoutMethod === "card" && (!form.cardEmail || !form.cardPhone)) {
      return setError("Provide both Card Email and Phone");
    }

    setLoading(true);
    try {
      const metadata = {
        notes: form.notes,
        vendorId: form.vendorId,
        venmoEmail: form.venmoEmail,
        venmoPhone: form.venmoPhone,
        paypalEmail: form.paypalEmail,
        paypalPhone: form.paypalPhone,
        cardEmail: form.cardEmail,
        cardPhone: form.cardPhone,
      };

      const result = await Parse.Cloud.run("saveClkkRecipient", {
        name: form.name,
        venmoEmail: form.venmoEmail,
        venmoPhone: form.venmoPhone,
        paypalEmail: form.paypalEmail,
        paypalPhone: form.paypalPhone,
        cardEmail: form.cardEmail,
        cardPhone: form.cardPhone,
        metadata,
      });

      setExistingRecipientId(result.recipientId);
      setStep("payout");
    } catch (err) {
      setError(err.message || "Recipient creation failed");
    } finally {
      setLoading(false);
    }
  };

  const handlePayout = async () => {
    setError("");
    if (!form.amount) return setError("Amount is required");
    const amountValue = parseFloat(form.amount);
    if (isNaN(amountValue) || amountValue < 25 || amountValue > 500) {
      return setError("Amount must be between $25 and $500");
    }

    setLoading(true);
    try {
      const orderId = `ORDER-${Date.now()}`;
      const description = "cm.us";

      const metadata = {
        notes: form.notes,
        vendorId: form.vendorId,
        venmoEmail: form.venmoEmail,
        venmoPhone: form.venmoPhone,
        paypalEmail: form.paypalEmail,
        paypalPhone: form.paypalPhone,
        cardEmail: form.cardEmail,
        cardPhone: form.cardPhone,
      };

      await Parse.Cloud.run("saveClkkRecipient", {
        recipientId: existingRecipientId,
        name: form.name,
        venmoEmail: form.venmoEmail,
        venmoPhone: form.venmoPhone,
        paypalEmail: form.paypalEmail,
        paypalPhone: form.paypalPhone,
        cardEmail: form.cardEmail,
        cardPhone: form.cardPhone,
        metadata,
      });

      if (form.payoutMethod === "card") {
        const setupSession = await Parse.Cloud.run("initiateClkkCardSetup", {
          recipientId: existingRecipientId,
          name: form.name,
          vendorId: form.vendorId,
          amount: amountValue,
          description,
          email: form.cardEmail,
          phone: form.cardPhone,
        });
        let sessionUrl = setupSession?.publicUrl;
        if (sessionUrl) {
          sessionUrl = sessionUrl.replace(
            "https://pay.clkk-api.com",
            "https://pay.clkkapi.io"
          );
          window.open(sessionUrl, "_blank");
        }
      } else {
        const user = Parse.User.current();
        await Parse.Cloud.run("createClkkPayout", {
          recipientId: existingRecipientId,
          method: form.payoutMethod,
          amount: amountValue,
          description,
          orderId,
          userId: user.id,
        });
        alert("Payout initiated successfully.");
        onClose();
        handleRefresh();
      }
    } catch (err) {
      setError(err.message || "Payout failed");
    } finally {
      setLoading(false);
    }
  };

  // Dynamic fields
  const renderPaymentInputs = () => {
    if (form.payoutMethod === "venmo") {
      return (
        <>
          <TextField label="Venmo Email" name="venmoEmail" value={form.venmoEmail} onChange={handleChange} fullWidth />
          <TextField label="Venmo Phone" name="venmoPhone" value={form.venmoPhone} onChange={handleChange} fullWidth />
        </>
      );
    }
    if (form.payoutMethod === "paypal") {
      return (
        <>
          <TextField label="PayPal Email" name="paypalEmail" value={form.paypalEmail} onChange={handleChange} fullWidth />
          <TextField label="PayPal Phone" name="paypalPhone" value={form.paypalPhone} onChange={handleChange} fullWidth />
        </>
      );
    }
    if (form.payoutMethod === "card") {
      return (
        <>
          <TextField label="Card Email" name="cardEmail" value={form.cardEmail} onChange={handleChange} fullWidth />
          <TextField label="Card Phone" name="cardPhone" value={form.cardPhone} onChange={handleChange} fullWidth />
        </>
      );
    }
    return null;
  };

  const renderAddRecipient = () => (
    <>
      <TextField label="Name" name="name" value={form.name} onChange={handleChange} fullWidth />
      {renderPaymentInputs()}
      <TextField label="Notes" name="notes" value={form.notes} onChange={handleChange} fullWidth />
    </>
  );

  const renderPayout = () => (
    <>
      <TextField label="Name" name="name" value={form.name} onChange={handleChange} fullWidth />
      {renderPaymentInputs()}
      <FormControl fullWidth>
        <InputLabel>Payout Method</InputLabel>
        <Select name="payoutMethod" value={form.payoutMethod} onChange={handleChange}>
          <MenuItem value="venmo">Venmo</MenuItem>
          <MenuItem value="paypal">PayPal</MenuItem>
          <MenuItem value="card">Card</MenuItem>
        </Select>
      </FormControl>
      <TextField
        label="Amount"
        name="amount"
        value={form.amount}
        onChange={handleChange}
        fullWidth
        helperText="Enter between $25 and $500"
      />
    </>
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {step === "chooseMethod"
          ? "Choose Payment Method"
          : step === "addRecipient"
          ? "Add Recipient"
          : "Process Payout"}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
          {step === "chooseMethod" && (
            <FormControl fullWidth>
              <InputLabel>Payout Method</InputLabel>
              <Select name="payoutMethod" value={form.payoutMethod} onChange={handleChange}>
                <MenuItem value="venmo">Venmo</MenuItem>
                <MenuItem value="paypal">PayPal</MenuItem>
                <MenuItem value="card">Card</MenuItem>
              </Select>
            </FormControl>
          )}
          {step === "addRecipient" && renderAddRecipient()}
          {step === "payout" && renderPayout()}
          {error && <Alert severity="error">{error}</Alert>}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        {step === "chooseMethod" && (
          <Button
            variant="contained"
            onClick={checkForExistingRecipient}
            disabled={loading || !form.payoutMethod}
          >
            {loading ? "Processing..." : "Pay"}
          </Button>
        )}
        {step === "addRecipient" && (
          <Button variant="contained" onClick={handleSubmitRecipient} disabled={loading}>
            {loading ? "Processing..." : "Submit"}
          </Button>
        )}
        {step === "payout" && (
          <Button variant="contained" onClick={handlePayout} disabled={loading}>
            {loading ? "Processing..." : "Pay"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ClkkDialog;
