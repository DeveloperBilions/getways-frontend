import React, { useState } from "react";
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, CircularProgress, Alert } from "@mui/material";
import { dataProvider } from "../../../Provider/parseDataProvider";

const BlacklistUserDialog = ({ open, onClose, onConfirm, record }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  if (!record) return null;

  const blacklistUser = async (userId) => {
    setLoading(true);
    setSuccess("");
    setError("");
    try {
      await dataProvider.update("users", {
        id: userId,
        data: { isBlackListed: true },
      });
      setSuccess("User successfully blacklisted.");
      setTimeout(() => {
        setSuccess("");
        onClose();
      }, 3000);
    } catch (error) {
      console.error("Error blacklisting user:", error);
      setError("Failed to blacklist user. Please try again.");
    }
    setLoading(false);
  };

  return (
    <>
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>Confirm Blacklist</DialogTitle>
        <DialogContent>
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
          <DialogContentText>
            Are you sure you want to blacklist the user <strong>{record.username}</strong>? 
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="secondary" variant="outlined" disabled={loading}>Cancel</Button>
          <Button onClick={() => blacklistUser(record.id)} color="error" variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : "Confirm"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default BlacklistUserDialog;