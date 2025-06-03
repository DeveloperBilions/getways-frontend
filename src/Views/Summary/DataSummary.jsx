import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import {
  useGetIdentity,
  useGetList,
  Loading,
  DateInput,
  ListBase,
  FilterForm,
} from "react-admin";
import debounce from "lodash/debounce"; // Import Lodash debounce
import { Autocomplete, TextField } from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
// mui
import {
  Typography,
  Card,
  CardContent,
  Grid,
  Box,
  FormControl,
  Select,
  MenuItem,
  Button,
  Menu,
  ListItemIcon,
} from "@mui/material";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { dataProvider } from "../../Provider/parseDataProvider";
import CircularProgress from "@mui/material/CircularProgress";
import EmergencyNotices from "../../Layout/EmergencyNotices";
import pdfIcon from "../../Assets/icons/pdfIcon.svg";
import excelIcon from "../../Assets/icons/excelIcon.svg";
import downloadDark from "../../Assets/icons/downloadDark.svg";
import { TextField as MonthPickerField } from "@mui/material";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { RadioGroup, Radio, FormControlLabel } from "@mui/material";
import calendarIcon from "../../Assets/icons/calendar-03.svg";
import InputAdornment from "@mui/material/InputAdornment";

const iconImports = {
  TotalUser: () => import("../../Assets/icons/TotalUser.svg"),
  TotalAgent: () => import("../../Assets/icons/TotalAgent.svg"),
  TotalRecharge: () => import("../../Assets/icons/TotalRecharge.svg"),
  TotalRedeem: () => import("../../Assets/icons/TotalRedeem.svg"),
  PendingRecharge: () => import("../../Assets/icons/PendingRecharge.svg"),
  FailedRedeem: () => import("../../Assets/icons/FailedRedeem.svg"),
  TotalCashoutRedeemSuccessfull: () =>
    import("../../Assets/icons/TotalCashoutRedeemSuccessfull.svg"),
  TotalCashoutRedeemPending: () =>
    import("../../Assets/icons/TotalCashoutRedeemPending.svg"),
  TotalFeesCharged: () => import("../../Assets/icons/TotalFeesCharged.svg"),
  TotalWalletBalance: () => import("../../Assets/icons/TotalWalletBalance.svg"),
  TotalRecharge_Filtered: () =>
    import("../../Assets/icons/TotalRecharge_Filtered.svg"),
};

const preloadedIcons = {};
Object.keys(iconImports).forEach((key) => {
  iconImports[key]().then((module) => {
    preloadedIcons[key] = module.default;
  });
});

// Extracted card component for better code splitting and reuse
const SummaryCard = React.memo(({ item }) => (
  <Card
    sx={{
      backgroundColor: item?.bgColor,
      borderRadius: "4px",
      boxShadow: 0,
      px: 1,
      height: "100%", // Ensure consistent heights
    }}
  >
    <CardContent>
      <Typography
        variant="subtitle1"
        display="flex"
        alignItems="center"
        sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
      >
        {item?.icon} {item?.name}
      </Typography>
      {item.filter && <Box sx={{ mt: 2 }}>{item.filter}</Box>}
      <Typography
        variant="h4"
        sx={{
          mt: 2,
          fontWeight: 400,
          fontSize: "32px",
          lineHeight: "100%",
          letterSpacing: "0%",
          color: item?.color || "inherit",
        }}
      >
        {item?.value}
      </Typography>
    </CardContent>
  </Card>
));

// Loading placeholder with fixed dimensions to prevent layout shifts
const LoadingPlaceholder = () => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    minHeight={{ xs: "40vh", md: "50vh" }}
    width="100%"
  >
    <Loading />
  </Box>
);

