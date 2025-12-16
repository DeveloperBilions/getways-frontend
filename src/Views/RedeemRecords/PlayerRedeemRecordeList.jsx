import React, { useEffect, useState } from "react";
// react admin
import { useGetIdentity, useRefresh, useListController } from "react-admin";
import { useNavigate } from "react-router-dom";
// dialog
import { Menu, MenuItem } from "@mui/material";
import Info from "../../Assets/icons/Info.svg";

// mui
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
} from "@mui/material";
// mui icon
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
// loader
import { Loader } from "../Loader";
import tick from "../../Assets/icons/tick.svg";
import Dropdown from "../../Assets/icons/Dropdown.svg";
import filter from "../../Assets/icons/filter.svg";

import { Parse } from "parse";
import CustomPagination from "../Common/CustomPagination";

// Initialize Parse
Parse.initialize(process.env.REACT_APP_APPID, process.env.REACT_APP_MASTER_KEY);
Parse.serverURL = process.env.REACT_APP_URL;

const useWindowWidth = () => {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return width;
};

export const PlayerRedeemRecordsList = (props) => {
  const listContext = useListController({
    ...props,
    filter: { type: "redeem", status: 6 },
    sort: { field: "transactionDate", order: "DESC" },
  });
  const {
    data,
    isLoading,
    total,
    page,
    perPage,
    setPage,
    setPerPage,
    setFilters,
  } = listContext;
  console.log(data, "data");

  const navigate = useNavigate();
  const refresh = useRefresh();
  const { identity } = useGetIdentity();
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchBy, setSearchBy] = useState("transactionAmount");
  const [menuAnchor, setMenuAnchor] = useState(null);
  const isMobile = useMediaQuery("(max-width: 900px)");

  const screenWidth = useWindowWidth();

  const role = localStorage.getItem("role");

  if (!role) {
    navigate("/login");
  }

  const mapStatus = (status) => {
    switch (status) {
      case 4:
        return "Success";
      case 5:
        return "Fail";
      case 6:
        return "Pending Approval";
      case 7:
        return "Rejected";
      case 8:
        return "Redeem Successfully";
      case 9:
        return "Expired";
      case 11:
        return "Cashouts";
      case 12:
        return "Cashout Successfully";
      case 13:
        return "Cashout Reject";
      default:
        return "Unknown Status";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 4:
      case 8:
      case 12:
        return {
          backgroundColor: "#EBFFEC",
          color: "#166534",
          border: "1px solid #60FF6D",
        };
      case 5:
      case 7:
      case 9:
      case 13:
        return {
          backgroundColor: "#FFEBEB",
          color: "#B91616",
          border: "1px solid #FF6060",
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

  const handleRefresh = async () => {
    setLoading(true);
    refresh();
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    const newFilter = { type: "redeem", status: 6 };
    setFilters(newFilter, false);
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
    const newFilters = { type: "redeem" };

    if (query) {
      newFilters[searchBy] = query;
    }

    setFilters(newFilters, false);
  };

  const filterChoices = [
    { id: "transactionAmount", name: "Redeem" },
    { id: "remark", name: "Remark" },
  ];

  const filterLabel = (val) => {
    const choice = filterChoices.find((choice) => choice.id === val);
    return choice?.name;
  }

  const handleMenuOpen = (event) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleMenuItemClick = (id) => {
    setSearchBy(id);
    handleMenuClose();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + "," + date.toLocaleTimeString();
  };

  if (isLoading || loading) {
    return <Loader />;
  }

  // Convert data object to array for rendering
  const dataArray = data ? Object.values(data) : [];

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
            onClick={() => navigate("/playerDashboard")}
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
              Pending Redeem Request
            </Typography>
            <Typography
              sx={{ fontWeight: 400, fontSize: { xs: "12px", sm: "14px" } }}
              color="text.secondary"
            >
              Total transactions: {total}
            </Typography>
          </Box>
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            alignItems: { xs: "flex-start", sm: "flex-end" },
            gap: { xs: 1, sm: 0 },
          }}
        >
          <Typography
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 400,
              fontSize: "14px",
              verticalAlign: "middle",
              color: "#867000",
              padding: "4px 12px",
              backgroundColor: "#FFF8D5",
              borderRadius: "4px",
            }}
          >
            {/* <InfoIcon style={{ marginRight: "4px" }} /> */}
            <img
              src={Info}
              alt="info"
              style={{ marginRight: "8px", verticalAlign: "middle" }}
            />
            Redeems may take up to 2 hours
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontSize: { xs: "12px", sm: "14px" },
              mt: { xs: 1, sm: 0 },
            }}
          >
            Agent: {identity?.userParentName}
          </Typography>
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
          placeholder={`Search By ${filterLabel(searchBy)}`}
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
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
          onClick={handleMenuOpen}
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
            {filterLabel(searchBy) || "Filter by"}
          </Box>
          <img src={Dropdown} alt="dropdown" />
        </Button>

        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleMenuClose}
          sx={{
            marginTop: "8px",
            "& .MuiPaper-root": {
              paddingLeft: "8px",
              paddingRight: "8px",
              width: { xs: "100%", sm: "240px" },
            },
          }}
        >

          {filterChoices.map((choice) => (
            <MenuItem
              key={choice.id}
              onClick={() => handleMenuItemClick(choice.id)}
              sx={{
                bgcolor: searchBy === choice.id ? "#F6F4F4" : "white",
                display: "flex",
                alignItems: "center",
                width: "100%",
                borderRadius: "8px",
                mb: "2px",
                paddingLeft: "16px",
                paddingRight: "16px",
              }}
            >
              {searchBy === choice.id ? (
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

      {dataArray.length === 0 ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            py: 8,
            backgroundColor: "#FFFFFF",
            borderRadius: 2,
            border: "1px solid #E7E7E7",
          }}
        >
          <Typography
            sx={{
              fontSize: { xs: "16px", sm: "18px" },
              fontWeight: 500,
              color: "#6B7280",
              mb: 1,
            }}
          >
            No Redeem Records Found
          </Typography>
          <Typography
            sx={{
              fontSize: { xs: "12px", sm: "14px" },
              color: "#9CA3AF",
            }}
          >
            There are no pending redeem requests at the moment.
          </Typography>
        </Box>
      ) : isMobile ? (
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
                boxShadow: 1,
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
                borderColor: "#CFD4DB",
              }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{ fontWeight: 600, backgroundColor: "#FFFFFF" }}
                    >
                      Redeem Date
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: 600, backgroundColor: "#FFFFFF" }}
                    >
                      Redeemed
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: 600, backgroundColor: "#FFFFFF" }}
                    >
                      Service Fee
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: 600, backgroundColor: "#FFFFFF" }}
                    >
                      Remark
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: 600, backgroundColor: "#FFFFFF" }}
                    >
                      Status
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: 600, backgroundColor: "#FFFFFF" }}
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dataArray.map((record) => (
                    <TableRow
                      key={record.id}
                      sx={{ "&:hover": { backgroundColor: "#F8F9FA" } }}
                    >
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
                          {record.transactionAmount}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: "14px" }}>
                          {record.remark ? record.remark : "-"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: "14px" }}>
                          {record.redeemServiceFee
                            ? `${record.redeemServiceFee}%`
                            : "-"}
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
                          }}
                        />
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
            sx={{ borderRadius: 2, boxShadow: 1 }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{ fontWeight: 600, backgroundColor: "#FFFFFF" }}
                  >
                    Redeem Date
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 600, backgroundColor: "#FFFFFF" }}
                  >
                    Redeemed
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 600, backgroundColor: "#FFFFFF" }}
                  >
                    Service Fee
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 600, backgroundColor: "#FFFFFF" }}
                  >
                    Remark
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 600, backgroundColor: "#FFFFFF" }}
                  >
                    Status
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 600, backgroundColor: "#FFFFFF" }}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dataArray.map((record) => (
                  <TableRow
                    key={record.id}
                    sx={{ "&:hover": { backgroundColor: "#F8F9FA" } }}
                  >
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
                        {record.transactionAmount}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: "14px" }}>
                        {record.redeemServiceFee
                          ? `${record.redeemServiceFee}%`
                          : "-"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: "14px" }}>
                        {record.remark ? record.remark : "-"}
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
                        }}
                      />
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
