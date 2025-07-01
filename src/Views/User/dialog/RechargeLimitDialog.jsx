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
  Switch,
  
} from "@mui/material";
import {
  Col
} from "reactstrap";
import { Parse } from "parse";
import { useGetIdentity } from "react-admin";

const RechargeLimitDialog = ({ open, onClose, record, handleRefresh }) => {
  const role = localStorage.getItem("role");
  const { identity } = useGetIdentity();
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
  
    if (!validateInputs()) {
      setLoading(false);
      return;
    }
  
    try {
      if (!record?.id) {
        throw new Error("No user record selected.");
      }
  
      const currentRole = role;
  
      // If current user is Master-Agent, validate against Super-User config
      if (currentRole === "Master-Agent") {
        const configQuery = new Parse.Query("RechargeLimitConfig");
        configQuery.equalTo("userId", record.id);  // Filter by the record's userId
        const superUserConfig = await configQuery.first({ useMasterKey: true });
  
        if (superUserConfig) {
          const maxDailyLimit = superUserConfig.get("maxDailyLimit") || 0;
          const maxMonthlyLimit = superUserConfig.get("maxMonthlyLimit") || 0;
  
          if (Number(dailyLimit) > maxDailyLimit) {
            setErrorMessage(`Daily limit cannot exceed Super-User's daily limit of ${maxDailyLimit}.`);
            setLoading(false);
            return;
          }
          if (Number(monthlyLimit) > maxMonthlyLimit) {
            setErrorMessage(`Monthly limit cannot exceed Super-User's monthly limit of ${maxMonthlyLimit}.`);
            setLoading(false);
            return;
          }
        }
      }
  
      // Fetch user record to update
      const userQuery = new Parse.Query(Parse.User);
      const user = await userQuery.get(record.id, { useMasterKey: true });
  
      if (!limitEnabled) {
        user.set("activeRechargeLimit", "");
      } else {
        user.set("activeRechargeLimit", activeLimit);
      }
  
      user.set("monthlyRechargeLimit", limitEnabled ? Number(monthlyLimit) : 0);
      user.set("dailyRechargeLimit", limitEnabled ? Number(dailyLimit) : 0);
      user.set("limitLastUpdatedByRole", currentRole);
  
      // Update global config if current role is Super-User
      if (currentRole === "Super-User") {
        const configQuery = new Parse.Query("RechargeLimitConfig");
        let config = await configQuery.first({ useMasterKey: true });
  
        if (!config) {
          const Config = Parse.Object.extend("RechargeLimitConfig");
          config = new Config();
        }
  
        config.set("maxDailyLimit", Number(dailyLimit));
        config.set("maxMonthlyLimit", Number(monthlyLimit));
        config.set("updatedBy", identity?.objectId);
        config.set("userId", record?.id);
        await config.save(null, { useMasterKey: true });
      }
  
      await user.save(null, { useMasterKey: true });
  
      setSuccessMessage("Recharge limits updated successfully!");
      if (handleRefresh) handleRefresh();
  
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

      <DialogActions sx={{ padding: 2 }} className="custom-modal-footer">
      <Col md={12}>
      <Box className="d-flex w-100 justify-content-between"
            sx={{
              flexDirection: { xs: "column-reverse", sm: "row" }, // 🔁 Reverse order on mobile
              alignItems: { xs: "stretch", sm: "stretch" }, // Stretch items to take full width in both modes
              gap: { xs: 2, sm: 2 }, // Add spacing between buttons
              marginBottom: { xs: 2, sm: 2 }, // Add margin at the bottom
              width: "100% !important", // Ensure the container takes full width
              paddingRight: { xs: 0, sm: 1 },
            }}>
        <Button onClick={onClose}  disabled={loading} className="custom-button cancel" >
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          disabled={loading}
          className="custom-button confirm"

        >
          {loading ? <CircularProgress size={24} /> : "Save"}
        </Button>
        </Box>
        </Col>
      </DialogActions>
    </Dialog>
  );
};

export default RechargeLimitDialog;
