import React, { useEffect, useState } from "react";
import {
  useGetIdentity,
  useRefresh,
  Datagrid,
  TextField,
  ListContextProvider,
  FunctionField,
  ChipField,
  DateField,
} from "react-admin";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  Button,
  Typography,
  Grid,
  Paper,
  Box,
} from "@mui/material";
import MoneyReciveLightIcon from "../../Assets/icons/money-recive-light.svg";
import WalletIcon from "../../Assets/icons/WalletIcon.svg";
import AOGSymbol from "../../Assets/icons/AOGsymbol.png";
import { Loader } from "../Loader";
import { walletService } from "../../Provider/WalletManagement";
import CashOutDialog from "./dialog/CashOutDialog";
import AddPaymentMethods from "./dialog/AddPayementMethods";
import ArrowBackIcon from "@mui/icons-material/ArrowBack"; // Import Back Icon
import { Pagination } from "@mui/material";
import TablePagination from "@mui/material/TablePagination";
export const Wallet = () => {
  const { data, isLoading } = useRefresh("playerDashboard");
  const navigate = useNavigate();
  const refresh = useRefresh();
  const { identity } = useGetIdentity();
  const [wallet, setWallet] = useState({});
  const [walletLoading, setWalletLoading] = useState(true);
  const [cashOutDialogOpen, setcashOutDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  const transformedIdentity = {
    id: identity?.objectId,
    ...identity,
  };

  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("id");

  useEffect(() => {
    if (!role) {
      navigate("/login");
    }
  }, [role, navigate]);

  useEffect(() => {
    fetchTransactions(page, pageSize);
  }, [page, pageSize]);
  useEffect(() =>{
    WalletService();
  },[])

  async function WalletService() {
    setWalletLoading(true);
    try {
      const wallet = await walletService.getMyWalletData();
      setWallet(wallet.wallet);
    } catch (error) {
      console.error("Failed to fetch wallet data:", error);
    } finally {
      setWalletLoading(false);
    }
  }

  async function fetchTransactions(page, pageSize) {
    setLoadingTransactions(true);
    try {
      const response = await walletService.getCashoutTransactions({
        page,
        limit: pageSize,
        userId: userId,
      });
      console.log(response, "responsesdksjdks");
      setTransactions(response.transactions || []);
      setTotalRecords(response.pagination?.totalRecords || 0);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    } finally {
      setLoadingTransactions(false);
    }
  }

  const handlePageChange = (newPage) => setPage(newPage);
  const handlePageSizeChange = (newPageSize) => setPageSize(newPageSize);

  if (isLoading || walletLoading) {
    return <Loader />;
  }

  const paymentMethods = [
    { name: "CashApp", id: wallet?.cashAppId },
    { name: "PayPal", id: wallet?.paypalId },
    { name: "Venmo", id: wallet?.venmoId },
    { name: "Zelle", id: wallet?.zelleId },
  ].filter((method) => method.id);
  const handleRefresh = async () => {
    refresh();
    WalletService();
  };
  return (
    <React.Fragment>
      <div
        style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}
      >
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />} // Add Back Arrow Icon
          onClick={() => navigate(-1)} // Navigate back to the previous page
          sx={{
            textTransform: "none",
            fontSize: "16px",
            fontWeight: "bold",
            color: "#1976D2", // Blue color for text
            borderColor: "#1976D2", // Blue border
            "&:hover": {
              backgroundColor: "#E3F2FD", // Light blue hover effect
              borderColor: "#1976D2", // Keep border consistent
            },
          }}
        >
          Back
        </Button>
      </div>

      <Card variant="outlined" sx={{ mt: 2, backgroundColor: "#e3e3e3" }}>
        <CardContent>
          <div className="d-flex">
            <img
              src={WalletIcon}
              alt="WalletIcon"
              style={{ width: 75, height: 75 }}
            />
            <div className="px-4">
              <Typography
                gutterBottom
                variant="h5"
                component="div"
                sx={{ fontSize: 24, fontWeight: 400 }}
              >
                Your Wallet Funds
              </Typography>
              <Typography
                gutterBottom
                sx={{ fontSize: "35px", fontWeight: 400, color: "black" }}
              >
                <img src={AOGSymbol} /> {wallet.balance || "0.00"}
              </Typography>
            </div>
          </div>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={6}>
              <Button
                variant="contained"
                color="secondary"
                sx={{
                  mt: 2,
                  p: 2,
                  background: "#a33d3d",
                  textTransform: "capitalize",
                  fontSize: "18px",
                }}
                startIcon={
                  <img
                    src={MoneyReciveLightIcon}
                    alt="Money Recive Icon"
                    style={{ width: 24, height: 24 }}
                  />
                }
                onClick={() => {
                  if (!identity?.isBlackListed) {
                    setcashOutDialogOpen(true);
                  }
                }}
                fullWidth
                disabled={identity?.isBlackListed}
              >
                Cash out
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={6}>
              <Button
                variant="contained"
                color="secondary"
                sx={{
                  mt: 2,
                  p: 2,
                  background: "#683DA3",
                  textTransform: "capitalize",
                  fontSize: "18px",
                }}
                fullWidth
                onClick={() => {
                  if (!identity?.isBlackListed) {
                    setPaymentDialogOpen(true);
                  }
                }}
                disabled={identity?.isBlackListed}
              >
                Add Payment Methods
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      <Card
        variant="outlined"
        sx={{
          mt: 2,
          backgroundColor: "#e3e3e3",
        }}
      >
        {" "}
        <CardContent>
          <Typography
            gutterBottom
            variant="h6"
            component="div"
            sx={{ mt: 4, fontWeight: 500 }}
          >
            Payment Methods
          </Typography>
          <Grid container spacing={2} sx={{ mt: 2 }}>
            {paymentMethods.map((method) => (
              <Grid item xs={12} sm={6} md={4} key={method.name}>
                <Paper
                  elevation={3}
                  sx={{
                    p: 2,
                    textAlign: "center",
                    backgroundColor: "#f7f7f7",
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 500 }}>
                    {method.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ wordBreak: "break-word", mt: 1 }}
                  >
                    {method.id}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>{" "}
        </CardContent>
      </Card>
      <Card
        variant="elevation"
        elevation={3}
        sx={{
          mt: 2,
          backgroundColor: "#ffffff",
          borderRadius: 2,
          padding: { xs: 1.5, sm: 2 },
          boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
        }}
      >
        <CardContent>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              mb: 2,
              fontSize: { xs: "16px", sm: "20px" },
              color: "#4a4a4a",
              borderBottom: "2px solid #dedede",
              paddingBottom: 1,
            }}
          >
            Wallet Transactions
          </Typography>

          {/* Ensure horizontal scrolling for smaller screens */}
          <div
            style={{
              overflowX: "scroll", // Enable horizontal scrolling
              width: "100%", // Full-width container
              marginBottom: "16px", // Spacing below the table,
              height: "100%",
            }}
          >
            {loadingTransactions ? (
                <Box style={{textAlign:"center"}}>Loading data...</Box>
            ) : (
              <ListContextProvider
                value={{
                  data: transactions,
                  total: totalRecords,
                  page,
                  perPage: pageSize,
                  setPage: handlePageChange,
                  setPerPage: handlePageSizeChange,
                }}
              >
                <div
                  style={{
                    overflowX: "auto", // Enable horizontal scrolling
                    overflowY: "auto",
                    width: "100%", // Full-width container
                    marginBottom: "16px", // Spacing below the table
                  }}
                >
                  <Datagrid
                    sx={{
                      minWidth: "900px", // Set a minimum width to ensure all columns fit
                      "& .RaDatagrid-row": {
                        borderBottom: "1px solid #eaeaea",
                        "&:hover": {
                          backgroundColor: "#f9f9f9",
                        },
                      },
                      "& .RaDatagrid-header": {
                        backgroundColor: "#f5f5f5",
                        fontWeight: 600,
                        borderBottom: "2px solid #dedede",
                      },
                      "& .RaDatagrid-row > div, & .RaDatagrid-header > div": {
                        padding: "8px", // Add consistent padding for readability
                        textAlign: "left", // Align content to the left
                      },
                      "@media (max-width: 600px)": {
                        // Ensure responsiveness for mobile screens
                        "& .RaDatagrid-row > div, & .RaDatagrid-header > div": {
                          padding: "6px", // Reduce padding on mobile
                        },
                      },
                    }}
                  >
                    <FunctionField
                      label="Type"
                      source="type"
                      render={(record) => {
                        const isCashOut = record?.isCashOut === true;
                        return (
                          <span
                            style={{
                              color: isCashOut ? "#FF0000" : "#00A000",
                              padding: "8px 8px",
                              border: `1px solid ${
                                isCashOut ? "#FF0000" : "#00A000"
                              }`,
                              borderRadius: "25px",
                              display: "inline-flex",
                              alignItems: "center",
                              fontWeight: "bold",
                            }}
                          >
                            {isCashOut ? "W" : "D"}
                          </span>
                        );
                      }}
                    />
                    <FunctionField
                      label="Mode"
                      source="type"
                      render={(record) => {
                        const isCashOut = record?.isCashOut === true;
                        const useWallet = record?.useWallet === true;
                        return (
                          <span
                            style={{
                              display: "inline-block",
                              padding: "6px 12px",
                              fontSize: "14px",
                              fontWeight: "bold",
                              color: "#ffffff",
                              backgroundColor: isCashOut
                                ? "#4A90E2"
                                : useWallet
                                ? "#63bd44"
                                : "#8E44AD",
                              borderRadius: "15px",
                              boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
                            }}
                          >
                            {isCashOut
                              ? "CashOut"
                              : useWallet
                              ? "Recharge"
                              : "Redeem"}
                          </span>
                        );
                      }}
                    />
                    <TextField source="transactionAmount" label="Amount" />
                    <FunctionField
                      label="Status"
                      source="status"
                      render={(record) => {
                        const getColor = (status) => {
                          switch (status) {
                            case 4:
                            case 8:
                            case 2:
                              return "green";
                            case 5:
                              return "red";
                            case 6:
                              return "orange";
                            case 7:
                            case 13:
                              return "red";
                            case 11:
                              return "orange";
                            case 12:
                              return "green";
                            default:
                              return "black";
                          }
                        };
                        const statusMessage = {
                          2: "Recharge Successful",
                          4: "Success",
                          5: "Fail",
                          6: "Pending Approval",
                          7: "Redeem Rejected",
                          8: "Redeem Successful",
                          9: "Redeem Expired",
                          11: "In - Progress",
                          12: "Cashout Successful",
                          13: "Cashout Rejected",
                        }[record.status];

                        return (
                          <span
                            style={{
                              color: getColor(record.status),
                              padding: "4px 8px",
                              border: `1px solid ${getColor(record.status)}`,
                              borderRadius: "25px",
                              display: "inline-block",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {statusMessage}
                          </span>
                        );
                      }}
                    />
                    <DateField
                      source="transactionDate"
                      label="Date Created"
                      showTime
                    />
                    <TextField source="remark" label="Remark" />
                    <TextField
                      source="redeemRemarks"
                      label="Redeem / Cashout Remark"
                    />
                  </Datagrid>
                </div>
                <Box
                  sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}
                >
                  <TablePagination
                    component="div"
                    count={Math.ceil((totalRecords || 0) / pageSize)}
                    page={page}
                    //onPageChange={handleChangePage}
                    rowsPerPage={pageSize}
                    onRowsPerPageChange={(event) => {
                      setPageSize(parseInt(event.target.value, 10));
                      setPage(1);
                    }}
                    nextIconButtonProps={{ style: { display: "none" } }}
                    backIconButtonProps={{ style: { display: "none" } }}
                  />
                  <Pagination
                    page={page}
                    count={Math.ceil((totalRecords || 0) / pageSize)} // Total pages
                    onChange={(event, newPage) => setPage(newPage)}
                    rowsPerPage={pageSize}
                    onRowsPerPageChange={(event) => {
                      setPageSize(parseInt(event.target.value, 10));
                      setPage(1);
                    }}
                    variant="outlined"
                    color="secondary"
                  />
                </Box>
              </ListContextProvider>
            )}
          </div>
        </CardContent>
      </Card>
      <CashOutDialog
        open={cashOutDialogOpen}
        onClose={() => setcashOutDialogOpen(false)}
        record={transformedIdentity}
        handleRefresh={() => {
          fetchTransactions(page, pageSize);
          WalletService();
        }}
        wallet={wallet}
      />
      <AddPaymentMethods
        wallet={wallet}
        open={paymentDialogOpen}
        onClose={() => setPaymentDialogOpen(false)}
        record={transformedIdentity}
        handleRefresh={handleRefresh}
      />
    </React.Fragment>
  );
};
