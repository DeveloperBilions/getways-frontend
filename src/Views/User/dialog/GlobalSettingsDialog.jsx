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
  Switch,
  InputAdornment,
  Tabs,
  Tab,
  IconButton,
} from "@mui/material";
import Parse from "parse";
import SearchIcon from "@mui/icons-material/Search";
import { FormGroup, Input } from "reactstrap";

const GlobalSettingsDialog = ({ open, onClose }) => {
  const [rechargeEnabled, setRechargeEnabled] = useState(true);
  const [cashoutEnabled, setCashoutEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [masterAgents, setMasterAgents] = useState([]);
  const [subAgents, setSubAgents] = useState([]);
  const [agents, setAgents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (open) {
      fetchAgents();
    }
  }, [open, searchTerm]);

  useEffect(() => {
    if (open) {
      fetchSettings();
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

  const areAllSelected = (list, key) =>
    list.length > 0 && list.every((a) => a[key]);
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

      const allowedRechargeIds = agents
        .filter((a) => a.rechargeEnabled)
        .map((a) => a.id);
      const allowedCashoutIds = agents
        .filter((a) => a.cashoutEnabled)
        .map((a) => a.id);

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

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const filteredMasterAgents = masterAgents.filter((agent) =>
    agent.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSubAgents = subAgents.filter((agent) =>
    agent.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const AgentRow = ({ agent }) => {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #f0f0f0",
          py: 1,
        }}
      >
<Typography
  sx={{
    flex: 1,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  }}
>
  {agent.username}
</Typography>
        <Box sx={{ display: "flex", justifyContent: "flex-end", flex: 1 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={agent.rechargeEnabled}
                onChange={(e) =>
                  handleAgentToggle(
                    agent.id,
                    "rechargeEnabled",
                    e.target.checked
                  )
                }
              />
            }
            sx={{ paddingRight: "55px" }}
            label=""
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={agent.cashoutEnabled}
                onChange={(e) =>
                  handleAgentToggle(
                    agent.id,
                    "cashoutEnabled",
                    e.target.checked
                  )
                }
              />
            }
            sx={{ paddingRight: "25px" }}
            label=""
          />
        </Box>
      </Box>
    );
  };

  // Show overrides section only when at least one global toggle is enabled
  const showOverrides = !rechargeEnabled || !cashoutEnabled;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      // maxWidth="500px"
      fullWidth
      // PaperProps={{
      //   sx: {
      //     borderRadius: 1,
      //     // maxHeight: "80vh",
      //   },
      // }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: 2,
          py: 2,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: "18px" }}>
          Global Recharge & Cashout Settings
        </Typography>
        <IconButton onClick={onClose} size="small">
          {/* <CloseIcon /> */}
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ px: 2, py: 2 }}>
        {successMsg && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMsg}
          </Alert>
        )}

        <Box display="flex" flexDirection="column" gap={1}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            bgcolor="#F6F4F4"
            p={1.5}
            borderRadius={1}
            height="40px"
          >
            <Typography>Enable Recharge (Global)</Typography>
            <FormGroup check className="form-switch">
              <Input
                type="switch"
                id="RechargeSwitch"
                className="green-switch"
                checked={rechargeEnabled}
                onChange={(e) => setRechargeEnabled(e.target.checked)}
                style={{ width: "40px", height: "20px" }}
              />
            </FormGroup>
          </Box>

          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            bgcolor="#F6F4F4"
            p={1.5}
            borderRadius={1}
            height="40px"
          >
            <Typography>Enable Cashout (Global)</Typography>
            <FormGroup check className="form-switch">
              <Input
                type="switch"
                id="CashoutSwitch"
                className="green-switch"
                checked={cashoutEnabled}
                onChange={(e) => setCashoutEnabled(e.target.checked)}
                style={{ width: "40px", height: "20px" }}
              />
            </FormGroup>
          </Box>
        </Box>

        {showOverrides && (
          <>
            <Box sx={{ mt: 2, mb: 2 }}>
              <Typography variant="h6" fontSize="16px" fontWeight={600} mb={2}>
                Master Agent Overrides
              </Typography>

              <TextField
                fullWidth
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="small"
                sx={{ mb: 2 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />

              <Box
                sx={{
                  border: "1px solid #E7E7E7",
                  borderRadius: "8px",
                  mb: 2,
                  padding: "8px",
                }}
              >
                <Tabs
                  value={activeTab}
                  onChange={handleTabChange}
                  variant="fullWidth"
                  sx={{
                    "& .MuiTabs-indicator": {
                      display: "none",
                    },
                  }}
                >
                  <Tab
                    label="Master Agents"
                    sx={{
                      fontWeight: 400,
                      fontSize: "16px",
                      textTransform: "none",
                      color:
                        activeTab === 0 ? "white !important" : "text.secondary",
                      backgroundColor:
                        activeTab === 0 ? "black" : "transparent",
                      borderRadius: "4px",
                      "&:hover": {
                        backgroundColor: activeTab === 0 ? "black" : "#f5f5f5",
                      },
                    }}
                  />
                  <Tab
                    label="Agents under Super Admin"
                    sx={{
                      fontWeight: 400,
                      fontSize: "16px",
                      textTransform: "none",
                      color:
                        activeTab === 1 ? "white !important" : "text.secondary",
                      backgroundColor:
                        activeTab === 1 ? "black" : "transparent",
                      borderRadius: "4px",
                      "&:hover": {
                        backgroundColor: activeTab === 1 ? "black" : "#f5f5f5",
                      },
                    }}
                  />
                </Tabs>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={2}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={areAllSelected(
                        activeTab === 0 ? masterAgents : subAgents,
                        "rechargeEnabled"
                      )}
                      indeterminate={isIndeterminate(
                        activeTab === 0 ? masterAgents : subAgents,
                        "rechargeEnabled"
                      )}
                      onChange={(e) =>
                        toggleAll(
                          activeTab === 0 ? masterAgents : subAgents,
                          "rechargeEnabled",
                          e.target.checked
                        )
                      }
                      size="small"
                    />
                  }
                  label="Select All Recharge"
                  style={{ fontSize: "14px", fontWeight: 400 }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={areAllSelected(
                        activeTab === 0 ? masterAgents : subAgents,
                        "cashoutEnabled"
                      )}
                      indeterminate={isIndeterminate(
                        activeTab === 0 ? masterAgents : subAgents,
                        "cashoutEnabled"
                      )}
                      onChange={(e) =>
                        toggleAll(
                          activeTab === 0 ? masterAgents : subAgents,
                          "cashoutEnabled",
                          e.target.checked
                        )
                      }
                      size="small"
                    />
                  }
                  label="Select All Cashout"
                  style={{ fontSize: "14px", fontWeight: 400 }}
                />
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Typography sx={{ flex: 1 }} fontWeight={500}>
                  Name
                </Typography>
                <Box
                  sx={{ display: "flex", justifyContent: "flex-end", flex: 1 }}
                >
                  <Typography width={110} textAlign="center" fontWeight={500}>
                    Recharge
                  </Typography>
                  <Typography width={110} textAlign="center" fontWeight={500}>
                    Cashout
                  </Typography>
                </Box>
              </Box>

              <Box>
                {activeTab === 0 ? (
                  filteredMasterAgents.length > 0 ? (
                    filteredMasterAgents.map((agent) => (
                      <AgentRow key={agent.id} agent={agent} />
                    ))
                  ) : (
                    <Typography
                      color="text.secondary"
                      textAlign="center"
                      py={2}
                    >
                      No master agents found
                    </Typography>
                  )
                ) : filteredSubAgents.length > 0 ? (
                  filteredSubAgents.map((agent) => (
                    <AgentRow key={agent.id} agent={agent} />
                  ))
                ) : (
                  <Typography color="text.secondary" textAlign="center" py={2}>
                    No agents found
                  </Typography>
                )}
              </Box>
            </Box>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, justifyContent: "space-between" }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{ px: 4,paddingBottom:"10px",paddingTop:"10px",borderColor: "#e0e0e0", color: "#000",width:"50%" }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={loading}
          sx={{ width:"50%" ,px: 4,paddingBottom:"10px",paddingTop:"10px", bgcolor: "black", "&:hover": { bgcolor: "#333" } }}
          startIcon={loading && <CircularProgress size={18} color="inherit" />}
        >
          {loading ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};


export default GlobalSettingsDialog;
