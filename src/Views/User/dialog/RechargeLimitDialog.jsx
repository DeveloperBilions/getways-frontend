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
  Alert,
  Switch
} from "@mui/material";
import { Parse } from "parse";

const RechargeLimitDialog = ({ open, onClose, record, handleRefresh }) => {
  const [monthlyLimit, setMonthlyLimit] = useState("");
  const [dailyLimit, setDailyLimit] = useState("");
  const [activeLimit, setActiveLimit] = useState(""); // No default selection
  const [limitEnabled, setLimitEnabled] = useState(true); // Switch state
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [inputErrors, setInputErrors] = useState({}); // Store input validation errors

  // Load existing values when the dialog opens
  useEffect(() => {
    if (record) {
      setMonthlyLimit(record?.monthlyRechargeLimit || "");
      setDailyLimit(record?.dailyRechargeLimit || "");
      setActiveLimit(record?.activeRechargeLimit || "");
      setLimitEnabled(!!record?.activeRechargeLimit); // Enable switch if activeRechargeLimit exists
    }
  }, [record, open]);

  // Validate only if user enters data
  const validateInputs = () => {
    let errors = {};

    if (limitEnabled) {
      if (monthlyLimit !== "" && (isNaN(monthlyLimit) || monthlyLimit < 0)) {
        errors.monthlyLimit = "Monthly limit must be at least 0.";
      }
      if (dailyLimit !== "" && (isNaN(dailyLimit) || dailyLimit < 0 || dailyLimit > 50000)) {
        errors.dailyLimit = "Daily limit must be between 0 and 50000.";
      }
      if (!activeLimit) {
        errors.activeLimit = "Please select an active recharge limit.";
      }
    }

    setInputErrors(errors);
    return Object.keys(errors).length === 0; // Return true if no errors
  };

  // Handle Save
  const handleSave = async () => {
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    // Run validation before saving
    if (!validateInputs()) {
      setLoading(false);
      return;
    }

    try {
      if (!record?.id) {
        throw new Error("No user record selected.");
      }

      // Fetch user from Parse
      const userQuery = new Parse.Query(Parse.User);
      const user = await userQuery.get(record.id, { useMasterKey: true });

      // If restriction is OFF, clear activeRechargeLimit
      if (!limitEnabled) {
        user.set("activeRechargeLimit", "");
      } else {
        user.set("activeRechargeLimit", activeLimit); // Set active limit if enabled
      }

      // Update limits only if restriction is ON
      user.set("monthlyRechargeLimit", limitEnabled ? Number(monthlyLimit) : 0);
      user.set("dailyRechargeLimit", limitEnabled ? Number(dailyLimit) : 0);

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

          {/* Switch to Enable/Disable Limits */}
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="subtitle1" fontWeight="bold">
              Enable Recharge Limit Restriction
            </Typography>
            <Switch
              checked={limitEnabled}
              onChange={(e) => {
                setLimitEnabled(e.target.checked);
                if (!e.target.checked) {
                  setInputErrors({}); // Clear errors when turning off restriction
                }
              }}
            />
          </Box>

          {/* Monthly Recharge Limit */}
          <TextField
            fullWidth
            variant="outlined"
            label="Monthly Recharge Limit"
            type="number"
            value={monthlyLimit}
            onChange={(e) => setMonthlyLimit(e.target.value)}
            error={!!inputErrors.monthlyLimit}
            helperText={inputErrors.monthlyLimit}
            disabled={!limitEnabled} // Disable input if restriction is OFF
          />

          {/* Daily Recharge Limit */}
          <TextField
            fullWidth
            variant="outlined"
            label="Daily Recharge Limit"
            type="number"
            value={dailyLimit}
            onChange={(e) => setDailyLimit(e.target.value)}
            error={!!inputErrors.dailyLimit}
            helperText={inputErrors.dailyLimit}
            disabled={!limitEnabled} // Disable input if restriction is OFF
          />

          {/* Active Recharge Limit Selection */}
          {limitEnabled && (
            <>
              <Typography variant="subtitle1" fontWeight="bold">
                Select Active Recharge Limit:
              </Typography>
              <RadioGroup
                value={activeLimit}
                onChange={(e) => setActiveLimit(e.target.value)}
              >
                <FormControlLabel value="daily" control={<Radio />} label="Set Daily Limit as Active" />
                <FormControlLabel value="monthly" control={<Radio />} label="Set Monthly Limit as Active" />
              </RadioGroup>
              {inputErrors.activeLimit && (
                <Typography variant="caption" color="error">
                  {inputErrors.activeLimit}
                </Typography>
              )}
            </>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ padding: 2 }}>
        <Button onClick={onClose} variant="outlined" color="secondary" disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          color="primary" 
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RechargeLimitDialog;
