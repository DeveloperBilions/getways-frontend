import React, { useState } from "react";
import {
  DateInput,
  ListBase,
  FilterForm,
} from "react-admin";
import {TextField } from "@mui/material";
// mui
import {
  Box,
  MenuItem,
  Button,
  Menu,
  ListItemIcon,
} from "@mui/material";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import BackupTableIcon from "@mui/icons-material/BackupTable";
import GetAppIcon from "@mui/icons-material/GetApp";
import { dataProvider } from "../../Provider/parseDataProvider";
import CircularProgress from "@mui/material/CircularProgress";
import EmergencyNotices from "../../Layout/EmergencyNotices";

export const TransactionData = () => {
  const role = localStorage.getItem("role");
  const [menuAnchor, setMenuAnchor] = React.useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [tempStartDate, setTempStartDate] = useState(null);
  const [tempEndDate, setTempEndDate] = useState(null);
  const [tempStartTime, setTempStartTime] = useState(null);
  const [tempEndTime, setTempEndTime] = useState(null);

  const loadAndExportData = async () => {
    const filters = {
      startdate:
        document.querySelector('input[name="startdate"]')?.value || null,
      enddate: document.querySelector('input[name="enddate"]')?.value || null,
      starttime: tempStartTime || null,
      endtime: tempEndTime || null,
    };
    setIsExporting(true);

    try {
      const { data } = await dataProvider.getList("summaryExport", {
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

  const handleExportAllDataXLS = async () => {
    const exportData = await loadAndExportData(); // Fetch data
    console.log(exportData, "exportData");

    const newData = [
      ...exportData[0]?.totalRechargeByTypeData?.wallet,
      ...exportData[0]?.totalRechargeByTypeData?.others,
      ...exportData[0]?.totalRedeemByTypeData?.wallet,
      ...exportData[0]?.totalRedeemByTypeData?.others,
    ];
    console.log(newData);

    // Flatten and combine all data
    const combinedData = newData?.map((item) => ({
      "Transaction ID": item.transactionId,
      type: item?.type,
      Amount: item.amount,
      "Transaction Date": formatDateForExcel(item.transactionDate),
      Status: item.status,
      "Stripe Transaction ID": item.stripeTransactionId,
      "Redeem Service Fee": item.redeemServiceFee,
      "User Name": item?.userName,
      "Agent Name": item?.agentName,
      "Agent's Parent": item?.agentParentName,
      isCashout: item?.isCashout,
      paymentMode: item?.paymentMode,
      paymentMethodType: item?.paymentMethodType,
      remark: item?.remark,
      "Redeem Remark": item?.redeemRemarks,
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
  const dataFilters = [
    <DateInput
      label="Start date"
      source="startdate"
      alwaysOn
      resettable
      InputProps={{
        inputProps: {
          min: startDateLimit,
          max: endDate || today,
        },
      }}
      onChange={(event) => setTempStartDate(event.target.value)}
    />,
    <TextField
      label="Start time"
      source="starttime"
      type="time"
      alwaysOn
      resettable
      InputLabelProps={{ shrink: true }}
      inputProps={{
        step: 300,
      }}
      onChange={(event) => setTempStartTime(event.target.value)}
    />,
    <DateInput
      label="End date"
      source="enddate"
      alwaysOn
      resettable
      InputProps={{
        inputProps: {
          min: startDate || startDateLimit,
          max: today,
        },
      }}
      onChange={(event) => setTempEndDate(event.target.value)}
    />,
    <TextField
      label="End time"
      source="endtime"
      type="time"
      alwaysOn
      resettable
      InputLabelProps={{ shrink: true }}
      inputProps={{
        step: 300,
      }}
      onChange={(event) => setTempEndTime(event.target.value)}
    />,
  ];

  const handleFilterSubmit = (event) => {
    setStartDate(tempStartDate);
    setEndDate(tempEndDate);
    setMenuAnchor(event.currentTarget);
  };
  
  return (
    <React.Fragment>
      {(role === "Master-Agent" || role === "Agent") && <EmergencyNotices />}
      <ListBase resource="users">
        <Box display="flex" flexDirection="column">
          {" "}
          <Box display="flex" sx={{ mb: 1 }}>
            <FilterForm
              filters={dataFilters}
              sx={{
                flex: "0 2 auto !important",
                padding: "0px 0px 0px 0px !important",
                alignItems: "flex-start",
              }}
            />
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
