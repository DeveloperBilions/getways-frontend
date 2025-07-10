import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  IconButton,
  MenuItem,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import Parse from "parse";

export default function ShuffleConfigModal({
  open,
  onClose,
}) {
  const [entries, setEntries] = useState([]);
  const [errors, setErrors] = useState([]);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusSeverity, setStatusSeverity] = useState("success");
  const [saving, setSaving] = useState(false);
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [methodsError, setMethodsError] = useState("");

  useEffect(() => {
    if (!open) return;

    const fetchData = async () => {
      setLoading(true);
      setMethodsError("");
      setEntries([]);
      setErrors([]);
      setStatusMessage("");

      try {
        // Load payment methods
        const RechargeMethod = Parse.Object.extend("RechargeMethod");
        const methodsQuery = new Parse.Query(RechargeMethod);
        methodsQuery.ascending("name");
        const methodsResults = await methodsQuery.find({ useMasterKey: true });

        const mappedMethods = methodsResults.map((r) => ({
          label: r.get("name"),
          value: r.get("nameLower"),
        }));
        setMethods(mappedMethods);

        // Load saved configurations
        const RechargeThreshold = Parse.Object.extend("RechargeThresholds");
        const thresholdsQuery = new Parse.Query(RechargeThreshold);
        thresholdsQuery.equalTo("isActive", true);
        thresholdsQuery.ascending("createdAt");
        const thresholdsResults = await thresholdsQuery.find({
          useMasterKey: true,
        });

        const mappedEntries = thresholdsResults.map((t) => ({
          min: t.get("minAmount").toString(),
          max: t.get("maxAmount").toString(),
          methods: t.get("targetPaymentMethods") || [],
        }));

        setEntries(mappedEntries);
      } catch (err) {
        console.error("Error loading data:", err);
        setMethodsError(
          "Failed to load payment methods or saved configurations."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [open]);

  const addEntry = () => {
    setEntries((prev) => [...prev, { min: "", max: "", methods: [] }]);
  };

  const removeEntry = async (index) => {
    const entry = entries[index];
  
    // Optional: if you saved Parse IDs on load, you can use them here to delete the specific object
    if (entry.objectId) {
      try {
        setSaving(true);
        const RechargeThreshold = Parse.Object.extend("RechargeThresholds");
        const query = new Parse.Query(RechargeThreshold);
        const threshold = await query.get(entry.objectId, { useMasterKey: true });
        await threshold.destroy({ useMasterKey: true });
      } catch (err) {
        console.error("Error deleting threshold:", err);
        setStatusMessage("Failed to delete this shuffle.");
        setStatusSeverity("error");
        setTimeout(() => setStatusMessage(""), 3000);
        setSaving(false);
        return;
      }
    }
  
    // Remove from local state
    setEntries((prev) => prev.filter((_, i) => i !== index));
    setSaving(false);
  };

  const handleChange = (index, field, value) => {
    setEntries((prev) =>
      prev.map((entry, i) =>
        i === index ? { ...entry, [field]: value } : entry
      )
    );
  };

  const validateAndSave = async () => {
    const validationErrors = [];
    const allUsedMethods = new Set();
  
    entries.forEach((entry, i) => {
      if (!entry.min || !entry.max || !entry.methods || entry.methods.length === 0) {
        validationErrors.push(`Entry #${i + 1}: All fields are required.`);
      }
      if (Number(entry.min) <= 0 || Number(entry.max) <= 0) {
        validationErrors.push(`Entry #${i + 1}: Amounts must be positive numbers.`);
      }
      if (Number(entry.min) >= Number(entry.max)) {
        validationErrors.push(`Entry #${i + 1}: Min must be less than Max.`);
      }
      if (entry.methods.length < 2) {
        validationErrors.push(`Entry #${i + 1}: Select at least 2 payment methods.`);
      }
      entry.methods.forEach((method) => {
        if (allUsedMethods.has(method)) {
          validationErrors.push(`Entry #${i + 1}: Payment method "${method}" is used in multiple shuffles.`);
        }
        allUsedMethods.add(method);
      });
    });
  
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setStatusMessage("Please correct the errors above.");
      setStatusSeverity("error");
      setTimeout(() => setStatusMessage(""), 3000);
      return;
    }
  
    setErrors([]);
    setSaving(true);
    setStatusMessage("");
  
    try {
      const RechargeThreshold = Parse.Object.extend("RechargeThresholds");
      const RechargeThresholdsHistory = Parse.Object.extend("RechargeThresholdsHistory");
  
      for (const entry of entries) {
        const methodsHash = entry.methods.slice().sort().join("|");
  
        // Check if already exists
        const existingQuery = new Parse.Query(RechargeThreshold);
        existingQuery.equalTo("methodsHash", methodsHash);
        const existing = await existingQuery.first({ useMasterKey: true });
  
        let savedThreshold;
        if (existing) {
          // Update min/max
          existing.set("minAmount", Number(entry.min));
          existing.set("maxAmount", Number(entry.max));
          savedThreshold = await existing.save(null, { useMasterKey: true });
        } else {
          // Create new
          const thresholdObj = new RechargeThreshold();
          thresholdObj.set("minAmount", Number(entry.min));
          thresholdObj.set("maxAmount", Number(entry.max));
          thresholdObj.set("targetPaymentMethods", entry.methods);
          thresholdObj.set("methodsHash", methodsHash);
          thresholdObj.set("isActive", true);
          savedThreshold = await thresholdObj.save(null, { useMasterKey: true });
        }
  
        // Same logic as before for history
        const historyQuery = new Parse.Query(RechargeThresholdsHistory);
        historyQuery.equalTo("thresholdId", savedThreshold.id);
        historyQuery.equalTo("isActive", true);
        const activeHistory = await historyQuery.first({ useMasterKey: true });
  
        if (!activeHistory) {
          const history = new RechargeThresholdsHistory();
          history.set("thresholdId", savedThreshold.id);
          history.set("currentPaymentMethod", entry.methods[0]);
  
          // ✅ Generate random amount in steps of 10:
          const min = Number(entry.min);
          const max = Number(entry.max);
          const start = Math.ceil(min / 10);
          const end = Math.floor(max / 10);
          if (start > end) {
            throw new Error(`No valid 10-multiple amount between ${min} and ${max}.`);
          }
          const options = [];
          for (let i = start; i <= end; i++) {
            options.push(i * 10);
          }
          const randomAmount = options[Math.floor(Math.random() * options.length)];
  
          history.set("pendingRandomAmount", randomAmount);
          history.set("pendingAmount", max);
          history.set("isActive", true);
          await history.save(null, { useMasterKey: true });
        }
      }
  
      setStatusMessage("Configurations saved successfully!");
      setStatusSeverity("success");
      setTimeout(() => {
        setStatusMessage("");
        setEntries([]);
        onClose();
      }, 3000);
    } catch (err) {
      console.error("Save error:", err);
      setErrors([err.message || "Failed to save configurations."]);
      setStatusMessage("Failed to save configurations.");
      setStatusSeverity("error");
      setTimeout(() => setStatusMessage(""), 3000);
    } finally {
      setSaving(false);
    }
  };
  
  // Compute which methods are selected across all entries to disable them in other selects
  const allSelectedMethods = entries.reduce((acc, entry) => {
    entry.methods.forEach((m) => acc.add(m));
    return acc;
  }, new Set());

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Configure Recharge Shuffles</DialogTitle>
      <DialogContent dividers>
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {!loading && methodsError && (
          <Typography color="error" sx={{ mb: 2 }}>
            {methodsError}
          </Typography>
        )}

        {!loading && !methodsError && (
          <>
            <Box sx={{ mb: 2 }}>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={addEntry}
                disabled={saving}
              >
                Add Shuffle Range
              </Button>
            </Box>

            {entries.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                No shuffle ranges configured.
              </Typography>
            )}

            {entries.map((entry, index) => (
              <Box
                key={index}
                sx={{
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  p: 2,
                  mb: 2,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    flexWrap: "wrap",
                  }}
                >
                  <TextField
                    label="Min Amount"
                    type="number"
                    value={entry.min}
                    onChange={(e) => handleChange(index, "min", e.target.value)}
                    sx={{ width: "120px" }}
                    disabled={saving}
                  />
                  <TextField
                    label="Max Amount"
                    type="number"
                    value={entry.max}
                    onChange={(e) => handleChange(index, "max", e.target.value)}
                    sx={{ width: "120px" }}
                    disabled={saving}
                  />
                  <TextField
                    select
                    label="Payment Methods"
                    value={entry.methods}
                    onChange={(e) =>
                      handleChange(index, "methods", e.target.value)
                    }
                    SelectProps={{ multiple: true }}
                    sx={{ minWidth: "250px" }}
                    disabled={saving}
                  >
                    {methods.map((method) => (
                      <MenuItem
                        key={method.value}
                        value={method.value}
                        disabled={
                          allSelectedMethods.has(method.value) &&
                          !entry.methods.includes(method.value)
                        }
                      >
                        {method.label}
                      </MenuItem>
                    ))}
                  </TextField>
                  <IconButton
                    onClick={() => removeEntry(index)}
                    color="error"
                    disabled={saving}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
            ))}

            {errors.length > 0 && (
              <Box sx={{ mt: 2 }}>
                {errors.map((error, i) => (
                  <Typography
                    key={i}
                    color="error"
                    variant="body2"
                    sx={{ mb: 0.5 }}
                  >
                    • {error}
                  </Typography>
                ))}
              </Box>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={validateAndSave}
          disabled={saving || loading || !!methodsError}
          startIcon={saving && <CircularProgress size={16} />}
        >
          {saving ? "Saving..." : "Save Configurations"}
        </Button>
      </DialogActions>

      {statusMessage && (
        <Box sx={{ p: 2 }}>
          <Alert severity={statusSeverity}>{statusMessage}</Alert>
        </Box>
      )}
    </Dialog>
  );
}