// Date selection placeholder with fixed dimensions
const DateSelectionPrompt = React.memo(() => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    height="300px"
    width="100%"
  >
    <Card
      sx={{
        padding: { xs: "10px", sm: "20px" },
        textAlign: "center",
        maxWidth: { xs: "90%", sm: "400px" },
        backgroundColor: "#f9f9f9",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
        borderRadius: "10px",
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="center" mb={2}>
          <EventIcon color="primary" sx={{ fontSize: { xs: 30, sm: 40 } }} />
        </Box>
        <Typography
          variant="h6"
          fontWeight="bold"
          sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
        >
          Select a Date Range
        </Typography>
        <Typography
          variant="body2"
          color="textSecondary"
          sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
        >
          Please select both start and end dates to view the summary data.
        </Typography>
      </CardContent>
    </Card>
  </Box>
));

const Summary = React.memo(({ selectedUser, startDate, endDate }) => {
  const [selectedRechargeType, setSelectedRechargeType] = useState("all");
  const role = localStorage.getItem("role");

  // Only fetch data when needed
  const shouldFetch = Boolean(startDate && endDate);

  const { data, isLoading } = useGetList(
    "summary",
    shouldFetch
      ? {
          filter: {
            username: selectedUser?.id,
            startDate,
            endDate,
          },
          // Add pagination to reduce data load
          pagination: { page: 1, perPage: 10 },
        }
      : { enabled: false }
  );

  // Calculate filtered recharge value - always call hooks regardless of condition
  const filteredRechargeValue = useMemo(() => {
    if (
      !shouldFetch ||
      isLoading ||
      !data ||
      !data[0] ||
      !data[0].totalRechargeByType
    )
      return 0;

    return selectedRechargeType === "wallet"
      ? data[0].totalRechargeByType?.wallet || 0
      : selectedRechargeType === "others"
      ? data[0].totalRechargeByType?.others || 0
      : (data[0].totalRechargeByType?.wallet || 0) +
        (data[0].totalRechargeByType?.others || 0);
  }, [data, selectedRechargeType, shouldFetch, isLoading]);

  // Create recharge items - always call hooks regardless of condition
  const rechargeItems = useMemo(() => {
    if (!shouldFetch || isLoading || !data || role !== "Super-User") return [];

    return [
      {
        id: 35,
        name: "Total Recharge (Filtered)",
        value: filteredRechargeValue,
        bgColor: "#EBF7FF",
        borderColor: "#FF9C9C",
        color: "#287AB1",
        icon: preloadedIcons.TotalRecharge_Filtered ? (
          <img
            src={preloadedIcons.TotalRecharge_Filtered}
            alt="Total Recharge Filtered"
            style={{ marginRight: "4px" }}
            loading="lazy"
          />
        ) : null,
        filter: (
          <FormControl fullWidth>
            <Select
              value={selectedRechargeType}
              onChange={(e) => setSelectedRechargeType(e.target.value)}
              sx={{
                fontSize: { xs: "0.875rem", sm: "1rem" },
                height: "40px",
                backgroundColor: "var(--secondary-color)",
              }}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="wallet">Wallet</MenuItem>
              <MenuItem value="others">Others</MenuItem>
            </Select>
          </FormControl>
        ),
      },
    ];
  }, [
    role,
    filteredRechargeValue,
    selectedRechargeType,
    shouldFetch,
    isLoading,
    data,
  ]);

  // Prepare data for cards - always call hooks regardless of condition
  const summaryData = useMemo(() => {
    if (!shouldFetch || isLoading || !data || !data[0]) return [];

    const finalData = [
      {
        id: 1,
        name: "Total User",
        value: data[0].totalRegisteredUsers,
        bgColor: "#EFF6FF",
        borderColor: "#7EB9FB",
        color: "#4556D9",
        icon: preloadedIcons.TotalUser ? (
          <img
            src={preloadedIcons.TotalUser}
            alt="Total User"
            style={{ marginRight: "4px" }}
            loading="lazy"
          />
        ) : null,
      },
      {
        id: 2,
        name: "Total Agent",
        value: data[0].totalAgents,
        bgColor: "#FAF5FF",
        borderColor: "#937EFB",
        color: "#4943D9",
        icon: preloadedIcons.TotalAgent ? (
          <img
            src={preloadedIcons.TotalAgent}
            alt="Total Agent"
            style={{ marginRight: "4px" }}
            loading="lazy"
          />
        ) : null,
      },
      {
        id: 3,
        name: "Total Recharges",
        value: data[0].totalRechargeAmount,
        bgColor: "#EBF9F0",
        borderColor: "#9CDAB8",
        color: "#1AA24D",
        icon: preloadedIcons.TotalRecharge ? (
          <img
            src={preloadedIcons.TotalRecharge}
            alt="Total Recharge"
            style={{ marginRight: "4px" }}
            loading="lazy"
          />
        ) : null,
      },
      {
        id: 4,
        name: "Total Redeems",
        value: data[0].totalRedeemAmount,
        bgColor: "#FEF2F2",
        borderColor: "#C4B0DF",
        color: "#DC2626",
        icon: preloadedIcons.TotalRedeem ? (
          <img
            src={preloadedIcons.TotalRedeem}
            alt="Total Redeem"
            style={{ marginRight: "4px" }}
            loading="lazy"
          />
        ) : null,
      },
      {
        id: 5,
        name: "Pending Recharges",
        value: data[0].totalPendingRechargeAmount,
        bgColor: "#FEFCE8",
        borderColor: "#FFE787",
        color: "#C48400",
        icon: preloadedIcons.PendingRecharge ? (
          <img
            src={preloadedIcons.PendingRecharge}
            alt="Total Recharge"
            style={{ marginRight: "4px" }}
            loading="lazy"
          />
        ) : null,
      },
      {
        id: 6,
        name: "Failed Redeems",
        value: data[0].totalFailRedeemAmount,
        bgColor: "#FEF2F2",
        borderColor: "#FF9C9C",
        color: "#DC2626",
        icon: preloadedIcons.FailedRedeem ? (
          <img
            src={preloadedIcons.FailedRedeem}
            alt="Fail Redeem"
            style={{ marginRight: "4px" }}
            loading="lazy"
          />
        ) : null,
      },
    ];

    // Add Super-User specific items
    if (role === "Super-User") {
      finalData.push(
        {
          id: 7,
          name: "Total Cashout Redeems Successful",
          value: data[0].totalCashoutRedeemsSuccess,
          bgColor: "#EBFFF1",
          borderColor: "#9CFFBD",
          color: "#1AA24D",
          icon: preloadedIcons.TotalCashoutRedeemSuccessfull ? (
            <img
              src={preloadedIcons.TotalCashoutRedeemSuccessfull}
              alt="Total Cashout Redeem Successfull"
              style={{ marginRight: "4px" }}
              loading="lazy"
            />
          ) : null,
        },
        {
          id: 8,
          name: "Total Cashout Redeems Pending",
          value: data[0].totalCashoutRedeemsInProgress,
          bgColor: "#FFF7ED",
          borderColor: "#EEFF9C",
          color: "#EA580C",
          icon: preloadedIcons.TotalCashoutRedeemPending ? (
            <img
              src={preloadedIcons.TotalCashoutRedeemPending}
              alt="Total Cashout Redeem Pending"
              style={{ marginRight: "4px" }}
              loading="lazy"
            />
          ) : null,
        },
        {
          id: 11,
          name: "Total Fees Charged",
          value: data[0].totalFeesCharged,
          bgColor: "#EEF2FF",
          borderColor: "#F79CFF",
          color: "#4F46E5",
          icon: preloadedIcons.TotalFeesCharged ? (
            <img
              src={preloadedIcons.TotalFeesCharged}
              alt="Total Fees Charged"
              style={{ marginRight: "4px" }}
              loading="lazy"
            />
          ) : null,
        },
        {
          id: 9,
          name: "Total Wallet Balance",
          value: data[0].totalWalletBalance || 0,
          bgColor: "#F0FDFA",
          borderColor: "#FFC79C",
          color: "#0D9488",
          icon: preloadedIcons.TotalWalletBalance ? (
            <img
              src={preloadedIcons.TotalWalletBalance}
              alt="Total Wallet Balance"
              style={{ marginRight: "4px" }}
              loading="lazy"
            />
          ) : null,
        }
      );
    }

    // Remove Total Agent for Agent role
    if (role === "Agent") {
      const agentIndex = finalData.findIndex((item) => item.id === 2);
      if (agentIndex !== -1) {
        finalData.splice(agentIndex, 1);
      }
    }

    return [...finalData, ...rechargeItems];
  }, [data, role, rechargeItems]);

  // Return early for loading states to improve rendering performance - AFTER all hooks were called
  if (!shouldFetch) return <DateSelectionPrompt />;
  if (isLoading || !data) return <LoadingPlaceholder />;

  // Return null for empty data to avoid rendering
  if (!summaryData.length) return null;

  return (
    <Grid container spacing={{ xs: 1, sm: 2 }} mt={{ xs: 1, sm: 2 }}>
      {/* First Row: 4 boxes */}
      {summaryData.slice(0, 4).map((item) => (
        <Grid item xs={12} sm={6} md={3} key={item?.id}>
          <SummaryCard item={item} />
        </Grid>
      ))}

      {/* Second Row: 3 boxes */}
      {summaryData.slice(4, 7).map((item) => (
        <Grid item xs={12} sm={6} md={4} key={item?.id}>
          <SummaryCard item={item} />
        </Grid>
      ))}

      {/* Third Row: 3 boxes */}
      {summaryData.slice(7, 10).map((item) => (
        <Grid item xs={12} sm={6} md={4} key={item?.id}>
          <SummaryCard item={item} />
        </Grid>
      ))}

      {/* Last Row: 1 box (if any) */}
      {summaryData.slice(10, 11).map((item) => (
        <Grid item xs={12} key={item?.id}>
          <Card
            sx={{
              backgroundColor: item?.bgColor,
              // border: 2,
              // borderColor: item?.borderColor,
              borderRadius: "4px",
              boxShadow: 0,
              px: { xs: 1, sm: 2 },
            }}
          >
            <CardContent
              sx={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                padding: "16px",
                flexDirection: { xs: "column", sm: "row" },
                gap: { xs: 2, sm: 0 },
              }}
            >
              <Box
                display="flex"
                alignItems={{ sm: "flex-start" }}
                flexDirection="column"
              >
                <Typography
                  variant="subtitle1"
                  display={{ sm: "flex" }}
                  alignItems="center"
                  sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
                >
                  {item?.icon} {item?.name}
                </Typography>
                <Typography
                  variant="h4"
                  sx={{
                    mt: 2, // Small margin to separate from the name
                    fontWeight: 400, // Bold to match the image
                    fontSize: "32px", // Large font size
                    lineHeight: "100%",
                    letterSpacing: "0%",
                    color: item?.color || "inherit",
                  }}
                >
                  {item?.value} {/* e.g., 9346 */}
                </Typography>
              </Box>

              {/* Right Section: Filter Dropdown */}
              {item.filter && (
                <Box sx={{ minWidth: 320 }}>
                  {item.filter} {/* e.g., the Select component */}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
});

const formatDateForExcel = (date) => {
  if (!date) return date;

  const validDate = new Date(date);
  return !isNaN(validDate.getTime()) ? validDate.toISOString() : date;
};

const prepareTableData = (data, type, isRedeem = false) => {
  const key = isRedeem ? "totalRedeemByTypeData" : "totalRechargeByTypeData";
  return (
    data?.[0]?.[key]?.[type]?.map((item) => ({
      transactionId: item.transactionId,
      amount: item.amount,
      transactionDate: isRedeem
        ? new Date(item.transactionDate).toLocaleString()
        : formatDateForExcel(item.transactionDate),
      status: item.status,
      paymentType: item.paymentType,
      redeemServiceFee: isRedeem ? item.redeemServiceFee || 0 : undefined,
      stripeId: isRedeem ? undefined : item.transactionIdFromStripe,
      agentName: item.agentName,
      userName: item.userName,
      referralLink: item?.referralLink,
      useWallet:item?.useWallet
    })) || []
  );
};

export const DataSummary = React.memo(() => {
  const { identity } = useGetIdentity();
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    tempStartDate: null,
    tempEndDate: null,
    selectedUser: null,
    selectedUsertemp: null,
  });
  const inputRef = useRef(null);
  const [selectedExportOption, setSelectedExportOption] = useState("");
  const [choices, setChoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportMonth, setExportMonth] = useState(null);
  const [formResetKey, setFormResetKey] = useState(0);
  const role = localStorage.getItem("role");
  const perPage = 10;
  const today = new Date().toISOString().split("T")[0];
  const startDateLimit = "2024-12-01";

  // Memoized fetchUsers function
  const fetchUsers = useCallback(
    async (search = "", pageNum = 1) => {
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
            : { $or: [{ userReferralCode: "" }, { userReferralCode: null }] },
        });

        const formattedData = data
          ?.map(
            (item) =>
              item?.id !== identity?.objectId && {
                ...item,
                optionName: `${item.username} (${item.roleName})`,
              }
          )
          .filter(Boolean);

        setChoices(formattedData);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    },
    [identity?.objectId]
  );

  // Debounced fetchUsers
  const debouncedFetchUsers = useMemo(
    () => debounce(fetchUsers, 500),
    [fetchUsers]
  );

  // Initial fetch
  useEffect(() => {
    fetchUsers();
    return () => debouncedFetchUsers.cancel(); // Cleanup debounce
  }, [fetchUsers, debouncedFetchUsers]);

  // Load and export data
  const loadAndExportData = useCallback(async () => {
    let {
      tempStartDate: startDate,
      tempEndDate: endDate,
      selectedUser,
    } = filters;

    if (exportMonth) {
      const [year, month] = exportMonth.split("-");
      startDate = `${year}-${month}-01`;
      const lastDay = new Date(year, parseInt(month), 0).getDate();
      endDate = `${year}-${month}-${lastDay}`;
    }

    const filterParams = {
      startDate,
      endDate,
      username: selectedUser?.username,
    };

    setIsExporting(true);
    try {
      const { data } = await dataProvider.getList("summaryExport", {
        pagination: { page: 1, perPage: 1000 },
        sort: { field: "transactionDate", order: "DESC" },
        filter: filterParams,
      });
      return data;
    } catch (error) {
      console.error("Error fetching data:", error);
      return null;
    } finally {
      setIsExporting(false);
    }
  }, [filters, exportMonth]);

  const getMode = (data) => {
    console.log(data,"dataa")
    return data?.stripeId?.toLowerCase().includes("txn")
      ? "WERT"
      : data?.stripeId?.toLowerCase().includes("crypto.link.com")
      ? "Link"
      : data?.stripeId?.toLowerCase().includes("pay.coinbase.com")
      ? "CoinBase"
      : data?.stripeId?.toLowerCase().includes("aog")
      ? "AOG"
      : data?.stripeId?.toLowerCase().includes("or-")
      ? "TransFi"
      : data?.paymentType
      ? "Wallet"
      : "Stripe";
  };  
  // Generic export function
  const exportData = useCallback(
    async (type, format, isRedeem = false) => {
      const data = await loadAndExportData();
      if (!data) return;

      const title = isRedeem ? "Total Redeem Data" : "Total Recharge Data";
      const fileName = isRedeem ? "TotalRedeemData" : "TotalRechargeData";
      if (format === "pdf") {
        const doc = new jsPDF();
        doc.text(title, 10, 10);

        const walletData = prepareTableData(data, "wallet", isRedeem);
        const othersData = prepareTableData(data, "others", isRedeem);

        const headers = isRedeem
          ? [
              "Amount",
              "Transaction Date",
              "Status",
              "Redeem Service Fee",
              "Agent Name",
              "User Name",
            ]
          : [
              "ID",
              "Amount",
              "Transaction Date",
              "Status",
              "Stripe ID",
              "Payment Type",
              "Agent Name",
              "User Name",
            ];

        doc.text(
          isRedeem ? "Redeem Transactions" : "Wallet Transactions",
          10,
          20
        );
        doc.autoTable({
          head: [headers],
          body: walletData.map((item) =>
            isRedeem
              ? [
                  item.amount,
                  item.transactionDate,
                  item.status,
                  item.redeemServiceFee,
                  item.agentName,
                  item.userName,
                ]
              : [
                  item.transactionId,
                  item.amount,
                  item.transactionDate,
                  item.status,
                  item.stripeId,
                  item.paymentType,
                  item.agentName,
                  item.userName,
                ]
          ),
          startY: 25,
          columnStyles: { 4: { cellWidth: 50 } },
          styles: { overflow: "linebreak", fontSize: 10 },
        });

        doc.text(
          isRedeem ? "Cashout Transactions" : "Others Transactions",
          10,
          doc.lastAutoTable.finalY + 10
        );
        doc.autoTable({
          head: [headers],
          body: othersData.map((item) =>
            isRedeem
              ? [
                  item.amount,
                  item.transactionDate,
                  item.status,
                  item.redeemServiceFee,
                  item.agentName,
                  item.userName,
                ]
              : [
                  item.transactionId,
                  item.amount,
                  item.transactionDate,
                  item.status,
                  item.stripeId,
                  item.paymentType,
                  item.agentName,
                  item.userName,
                ]
          ),
          startY: doc.lastAutoTable.finalY + 15,
          columnStyles: { 4: { cellWidth: 50 } },
          styles: { overflow: "linebreak", fontSize: 10 },
        });

        doc.save(`${fileName}.pdf`);
      } else if (format === "xlsx") {
        const combinedData = [
          ...prepareTableData(data, "wallet", isRedeem),
          ...prepareTableData(data, "others", isRedeem),
        ].map((item) => ({
          "Transaction ID": item.transactionId,
          Amount: item.amount,
          "Transaction Date": item.transactionDate,
          Status: item.status,
          ...(isRedeem
            ? { "Redeem Service Fee": item.redeemServiceFee }
            : { "Stripe Transaction ID": item.stripeId }),
          "Payment Type": item.paymentType,
          "Agent Name": item.agentName,
          "User Name": item.userName,
          Mode: getMode(item), // ✅ Added Mode here
        }));

        const worksheet = XLSX.utils.json_to_sheet(combinedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, title);
        const xlsData = XLSX.write(workbook, {
          bookType: "xlsx",
          type: "array",
        });
        saveAs(
          new Blob([xlsData], { type: "application/octet-stream" }),
          `${fileName}.xlsx`
        );
      }
    },
    [loadAndExportData]
  );

  // Handle filter submission
  const handleFilterSubmit = useCallback(() => {
    setFilters((prev) => ({
      ...prev,
      startDate: prev.tempStartDate,
      endDate: prev.tempEndDate,
      selectedUser: prev.selectedUsertemp,
    }));
  }, []);

  // Memoized data filters
  const dataFilters = useMemo(
    () => [
      <Autocomplete
        key="username"
        label="Username"
        source="username"
        sx={{
          width: { xs: "100%", md: 300 },
          "& .MuiFormLabel-root": {
            position: "relative",
            transform: "none",
            fontSize: "14px",
            fontWeight: 600,
            marginBottom: "4px",
          },
          "& .MuiInputLabel-shrink": { transform: "none" },
          "& .MuiOutlinedInput-root": {
            borderRadius: "4px",
            "& fieldset": { borderColor: "#CFD4DB" },
            "&:hover fieldset": { borderColor: "#CFD4DB" },
            "&.Mui-focused fieldset": { borderColor: "#CFD4DB" },
          },
        }}
        options={choices}
        getOptionLabel={(option) => option.optionName}
        isOptionEqualToValue={(option, value) => option.id === value?.id}
        loading={loading}
        loadingText="....Loading"
        value={filters.selectedUsertemp}
        onChange={(event, newValue) =>
          setFilters((prev) => ({ ...prev, selectedUsertemp: newValue }))
        }
        onInputChange={(event, newInputValue, reason) => {
          if (reason === "input") {
            debouncedFetchUsers(newInputValue, 1);
            setFilters((prev) => ({ ...prev, selectedUsertemp: null }));
          }
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="Search username"
            variant="outlined"
            InputLabelProps={{
              shrink: true,
              style: {
                position: "relative",
                transform: "none",
                marginBottom: "4px",
              },
            }}
            label="Username"
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? <CircularProgress size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
              sx: { "& fieldset": { borderColor: "#CFD4DB" } },
            }}
          />
        )}
        alwaysOn
        resettable
      />,
      <DateInput
        key="startdate"
        label="Start Date"
        source="startdate"
        sx={{
          width: { xs: "100%", md: "auto" },
          "& .MuiFormLabel-root": {
            position: "relative",
            transform: "none",
            fontSize: "14px",
            fontWeight: 600,
            marginBottom: "4px",
          },
          "& .MuiInputLabel-shrink": { transform: "none" },
          "& .MuiOutlinedInput-root": {
            borderRadius: "4px",
            "& fieldset": { borderColor: "#CFD4DB" },
            "&:hover fieldset": { borderColor: "#CFD4DB" },
            "&.Mui-focused fieldset": { borderColor: "#CFD4DB" },
          },
        }}
        alwaysOn
        resettable
        InputLabelProps={{
          shrink: true,
          style: {
            position: "relative",
            transform: "none",
            marginBottom: "4px",
          },
        }}
        InputProps={{
          inputProps: {
            min: startDateLimit,
            max: filters.tempEndDate || today,
          },
          value: filters.tempStartDate,
        }}
        onChange={(event) =>
          setFilters((prev) => ({ ...prev, tempStartDate: event.target.value }))
        }
      />,
      <DateInput
        key="enddate"
        label="End Date"
        source="enddate"
        sx={{
          width: { xs: "100%", md: "auto" },
          "& .MuiFormLabel-root": {
            position: "relative",
            transform: "none",
            fontSize: "14px",
            fontWeight: 600,
            marginBottom: "4px",
          },
          "& .MuiInputLabel-shrink": { transform: "none" },
          "& .MuiOutlinedInput-root": {
            borderRadius: "4px",
            "& fieldset": { borderColor: "#CFD4DB" },
            "&:hover fieldset": { borderColor: "#CFD4DB" },
            "&.Mui-focused fieldset": { borderColor: "#CFD4DB" },
          },
        }}
        alwaysOn
        resettable
        InputLabelProps={{
          shrink: true,
          style: {
            position: "relative",
            transform: "none",
            marginBottom: "4px",
          },
        }}
        InputProps={{
          inputProps: {
            min: filters.tempStartDate || startDateLimit,
            max: today,
          },
          value: filters.tempEndDate,
        }}
        onChange={(event) =>
          setFilters((prev) => ({ ...prev, tempEndDate: event.target.value }))
        }
      />,
    ],
    [choices, loading, filters, debouncedFetchUsers, today, startDateLimit]
  );

  return (
    <>
      {(role === "Master-Agent" || role === "Agent") && <EmergencyNotices />}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mt: "8px",
          px: { xs: 1, sm: 2 },
        }}
      >
        <Typography
          sx={{
            fontSize: "24px",
            fontWeight: 400,
            color: "var(--primary-color)",
          }}
        >
          Summary
        </Typography>
      </Box>
      <ListBase
        resource="users"
        filter={{ username: filters.selectedUser?.id }}
      >
        <Box sx={{ px: { xs: 1, sm: 2 } }}>
          <Box
            display="flex"
            flexDirection={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", sm: "end" }}
            gap={{ xs: 1, md: 2 }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                alignItems: { xs: "stretch", sm: "end" },
              }}
            >
              <FilterForm
                filters={dataFilters}
                key={`filter-reset-${formResetKey}`}
                sx={{
                  padding: "0 !important",
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  alignItems: { xs: "stretch", sm: "flex-start" },
                }}
              />
              <Button
                source="date"
                variant="contained"
                onClick={handleFilterSubmit}
                sx={{
                  mt: 1,
                  height: "40px",
                  width: "127px",
                  whiteSpace: "nowrap",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "16px",
                    fontWeight: 500,
                    color: "var(--white-color)",
                    textTransform: "none",
                    fontFamily: "Inter",
                  }}
                >
                  Apply Filter
                </Typography>
              </Button>
            </Box>
            {role === "Super-User" && (
              <Box
                display="flex"
                flexDirection={{ xs: "column", sm: "row" }}
                gap={1}
                mt={1}
              >
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<img src={downloadDark} alt="Export" />}
                  onClick={() => setExportDialogOpen(true)}
                  sx={{
                    width: { xs: "100%", md: "auto" },
                    whiteSpace: "nowrap",
                    height: "40px",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "16px",
                      fontWeight: 500,
                      color: "var(--white-color)",
                      textTransform: "none",
                      fontFamily: "Inter",
                    }}
                  >
                    Export
                  </Typography>
                </Button>
              </Box>
            )}
          </Box>
        </Box>
        <Summary
          selectedUser={filters.selectedUser}
          startDate={filters.startDate}
          endDate={filters.endDate}
        />
      </ListBase>
      <Dialog
        open={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: "bold", textAlign: "center" }}>
          Select Month to Export
        </DialogTitle>

        <DialogContent>
          <MonthPickerField
            label="Month"
            type="month"
            value={exportMonth}
            inputRef={inputRef}
            onChange={(e) => setExportMonth(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
            sx={{
              mb: 2,
              mt: 1,
              "& input::-webkit-calendar-picker-indicator": {
                display: "none",
                WebkitAppearance: "none",
              },
              "& input": {
                paddingRight: "36px",
              },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <img
                    src={calendarIcon}
                    alt="calendar"
                    style={{ width: 20, height: 20, cursor: "pointer" }}
                    onClick={() => inputRef.current?.showPicker?.()}
                  />
                </InputAdornment>
              ),
            }}
          />

          {/* Radio group styled like checkboxes */}
          <Box sx={{ pl: 1 }}>
            <FormControl component="fieldset">
              <RadioGroup
                value={selectedExportOption}
                onChange={(e) => setSelectedExportOption(e.target.value)}
              >
                <FormControlLabel
                  value="recharge-xlsx"
                  control={<Radio />}
                  label=".xls Recharge Export"
                />
                <FormControlLabel
                  value="recharge-pdf"
                  control={<Radio />}
                  label=".pdf Recharge Export"
                />
                <FormControlLabel
                  value="redeem-xlsx"
                  control={<Radio />}
                  label=".xls Redeem Export"
                />
                <FormControlLabel
                  value="redeem-pdf"
                  control={<Radio />}
                  label=".pdf Redeem Export"
                />
              </RadioGroup>
            </FormControl>
          </Box>

          {isExporting && (
            <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
              <CircularProgress size={24} sx={{ mr: 2 }} />
              <Typography variant="body2">Exporting...</Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ justifyContent: "space-between", px: 3, pb: 2 }}>
          <Button
            variant="outlined"
            onClick={() => setExportDialogOpen(false)}
            disabled={isExporting}
            fullWidth
            sx={{ mr: 1 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              const [type, format] = selectedExportOption?.split("-") || [];
              if (type && format) exportData(type, format, type === "redeem");
            }}
            disabled={!exportMonth || !selectedExportOption || isExporting}
            fullWidth
            sx={{ ml: 1 }}
          >
            Export
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
});
