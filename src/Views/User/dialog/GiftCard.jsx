import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, CircularProgress, Alert } from "@mui/material";
import { createVirtualCard } from "../../../Utils/walletCreate";

const VirtualCard = ({ open, onClose, walletId = "4096f0e8-e640-45e8-88d0-e11d40449779", record }) => {
  const [formData, setFormData] = useState({
    company: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    zip: "",
    phone: "",
    email: "",
    name: record?.username,
  });
  const [cardData, setCardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const amount = record?.transactionAmount
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateCard = async () => {
    if (!walletId) {
      setMessage("Wallet ID is required to create a virtual card.");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      const memo = "Virtual Card Creation";
      const note = "Card created via React app";
      const destination = {
        ...formData
      };

      const response = await createVirtualCard(walletId, memo, note, destination,amount);
     // const Approve = await dataProvider.finalApprove(record?.id); // Use the correct function or method call

      setCardData(response);
      setMessage("Virtual Card Created Successfully!");
    } catch (error) {
      setMessage(error?.response?.data?.errorMsg || "Failed to create virtual card. Please check the details and try again.");
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Create a Virtual Card</DialogTitle>
      <DialogContent>
      <TextField fullWidth label="Username" name="username" value={record?.username} disabled margin="normal" />
        <TextField fullWidth label="Company" name="company" value={formData.company} onChange={handleChange} margin="normal" />
        <TextField fullWidth label="Address 1" name="address1" value={formData.address1} onChange={handleChange} margin="normal" />
        <TextField fullWidth label="Address 2" name="address2" value={formData.address2} onChange={handleChange} margin="normal" />
        <TextField fullWidth label="City" name="city" value={formData.city} onChange={handleChange} margin="normal" />
        <TextField fullWidth label="State" name="state" value={formData.state} onChange={handleChange} margin="normal" />
        <TextField fullWidth label="Zip Code" name="zip" value={formData.zip} onChange={handleChange} margin="normal" />
        <TextField fullWidth label="Phone" name="phone" value={formData.phone} onChange={handleChange} margin="normal" />
        <TextField fullWidth label="Email" name="email" value={formData.email} onChange={handleChange} margin="normal" />
        {loading && <CircularProgress />}
        {message && <Alert severity={cardData ? "success" : "error"}>{message}</Alert>}
        {cardData && (
          <div>
            <h4>Card Details</h4>
            <p>Card Number: {cardData.card_number}</p>
            <p>Expiry Date: {cardData.expiration}</p>
            <p>CVV: {cardData.cvv}</p>
          </div>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">Close</Button>
        <Button onClick={handleCreateCard} color="primary" variant="contained" disabled={loading}>
          {loading ? "Creating..." : "Create Card"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VirtualCard;