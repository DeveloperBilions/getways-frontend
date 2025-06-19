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
  Tab
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import Parse from "parse";

const PAGE_SIZE = 10;

export default function AgentTierViewerDialog({ open, onClose }) {
  const [tab, setTab] = useState(0);
  const [agents, setAgents] = useState([]);
  const [masterAgents, setMasterAgents] = useState([]);
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(PAGE_SIZE);
  const [total, setTotal] = useState(0);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (open) {
      fetchTiers();
    }
  }, [open]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0);
    }, 500);
    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    if (tiers.length > 0) {
      if (tab === 0) loadAgents();
      else loadMasterAgents();
    }
  }, [page, rowsPerPage, debouncedSearch, tiers, tab]);

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
        tier: user.get("tier") || "",
        userParentId: user.get("userParentId") || null
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
      const countQuery = new Parse.Query(Parse.User);
      countQuery.equalTo("roleName", "Master-Agent");
      if (debouncedSearch.trim()) {
        countQuery.matches("username", new RegExp(debouncedSearch.trim(), "i"));
      }
      const count = await countQuery.count({ useMasterKey: true });
      setTotal(count);

      const q = new Parse.Query(Parse.User);
      q.equalTo("roleName", "Master-Agent");
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
      setMasterAgents(mapped);
    } catch (e) {
      console.error("Error loading master agents:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleTierChange = (id, newTier, isMaster = false) => {
    if (isMaster) {
      setMasterAgents((prev) =>
        prev.map((a) => (a.id === id ? { ...a, tier: newTier } : a))
      );
    } else {
      setAgents((prev) =>
        prev.map((a) => (a.id === id ? { ...a, tier: newTier } : a))
      );
    }
  };

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
    setSearch("");
    setDebouncedSearch("");
    setPage(0);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (tab === 0) {
        const updates = agents.map(async (a) => {
          const user = await new Parse.Query(Parse.User).get(a.id, { useMasterKey: true });
          user.set("tier", a.tier);
          return user.save(null, { useMasterKey: true });
        });
        await Promise.all(updates);
      } else {
        const updates = masterAgents.map(async (m) => {
          const master = await new Parse.Query(Parse.User).get(m.id, { useMasterKey: true });
          master.set("tier", m.tier);
          await master.save(null, { useMasterKey: true });

          const agentQuery = new Parse.Query(Parse.User);
          agentQuery.equalTo("roleName", "Agent");
          agentQuery.equalTo("userParentId", m.id);
          const agents = await agentQuery.find({ useMasterKey: true });
          for (const agent of agents) {
            agent.set("tier", m.tier);
            await agent.save(null, { useMasterKey: true });
          }
        });
        await Promise.all(updates);
      }
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
        <Typography fontSize={18} fontWeight={600}>Tier Management</Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ "&.MuiDialogContent-dividers": { borderBottom: "none" } }} dividers>
        {successMsg && <Alert severity="success" sx={{ mb: 2 }}>{successMsg}</Alert>}
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
          <Tab
            label="Agents"
            sx={{
              fontWeight: 400,
              fontSize: "16px",
              textTransform: "none",
              color: tab === 0 ? "white !important" : "text.secondary",
              backgroundColor: tab === 0 ? "black" : "transparent",
              borderRadius: "4px",
              "&:hover": {
                backgroundColor: tab === 0 ? "black" : "#f5f5f5",
              },
            }}
          />
          <Tab
            label="Master Agents"
            sx={{
              fontWeight: 400,
              fontSize: "16px",
              textTransform: "none",
              color: tab === 1 ? "white !important" : "text.secondary",
              backgroundColor: tab === 1 ? "black" : "transparent",
              borderRadius: "4px",
              "&:hover": {
                backgroundColor: tab === 1 ? "black" : "#f5f5f5",
              },
            }}
          />
        </Tabs>
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
                  <TableCell>Username</TableCell>
                  <TableCell>Tier</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(tab === 0 ? agents : masterAgents).map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>{a.username}</TableCell>
                    <TableCell>
                      <Select
                        value={a.tier}
                        onChange={(e) => handleTierChange(a.id, e.target.value, tab === 1)}
                        size="small"
                        fullWidth
                      >
                        <MenuItem value="">None</MenuItem>
                        {tiers.map((t) => (
                          <MenuItem key={t.tier} value={t.tier}>
                            {`${t.tier} (D: ${t.deposit}, R: ${t.recharge}, P: ${t.payout})`}
                          </MenuItem>
                        ))}
                      </Select>
                    </TableCell>
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
        <Button className="custom-button cancel"onClick={onClose} >Cancel</Button>
        <Button
          disabled={saving}
          onClick={handleSave}
          className="custom-button confirm"
          startIcon={saving ? <CircularProgress size={18} color="secondary" /> : undefined}
          >
          {saving ? "Saving..." : "Save"}
        </Button></Box>
      </DialogActions>
    </Dialog>
  );
}
