import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  useGetIdentity,
  useGetList,
  Loading,
  SearchInput,
  List,
  TextInput,
  SelectInput,
  AutocompleteInput,
  DateInput,
  SimpleForm,
  SimpleShowLayout,
  useListContext,
  ListBase,
  FilterForm,
  minValue,
  maxValue,
} from "react-admin";
import { Loader, KPILoader } from "../Loader";
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
  InputLabel,
  Select,
  MenuItem,
  Button,
  Menu,
  ListItemIcon,
} from "@mui/material";
// mui icons
import PersonIcon from "@mui/icons-material/Person";
import PaidIcon from "@mui/icons-material/Paid";
import ErrorIcon from "@mui/icons-material/Error";
import WarningIcon from "@mui/icons-material/Warning";
import { Label } from "reactstrap";
import AOGSymbol from "../../Assets/icons/AOGsymbol.png";
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

const Summary = ({ selectedUser, startDate, endDate }) => {
  const shouldFetch = startDate && endDate;
  const { data, isLoading } = useGetList(
    "summary",
    shouldFetch
      ? { filter: { username: selectedUser?.id, startDate, endDate } }
      : { enabled: false } // Disable the request if dates are missing
  );
  const { identity } = useGetIdentity();
  const role = localStorage.getItem("role");
  const [selectedRechargeType, setSelectedRechargeType] = useState("all"); // State for recharge type selection

  if (!shouldFetch) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight={{ xs: "40vh", md: "50vh" }}
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
              <EventIcon
                color="primary"
                sx={{ fontSize: { xs: 30, sm: 40 } }}
              />
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
    );
  }
  if (isLoading || !data) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight={{ xs: "40vh", md: "50vh" }}
      >
        <Loading />
      </Box>
    );
  }

  // if (isPending) {
  //   return <Loader />;
  // }

  const filteredRechargeValue =
    selectedRechargeType === "wallet"
      ? data[0].totalRechargeByType?.wallet || 0
      : selectedRechargeType === "others"
      ? data[0].totalRechargeByType?.others || 0
      : (data[0].totalRechargeByType?.wallet || 0) +
        (data[0].totalRechargeByType?.others || 0);
  const recharge = [
    ...(role === "Super-User" || role === "Agent"
      ? [
          {
            id: 3,
            name: "Total Recharge (Filtered)",
            value: (
              <Box
                display="flex"
                alignItems="center"
                justifyContent="flex-start"
              >
                <img
                  src={AOGSymbol}
                  alt="AOG Symbol"
                  style={{ width: "20px", height: "20px", marginRight: "8px" }}
                />
                <span>{filteredRechargeValue}</span>
              </Box>
            ),
            bgColor: "#EBF9F0",
            borderColor: "#9CDAB8",
            icon: <PaidIcon color="secondary" />,
            filter:
              role === "Super-User" ? (
                <FormControl fullWidth>
                  <Select
                    value={selectedRechargeType}
                    onChange={(e) => setSelectedRechargeType(e.target.value)}
                    sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
                  >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="wallet">Wallet</MenuItem>
                    <MenuItem value="others">Others</MenuItem>
                  </Select>
                </FormControl>
              ) : null,
          },
        ]
      : []),
  ];
  const finalData = [
    {
      id: 1,
      name: "Total User",
      value: data[0].totalRegisteredUsers,
      bgColor: "#E3F2FD",
      borderColor: "#7EB9FB",
      icon: <PersonIcon color="primary" />,
    },
    {
      id: 2,
      name: "Total Agent",
      value: data[0].totalAgents,
      bgColor: "#dedede",
      borderColor: "#adb5bd",
      icon: <PersonIcon color="info" />,
    },
    {
      id: 3,
      name: "Total Recharges",
      value: (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
          }}
        >
          <img
            src={AOGSymbol}
            alt="AOG Symbol"
            style={{ width: "20px", height: "20px", marginRight: "8px" }}
          />
          <span>{data[0].totalRechargeAmount}</span>
        </div>
      ),
      bgColor: "#EBF9F0",
      borderColor: "#9CDAB8",
      icon: <PaidIcon color="success" />,
    },
    {
      id: 4,
      name: "Total Redeems",
      value: (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
          }}
        >
          <img
            src={AOGSymbol}
            alt="AOG Symbol"
            style={{ width: "20px", height: "20px", marginRight: "8px" }}
          />
          <span>{data[0].totalRedeemAmount}</span>
        </div>
      ),
      bgColor: "#F4F0F9",
      borderColor: "#C4B0DF",
      icon: <PaidIcon color="secondary" />,
    },
    {
      id: 5,
      name: "Pending Recharges",
      value: (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
          }}
        >
          <img
            src={AOGSymbol}
            alt="AOG Symbol"
            style={{ width: "20px", height: "20px", marginRight: "8px" }}
          />
          <span>{data[0].totalPendingRechargeAmount}</span>
        </div>
      ),
      bgColor: "#FFFCEB",
      borderColor: "#FFE787",
      icon: <WarningIcon color="warning" />,
    },
    {
      id: 6,
      name: "Failed Redeems",
      value: (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
          }}
        >
          <img
            src={AOGSymbol}
            alt="AOG Symbol"
            style={{ width: "20px", height: "20px", marginRight: "8px" }}
          />
          <span>{data[0].totalFailRedeemAmount}</span>
        </div>
      ),
      bgColor: "#FFEBEB",
      borderColor: "#FF9C9C",
      icon: <ErrorIcon color="error" />,
    },
    ...(role === "Super-User"
      ? [
          {
            id: 7,
            name: "Total Cashout Redeems Successful",
            value: (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                }}
              >
                <img
                  src={AOGSymbol}
                  alt="AOG Symbol"
                  style={{ width: "20px", height: "20px", marginRight: "8px" }}
                />
                <span>{data[0].totalCashoutRedeemsSuccess}</span>
              </div>
            ),
            bgColor: "#E3F2FD",
            borderColor: "#7EB9FB",
            icon: <PaidIcon color="primary" />,
          },
          {
            id: 8,
            name: "Total Cashout Redeems Pending",
            value: (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                }}
              >
                <img
                  src={AOGSymbol}
                  alt="AOG Symbol"
                  style={{ width: "20px", height: "20px", marginRight: "8px" }}
                />
                <span>{data[0].totalCashoutRedeemsInProgress}</span>
              </div>
            ),
            bgColor: "#dedede",
            borderColor: "#adb5bd",
            icon: <PaidIcon color="success" />,
          },
          // {
          //   id: 9,
          //   name: "Total Recharge (Wallet)",
          //   value: "$" + data[0].totalRechargeByType?.wallet,
          //   bgColor: "#EBF9F0",
          //   borderColor: "#9CDAB8",
          //   icon: <PaidIcon color="secondary" />,
          // },
          // {
          //   id: 10,
          //   name: "Total Recharge (Others)",
          //   value: "$" + data[0].totalRechargeByType?.others,
          //   bgColor: "#F4F0F9",
          //   borderColor: "#C4B0DF",
          //   icon: <PaidIcon color="warning" />,
          // },
          {
            id: 11,
            name: "Total Fees Charged",
            value: (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                }}
              >
                <img
                  src={AOGSymbol}
                  alt="AOG Symbol"
                  style={{ width: "20px", height: "20px", marginRight: "8px" }}
                />
                <span>{data[0].totalFeesCharged}</span>
              </div>
            ),
            bgColor: "#FFFCEB",
            borderColor: "#FFE787",
            icon: <ErrorIcon color="error" />,
          },
          {
            id: 12,
            name: "Total Wallet Balance",
            value: (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                }}
              >
                <img
                  src={AOGSymbol}
                  alt="AOG Symbol"
                  style={{ width: "20px", height: "20px", marginRight: "8px" }}
                />
                <span>{data[0].totalBalance}</span>
              </div>
            ),
            bgColor: "#FFFCEB",
            borderColor: "#FFE787",
            icon: <ErrorIcon color="error" />,
          },
        ]
      : []),
  ];

  identity.role === "Agent" && finalData.splice(1, 1);

  return (
    <Grid container spacing={{ xs: 1, sm: 2 }} mt={{ xs: 1, sm: 2 }}>
      {finalData?.map((item) => (
        <Grid item xs={12} sm={6} md={4} key={item?.id}>
          <Card
            sx={{
              backgroundColor: item?.bgColor,
              border: 2,
              borderColor: item?.borderColor,
              borderRadius: 0,
              boxShadow: 0,
              px: { xs: 1, sm: 2 },
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
              <Typography
                variant="h4"
                sx={{
                  mt: 1,
                  fontWeight: "bold",
                  fontSize: { xs: "1.5rem", sm: "2rem" },
                }}
              >
                {item?.value}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
      {recharge.map((item) => (
        <Grid item xs={12} sm={6} md={4} key={item.id}>
          <Card
            sx={{
              backgroundColor: item.bgColor,
              border: 2,
              borderColor: item.borderColor,
              borderRadius: 0,
              boxShadow: 0,
              px: { xs: 1, sm: 2 },
            }}
          >
            <CardContent>
              <Typography
                variant="subtitle1"
                display="flex"
                alignItems="center"
                sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
              >
                {item.icon} {item.name}
              </Typography>
              {item.filter && <Box sx={{ mt: 2 }}>{item.filter}</Box>}
              <Typography
                variant="h4"
                sx={{
                  mt: 2,
                  fontWeight: "bold",
                  textAlign: "center",
                  fontSize: { xs: "1.5rem", sm: "2rem" },
                }}
              >
                {item.value}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export const DataSummary = () => {
  const role = localStorage.getItem("role");
  const { identity } = useGetIdentity();
  const [menuAnchor, setMenuAnchor] = React.useState(null);
  const [menuAnchorRedeem, setMenuAnchorRedeem] = React.useState(null);
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
  const handleMenuRedeemOpen = (event) => {
    setMenuAnchorRedeem(event.currentTarget);
  };

  const handleMenuRedeemClose = () => {
    setMenuAnchorRedeem(null);
  };
  const formatDateForExcel = (date) => {
    if (!date) return date; // Keep the original value if it's null or undefined

    const validDate = new Date(date);
    return !isNaN(validDate.getTime()) ? validDate.toISOString() : date; // Keep the original string if it's invalid
  };

  const handleExportRedeemPDF = async () => {
    const exportData = await loadAndExportData(); // Use existing data or fetch if null

    const doc = new jsPDF();

    // Add title
    doc.text("Total Recharge Data", 10, 10);

    // Prepare wallet data for PDF
    const walletTableData = exportData[0]?.totalRedeemByTypeData?.wallet?.map(
      (item, index) => [
        item.amount,
        new Date(item.transactionDate).toLocaleString(),
        item.status,
        item.redeemServiceFee,
        item?.agentName,
        item?.userName,
      ]
    );

    // Prepare others data for PDF
    const othersTableData = exportData[0]?.totalRedeemByTypeData?.others?.map(
      (item, index) => [
        item.amount,
        new Date(item.transactionDate).toLocaleString(),
        item.status,
        item.redeemServiceFee,
        item?.agentName,
        item?.userName,
      ]
    );

    // Add Wallet Transactions
    doc.text("Redeem Transactions", 10, 20);
    doc.autoTable({
      head: [
        [
          "Amount",
          "Transaction Date",
          "Status",
          "Redeem Service Fee",
          "Agent Name",
          "User Name",
        ],
      ],
      body: walletTableData,
      startY: 25,
      columnStyles: {
        4: { cellWidth: 50 }, // Stripe ID column
      },
      styles: {
        overflow: "linebreak", // Ensure long text wraps
        fontSize: 10, // Adjust font size for readability
      },
    });

    // Add Others Transactions
    doc.text("Cashout Transactions", 10, doc.lastAutoTable.finalY + 10);
    doc.autoTable({
      head: [
        [
          "Amount",
          "Transaction Date",
          "Status",
          "Redeem Service Fee",
          "Agent Name",
          "User Name",
        ],
      ],
      body: othersTableData,
      startY: doc.lastAutoTable.finalY + 15,
      columnStyles: {
        4: { cellWidth: 50 }, // Stripe ID column
      },
      styles: {
        overflow: "linebreak", // Ensure long text wraps
        fontSize: 10, // Adjust font size for readability
      },
    });

    // Save PDF
    doc.save("TotalRedeemData.pdf");
  };

  const handleExportRedeemXLS = async () => {
    const exportData = await loadAndExportData(); // Use existing data or fetch if null

    // Combine wallet and others data for Excel
    const combinedData = [
      ...exportData[0]?.totalRedeemByTypeData?.wallet?.map((item) => ({
        "Transaction ID": item.transactionId,
        Amount: item.amount,
        "Transaction Date": formatDateForExcel(item.transactionDate),
        Status: item.status,
        paymentType: item?.paymentType,
        "Redeem Service Fee": item.redeemServiceFee,
        "Agent Name": item?.agentName,
        "User Name": item?.userName,
      })),
      ...exportData[0]?.totalRedeemByTypeData?.others.map((item) => ({
        "Transaction ID": item.transactionId,
        Amount: item.amount,
        "Transaction Date": formatDateForExcel(item.transactionDate),
        Status: item.status,
        paymentType: item?.paymentType,
        "Redeem Service Fee": 0,
        "Agent Name": item?.agentName,
        "User Name": item?.userName,
      })),
    ];

    // Create worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(combinedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Total Recharge Data");

    // Write Excel file
    const xlsData = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([xlsData], { type: "application/octet-stream" }),
      "TotalReedeemData.xlsx"
    );
  };
  const handleExportRechargePDF = async () => {
    const exportData = await loadAndExportData(); // Use existing data or fetch if null

    const doc = new jsPDF();

    // Add title
    doc.text("Total Recharge Data", 10, 10);

    // Prepare wallet data for PDF
    const walletTableData = exportData[0]?.totalRechargeByTypeData?.wallet?.map(
      (item, index) => [
        item.transactionId,
        item.amount,
        new Date(item.transactionDate).toLocaleString(),
        item.status,
        item.transactionIdFromStripe,
        item.paymentType,
        item?.agentName,
        item?.userName,
      ]
    );

    // Prepare others data for PDF
    const othersTableData = exportData[0]?.totalRechargeByTypeData?.others?.map(
      (item, index) => [
        item.transactionId,
        item.amount,
        new Date(item.transactionDate).toLocaleString(),
        item.status,
        item.transactionIdFromStripe,
        item.paymentType,
        item?.agentName,
        item?.userName,
      ]
    );

    // Add Wallet Transactions
    doc.text("Wallet Transactions", 10, 20);
    doc.autoTable({
      head: [
        [
          "ID",
          "Amount",
          "Transaction Date",
          "Status",
          "Stripe ID",
          "Payment Type",
          "Agent Name",
          "User Name",
        ],
      ],
      body: walletTableData,
      startY: 25,
      columnStyles: {
        4: { cellWidth: 50 }, // Stripe ID column
      },
      styles: {
        overflow: "linebreak", // Ensure long text wraps
        fontSize: 10, // Adjust font size for readability
      },
    });

    // Add Others Transactions
    doc.text("Others Transactions", 10, doc.lastAutoTable.finalY + 10);
    doc.autoTable({
      head: [
        [
          "ID",
          "Amount",
          "Transaction Date",
          "Status",
          "Stripe ID",
          "Payment Type",
          "Agent Name",
          "User Name",
        ],
      ],
      body: othersTableData,
      startY: doc.lastAutoTable.finalY + 15,
      columnStyles: {
        4: { cellWidth: 50 }, // Stripe ID column
      },
      styles: {
        overflow: "linebreak", // Ensure long text wraps
        fontSize: 10, // Adjust font size for readability
      },
    });

    // Save PDF
    doc.save("TotalRechargeData.pdf");
  };

  const handleExportRechargeXLS = async () => {
    const exportData = await loadAndExportData(); // Use existing data or fetch if null

    // Combine wallet and others data for Excel
    const combinedData = [
      ...exportData[0]?.totalRechargeByTypeData?.wallet?.map((item) => ({
        "Transaction ID": item.transactionId,
        Amount: item.amount,
        "Transaction Date": formatDateForExcel(item.transactionDate),
        Status: item.status,
        paymentType: item?.paymentType,
        "Stripe Transaction ID": item.transactionIdFromStripe,
        "Payment Type": item.paymentType,
        "Agent Name": item?.agentName,
        "User Name": item?.userName,
      })),
      ...exportData[0]?.totalRechargeByTypeData?.others.map((item) => ({
        "Transaction ID": item.transactionId,
        Amount: item.amount,
        "Transaction Date": formatDateForExcel(item.transactionDate),
        Status: item.status,
        paymentType: item?.paymentType,
        "Stripe Transaction ID": item.transactionIdFromStripe,
        "Payment Type": item.paymentType,
        "Agent Name": item?.agentName,
        "User Name": item?.userName,
      })),
    ];

    // Create worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(combinedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Total Recharge Data");

    // Write Excel file
    const xlsData = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([xlsData], { type: "application/octet-stream" }),
      "TotalRechargeData.xlsx"
    );
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
      "User Name": item?.username,
      isCashout: item?.isCashOut,
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
  // Function to map wallet data for export
  const mapWalletDataForExport = (walletData) => {
    return walletData.map((item) => ({
      "Wallet ID": item.id, // Wallet record ID
      "User ID": item.userID, // User ID associated with wallet
      "Agent Name": item?.agentName, // Assuming agentName is available
      "User Name": item?.username, // Assuming username is available
      Balance: item?.balance, // Wallet balance
      "Zelle ID": item?.zelleId, // Zelle ID from wallet
      "Paypal ID": item?.paypalId, // Paypal ID from wallet
      "Venmo ID": item?.venmoId, // Venmo ID from wallet
      "CashApp ID": item?.cashAppId, // CashApp ID from wallet
      Date: item?.createdAt,
    }));
  };

  // Function to handle the export to XLSX (wallet data only)
  const handleExportWalletDataXLS = async () => {
    const walletData = await loadAndExportData(); // Fetch wallet data (replace with actual function)

    // Map wallet data for export
    const combinedData = mapWalletDataForExport(walletData);

    // Create worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(combinedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Wallet Data");

    // Write Excel file
    const xlsData = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([xlsData], { type: "application/octet-stream" }),
      "WalletData.xlsx"
    );
  };

  const today = new Date().toISOString().split("T")[0]; // Format as YYYY-MM-DD
  const startDateLimit = "2024-12-01"; // Start date limit: 1st December 2025

  const debouncedFetchUsers = useCallback(debounce(fetchUsers, 500), []);
  const dataFilters = [
    <Autocomplete
      source="username"
      sx={{ width: { xs: "100%", md: 300 } }}
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
      sx={{ width: { xs: "100%", md: "auto" } }}
      alwaysOn
      resettable
      // validate={maxValue(currentDate)}
      InputProps={{
        inputProps: {
          min: startDateLimit, // Minimum allowed date
          max: today, // Maximum allowed date
        },
      }}
      onChange={(event) => setTempStartDate(event.target.value)}
    />,
    <DateInput
      label="End date"
      source="enddate"
      sx={{ width: { xs: "100%", md: "auto" } }}
      alwaysOn
      resettable
      // validate={maxValue(currentDate)}
      onChange={(event) => setTempEndDate(event.target.value)}
      InputProps={{
        inputProps: {
          min: startDateLimit, // Minimum allowed date
          max: today, // Maximum allowed date
        },
      }}
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
        <Box display="flex">
          <FilterForm
            filters={dataFilters}
            sx={{
              flex: "0 2 auto !important",
              padding: "0px 0px 0px 0px !important",
              alignItems: "flex-start",
            }}
          />{" "}
          <Box
            display="flex"
            justifyContent="flex-end"
            sx={{ mb: 2, marginTop: "10px" }}
          >
            <Button
              source="date"
              variant="contained"
              onClick={handleFilterSubmit}
              sx={{ mb: 2, marginRight: "10px", whiteSpace: "nowrap" }} // Adds left margin for spacing
            >
              Apply Filter
            </Button>
          </Box>
          {role === "Super-User" && (
            <Box
              display="flex"
              justifyContent="flex-start"
              sx={{ mb: 2, marginTop: "10px" }}
            >
              <Button
                variant="contained"
                startIcon={<GetAppIcon sx={{ fontSize: "16px" }} />}
                onClick={handleMenuRedeemOpen}
                sx={{ mb: 2, marginRight: "10px", whiteSpace: "nowrap" }} // Adds left margin for spacing
              >
                Redeem Export{" "}
              </Button>
              <Button
                variant="contained"
                startIcon={<GetAppIcon sx={{ fontSize: "16px" }} />}
                onClick={handleMenuOpen}
                sx={{ mb: 2, whiteSpace: "nowrap" }}
              >
                Recharge Export
              </Button>
              <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={handleMenuClose}
              >
                <MenuItem
                  onClick={() => {
                    handleExportRechargePDF();
                    // handleMenuClose();
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
                  PDF
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleExportRechargeXLS();
                    //  handleMenuClose();
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

              <Menu
                anchorEl={menuAnchorRedeem}
                open={Boolean(menuAnchorRedeem)}
                onClose={handleMenuRedeemClose}
              >
                <MenuItem
                  onClick={() => {
                    handleExportRedeemPDF();
                    //handleMenuRedeemClose();
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
                  PDF
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleExportRedeemXLS();
                    //  handleMenuRedeemClose();
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
          )}
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
