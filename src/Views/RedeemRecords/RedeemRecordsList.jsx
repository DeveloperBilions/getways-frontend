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
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
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
// Initialize Parse
Parse.initialize(process.env.REACT_APP_APPID, process.env.REACT_APP_MASTER_KEY);
Parse.serverURL = process.env.REACT_APP_URL;

export const RedeemRecordsList = (props) => {
  const navigate = useNavigate();
  const refresh = useRefresh();
  const { identity } = useGetIdentity();
  const { permissions } = usePermissions();

  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [redeemDialogOpen, setRedeemDialogOpen] = useState(false);
  const [finalrejectDialogOpen, setFinalRejectDialogOpen] = useState(false);
  const [finalredeemDialogOpen, setFinalRedeemDialogOpen] = useState(false);
  const role = localStorage.getItem("role");

  if (!role) {
    navigate("/login");
  }

  const { data, isPending, isFetching } = useGetList("redeemRecordsExport", {
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
      case 8:
        return "Review";        
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
      .filter((item) => item.status === 4 && item.type === "redeem")
      .reduce((sum, item) => sum + item.transactionAmount, 0);

  const handleRefresh = async () => {
    refresh();
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Redeem Records", 10, 10);
    doc.autoTable({
      head: [
        ["No", "Name", "Amount($)", "Remark", "Status", "Message", "Date"],
      ],
      body: data.map((row, index) => [
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

  const handleExportXLS = () => {
    const selectedFields = data.map((item) => ({
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

  // const SelectUserInput = () => {
  //   return permissions !== "Player" ? (
  //     <SelectInput
  //       label="Status"
  //       source="status"
  //       emptyText="All"
  //       choices={[
  //         { id: 4, name: "Success" },
  //         { id: 5, name: "Failed" },
  //         { id: 6, name: "Pending Approval" },
  //         { id: 7, name: "Rejected" },
  //       ]}
  //       sx={{ width: 48, backgroundColor: "red" }}
  //     />
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
          { id: 4, name: "Success" },
          { id: 5, name: "Failed" },
          { id: 6, name: "Pending Approval" },
          { id: 7, name: "Rejected" },
        ]}
      />
    ),
  ].filter(Boolean);

  const postListActions = (
    <TopToolbar>
      <Typography sx={{ mr: 20 }}>Redeems may take up to 2 hours</Typography>
      <Button
        variant="contained"
        size="small"
        startIcon={<RefreshIcon />}
        onClick={handleRefresh}
      >
        Refresh
      </Button>
      {permissions !== "Player" && (
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
      <List
        title="Redeem Records"
        filters={dataFilters}
        filter={
          identity?.role !== "Player"
            ? { type: "redeem" }
            : { type: "redeem", status: 6 }
        }
        actions={postListActions}
        sx={{ pt: 1 }}
        empty={false}
        {...props}
        sort={{ field: "transactionDate", order: "DESC" }}
      >
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
        <Datagrid size="small" bulkActionButtons={false}>
          <TextField source="username" label="Account" />
          <NumberField
            source="transactionAmount"
            label="Redeemed"
            textAlign="left"
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
                    return "success";
                  case 5:
                    return "error";
                  case 6:
                    return "warning";
                  case 7:
                    return "error";
                  default:
                    return "default";
                }
              };
              const statusMessage = {
                4: "Success",
                5: "Fail",
                6: "Pending Approval",
                7: "Rejected",
                8: "Review"
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
          <DateField source="transactionDate" label="RedeemDate" showTime />
          <TextField source="responseMessage" label="Message" />
          <FunctionField
            label="Action"
            source="action"
            render={(record) =>
              record?.status === 6 && identity?.role === "Agent" ? (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Button
                    variant="outlined"
                    color="success"
                    size="small"
                    sx={{
                      mr: 1,
                    }}
                    onClick={() => {
                      setSelectedRecord({
                        ...record,
                        userParentId: identity?.objectId,
                      });
                      setRedeemDialogOpen(true);
                    }}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => {
                      setSelectedRecord(record);
                      setRejectDialogOpen(true);
                    }}
                  >
                    Reject
                  </Button>
                </Box>
              ) : record?.status === 8 && identity?.role === "Super-User" ? (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Button
                    variant="outlined"
                    color="success"
                    size="small"
                    sx={{
                      mr: 1,
                    }}
                    onClick={() => {
                      setSelectedRecord({
                        ...record,
                        userParentId: identity?.objectId,
                      });
                      setFinalRedeemDialogOpen(true);
                    }}
                  >
                    Success
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => {
                      setSelectedRecord(record);
                      setFinalRejectDialogOpen(true);
                    }}
                  >
                    Reject
                  </Button>
                </Box>
              ) : null
            }
          />
        </Datagrid>
      </List>
      {permissions === "Agent" && (
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
      {permissions === "Super-User" && (
        <>
          <FinalRejectRedeemDialog
            open={finalrejectDialogOpen}
            onClose={() => setFinalRejectDialogOpen(false)}
            handleRefresh={handleRefresh}
            selectedRecord={selectedRecord}
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
