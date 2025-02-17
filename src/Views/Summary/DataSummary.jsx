import React, { useRef, useState } from "react";
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
  TextField,
  SimpleShowLayout,
  useListContext,
  ListBase,
  FilterForm,
  minValue,
  maxValue,
} from "react-admin";
import { Loader, KPILoader } from "../Loader";

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

const Summary = () => {
  const { data, isFetching, isLoading } = useListContext();
  const { identity } = useGetIdentity();
  const role = localStorage.getItem("role");
  const [selectedRechargeType, setSelectedRechargeType] = useState("all"); // State for recharge type selection

  if (isLoading || !data) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
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
    ...(role === "Super-User"
      ? [
          {
            id: 3,
            name: "Total Recharge (Filtered)",
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
                <span>{filteredRechargeValue}</span>
              </div>
            ),
            bgColor: "#EBF9F0",
            borderColor: "#9CDAB8",
            icon: <PaidIcon color="secondary" />,
            filter: (
              <FormControl fullWidth>
                <Select
                  labelId="recharge-type-select-label"
                  value={selectedRechargeType}
                  onChange={(e) => setSelectedRechargeType(e.target.value)}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="wallet">Wallet</MenuItem>
                  <MenuItem value="others">Others</MenuItem>
                </Select>
              </FormControl>
            ),
          },
        ]
      : []),
    ...(role === "Agent"
      ? [
          {
            id: 3,
            name: "Total Recharge (Filtered)",
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
                <span>{filteredRechargeValue}</span>
              </div>
            ),
            bgColor: "#EBF9F0",
            borderColor: "#9CDAB8",
            icon: <PaidIcon color="secondary" />,
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
    ...(role === "Agent"
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
        ]
      : []),
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
    <>
      <Grid container spacing={2} mt>
        {finalData?.map((item) => (
          <Grid item xs={12} md={4} key={item?.id}>
            <Card
              sx={{
                backgroundColor: item?.bgColor,
                border: 2,
                borderColor: item?.borderColor,
                borderRadius: 0,
                boxShadow: 0,
              }}
            >
              <CardContent>
                <Typography
                  variant="subtitle1"
                  display="flex"
                  alignItems="center"
                >
                  {item?.icon}
                  &nbsp;{item?.name}
                </Typography>
                <Typography variant="h4" sx={{ mt: 1, fontWeight: "bold" }}>
                  {item?.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
        {recharge.map((item) => (
          <Grid item xs={12} md={4} key={item.id}>
            <Card
              sx={{
                backgroundColor: item.bgColor,
                border: 2,
                borderColor: item.borderColor,
                borderRadius: 0,
                boxShadow: 0,
              }}
            >
              <CardContent>
                <Typography
                  variant="subtitle1"
                  display="flex"
                  alignItems="center"
                >
                  {item.icon}
                  &nbsp;{item.name}
                </Typography>
                {item.filter && <Box sx={{ mt: 2 }}>{item.filter}</Box>}
                <Typography
                  variant="h4"
                  sx={{ mt: 2, fontWeight: "bold", textAlign: "center" }}
                >
                  {item.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </>
  );
};

export const DataSummary = () => {
  const role = localStorage.getItem("role");
  const { identity } = useGetIdentity();
  const { data, isFetching, isLoading } = useGetList(
    "users",
    {
      pagination: { page: 1, perPage: 10000 },
      sort: { field: "roleName", order: "ASC" },
      // filter: { userReferralCode: "" },
      // filter: {
      //   //$or: [{ userReferralCode: "" }, { userReferralCode: null }],
      // },
    },
    {
      refetchOnWindowFocus: false, // Prevent refetch on focus
      refetchOnReconnect: false,
    }
  );
  const [menuAnchor, setMenuAnchor] = React.useState(null);
  const [menuAnchorRedeem, setMenuAnchorRedeem] = React.useState(null);
  const [isExporting, setIsExporting] = useState(false); // Track export progress
  const [exportdData, setExportData] = useState(null); // Store export data
  const [loadingData, setLoadingData] = useState(false); // Loading state for data fetch

  const newData = data?.map(
    (item) =>
      item?.id !== identity?.objectId && {
        ...item,
        optionName: "".concat(item.name, " (", item.roleName, ")"),
      }
  );

  const loadAndExportData = async () => {
    const filters = {
      startdate: document.querySelector('input[name="startdate"]')?.value || null,
      enddate: document.querySelector('input[name="enddate"]')?.value || null,
    };
    setIsExporting(true); // Set exporting state
    setLoadingData(true); // Set loading data state

    try {
      const { data } = await dataProvider.getList("summaryExport", {
        pagination: { page: 1, perPage: 1000 },
        sort: { field: "transactionDate", order: "DESC" },
        filter: {...filters},
      }); // Call the service to fetch export data
      console.log(data,"datafrijijrijee")
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
        item.transactionId,
        item.amount,
        new Date(item.transactionDate).toLocaleString(),
        item.status,
        item.transactionIdFromStripe,
        item.redeemServiceFee,
        item?.agentName,
        item?.userName,
      ]
    );

    // Prepare others data for PDF
    const othersTableData = exportData[0]?.totalRedeemByTypeData?.others?.map(
      (item, index) => [
        item.transactionId,
        item.amount,
        new Date(item.transactionDate).toLocaleString(),
        item.status,
        item.transactionIdFromStripe,
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
          "ID",
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
          "ID",
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
    const exportData =await loadAndExportData(); // Use existing data or fetch if null

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
    const exportData =await loadAndExportData(); // Use existing data or fetch if null

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
      "type": item?.type,
      Amount: item.transactionAmount,
      "Transaction Date": formatDateForExcel(item.transactionDate),
      Status: item.status,
      "Stripe Transaction ID": item.transactionIdFromStripe,
      "Redeem Service Fee": item.redeemServiceFee,
      "Agent Name": item?.agentName,
      "User Name": item?.username,
      "isCashout": item?.isCashOut,
      "paymentMode": item?.paymentMode,
      "paymentMethodType": item?.paymentMethodType,
      "remark": item?.remark,
      "Redeem Remark": item?.redeemRemarks,
    }));

    // Create worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(combinedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "All Data");

    // Write Excel file
    const xlsData = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([xlsData], { type: "application/octet-stream" }), "AllData.xlsx");
  };
  // Function to map wallet data for export
const mapWalletDataForExport = (walletData) => {
  return walletData.map((item) => ({
    "Wallet ID": item.id,                      // Wallet record ID
    "User ID": item.userID,                    // User ID associated with wallet
    "Agent Name": item?.agentName,             // Assuming agentName is available
    "User Name": item?.username,               // Assuming username is available
    "Balance": item?.balance,                  // Wallet balance
    "Zelle ID": item?.zelleId,                 // Zelle ID from wallet
    "Paypal ID": item?.paypalId,               // Paypal ID from wallet
    "Venmo ID": item?.venmoId,                 // Venmo ID from wallet
    "CashApp ID": item?.cashAppId,             // CashApp ID from wallet
    "Date": item?.createdAt
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
  saveAs(new Blob([xlsData], { type: "application/octet-stream" }), "WalletData.xlsx");
};

  const today = new Date().toISOString().split("T")[0]; // Format as YYYY-MM-DD
  const startDateLimit = "2024-12-01"; // Start date limit: 1st December 2025

  const dataFilters = [
    <AutocompleteInput
      label="User"
      source="username"
      choices={newData}
      optionText="optionName"
      optionValue="id"
      alwaysOn
      resettable
      emptyText="All"
    />,
    <DateInput
      label="Start date"
      source="startdate"
      alwaysOn
      resettable
      // validate={maxValue(currentDate)}
      InputProps={{
        inputProps: {
          min: startDateLimit, // Minimum allowed date
          max: today, // Maximum allowed date
        },
      }}
    />,
    <DateInput
      label="End date"
      source="enddate"
      alwaysOn
      resettable
      // validate={maxValue(currentDate)}
      InputProps={{
        inputProps: {
          min: startDateLimit, // Minimum allowed date
          max: today, // Maximum allowed date
        },
      }}
    />,

    // <SearchSelectUsersFilter />,
  ];

  return (
    <React.Fragment>
      {isLoading || !data ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="50vh"
        >
          <Loading />
        </Box>
      ) : (
        <>
         
          <ListBase>
            <FilterForm
              filters={dataFilters}
              sx={{
                flex: "0 2 auto !important",
                padding: "0px 0px 0px 0px !important",
                alignItems: "flex-start",
              }}
            /> {role === "Super-User" && (
              <Box
                display="flex"
                justifyContent="flex-end"
                sx={{ mb: 2, marginTop: "-40px" }}
              >
                <Button
                  variant="contained"
                  startIcon={<GetAppIcon />}
                  onClick={handleMenuRedeemOpen}
                  style={{ marginRight: "10px" }}
                >
                  Redeem Data Export
                </Button>
                <Button
                  variant="contained"
                  startIcon={<GetAppIcon />}
                  onClick={handleMenuOpen}
                >
                  Recharge Data Export
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

            {isFetching ? (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="50vh"
              >
                <Loading />
              </Box>
            ) : (
              <Summary />
            )}
          </ListBase>
        </>
      )}
    </React.Fragment>
  );
};
