import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Box,
  TextField,
  InputAdornment,
  Checkbox,
  FormControlLabel,
  Button,
  CircularProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  Alert,
  Select,
  MenuItem,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import Parse from "parse";

const PAGE_SIZE = 10;

export default function RechargeMethodsDialog({ open, onClose }) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(PAGE_SIZE);
  const [total, setTotal] = useState(0);
  const [agents, setAgents] = useState([]);
  const [methods, setMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [newMethodName, setNewMethodName] = useState("");
  const [methodSuccessMsg, setMethodSuccessMsg] = useState("");
  const [creating, setCreating] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const fetchMethods = async () => {
    const objs = await new Parse.Query("RechargeMethod")
      .ascending("createdAt")
      .find({ useMasterKey: true });

    const userDefined = objs.map((m) => ({
      id: m.id,
      name: m.get("name"),
    }));

    const merged = [...userDefined];
    setMethods(merged);
    setSelectedMethod((prev) => prev || merged[0]);
  };

  const fetchAllowedIds = async (methodName) => {
    const q = new Parse.Query("Settings");
    q.equalTo("type", `allowedAgentsFor_${methodName.toLowerCase()}`);
    const obj = await q.first({ useMasterKey: true });
    return obj ? obj.get("settings") : [];
  };

  const saveAllowedIds = async (methodName, ids) => {
    const q = new Parse.Query("Settings");
    q.equalTo("type", `allowedAgentsFor_${methodName.toLowerCase()}`);
    let obj = await q.first({ useMasterKey: true });
  
    if (!obj) {
      const Settings = Parse.Object.extend("Settings");
      obj = new Settings();
      obj.set("type", `allowedAgentsFor_${methodName.toLowerCase()}`);
    }
  
    obj.set("settings", ids);
    await obj.save(null, { useMasterKey: true });
  };

  const createMethod = async () => {
    if (!newMethodName.trim()) return;
  
    const methodNameTrimmed = newMethodName.trim();
    const methodNameLower = methodNameTrimmed.toLowerCase();
    setCreating(true);
  
    try {
      // 🔍 Check for duplicate method name
      const existingMethodQuery = new Parse.Query("RechargeMethod");
      existingMethodQuery.equalTo("nameLower", methodNameLower); // assuming you'll store lowercase name
      const duplicate = await existingMethodQuery.first({ useMasterKey: true });
  
      if (duplicate) {
        setMethodSuccessMsg(`Recharge method "${methodNameTrimmed}" already exists.`);
        setTimeout(() => setMethodSuccessMsg(""), 3000);
        return;
      }
  
      // Step 1: Create the method object
      const RechargeMethod = Parse.Object.extend("RechargeMethod");
      const method = new RechargeMethod();
      method.set("name", methodNameTrimmed);
      method.set("nameLower", methodNameLower); // to prevent case-insensitive duplicates
      const savedMethod = await method.save(null, { useMasterKey: true });
  
      // Step 2: Fetch all agent IDs (no pagination)
      const agentQuery = new Parse.Query(Parse.User);
      agentQuery.equalTo("roleName", "Agent");
      const allAgents = await agentQuery.findAll({ useMasterKey: true });
      const allowedIds = allAgents.map((agent) => agent.id);
  
      // Step 3: Create the Settings entry
      const Settings = Parse.Object.extend("Settings");
      const settingsObj = new Settings();
      const settingsKey = `allowedAgentsFor_${methodNameLower}`;
      settingsObj.set("type", settingsKey);
      settingsObj.set("settings", allowedIds);
      await settingsObj.save(null, { useMasterKey: true });
  
      setNewMethodName("");
      await fetchMethods();
      setSelectedMethod({ id: savedMethod.id, name: methodNameTrimmed });
      setMethodSuccessMsg(
        `Recharge method "${methodNameTrimmed}" created and applied to all agents!`
      );
      setTimeout(() => setMethodSuccessMsg(""), 3000);
    } catch (e) {
      console.error("Error creating method:", e);
    } finally {
      setCreating(false);
    }
  };
  
  const loadAgents = async () => {
    if (!selectedMethod) return;
    setLoading(true);
    try {
      const [allowedIds, count] = await Promise.all([
        fetchAllowedIds(selectedMethod.name),
        new Parse.Query(Parse.User)
          .equalTo("roleName", "Agent")
          .contains("username", debouncedSearch)
          .count({ useMasterKey: true }),
      ]);
      setTotal(count);

      const q = new Parse.Query(Parse.User)
        .equalTo("roleName", "Agent")
        .descending("createdAt") // Sort latest created first
        .limit(rowsPerPage)
        .skip(page * rowsPerPage);
        if (search.trim()) {
          const regex = new RegExp(debouncedSearch.trim(), "i");
          q.matches("username", regex);
        }
        
      const res = await q.find({ useMasterKey: true });
      const mapped = res.map((u) => ({
        id: u.id,
        username: u.get("username"),
        allowed: allowedIds.includes(u.id),
      }));
      setAgents(mapped);
    } catch (e) {
      console.error("Error loading agents:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchMethods();
    }
  }, [open]);

  useEffect(() => {
    if (selectedMethod) {
      setPage(0);
      loadAgents();
    }
  }, [selectedMethod]);

  useEffect(() => {
  const timeout = setTimeout(() => {
    setDebouncedSearch(search);
    setPage(0); // Reset to first page on new search
  }, 500); // 500ms delay

  return () => clearTimeout(timeout);
}, [search]);

  useEffect(() => {
    loadAgents();
  }, [page, rowsPerPage, debouncedSearch]);

  const toggleAgent = (id, allowed) =>
    setAgents((prev) => prev.map((a) => (a.id === id ? { ...a, allowed } : a)));

  const toggleAllCurrentPage = (checked) =>
    setAgents((prev) => prev.map((a) => ({ ...a, allowed: checked })));

  const handleSave = async () => {
    if (!selectedMethod) return;
    setSaving(true);
    try {
      const allowedIds = agents.filter((a) => a.allowed).map((a) => a.id);
      await saveAllowedIds(selectedMethod.name, allowedIds);
      setSuccessMsg("Settings saved successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (e) {
      console.error("Error saving:", e);
    } finally {
      setSaving(false);
    }
  };

  const allChecked = agents.length > 0 && agents.every((a) => a.allowed);
  const someChecked = agents.some((a) => a.allowed) && !allChecked;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography fontSize={18} fontWeight={600}>
          Recharge Method Agent Access
        </Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {methodSuccessMsg && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {methodSuccessMsg}
          </Alert>
        )}

        {successMsg && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMsg}
          </Alert>
        )}

        <Box display="flex" gap={2} mb={2}>
          <Select
            size="small"
            value={selectedMethod?.id || ""}
            onChange={(e) =>
              setSelectedMethod(
                methods.find((m) => m.id === e.target.value) || null
              )
            }
            fullWidth
          >
            {methods.map((m) => (
              <MenuItem key={m.id} value={m.id}>
                {m.name}
              </MenuItem>
            ))}
          </Select>

          <TextField
            size="small"
            placeholder="New method"
            value={newMethodName}
            onChange={(e) => setNewMethodName(e.target.value)}
            fullWidth
          />
          <IconButton
            onClick={createMethod}
            disabled={!newMethodName.trim() || creating}
          >
            {creating ? <CircularProgress size={20} /> : <AddIcon />}
          </IconButton>
        </Box>

        <TextField
          fullWidth
          size="small"
          placeholder="Search agents"
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
            <FormControlLabel
              control={
                <Checkbox
                  checked={allChecked}
                  indeterminate={someChecked}
                  onChange={(e) => toggleAllCurrentPage(e.target.checked)}
                  size="small"
                />
              }
              label="Select / Deselect all on this page"
              sx={{ mb: 1 }}
            />

            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Username</TableCell>
                  <TableCell align="center">Recharge Allowed</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {agents.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>{a.username}</TableCell>
                    <TableCell align="center">
                      <Checkbox
                        checked={a.allowed}
                        onChange={(e) => toggleAgent(a.id, e.target.checked)}
                        size="small"
                      />
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

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button variant="outlined" onClick={onClose} sx={{ width: "50%" }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={saving}
          onClick={handleSave}
          sx={{
            width: "50%",
            bgcolor: "black",
            "&:hover": { bgcolor: "#333" },
          }}
          startIcon={saving && <CircularProgress size={18} color="inherit" />}
        >
          {saving ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
