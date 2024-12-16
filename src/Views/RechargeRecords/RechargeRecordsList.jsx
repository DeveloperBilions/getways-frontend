import React, { useEffect, useState } from "react";
// react admin
import {
  Datagrid,
  List,
  TextField,
  SearchInput,
  DateField,
  NumberField,
  FunctionField,
  FilterButton,
  TopToolbar,
  TextInput,
  usePermissions,
  useGetIdentity,
  SortButton,
  useGetList 
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
import RefreshIcon from "@mui/icons-material/Refresh";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
// pdf xls
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import { Parse } from "parse";

// Initialize Parse
Parse.initialize(process.env.REACT_APP_APPID, process.env.REACT_APP_MASTER_KEY);
Parse.serverURL = process.env.REACT_APP_URL;

export const RechargeRecordsList = () => {
  const navigate = useNavigate();
  const { permissions } = usePermissions();
  const { identity, isLoading } = useGetIdentity();

  const [gameData, setGameData] = useState([]);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [creditCoinDialogOpen, setCreditCoinDialogOpen] = useState(false);
  const [rechargeDialogOpen, setRechargeDialogOpen] = useState(false);

  const role = localStorage.getItem("role");

  if (!role) {
    navigate("/login");
  }

  const { data } = useGetList(
    'rechargeRecords',
    { 
        pagination: { page: 1, perPage: 10 },
        sort: { field: 'published_at', order: 'DESC' }
    }
);

  const fetchData = async () => {
    try {
      const TransactionRecords = Parse.Object.extend("TransactionRecords");
      const query = new Parse.Query(TransactionRecords);

      // Add a constraint to filter by type
      query.equalTo("type", "recharge");

      // Order by a field
      query.descending("createdAt");

      // Execute the query
      const results = await query.find();

      // Map the results to extract data
      const transactions = results.map((record) => ({
        transactionId: record.id,
        gameId: record.get("gameId"),
        username: record.get("username"),
        transactionDate: record.get("transactionDate"),
        beforeTransaction: record.get("beforeTransaction"),
        afterTransaction: record.get("afterTransaction"),
        transactionAmount: record.get("transactionAmount"),
        ipaddress: record.get("ipaddress"),
        remark: record.get("remark"),
        referralLink: record.get("referralLink"),
        status: mapStatus(record.get("status")),
      }));

      setGameData(transactions);
    } catch (error) {
      console.error("Error while fetching data:", error);
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
      default:
        return "Unknown Status";
    }
  };

  // 0: "Pending Referral Link"
  // 1: "Pending Confirmation"
  // 2: "Confirmed" - btn dispaly "Coins Credit"
  // 3: "Coins Credited" for status

  useEffect(() => {
    fetchData();
    // Set up interval to fetch data every 1 minute
    const intervalId = setInterval(() => {
      fetchData();
    }, 60000);
    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const totalTransactionAmount = data&&data
  .filter((item) => item.status === 2)
  .reduce((sum, item) => sum + item.transactionAmount, 0);

  const handleRefresh = async () => {
    try {
      await Parse.Cloud.run("checkTransactionStatus");
      fetchData();
    } catch (error) {
      console.error("Error Transaction Status", error);
    }
  };

  const handleCoinCredit = async (record) => {
    setSelectedRecord(record);
    setCreditCoinDialogOpen(true);
  };

  const handleUrlClick = (record) => {
    navigator.clipboard.writeText(record?.referralLink);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Recharge Records", 10, 10);
    doc.autoTable({
      head: [["Game ID", "Username", "Amount", "Remark", "Status", "Date"]],
      body: gameData.map((row) => [
        row.gameId,
        row.username,
        row.transactionAmount,
        row.remark,
        row.status,
        new Date(row.transactionDate).toLocaleDateString(),
      ]),
    });
    doc.save("RechargeRecords.pdf");
  };

  const handleExportXLS = () => {
    const worksheet = XLSX.utils.json_to_sheet(gameData);
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

  const dataFilters = [
    <SearchInput source="username" alwaysOn resettable variant="outlined" />,
    // <TextInput source="status" />,
  ];

  const postListActions = (
    <TopToolbar>
      {/* <FilterButton /> */}
      <SortButton fields={['username','status','transactionAmount','transactionDate']} />
      {permissions === "Player" && (
        <Button
          variant="contained"
          size="small"
          startIcon={<AttachMoneyIcon />}
          onClick={() => setRechargeDialogOpen(true)}
        >
          Recharge
        </Button>
      )}
      <Button
        variant="contained"
        size="small"
        startIcon={<RefreshIcon />}
        onClick={handleRefresh}
      >
        Refresh
      </Button>
      <Button
        variant="contained"
        size="small"
        startIcon={<GetAppIcon />}
        onClick={handleMenuOpen}
      >
        Export
      </Button>
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
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <PictureAsPdfIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            PDF file
          </Typography>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleExportXLS();
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <BackupTableIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Excel file
          </Typography>
        </MenuItem>
      </Menu>
    </TopToolbar>
  );

  return (
    <>
<Box
  sx={{
    display: 'flex', 
    justifyContent: 'space-between',
    alignItems: 'center'
  }}
>
  <Typography className="mt-2">
    Total Rechanged Amount: <b>${totalTransactionAmount}</b>
  </Typography>
  {identity?.role === "Player" && (
    <Typography
      noWrap
      variant="subtitle2"
      sx={{ color: "text.secondary", fontWeight: 500 }}
    >
      Agent: <b>{identity?.userParentName}</b>
    </Typography>
  )}
</Box>

    <List
      title="Recharge Records"
      filters={dataFilters}
      actions={postListActions}
      sx={{ pt: 1 }}
      empty={false}
    >
      <Datagrid size="small" bulkActionButtons={false}>
        {/* <TextField source="gameId" label="GameId" /> */}
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
                  return "success";
                case 2:
                  return "primary";
                case 1:
                  return "warning";
                case 0:
                  return "error";
                default:
                  return "default";
              }
            };
            const statusMessage = {
              0: "Pending Referral Link",
              1: "Pending Confirmation",
              2: "Confirmed",
              3: "Coins Credited",
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
        <DateField source="transactionDate" label="RechargeDate" showTime />
        <FunctionField
          label="Action"
          render={(record) =>
            record.status === 2 && identity.role !== "Player" ? (
              <Button
                variant="outlined"
                color="primary"
                size="small"
                startIcon={<MonetizationOnIcon />}
                onClick={() => handleCoinCredit(record)}
              >
                Coins Credit
              </Button>
            ) : record.status === 1 ? (
              <Button
                variant="outlined"
                color="primary"
                size="small"
                startIcon={<ContentCopyIcon />}
                onClick={() => handleUrlClick(record)}
              >
                Copy Link
              </Button>
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
            ) : null
          }
        />
      </Datagrid>
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
          fetchData={fetchData}
        />
      )}
    </List>
    </>
  );
};
