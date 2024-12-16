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
  useGetIdentity,
  Filter,
  SortButton,
  useGetList 
} from "react-admin";
import { useNavigate, } from "react-router-dom";
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
import GetAppIcon from "@mui/icons-material/GetApp";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import BackupTableIcon from "@mui/icons-material/BackupTable";
import RefreshIcon from "@mui/icons-material/Refresh";
// pdf xls
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import { Parse } from "parse";

// Initialize Parse
Parse.initialize(process.env.REACT_APP_APPID, process.env.REACT_APP_MASTER_KEY);
Parse.serverURL = process.env.REACT_APP_URL;

export const RedeemRecordsList = () => {
  const navigate = useNavigate();
  const { identity, isLoading } = useGetIdentity();

  const [gameData, setGameData] = useState([]);
  const [menuAnchor, setMenuAnchor] = useState(null);

  const role = localStorage.getItem("role");

  if (!role) {
    navigate("/login");
  }

  const { data } = useGetList(
    'redeemRecords',
    { 
        pagination: { page: 1, perPage: 10 },
    }
);

  const fetchData = async () => {
    try {
      const TransactionRecords = Parse.Object.extend("TransactionRecords");
      const query = new Parse.Query(TransactionRecords);

      // Add a constraint to filter by type
      query.equalTo("type", "redeem");

      // Order by a field
      query.descending("transactionDate");

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
        status: mapStatus(record.get("status")),
        responseMessage: record.get("responseMessage"),
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
      case 4:
        return "Success";
      case 5:
        return "Fail";
      default:
        return "Unknown Status";
    }
  };

  const getColor = (status) => {
    switch (status) {
      case 4:
        return "success";
      case 5:
        return "error";
      default:
        return "Unknown Status";
    }
  };

  // 0: "Pending Referral Link"
  // 1: "Pending Confirmation"
  // 2: "Confirmed" - btn dispaly "Coins Credit"
  // 3: "Coins Credited" for status
  // 4: "Redeem Success"
  // 5: "Redeem Faile"

    
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
  .filter((item) => item.status === 4)
  .reduce((sum, item) => sum + item.transactionAmount, 0);

  const handleRefresh = async () => {
    try {
      await Parse.Cloud.run("checkTransactionStatus");
      fetchData();
    } catch (error) {
      console.error("Error Transaction Status", error);
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Redeem Records", 10, 10);
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
    doc.save("RedeemRecords.pdf");
  };

  const handleExportXLS = () => {
    const worksheet = XLSX.utils.json_to_sheet(gameData);
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

  const dataFilters = [
    <SearchInput source="username" alwaysOn resettable variant="outlined" />,
    // <TextInput label="Status" source="status" defaultValue="Fail" />
    // <TextInput label="Search" source="username" alwaysOn key="search" />,
    // <TextInput source="status" />,
  ];

  const postListActions = (
    <TopToolbar>
      {/* <FilterButton /> */}
      <SortButton fields={['username','status','transactionAmount','transactionDate']} />
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
    {identity?.role !== "Player" ? <Typography className="mt-2">
      Total Redeemed Amount: <b>${totalTransactionAmount}</b>
    </Typography> : <div></div>}
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
      title="Redeem Records"
      filters={dataFilters}
      actions={postListActions}
      sx={{ pt: 1 }}
      empty={false} 
    >
      {/* <Datagrid size="small" data={gameData} bulkActionButtons={false}> */}
      <Datagrid size="small" bulkActionButtons={false}>
        {/* <TextField source="gameId" label="GameId" /> */}
        <TextField source="username" label="Account" />
        <NumberField
          source="transactionAmount"
          label="Redeemed"
          textAlign="left"
        />
        <TextField source="remark" label="Remark" />
        <FunctionField
          label="Status"
          render={(record) => {
            // const getColor = (status) => {
            //     switch (status) {
            //         case "Coins Credited":
            //             return "success";
            //         case "Confirmed":
            //             return "primary";
            //         case "Pending Confirmation":
            //             return "warning";
            //         case "Pending Referral Link":
            //             return "error";
            //         case "Success":
            //             return "success";
            //         case "Fail":
            //             return "error";
            //         default:
            //             return "default";
            //     }
            // };

            return (
              <Chip
                label={mapStatus(record.status)}
                color={getColor(record.status)}
                size="small"
                variant="outlined"
              />
            );
          }}
        />
        <DateField source="transactionDate" label="RedeemDate" showTime />
        <TextField source="responseMessage" label="Message" />
      </Datagrid>
    </List>
    </>
  );
};
