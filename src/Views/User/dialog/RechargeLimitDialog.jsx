import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  Typography,
  Box,
  CircularProgress,
  Alert
} from "@mui/material";
import { Parse } from "parse";

const RechargeLimitDialog = ({ open, onClose, record, handleRefresh }) => {
  const [monthlyLimit, setMonthlyLimit] = useState("");
  const [dailyLimit, setDailyLimit] = useState("");
  const [activeLimit, setActiveLimit] = useState(""); // No default selection
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Load existing values when the dialog opens
  useEffect(() => {
    if (record) {
      setMonthlyLimit(record?.monthlyRechargeLimit || ""); // Load or keep empty
      setDailyLimit(record?.dailyRechargeLimit || ""); // Load or keep empty
      setActiveLimit(record?.activeRechargeLimit || ""); // Load or keep empty
    }
  }, [record, open]);

  // Validate only if user enters data
  const validateInputs = () => {
    let errors = {};
    if (monthlyLimit && monthlyLimit <= 0) {
      errors.monthlyLimit = "Must be a positive number";
    }
    if (dailyLimit && dailyLimit <= 0) {
      errors.dailyLimit = "Must be a positive number";
    }
    return errors;
  };

  // Handle Save
  const handleSave = async () => {
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      if (!record?.id) {
        throw new Error("No user record selected.");
      }

      // Fetch user from Parse
      const userQuery = new Parse.Query(Parse.User);
      const user = await userQuery.get(record.id, { useMasterKey: true });

      // Update fields only if values are provided
      if (monthlyLimit) user.set("monthlyRechargeLimit", Number(monthlyLimit));
      if (dailyLimit) user.set("dailyRechargeLimit", Number(dailyLimit));
      if (activeLimit) user.set("activeRechargeLimit", activeLimit); // "daily" or "monthly"

      // Save updated record
      await user.save(null, { useMasterKey: true });

      setSuccessMessage("Recharge limits updated successfully!");
      if (handleRefresh) handleRefresh(); // Refresh parent data

      // Close after success
      setTimeout(() => {
        onClose();
        setSuccessMessage("");
        setErrorMessage("");
      }, 2000);
    } catch (error) {
      console.error("Error updating recharge limits:", error);
      setErrorMessage("Failed to update recharge limits. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h5" align="center" fontWeight="bold">
          Set Recharge Limits
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2} marginTop={2}>
          {/* Show Messages */}
          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
          {successMessage && <Alert severity="success">{successMessage}</Alert>}

          {/* Monthly Recharge Limit */}
          <TextField
            fullWidth
            variant="outlined"
            label="Monthly Recharge Limit"
            type="number"
            value={monthlyLimit}
            onChange={(e) => setMonthlyLimit(e.target.value)}
            error={!!validateInputs().monthlyLimit}
            helperText={validateInputs().monthlyLimit}
          />

          {/* Daily Recharge Limit */}
          <TextField
            fullWidth
            variant="outlined"
            label="Daily Recharge Limit"
            type="number"
            value={dailyLimit}
            onChange={(e) => setDailyLimit(e.target.value)}
            error={!!validateInputs().dailyLimit}
            helperText={validateInputs().dailyLimit}
          />

          {/* Active Recharge Limit Selection */}
          <Typography variant="subtitle1" fontWeight="bold">
            Select Active Recharge Limit:
          </Typography>
          <RadioGroup value={activeLimit} onChange={(e) => setActiveLimit(e.target.value)}>
            <FormControlLabel value="daily" control={<Radio />} label="Set Daily Limit as Active" />
            <FormControlLabel value="monthly" control={<Radio />} label="Set Monthly Limit as Active" />
          </RadioGroup>
        </Box>
      </DialogContent>

      <DialogActions sx={{ padding: 2 }}>
        <Button onClick={onClose} variant="outlined" color="secondary" disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained" color="primary" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RechargeLimitDialog;
