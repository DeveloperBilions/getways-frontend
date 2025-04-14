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
  TextField,
} from "@mui/material";
import Parse from "parse";

const GlobalSettingsDialog = ({ open, onClose }) => {
  const [rechargeEnabled, setRechargeEnabled] = useState(true);
  const [cashoutEnabled, setCashoutEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [masterAgents, setMasterAgents] = useState([]);
  const [subAgents, setSubAgents] = useState([]);
  const [agents, setAgents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (open) {
      fetchSettings();
      fetchAgents();
    }
  }, [open, searchTerm]);

  
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
        new Parse.Query("Settings")
          .equalTo("type", "allowedMasterAgentsForRecharge")
          .first({ useMasterKey: true }),
        new Parse.Query("Settings")
          .equalTo("type", "allowedMasterAgentsForCashout")
          .first({ useMasterKey: true }),
      ]);

      const allowedRechargeIds = rechargeList?.get("settings") || [];
      const allowedCashoutIds = cashoutList?.get("settings") || [];

      const superAdmins = await new Parse.Query(Parse.User)
        .equalTo("roleName", "Super-User")
        .find({ useMasterKey: true });
      const superAdminIds = superAdmins.map((user) => user.id);

      const subAgentQuery = new Parse.Query(Parse.User);
     // subAgentQuery.containedIn("userParentId", superAdminIds);
      subAgentQuery.equalTo("roleName", "Agent");
      subAgentQuery.limit(10);

      const masterAgentQuery = new Parse.Query(Parse.User);
      masterAgentQuery.equalTo("roleName", "Master-Agent");
      masterAgentQuery.limit(10);

      if (searchTerm.trim() !== "") {
        const regex = `.*${searchTerm.trim()}.*`;
        subAgentQuery.matches("username", regex, "i");
        masterAgentQuery.matches("username", regex, "i");
      }

      const [masters, subs] = await Promise.all([
        masterAgentQuery.find({ useMasterKey: true }),
        subAgentQuery.find({ useMasterKey: true }),
      ]);

      const toAgentObject = (user) => ({
        id: user.id,
        username: user.get("username"),
        rechargeEnabled: allowedRechargeIds.includes(user.id),
        cashoutEnabled: allowedCashoutIds.includes(user.id),
      });

      const masterIds = new Set(masters.map((m) => m.id));
      const filteredSubs = subs.filter((s) => !masterIds.has(s.id));

      const mastersMapped = masters.map(toAgentObject);
      const subsMapped = filteredSubs.map(toAgentObject);

      setMasterAgents(mastersMapped);
      setSubAgents(subsMapped);
      setAgents([...mastersMapped, ...subsMapped]);
    } catch (err) {
      console.error("Error fetching agents:", err);
    }
  };

  const handleAgentToggle = (agentId, key, value) => {
    setAgents((prev) =>
      prev.map((agent) =>
        agent.id === agentId ? { ...agent, [key]: value } : agent
      )
    );
    setMasterAgents((prev) =>
      prev.map((agent) =>
        agent.id === agentId ? { ...agent, [key]: value } : agent
      )
    );
    setSubAgents((prev) =>
      prev.map((agent) =>
        agent.id === agentId ? { ...agent, [key]: value } : agent
      )
    );
  };

  const toggleAll = (list, key, value) => {
    const ids = list.map((a) => a.id);

    setAgents((prev) =>
      prev.map((a) => (ids.includes(a.id) ? { ...a, [key]: value } : a))
    );
    setMasterAgents((prev) =>
      prev.map((a) => (ids.includes(a.id) ? { ...a, [key]: value } : a))
    );
    setSubAgents((prev) =>
      prev.map((a) => (ids.includes(a.id) ? { ...a, [key]: value } : a))
    );
  };

  const areAllSelected = (list, key) => list.length > 0 && list.every((a) => a[key]);
  const isIndeterminate = (list, key) =>
    list.some((a) => a[key]) && !areAllSelected(list, key);

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

      const allowedRechargeIds = agents.filter((a) => a.rechargeEnabled).map((a) => a.id);
      const allowedCashoutIds = agents.filter((a) => a.cashoutEnabled).map((a) => a.id);

      await Promise.all([
        saveSetting("rechargeEnabled", [rechargeEnabled.toString()]),
        saveSetting("cashoutEnabled", [cashoutEnabled.toString()]),
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

  const AgentRow = ({ agent }) => {
    return (
      <Grid container alignItems="center" spacing={2} sx={{ borderBottom: "1px solid #eee", pb: 1 }}>
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

        <TextField
          fullWidth
          placeholder="Search agents by username..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          sx={{ mt: 3, mb: 2 }}
        />

        {(masterAgents.length > 0 || subAgents.length > 0) && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" fontSize="16px" fontWeight={600} mb={1}>
              Master Agent
            </Typography>

            {masterAgents.length > 0 && (
              <>
                <Typography fontSize="14px" fontWeight={500} color="text.secondary" mb={1}>
                  Master Agents
                </Typography>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={areAllSelected(masterAgents, "rechargeEnabled")}
                        indeterminate={isIndeterminate(masterAgents, "rechargeEnabled")}
                        onChange={(e) => toggleAll(masterAgents, "rechargeEnabled", e.target.checked)}
                      />
                    }
                    label="Select All Recharge"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={areAllSelected(masterAgents, "cashoutEnabled")}
                        indeterminate={isIndeterminate(masterAgents, "cashoutEnabled")}
                        onChange={(e) => toggleAll(masterAgents, "cashoutEnabled", e.target.checked)}
                      />
                    }
                    label="Select All Cashout"
                  />
                </Box>
                <Stack spacing={2} mb={2}>
                  {masterAgents.map((agent) => (
                    <AgentRow key={agent.id} agent={agent} />
                  ))}
                </Stack>
              </>
            )}

            {subAgents.length > 0 && (
              <>
                <Typography fontSize="14px" fontWeight={500} color="text.secondary" mb={1}>
                  Agents
                </Typography>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={areAllSelected(subAgents, "rechargeEnabled")}
                        indeterminate={isIndeterminate(subAgents, "rechargeEnabled")}
                        onChange={(e) => toggleAll(subAgents, "rechargeEnabled", e.target.checked)}
                      />
                    }
                    label="Select All Recharge"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={areAllSelected(subAgents, "cashoutEnabled")}
                        indeterminate={isIndeterminate(subAgents, "cashoutEnabled")}
                        onChange={(e) => toggleAll(subAgents, "cashoutEnabled", e.target.checked)}
                      />
                    }
                    label="Select All Cashout"
                  />
                </Box>
                <Stack spacing={2}>
                  {subAgents.map((agent) => (
                    <AgentRow key={agent.id} agent={agent} />
                  ))}
                </Stack>
              </>
            )}
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
