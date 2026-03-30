import React, { useState, useEffect, useRef } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import {
  Box, IconButton, TextField, Typography, Button, Alert,
  CircularProgress, MenuItem, Select, FormControl, InputLabel,
} from "@mui/material";
import Close from "../../Assets/icons/close.svg";
import AOG_Symbol from "../../Assets/icons/AOGsymbol.png";
import Parse from "parse";

const METHOD_LABELS = {
  paypal: "PayPal",
  venmo: "Venmo",
  debit: "Debit Card",
  ach: "ACH Bank Transfer",
  rtp: "RTP (Real-Time Payment)",
  coinbase: "Coinbase",
  visaplus: "Visa+",
  echeck: "eCheck (Printable)",
};

const FiservDisbursementDialog = ({
  open, onClose, amount, method,
  handleRefresh, widgetMode = false, widgetUserId = null, widgetType = null,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [payName, setPayName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountType, setAccountType] = useState("Checking");

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const resetForm = () => {
    setLoading(false);
    setError("");
    setResult(null);
    setFirstName(""); setLastName("");
    setEmail(""); setPhone(""); setPayName("");
    setCardNumber(""); setExpiryMonth(""); setExpiryYear("");
    setRoutingNumber(""); setAccountNumber(""); setAccountType("Checking");
  };

  const handleClose = () => { resetForm(); onClose(); };

  const validate = () => {
    if (!firstName.trim() || !lastName.trim()) return "First name and last name are required.";
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Valid email is required.";
    switch (method) {
      case "paypal":
        break;
      case "venmo":
        if (!phone || !/^\d{10}$/.test(phone.replace(/\D/g, ""))) return "Valid 10-digit phone number is required.";
        break;
      case "visaplus":
        if (!payName || !payName.startsWith("+")) return "PayName must start with + (e.g. +user.gpay).";
        if (payName.length < 4 || payName.length > 50) return "PayName must be 4-50 characters.";
        break;
      case "debit":
        if (!cardNumber || cardNumber.replace(/\s/g, "").length < 13) return "Valid card number is required.";
        if (!expiryMonth || !expiryYear) return "Expiry month and year are required.";
        if (parseInt(expiryMonth) < 1 || parseInt(expiryMonth) > 12) return "Expiry month must be 01-12.";
        break;
      case "ach": case "rtp":
        if (!routingNumber || !/^\d{9}$/.test(routingNumber)) return "Valid 9-digit routing number is required.";
        if (!accountNumber) return "Account number is required.";
        break;
      case "coinbase":
        if (!routingNumber || !accountNumber) return "Routing and account number are required.";
        break;
      default:
        break;
    }
    return null;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) { setError(err); return; }

    setError("");
    setLoading(true);

    try {
      const cloudOptions = widgetMode
        ? { useMasterKey: true }
        : { sessionToken: Parse.User.current().getSessionToken() };

      const formattedPhone = phone ? phone.replace(/\D/g, "").replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3") : "";

      const params = {
        amount: parseFloat(amount),
        paymentMethod: method,
        email,
        userData: { firstName: firstName.trim(), lastName: lastName.trim() },
      };

      if (method === "venmo") params.phone = formattedPhone;
      if (method === "visaplus") params.paymentDetails = { payName };
      if (method === "debit") {
        params.cardNumber = cardNumber.replace(/\s/g, "");
        params.expiryMonth = expiryMonth;
        params.expiryYear = expiryYear;
      }
      if (["ach", "rtp", "coinbase"].includes(method)) {
        params.routingNumber = routingNumber;
        params.accountNumber = accountNumber;
        params.accountType = accountType;
      }

      if (widgetMode) {
        params.type = widgetType;
        params.userId = widgetUserId;
      }

      const cashoutResult = await Parse.Cloud.run("fiservDDP_cashout", params, cloudOptions);
      if (!mountedRef.current) return;
      setResult(cashoutResult);

      if (handleRefresh) setTimeout(() => handleRefresh(), 1000);
      if (widgetMode) {
        const parentOrigin = process.env.REACT_APP_WIDGET_PARENT_ORIGIN || window.location.origin;
        window.parent.postMessage({ type: "CASHOUT_SUCCESS", data: cashoutResult }, parentOrigin);
      }
    } catch (e) {
      if (!mountedRef.current) return;
      setError(e.message || "Cashout failed. Please try again.");
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  const renderFields = () => {
    switch (method) {
      case "paypal":
        return null;
      case "venmo":
        return <TextField fullWidth label="Phone Number" value={phone}
          onChange={(e) => setPhone(e.target.value)} placeholder="123-456-7890" sx={{ mb: 2 }} />;
      case "visaplus":
        return <TextField fullWidth label="Visa+ PayName" value={payName}
          onChange={(e) => setPayName(e.target.value)} placeholder="+username.gpay"
          helperText="Must start with +" sx={{ mb: 2 }} />;
      case "debit":
        return (<>
          <TextField fullWidth label="Card Number" value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value.replace(/[^\d\s]/g, ""))}
            placeholder="4111 1111 1111 1111" sx={{ mb: 2 }} />
          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <TextField fullWidth label="Expiry Month" value={expiryMonth}
              onChange={(e) => setExpiryMonth(e.target.value.replace(/\D/g, "").slice(0, 2))} placeholder="MM" />
            <TextField fullWidth label="Expiry Year" value={expiryYear}
              onChange={(e) => setExpiryYear(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="YYYY" />
          </Box>
        </>);
      case "ach": case "rtp":
        return (<>
          <TextField fullWidth label="Routing Number" value={routingNumber}
            onChange={(e) => setRoutingNumber(e.target.value.replace(/\D/g, "").slice(0, 9))}
            placeholder="073972181" sx={{ mb: 2 }} />
          <TextField fullWidth label="Account Number" value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)} sx={{ mb: 2 }} />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Account Type</InputLabel>
            <Select value={accountType} label="Account Type" onChange={(e) => setAccountType(e.target.value)}>
              <MenuItem value="Checking">Checking</MenuItem>
              <MenuItem value="Savings">Savings</MenuItem>
            </Select>
          </FormControl>
        </>);
      case "coinbase":
        return (<>
          <TextField fullWidth label="Routing Number" value={routingNumber}
            onChange={(e) => setRoutingNumber(e.target.value.replace(/\D/g, "").slice(0, 9))}
            placeholder="073972181" sx={{ mb: 2 }} />
          <TextField fullWidth label="Coinbase Account Number" value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)} sx={{ mb: 2 }} />
        </>);
      case "echeck":
        return null;
      default:
        return null;
    }
  };

  // Success view
  if (result) {
    return (
      <Modal isOpen={open} toggle={handleClose} centered size="md">
        <Box sx={{ borderRadius: "8px", border: "1px solid #E7E7E7", bgcolor: "#fff" }}>
          <ModalHeader toggle={handleClose} className="border-bottom-0 pb-0"
            close={<IconButton onClick={handleClose} sx={{ position: "absolute", right: 16, top: 16 }}>
              <img src={Close} alt="close" width="24" height="24" /></IconButton>}>
            Cashout Successful
          </ModalHeader>
          <ModalBody>
            <Box sx={{ textAlign: "center", py: 2 }}>
              <Box sx={{ width: 64, height: 64, borderRadius: "50%", bgcolor: "#4CAF50",
                display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <Typography sx={{ fontSize: 36, color: "#fff" }}>&#10003;</Typography>
              </Box>
              <Typography variant="h6" sx={{ mb: 2, color: "#4CAF50" }}>
                ${amount} sent via {METHOD_LABELS[method] || method}
              </Typography>
            </Box>
            <Box sx={{ p: 2, bgcolor: "#F4F3FC", borderRadius: 1, mb: 2 }}>
              <Typography variant="body2"><strong>Transaction ID:</strong> {result.merchantTransactionId}</Typography>
              <Typography variant="body2"><strong>Status:</strong> {result.status || "Pending"}</Typography>
              {result.fiservTransactionId && (
                <Typography variant="body2"><strong>Fiserv ID:</strong> {result.fiservTransactionId}</Typography>
              )}
            </Box>
            {result.portalUrl && (
              <Alert severity="info" sx={{ mb: 1 }}>
                <Typography variant="body2">
                  Track: <a href={result.portalUrl} target="_blank" rel="noopener noreferrer">{result.portalUrl}</a>
                </Typography>
              </Alert>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="contained" onClick={handleClose} fullWidth>Done</Button>
          </ModalFooter>
        </Box>
      </Modal>
    );
  }

  // Form view
  return (
    <Modal isOpen={open} toggle={handleClose} centered size="md">
      <Box sx={{ borderRadius: "8px", border: "1px solid #E7E7E7", bgcolor: "#fff" }}>
        <ModalHeader toggle={handleClose} className="border-bottom-0 pb-0"
          close={<IconButton onClick={handleClose} sx={{ position: "absolute", right: 16, top: 16 }}>
            <img src={Close} alt="close" width="24" height="24" /></IconButton>}>
          {METHOD_LABELS[method] || method} Cashout
        </ModalHeader>

        <ModalBody>
          <Box sx={{ mb: 2, p: 2, bgcolor: "#F4F3FC", borderRadius: 1, display: "flex", alignItems: "center", gap: 1 }}>
            <img src={AOG_Symbol} alt="Coin" style={{ width: 24, height: 24 }} />
            <Typography sx={{ fontSize: 22, fontWeight: 600 }}>${amount}</Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <TextField fullWidth label="First Name" value={firstName}
              onChange={(e) => setFirstName(e.target.value)} required disabled={loading} />
            <TextField fullWidth label="Last Name" value={lastName}
              onChange={(e) => setLastName(e.target.value)} required disabled={loading} />
          </Box>

          <TextField fullWidth label="Email" type="email" value={email}
            onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com"
            required sx={{ mb: 2 }} disabled={loading} />

          {renderFields()}

          {loading && (
            <Box sx={{ textAlign: "center", py: 3 }}>
              <CircularProgress size={40} sx={{ mb: 1 }} />
              <Typography variant="body2" color="text.secondary">Processing cashout...</Typography>
            </Box>
          )}
        </ModalBody>

        <ModalFooter>
          <Box sx={{ display: "flex", width: "100%", justifyContent: "space-between", gap: 2 }}>
            <Button onClick={handleClose} disabled={loading}>Cancel</Button>
            <Button variant="contained" onClick={handleSubmit} disabled={loading}>
              {loading ? "Processing..." : "Submit Cashout"}
            </Button>
          </Box>
        </ModalFooter>
      </Box>
    </Modal>
  );
};

export default FiservDisbursementDialog;
