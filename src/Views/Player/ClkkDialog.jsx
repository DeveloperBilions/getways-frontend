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

const ClkkDialog = ({ open, onClose , handleRefresh }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    notes: "",
    vendorId: "",
    amount: "",
    payoutMethod: "",
  });

  const [existingRecipientId, setExistingRecipientId] = useState(null);
  const [step, setStep] = useState("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) checkForExistingRecipient();
  }, [open]);

  const checkForExistingRecipient = async () => {
    setLoading(true);
    setError("");

    try {
      const user = Parse.User.current();
      if (!user) {
        setError("User not logged in");
        return;
      }

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
            email: existing.get("email") || "",
            phone: existing.get("phone") || "",
            vendorId: metadata.vendorId || "",
          }));

          setStep("payout");
        }
      } else {
        console.log("No CLKK record found for this user.");
      }
    } catch (err) {
      console.error("Error fetching recipient:", err);
      setError("Failed to fetch recipient");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      const metadata = { notes: form.notes, vendorId: form.vendorId };

      const result = await Parse.Cloud.run("saveClkkRecipient", {
        name: form.name,
        email: form.email,
        phone: form.phone,
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
    setLoading(true);
    try {
        const amountValue = parseFloat(form.amount);

        if (isNaN(amountValue) || amountValue < 25 || amountValue > 500) {
            setError("Amount must be between $25 and $500");
            setLoading(false);
            return;
          }
      // ✅ auto-generate orderId and fixed description
      const orderId = `ORDER-${Date.now()}`;
      const description = "cm.us";

      if (form.payoutMethod === "card") {
        const setupSession = await Parse.Cloud.run("initiateClkkCardSetup", {
          recipientId: existingRecipientId,
          name: form.name,
          email: form.email,
          phone: form.phone,
          vendorId: form.vendorId,
          amount: parseFloat(form.amount),
          description,
        });

        let sessionUrl = setupSession?.publicUrl;
        if (sessionUrl) {
          sessionUrl = sessionUrl.replace(
            "dev.pay.clkk-api.com",
            "pay-dev.clkkapi.io"
          );
          window.open(sessionUrl, "_blank");
        }
        return;
      }

      const user = Parse.User.current();

      await Parse.Cloud.run("createClkkPayout", {
        recipientId: existingRecipientId,
        method: form.payoutMethod,
        amount: parseFloat(form.amount),
        description,
        orderId,
        userId: user.id,
      });

      alert("Payout initiated successfully.");
      onClose();
      handleRefresh()
    } catch (err) {
      setError(err.message || "Payout failed");
    } finally {
      setLoading(false);
    }
  };

  const renderForm = () => (
    <>
      <Alert severity="info" sx={{ mb: 2 }}>
        Please use your actual <strong>Email</strong> and{" "}
        <strong>Phone number </strong>
        that are linked to your <strong>Venmo</strong> or{" "}
        <strong>PayPal</strong> account. Otherwise payouts may fail.
      </Alert>
      <TextField
        label="Name"
        name="name"
        fullWidth
        value={form.name}
        onChange={handleChange}
      />
      <TextField
        label="Email"
        name="email"
        fullWidth
        value={form.email}
        onChange={handleChange}
      />
      <TextField
        label="Phone"
        name="phone"
        fullWidth
        value={form.phone}
        onChange={handleChange}
      />
      <TextField
        label="Vendor ID"
        name="vendorId"
        fullWidth
        value={form.vendorId}
        onChange={handleChange}
      />
      <TextField
        label="Notes"
        name="notes"
        fullWidth
        value={form.notes}
        onChange={handleChange}
      />
    </>
  );

  const renderPayoutForm = () => (
    <>
      <FormControl fullWidth>
        <InputLabel>Payout Method</InputLabel>
        <Select
          name="payoutMethod"
          value={form.payoutMethod}
          onChange={handleChange}
          fullWidth
        >
          <MenuItem value="venmo">Venmo</MenuItem>
          <MenuItem value="paypal">PayPal</MenuItem>
          <MenuItem value="card">Card</MenuItem>
        </Select>
      </FormControl>
      <TextField
        label="Amount"
        name="amount"
        fullWidth
        value={form.amount}
        onChange={handleChange}
        inputProps={{ min: 25, max: 500 }}
        helperText="Enter an amount between $25 and $500"
      />
      {/* ✅ description and orderId removed from user input */}
    </>
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {step === "form" ? "Add Recipient" : "Process Payout"}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
          {step === "form" ? renderForm() : renderPayoutForm()}
          {error && <Alert severity="error">{error}</Alert>}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={step === "form" ? handleSubmit : handlePayout}
          disabled={loading}
        >
          {loading ? "Processing..." : step === "form" ? "Submit" : "Pay"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ClkkDialog;
