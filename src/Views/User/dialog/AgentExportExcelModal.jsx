import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
  Box
} from "@mui/material";
import * as XLSX from "xlsx";
import { fetchAllAgentSummaries } from "../../../Utils/utils";

const AgentExportExcelModal = ({ open, onClose }) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const data = await fetchAllAgentSummaries(startDate, endDate);
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Agent Summary");
      XLSX.writeFile(wb, `Agent_Export_${startDate}_to_${endDate}.xlsx`);
    } catch (error) {
      console.error("Export failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Export Agent Summary</DialogTitle>
      <DialogContent>
        <TextField
          type="date"
          label="Start Date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          fullWidth
          margin="dense"
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          type="date"
          label="End Date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          fullWidth
          margin="dense"
          InputLabelProps={{ shrink: true }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
      <Box className="d-flex w-100 justify-content-between"
            sx={{
              flexDirection: { xs: "column-reverse", sm: "row" }, // 🔁 Reverse order on mobile
              alignItems: { xs: "stretch", sm: "stretch" }, // Stretch items to take full width in both modes
              gap: { xs: 2, sm: 2 }, // Add spacing between buttons
              marginBottom: { xs: 2, sm: 2 }, // Add margin at the bottom
              width: "100% !important", // Ensure the container takes full width
              paddingRight: { xs: 0, sm: 1 },
            }}>
        <Button onClick={onClose} disabled={loading}      className="custom-button cancel">Cancel</Button>
        <Button  className="custom-button confirm"  onClick={handleExport} disabled={loading || !startDate || !endDate}>
          {loading ? <CircularProgress size={24} /> : "Export to Excel"}
        </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default AgentExportExcelModal;
