import React, { useEffect, useState } from "react";
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, CircularProgress, Alert } from "@mui/material";
import { dataProvider } from "../../../Provider/parseDataProvider";

const BlacklistUserDialog = ({ open, onClose, handleRefresh, record }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(()=>{
    if(record?.isBlackListed){
      setSuccess("This User is already blacklisted.")
    }
  },[record])

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
        handleRefresh()
      }, 3000);
    } catch (error) {
      console.error("Error blacklisting user:", error);
      setError("Failed to blacklist user. Please try again.");
    }
    setLoading(false);
  };

  return (
    <>
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
          {!record?.isBlackListed && (
            <DialogContentText>
              Are you sure you want to blacklist the user{" "}
              <strong>{record.username}</strong>? This action cannot be undone.
            </DialogContentText>
          )}
        </DialogContent>
        {!record?.isBlackListed && (
          <DialogActions
            className="p-16 d-flex w-100 justify-content-between"
            sx={{
              flexDirection: { xs: "column", sm: "row" }, // Column on small screens, row on larger screens
              alignItems: { xs: "center", sm: "stretch" }, // Center items in column, stretch in row
              gap: { xs: 2, sm: 0 }, // Add spacing between buttons in column mode
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
    </>
  );
};

export default BlacklistUserDialog;