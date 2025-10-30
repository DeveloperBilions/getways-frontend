import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Chip,
  Button,
  Typography,
  Box,
  useMediaQuery,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import { Loader } from "../Loader";
import { walletService } from "../../Provider/WalletManagement";
import CustomPagination from "../Common/CustomPagination";
import tick from "../../Assets/icons/tick.svg";
import Dropdown from "../../Assets/icons/Dropdown.svg";
import filter from "../../Assets/icons/filter.svg";

const useWindowWidth = () => {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return width;
};

export const Wallet = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  // const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [statusMenuAnchor, setStatusMenuAnchor] = useState(null);
  const [totalTransaction, setTotalTransaction] = useState(0);
  const [initialLoading, setInitialLoading] = useState(true);

  const isMobile = useMediaQuery("(max-width: 900px)");
  const screenWidth = useWindowWidth();

  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("id");

  useEffect(() => {
    if (!role) {
      navigate("/login");
    }
  }, [role, navigate]);

  useEffect(() => {
    fetchTransactions();
  }, [page, perPage, searchQuery, statusFilter]);

  async function fetchTransactions() {
    // setLoadingTransactions(true);
    try {
      const params = {
        page,
        limit: perPage,
        userId: userId,
      };

      // Add search query if exists
      if (searchQuery && searchQuery.trim()) {
        params.transactionAmount = searchQuery;
      }

      // Add status filter if not "all"
      if (statusFilter !== "all") {
        params.status = parseInt(statusFilter);
      }

      const response = await walletService.getCashoutTransactions(params);
      setTransactions(response.transactions || []);
      setTotal(response.pagination?.count || 0);
      setTotalTransaction(response.totalTransaction || 0);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
      setTransactions([]);
      setTotal(0);
    } finally {
      // setLoadingTransactions(false);
      setInitialLoading(false);
    }
  }

  const handleRefresh = async () => {
    setLoading(true);
    setSearchQuery("");
    setStatusFilter("all");
    setPage(1);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setPage(1);
  };

  const statusChoices = [
    { id: "all", name: "All Status" },
    { id: "2", name: "Recharge Successful" },
    { id: "4", name: "Success" },
    { id: "5", name: "Fail" },
    { id: "6", name: "Pending Approval" },
    { id: "7", name: "Redeem Rejected" },
    { id: "8", name: "Redeem Successful" },
    { id: "11", name: "In-Progress" },
    { id: "12", name: "Cashout Successful" },
    { id: "13", name: "Cashout Rejected" },
  ];

  const statusLabel = (val) => {
    const choice = statusChoices.find((choice) => choice.id === val);
    return choice?.name;
  };

  const handleStatusMenuOpen = (event) => {
    setStatusMenuAnchor(event.currentTarget);
  };

  const handleStatusMenuClose = () => {
    setStatusMenuAnchor(null);
  };

  const handleStatusMenuItemClick = (id) => {
    setStatusFilter(id);
    setPage(1);
    handleStatusMenuClose();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + "," + date.toLocaleTimeString();
  };

  const mapStatus = (status) => {
    const statusMessage = {
      2: "Recharge Successful",
      3: "Coins Credited",
      4: "Success",
      5: "Fail",
      6: "Pending Approval",
      7: "Redeem Rejected",
      8: "Redeem Successful",
      9: "Redeem Expired",
      11: "In-Progress",
      12: "Cashout Successful",
      13: "Cashout Rejected",
      14: "Refunded"
    };
    return statusMessage[status] || "Unknown Status";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 2:
      case 4:
      case 8:
      case 12:
        return {
          backgroundColor: "#DCFCE7",
          color: "#166534",
        };
      case 5:
      case 7:
      case 9:
      case 13:
        return {
          backgroundColor: "#FEE2E2",
          color: "#B91616",
        };
      case 6:
      case 11:
        return {
          backgroundColor: "#FFEDD5",
          color: "#C2410C",
        };
      default:
        return {
          backgroundColor: "#E9ECEF",
          color: "#495057",
          border: "1px solid #DEE2E6",
        };
    }
  };

  const getTypeLabel = (record) => {
    return record?.isCashOut === true ? "W" : "D";
  };

  const getTypeColor = (record) => {
    const isCashOut = record?.isCashOut === true;
    return {
      color: "#FFFFFF",
      backgroundColor: isCashOut ? "#FF0310" : "#00A000",
    };
  };

  const getModeLabel = (record) => {
    const isCashOut = record?.isCashOut === true;
    const useWallet = record?.useWallet === true;
    return isCashOut ? "Cashout" : useWallet ? "Recharge" : "Redeem";
  };

  const getModeColor = (record) => {
    const isCashOut = record?.isCashOut === true;
    const useWallet = record?.useWallet === true;
    return {
      backgroundColor: isCashOut
        ? "#1639B9"
        : useWallet
        ? "#166534"
        : "#B916B9",
      color: "#ffffff",
    };
  };

  if (loading || initialLoading) {
    return <Loader />;
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          backgroundColor: "#FFFFFF",
          justifyContent: "space-between",
          alignItems: { xs: "none", sm: "center" },
          mb: "16px",
          border: "1px solid #E7E7E7",
          borderRadius: 2,
          p: { xs: "12px", sm: "16px" },
          gap: { xs: 2, sm: 0 },
        }}
      >
        <Box
          sx={{ display: "flex", alignItems: "center", gap: { xs: 1, sm: 2 } }}
        >
          <IconButton
            onClick={() => navigate(-1)}
            size="small"
            sx={{ ":hover": { backgroundColor: "#FFFFFF" } }}
          >
            <ArrowBackIcon sx={{ mr: 1 }} />
            <Typography
              sx={{ fontWeight: 500, fontSize: { xs: "12px", sm: "14px" } }}
              color="text.secondary"
            >
              Back
            </Typography>
          </IconButton>
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            <Typography
              sx={{ fontWeight: 500, fontSize: { xs: "16px", sm: "20px" } }}
            >
              Wallet Transactions
            </Typography>
            <Typography
              sx={{ fontWeight: 400, fontSize: { xs: "12px", sm: "14px" } }}
              color="text.secondary"
            >
              Total transactions: {totalTransaction}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Controls */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          backgroundColor: "#FFFFFF",
          gap: { xs: 2, sm: 2 },
          mb: "16px",
          p: { xs: 1.5, sm: 2 },
          borderRadius: 2,
          alignItems: { xs: "stretch", sm: "center" },
          border: "1px solid #E7E7E7",
        }}
      >
        <TextField
          placeholder={`Search By transaction Amount`}
          value={searchQuery}
          onChange={(e) => {
            const value = e.target.value;
            if (value === "" || /^\d*\.?\d*$/.test(value)) {
              handleSearch(value);
            }
          }}
          size="small"
          sx={{
            minWidth: { xs: "100%", sm: 300 },
            color: "#0000008F",
          }}
          InputProps={{
            sx: {
              fontSize: { xs: "12px", sm: "14px" },
              fontWeight: 400,
              fontFamily: "Inter",
              minHeight: { xs: "36px", sm: "43px" },
            },
            endAdornment: (
              <InputAdornment position="end">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />

        <Button
          onClick={handleStatusMenuOpen}
          sx={{
            fontSize: { xs: "12px", sm: "14px" },
            fontWeight: 400,
            fontFamily: "Inter",
            color: "#000000",
            textTransform: "none",
            justifyContent: "space-between",
            padding: "8px 14px",
            border: "1px solid rgba(0, 0, 0, 0.23)",
            borderRadius: "4px",
            minHeight: { xs: "36px", sm: "40px" },
            minWidth: { xs: "100%", sm: 160 },
            "&:hover": {
              backgroundColor: "rgba(0, 0, 0, 0.04)",
              border: "1px solid rgba(0, 0, 0, 0.23)",
            },
          }}
        >
          <Box>
            <img src={filter} alt="filter" style={{ marginRight: "8px" }} />
            {statusLabel(statusFilter)}
          </Box>
          <img src={Dropdown} alt="dropdown" />
        </Button>

        <Menu
          anchorEl={statusMenuAnchor}
          open={Boolean(statusMenuAnchor)}
          onClose={handleStatusMenuClose}
          sx={{
            marginTop: "8px",
            "& .MuiPaper-root": {
              paddingLeft: "8px",
              paddingRight: "8px",
              width: { xs: "100%", sm: "240px" },
            },
          }}
        >
          {statusChoices.map((choice) => (
            <MenuItem
              key={choice.id}
              onClick={() => handleStatusMenuItemClick(choice.id)}
              sx={{
                bgcolor: statusFilter === choice.id ? "#F6F4F4" : "white",
                display: "flex",
                alignItems: "center",
                width: "100%",
                borderRadius: "8px",
                mb: "2px",
                paddingLeft: "16px",
                paddingRight: "16px",
              }}
            >
              {statusFilter === choice.id ? (
                <img
                  src={tick}
                  alt="tick"
                  style={{
                    marginRight: "12px",
                    width: "16px",
                    height: "16px",
                  }}
                />
              ) : (
                <div style={{ width: "28px" }} />
              )}
              <Typography
                sx={{
                  fontSize: { xs: "14px", sm: "16px" },
                  fontWeight: 400,
                }}
              >
                {choice.name}
              </Typography>
            </MenuItem>
          ))}
        </Menu>

        <Box
          sx={{ ml: { xs: 0, sm: "auto" }, width: { xs: "100%", sm: "auto" } }}
        >
          <Button
            variant="contained"
            onClick={handleRefresh}
            disabled={loading}
            sx={{
              backgroundColor: "#2E5BFF",
              "&:hover": { backgroundColor: "#4338CA" },
              borderRadius: 2,
              width: { xs: "100%", sm: "auto" },
              minHeight: { xs: "36px", sm: "40px" },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography
                sx={{
                  fontWeight: 500,
                  fontSize: { xs: "14px", sm: "18px" },
                  textTransform: "none",
                }}
              >
                Refresh
              </Typography>
            </Box>
          </Button>
        </Box>
      </Box>

      {isMobile ? (
        <Box
          sx={{
            width: "100%",
            overflowX: "auto",
          }}
        >
          <Box
            style={{
              width: "100%",
              position: "relative",
              maxWidth: `${screenWidth - 64.96}px`,
            }}
          >
            <TableContainer
              component={Paper}
              sx={{
                borderRadius: 2,
                boxShadow: "none",
                overflowX: "auto",
                "& .MuiTable-root": {
                  width: "100%",
                },
                "& .MuiTableCell-head": {
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                },
                "& .MuiTableCell-body": {
                  whiteSpace: "nowrap",
                },
              }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{ fontWeight: 600, backgroundColor: "#FFFFFF" }}
                    >
                      Type
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: 600, backgroundColor: "#FFFFFF" }}
                    >
                      Mode
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: 600, backgroundColor: "#FFFFFF" }}
                    >
                      Amount
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: 600, backgroundColor: "#FFFFFF" }}
                    >
                      Status
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: 600, backgroundColor: "#FFFFFF" }}
                    >
                      Date Created
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: 600, backgroundColor: "#FFFFFF" }}
                    >
                      Remark
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions.map((record, index) => (
                    <TableRow
                      key={record.id || index}
                      sx={{ "&:hover": { backgroundColor: "#F8F9FA" } }}
                    >
                      <TableCell>
                        <Chip
                          label={getTypeLabel(record)}
                          size="small"
                          sx={{
                            ...getTypeColor(record),
                            fontWeight: 600,
                            borderRadius: "50%",
                            width: "32px",
                            height: "32px",
                            fontSize: "14px",
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getModeLabel(record)}
                          size="small"
                          sx={{
                            ...getModeColor(record),
                            fontWeight: 400,
                            borderRadius: 4,
                            fontSize: "14px",
                            padding: "4px",
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: "14px" }}>
                          {record.transactionAmount}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={mapStatus(record.status)}
                          size="small"
                          sx={{
                            ...getStatusColor(record.status),
                            fontWeight: 400,
                            borderRadius: 4,
                            fontSize: "14px",
                            padding: "4px",
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", flexDirection: "column" }}>
                          <Typography sx={{ fontSize: "14px" }}>
                            {formatDate(record.transactionDate).split(",")[0]}
                            {","}
                          </Typography>
                          <Typography sx={{ fontSize: "14px" }}>
                            {formatDate(record.transactionDate).split(",")[1]}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: "14px" }}>
                          {record.redeemRemarks ? record.redeemRemarks : "-"}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                width: "100%",
                mt: 3,
              }}
            >
              <CustomPagination
                page={page}
                perPage={perPage}
                total={total}
                setPage={setPage}
                setPerPage={setPerPage}
                player={true}
              />
            </Box>
          </Box>
        </Box>
      ) : (
        <>
          <TableContainer
            component={Paper}
            sx={{ borderRadius: 2, boxShadow: "none" }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{ fontWeight: 600, backgroundColor: "#FFFFFF" }}
                  >
                    Type
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 600, backgroundColor: "#FFFFFF" }}
                  >
                    Mode
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 600, backgroundColor: "#FFFFFF" }}
                  >
                    Amount
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 600, backgroundColor: "#FFFFFF" }}
                  >
                    Status
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 600, backgroundColor: "#FFFFFF" }}
                  >
                    Date Created
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 600, backgroundColor: "#FFFFFF" }}
                  >
                    Remark
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map((record, index) => (
                  <TableRow
                    key={record.id || index}
                    sx={{ "&:hover": { backgroundColor: "#F8F9FA" } }}
                  >
                    <TableCell>
                      <Chip
                        label={getTypeLabel(record)}
                        size="small"
                        sx={{
                          ...getTypeColor(record),
                          fontWeight: 600,
                          borderRadius: "50%",
                          width: "32px",
                          height: "32px",
                          fontSize: "14px",
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getModeLabel(record)}
                        size="small"
                        sx={{
                          ...getModeColor(record),
                          fontWeight: 400,
                          borderRadius: 4,
                          fontSize: "14px",
                          padding: "4px",
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: "14px" }}>
                        {record.transactionAmount}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={mapStatus(record.status)}
                        size="small"
                        sx={{
                          ...getStatusColor(record.status),
                          fontWeight: 400,
                          borderRadius: 4,
                          fontSize: "14px",
                          padding: "4px",
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", flexDirection: "column" }}>
                        <Typography sx={{ fontSize: "14px" }}>
                          {formatDate(record.transactionDate).split(",")[0]}
                          {","}
                        </Typography>
                        <Typography sx={{ fontSize: "14px" }}>
                          {formatDate(record.transactionDate).split(",")[1]}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: "14px" }}>
                        {record.redeemRemarks ? record.redeemRemarks : "-"}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              width: "100%",
              mt: 3,
            }}
          >
            <CustomPagination
              page={page}
              perPage={perPage}
              total={total}
              setPage={setPage}
              setPerPage={setPerPage}
              player={true}
            />
          </Box>
        </>
      )}
    </Box>
  );
};
