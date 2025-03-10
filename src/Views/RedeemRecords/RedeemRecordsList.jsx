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
// mui
import {
  Alert,
  Chip,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  Typography,
  Box,
} from "@mui/material";
// mui icon
import GetAppIcon from "@mui/icons-material/GetApp";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import BackupTableIcon from "@mui/icons-material/BackupTable";
import RefreshIcon from "@mui/icons-material/Refresh";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
// dialog
import RejectRedeemDialog from "./dialog/RejectRedeemDialog";
import ApproveRedeemDialog from "./dialog/ApproveRedeemDialog";
// pdf xls
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
// loader
import { Loader } from "../Loader";
import { Parse } from "parse";
import FinalRejectRedeemDialog from "./dialog/FinalRejectRedeemDialog";
import FinalApproveRedeemDialog from "./dialog/FinalApproveRedeemDialog";
import CircularProgress from "@mui/material/CircularProgress";
import { dataProvider } from "../../Provider/parseDataProvider";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import EmergencyNotices from "../../Layout/EmergencyNotices";
// Initialize Parse
Parse.initialize(process.env.REACT_APP_APPID, process.env.REACT_APP_MASTER_KEY);
Parse.serverURL = process.env.REACT_APP_URL;

export const RedeemRecordsList = (props) => {
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
  const { identity } = useGetIdentity();
  const { permissions } = usePermissions();
  const [cashout, setCashout] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [redeemDialogOpen, setRedeemDialogOpen] = useState(false);
  const [finalrejectDialogOpen, setFinalRejectDialogOpen] = useState(false);
  const [finalredeemDialogOpen, setFinalRedeemDialogOpen] = useState(false);
  // const [searchValue, setSearchValue] = useState("");
  // const [statusValue, setStatusValue] = useState();
  // const [Data, setData] = useState(null); // Initialize data as null
  const [isExporting, setIsExporting] = useState(false); // Track export state
  const [exportError, setExportError] = useState(null); // Store any export errors
  const role = localStorage.getItem("role");
  const [searchBy, setSearchBy] = useState("username");
  const [prevSearchBy, setPrevSearchBy] = useState(searchBy);
  const prevFilterValuesRef = useRef();

  if (!role) {
    navigate("/login");
  }
  const fetchDataForExport = async (currentFilterValues) => {
    setIsExporting(true); // Set exporting to true before fetching
    setExportError(null); // Clear any previous errors

    try {
      const { data } = await dataProvider.getList("redeemRecordsExport", {
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

  // Map numeric status to corresponding string message
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
      case 8:
        return "Review";
      case 9:
        return "Expired";
        case 11:
        return "Cashouts";
        case 12:
        return "Cashout Successfully";
        case 13:
          return "Cashout Reject";
      default:
        return "Unknown Status";
    }
  };

  const handleRefresh = async () => {
    refresh();
  };

  useEffect(() => {
    const interval = setInterval(() => {
      handleRefresh();
    }, 60000); // 60,000 ms = 1 minute

    return () => clearInterval(interval); // Cleanup when unmounted
  }, []);
  const handleExportPDF = async () => {
    const exportData = await fetchDataForExport(filterValues); // Use existing data or fetch if null
    if (!exportData || exportData.length === 0) {
      console.warn("No data to export.");
      return;
    }
    const doc = new jsPDF();
    doc.text("Redeem Records", 10, 10);
    doc.autoTable({
      head: [
        ["No", "Name", "Amount($)", "Remark", "Status", "Message", "Date"],
      ],
      body: exportData.map((row, index) => [
        index + 1,
        row.username,
        row.transactionAmount,
        row.remark,
        mapStatus(row.status),
        row.responseMessage,
        new Date(row.transactionDate).toLocaleDateString(),
      ]),
    });
    doc.save("RedeemRecords.pdf");
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
      Message: item.responseMessage,
      Date: new Date(item.transactionDate).toLocaleDateString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(selectedFields);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Redeem Records");
    const xlsData = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([xlsData], { type: "application/octet-stream" }),
      "RedeemRecords.xlsx"
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
    <SearchInput source={searchBy} alwaysOn resettable />,
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
        emptyText={"All"}
        alwaysOn
        resettable
        // value={filterValues?.status ?? null} // Explicitly handle undefined case
        choices={[
          { id: 5, name: "Failed" },
          { id: 6, name: "Pending Approval" },
          { id: 7, name: "Rejected" },
          { id: 8, name: "Redeem Successfully" },
          { id: 9, name: "Expired" },
          ...(permissions === "Super-User"
            ? [
                { id: 11, name: "Cashouts" },
                { id: 12, name: "Cashout Successfully" },
                { id: 13, name: "Cashout Reject" },
              ]
            : []),
        ]}
      />
    ),
  ].filter(Boolean);
const postListActions = (
  <TopToolbar
    sx={{
      display: "flex",
      flexDirection: { xs: "column", sm: "row" }, // Stack buttons on small screens
      alignItems: "center",
      justifyContent: "space-between",
      gap: 2, // Add spacing between elements
      width: "100%", // Ensure the toolbar takes full width
      p: { xs: 1, sm: 2 }, // Adjust padding for different screen sizes
    }}
  >
    <Typography
      sx={{
        // mr: { sm: 20, xs: 0 }, // Adjust margin on larger screens
        textAlign: { xs: "center", sm: "left" }, // Center text on small screens
        mb: { xs: 1, sm: 0 }, // Add margin-bottom on mobile for better spacing
      }}
    >
      Redeems may take up to 2 hours
    </Typography>

    <Box
      sx={{
        display: "flex",
        gap: 2,
        alignItems: "center",
        flexDirection: { xs: "column", sm: "row" }, // Stack buttons on small screens
        width: { xs: "100%", sm: "auto" }, // Full width on mobile
      }}
    >
      <Button
        variant="contained"
        size="small"
        startIcon={<RefreshIcon />}
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
    </Box>

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
      {(identity?.role === "Master-Agent" || identity?.role === "Agent") &&
        identity?.balance < 500 && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Your balance is too low to approve transactions.
          </Alert>
        )}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {identity?.role !== "Player" ? (
          <></>
        ) : (
          /*<Typography sx={{ mt: 2 }}>
              Total Redeemed Amount: <b>${totalTransactionAmount}</b>
            </Typography> */
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
            ? "Redeem Records"
            : "Pending Redeem Request"
        }
        filters={dataFilters}
        actions={postListActions}
        sx={{ pt: 1 }}
        empty={false}
        {...props}
        filter={
          identity?.role !== "Player"
            ? { type: "redeem" }
            : { type: "redeem", status: 6 }
        }
        sort={{ field: "transactionDate", order: "DESC" }}
        emptyWhileLoading={true}
        pagination={<Pagination />}
      >
        <Box
          style={{
            width: "100%",
            overflowX: "auto",
            // position: "relative",
            // height: "600px",
          }}
          rowStyle={(record) => {
            if (identity?.role === "Super-User" && record?.status === 11) {
              if (record?.userParentBalance < record?.transactionAmount) {
                return { backgroundColor: "rgba(255, 0, 0, 0.1)" }; // Red
              } else {
                return { backgroundColor: "rgba(0, 128, 0, 0.1)" }; // Green
              }
            }
            return {};
          }}
        >
          <Box
            style={{
              width: "100%",
              overflowX: "auto",
              overflowY: "hidden", // Prevent vertical scrolling
              // position: "absolute",
              top: 0,
              left: 0,
              right: 0,
            }}
          >
            <Datagrid
              size="small"
              bulkActionButtons={false}
              sx={{
                minWidth: "1000px", // Ensures the table is wide enough to scroll
                tableLayout: "fixed", // Fix column sizes
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
                source="action"
                render={(record) => {
                  const isCashoutPending = record?.status === 6;
                  const isSuperUserCashout =
                    record?.status === 11 && identity?.role === "Super-User";
                  const isCashoutApproved = record?.status === 12; // Example status for approved cashout

                  const isBalanceLow =
                    (identity?.role === "Master-Agent" ||
                      identity?.role === "Agent") &&
                    identity?.balance < 500;

                  return (
                    <>
                      {(isCashoutPending || isCashoutApproved) && // Ensure reject button is always available
                        (identity?.role === "Agent" ||
                          identity?.role === "Master-Agent") &&
                        identity?.objectId === record?.userParentId && (
                          <Box
                            sx={{
                              display: "flex",
                              gap: 1,
                              alignItems: "center",
                            }}
                          >
                            {isCashoutPending && (
                              <Button
                                size="small"
                                sx={{
                                  minWidth: "30px",
                                  minHeight: "30px",
                                  backgroundColor: isBalanceLow
                                    ? "#E0E0E0"
                                    : "#CCFFD6",
                                  border: `1px solid ${
                                    isBalanceLow ? "#BDBDBD" : "#4CAF50"
                                  }`,
                                  color: isBalanceLow ? "#9E9E9E" : "#4CAF50",
                                  borderRadius: "8px",
                                  "&:hover": {
                                    backgroundColor: isBalanceLow
                                      ? "#E0E0E0"
                                      : "#B2FFC4",
                                  },
                                }}
                                onClick={() => {
                                  setSelectedRecord({
                                    ...record,
                                    userParentId: identity?.objectId,
                                  });
                                  setRedeemDialogOpen(true);
                                }}
                                disabled={isBalanceLow}
                              >
                                <CheckIcon sx={{ fontSize: "16px" }} />
                              </Button>
                            )}

                            <Button
                              size="small"
                              sx={{
                                minWidth: "30px",
                                minHeight: "30px",
                                backgroundColor: "#FFD6D6",
                                border: "1px solid #FF5252",
                                color: "#FF5252",
                                borderRadius: "8px",
                                "&:hover": { backgroundColor: "#FFBFBF" },
                              }}
                              onClick={() => {
                                setSelectedRecord(record);
                                setRejectDialogOpen(true);
                              }}
                            >
                              <CloseIcon sx={{ fontSize: "16px" }} />
                            </Button>
                          </Box>
                        )}

                      {(isSuperUserCashout || isCashoutApproved) && (
                        <Box
                          sx={{ display: "flex", gap: 1, alignItems: "center" }}
                        >
                          {isSuperUserCashout && (
                            <Button
                              size="small"
                              sx={{
                                minWidth: "30px",
                                minHeight: "30px",
                                backgroundColor: "#CCFFD6",
                                border: "1px solid #4CAF50",
                                color: "#4CAF50",
                                borderRadius: "8px",
                                "&:hover": { backgroundColor: "#B2FFC4" },
                              }}
                              onClick={() => {
                                setSelectedRecord({
                                  ...record,
                                  userParentId: identity?.objectId,
                                });
                                setFinalRedeemDialogOpen(true);
                              }}
                            >
                              <CheckIcon sx={{ fontSize: "16px" }} />
                            </Button>
                          )}

                          <Button
                            size="small"
                            sx={{
                              minWidth: "30px",
                              minHeight: "30px",
                              backgroundColor: "#FFD6D6",
                              border: "1px solid #FF5252",
                              color: "#FF5252",
                              borderRadius: "8px",
                              "&:hover": { backgroundColor: "#FFBFBF" },
                            }}
                            onClick={() => {
                              setSelectedRecord(record);
                              setFinalRejectDialogOpen(true);
                              setCashout(true);
                            }}
                          >
                            <CloseIcon sx={{ fontSize: "16px" }} />
                          </Button>
                        </Box>
                      )}
                    </>
                  );
                }}
              />

              <TextField source="username" label="Account" />
              <NumberField
                source="transactionAmount"
                label="Redeemed"
                textAlign="left"
              />
              <FunctionField
                label="Parent"
                render={(record) => {
                  return record?.userParentName;
                }}
              />
              <FunctionField
                source="redeemServiceFee"
                label="ServiceFee"
                render={(record) =>
                  record.redeemServiceFee ? `${record.redeemServiceFee}%` : null
                }
              />
              <TextField source="remark" label="Remark" />
              <FunctionField
                label="Status"
                source="status"
                render={(record) => {
                  const getColor = (status) => {
                    switch (status) {
                      case 4:
                        return "success";
                      case 12:
                        return "success";
                      case 5:
                        return "error";
                      case 13:
                        return "error";
                      case 6:
                        return "warning";
                      case 7:
                        return "error";
                      case 8:
                        return "success";
                      default:
                        return "default";
                    }
                  };
                  const statusMessage = {
                    4: "Success",
                    5: "Fail",
                    6: "Pending Approval",
                    7: "Rejected",
                    8: "Redeem Successfully",
                    9: "Expired",
                    11: "Cashouts",
                    12: "Cashout Successfully",
                    13: "Cashout Reject",
                  }[record.status];
                  return (
                    <Chip
                      label={statusMessage}
                      color={getColor(record.status)}
                      size="small"
                      variant="outlined"
                    />
                  );
                }}
              />
              <DateField
                source="transactionDate"
                label="RedeemDate"
                showTime
                sortable
              />
              {identity?.role === "Super-User" && (
                <TextField source="paymentMode" label="Payment Method" />
              )}
              {identity?.role === "Super-User" && (
                <TextField source="paymentMethodType" label="Payment Id" />
              )}
              {/* <FunctionField
                label="Action"
                source="action"
                render={(record) =>
                  (record?.status === 6 && identity?.role === "Agent") ||
                  (record?.status === 6 &&
                    identity?.role === "Master-Agent" &&
                    identity?.objectId === record?.userParentId) ? (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Button
                        variant="outlined"
                        color="success"
                        size="small"
                        sx={{
                          mr: 1,
                        }}
                        onClick={() => {
                          setSelectedRecord({
                            ...record,
                            userParentId: identity?.objectId,
                          });
                          setRedeemDialogOpen(true);
                        }}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => {
                          setSelectedRecord(record);
                          setRejectDialogOpen(true);
                        }}
                      >
                        Reject
                      </Button>
                    </Box>
                  ) : record?.status === 11 &&
                    identity?.role === "Super-User" ? (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Button
                        variant="outlined"
                        color="success"
                        size="small"
                        sx={{
                          mr: 1,
                        }}
                        onClick={() => {
                          setSelectedRecord({
                            ...record,
                            userParentId: identity?.objectId,
                          });
                          setFinalRedeemDialogOpen(true);
                        }}
                      >
                        Success
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => {
                          setSelectedRecord(record);
                          setFinalRejectDialogOpen(true);
                          setCashout(true);
                        }}
                      >
                        Reject
                      </Button>
                    </Box>
                  ) : null
                }
              /> */}
            </Datagrid>
          </Box>
        </Box>
      </List>
      {(permissions === "Agent" || permissions === "Master-Agent") && (
        <>
          <RejectRedeemDialog
            open={rejectDialogOpen}
            onClose={() => setRejectDialogOpen(false)}
            handleRefresh={handleRefresh}
            selectedRecord={selectedRecord}
          />
          <ApproveRedeemDialog
            open={redeemDialogOpen}
            onClose={() => setRedeemDialogOpen(false)}
            handleRefresh={handleRefresh}
            record={selectedRecord}
          />
        </>
      )}
      {permissions === "Super-User" && (
        <>
          <FinalRejectRedeemDialog
            open={finalrejectDialogOpen}
            onClose={() => setFinalRejectDialogOpen(false)}
            handleRefresh={handleRefresh}
            selectedRecord={selectedRecord}
            cashout={cashout}
          />
          <FinalApproveRedeemDialog
            open={finalredeemDialogOpen}
            onClose={() => setFinalRedeemDialogOpen(false)}
            handleRefresh={handleRefresh}
            record={selectedRecord}
          />
        </>
      )}
    </>
  );
};
