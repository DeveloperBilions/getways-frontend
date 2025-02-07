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
import CircularProgress from "@mui/material/CircularProgress";
import { dataProvider } from "../../Provider/parseDataProvider";
// Initialize Parse
Parse.initialize(process.env.REACT_APP_APPID, process.env.REACT_APP_MASTER_KEY);
Parse.serverURL = process.env.REACT_APP_URL;

export const RedeemRecordsList = (props) => {
  const navigate = useNavigate();
  const refresh = useRefresh();
  const { identity } = useGetIdentity();
  const { permissions } = usePermissions();
  const [cashout, setCashout] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [redeemDialogOpen, setRedeemDialogOpen] = useState(false);
  const [finalrejectDialogOpen, setFinalRejectDialogOpen] = useState(false);
  const [finalredeemDialogOpen, setFinalRedeemDialogOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [statusValue, setStatusValue] = useState();
  const [Data, setData] = useState(null); // Initialize data as null
  const [isExporting, setIsExporting] = useState(false); // Track export state
  const [exportError, setExportError] = useState(null); // Store any export errors

  const role = localStorage.getItem("role");
  const { data, isFetching } = useGetList("redeemRecords", {
    pagination: { page: 1, perPage: 10 },
    sort: { field: "transactionDate", order: "DESC" },
  });
  if (!role) {
    navigate("/login");
  }

  const fetchDataForExport = async () => {
    setIsExporting(true); // Set exporting to true before fetching
    setExportError(null); // Clear any previous errors

    try {
      const { data } = await dataProvider.getList("redeemRecordsExport", {
        pagination: { page: 1, perPage: 1000 }, // Fetch up to 1000 records
        sort: { field: "transactionDate", order: "DESC" },
        filter: {
          ...(searchValue && { username: searchValue }),
          ...(statusValue && { status: statusValue }),
        },
      });
      console.log(data, "datafromrechargeRecordsExport");
      setData(data);
      return data; // Return the fetched data
    } catch (error) {
      console.error("Error fetching data for export:", error);
      setExportError("Error fetching data for export."); // Set the error message
      setData(null); // Reset data to null in case of error
      return null; // Return null to indicate failure
    } finally {
      setIsExporting(false); // Set exporting to false after fetch, regardless of success/failure
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
      case 6:
        return "Pending Approval";
      case 7:
        return "Rejected";
      case 8:
        return "Review";
      case 9:
        return "Expired";
      default:
        return "Unknown Status";
    }
  };

  const handleRefresh = async () => {
    refresh();
  };
  useEffect(() => {
    const interval = setInterval(() => {
      handleRefresh();
    }, 60000); // 60,000 ms = 1 minute

    return () => clearInterval(interval); // Cleanup when unmounted
  }, []);
  const handleExportPDF = async () => {
    const exportData = Data || (await fetchDataForExport()); // Use existing data or fetch if null
    if (!exportData || exportData.length === 0) {
      console.warn("No data to export.");
      return;
    }
    const doc = new jsPDF();
    doc.text("Redeem Records", 10, 10);
    doc.autoTable({
      head: [
        ["No", "Name", "Amount($)", "Remark", "Status", "Message", "Date"],
      ],
      body: exportData.map((row, index) => [
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

  const handleExportXLS = async () => {
    const exportData = Data || (await fetchDataForExport()); // Use existing data or fetch if null
    if (!exportData || exportData.length === 0) {
      console.warn("No data to export.");
      return;
    }
    const selectedFields = exportData.map((item) => ({
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

  const handleSearchChange = (e) => {
    if (e) {
      const value = e.target.value;
      setSearchValue(value);
    }
  };

  const handleStatusChange = (e) => {
    if (e) {
      setStatusValue(e.target.value);
      console.log(e.target.value);
    }
  };
  const dataFilters = [
    <SearchInput
      source="username"
      alwaysOn
      resettable
      onBlur={handleSearchChange}
    />,
    permissions !== "Player" && (
      <SelectInput
        label="Status"
        source="status"
        emptyText="All"
        alwaysOn
        resettablea
        choices={[
          { id: 5, name: "Failed" },
          { id: 6, name: "Pending Approval" },
          { id: 7, name: "Rejected" },
          { id: 8, name: "Redeem Successfully" },
          { id: 9, name: "Expired" },
          ...(permissions === "Super-User"
            ? [
                { id: 11, name: "Cashouts" },
                { id: 12, name: "Cashout Successfully" },
                { id: 13, name: "Cashout Reject" },
              ]
            : []),
        ]}
        onBlur={handleStatusChange}
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
            //handleMenuClose();
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
            //handleMenuClose();
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
  if (isFetching) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="50vh"
      >
        <CircularProgress />
      </Box>
    );
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
        {identity?.role !== "Player" ? (
          <></>
        ) : (
          /*<Typography sx={{ mt: 2 }}>
              Total Redeemed Amount: <b>${totalTransactionAmount}</b>
            </Typography> */
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
        emptyWhileLoading={true}
      >
        <Datagrid size="small" bulkActionButtons={false}>
          <TextField source="username" label="Account" />
          <NumberField
            source="transactionAmount"
            label="Redeemed"
            textAlign="left"
          />
           <FunctionField
              label="Parent"
              render={(record) => {
                return record?.userParentName;
              }}
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
                  case 12:
                    return "success";
                  case 5:
                    return "error";
                  case 13:
                    return "error";
                  case 6:
                    return "warning";
                  case 7:
                    return "error";
                  case 8:
                    return "success";
                  default:
                    return "default";
                }
              };
              const statusMessage = {
                4: "Success",
                5: "Fail",
                6: "Pending Approval",
                7: "Rejected",
                8: "Redeem Successfully",
                9: "Expired",
                11: "Cashouts",
                12: "Cashout Successfully",
                13: "Cashout Reject",
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
          {identity?.role === "Super-User" && (
            <TextField source="paymentMode" label="Payment Method" />
          )}
          {identity?.role === "Super-User" && (
            <TextField source="paymentMethodType" label="Payment Id" />
          )}
          <FunctionField
            label="Action"
            source="action"
            render={(record) =>
              (record?.status === 6 && identity?.role === "Agent") ||
              (record?.status === 6 &&
                identity?.role === "Master-Agent" &&
                identity?.objectId === record?.userParentId) ? (
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
              ) : record?.status === 11 && identity?.role === "Super-User" ? (
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
                      setCashout(true);
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
      {(permissions === "Agent" || permissions === "Master-Agent") && (
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
            cashout={cashout}
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
