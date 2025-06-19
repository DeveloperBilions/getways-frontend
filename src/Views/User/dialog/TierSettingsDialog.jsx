import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Parse from "parse";

export default function TierSettingsDialog({ open, onClose }) {
  const [tiers, setTiers] = useState(); // array: [{ tier: "S", deposit: 0, ... }, ...]
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [validationError, setValidationError] = useState("");
  const fetchTierSettings = async () => {
    try {
      const query = new Parse.Query("Settings");
      query.equalTo("type", "tierValues");
      const obj = await query.first({ useMasterKey: true });
      if (obj) {
        setTiers(obj.get("settings"));
      }
    } catch (error) {
      console.error("Error fetching tier settings:", error);
    }
  };

  const handleChange = (tierKey, field, value) => {
    setTiers((prev) =>
      prev.map((t) =>
        t.tier === tierKey ? { ...t, [field]: Number(value) || 0 } : t
      )
    );
  };

  const handleSave = async () => {
    const isInvalid = tiers.some((tier) =>
      ["deposit", "recharge", "payout"].some(
        (field) => tier[field] === undefined || tier[field] < 0
      )
    );

    if (isInvalid) {
      setValidationError(
        "Please correct all fields — no negative or empty values allowed."
      );
      setTimeout(() => setValidationError(""), 4000); // Auto-clear after 4 sec
      return;
    }

    setLoading(true);
    try {
      const q = new Parse.Query("Settings");
      q.equalTo("type", "tierValues");
      let obj = await q.first({ useMasterKey: true });

      if (!obj) {
        const Settings = Parse.Object.extend("Settings");
        obj = new Settings();
        obj.set("type", "tierValues");
      }

      obj.set("settings", tiers);
      await obj.save(null, { useMasterKey: true });

      setSuccessMsg("Tier settings updated successfully.");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (e) {
      console.error("Error saving tier settings:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) fetchTierSettings();
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 1,
        }}
      >
        <Typography variant="h6" fontWeight={600}>
          Edit Tier Settings
        </Typography>
        <IconButton onClick={onClose} size="small" aria-label="close">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent
        dividers
        sx={{
          "&.MuiDialogContent-dividers": {
            borderBottom: "none", // removes the bottom divider
          },
        }}
      >
        {validationError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {validationError}
          </Alert>
        )}
        {successMsg && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMsg}
          </Alert>
        )}

        {tiers ? (
          tiers.map((tier) => (
            <Box key={tier.tier} sx={{ mb: 3 }}>
              <Typography fontWeight={600} mt={2} mb={1}>
                Tier {tier.tier}
              </Typography>
              <Grid container spacing={2}>
                {["deposit", "recharge", "payout"].map((field) => (
                  <Grid item xs={12} sm={4} key={field}>
                    <TextField
                      fullWidth
                      type="number"
                      label={field.charAt(0).toUpperCase() + field.slice(1)}
                      value={tier[field] ?? ""}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (val >= 0) {
                          handleChange(tier.tier, field, val);
                        }
                      }}
                      error={tier[field] < 0}
                      helperText={
                        tier[field] < 0 ? "Value cannot be negative" : ""
                      }
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))
        ) : (
          <CircularProgress sx={{ my: 4, mx: "auto", display: "block" }} />
        )}
      </DialogContent>

      <DialogActions>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column-reverse", sm: "row" },
            justifyContent: "space-between",
            alignItems: "stretch",
            gap: 2,
            width: "100%",
            px: 2,
            pb: 2,
          }}
        >
          <Button
            onClick={onClose}
            variant="outlined"
            fullWidth
            sx={{ height: 44 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={loading || !tiers}
            fullWidth
            sx={{ height: 44 }}
            startIcon={loading && <CircularProgress size={18} />}
          >
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
