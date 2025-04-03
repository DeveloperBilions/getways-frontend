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
  Divider,
  Stack,
  Grid,
} from "@mui/material";
import Parse from "parse";

const GlobalSettingsDialog = ({ open, onClose }) => {
  const [rechargeEnabled, setRechargeEnabled] = useState(true);
  const [cashoutEnabled, setCashoutEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [agents, setAgents] = useState([]);

  useEffect(() => {
    if (open) {
      fetchSettings();
      fetchAgents();
    }
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
      console.error("Error loading global settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const [rechargeList, cashoutList] = await Promise.all([
        new Parse.Query("Settings").equalTo("type", "allowedMasterAgentsForRecharge").first({ useMasterKey: true }),
        new Parse.Query("Settings").equalTo("type", "allowedMasterAgentsForCashout").first({ useMasterKey: true }),
      ]);
  
      const allowedRechargeIds = rechargeList?.get("settings") || [];
      const allowedCashoutIds = cashoutList?.get("settings") || [];
  
      const userQuery = new Parse.Query(Parse.User);
      userQuery.equalTo("roleName", "Master-Agent");
      const users = await userQuery.find({ useMasterKey: true });
  
      const agentsData = users.map((user) => {
        const id = user.id;
        const username = user.get("username");
  
        return {
          id,
          username,
          rechargeEnabled: allowedRechargeIds.includes(id),
          cashoutEnabled: allowedCashoutIds.includes(id),
        };
      });
  
      setAgents(agentsData);
    } catch (err) {
      console.error("Error fetching agents or allowed list:", err);
    }
  };
  
  const handleSave = async () => {
    setLoading(true);
    try {
      const saveSetting = async (type, valueArray) => {
        const query = new Parse.Query("Settings");
        query.equalTo("type", type);
        let obj = await query.first({ useMasterKey: true });
  
        if (!obj) {
          const Settings = Parse.Object.extend("Settings");
          obj = new Settings();
          obj.set("type", type);
        }
  
        obj.set("settings", valueArray);
        await obj.save(null, { useMasterKey: true });
      };
  
      // Save global settings
      await Promise.all([
        saveSetting("rechargeEnabled", [rechargeEnabled.toString()]),
        saveSetting("cashoutEnabled", [cashoutEnabled.toString()]),
      ]);
  
      // Save selected agent IDs
      const allowedRechargeIds = agents.filter((a) => a.rechargeEnabled).map((a) => a.id);
      const allowedCashoutIds = agents.filter((a) => a.cashoutEnabled).map((a) => a.id);
  
      await Promise.all([
        saveSetting("allowedMasterAgentsForRecharge", allowedRechargeIds),
        saveSetting("allowedMasterAgentsForCashout", allowedCashoutIds),
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
  

  const handleAgentToggle = (agentId, key, value) => {
    setAgents((prev) =>
      prev.map((agent) =>
        agent.id === agentId ? { ...agent, [key]: value } : agent
      )
    );
  };

  const toggleAllAgents = (key, value) => {
    setAgents((prev) =>
      prev.map((agent) => ({
        ...agent,
        [key]: value,
      }))
    );
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
            label={<Typography fontSize="16px">Enable Recharge (Global)</Typography>}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={cashoutEnabled}
                onChange={(e) => setCashoutEnabled(e.target.checked)}
              />
            }
            label={<Typography fontSize="16px">Enable Cashout (Global)</Typography>}
          />
        </Box>

        {agents.length > 0 && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" fontSize="16px" fontWeight={600} mb={1}>
              Master Agent Overrides
            </Typography>

            {/* Select All checkboxes */}
            {/* <Box display="flex" justifyContent="space-between" mb={2}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={agents.every((a) => a.rechargeEnabled)}
                    indeterminate={
                      agents.some((a) => a.rechargeEnabled) &&
                      !agents.every((a) => a.rechargeEnabled)
                    }
                    onChange={(e) =>
                      toggleAllAgents("rechargeEnabled", e.target.checked)
                    }
                  />
                }
                label="Select All Recharge"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={agents.every((a) => a.cashoutEnabled)}
                    indeterminate={
                      agents.some((a) => a.cashoutEnabled) &&
                      !agents.every((a) => a.cashoutEnabled)
                    }
                    onChange={(e) =>
                      toggleAllAgents("cashoutEnabled", e.target.checked)
                    }
                  />
                }
                label="Select All Cashout"
              />
            </Box> */}

            <Stack spacing={2}>
              {agents.map((agent) => (
                <Grid
                  key={agent.id}
                  container
                  alignItems="center"
                  spacing={2}
                  sx={{ borderBottom: "1px solid #eee", pb: 1 }}
                >
                  <Grid item xs={4}>
                    <Typography>{agent.username}</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={agent.rechargeEnabled}
                          onChange={(e) =>
                            handleAgentToggle(agent.id, "rechargeEnabled", e.target.checked)
                          }
                        />
                      }
                      label="Recharge"
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={agent.cashoutEnabled}
                          onChange={(e) =>
                            handleAgentToggle(agent.id, "cashoutEnabled", e.target.checked)
                          }
                        />
                      }
                      label="Cashout"
                    />
                  </Grid>
                </Grid>
              ))}
            </Stack>
          </>
        )}
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
