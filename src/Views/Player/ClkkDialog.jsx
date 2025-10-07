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

const ClkkDialog = ({
  open,
  onClose,
  handleRefresh,
  amount,
  method,
  availableMethods,
}) => {
  const [form, setForm] = useState({
    name: "",
    notes: "",
    vendorId: "",
    amount: amount || "",
    payoutMethod: method || "",
    venmoPhone: "",
    paypalEmail: "",
    paypalPhone: "",
    cardEmail: "",
    cardPhone: "",
  });

  const [paypalOption, setPaypalOption] = useState("email");
  const [existingRecipientId, setExistingRecipientId] = useState(null);
  const [step, setStep] = useState("chooseMethod");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      resetState();
      if (method) {
        setStep("addRecipient");
        checkForExistingRecipient();
      }
    }
  }, [open, amount, method]);

  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const isValidPhone = (phone) => /^[0-9]{10}$/.test(phone);

  const resetState = () => {
    setForm((prev) => ({
      ...prev,
      amount: amount || "",
      payoutMethod: method || "",
    }));
    setPaypalOption("email");
    setExistingRecipientId(null);
    setStep(method ? "addRecipient" : "chooseMethod");
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
    console.log(form ,"form----form")
    if (!form.name) return setError("Name is required");

    // Venmo validation
    if (form.payoutMethod === "venmo") {
      if (!form.venmoPhone) return setError("Venmo Phone is required");
      console.log(form.venmoPhone,"form.venmoPhoneform.venmoPhoneform.venmoPhone")
      if (!isValidPhone(form.venmoPhone))
        return setError("Venmo Phone must be a 10-digit number");
    }

    // PayPal validation
    if (form.payoutMethod === "paypal") {
      if (paypalOption === "email") {
        if (!form.paypalEmail) return setError("PayPal Email is required");
        if (!isValidEmail(form.paypalEmail))
          return setError("Invalid PayPal Email format");
      } else {
        if (!form.paypalPhone) return setError("PayPal Phone is required");
        if (!isValidPhone(form.paypalPhone))
          return setError("PayPal Phone must be a 10-digit number");
      }
    }

    // Card validation
    if (form.payoutMethod === "card") {
      if (!form.cardEmail || !form.cardPhone)
        return setError("Provide both Card Email and Phone");
      if (!isValidEmail(form.cardEmail))
        return setError("Invalid Card Email format");
      if (!isValidPhone(form.cardPhone))
        return setError("Card Phone must be a 10-digit number");
    }

    setLoading(true);
    try {
      const metadata = {
        notes: form.notes,
        vendorId: form.vendorId,
        venmoPhone: form.venmoPhone,
        paypalEmail: form.paypalEmail,
        paypalPhone: form.paypalPhone,
        cardEmail: form.cardEmail,
        cardPhone: form.cardPhone,
      };

      const result = await Parse.Cloud.run("saveClkkRecipient", {
        name: form.name,
        ...metadata,
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
    if (!form.name) return setError("Name is required");

    // Venmo validation
    if (form.payoutMethod === "venmo") {
      if (!form.venmoPhone) return setError("Venmo Phone is required");
      console.log(form.venmoPhone,"form.venmoPhoneform.venmoPhoneform.venmoPhone")
      if (!isValidPhone(form.venmoPhone))
        return setError("Venmo Phone must be a 10-digit number");
    }

    // PayPal validation
    if (form.payoutMethod === "paypal") {
      if (paypalOption === "email") {
        if (!form.paypalEmail) return setError("PayPal Email is required");
        if (!isValidEmail(form.paypalEmail))
          return setError("Invalid PayPal Email format");
      } else {
        if (!form.paypalPhone) return setError("PayPal Phone is required");
        if (!isValidPhone(form.paypalPhone))
          return setError("PayPal Phone must be a 10-digit number");
      }
    }

    // Card validation
    if (form.payoutMethod === "card") {
      if (!form.cardEmail || !form.cardPhone)
        return setError("Provide both Card Email and Phone");
      if (!isValidEmail(form.cardEmail))
        return setError("Invalid Card Email format");
      if (!isValidPhone(form.cardPhone))
        return setError("Card Phone must be a 10-digit number");
    }
    if (!form.amount) return setError("Amount is required");

    const amountValue = parseFloat(form.amount);
    if (isNaN(amountValue) || amountValue < 25 || amountValue > 500) {
      return setError("Amount must be between $25 and $500");
    }

    setLoading(true);
    try {
      const orderId = `ORDER-${Date.now()}`;
      const description = "cm.us";

      await Parse.Cloud.run("saveClkkRecipient", {
        recipientId: existingRecipientId,
        name: form.name,
        ...form,
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
            "https://dev.pay.clkk-api.com",
            "https://pay-dev.clkkapi.io"
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

  const renderPaymentInputs = () => {
    if (form.payoutMethod === "venmo") {
      return (
        <TextField
          label="Venmo Phone"
          name="venmoPhone"
          value={form.venmoPhone}
          onChange={(e) => {
            const val = e.target.value;
            if (/^[0-9]*$/.test(val) && val.length <= 10) {
              setForm((prev) => ({ ...prev, venmoPhone: val }));
            }
          }}
          inputProps={{ maxLength: 10 }}
          fullWidth
        />
      );
    }

    if (form.payoutMethod === "paypal") {
      return (
        <>
          <FormControl fullWidth>
            <InputLabel id="paypal-contact-type-label">
              PayPal Contact Type
            </InputLabel>
            <Select
              labelId="paypal-contact-type-label"
              id="paypal-contact-type"
              value={paypalOption}
              onChange={(e) => setPaypalOption(e.target.value)}
              label="PayPal Contact Type" // 👈 Important for proper floating
            >
              <MenuItem value="email">Email</MenuItem>
              <MenuItem value="phone">Phone</MenuItem>
            </Select>
          </FormControl>

          {paypalOption === "email" && (
            <TextField
              label="PayPal Email"
              name="paypalEmail"
              value={form.paypalEmail}
              onChange={handleChange}
              fullWidth
            />
          )}
          {paypalOption === "phone" && (
            <TextField
              label="PayPal Phone"
              name="paypalPhone"
              value={form.paypalPhone}
              onChange={(e) => {
                const val = e.target.value;
                if (/^[0-9]*$/.test(val) && val.length <= 10) {
                  setForm((prev) => ({ ...prev, paypalPhone: val }));
                }
              }}
              inputProps={{ maxLength: 10 }}
              fullWidth
            />
          )}
        </>
      );
    }

    if (form.payoutMethod === "card") {
      return (
        <>
          <TextField
            label="Card Email"
            name="cardEmail"
            value={form.cardEmail}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Card Phone"
            name="cardPhone"
            value={form.cardPhone}
            onChange={(e) => {
              const val = e.target.value;
              if (/^[0-9]*$/.test(val) && val.length <= 10) {
                setForm((prev) => ({ ...prev, cardPhone: val }));
              }
            }}
            inputProps={{ maxLength: 10 }}
            fullWidth
          />
        </>
      );
    }

    return null;
  };

  const renderAddRecipient = () => (
    <>
      <TextField
        label="Name"
        name="name"
        value={form.name}
        onChange={handleChange}
        fullWidth
      />
      {renderPaymentInputs()}
      <TextField
        label="Notes"
        name="notes"
        value={form.notes}
        onChange={handleChange}
        fullWidth
      />
    </>
  );

  const renderPayout = () => {
    const amountValue = parseFloat(form.amount);
    const amountError =
      isNaN(amountValue) || amountValue < 25 || amountValue > 500;
  
    return (
      <>
        <TextField
          label="Name"
          name="name"
          value={form.name}
          onChange={handleChange}
          fullWidth
        />
        {renderPaymentInputs()}
        <TextField
          label="Amount"
          name="amount"
          value={form.amount}
          onChange={handleChange}
          fullWidth
          error={amountError}
          helperText={
            amountError ? "Amount must be between $25 and $500" : "Enter between $25 and $500"
          }
        />
      </>
    );
  };
  

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {step === "addRecipient" ? "Add Recipient" : "Process Payout"}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
          {step === "addRecipient" && renderAddRecipient()}
          {step === "payout" && renderPayout()}
          {error && <Alert severity="error">{error}</Alert>}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        {step === "addRecipient" && (
          <Button
            variant="contained"
            onClick={handleSubmitRecipient}
            disabled={loading}
          >
            {loading ? "Processing..." : "Submit"}
          </Button>
        )}
        {step === "payout" && (
          <Button variant="contained" onClick={handlePayout} disabled={loading}>
            {loading ? "Processing..." : "Confirm"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ClkkDialog;
