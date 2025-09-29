import React, { useState, useEffect } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  TextField, CircularProgress, Alert, Box, Typography, IconButton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Pagination
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Autocomplete from "@mui/material/Autocomplete";
import { fetchAgentAccountingForMaster } from "../../../Utils/Accounting";
import { useGetIdentity } from "react-admin";

const { Parse } = await import("parse");
Parse.initialize(
  process.env.REACT_APP_APPID,
  process.env.REACT_APP_JAVASCRIPT_KEY,
  process.env.REACT_APP_MASTER_KEY
);
Parse.serverURL = process.env.REACT_APP_URL;
Parse.masterKey = process.env.REACT_APP_MASTER_KEY;

export default function MasterAgentAccountingModal({ open, onClose }) {
  const [startDate, setStartDate] = useState(isoDateNDaysAgo(7));
  const [endDate, setEndDate] = useState(isoDateNDaysAgo(0));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [agentsData, setAgentsData] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const { identity } = useGetIdentity();
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [agentOptions, setAgentOptions] = useState([]);
  const [agentInput, setAgentInput] = useState("");
  const [agentLoading, setAgentLoading] = useState(false);
  const [masterSelected, setMasterSelected] = useState(null);
  const [masterOptions, setMasterOptions] = useState([]);
  const [masterInput, setMasterInput] = useState("");

  const isSuperUser = identity?.role === "Super-User";
  const effectiveMasterId = isSuperUser ? masterSelected?.id : identity?.objectId;

  useEffect(() => {
    if (open) {
      resetState();
      if (isSuperUser) loadMasters("");
    }
  }, [open]);

  useEffect(() => {
  if (open && effectiveMasterId) {
    handleFetch();
  }
}, [page]);

  useEffect(() => {
    if (!open || !isSuperUser || masterInput === "") return;
    const t = setTimeout(() => loadMasters(masterInput), 350);
    return () => clearTimeout(t);
  }, [masterInput]);

  useEffect(() => {
    if (!open || !effectiveMasterId) return;
    if (agentInput === "") return;
    const t = setTimeout(() => loadAgentOptions(agentInput), 350);
    return () => clearTimeout(t);
  }, [agentInput, effectiveMasterId]);

  async function loadAgentOptions(search = "") {
    try {
      setAgentLoading(true);
      const id = !isSuperUser ? identity?.objectId : null;
      const agents = await fetchEntitiesFromDB("agent", search ,effectiveMasterId);
      setAgentOptions(agents);
    } catch (e) {
      console.error("Agent search failed", e);
    } finally {
      setAgentLoading(false);
    }
  }

  async function loadMasters(search = "") {
    try {
      const masters = await fetchEntitiesFromDB("master", search);
      setMasterOptions(masters);
    } catch (e) {
      console.error("Master search failed", e);
    }
  }

  const resetState = () => {
    setError("");
    setAgentsData([]);
    setPage(1);
    setTotalPages(1);
    setSelectedAgent(null);
    setAgentOptions([]);
    setAgentInput("");
    setMasterSelected(null);
  };

  const handleFetch = async () => {
    if (!startDate || !endDate || !effectiveMasterId) {
      setError("Please select valid dates and master agent.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const startAtISO = toStartOfDayUTC(startDate);
      const endExclusiveISO = toEndOfDayExclusiveUTC(endDate);
      const res = await fetchAgentAccountingForMaster(
        effectiveMasterId,
        startAtISO,
        endExclusiveISO,
        page,
        10,
        selectedAgent?.id
      );
      if (!res?.success) throw new Error(res?.message || "Fetch failed");
      setAgentsData(res.data?.agents || []);
      setTotalPages(res.data?.totalPages || 1);
    } catch (e) {
      setError(e.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        Master Agent Overview
        <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
      </DialogTitle>

      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, my: 2 }}>
          {isSuperUser && (
            <Autocomplete
              value={masterSelected}
              onChange={(_, val) => setMasterSelected(val)}
              inputValue={masterInput}
              onInputChange={(_, val) => setMasterInput(val)}
              options={masterOptions}
              getOptionLabel={(o) => o?.name || o?.id || ""}
              isOptionEqualToValue={(o, v) => o?.id === v?.id}
              renderInput={(params) => (
                <TextField {...params} label="Select Master Agent" size="small" />
              )}
            />
          )}

          {(!isSuperUser || (isSuperUser && masterSelected)) && (
            <>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                <TextField
                  label="Start Date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                />
                <TextField
                  label="End Date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                />
                <Autocomplete
                  value={selectedAgent}
                  onChange={(_, val) => setSelectedAgent(val)}
                  inputValue={agentInput}
                  onInputChange={(_, val) => setAgentInput(val)}
                  options={agentOptions}
                  loading={agentLoading}
                  getOptionLabel={(o) => o?.name || o?.id || ""}
                  isOptionEqualToValue={(o, v) => o?.id === v?.id}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Filter by Agent (Optional)"
                      size="small"
                      sx={{ minWidth: 230 }}
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {agentLoading ? <CircularProgress size={18} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                />
                <Button variant="outlined" onClick={handleFetch} disabled={loading}>
                  {loading ? "Loading..." : "Fetch"}
                </Button>
              </Box>
            </>
          )}
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : agentsData?.length ? (
          <>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Agent Name</strong></TableCell>
                    <TableCell align="right"><strong>Total Recharges</strong></TableCell>
                    <TableCell align="right"><strong>Total Redeems</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {agentsData.map((agent) => (
                    <TableRow key={agent.id}>
                      <TableCell>{agent.name}</TableCell>
                      <TableCell align="right">{agent.totalRecharges.toFixed(2)}</TableCell>
                      <TableCell align="right">{agent.totalRedeems.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell><strong>Grand Total</strong></TableCell>
                    <TableCell align="right">
                      <strong>{agentsData.reduce((acc, a) => acc + a.totalRecharges, 0).toFixed(2)}</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>{agentsData.reduce((acc, a) => acc + a.totalRedeems, 0).toFixed(2)}</strong>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
            <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, val) => setPage(val)}
              />
            </Box>
          </>
        ) : (
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            No data found.
          </Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

function isoDateNDaysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function toStartOfDayUTC(dateStr) {
  return new Date(`${dateStr}T00:00:00.000Z`).toISOString();
}

function toEndOfDayExclusiveUTC(dateStr) {
  const d = new Date(`${dateStr}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString();
}


function mapUser(u) {
  const username = u.get("username") || "";
  const name = u.get("name") || username || u.id;
  return { id: u.id, name, username, label: username && name !== username ? `${name} (${username})` : name };
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function fetchEntitiesFromDB(type, search = "", id) {
  const roleValue = type === "master" ? "Master-Agent" : "Agent";
  const term = (search || "").trim();
  const isAgentWithParent = type === "agent" && id;

  if (!term) {
    const base = new Parse.Query(Parse.User)
      .equalTo("roleName", roleValue)
      .ascending("name")
      .limit(50)
      .select(["name", "username"]);

    if (isAgentWithParent) {
      base.equalTo("userParentId", id);
    }

    const rows = await base.find({ useMasterKey: true });
    return rows.map(mapUser);
  }

  const rx = `^${escapeRegex(term)}`;
  const qName = new Parse.Query(Parse.User)
    .equalTo("roleName", roleValue)
    .matches("name", rx, "i")
    .ascending("name")
    .limit(50)
    .select(["name", "username"]);

  const qUser = new Parse.Query(Parse.User)
    .equalTo("roleName", roleValue)
    .matches("username", rx, "i")
    .ascending("name")
    .limit(50)
    .select(["name", "username"]);

  if (isAgentWithParent) {
    qName.equalTo("userParentId", id);
    qUser.equalTo("userParentId", id);
  }

  const q = Parse.Query.or(qName, qUser);
  const results = await q.find({ useMasterKey: true });
  const uniq = new Map();
  for (const u of results) uniq.set(u.id, mapUser(u));
  return [...uniq.values()];
}
