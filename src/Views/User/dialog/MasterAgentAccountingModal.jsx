import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Box,
  Typography,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Pagination,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { fetchAgentAccountingForMaster } from "../../../Utils/Accounting";
import { useGetIdentity } from "react-admin";
import Autocomplete from "@mui/material/Autocomplete";

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
  
  useEffect(() => {
    if (open) {
      resetState();
    }
  }, [open]);
  useEffect(() => {
    if (!open) return;
    if (agentInput === "") return;
    const t = setTimeout(() => {
      loadAgentOptions(agentInput);
    }, 350);
    return () => clearTimeout(t);
  }, [agentInput]);

  async function loadAgentOptions(search = "") {
    try {
      setAgentLoading(true);
      const agents = await fetchEntitiesFromDB("agent", search);
      setAgentOptions(agents);
    } catch (e) {
      console.error("Agent search failed", e);
    } finally {
      setAgentLoading(false);
    }
  }  
  const resetState = () => {
    setError("");
    setAgentsData([]);
    setPage(1);
    setTotalPages(1);
  };

  const handleFetch = async () => {
    if (!startDate || !endDate) {
      setError("Please select valid start and end dates.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const startAtISO = toStartOfDayUTC(startDate);
      const endExclusiveISO = toEndOfDayExclusiveUTC(endDate);
      const res = await fetchAgentAccountingForMaster(
        identity?.objectId,
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

  function toStartOfDayUTC(dateStr) {
    return new Date(`${dateStr}T00:00:00.000Z`).toISOString();
  }

  function toEndOfDayExclusiveUTC(dateStr) {
    const d = new Date(`${dateStr}T00:00:00.000Z`);
    d.setUTCDate(d.getUTCDate() + 1);
    return d.toISOString();
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        Master Agent Overview
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box  sx={{
    display: "flex",
    flexDirection: { xs: "column", sm: "row" }, // ⬅️ Stack on xs, row on sm and up
    gap: 2,
    my: 2,
    alignItems: "flex-start", // prevents vertical stretching
    flexWrap: "wrap", // optional: allows wrap on small-to-mid widths
  }}>
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
                    <TableCell>
                      <strong>Agent Name</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>Total Recharges</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>Total Redeems</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {agentsData.map((agent) => (
                    <TableRow key={agent.id}>
                      <TableCell>{agent.name}</TableCell>
                      <TableCell align="right">
                        {agent.totalRecharges.toFixed(2)}
                      </TableCell>
                      <TableCell align="right">
                        {agent.totalRedeems.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {/* Totals Row */}
                  <TableRow>
                    <TableCell>
                      <strong>Grand Total</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>
                        {agentsData
                          .reduce((acc, a) => acc + a.totalRecharges, 0)
                          .toFixed(2)}
                      </strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>
                        {agentsData
                          .reduce((acc, a) => acc + a.totalRedeems, 0)
                          .toFixed(2)}
                      </strong>
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
export async function fetchEntitiesFromDB(type, search = "") {
    const roleValue = type === "master" ? "Master-Agent" : "Agent";
    const base = new Parse.Query(Parse.User).equalTo("roleName", roleValue);
    const term = (search || "").trim();
    if (!term) {
      base.limit(50).ascending("name").select(["name", "username"]);
      const rows = await base.find({ useMasterKey: true });
      return rows.map(mapUser);
    }
    const rx = `^${escapeRegex(term)}`;
    const qName = new Parse.Query(Parse.User).equalTo("roleName", roleValue).matches("name", rx, "i");
    const qUser = new Parse.Query(Parse.User).equalTo("roleName", roleValue).matches("username", rx, "i");
    const q = Parse.Query.or(qName, qUser);
    q.limit(50).ascending("name").select(["name", "username"]);
    const results = await q.find({ useMasterKey: true });
    const uniq = new Map();
    for (const u of results) uniq.set(u.id, mapUser(u));
    return [...uniq.values()];
  }
  function mapUser(u) {
    const username = u.get("username") || "";
    const name = u.get("name") || username || u.id;
    return { id: u.id, name, username, label: username && name !== username ? `${name} (${username})` : name };
  }
  
  function escapeRegex(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }