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
  useRefresh,
  useListController,
} from "react-admin";
import { useNavigate } from "react-router-dom";
// dialog
import RechargeDialog from "./dialog/RechargeDialog";
import CoinsCreditDialog from "./dialog/CoinsCreditDialog";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
} from "@mui/material";

// mui
import {
  Chip,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  Typography,
  Box,
  useMediaQuery,
} from "@mui/material";
// mui icon
import LinkIcon from "@mui/icons-material/Link";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import BackupTableIcon from "@mui/icons-material/BackupTable";
import LanguageIcon from "@mui/icons-material/Language";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CircularProgress from "@mui/material/CircularProgress";
import FilterListIcon from "@mui/icons-material/FilterList";
import Reload from "../../Assets/icons/reload.svg";
import Download from "../../Assets/icons/download.svg";
import CopyLink from "../../Assets/icons/copy-link.svg";
import Dollar from "../../Assets/icons/dollar.svg";
import Success from "../../Assets/icons/success.svg";
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
import { RechargeFilterDialog } from "./dialog/RechargeFilterDialog";
import { isRechargeEnabledForAgent } from "../../Utils/utils";
import { Alert } from "@mui/material";
import { TextField as MonthPickerField } from "@mui/material";
import { SelectInput } from "react-admin";
import { get } from "react-hook-form";

// Initialize Parse
Parse.initialize(process.env.REACT_APP_APPID, process.env.REACT_APP_MASTER_KEY);
Parse.serverURL = process.env.REACT_APP_URL;

export const RechargeRecordsList = (props) => {
  const listContext = useListController({
    ...props,
    filter:
      // props.identity?.role === "Player"
      //   ? { type: "recharge", status: 1 }:
      { type: "recharge" },
  });
  const {
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
  const [searchBy, setSearchBy] = useState("");
  const [prevSearchBy, setPrevSearchBy] = useState(searchBy);
  const prevFilterValuesRef = useRef();
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [rechargeDisabled, setRechargeDisabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportMonth, setExportMonth] = useState(null);
  const failedReasonMessages = {
    4000: "We weren’t able to charge the user’s card and the order was not completed. The user can try again.",
    4001: "The transaction failed due to an incorrect CVV/CVC. The user can try again ensuring they enter the correct CVV/CVC.",
    4002: "Payment was declined by the card issuer. The user should contact them for further details.",
    4010: "Payment was declined by the card issuer. The user should contact them for further details.",
    4012: "Payment was declined by the card issuer. The user should contact them for further details.",
    4003: "Incorrect card details. The user can try again ensuring they enter valid card details.",
    4004: "Insufficient balance. The user should add funds to their card and try again.",
    4005: "Card limit was exceeded. The user should use a different card to complete their purchase.",
    4011: "Card validation failed. The user can add a valid card and try again.",
    4013: "We weren’t able to charge the user’s card and the order was not completed. The user should contact support for further assistance.",
  };

  useEffect(() => {
    const checkRechargeAccess = async () => {
      if (identity?.role === "Agent") {
        const disabled = !(await isRechargeEnabledForAgent(identity.objectId));
        setRechargeDisabled(disabled);
      }
    };

    checkRechargeAccess();
  }, [identity]);

  const isMobile = useMediaQuery("(max-width:600px)");

  const handleOpenFilterModal = () => {
    setFilterModalOpen(true);
  };

  const role = localStorage.getItem("role");

  if (!role) {
    navigate("/login");
  }
  const title =
    identity?.role !== "Player"
      ? "Recharge Records"
      : "Pending Recharge Request";
  const fetchDataForExport = async (currentFilterValues) => {
    setIsExporting(true);

    try {
      const exportFilters = { ...currentFilterValues };

      if (exportFilters.month) {
        const [year, month] = exportFilters.month.split("-");
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        exportFilters.transactionDate = {
          $gte: startDate.toISOString(),
          $lte: endDate.toISOString(),
        };

        delete exportFilters.month; // remove 'month' key as it's transformed
      }

      const { data } = await dataProvider.getList("rechargeRecordsExport", {
        pagination: { page: 1, perPage: 1000 },
        sort: { field: "transactionDate", order: "DESC" },
        filter: exportFilters,
      });

      return data;
    } catch (error) {
      console.error("Error fetching data for export:", error);
      return null;
    } finally {
      setIsExporting(false);
    }
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
      ? "Wallet" :
      data?.portal === "Payarc" ? "Payarc"
      : "Stripe";
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
    setLoading(true);
    refresh();
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };
  useEffect(() => {
    if (role === "Player") {
      setSearchBy("");
      setFilters(
        // {
        //   type: "recharge",
        //   status: 1,
        // },
        false
      );
    } else {
      setSearchBy("username"); // Optional reset
    }
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
    XLSX.utils.book_append_sheet(workbook, worksheet, title);
    const xlsData = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([xlsData], { type: "application/octet-stream" }),
      "RechargeRecords.xlsx"
    );
  };

  const handleMenuOpen = () => {
    setExportDialogOpen(true); // Open dialog instead of dropdown
  };

  const handleMenuClose = () => {
    setExportDialogOpen(null);
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
      .filter((key) => !searchFields.includes(key) || key === searchBy)
      .reduce((obj, key) => {
        obj[key] = filterValues[key];
        return obj;
      }, {});

    setFilters({ ...cleanedFilters, ...newFilters }, false);
  }, [filterValues, searchBy, setFilters]);

  const dataFilters = [
    <Box
      key="search-filter"
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        width: "100%",
        justifyContent: "space-between",
      }}
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
          maxWidth: "280px",
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
          fontSize: "14px",
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
        // flexDirection: { xs: "column", sm: "row" }, // Stack elements on small screens
        alignItems: "space-between",
        justifyContent: isMobile ? "space-between" : "flex-end",
        gap: 2, // Add space between buttons
        // p: { xs: 1, sm: 2 }, // Adjust padding for different screen sizes
        width: "100%",
      }}
    >
      {isMobile && (
        <Box>
          <Typography
            sx={{
              fontSize: "24px",
              fontWeight: 400,
              color: "var(--primary-color)",
            }}
          >
            {title}
          </Typography>
        </Box>
      )}
      {/* {permissions === "Player" && (
        <Button
          variant="contained"
          size="small"
          startIcon={<AttachMoneyIcon />}
          onClick={() => setRechargeDialogOpen(true)}
          sx={{ width: { xs: "100%", sm: "auto" }, bgcolor: "#2E5BFF" }} // Full width on small screens
        >
          Recharge
        </Button>
      )} */}
      {!isMobile && (
        <Button
          variant="contained"
          color="secondary"
          size="small"
          startIcon={<img src={Reload} alt="reload" />}
          onClick={handleRefresh}
          sx={{
            width: { xs: "100%", sm: "119px" },
            height: { xs: "100%", sm: "40px" },
            backgroundColor: "var(--secondary-color)",
            color: "var(--primary-color)",
            mb: 1,
          }}
        >
          <Typography
            sx={{
              fontSize: "16px",
              fontWeight: 500,
              color: "var(--primary-color)",
              textTransform: "none",
            }}
          >
            Refresh
          </Typography>
        </Button>
      )}

      {permissions !== "Player" && (
        <>
          {isMobile ? (
            <Box
              onClick={handleMenuOpen}
              sx={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "var(--primary-color)",
                color: "var(--secondary-color)",
                width: "60px",
                height: "40px",
                borderRadius: "4px",
              }}
            >
              <img src={Download} alt="Add User" width="20px" height="20px" />
            </Box>
          ) : (
            <Button
              variant="contained"
              size="small"
              startIcon={
                <img src={Download} alt="Add User" width="20px" height="20px" />
              }
              onClick={handleMenuOpen}
              sx={{
                width: { xs: "100%", sm: "119px" },
                height: { xs: "100%", sm: "40px" },
                backgroundColor: "var(--primary-color)",
                color: "var(--secondary-color)",
                mb: 1,
              }} // Full width on small screens
            >
              <Typography
                sx={{
                  fontSize: "16px",
                  fontWeight: 500,
                  color: "var(--secondary-color)",
                  textTransform: "none",
                }}
              >
                Export
              </Typography>
            </Button>
          )}
        </>
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

  if (isLoading || loading) {
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
      {role === "Agent" && rechargeDisabled && (
        <Alert severity="warning" sx={{ my: 2 }}>
          Recharges are not available at this time. Please advise customers to
          try again later.
        </Alert>
      )}
      {!isMobile && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: "8px",
          }}
        >
          <Typography
            sx={{
              fontSize: "24px",
              fontWeight: 400,
              color: "var(--primary-color)",
            }}
          >
            {title}
          </Typography>
        </Box>
      )}
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
        title={title}
        filters={dataFilters}
        actions={postListActions}
        // sx={{ pt: 1 }}
        empty={false}
        {...props}
        filter={
          // identity?.role !== "Player"
          //   ?
          { type: "recharge" }
          // :
          // { type: "recharge", status: 1 }
        }
        sort={{ field: "transactionDate", order: "DESC" }}
        emptyWhileLoading={true}
        pagination={false}
        sx={{
          "& .RaList-actions": {
            flexWrap: "nowrap", // Ensures table fills the available space
          },
          "& .RaFilterFormInput-spacer": { display: "none" },
        }}
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
              position: "absolute",
            }}
          >
            <Datagrid
              size="small"
              bulkActionButtons={false}
              sx={{
                overflowX: "auto",
                overflowY: "hidden",
                width: "100%",
                maxHeight: "100%",
                "& .RaDatagrid-table": {
                  width: "100%", // Ensures table fills the available space
                },
                "& .column-paymentMethodType": {
                  minWidth: "150px", // Ensure this column is wide enough
                  maxWidth: "150px",
                  whiteSpace: "nowrap",
                },
                "& .MuiTableCell-head": {
                  fontWeight: 600,
                },
                borderRadius: "8px",
                borderColor: "#CFD4DB",
              }}
            >
              <FunctionField
                label="Action"
                render={(record) =>
                  record?.status === 2 && identity?.role !== "Player" ? (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<img src={Dollar} alt="Dollar" />}
                      onClick={() => handleCoinCredit(record)}
                      sx={{
                        mr: 1,
                        color: "black",
                        backgroundColor: "#FFFDEB",
                        border: "1px solid #FFF260",
                        whiteSpace: "nowrap",
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
                      {identity?.role === "Player" && record?.referralLink && 
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{
                          mr: 1,
                          color: "black",
                          backgroundColor: "#EBEEFF",
                          border: "1px solid #607BFF",
                        }}
                        startIcon={<img src={CopyLink} alt="Copy Link" />}
                        onClick={() => handleUrlClick(record)}
                      >
                        Copy
                      </Button>}
                      {identity?.role === "Player" && record?.referralLink && (
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
                      startIcon={<img src={Success} alt="Success" />}
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
              <FunctionField
                source="remark"
                label="Remark"
                render={(record) => {
                  const text = record.remark || "-";
                  // Only show tooltip if text is long
                  const maxLength = 30;
                  const displayText =
                    text.length > maxLength
                      ? `${text.substring(0, maxLength)}...`
                      : text;

                  return (
                    <Tooltip
                      title={text !== "-" ? text : ""}
                      arrow
                      placement="top"
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          maxWidth: "200px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          cursor: "default",
                        }}
                      >
                        {displayText}
                      </Typography>
                    </Tooltip>
                  );
                }}
              />
              {/* {role === "Player" && 
              <FunctionField
              label="Failed reason"
              render={(record) => {
                 if(record?.status == "10")
                 {
                    return "Payment is not received by TransFi or reverted back to end user due to incorrect information while paying in or compliance checks. This is terminal status"
                 }
              }}
            />} */}
              <FunctionField
                label="Status"
                source="status"
                render={(record) => {
                  const getColor = (status) => {
                    switch (status) {
                      case 3:
                        return { color: "#EBFFEC", borderColor: "#60FF6D" };
                      case 2:
                        return { color: "#EBEEFF", borderColor: "#607BFF" };
                      case 1:
                        return { color: "#FFFCEB", borderColor: "#FFDC60" };
                      case 0:
                      case 9:
                      case 10:
                        return { color: "#FFEBEB", borderColor: "#FF6060" };
                      default:
                        return { color: "default", borderColor: "default" };
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
                        backgroundColor: getColor(record.status).color,
                        border: `1px solid ${
                          getColor(record.status).borderColor
                        }`,
                        borderRadius: "8px",
                        fontSize: "14px",
                        fontWeight: 400,
                      }}
                      size="small"
                      variant="outlined"
                    />
                  );
                }}
              />
              <FunctionField
                label="Failed Reason"
                render={(record) => {
                  const failedReason = record.failed_reason;
                  const failReasonCode = record.fail_reason;

                  // Priority 1: Directly show `failed_reason` if present
                  if (failedReason) {
                    const isLong = failedReason.length > 30;
                    const display = isLong
                      ? failedReason.substring(0, 30) + "..."
                      : failedReason;
                    return (
                      <Tooltip title={failedReason} arrow placement="top">
                        <Typography
                          variant="body2"
                          sx={{
                            maxWidth: "200px",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            cursor: "default",
                          }}
                        >
                          {display}
                        </Typography>
                      </Tooltip>
                    );
                  }

                  // Priority 2: Handle numeric `fail_reason` if `failed_reason` is not present
                  const code = parseInt(failReasonCode);
                  const mappedMessage = !isNaN(code)
                    ? failedReasonMessages[code]
                    : null;

                  if (mappedMessage) {
                    const fullText = `${failReasonCode} - ${mappedMessage}`;
                    const isLong = fullText.length > 30;
                    const display = isLong
                      ? fullText.substring(0, 30) + "..."
                      : fullText;

                    return (
                      <Tooltip title={fullText} arrow placement="top">
                        <Typography
                          variant="body2"
                          sx={{
                            maxWidth: "200px",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            cursor: "default",
                          }}
                        >
                          {display}
                        </Typography>
                      </Tooltip>
                    );
                  }

                  // If neither exists
                  return "-";
                }}
              />

              {role === "Super-User" && (
                <FunctionField
                  label="Transaction Confirmation Link"
                  render={(record) => {
                    // Check if the status is 2 (Confirmed) or 3 (Coins Credited)
                    if (
                      ![2, 3].includes(record?.status) ||
                      (!record?.referralLink
                        ?.toLowerCase()
                        .includes("crypto.link.com") &&
                        !record?.referralLink
                          ?.toLowerCase()
                          .includes("pay.coinbase.com"))
                    ) {
                      return "N/A"; // Don't show the button if status is not 2 or 3, and referral link doesn't match
                    }

                    let link = "#"; // Default value if no link available
                    let linkText = "Check Transaction";

                    // Check for crypto.com transaction (Link)
                    if (
                      record?.referralLink
                        ?.toLowerCase()
                        .includes("crypto.link.com")
                    ) {
                      link = `https://etherscan.io/tx/${record?.transactionHash}`;
                    }
                    // Check for Coinbase transaction (Coinbase)
                    else if (
                      record?.referralLink
                        ?.toLowerCase()
                        .includes("pay.coinbase.com")
                    ) {
                      link = `https://basescan.org/tx/${record?.transactionHash}`;
                    } else {
                      linkText = "Not Available"; // Fallback text for unsupported types
                    }

                    return (
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{
                          color: link === "#" ? "gray" : "#1976D2", // Button color for valid link
                          textDecoration: link === "#" ? "none" : "underline",
                          fontWeight: 500,
                          fontSize: "12px", // Smaller font size
                          padding: "4px 10px", // Reduced padding for a smaller button
                          borderRadius: "6px",
                          border:
                            link === "#"
                              ? "1px solid #C4C4C4"
                              : "1px solid #1976D2", // Border color
                          backgroundColor: link === "#" ? "#f5f5f5" : "#E3F2FD", // Background color
                          "&:hover": {
                            backgroundColor:
                              link === "#" ? "#f5f5f5" : "#BBDEFB", // Hover effect for better user experience
                          },
                          minWidth: "120px", // Minimum width for uniform button size
                        }}
                        onClick={() => {
                          if (link !== "#") {
                            window.open(link, "_blank");
                          }
                        }}
                        disabled={link === "#"} // Disable button if no link is available
                      >
                        {linkText}
                      </Button>
                    );
                  }}
                />
              )}
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
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          borderRadius: "4px",
                          border: "1px solid #E4E4E7",
                          bgcolor: "#F4F4F5",
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: "14px",
                            fontWeight: 400,
                          }}
                        >
                          {record?.transactionIdFromStripe
                            ?.toLowerCase()
                            .includes("txn")
                            ? "WERT"
                            : record?.transactionIdFromStripe
                                ?.toLowerCase()
                                .includes("crypto.link.com")
                            ? "Link"
                            : record?.referralLink
                                ?.toLowerCase()
                                .includes("pay.coinbase.com")
                            ? "CoinBase"
                            : record?.referralLink
                                ?.toLowerCase()
                                .includes("aog")
                            ? "AOG"
                            : record?.referralLink
                                ?.toLowerCase()
                                .includes("transfi")
                            ? "TransFi"
                            : record?.useWallet
                            ? "Wallet":
                            record?.portal === "Payarc" ? "Payarc"
                            : "Stripe"}
                        </Typography>
                      </Box>
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
      <RechargeFilterDialog
        open={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        searchBy={searchBy}
        setSearchBy={setSearchBy}
        role={role}
        filterValues={filterValues}
        setFilters={setFilters}
        handleSearchByChange={handleSearchByChange}
      />
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
      <Dialog
        open={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
        fullWidth
  maxWidth="sm"
      >
        <DialogTitle>Select Month to Export</DialogTitle>
        <DialogContent>
          <MonthPickerField
            label="Month"
            type="month"
            value={exportMonth}
            onChange={(e) => {
              const value = e.target.value;
              setExportMonth(value);
            }}
            InputLabelProps={{ shrink: true }}
            fullWidth
            sx={{ mt: 1 }}
          />

          {isExporting && (
            <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
              <CircularProgress size={24} sx={{ mr: 2 }} />
              <Typography variant="body2">Exporting...</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ padding: 2 }} className="custom-modal-footer">
        <Box className="d-flex w-100 justify-content-between"
            sx={{
              flexDirection: { xs: "column-reverse", sm: "row" }, // 🔁 Reverse order on mobile
              alignItems: { xs: "stretch", sm: "stretch" }, // Stretch items to take full width in both modes
              gap: { xs: 2, sm: 2 }, // Add spacing between buttons
              marginBottom: { xs: 2, sm: 2 }, // Add margin at the bottom
              width: "100% !important", // Ensure the container takes full width
              paddingRight: { xs: 0, sm: 1 },
            }}>
          <Button
            onClick={() => setExportDialogOpen(false)}
            disabled={isExporting}
            className="custom-button cancel"
          >
            Cancel
          </Button>
          <Button
           className="custom-button confirm"
            onClick={async () => {
              if (!exportMonth) return;

              setIsExporting(true);
              const filters = { ...filterValues, month: exportMonth };
              const exportData = await fetchDataForExport(filters);

              if (!exportData || exportData.length === 0) {
                console.warn("No data to export.");
                setIsExporting(false);
                return;
              }

              const doc = new jsPDF();
              doc.text("Recharge Records", 10, 10);
              doc.autoTable({
                head: [
                  [
                    "No",
                    "Name",
                    "Amount($)",
                    "Remark",
                    "Status",
                    "Mode",
                    "Date",
                  ],
                ],
                body: exportData.map((row, index) => [
                  index + 1,
                  row.username,
                  row.transactionAmount,
                  row.remark,
                  mapStatus(row.status),
                  getMode(row),
                  new Date(row.transactionDate).toLocaleDateString(),
                ]),
              });
              doc.save("RechargeRecords.pdf");

              setIsExporting(false);
              setExportDialogOpen(false);
            }}
            disabled={!exportMonth || isExporting}
          >
            Export PDF
          </Button>
          <Button
          className="custom-button confirm"
            onClick={async () => {
              if (!exportMonth) return;

              setIsExporting(true);
              const filters = { ...filterValues, month: exportMonth };
              const exportData = await fetchDataForExport(filters);

              if (!exportData || exportData.length === 0) {
                console.warn("No data to export.");
                setIsExporting(false);
                return;
              }

              const selectedFields = exportData.map((item) => ({
                Name: item.username,
                "Amount($)": item.transactionAmount,
                Remark: item.remark,
                Status: mapStatus(item.status),
                Mode: getMode(item),
                Date: new Date(item.transactionDate).toLocaleDateString(),
              }));

              const worksheet = XLSX.utils.json_to_sheet(selectedFields);
              const workbook = XLSX.utils.book_new();
              XLSX.utils.book_append_sheet(
                workbook,
                worksheet,
                "Recharge Records"
              );
              const xlsData = XLSX.write(workbook, {
                bookType: "xlsx",
                type: "array",
              });
              saveAs(
                new Blob([xlsData], { type: "application/octet-stream" }),
                "RechargeRecords.xlsx"
              );

              setIsExporting(false);
              setExportDialogOpen(false);
            }}
            disabled={!exportMonth || isExporting}
          >
            Export Excel
          </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </>
  );
};
