import React, { useState } from "react";
import { DateInput, ListBase, FilterForm } from "react-admin";
import { TextField, Typography } from "@mui/material";
// mui
import { Box, MenuItem, Button, Menu, ListItemIcon } from "@mui/material";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import BackupTableIcon from "@mui/icons-material/BackupTable";
import GetAppIcon from "@mui/icons-material/GetApp";
import { dataProvider } from "../../Provider/parseDataProvider";
import CircularProgress from "@mui/material/CircularProgress";
import EmergencyNotices from "../../Layout/EmergencyNotices";

export const TransactionData = (props) => {
  const role = localStorage.getItem("role");
  const [menuAnchor, setMenuAnchor] = React.useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [tempStartDate, setTempStartDate] = useState(null);
  const [tempEndDate, setTempEndDate] = useState(null);
  const [tempStartTime, setTempStartTime] = useState(null);
  const [tempEndTime, setTempEndTime] = useState(null);

  const loadAndExportData = async () => {
    const filters = {
      startdate:
      tempStartDate || "2025-05-01",
      enddate: tempEndDate || "2025-05-17",
      starttime: tempStartTime || null,
      endtime: tempEndTime || null,
    };
    setIsExporting(true);

    try {
      const { data } = await dataProvider.getList("summaryExportSuperUser", {
        pagination: { page: 1, perPage: 1000 },
        sort: { field: "transactionDate", order: "DESC" },
        filter: { ...filters },
      });
      if (data) {
        return data;
      } else {
        console.error("No data available for export");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };
  const formatDateForExcel = (date) => {
    if (!date) return date;

    const validDate = new Date(date);
    return !isNaN(validDate.getTime()) ? validDate.toISOString() : date;
  };

  const getMode = (data) => {
    return data?.transactionIdFromStripe?.toLowerCase().includes("txn")
      ? "WERT"
      : data?.transactionIdFromStripe?.toLowerCase().includes("crypto.link.com")
      ? "Link"
      : data?.referralLink?.toLowerCase().includes("pay.coinbase.com")
      ? "CoinBase"
      : data?.referralLink?.toLowerCase().includes("aog")
      ? "AOG"
      : data?.referralLink?.toLowerCase().includes("transfi")
      ? "TransFi"
      : data?.useWallet
      ? "Wallet"
      : "Stripe";
  };
  
  const handleExportAllDataXLS = async () => {
    const exportData = await loadAndExportData(); // Fetch data
  
    // Flatten and combine all data
    const combinedData = exportData.map((item) => ({
      "Transaction ID": item.id,
      type: item?.type,
      Amount: item.transactionAmount,
      "Transaction Date": formatDateForExcel(item.transactionDate),
      Status: item.status,
      "Stripe Transaction ID": item.transactionIdFromStripe,
      "Redeem Service Fee": item.redeemServiceFee,
      "Agent Name": item?.agentName,
      "User Name": item?.userName,
      "Agent Parent Name": item?.agentParentName,
      isCashout: item?.isCashOut,
      paymentMode: item?.paymentMode,
      paymentMethodType: item?.paymentMethodType,
      remark: item?.remark,
      "Redeem Remark": item?.redeemRemarks,
      Mode: getMode(item), // <-- Add Mode using helper
    }));
  
    // Create worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(combinedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "All Data");
  
    // Write Excel file
    const xlsData = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([xlsData], { type: "application/octet-stream" }),
      "AllData.xlsx"
    );
  };
  

  const today = new Date().toISOString().split("T")[0]; // Format as YYYY-MM-DD
  const startDateLimit = "2024-12-01"; // Start date limit: 1st December 2025

  const handleFilterSubmit = (event) => {
    if (!tempStartDate || !tempEndDate) {
      alert("Please select both the start date and end date.");
      return;
    }
    setMenuAnchor(event.currentTarget);
  };

  return (
    <React.Fragment>
      {(role === "Master-Agent" || role === "Agent") && <EmergencyNotices />}
      <ListBase resource="users">
        <Box display="flex" flexDirection="column">
          <Box
            display="flex"
            flexDirection={{ xs: "column", sm: "row" }}
            flexWrap="wrap"
            gap={2}
            alignItems={{ xs: "stretch", sm: "flex-end" }}
            sx={{ mb: 2 }}
          >
            <Box display="flex" flexDirection="column" key="start-date">
              <Typography
                variant="body2"
                sx={{
                  mb: 0.5,
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#00000099",
                }}
              >
                Start Date<span style={{ color: "red" }}> *</span>
              </Typography>
              <TextField
                type="date"
                key={"startdate"}
                value={tempStartDate}
                onChange={(event) => setTempStartDate(event.target.value)}
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  min: startDateLimit,
                  max: tempEndDate || today,
                }}
                required
                sx={{
                  "& .MuiInputBase-root": {
                    height: "40px",
                  },
                }}
              />
            </Box>
            <Box display="flex" flexDirection="column" key="start-time">
              <Typography
                variant="body2"
                sx={{
                  mb: 0.5,
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#00000099",
                }}
              >
                Start Time
              </Typography>
              <TextField
                type="time"
                value={tempStartTime}
                onChange={(event) => setTempStartTime(event.target.value)}
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  step: 300,
                }}
                sx={{
                  "& .MuiInputBase-root": {
                    height: "40px",
                  },
                }}
              />
            </Box>
            <Box display="flex" flexDirection="column" key="end-date">
              <Typography
                variant="body2"
                sx={{
                  mb: 0.5,
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#00000099",
                }}
              >
                End Date<span style={{ color: "red" }}> *</span>
              </Typography>
              <TextField
                type="date"
                key={"enddate"}
                value={tempEndDate}
                onChange={(event) => setTempEndDate(event.target.value)}
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  min: tempStartDate || startDateLimit,
                  max: today,
                }}
                required
                sx={{
                  "& .MuiInputBase-root": {
                    height: "40px",
                  },
                }}
              />
            </Box>
            <Box display="flex" flexDirection="column" key="end-time">
              <Typography
                variant="body2"
                sx={{
                  mb: 0.5,
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#00000099",
                }}
              >
                End Time
              </Typography>
              <TextField
                type="time"
                value={tempEndTime}
                onChange={(event) => setTempEndTime(event.target.value)}
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  step: 300,
                }}
                sx={{
                  "& .MuiInputBase-root": {
                    height: "40px",
                  },
                }}
              />
            </Box>
            <Button
              variant="contained"
              startIcon={<GetAppIcon sx={{ fontSize: "10px" }} />}
              onClick={handleFilterSubmit}
            >
              Export All
            </Button>
          </Box>
          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={handleMenuClose}
          >
            <MenuItem
              onClick={() => {
                handleExportAllDataXLS();
                //  handleMenuRechargeClose();
              }}
              disabled={isExporting}
            >
              <ListItemIcon>
                {isExporting ? (
                  <CircularProgress size={20} />
                ) : (
                  <BackupTableIcon fontSize="small" />
                )}
              </ListItemIcon>
              Excel
            </MenuItem>
          </Menu>
        </Box>
      </ListBase>
    </React.Fragment>
  );
};
