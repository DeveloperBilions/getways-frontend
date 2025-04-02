import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
  Button,
  Box,
  Alert,
  CircularProgress,
  Typography,
} from "@mui/material";
import Parse from "parse";

const GlobalSettingsDialog = ({ open, onClose }) => {
  const [rechargeEnabled, setRechargeEnabled] = useState(true);
  const [cashoutEnabled, setCashoutEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (open) fetchSettings();
  }, [open]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const rechargeQuery = new Parse.Query("Settings");
      rechargeQuery.equalTo("type", "rechargeEnabled");
      const rechargeSetting = await rechargeQuery.first({ useMasterKey: true });

      const cashoutQuery = new Parse.Query("Settings");
      cashoutQuery.equalTo("type", "cashoutEnabled");
      const cashoutSetting = await cashoutQuery.first({ useMasterKey: true });

      if (rechargeSetting) {
        const val = rechargeSetting.get("settings")?.[0];
        setRechargeEnabled(val === "true");
      }
      if (cashoutSetting) {
        const val = cashoutSetting.get("settings")?.[0];
        setCashoutEnabled(val === "true");
      }
    } catch (err) {
      console.error("Error loading settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const saveSetting = async (type, value) => {
        const query = new Parse.Query("Settings");
        query.equalTo("type", type);
        let obj = await query.first({ useMasterKey: true });

        if (!obj) {
          const Settings = Parse.Object.extend("Settings");
          obj = new Settings();
          obj.set("type", type);
        }

        obj.set("settings", [value.toString()]);
        await obj.save(null, { useMasterKey: true });
      };

      await Promise.all([
        saveSetting("rechargeEnabled", rechargeEnabled),
        saveSetting("cashoutEnabled", cashoutEnabled),
      ]);

      setSuccessMsg("Settings updated successfully!");
      setTimeout(() => {
        setSuccessMsg("");
        onClose();
      }, 3000);
    } catch (err) {
      console.error("Error saving settings:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600, fontSize: "20px" }}>
        Global Recharge & Cashout Settings
      </DialogTitle>
      <DialogContent dividers>
        {successMsg && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMsg}
          </Alert>
        )}

        <Box display="flex" flexDirection="column" gap={2} mt={1}>
          <FormControlLabel
            control={
              <Checkbox
                checked={rechargeEnabled}
                onChange={(e) => setRechargeEnabled(e.target.checked)}
              />
            }
            label={<Typography fontSize="16px">Enable Recharge</Typography>}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={cashoutEnabled}
                onChange={(e) => setCashoutEnabled(e.target.checked)}
              />
            }
            label={<Typography fontSize="16px">Enable Cashout</Typography>}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit" disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={loading}
          startIcon={loading && <CircularProgress size={18} color="inherit" />}
        >
          {loading ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GlobalSettingsDialog;
