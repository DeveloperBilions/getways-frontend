import React, { useEffect, useState } from "react";
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
  const [isCurrentlyDisabled, setIsRechargeDisabled] = useState(record?.rechargeDisabled);
  useEffect(() => {
    setIsRechargeDisabled(record?.rechargeDisabled);
  }, [record]);
  
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

      setSuccessMessage(
        `Recharge ${disable ? "disabled" : "enabled"} successfully!`
      );
      setIsRechargeDisabled(disable); // ✅ Update local state

      if (handleRefresh) {
        handleRefresh();
      }

      setTimeout(() => {
        setSuccessMessage("");
        onClose();
      }, 3000);
    } catch (error) {
      console.error("Error updating recharge permission:", error.message);
      setErrorMessage(
        "Failed to update recharge permission. Please try again."
      );
      setTimeout(() => {
        setErrorMessage("");
      }, 3000);
    } finally {
      setLoading(false);
    }
  };


  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {isCurrentlyDisabled ? "Enable Recharge" : "Disable Recharge"}
      </DialogTitle>
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
      <DialogActions sx={{ padding: 2, width: "100%" }}>
        <Button
          onClick={onClose}
          disabled={loading}
          color="info"
          variant="outlined"
          sx={{ width: "50%", paddingBottom: "10px", paddingTop: "10px" }}
        >
          Cancel
        </Button>
        <Button
          onClick={() => handleRechargeToggle(!isCurrentlyDisabled)}
          disabled={loading}
          color="primary"
          variant="contained"
          sx={{ width: "50%", paddingBottom: "10px", paddingTop: "10px" }}
        >
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
          {isCurrentlyDisabled ? "Enable" : "Disable"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DisableRechargeDialog;
