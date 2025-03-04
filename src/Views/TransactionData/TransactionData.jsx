import React, { useCallback, useEffect,useState } from "react";
import {
  useGetIdentity,
  DateInput,
  ListBase,
  FilterForm,
} from "react-admin";
import debounce from "lodash/debounce"; // Import Lodash debounce
import { Autocomplete, TextField } from "@mui/material";
// mui
import {
  Box,
  MenuItem,
  Button,
  Menu,
  ListItemIcon,
} from "@mui/material";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import BackupTableIcon from "@mui/icons-material/BackupTable";
import GetAppIcon from "@mui/icons-material/GetApp";
import { dataProvider } from "../../Provider/parseDataProvider";
import CircularProgress from "@mui/material/CircularProgress";
import EmergencyNotices from "../../Layout/EmergencyNotices";
import { Summary } from "../Summary/DataSummary";


export const TransactionData = (props) => {
  const role = localStorage.getItem("role");
  const { identity } = useGetIdentity();
  const [menuAnchor, setMenuAnchor] = React.useState(null);
  const [isExporting, setIsExporting] = useState(false); // Track export progress
  const [exportdData, setExportData] = useState(null); // Store export data
  const [loadingData, setLoadingData] = useState(false); // Loading state for data fetch

  const [choices, setChoices] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const perPage = 10;
  const [selectedUser, setSelectedUser] = useState(null); // Store selected user
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [tempStartDate, setTempStartDate] = useState(null);
  const [tempEndDate, setTempEndDate] = useState(null);
  const [tempStartTime, setTempStartTime] = useState(null);
  const [tempEndTime, setTempEndTime] = useState(null);
  const [selectedUsertemp, setSelectedUsertemp] = useState(null); // Store selected user

  const handleUserChange = (selectedId) => {
    setSelectedUsertemp(selectedId);
  };

  const fetchUsers = async (search = "", pageNum = 1) => {
    setLoading(true);
    try {
      const { data } = await dataProvider.getList("users", {
        pagination: { page: pageNum, perPage },
        sort: { field: "username", order: "ASC" },
        filter: search
          ? {
              username: search,
              $or: [{ userReferralCode: "" }, { userReferralCode: null }],
            }
          : {
              $or: [{ userReferralCode: "" }, { userReferralCode: null }],
            },
      });

      const formattedData = data
        ?.map(
          (item) =>
            item?.id !== identity?.objectId && {
              ...item,
              optionName: `${item.username} (${item.roleName})`,
            }
        )
        .filter(Boolean); // Remove `false` values (filtered-out identities)

      setChoices(formattedData);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers(); // Initial load
  }, []);

  const loadAndExportData = async () => {
    const filters = {
      startdate:
        document.querySelector('input[name="startdate"]')?.value || null,
      enddate: document.querySelector('input[name="enddate"]')?.value || null,
      starttime: tempStartTime || null,
      endtime: tempEndTime || null,
    };
    setIsExporting(true); // Set exporting state
    setLoadingData(true); // Set loading data state

    try {
      const { data } = await dataProvider.getList("summaryExport", {
        pagination: { page: 1, perPage: 1000 },
        sort: { field: "transactionDate", order: "DESC" },
        filter: { ...filters },
      }); // Call the service to fetch export data
      console.log(data, "datafrijijrijee");
      if (data) {
        setExportData(data); // Save the fetched data
        return data; // Return the fetched data
      } else {
        console.error("No data available for export");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsExporting(false); // Hide exporting state once finished
      setLoadingData(false); // Hide loading state once data is fetched
    }
  };

  const handleMenuOpen = (event) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };
  const formatDateForExcel = (date) => {
    if (!date) return date; // Keep the original value if it's null or undefined

    const validDate = new Date(date);
    return !isNaN(validDate.getTime()) ? validDate.toISOString() : date; // Keep the original string if it's invalid
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

  const debouncedFetchUsers = useCallback(debounce(fetchUsers, 500), []);
  const dataFilters = [
    <Autocomplete
      source="username"
      sx={{ width: 230 }}
      options={choices}
      getOptionLabel={(option) => option.optionName}
      isOptionEqualToValue={(option, value) => option.id === value?.id}
      loading={loading}
      loadingText="....Loading"
      value={selectedUsertemp}
      onChange={(event, newValue) => handleUserChange(newValue)}
      onInputChange={(event, newInputValue, reason) => {
        if (reason === "input") {
          // Only trigger when user types, not on selection
          debouncedFetchUsers(newInputValue, 1);
          setSelectedUsertemp(null);
        }
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Username"
          variant="outlined"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      alwaysOn
      resettable
    />,
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
        step: 300, // 5 min intervals
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
        step: 300, // 5 min intervals
      }}
      onChange={(event) => setTempEndTime(event.target.value)}
    />,
    // <SearchSelectUsersFilter />,
  ];

  const handleFilterSubmit = () => {
    setStartDate(tempStartDate);
    setEndDate(tempEndDate);
    setSelectedUser(selectedUsertemp);
  };
  
  return (
    <React.Fragment>
      {(role === "Master-Agent" || role === "Agent") && <EmergencyNotices />}
      <ListBase resource="users" filter={{ username: selectedUser?.id }}>
        <Box display="flex" flexDirection="column">
          {" "}
          {/* Changed to column for vertical layout */}
          {/* Top Section: Apply Filter and Redeem Export */}
          <Box display="flex" sx={{ mb: 1 }}>
            <FilterForm
              filters={dataFilters}
              sx={{
                flex: "0 2 auto !important",
                padding: "0px 0px 0px 0px !important",
                alignItems: "flex-start",
              }}
            />
            <Box display="flex" alignItems="center">
              <Button
                source="date"
                variant="contained"
                onClick={handleFilterSubmit}
                sx={{ marginRight: "10px", whiteSpace: "nowrap" }}
              >
                Apply Filter
              </Button>
            </Box>
            <Button
              variant="contained"
              startIcon={<GetAppIcon sx={{ fontSize: "10px" }} />}
              onClick={handleMenuOpen}
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

        <Summary
          selectedUser={selectedUser}
          startDate={startDate}
          endDate={endDate}
        />
      </ListBase>
    </React.Fragment>
  );
};
