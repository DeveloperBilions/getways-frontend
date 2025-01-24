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

const Summary = () => {
  const { data, isFetching, isLoading } = useListContext();
  const { identity } = useGetIdentity();
  const role = localStorage.getItem("role");
  const [selectedRechargeType, setSelectedRechargeType] = useState("all"); // State for recharge type selection
  const [menuAnchor, setMenuAnchor] = React.useState(null);
  const handleMenuOpen = (event) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleExportRechargePDF = () => {
    const doc = new jsPDF();

    // Add title
    doc.text("Total Recharge Data", 10, 10);

    // Prepare wallet data for PDF
    const walletTableData = data[0]?.totalRechargeByTypeData?.wallet?.map(
      (item, index) => [
        item.transactionId,
        item.amount,
        new Date(item.transactionDate).toLocaleString(),
        item.status,
        item.transactionIdFromStripe,
        item.paymentType,
      ]
    );

    // Prepare others data for PDF
    const othersTableData = data[0]?.totalRechargeByTypeData?.others?.map(
      (item, index) => [
        item.transactionId,
        item.amount,
        new Date(item.transactionDate).toLocaleString(),
        item.status,
        item.transactionIdFromStripe,
        item.paymentType,
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

  const handleExportRechargeXLS = () => {
    // Combine wallet and others data for Excel
    const combinedData = [
      ...data[0]?.totalRechargeByTypeData?.wallet?.map((item) => ({
        "Transaction ID": item.transactionId,
        Amount: item.amount,
        "Transaction Date": new Date(item.transactionDate).toLocaleString(),
        Status: item.status,
        "Stripe Transaction ID": item.transactionIdFromStripe,
        "Payment Type": item.paymentType,
      })),
      ...data[0]?.totalRechargeByTypeData?.others.map((item) => ({
        "Transaction ID": item.transactionId,
        Amount: item.amount,
        "Transaction Date": new Date(item.transactionDate).toLocaleString(),
        Status: item.status,
        "Stripe Transaction ID": item.transactionIdFromStripe,
        "Payment Type": item.paymentType,
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
      {role === "Super-User" && (
        <Box display="flex" justifyContent="flex-end" sx={{ mb: 2, marginTop:"-40px" }}>
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
                handleMenuClose();
              }}
            >
              <ListItemIcon>
                <PictureAsPdfIcon fontSize="small" />
              </ListItemIcon>
              PDF
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleExportRechargeXLS();
                handleMenuClose();
              }}
            >
              <ListItemIcon>
                <BackupTableIcon fontSize="small" />
              </ListItemIcon>
              Excel
            </MenuItem>
          </Menu>
        </Box>
      )}
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

const SearchSelectUsersFilter = () => {
  const { data, isPending } = useGetList("users", {
    pagination: { page: 1, perPage: 10000 },
    sort: { field: "roleName", order: "ASC" },
    filter: { userReferralCode: null },
  });
  // console.log(data);
  // if (isPending) return null;

  if (isPending) {
    return <Loader />;
  }

  return (
    <SelectInput
      label="username"
      source="username"
      choices={data}
      optionText="username"
      optionValue="id"
      alwaysOn
      resettable
      emptyText="All"
    />
  );
};

export const DataSummary = () => {
  const { identity } = useGetIdentity();
  const { data, isFetching, isLoading } = useGetList(
    "users",
    {
      pagination: { page: 1, perPage: 10000 },
      sort: { field: "roleName", order: "ASC" },
      // filter: { userReferralCode: "" },
      filter: {
        $or: [{ userReferralCode: "" }, { userReferralCode: null }],
      },
    },
    {
      refetchOnWindowFocus: false, // Prevent refetch on focus
      refetchOnReconnect: false,
    }
  );

  const newData = data?.map(
    (item) =>
      item.id !== identity.objectId && {
        ...item,
        optionName: "".concat(item.name, " (", item.roleName, ")"),
      }
  );

  const currentDate = new Date().toLocaleDateString("es-CL");
  const prevYearDate = new Date(
    new Date().setFullYear(new Date().getFullYear() - 1)
  ).toLocaleDateString("es-CL");
  const nextYearDate = new Date(
    new Date().setFullYear(new Date().getFullYear() + 1)
  ).toLocaleDateString("es-CL");
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
        <ListBase>
          <FilterForm
            filters={dataFilters}
            sx={{
              flex: "0 2 auto !important",
              padding: "0px 0px 0px 0px !important",
              alignItems: "flex-start",
            }}
          />

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
      )}
    </React.Fragment>
  );
};
