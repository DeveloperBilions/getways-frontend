import React, { useState } from "react";
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
import LanguageIcon from "@mui/icons-material/Language";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
// pdf xls
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
// loader
import { Loader } from "../Loader";

import { Parse } from "parse";

// Initialize Parse
Parse.initialize(process.env.REACT_APP_APPID, process.env.REACT_APP_MASTER_KEY);
Parse.serverURL = process.env.REACT_APP_URL;

export const RechargeRecordsList = (props) => {
  const navigate = useNavigate();
  const refresh = useRefresh();
  const { permissions } = usePermissions();
  const { identity } = useGetIdentity();

  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [creditCoinDialogOpen, setCreditCoinDialogOpen] = useState(false);
  const [rechargeDialogOpen, setRechargeDialogOpen] = useState(false);

  const role = localStorage.getItem("role");

  if (!role) {
    navigate("/login");
  }

  const { data, isPending, isFetching } = useGetList("rechargeRecordsExport", {
    sort: { field: "transactionDate", order: "DESC" },
  });

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
  // 6: "Pending Approval"
  // 7: "Rejected" -  Redeem Request Rejected

  const totalTransactionAmount =
    data &&
    data
      .filter((item) => item.status === 2 || item.status === 3)
      .reduce((sum, item) => sum + item.transactionAmount, 0);

  const handleRefresh = async () => {
    refresh();
  };

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

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Recharge Records", 10, 10);
    doc.autoTable({
      head: [["No", "Name", "Amount($)", "Remark", "Status", "Date"]],
      body: data.map((row, index) => [
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

  const handleExportXLS = () => {
    const selectedFields = data.map((item) => ({
      Name: item.username,
      "Amount($)": item.transactionAmount,
      Remark: item.remark,
      Status: mapStatus(item.status),
      Date: new Date(item.transactionDate).toLocaleDateString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(selectedFields);
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

  // const SelectUserInput = () => {
  //   console.log("ROLE", permissions);
  //   return permissions != "Player" ? (
  // <SelectInput
  //   label="Status"
  //   source="status"
  //   emptyText="All"
  //   choices={[
  //     { id: 0, name: "Pending Referral Link" },
  //     { id: 1, name: "Pending Confirmation" },
  //     { id: 2, name: "Confirmed" },
  //     { id: 3, name: "Coins Credited" },
  //     { id: 4, name: "Status Unknown" },
  //   ]}
  // />;
  //   ) : null;
  // };

  // const dataFilters = [
  //   <SearchInput source="username" alwaysOn resettable />,
  //   <SelectUserInput alwaysOn resettable />,
  // ];

  const dataFilters = [
    <SearchInput source="username" alwaysOn resettable />,
    permissions !== "Player" && (
      <SelectInput
        label="Status"
        source="status"
        emptyText="All"
        alwaysOn
        resettable
        choices={[
          { id: 0, name: "Pending Referral Link" },
          { id: 1, name: "Pending Confirmation" },
          { id: 2, name: "Confirmed" },
          { id: 3, name: "Coins Credited" },
          { id: 4, name: "Status Unknown" },
        ]}
      />
    ),
  ].filter(Boolean);

  const postListActions = (
    <TopToolbar>
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
      {permissions != "Player" && (
        <Button
          variant="contained"
          size="small"
          startIcon={<GetAppIcon />}
          onClick={handleMenuOpen}
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

  if (isPending) {
    return <Loader />;
  }

  if (isFetching) {
    return <Loader />;
  }
  return (
    <>
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
              variant="contained"
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
        title="Recharge Records"
        filters={dataFilters}
        actions={postListActions}
        sx={{ pt: 1 }}
        empty={false}
        {...props}
        filter={
          identity?.role !== "Player"
            ? { type: "recharge" }
            : { type: "recharge", status: 1 }
        }
        sort={{ field: "transactionDate", order: "DESC" }}
      >
        <Datagrid size="small" bulkActionButtons={false}>
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
              record?.status === 2 && identity?.role !== "Player" ? (
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
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    sx={{
                      mr: 1,
                    }}
                    startIcon={<ContentCopyIcon />}
                    onClick={() => handleUrlClick(record)}
                  >
                    Copy
                  </Button>
                  {identity?.role === "Player" && (
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
            handleRefresh={handleRefresh}
          />
        )}
      </List>
    </>
  );
};
