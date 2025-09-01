import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  CircularProgress,
  Alert,
  TextField,
  MenuItem,
} from "@mui/material";
import { dataProvider } from "../../../Provider/parseDataProvider";

const reasonOptions = ["Charge Back", "Dispute", "Other"];

const BlacklistUserDialog = ({ open, onClose, handleRefresh, record }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [reason, setReason] = useState("");
  const [customReason, setCustomReason] = useState("");

  useEffect(() => {
    if (open && record) {
      if (record.isBlackListed) {
        const reasonShown = record?.blacklistReason?.trim() || "No reason provided";
        setSuccess(`User is already blacklisted for: ${reasonShown}`);
      } else {
        setSuccess("");
      }
  
      // Always reset these when opening
      setError("");
      setReason("");
      setCustomReason("");
    }
  }, [open, record]);  

  if (!record) return null;
  const blacklistUser = async (userId) => {
    if (!reason || (reason === "Other" && !customReason.trim())) {
      setError("Please provide a valid reason.");
      return;
    }

    const finalReason = reason === "Other" ? customReason.trim() : reason;

    setLoading(true);
    setSuccess("");
    setError("");

    try {
      await dataProvider.update("users", {
        id: userId,
        data: {
          isBlackListed: true,
          blacklistReason: finalReason,
        },
      });

      handleRefresh();
      setSuccess(`User successfully blacklisted for: ${finalReason}`);
      setTimeout(() => {
        setSuccess("");
        setReason("");
        setCustomReason("");
        onClose();
      }, 3000);
    } catch (error) {
      console.error("Error blacklisting user:", error);
      setError("Failed to blacklist user. Please try again.");
    }

    setLoading(false);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      sx={{
        "& .MuiDialog-paper": {
          maxWidth: "500px",
          padding: "16px",
        },
        "& .css-ypiqx9-MuiDialogContent-root": {
          padding: "14px 12px",
        },
        "& .css-1cak187-MuiTypography-root-MuiDialogTitle-root": {
          padding: "12px 12px",
        },
      }}
    >
      <DialogTitle className="custom-modal-header">
        Confirm Blacklist
      </DialogTitle>

      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        {!record?.isBlackListed && (
          <>
            <DialogContentText sx={{ mb: 2 }}>
              Are you sure you want to blacklist the user{" "}
              <strong>{record.username}</strong>? This action cannot be undone.
            </DialogContentText>

            <TextField
              select
              label="Reason for Blacklisting"
              fullWidth
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              sx={{ mb: 2 }}
            >
              {reasonOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>

            {reason === "Other" && (
              <TextField
                label="Custom Reason"
                fullWidth
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                multiline
                rows={2}
                sx={{ mb: 2 }}
              />
            )}
          </>
        )}
      </DialogContent>

      {!record?.isBlackListed && (
        <DialogActions
          className="p-16 d-flex w-100 justify-content-between"
          sx={{
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "center", sm: "stretch" },
            gap: { xs: 2, sm: 0 },
            marginBottom: { xs: 2, sm: 2 },
          }}
        >
          <Button
            onClick={() => blacklistUser(record.id)}
            color="error"
            variant="contained"
            disabled={loading}
            className="custom-button"
          >
            {loading ? <CircularProgress size={24} /> : "Confirm"}
          </Button>
          <Button
            onClick={onClose}
            color="secondary"
            variant="outlined"
            disabled={loading}
            className="custom-button cancel mx-2"
          >
            Cancel
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default BlacklistUserDialog;
