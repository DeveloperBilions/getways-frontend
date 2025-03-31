import React, { useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Box,
} from "@mui/material";
import { Parse } from "parse";
Parse.initialize(process.env.REACT_APP_APPID, process.env.REACT_APP_MASTER_KEY);
Parse.serverURL = process.env.REACT_APP_URL;
const DisableRechargeDialog = ({ open, onClose, record, handleRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const handleRechargeToggle = async (disable) => {
    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      if (!record?.id) {
        throw new Error("No user record selected.");
      }

      // Directly update rechargeDisabled flag
      const userQuery = new Parse.Query(Parse.User);
      const user = await userQuery.get(record.id, { useMasterKey: true });
      user.set("rechargeDisabled", disable);
      await user.save(null, { useMasterKey: true });

      setSuccessMessage(`Recharge ${disable ? "disabled" : "enabled"} successfully!`);

      if (handleRefresh) {
        handleRefresh();
      }

      setTimeout(() => {
        setSuccessMessage("");
        onClose();
      }, 3000);
    } catch (error) {
      console.error("Error updating recharge permission:", error.message);
      setErrorMessage("Failed to update recharge permission. Please try again.");
      setTimeout(() => {
        setErrorMessage("");
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  const isCurrentlyDisabled = record?.rechargeDisabled;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isCurrentlyDisabled ? "Enable Recharge" : "Disable Recharge"}</DialogTitle>
      <DialogContent>
        <Typography mb={2}>
          Are you sure you want to{" "}
          <b>{isCurrentlyDisabled ? "enable" : "disable"}</b> recharge for user{" "}
          <b>{record.username}</b>?
        </Typography>

        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Box position="relative">
          <Button
            color={isCurrentlyDisabled ? "primary" : "error"}
            onClick={() => handleRechargeToggle(!isCurrentlyDisabled)}
            disabled={loading}
            variant="contained"
          >
            {isCurrentlyDisabled ? "Enable" : "Disable"}
          </Button>
          {loading && (
            <CircularProgress
              size={24}
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                marginTop: "-12px",
                marginLeft: "-12px",
              }}
            />
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default DisableRechargeDialog;