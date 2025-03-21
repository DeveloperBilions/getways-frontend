import React, { useEffect, useRef, useState } from "react";
// react admin
import {
  Datagrid,
  List,
  TextField,
  SearchInput,
  DateField,
  NumberField,
  FunctionField,
  TopToolbar,
  usePermissions,
  useGetIdentity,
  useGetList,
  useRefresh,
  SelectInput,
  useListController,
  Pagination,
  required,
} from "react-admin";
import { useNavigate } from "react-router-dom";
// dialog
import RechargeDialog from "./dialog/RechargeDialog";
import CoinsCreditDialog from "./dialog/CoinsCreditDialog";
// mui
import {
  Chip,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  Typography,
  Box,
} from "@mui/material";
// mui icon
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import LinkIcon from "@mui/icons-material/Link";
import GetAppIcon from "@mui/icons-material/GetApp";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import BackupTableIcon from "@mui/icons-material/BackupTable";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import LanguageIcon from "@mui/icons-material/Language";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CircularProgress from "@mui/material/CircularProgress";
// pdf xls
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
// loader
import { Loader } from "../Loader";

import { Parse } from "parse";
import { dataProvider } from "../../Provider/parseDataProvider";
import EmergencyNotices from "../../Layout/EmergencyNotices";
import PersistentMessage from "../../Utils/View/PersistentMessage";
import CustomPagination from "../Common/CustomPagination";

// Initialize Parse
Parse.initialize(process.env.REACT_APP_APPID, process.env.REACT_APP_MASTER_KEY);
Parse.serverURL = process.env.REACT_APP_URL;

