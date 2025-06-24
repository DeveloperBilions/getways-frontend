import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  TextField,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  Button,
  InputAdornment,
  CircularProgress,
  Select,
  MenuItem,
  Alert,
  Box,
  Tabs,
  Tab,
  Checkbox,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import Parse from "parse";

const PAGE_SIZE = 10;

export default function AgentTierViewerDialogBulk({ open, onClose }) {
  const [tab, setTab] = useState(0);
  const [agents, setAgents] = useState([]);
  const [masterAgents, setMasterAgents] = useState([]);
  const [selectedMasterId, setSelectedMasterId] = useState("");
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(PAGE_SIZE);
  const [total, setTotal] = useState(0);
  const [successMsg, setSuccessMsg] = useState("");
  const [selectedAgentIds, setSelectedAgentIds] = useState([]);
  const [bulkTier, setBulkTier] = useState("");
  const [tierChanges, setTierChanges] = useState({});

  useEffect(() => {
    if (open) fetchTiers();
  }, [open]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0);
    }, 500);
    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    if (tiers.length === 0) return;
    if (tab === 0) loadAgents();
    else loadMasterAgents();
  }, [tab, page, rowsPerPage, debouncedSearch, tiers]);

  // Watch for changes in tab or masterId and reset state
  useEffect(() => {
    if (tab === 1 && selectedMasterId) {
      setPage(0); // reset page when switching master agent or tabs
    }
  }, [tab, selectedMasterId]);

  // Trigger data load on real final values
  useEffect(() => {
    if (tiers.length === 0) return;
    if (tab === 0) loadAgents();
    else if (tab === 1 && selectedMasterId)
      loadAgentsByMaster(selectedMasterId);
  }, [tab, selectedMasterId, page, rowsPerPage, debouncedSearch, tiers]);

  const handleTabChange = (e, newVal) => {
    setTab(newVal);
    setSelectedAgentIds([]);
    setAgents([]);
    setPage(0);
    setTotal(0);
    if (newVal === 1) {
      setSelectedMasterId("");
    }
  };

  const fetchTiers = async () => {
    const query = new Parse.Query("Settings");
    query.equalTo("type", "tierValues");
    const obj = await query.first({ useMasterKey: true });
    if (obj) setTiers(obj.get("settings"));
  };

  const loadAgents = async () => {
    setLoading(true);
    try {
      const countQuery = new Parse.Query(Parse.User);
      countQuery.equalTo("roleName", "Agent");
      countQuery.notEqualTo("isDeleted", true);

      if (debouncedSearch.trim()) {
        countQuery.matches("username", new RegExp(debouncedSearch.trim(), "i"));
      }
      const count = await countQuery.count({ useMasterKey: true });
      setTotal(count);

      const q = new Parse.Query(Parse.User);
      q.equalTo("roleName", "Agent");
      q.notEqualTo("isDeleted", true);
      if (debouncedSearch.trim()) {
        q.matches("username", new RegExp(debouncedSearch.trim(), "i"));
      }
      q.limit(rowsPerPage);
      q.skip(page * rowsPerPage);
      q.descending("createdAt");

      const results = await q.find({ useMasterKey: true });
      const mapped = results.map((user) => ({
        id: user.id,
        username: user.get("username"),
        tier: user.get("tier") || "",
      }));
      setAgents(mapped);
    } catch (e) {
      console.error("Error loading agents:", e);
    } finally {
      setLoading(false);
    }
  };

  const loadMasterAgents = async () => {
    setLoading(true);
    try {
      const q = new Parse.Query(Parse.User);
      q.equalTo("roleName", "Master-Agent");
      q.notEqualTo("isDeleted", true);
      q.descending("createdAt");
      const results = await q.find({ useMasterKey: true });
      const mapped = results.map((user) => ({
        id: user.id,
        username: user.get("username"),
      }));
      setMasterAgents(mapped);
    } catch (e) {
      console.error("Error loading master agents:", e);
    } finally {
      setLoading(false);
    }
  };

  const loadAgentsByMaster = async (masterId) => {
    setLoading(true);
    try {
      const countQuery = new Parse.Query(Parse.User);
      countQuery.equalTo("roleName", "Agent");
      countQuery.equalTo("userParentId", masterId);
      countQuery.notEqualTo("isDeleted", true);
      if (debouncedSearch.trim()) {
        countQuery.matches("username", new RegExp(debouncedSearch.trim(), "i"));
      }
      const count = await countQuery.count({ useMasterKey: true });
      setTotal(count);

      const q = new Parse.Query(Parse.User);
      q.equalTo("roleName", "Agent");
      q.equalTo("userParentId", masterId);
      q.notEqualTo("isDeleted", true);

      if (debouncedSearch.trim()) {
        q.matches("username", new RegExp(debouncedSearch.trim(), "i"));
      }
      q.limit(rowsPerPage);
      q.skip(page * rowsPerPage);
      q.descending("createdAt");

      const results = await q.find({ useMasterKey: true });
      const mapped = results.map((user) => ({
        id: user.id,
        username: user.get("username"),
        tier: user.get("tier") || "",
      }));
      setAgents(mapped);
    } catch (e) {
      console.error("Error loading agents for master:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (id) => {
    setSelectedAgentIds((prev) =>
      prev.includes(id) ? prev.filter((aid) => aid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (isChecked) => {
    const visibleIds = agents.map((a) => a.id);
    setSelectedAgentIds((prev) => {
      if (isChecked) {
        const merged = [...new Set([...prev, ...visibleIds])];
        return merged;
      } else {
        return prev.filter((id) => !visibleIds.includes(id));
      }
    });
  };
  

  const handleBulkApply = () => {
    if (!bulkTier) return;
  
    const updates = {};
    selectedAgentIds.forEach((id) => {
      updates[id] = bulkTier;
    });
  
    setTierChanges((prev) => ({ ...prev, ...updates }));
  
    const visibleIds = agents.map((a) => a.id);
    setSelectedAgentIds((prev) =>
      prev.filter((id) => !visibleIds.includes(id)) // ❗ remove only current page selections
    );
  };
  
  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = Object.entries(tierChanges).map(async ([id, newTier]) => {
        const user = await new Parse.Query(Parse.User).get(id, {
          useMasterKey: true,
        });
        user.set("tier", newTier);
        return user.save(null, { useMasterKey: true });
      });
  
      await Promise.all(updates);
      setSuccessMsg("Tier settings updated successfully.");
      setTierChanges({}); // ✅ Reset tracked changes
      setSelectedAgentIds([]); // ✅ Optional: Clear selections after save
      setTimeout(() => setSuccessMsg(""), 3000);
      if (tab === 0) {
        await loadAgents();
      } else if (tab === 1 && selectedMasterId) {
        await loadAgentsByMaster(selectedMasterId);
      }
    } catch (e) {
      console.error("Error saving tiers:", e);
    } finally {
      setSaving(false);
    }
  };
  

  const shouldShowAgentsTable = tab === 0 || (tab === 1 && selectedMasterId);
  const currentPageIds = agents.map((a) => a.id);
  const allSelectedThisPage = currentPageIds.every((id) =>
    selectedAgentIds.includes(id)
  );
  const someSelectedThisPage = currentPageIds.some((id) =>
    selectedAgentIds.includes(id)
  );
  const handleClose = () => {
    setTab(0);
    setAgents([]);
    setMasterAgents([]);
    setSelectedMasterId("");
    setTiers([]);
    setLoading(false);
    setSaving(false);
    setSearch("");
    setDebouncedSearch("");
    setPage(0);
    setRowsPerPage(PAGE_SIZE);
    setTotal(0);
    setSuccessMsg("");
    setSelectedAgentIds([]);
    setBulkTier("");
    setTierChanges({});
  
    onClose(); // call the parent-provided close
  };
  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography fontSize={18} fontWeight={600}>
          Tier Management
        </Typography>
        <IconButton size="small" onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box
          sx={{
            border: "1px solid #E7E7E7",
            borderRadius: "8px",
            mb: 2,
            padding: "8px",
          }}
        >
          <Tabs
            value={tab}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{ "& .MuiTabs-indicator": { display: "none" } }}
          >
            <Tab label="Agents" sx={tabStyle(tab === 0)} />
            <Tab label="Master Agents" sx={tabStyle(tab === 1)} />
          </Tabs>
        </Box>

        {tab === 1 && (
          <Box sx={{ my: 2 }}>
            <Select
              fullWidth
              size="small"
              value={selectedMasterId}
              displayEmpty
              onChange={(e) => {
                setSelectedMasterId(e.target.value);
                setPage(0);
              }}
            >
              <MenuItem value="">Select Master Agent</MenuItem>
              {masterAgents.map((m) => (
                <MenuItem key={m.id} value={m.id}>
                  {m.username}
                </MenuItem>
              ))}
            </Select>
          </Box>
        )}

        {successMsg && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMsg}
          </Alert>
        )}

        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <Select
            size="small"
            value={bulkTier}
            onChange={(e) => setBulkTier(e.target.value)}
            displayEmpty
            fullWidth
          >
            <MenuItem value="">Select Tier</MenuItem>
            {tiers.map((t) => (
              <MenuItem key={t.tier} value={t.tier}>
                {`${t.tier} (D: ${t.deposit}, R: ${t.recharge}, P: ${t.payout})`}
              </MenuItem>
            ))}
          </Select>
          <Button
            onClick={handleBulkApply}
            variant="contained"
            disabled={!bulkTier || selectedAgentIds.length === 0}
          >
            Apply
          </Button>
        </Box>

        <TextField
          fullWidth
          size="small"
          placeholder="Search by username"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ mb: 2 }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : shouldShowAgentsTable ? (
          <>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                  <Checkbox
  checked={allSelectedThisPage}
  indeterminate={!allSelectedThisPage && someSelectedThisPage}
  onChange={(e) => handleSelectAll(e.target.checked)}
/>
                  </TableCell>
                  <TableCell>Username</TableCell>
                  <TableCell>Tier</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {agents.map((a) => {
const displayedTier = tierChanges[a.id] ?? a.tier;
return (
                    <TableRow key={a.id}>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedAgentIds.includes(a.id)}
                          onChange={() => handleCheckboxChange(a.id)}
                        />
                      </TableCell>
                      <TableCell>{a.username}</TableCell>
                      <TableCell>{displayedTier}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={total}
              page={page}
              onPageChange={(_, p) => setPage(p)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[10, 20, 50]}
            />
          </>
        ) : (
          <Typography sx={{ textAlign: "center", py: 4 }}>
            Select a master agent to view their agents.
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }} className="custom-modal-footer">
        <Box
          className="d-flex w-100 justify-content-between"
          sx={{
            flexDirection: { xs: "column-reverse", sm: "row" }, // 🔁 Reverse order on mobile
            alignItems: { xs: "stretch", sm: "stretch" }, // Stretch items to take full width in both modes
            gap: { xs: 2, sm: 2 }, // Add spacing between buttons
            marginBottom: { xs: 2, sm: 2 }, // Add margin at the bottom
            width: "100% !important", // Ensure the container takes full width
            paddingRight: { xs: 0, sm: 1 },
          }}
        >
          <Button className="custom-button cancel" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            className="custom-button confirm"
            disabled={saving}
            onClick={handleSave}
            startIcon={
              saving ? (
                <CircularProgress size={18} color="secondary" />
              ) : undefined
            }
          >
            {saving ? "Saving..." : "Save All"}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}

const tabStyle = (active) => ({
  fontWeight: 400,
  fontSize: "16px",
  textTransform: "none",
  color: active ? "white !important" : "text.secondary",
  backgroundColor: active ? "black" : "transparent",
  borderRadius: "4px",
  "&:hover": { backgroundColor: active ? "black" : "#f5f5f5" },
});
