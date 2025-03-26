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
import AutorenewIcon from "@mui/icons-material/Autorenew";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import InfoIcon from "@mui/icons-material/Info";
import FilterListIcon from "@mui/icons-material/FilterList";
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
import PersistentMessage from "../../Utils/View/PersistentMessage";
import CustomPagination from "../Common/CustomPagination";
import { ReedemFilterDialog } from "./dialog/RedeemFilterDialog";
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
  const [filterModalOpen, setFilterModalOpen] = useState(false);

  const handleOpenFilterModal = () => {
    setFilterModalOpen(true);
  };

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
    <Box
      key="search-filter"
      sx={{ display: "flex", alignItems: "center", gap: 1 }}
      alwaysOn
    >
      <SearchInput
        source={searchBy}
        alwaysOn
        resettable
        placeholder={searchBy.charAt(0).toUpperCase() + searchBy.slice(1)}
        sx={{
          width: { xs: "100%", sm: "auto" },
          minWidth: "200px",
          marginBottom: 1,
          borderRadius: "5px",
          borderColor: "#CFD4DB",
        }}
      />
      <Button
        variant="outlined"
        onClick={handleOpenFilterModal}
        sx={{
          height: "40px",
          borderRadius: "5px",
          border: "1px solid #CFD4DB",
          fontWeight: 400,
          fontSize: "body-s",
          textTransform: "capitalize",
        }}
      >
        <FilterListIcon
          sx={{ marginRight: "6px", width: "16px", height: "16px" }}
        />{" "}
        Filter
      </Button>
    </Box>,
  ].filter(Boolean);
  const postListActions = (
    <TopToolbar
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-end",
        width: { xs: "100%", sm: "auto" },
      }}
    >
      <Box
        sx={{
          width: { xs: "100%", sm: "auto" },
          height: "26px",
          borderRadius: "4px",
          gap: "8px",
          padding: "0 12px",
          marginLeft: "10px",
          background: "var(--semantic-warning-light, #FEF3C7)",
          border: "1px solid var(--semantic-warning, #F59E0B)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 400,
            fontSize: "12px",
            lineHeight: "150%",
            letterSpacing: "1.2%",
            verticalAlign: "middle",            
            color: "var(--semantic-warning, #F59E0B)",
            padding: "0 4px",
          }}
        >
          <InfoIcon style={{ marginRight: "4px" }} />
          Redeems may take up to 2 hours
        </Typography>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: "center",
          justifyContent: "flex-end",
          p: { xs: 1, sm: 0 },
          width: { xs: "100%", sm: "auto" },
          gap: { xs: 1, sm: 2 },
          
        }}
      >
        <Button
          variant="contained"
          size="small"
          color="secondary"
          startIcon={<AutorenewIcon />}
          onClick={handleRefresh}
          sx={{ width: { xs: "100%", sm: "auto" } }}
        >
          Refresh
        </Button>
        {permissions !== "Player" && (
          <Button
            variant="contained"
            size="small"
            startIcon={<GetAppIcon />}
            onClick={handleMenuOpen}
            sx={{ width: { xs: "100%", sm: "auto" } }}
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
              //handleMenuClose();
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
              //handleMenuClose();
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
      </Box>
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

      {identity?.role === "Agent" && identity?.balance < 500 && (
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
        empty={false}
        {...props}
        filter={
          identity?.role !== "Player"
            ? { type: "redeem" }
            : { type: "redeem", status: 6 }
        }
        sort={{ field: "transactionDate", order: "DESC" }}
        emptyWhileLoading={true}
        pagination={false}
        sx={{
          pt: 1,
          "& .RaList-actions": {
            flexWrap: "nowrap", // Ensures table fills the available space
          },
        }}
      >
        <Box
          style={{
            width: "100%",
            overflowX: "auto",
            // position: "relative",
            // height: "600px",
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
                minWidth: "1000px",
                minHeight: "100%",
                "& .RaDatagrid-table": {
                  width: "100%", // Ensures table fills the available space
                },
                "& .column-paymentMethodType": {
                  minWidth: "150px", // Ensure this column is wide enough
                  maxWidth: "150px",
                  whiteSpace: "nowrap",
                },
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
                    (identity?.balance < 500 ||
                      record?.transactionAmount > identity?.balance);

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
                        return "#EBFFEC";
                      case 12:
                        return "#EBFFEC";
                      case 5:
                        return "#FFEBEB";
                      case 13:
                        return "#FFEBEB";
                      case 6:
                        return "#FFFCEB";
                      case 7:
                        return "#FFEBEB";
                      case 8:
                        return "#EBFFEC";
                      case 9:
                        return "#FFEBEB";
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
            </Datagrid>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                width: "100% !important",
                margin: "16px 0px",
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
      <ReedemFilterDialog
        open={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        searchBy={searchBy}
        setSearchBy={setSearchBy}
        role={role}
        filterValues={filterValues}
        setFilters={setFilters}
        handleSearchByChange={handleSearchByChange}
      />
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