export const RechargeRecordsList = (props) => {
  const listContext = useListController(props); // ✅ Use useListController
  const {
    data,
    isLoading,
    total,
    page,
    perPage,
    setPage,
    setPerPage,
    filterValues,
    setFilters,
  } = listContext;
  const navigate = useNavigate();
  const refresh = useRefresh();
  const { permissions } = usePermissions();
  const { identity } = useGetIdentity();
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [creditCoinDialogOpen, setCreditCoinDialogOpen] = useState(false);
  const [rechargeDialogOpen, setRechargeDialogOpen] = useState(false);
  // const [searchValue, setSearchValue] = useState("");
  // const [statusValue, setStatusValue] = useState();
  // const [Data, setData] = useState(null); // Initialize data as null
  const [isExporting, setIsExporting] = useState(false); // Track export state
  const [exportError, setExportError] = useState(null); // Store any export errors
  const [searchBy, setSearchBy] = useState("username");
  const [prevSearchBy, setPrevSearchBy] = useState(searchBy);
  const prevFilterValuesRef = useRef();

  const role = localStorage.getItem("role");

  if (!role) {
    navigate("/login");
  }
  const fetchDataForExport = async (currentFilterValues) => {
    setIsExporting(true); // Set exporting to true before fetching
    setExportError(null); // Clear any previous errors

    try {
      const { data } = await dataProvider.getList("rechargeRecordsExport", {
        pagination: { page: 1, perPage: 1000 }, // Fetch up to 1000 records
        sort: { field: "transactionDate", order: "DESC" },
        filter: currentFilterValues,
      });
      console.log(data, "datafromrechargeRecordsExport");
      // setData(data);
      return data; // Return the fetched data
    } catch (error) {
      console.error("Error fetching data for export:", error);
      setExportError("Error fetching data for export."); // Set the error message
      // setData(null); // Reset data to null in case of error
      return null; // Return null to indicate failure
    } finally {
      setIsExporting(false); // Set exporting to false after fetch, regardless of success/failure
    }
  };
  const mapStatus = (status) => {
    switch (status) {
      case 0:
        return "Pending Referral Link";
      case 1:
        return "Pending Confirmation";
      case 2:
        return "Confirmed";
      case 3:
        return "Coins Credited";
      case 4:
        return "Success";
      case 5:
        return "Fail";
      case 6:
        return "Pending Approval";
      case 7:
        return "Rejected";
      case 9:
        return "Expired";
      case 10:
        return "Failed Transaction";
      default:
        return "Unknown Status";
    }
  };

  // const totalTransactionAmount =
  //   Data &&
  //   Data.filter((item) => item.status === 2 || item.status === 3).reduce(
  //     (sum, item) => sum + item.transactionAmount,
  //     0
  //   );

  const handleRefresh = async () => {
    refresh();
  };
  useEffect(() => {
    const interval = setInterval(() => {
      handleRefresh();
    }, 60000); // 60,000 ms = 1 minute

    return () => clearInterval(interval); // Cleanup when unmounted
  }, []);
  const handleCoinCredit = async (record) => {
    setSelectedRecord(record);
    setCreditCoinDialogOpen(true);
  };

  const handleUrlClick = (record) => {
    navigator.clipboard.writeText(record?.referralLink);
  };

  const handleUrlRedirect = (record) => {
    if (record?.referralLink) {
      window.open(record.referralLink, "_blank");
    }
  };

  const handleExportPDF = async () => {
    const exportData = await fetchDataForExport(filterValues); // Use existing data or fetch if null
    if (!exportData || exportData.length === 0) {
      console.warn("No data to export.");
      return;
    }
    const doc = new jsPDF();
    doc.text("Recharge Records", 10, 10);
    doc.autoTable({
      head: [["No", "Name", "Amount($)", "Remark", "Status", "Date"]],
      body: exportData.map((row, index) => [
        index + 1,
        row.username,
        row.transactionAmount,
        row.remark,
        mapStatus(row.status),
        new Date(row.transactionDate).toLocaleDateString(),
      ]),
    });
    doc.save("RechargeRecords.pdf");
  };

  const handleExportXLS = async () => {
    const exportData = await fetchDataForExport(filterValues); // Use existing data or fetch if null
    if (!exportData || exportData.length === 0) {
      console.warn("No data to export.");
      return;
    }
    const selectedFields = exportData.map((item) => ({
      Name: item.username,
      "Amount($)": item.transactionAmount,
      Remark: item.remark,
      Status: mapStatus(item.status),
      Date: new Date(item.transactionDate).toLocaleDateString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(selectedFields);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Recharge Records");
    const xlsData = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([xlsData], { type: "application/octet-stream" }),
      "RechargeRecords.xlsx"
    );
  };

  const handleMenuOpen = (event) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const searchFields = [
    "username",
    "transactionAmount",
    "remark",
    "userParentName",
  ];

  const handleSearchByChange = (newSearchBy) => {
    setSearchBy(newSearchBy);
    setPrevSearchBy(newSearchBy);

    const currentSearchValue = filterValues[prevSearchBy] || "";
    const newFilters = {};

    Object.keys(filterValues).forEach((key) => {
      if (key !== prevSearchBy && !searchFields.includes(key)) {
        newFilters[key] = filterValues[key];
      }
    });

    if (currentSearchValue && currentSearchValue.trim() !== "") {
      newFilters[newSearchBy] = currentSearchValue;
    }

    newFilters.searchBy = newSearchBy;

    if (filterValues.role) {
      newFilters.role = filterValues.role;
    }

    setFilters(newFilters, false);
  };

  useEffect(() => {
    // Compare current filterValues with previous filterValues
    const prevFilterValues = prevFilterValuesRef.current;
    const filterValuesChanged =
      JSON.stringify(prevFilterValues) !== JSON.stringify(filterValues);

    // Update the ref with current filterValues for the next run
    prevFilterValuesRef.current = filterValues;

    // Skip if no meaningful change
    if (!filterValuesChanged) {
      return;
    }
    const currentSearchValue = filterValues[searchBy] || "";
    const newFilters = {
      searchBy,
    };

    if (currentSearchValue && currentSearchValue.trim() !== "") {
      newFilters[searchBy] = currentSearchValue;
    }

    if (filterValues.role) {
      newFilters.role = filterValues.role;
    }

    const cleanedFilters = Object.keys(filterValues)
      .filter(
        (key) =>
          !searchFields.includes(key) || key === searchBy || key === "role"
      )
      .reduce((obj, key) => {
        obj[key] = filterValues[key];
        return obj;
      }, {});

    setFilters({ ...cleanedFilters, ...newFilters }, false);
  }, [filterValues, searchBy, setFilters]);

  const dataFilters = [
    <SearchInput
      source={searchBy}
      alwaysOn
      resettable
      sx={{ width: { xs: "100%", sm: "auto" }, minWidth: "200px" }}
    />,
    <SelectInput
      source="searchBy"
      label="Search By"
      validate={required()}
      alwaysOn
      value={searchBy}
      onChange={(e) => {
        const newSearchBy = e.target.value || "username";
        handleSearchByChange(newSearchBy);
      }}
      choices={
        role === "Super-User"
          ? [
              { id: "username", name: "Account" },
              { id: "transactionAmount", name: "Recharge" },
              { id: "remark", name: "Remark" },
              { id: "userParentName", name: "Parent Name" },
            ]
          : [
              { id: "username", name: "Account" },
              { id: "transactionAmount", name: "Recharge" },
              { id: "remark", name: "Remark" },
            ]
      }
    />,
    permissions !== "Player" && (
      <SelectInput
        label="Status"
        source="status"
        emptyText="All"
        alwaysOn
        resettable
        choices={[
          { id: 0, name: "Pending Referral Link" },
          { id: 1, name: "Pending Confirmation" },
          { id: 2, name: "Confirmed" },
          { id: 3, name: "Coins Credited" },
          { id: 9, name: "Expired" },
        ]}
      />
    ),
  ].filter(Boolean);

  const postListActions = (
    <TopToolbar
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" }, // Stack elements on small screens
        alignItems: "center",
        justifyContent: "flex-end", // Align buttons to the right
        gap: 2, // Add space between buttons
        p: { xs: 1, sm: 2 }, // Adjust padding for different screen sizes
        width: "100%", // Ensure full width for the toolbar
      }}
    >
      {permissions === "Player" && (
        <Button
          variant="contained"
          size="small"
          startIcon={<AttachMoneyIcon />}
          onClick={() => setRechargeDialogOpen(true)}
          sx={{ width: { xs: "100%", sm: "auto" },bgcolor:"#28A745" }} // Full width on small screens
        >
          Recharge
        </Button>
      )}

      <Button
        variant="contained"
        color="secondary"
        size="small"
        startIcon={<AutorenewIcon />}
        onClick={handleRefresh}
        sx={{ width: { xs: "100%", sm: "auto" } }} // Full width on small screens
      >
        Refresh
      </Button>

      {permissions !== "Player" && (
        <Button
          variant="contained"
          size="small"
          startIcon={<GetAppIcon />}
          onClick={handleMenuOpen}
          sx={{ width: { xs: "100%", sm: "auto" } }} // Full width on small screens
        >
          Export
        </Button>
      )}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        <MenuItem
          onClick={() => {
            handleExportPDF();
          }}
          disabled={isExporting}
        >
          <ListItemIcon>
            {isExporting ? (
              <CircularProgress size={20} />
            ) : (
              <PictureAsPdfIcon fontSize="small" />
            )}
          </ListItemIcon>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            PDF file
          </Typography>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleExportXLS();
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
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Excel file
          </Typography>
        </MenuItem>
      </Menu>
    </TopToolbar>
  );

  if (isLoading) {
    return (
      <>
        <Loader />
      </>
    );
  }
  return (
    <>
      {(role === "Master-Agent" || role === "Agent") && <EmergencyNotices />}
      {(role === "Master-Agent" || role === "Agent") && <PersistentMessage />}

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {identity?.role === "Player" && (
          <>
            <Button
              variant="outlined"
              size="small"
              sx={{ mt: 2 }}
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate("/playerDashboard")}
            >
              Back
            </Button>
            <Typography
              noWrap
              variant="subtitle2"
              sx={{ color: "text.secondary", fontWeight: 500, mt: 2 }}
            >
              Agent: <b>{identity?.userParentName}</b>
            </Typography>
          </>
        )}
      </Box>

      <List
        title={
          identity?.role !== "Player"
            ? "Recharge Records"
            : "Pending Recharge Request"
        }
        filters={dataFilters}
        actions={postListActions}
        sx={{ pt: 1 }}
        empty={false}
        {...props}
        filter={
          identity?.role !== "Player"
            ? { type: "recharge" }
            : { type: "recharge", status: 1 }
        }
        sort={{ field: "transactionDate", order: "DESC" }}
        emptyWhileLoading={true}
        pagination={false}
      >
        <Box
          style={{
            width: "100%",
            overflowX: "auto",
          }}
        >
          <Box
            style={{
              width: "100%",
              overflowX: "auto",
              overflowY: "hidden", // Prevent vertical scrolling
              position: "absolute",
            }}
          >
            <Datagrid
              size="small"
              bulkActionButtons={false}
              sx={{
                minWidth: "1000px", // Ensures the table is wide enough to scroll
                maxHeight: "100%",
                "& .RaDatagrid-table": {
                  width: "100%", // Ensures table fills the available space
                },
                "& .column-paymentMethodType": {
                  minWidth: "150px", // Ensure this column is wide enough
                  maxWidth: "150px",
                  whiteSpace: "nowrap",
                },
              }}
            >
              <FunctionField
                label="Action"
                render={(record) =>
                  record?.status === 2 && identity?.role !== "Player" ? (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<MonetizationOnIcon />}
                      onClick={() => handleCoinCredit(record)}
                      sx={{
                        mr: 1,
                        color: "black",
                        backgroundColor: "#FFFDEB",
                        border: "1px solid #FFF260",
                      }}
                    >
                      Coins Credit
                    </Button>
                  ) : record.status === 1 ? (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{
                          mr: 1,
                          color: "black",
                          backgroundColor: "#EBEEFF",
                          border: "1px solid #607BFF",
                        }}
                        startIcon={<ContentCopyIcon />}
                        onClick={() => handleUrlClick(record)}
                      >
                        Copy
                      </Button>
                      {identity?.role === "Player" && (
                        <Button
                          variant="outlined"
                          color="primary"
                          size="small"
                          sx={{
                            pr: 2,
                            pl: 2,
                          }}
                          startIcon={<LanguageIcon />}
                          onClick={() => handleUrlRedirect(record)}
                        >
                          Recharge
                        </Button>
                      )}
                    </Box>
                  ) : record.status === 0 ? (
                    <Button
                      variant="outlined"
                      color="primary"
                      size="small"
                      startIcon={<LinkIcon />}
                      onClick={() => handleUrlClick(record)}
                    >
                      Generate Link
                    </Button>
                  ) : record.status === 3 ? (
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{
                        mr: 1,
                        color: "black",
                        backgroundColor: "#EBFFEC",
                        border: "1px solid #60FF6D",
                      }}
                    >
                      Success
                    </Button>
                  ) : record.status === 9 ? (
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{
                        mr: 1,
                        color: "black",
                        backgroundColor: "#FFEBEB",
                        border: "1px solid #FF6060",
                      }}
                    >
                      Expire
                    </Button>
                  ) : null
                }
              />
              <TextField source="username" label="Account" />
              <NumberField
                source="transactionAmount"
                label="Recharged"
                textAlign="left"
              />
              <TextField source="remark" label="Remark" />
              <FunctionField
                label="Status"
                source="status"
                render={(record) => {
                  const getColor = (status) => {
                    switch (status) {
                      case 3:
                        return "#EBFFEC";
                      case 2:
                        return "#EBEEFF";
                      case 1:
                        return "#FFFCEB";
                      case 0:
                        return "#FFEBEB";
                      case 9:
                        return "#FFEBEB";
                      case 10:
                        return "#FFEBEB";
                      default:
                        return "default";
                    }
                  };
                  const statusMessage = {
                    0: "Pending Referral Link",
                    1: "Pending Confirmation",
                    2: "Confirmed",
                    3: "Coins Credited",
                    9: "Expired",
                    10: "Failed Transaction",
                  }[record.status];
                  return (
                    <Chip
                      label={statusMessage}
                      sx={{
                        color: "black",
                        backgroundColor: getColor(record.status),
                        borderRadius: "8px",
                      }}
                      size="small"
                      variant="outlined"
                    />
                  );
                }}
              />
              <FunctionField
                label="Parent"
                render={(record) => {
                  return record?.userParentName;
                }}
              />

              {role === "Super-User" && (
                <FunctionField
                  label="Mode"
                  render={(record) => {
                    return (
                      <Chip
                        label={
                          record?.referralLink?.toLowerCase().includes("aog")
                            ? "AOG"
                            : record?.useWallet
                            ? "Wallet"
                            : "Stripe"
                        }
                      />
                    );
                  }}
                />
              )}
              <DateField
                source="transactionDate"
                label="RechargeDate"
                showTime
                sortable
              />
            </Datagrid>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                width: "100% !important",
                mt: 1,
              }}
            >
              <CustomPagination
                page={page}
                perPage={perPage}
                total={total}
                setPage={setPage}
                setPerPage={setPerPage}
              />
            </Box>
          </Box>
        </Box>
      </List>
      <CoinsCreditDialog
        open={creditCoinDialogOpen}
        onClose={() => setCreditCoinDialogOpen(false)}
        data={selectedRecord}
        handleRefresh={handleRefresh}
      />
      {permissions === "Player" && (
        <RechargeDialog
          open={rechargeDialogOpen}
          onClose={() => setRechargeDialogOpen(false)}
          handleRefresh={handleRefresh}
        />
      )}
    </>
  );
};
