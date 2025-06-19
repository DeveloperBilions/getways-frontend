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
  FormControlLabel
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

  useEffect(() => {
    if (tab === 1 && selectedMasterId) loadAgentsByMaster(selectedMasterId);
  }, [selectedMasterId]);

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
      if (debouncedSearch.trim()) {
        countQuery.matches("username", new RegExp(debouncedSearch.trim(), "i"));
      }
      const count = await countQuery.count({ useMasterKey: true });
      setTotal(count);

      const q = new Parse.Query(Parse.User);
      q.equalTo("roleName", "Agent");
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
        tier: user.get("tier") || ""
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
      q.descending("createdAt");
      const results = await q.find({ useMasterKey: true });
      const mapped = results.map((user) => ({
        id: user.id,
        username: user.get("username")
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
      const q = new Parse.Query(Parse.User);
      q.equalTo("roleName", "Agent");
      q.equalTo("userParentId", masterId);
      q.descending("createdAt");
      const results = await q.find({ useMasterKey: true });
      const mapped = results.map((user) => ({
        id: user.id,
        username: user.get("username"),
        tier: user.get("tier") || ""
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

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const visibleIds = agents.map((a) => a.id);
      setSelectedAgentIds(visibleIds);
    } else {
      setSelectedAgentIds([]);
    }
  };

  const handleBulkApply = () => {
    if (!bulkTier) return;
    setAgents((prev) =>
      prev.map((a) =>
        selectedAgentIds.includes(a.id) ? { ...a, tier: bulkTier } : a
      )
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = agents.map(async (a) => {
        const user = await new Parse.Query(Parse.User).get(a.id, { useMasterKey: true });
        user.set("tier", a.tier);
        return user.save(null, { useMasterKey: true });
      });
      await Promise.all(updates);
      setSuccessMsg("Tier settings updated successfully.");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (e) {
      console.error("Error saving tiers:", e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography fontSize={18} fontWeight={600}>Bulk Tier Management</Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Tabs value={tab} onChange={(e, newVal) => { setTab(newVal); setSelectedAgentIds([]); setSelectedMasterId(""); }}>
          <Tab label="All Agents" />
          <Tab label="Master Agent's Agents" />
        </Tabs>

        {tab === 1 && (
          <Box sx={{ my: 2 }}>
            <Select
              fullWidth
              size="small"
              value={selectedMasterId}
              displayEmpty
              onChange={(e) => setSelectedMasterId(e.target.value)}
            >
              <MenuItem value="">Select Master Agent</MenuItem>
              {masterAgents.map((m) => (
                <MenuItem key={m.id} value={m.id}>{m.username}</MenuItem>
              ))}
            </Select>
          </Box>
        )}

        {successMsg && <Alert severity="success" sx={{ mb: 2 }}>{successMsg}</Alert>}
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
            Apply Tier to Selected
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
        ) : (
          <>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={
                        selectedAgentIds.length > 0 && selectedAgentIds.length < agents.length
                      }
                      checked={
                        agents.length > 0 && selectedAgentIds.length === agents.length
                      }
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell>Username</TableCell>
                  <TableCell>Tier</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {agents.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedAgentIds.includes(a.id)}
                        onChange={() => handleCheckboxChange(a.id)}
                      />
                    </TableCell>
                    <TableCell>{a.username}</TableCell>
                    <TableCell>{a.tier}</TableCell>
                  </TableRow>
                ))}
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
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          disabled={saving}
          onClick={handleSave}
          variant="contained"
          startIcon={saving ? <CircularProgress size={18} color="secondary" /> : undefined}
        >
          {saving ? "Saving..." : "Save All"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
