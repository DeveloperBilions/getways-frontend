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
import { fetchAccountingSummary, fetchAccountingTransactions } from "../../../Utils/Accounting";
const { Parse } = await import("parse");
Parse.initialize(
  process.env.REACT_APP_APPID,
  process.env.REACT_APP_JAVASCRIPT_KEY,
  process.env.REACT_APP_MASTER_KEY
);
Parse.serverURL = process.env.REACT_APP_URL;
Parse.masterKey = process.env.REACT_APP_MASTER_KEY;

export default function AgentAccountingModal({
  open,
  onClose,
  defaultCommission = 12,
  defaultType = "",
}) {
  const [selectedType, setSelectedType] = useState(defaultType || "");
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [commissionPct, setCommissionPct] = useState(defaultCommission);
  const [startDate, setStartDate] = useState(() => isoDateNDaysAgo(7));
  const [endDate, setEndDate] = useState(() => isoDateNDaysAgo(0));
  const [includeCommissionOnRecharges, setIncludeCommissionOnRecharges] = useState(true);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState(null);
  const [dateErrStart, setDateErrStart] = useState("");
  const [dateErrEnd, setDateErrEnd] = useState("");
  const [lastDateChanged, setLastDateChanged] = useState(null);
  const [commissionError, setCommissionError] = useState("");
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
      validateDates(startDate, endDate);
      validateCommission(commissionPct);
    }
  }, [open, defaultType]);

  useEffect(() => {
    setSelectedEntity(null);
    setSummary(null);
    setOptions([]);
    setInputValue("");
    if (selectedType) loadEntities(selectedType, "");
  }, [selectedType]);

  useEffect(() => {
    if (!selectedType) return;
    const t = setTimeout(() => loadEntities(selectedType, inputValue), 350);
    return () => clearTimeout(t);
  }, [inputValue, selectedType]);

  useEffect(() => {
    validateDates(startDate, endDate);
  }, [startDate, endDate, lastDateChanged]);

  useEffect(() => {
    validateCommission(commissionPct);
  }, [commissionPct]);

  const totals = useMemo(() => {
    const tr = safe(summary?.totalRecharges);
    const td = safe(summary?.totalRedeems);
    const prev = safe(summary?.previousBalance);
    const pct = clamp(Number(commissionPct) || 0, 0, 1000);
    const commission = includeCommissionOnRecharges ? (tr * pct) / 100 : 0;
    const finalBalance = prev + tr - td - commission;
    return { totalRecharges: tr, totalRedeems: td, previousBalance: prev, commission, finalBalance };
  }, [summary, commissionPct, includeCommissionOnRecharges]);

  const canFetch =
    selectedType &&
    selectedEntity &&
    startDate &&
    endDate &&
    !dateErrStart &&
    !dateErrEnd &&
    !commissionError;

  const handleFetch = async () => {
    if (!canFetch) {
      setError(
        dateErrStart || dateErrEnd || commissionError || "Please select type, entity, and a valid date range."
      );
      return;
    }
    setLoading(true);
    setError("");
    try {
      const startAtISO = toStartOfDayUTC(startDate);
      const endExclusiveISO = toEndOfDayExclusiveUTC(endDate);
      const res = await fetchAccountingSummary(
        selectedType,
        selectedEntity.id,
        startAtISO,
        endExclusiveISO,
        clamp(Number(commissionPct) || 0, 0, 1000)
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

  const handleExport = async () => {
    if (!summary) return;
    setExporting(true);
    setError("");
    try {
      const startAtISO = toStartOfDayUTC(startDate);
      const endExclusiveISO = toEndOfDayExclusiveUTC(endDate);
      const rows = await fetchAccountingTransactions(
        selectedType,
        selectedEntity.id,
        startAtISO,
        endExclusiveISO
      );
      if (!rows?.length) {
        setError("No transactions found for the selected range.");
        setExporting(false);
        return;
      }
      const csv = toCSV(rows);
      const name = selectedEntity?.name || selectedEntity?.id || "entity";
      downloadTextFile(csv, `accounting_${selectedType}_${name}_${startDate}_${endDate}.csv`);
    } catch (e) {
      setError(e.message || "Export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        Agent / Master Agent Accounting
        <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
      </DialogTitle>

      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

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
                onChange={(e) => { setStartDate(e.target.value); setLastDateChanged("start"); }}
                InputLabelProps={{ shrink: true }}
                size="small"
                fullWidth
                inputProps={{ max: endDate || undefined }}
                error={Boolean(dateErrStart)}
                helperText={dateErrStart || " "}
              />
              <TextField
                label="End Date"
                type="date"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setLastDateChanged("end"); }}
                InputLabelProps={{ shrink: true }}
                size="small"
                fullWidth
                inputProps={{ min: startDate || undefined }}
                error={Boolean(dateErrEnd)}
                helperText={dateErrEnd || " "}
              />
              <TextField
                label="Commission (%)"
                type="number"
                value={commissionPct}
                onChange={(e) => setCommissionPct(e.target.value === "" ? "" : Number(e.target.value))}
                onBlur={() => setCommissionPct((v) => clamp(Number(v) || 0, 0, 1000))}
                InputProps={{ inputProps: { min: 0, max: 1000, step: 0.1 } }}
                size="small"
                fullWidth
                error={Boolean(commissionError)}
                helperText={commissionError || " "}
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

            <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
              <Button
                onClick={handleFetch}
                variant="outlined"
                startIcon={<RefreshIcon />}
                disabled={loading || !canFetch}
              >
                {loading ? "Fetching..." : "Fetch"}
              </Button>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={handleExport}
                disabled={!summary || exporting}
              >
                {exporting ? "Exporting..." : "Export Transactions (CSV)"}
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
                <Typography
  sx={{
    color:
      totals.previousBalance > 0
        ? 'success.main'
        : totals.previousBalance < 0
        ? 'error.main'
        : 'text.primary',
  }}
>
  <strong>Previous Balance:</strong> {totals.previousBalance.toFixed(2)}
</Typography>
                <Typography variant="h6" sx={{ mt: 1 }}>
                  Final Balance To Pay: {totals.finalBalance.toFixed(2)}
                </Typography>
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
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );

  async function loadEntities(type, search = "") {
    try {
      setOptionsLoading(true);
      const rows = await fetchEntitiesFromDB(type, search);
      setOptions(rows);
    } catch (e) {
      console.log(e,"Failed to load list.")
      setError("Failed to load list.");
      setOptions([]);
    } finally {
      setOptionsLoading(false);
    }
  }

  function validateDates(s, e) {
    setDateErrStart("");
    setDateErrEnd("");
    if (!s) setDateErrStart("Select start date.");
    if (!e) setDateErrEnd("Select end date.");
    if (!s || !e) return;
    if (!isValidDateStr(s)) setDateErrStart("Use valid date (YYYY-MM-DD).");
    if (!isValidDateStr(e)) setDateErrEnd("Use valid date (YYYY-MM-DD).");
    if (!isValidDateStr(s) || !isValidDateStr(e)) return;
    const sd = new Date(s);
    const ed = new Date(e);
    if (Number.isNaN(sd.getTime())) setDateErrStart("Invalid date.");
    if (Number.isNaN(ed.getTime())) setDateErrEnd("Invalid date.");
    if (Number.isNaN(sd.getTime()) || Number.isNaN(ed.getTime())) return;
    if (sd > ed) {
      if (lastDateChanged === "end") {
        setDateErrEnd("End date cannot be before start date.");
        setDateErrStart("");
      } else {
        setDateErrStart("Start date cannot be after end date.");
        setDateErrEnd("");
      }
    }
  }

  function validateCommission(val) {
    const n = Number(val);
    if (!Number.isFinite(n)) return setCommissionError("Enter a valid number.");
    if (n < 0 || n > 1000) return setCommissionError("Commission must be between 0 and 1000.");
    setCommissionError("");
  }
}

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

function toStartOfDayUTC(dateStr) {
  return new Date(`${dateStr}T00:00:00.000Z`).toISOString();
}

function toEndOfDayExclusiveUTC(dateStr) {
  const d = new Date(`${dateStr}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString();
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function isValidDateStr(s) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(s);
  return !Number.isNaN(d.getTime()) && s === d.toISOString().slice(0, 10);
}

function mapUser(u) {
  const username = u.get("username") || "";
  const name = u.get("name") || username || u.id;
  return { id: u.id, name, username, label: username && name !== username ? `${name} (${username})` : name };
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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
