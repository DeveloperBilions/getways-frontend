import React, { useMemo, useState, useEffect } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  Switch, FormControlLabel, Typography, Box, CircularProgress, Alert,
  IconButton, Divider, MenuItem
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import RefreshIcon from "@mui/icons-material/Refresh";
import { fetchAccountingSummary } from "../../../Utils/Accounting";
// 👇 adjust this import to your Parse setup
import { Parse } from "parse";
// Initialize Parse
Parse.initialize(process.env.REACT_APP_APPID, process.env.REACT_APP_MASTER_KEY);
Parse.serverURL = process.env.REACT_APP_URL;

export default function AgentAccountingModal({
  open,
  onClose,
  defaultCommission = 12,
  defaultType = "",
}) {
  const [selectedType, setSelectedType] = useState(defaultType || ""); // "agent" | "master"
  const [selectedEntity, setSelectedEntity] = useState(null);

  const [commissionPct, setCommissionPct] = useState(defaultCommission);
  const [startDate, setStartDate] = useState(() => isoDateNDaysAgo(7));
  const [endDate, setEndDate] = useState(() => isoDateNDaysAgo(0));
  const [includeCommissionOnRecharges, setIncludeCommissionOnRecharges] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState(null);

  // DB-backed options + search
  const [options, setOptions] = useState([]);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    if (open) {
      setError("");
      setSummary(null);
      setSelectedType(defaultType || "");
      setSelectedEntity(null);
      setOptions([]);
      setInputValue("");
    }
  }, [open, defaultType]);

  useEffect(() => {
    // when type changes, clear entity and load a fresh list
    setSelectedEntity(null);
    setSummary(null);
    setOptions([]);
    setInputValue("");
    if (selectedType) {
      loadEntities(selectedType, "");
    }
  }, [selectedType]);

  // Debounced search
  useEffect(() => {
    if (!selectedType) return;
    const t = setTimeout(() => {
      loadEntities(selectedType, inputValue);
    }, 350);
    return () => clearTimeout(t);
  }, [inputValue, selectedType]);

  const totals = useMemo(() => {
    const tr = safe(summary?.totalRecharges);
    const td = safe(summary?.totalRedeems);
    const prev = safe(summary?.previousBalance);
    const commission = includeCommissionOnRecharges ? (tr * safe(commissionPct)) / 100 : 0;
    const finalBalance = prev + tr - td - commission;
    return { totalRecharges: tr, totalRedeems: td, previousBalance: prev, commission, finalBalance };
  }, [summary, commissionPct, includeCommissionOnRecharges]);

  const canFetch =
    selectedType &&
    selectedEntity &&
    startDate &&
    endDate &&
    new Date(startDate) <= new Date(endDate);

  const handleFetch = async () => {
    if (!canFetch) {
      setError("Please select type, entity, and a valid date range.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetchAccountingSummary(
        selectedType,          // "agent" | "master"
        selectedEntity.id,     // _User id
        startDate,
        endDate,
        Number(commissionPct) || 0
      );
      if (!res?.success) throw new Error(res?.message || "Failed to fetch summary");
      setSummary(res.data || null);
    } catch (e) {
      setError(e.message || "Something went wrong. Please try again.");
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!summary?.transactions?.length) {
      setError("No transactions to export for the selected range.");
      return;
    }
    const csv = toCSV(summary.transactions);
    const name = selectedEntity?.name || selectedEntity?.id || "entity";
    downloadTextFile(csv, `accounting_${selectedType}_${name}_${startDate}_${endDate}.csv`);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        Agent / Master Agent Accounting
        <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
      </DialogTitle>

      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {/* Type + Entity (both from DB) */}
        <Box sx={{ display: "grid", my: 2, gap: 2, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
          <TextField
            select
            label="Select Type"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            size="small"
            fullWidth
          >
            <MenuItem value="">-- Choose --</MenuItem>
            <MenuItem value="agent">Agent</MenuItem>
            <MenuItem value="master">Master Agent</MenuItem>
          </TextField>

          <Autocomplete
            value={selectedEntity}
            onChange={(_, val) => setSelectedEntity(val)}
            inputValue={inputValue}
            onInputChange={(_, val) => setInputValue(val)}
            options={options}
            loading={optionsLoading}
            getOptionLabel={(o) => o?.name || o?.id || ""}
            isOptionEqualToValue={(o, v) => o?.id === v?.id}
            disabled={!selectedType}
            renderInput={(params) => (
              <TextField
                {...params}
                label={
                  !selectedType
                    ? "Select Type First"
                    : selectedType === "agent"
                    ? "Select Agent"
                    : "Select Master Agent"
                }
                size="small"
                fullWidth
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {optionsLoading ? <CircularProgress size={18} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
        </Box>

        {/* Rest only after both picked */}
        {!selectedType || !selectedEntity ? (
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 2 }}>
            Choose <strong>Type</strong> and then pick an <strong>{selectedType || "entity"}</strong> to continue.
          </Typography>
        ) : (
          <>
            <Typography sx={{ mt: 2 }}>
              <strong>{selectedType === "agent" ? "Agent" : "Master Agent"}:</strong>{" "}
              {selectedEntity?.name || selectedEntity?.id}
            </Typography>

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2, mt: 2 }}>
              <TextField
                label="Start Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
                fullWidth
              />
              <TextField
                label="End Date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
                fullWidth
              />
              <TextField
                label="Commission (%)"
                type="number"
                value={commissionPct}
                onChange={(e) => setCommissionPct(Number(e.target.value))}
                InputProps={{ inputProps: { min: 0, step: 0.1 } }}
                size="small"
                fullWidth
              />
              <FormControlLabel
                sx={{ ml: 0 }}
                control={
                  <Switch
                    checked={includeCommissionOnRecharges}
                    onChange={() => setIncludeCommissionOnRecharges((v) => !v)}
                  />
                }
                label="Apply commission on total recharges"
              />
            </Box>

            <Box sx={{ mt: 2 }}>
              <Button
                onClick={handleFetch}
                variant="outlined"
                startIcon={<RefreshIcon />}
                disabled={loading || !canFetch}
              >
                {loading ? "Fetching..." : "Fetch"}
              </Button>
            </Box>

            <Divider sx={{ my: 2 }} />

            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            ) : summary ? (
              <Box sx={{ display: "grid", gap: 1.2 }}>
                <Typography><strong>Total Recharges:</strong> {totals.totalRecharges.toFixed(2)}</Typography>
                <Typography><strong>Total Redeems:</strong> {totals.totalRedeems.toFixed(2)}</Typography>
                <Typography><strong>Commission:</strong> {totals.commission.toFixed(2)}</Typography>
                <Typography><strong>Previous Balance:</strong> {totals.previousBalance.toFixed(2)}</Typography>
                <Typography variant="h6" sx={{ mt: 1 }}>
                  Final Balance To Pay: {totals.finalBalance.toFixed(2)}
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={handleExport}
                  disabled={!summary?.transactions?.length}
                  className="custom-button confirm"
                  sx={{ "&.Mui-disabled": { backgroundColor: "#B0B0B0", color: "#F0F0F0", cursor: "not-allowed" } }}
                >
                  Export Transactions (CSV)
                </Button>
              </Box>
            ) : (
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Select date range and click Fetch.
              </Typography>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} className="custom-button cancel">Close</Button>
      </DialogActions>
    </Dialog>
  );

  /* ------- local helpers ------- */

  async function loadEntities(type, search = "") {
    try {
      setOptionsLoading(true);
      const rows = await fetchEntitiesFromDB(type, search);
      setOptions(rows);
    } catch (e) {
      console.error(e);
      setError("Failed to load list.");
      setOptions([]);
    } finally {
      setOptionsLoading(false);
    }
  }
}

/* Helpers */
function isoDateNDaysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}
function safe(n) {
  const x = Number(n);
  return Number.isFinite(x) ? x : 0;
}
function toCSV(rows) {
  if (!rows?.length) return "";
  const cols = Object.keys(rows[0]);
  const header = cols.join(",");
  const lines = rows.map((r) => cols.map((c) => csvEscape(r[c])).join(","));
  return [header, ...lines].join("\n");
}
function csvEscape(val) {
  if (val == null) return "";
  const s = String(val);
  if (s.includes(",") || s.includes("\n") || s.includes('"')) {
    return `"${s.replaceAll('"', '""')}"`;
  }
  return s;
}
function downloadTextFile(text, filename, mime = "text/plain;charset=utf-8;") {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// helpers
function mapUser(u) {
  const username = u.get("username") || "";
  const name = u.get("name") || username || u.id;
  return {
    id: u.id,
    name,                // used by getOptionLabel
    username,            // useful if you need to show both
    label: username && name !== username ? `${name} (${username})` : name,
  };
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function fetchEntitiesFromDB(type, search = "") {
  const roleValue = type === "master" ? "Master-Agent" : "Agent";

  // Base query by role
  const base = new Parse.Query(Parse.User).equalTo("roleName", roleValue);

  // If no search term, return first page ordered by name
  const term = (search || "").trim();
  if (!term) {
    base.limit(50).ascending("name").select(["name", "username"]);
    const rows = await base.find({ useMasterKey: true });
    return rows.map(mapUser);
  }

  // Prefix, case-insensitive search on name OR username
  const rx = `^${escapeRegex(term)}`;

  const qName = new Parse.Query(Parse.User)
    .equalTo("roleName", roleValue)
    .matches("name", rx, "i");

  const qUser = new Parse.Query(Parse.User)
    .equalTo("roleName", roleValue)
    .matches("username", rx, "i");

  const q = Parse.Query.or(qName, qUser);
  q.limit(50).ascending("name").select(["name", "username"]);

  const results = await q.find({ useMasterKey: true });

  // De-duplicate (may match both fields)
  const uniq = new Map();
  for (const u of results) uniq.set(u.id, mapUser(u));
  return [...uniq.values()];
}
