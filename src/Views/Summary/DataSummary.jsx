import React, { useCallback, useEffect, useState } from "react";
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
import TotalUser from "../../Assets/icons/TotalUser.svg";
import TotalAgent from "../../Assets/icons/TotalAgent.svg";
import TotalRecharge from "../../Assets/icons/TotalRecharge.svg";
import TotalRedeem from "../../Assets/icons/TotalRedeem.svg";
import PendingRecharge from "../../Assets/icons/PendingRecharge.svg";
import FailedRedeem from "../../Assets/icons/FailedRedeem.svg";
import TotalCashoutRedeemSuccessfull from "../../Assets/icons/TotalCashoutRedeemSuccessfull.svg";
import TotalCashoutRedeemPending from "../../Assets/icons/TotalCashoutRedeemPending.svg";
import TotalFeesCharged from "../../Assets/icons/TotalFeesCharged.svg";
import TotalWalletBalance from "../../Assets/icons/TotalWalletBalance.svg";
import TotalRecharge_Filtered from "../../Assets/icons/TotalRecharge_Filtered.svg";
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
    ...(role === "Super-User"
      ? [
          {
            id: 35,
            name: "Total Recharge (Filtered)",
            value: filteredRechargeValue,
            bgColor: "#EBF7FF",
            borderColor: "#FF9C9C",
            color: "#287AB1",
            icon: (
              <img
                src={TotalRecharge_Filtered}
                alt="Total Recharge Filtered"
                style={{ marginRight: "4px" }}
              />
            ),
            filter:
              role === "Super-User" ? (
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
      bgColor: "#EFF6FF",
      borderColor: "#7EB9FB",
      color: "#4556D9",
      icon: (
        <img src={TotalUser} alt="Total User" style={{ marginRight: "4px" }} />
      ),
    },
    {
      id: 2,
      name: "Total Agent",
      value: data[0].totalAgents,
      bgColor: "#FAF5FF",
      borderColor: "#937EFB",
      color: "#4943D9",
      icon: (
        <img
          src={TotalAgent}
          alt="Total Agent"
          style={{ marginRight: "4px" }}
        />
      ),
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
          {/* <img
            src={AOGSymbol}
            alt="AOG Symbol"
            style={{ width: "20px", height: "20px", marginRight: "8px" }}
          /> */}
          <span>{data[0].totalRechargeAmount}</span>
        </div>
      ),
      bgColor: "#EBF9F0",
      borderColor: "#9CDAB8",
      color: "#1AA24D",
      icon: (
        <img
          src={TotalRecharge}
          alt="Total Recharge"
          style={{ marginRight: "4px" }}
        />
      ),
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
          {/* <img
            src={AOGSymbol}
            alt="AOG Symbol"
            style={{ width: "20px", height: "20px", marginRight: "8px" }}
          /> */}
          <span>{data[0].totalRedeemAmount}</span>
        </div>
      ),
      bgColor: "#FEF2F2",
      borderColor: "#C4B0DF",
      color: "#DC2626",
      icon: (
        <img
          src={TotalRedeem}
          alt="Total Redeem"
          style={{ marginRight: "4px" }}
        />
      ),
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
          {/* <img
            src={AOGSymbol}
            alt="AOG Symbol"
            style={{ width: "20px", height: "20px", marginRight: "8px" }}
          /> */}
          <span>{data[0].totalPendingRechargeAmount}</span>
        </div>
      ),
      bgColor: "#FEFCE8",
      borderColor: "#FFE787",
      color: "#C48400",
      icon: (
        <img
          src={PendingRecharge}
          alt="Total Recharge"
          style={{ marginRight: "4px" }}
        />
      ),
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
          {/* <img
            src={AOGSymbol}
            alt="AOG Symbol"
            style={{ width: "20px", height: "20px", marginRight: "8px" }}
          /> */}
          <span>{data[0].totalFailRedeemAmount}</span>
        </div>
      ),
      bgColor: "#FEF2F2",
      borderColor: "#FF9C9C",
      color: "#DC2626",
      icon: (
        <img
          src={FailedRedeem}
          alt="Fail Redeem"
          style={{ marginRight: "4px" }}
        />
      ),
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
                {/* <img
                  src={AOGSymbol}
                  alt="AOG Symbol"
                  style={{ width: "20px", height: "20px", marginRight: "8px" }}
                /> */}
                <span>{data[0].totalCashoutRedeemsSuccess}</span>
              </div>
            ),
            bgColor: "#EBFFF1",
            borderColor: "#9CFFBD",
            color: "#1AA24D",
            icon: (
              <img
                src={TotalCashoutRedeemSuccessfull}
                alt="Total Cashout Redeem Successfull"
                style={{ marginRight: "4px" }}
              />
            ),
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
                {/* <img
                  src={AOGSymbol}
                  alt="AOG Symbol"
                  style={{ width: "20px", height: "20px", marginRight: "8px" }}
                /> */}
                <span>{data[0].totalCashoutRedeemsInProgress}</span>
              </div>
            ),
            bgColor: "#FFF7ED",
            borderColor: "#EEFF9C",
            color: "#EA580C",
            icon: (
              <img
                src={TotalCashoutRedeemPending}
                alt="Total Cashout Redeem Pending"
                style={{ marginRight: "4px" }}
              />
            ),
          },
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
                {/* <img
                  src={AOGSymbol}
                  alt="AOG Symbol"
                  style={{ width: "20px", height: "20px", marginRight: "8px" }}
                /> */}
                <span>{data[0].totalFeesCharged}</span>
              </div>
            ),
            bgColor: "#EEF2FF",
            borderColor: "#F79CFF",
            color: "#4F46E5",
            icon: (
              <img
                src={TotalFeesCharged}
                alt="Total Fees Charged"
                style={{ marginRight: "4px" }}
              />
            ),
          },
          {
            id: 9,
            name: "Total Wallet Balance",
            value: data[0].totalWalletBalance || 0,
            bgColor: "#F0FDFA",
            borderColor: "#FFC79C",
            color: "#0D9488",
            icon: (
              <img
                src={TotalWalletBalance}
                alt="Total Wallet Balance"
                style={{ marginRight: "4px" }}
              />
            ),
          },
        ]
      : []),
  ];

  identity.role === "Agent" && finalData.splice(1, 1);

  return (
    <Grid container spacing={{ xs: 1, sm: 2 }} mt={{ xs: 1, sm: 2 }}>
      {/* First Row: 4 boxes */}
      {[...finalData, ...recharge].slice(0, 4).map((item) => (
        <Grid item xs={12} sm={6} md={3} key={item?.id}>
          <Card
            sx={{
              backgroundColor: item?.bgColor,
              // border: 2,
              // borderColor: item?.borderColor,
              borderRadius: "4px",
              boxShadow: 0,
              px: 1,
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
                  mt: 2,
                  fontWeight: 400,
                  fontSize: "32px",
                  lineHeight: "100%",
                  letterSpacing: "0%",
                  verticalAlign: "middle",
                  color: item?.color || "inherit",
                }}
              >
                {item?.value}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}

      {/* Second Row: 3 boxes */}
      {[...finalData, ...recharge].slice(4, 7).map((item) => (
        <Grid item xs={12} sm={6} md={4} key={item?.id}>
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
                  verticalAlign: "middle",
                  color: item?.color || "inherit",
                }}
              >
                {item?.value}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}

      {/* Third Row: 3 boxes */}
      {[...finalData, ...recharge].slice(7, 10).map((item) => (
        <Grid item xs={12} sm={6} md={4} key={item?.id}>
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
                  verticalAlign: "middle",
                  color: item?.color || "inherit",
                }}
              >
                {item?.value}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}

      {/* Last Row: 1 box */}
      {[...finalData, ...recharge].slice(10, 11).map((item) => (
        <Grid item xs={12} sm={6} md={12} key={item?.id}>
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
};

export const DataSummary = () => {
  const role = localStorage.getItem("role");
  const { identity } = useGetIdentity();
  const [menuAnchor, setMenuAnchor] = React.useState(null);
  const [isExporting, setIsExporting] = useState(false); // Loading state for data fetch

  const [choices, setChoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const perPage = 10;
  const [selectedUser, setSelectedUser] = useState(null); // Store selected user
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [tempStartDate, setTempStartDate] = useState(null);
  const [tempEndDate, setTempEndDate] = useState(null);
  const [selectedUsertemp, setSelectedUsertemp] = useState(null); // Store selected user
  const [formResetKey, setFormResetKey] = useState(0);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportMonth, setExportMonth] = useState(null);
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
    // const queryParams = new URLSearchParams(window.location.search);
    // const rawFilter = queryParams.get("filter");
    // if (rawFilter) {
    //   try {
    //     const filterObj = JSON.parse(rawFilter);
    //     const start = filterObj.startdate;
    //     const end = filterObj.enddate;
    //     const userId = filterObj.username;
    //     const usernameLabel = filterObj.usernameLabel;
    //     if (start) setTempStartDate(start);
    //     if (end) setTempEndDate(end);
    //     if (userId && usernameLabel) {
    //       const matchedUser = {
    //         id: userId,
    //         optionName: usernameLabel,
    //       };
    //       setSelectedUsertemp(matchedUser);
    //       setSelectedUser(matchedUser);
    //     }
    //   } catch (err) {
    //     console.error("Invalid filter JSON:", err);
    //   }
    // }
  }, []);

  useEffect(() => {
    setTempStartDate(null);
    setTempEndDate(null);
    setStartDate(null);
    setEndDate(null);
    setSelectedUser(null);
    setSelectedUsertemp(null);
    setFormResetKey((prev) => prev + 1); // 🧠 force rerender of FilterForm
  }, []);

  useEffect(() => {
    fetchUsers(); // Initial load
  }, []);

  const loadAndExportData = async () => {
    let startDate =
      document.querySelector('input[name="startdate"]')?.value || null;
    let endDate =
      document.querySelector('input[name="enddate"]')?.value || null;

    if (exportMonth) {
      const [year, month] = exportMonth.split("-");
      startDate = `${year}-${month}-01`;
      const lastDay = new Date(year, parseInt(month), 0).getDate();
      endDate = `${year}-${month}-${lastDay}`;
    }

    const filters = {
      startDate,
      endDate,
      username: selectedUser?.username,
    };
    setIsExporting(true); // Set exporting state

    try {
      const { data } = await dataProvider.getList("summaryExport", {
        pagination: { page: 1, perPage: 1000 },
        sort: { field: "transactionDate", order: "DESC" },
        filter: { ...filters },
      }); // Call the service to fetch export data
      if (data) {
        return data; // Return the fetched data
      } else {
        console.error("No data available for export");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsExporting(false); // Hide exporting state once finished
    }
  };

  const handleMenuOpen = (event) => {
    setExportDialogOpen(true);
  };

  const handleMenuClose = () => {
    setExportDialogOpen(false);
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
    doc.text("Total Redeem Data", 10, 10);

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
      label="Username" // Add label property if supported
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
        "& .MuiInputLabel-shrink": {
          transform: "none",
        },
        "& .MuiOutlinedInput-root": {
          borderRadius: "4px",
          "& fieldset": {
            borderColor: "#CFD4DB",
          },
          "&:hover fieldset": {
            borderColor: "#CFD4DB",
          },
          "&.Mui-focused fieldset": {
            borderColor: "#CFD4DB",
          },
        },
      }}
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
            sx: {
              "& fieldset": {
                borderColor: "#CFD4DB",
              },
            },
          }}
        />
      )}
      alwaysOn
      resettable
    />,
    <DateInput
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
        "& .MuiInputLabel-shrink": {
          transform: "none",
        },
        "& .MuiOutlinedInput-root": {
          borderRadius: "4px",
          "& fieldset": {
            borderColor: "#CFD4DB",
          },
          "&:hover fieldset": {
            borderColor: "#CFD4DB",
          },
          "&.Mui-focused fieldset": {
            borderColor: "#CFD4DB",
          },
        },
      }}
      alwaysOn
      resettable
      InputLabelProps={{
        shrink: true,
        style: { position: "relative", transform: "none", marginBottom: "4px" },
      }}
      // validate={maxValue(currentDate)}
      InputProps={{
        inputProps: {
          min: startDateLimit, // Minimum allowed date
          max: tempEndDate || today, // Maximum allowed date
        },
        value: tempStartDate,
      }}
      onChange={(event) => setTempStartDate(event.target.value)}
    />,
    <DateInput
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
        "& .MuiInputLabel-shrink": {
          transform: "none",
        },
        "& .MuiOutlinedInput-root": {
          borderRadius: "4px",
          "& fieldset": {
            borderColor: "#CFD4DB",
          },
          "&:hover fieldset": {
            borderColor: "#CFD4DB",
          },
          "&.Mui-focused fieldset": {
            borderColor: "#CFD4DB",
          },
        },
      }}
      alwaysOn
      resettable
      InputLabelProps={{
        shrink: true,
        style: { position: "relative", transform: "none", marginBottom: "4px" },
      }}
      // validate={maxValue(currentDate)}
      onChange={(event) => setTempEndDate(event.target.value)}
      InputProps={{
        inputProps: {
          min: tempStartDate || startDateLimit, // Minimum allowed date
          max: today, // Maximum allowed date
        },
        value: tempEndDate,
      }}
    />,

    // <SearchSelectUsersFilter />,
  ];
  const handleFilterSubmit = () => {
    setStartDate(tempStartDate);
    setEndDate(tempEndDate);
    setSelectedUser(selectedUsertemp);

    // const queryParams = new URLSearchParams();
    // const filterObj = {};

    // if (tempStartDate) filterObj.startdate = tempStartDate;
    // if (tempEndDate) filterObj.enddate = tempEndDate;

    // if (selectedUsertemp?.id) {
    //   filterObj.username = selectedUsertemp.id; // for backend use
    //   filterObj.usernameLabel = selectedUsertemp.optionName; // for restoring UI
    // }

    // queryParams.set("filter", JSON.stringify(filterObj));

    // const newUrl = `${window.location.pathname}?${queryParams.toString()}`;
    // window.history.replaceState(null, "", newUrl);
  };
  console.log(formResetKey, "formResetKeyformResetKey");
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
      <ListBase resource="users" filter={{ username: selectedUser?.id }}>
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
                // gap: 1,
                alignItems: { xs: "stretch", sm: "end" },
              }}
            >
              <FilterForm
                filters={dataFilters}
                key={`filter-reset-${formResetKey}`} // 🔁 this causes full internal reset
                sx={{
                  // flex: "1 1 auto",
                  padding: "0 !important",
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  // gap: 1,
                  alignItems: { xs: "stretch", sm: "flex-start" },
                }}
              />
              <Button
                source="date"
                variant="contained"
                onClick={handleFilterSubmit}
                sx={{
                  mt: 1,
                  padding: "2 !important",
                  height: "40px",
                  width: "127px",
                  whiteSpace: "nowrap",
                }} // Adds left margin for spacing
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
                  onClick={handleMenuOpen}
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
                <Menu
                  anchorEl={menuAnchor}
                  open={Boolean(menuAnchor)}
                  onClose={handleMenuClose}
                  sx={{
                    marginTop: "8px",
                  }}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                  }}
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
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
                        <img src={pdfIcon} alt="PDF" width={20} height={20} />
                      )}
                    </ListItemIcon>
                    .pdf Recharge Export
                  </MenuItem>
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
                        <img src={pdfIcon} alt="PDF" width={20} height={20} />
                      )}
                    </ListItemIcon>
                    .pdf Redeem Export
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
                        <img src={excelIcon} alt="EXCEL" />
                      )}
                    </ListItemIcon>
                    .xls Recharge Export
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
                        <img src={excelIcon} alt="EXCEL" />
                      )}
                    </ListItemIcon>
                    .xls Redeem Export
                  </MenuItem>
                </Menu>
              </Box>
            )}
          </Box>
        </Box>
        <Summary
          selectedUser={selectedUser}
          startDate={startDate}
          endDate={endDate}
        />
      </ListBase>
      <Dialog
        open={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
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
        <DialogActions>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" }, // ⬅️ Column on mobile, row on desktop
              gap: 2,
              width: "100%", // Make sure buttons can stretch
            }}
          >
            <Button
              variant="outlined"
              onClick={() => setExportDialogOpen(false)}
              disabled={isExporting}
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (!exportMonth) return;
                setIsExporting(true);

                const exportData = await loadAndExportData(); // Use existing data or fetch if null

                // Combine wallet and others data for Excel
                const combinedData = [
                  ...exportData[0]?.totalRechargeByTypeData?.wallet?.map(
                    (item) => ({
                      "Transaction ID": item.transactionId,
                      Amount: item.amount,
                      "Transaction Date": formatDateForExcel(
                        item.transactionDate
                      ),
                      Status: item.status,
                      paymentType: item?.paymentType,
                      "Stripe Transaction ID": item.transactionIdFromStripe,
                      "Payment Type": item.paymentType,
                      "Agent Name": item?.agentName,
                      "User Name": item?.userName,
                    })
                  ),
                  ...exportData[0]?.totalRechargeByTypeData?.others.map(
                    (item) => ({
                      "Transaction ID": item.transactionId,
                      Amount: item.amount,
                      "Transaction Date": formatDateForExcel(
                        item.transactionDate
                      ),
                      Status: item.status,
                      paymentType: item?.paymentType,
                      "Stripe Transaction ID": item.transactionIdFromStripe,
                      "Payment Type": item.paymentType,
                      "Agent Name": item?.agentName,
                      "User Name": item?.userName,
                    })
                  ),
                ];

                // Create worksheet and workbook
                const worksheet = XLSX.utils.json_to_sheet(combinedData);
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(
                  workbook,
                  worksheet,
                  "Total Recharge Data"
                );

                // Write Excel file
                const xlsData = XLSX.write(workbook, {
                  bookType: "xlsx",
                  type: "array",
                });
                saveAs(
                  new Blob([xlsData], { type: "application/octet-stream" }),
                  "TotalRechargeData.xlsx"
                );

                setIsExporting(false);
                setExportDialogOpen(false);
              }}
              disabled={!exportMonth || isExporting}
            >
              <img src={excelIcon} alt="PDF" width={20} height={20} /> &nbsp;
              Recharge
            </Button>
            <Button
              onClick={async () => {
                if (!exportMonth) return;

                setIsExporting(true);
                const exportData = await loadAndExportData(); // Use existing data or fetch if null

                const doc = new jsPDF();

                // Add title
                doc.text("Total Recharge Data", 10, 10);

                // Prepare wallet data for PDF
                const walletTableData =
                  exportData[0]?.totalRechargeByTypeData?.wallet?.map(
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
                const othersTableData =
                  exportData[0]?.totalRechargeByTypeData?.others?.map(
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
                doc.text(
                  "Others Transactions",
                  10,
                  doc.lastAutoTable.finalY + 10
                );
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

                setIsExporting(false);
                setExportDialogOpen(false);
              }}
              disabled={!exportMonth || isExporting}
            >
              <img src={pdfIcon} alt="PDF" width={20} height={20} /> &nbsp;
              Recharge
            </Button>

            <Button
              onClick={async () => {
                if (!exportMonth) return;
                setIsExporting(true);

                const exportData = await loadAndExportData(); // Use existing data or fetch if null

                // Combine wallet and others data for Excel
                const combinedData = [
                  ...exportData[0]?.totalRedeemByTypeData?.wallet?.map(
                    (item) => ({
                      "Transaction ID": item.transactionId,
                      Amount: item.amount,
                      "Transaction Date": formatDateForExcel(
                        item.transactionDate
                      ),
                      Status: item.status,
                      paymentType: item?.paymentType,
                      "Redeem Service Fee": item.redeemServiceFee,
                      "Agent Name": item?.agentName,
                      "User Name": item?.userName,
                    })
                  ),
                  ...exportData[0]?.totalRedeemByTypeData?.others.map(
                    (item) => ({
                      "Transaction ID": item.transactionId,
                      Amount: item.amount,
                      "Transaction Date": formatDateForExcel(
                        item.transactionDate
                      ),
                      Status: item.status,
                      paymentType: item?.paymentType,
                      "Redeem Service Fee": 0,
                      "Agent Name": item?.agentName,
                      "User Name": item?.userName,
                    })
                  ),
                ];

                // Create worksheet and workbook
                const worksheet = XLSX.utils.json_to_sheet(combinedData);
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(
                  workbook,
                  worksheet,
                  "Total Recharge Data"
                );

                // Write Excel file
                const xlsData = XLSX.write(workbook, {
                  bookType: "xlsx",
                  type: "array",
                });
                saveAs(
                  new Blob([xlsData], { type: "application/octet-stream" }),
                  "TotalReedeemData.xlsx"
                );

                setIsExporting(false);
                setExportDialogOpen(false);
              }}
              disabled={!exportMonth || isExporting}
            >
              <img src={excelIcon} alt="PDF" width={20} height={20} /> &nbsp;
              Redeem
            </Button>
            <Button
              onClick={async () => {
                if (!exportMonth) return;

                setIsExporting(true);
                const exportData = await loadAndExportData(); // Use existing data or fetch if null

                const doc = new jsPDF();

                // Add title
                doc.text("Total Redeem Data", 10, 10);

                // Prepare wallet data for PDF
                const walletTableData =
                  exportData[0]?.totalRedeemByTypeData?.wallet?.map(
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
                const othersTableData =
                  exportData[0]?.totalRedeemByTypeData?.others?.map(
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
                doc.text(
                  "Cashout Transactions",
                  10,
                  doc.lastAutoTable.finalY + 10
                );
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

                setIsExporting(false);
                setExportDialogOpen(false);
              }}
              disabled={!exportMonth || isExporting}
            >
              <img src={pdfIcon} alt="PDF" width={20} height={20} />
              &nbsp; Redeem
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </>
  );
};
