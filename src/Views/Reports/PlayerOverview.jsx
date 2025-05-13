import {
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  Box,
  Autocomplete,
  InputAdornment,
} from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import { PieChart } from "@mui/x-charts/PieChart";
import { useGetIdentity } from "react-admin";
import React, { useCallback, useEffect, useState } from "react";
import { fetchTransactionsofPlayer } from "../../Utils/utils";
import debounce from "lodash/debounce";
import { dataProvider } from "../../Provider/parseDataProvider";
import CustomPagination from "../Common/CustomPagination";
import SearchIcon from "@mui/icons-material/Search";
import downloadDark from "../../Assets/icons/downloadDark.svg";
import jsPDF from "jspdf";

const PlayerOverview = () => {
  const [playerData, setPlayerData] = useState([]); // For Player transaction report
  const [filteredPlayerData, setFilteredPlayerData] = useState([]);
  const [playerRechargeData, setPlayerRechargeData] = useState([]); // For Player recharge report
  const [playerRedeemData, setPlayerRedeemData] = useState([]); // For Player recharge report
  const [playerCashoutData, setPlayerCashoutData] = useState([]); // For Player recharge report
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { identity } = useGetIdentity();
  const [sortColumn, setSortColumn] = useState("totalRecharge");
  const [sortOrder, setSortOrder] = useState("desc");
  const today = new Date().toISOString().split("T")[0]; // Format as YYYY-MM-DD
  const startDateLimit = "2024-12-01"; // Start date limit: 1st December 2025
  const [choices, setChoices] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userLoading, setUserLoading] = useState(false);
  const perPage = 10;
  const [noDataFound, setNoDataFound] = useState(false);
  const [allPlayerData, setAllPlayerData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPlayerData, setCurrentPlayerData] = useState([]);

  useEffect(() => {
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;

    setCurrentPlayerData(filteredPlayerData.slice(startIndex, endIndex));
  }, [page, rowsPerPage, filteredPlayerData]);

  useEffect(() => {
    setPage(1);
  }, [filteredPlayerData]);

  useEffect(() => {
    // Filter data based on search term whenever rechargeData or searchTerm changes
    if (searchTerm.trim() === "") {
      setFilteredPlayerData(allPlayerData);
    } else {
      const filtered = allPlayerData.filter((item) =>
        item.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPlayerData(filtered);
    }
  }, [searchTerm, setFilteredPlayerData]);

  const fetchUsers = async (search = "", pageNum = 1) => {
    setUserLoading(true);
    try {
      const { data } = await dataProvider.getList("users", {
        pagination: { page: pageNum, perPage },
        sort: { field: "username", order: "ASC" },
        filter: search
          ? {
              username: search,
              $or: [{ userReferralCode: "" }, { userReferralCode: null }],
              roleName: "Agent",
            }
          : {
              $or: [{ userReferralCode: "" }, { userReferralCode: null }],
              roleName: "Agent",
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
    setUserLoading(false);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setPage(1);
      // Fetch Player recharge report
      const playerTransactionResult = await fetchTransactionsofPlayer({
        startDate: fromDate,
        endDate: toDate,
        userParentId: selectedUser?.id,
      });

      setPlayerData(playerTransactionResult?.data || []);
      if (!playerTransactionResult?.data.length) {
        setNoDataFound(true);
        setAllPlayerData([]);
        setFilteredPlayerData([]);
        return;
      } else {
        setNoDataFound(false);
        setAllPlayerData(playerTransactionResult?.data);
        setFilteredPlayerData(playerTransactionResult?.data);
      }
      // Sort playerTransactionResult by totalRecharge and select top 30 players
      const sortedPlayerRechargeData = playerTransactionResult?.data
        .sort((a, b) => b.totalRecharge - a.totalRecharge)
        .slice(0, 30);
      setPlayerRechargeData(sortedPlayerRechargeData);
      const sortedPlayerRedeemData = playerTransactionResult?.data
        .sort((a, b) => b.totalRedeem - a.totalRedeem)
        .slice(0, 30);
      setPlayerRedeemData(sortedPlayerRedeemData);
      const sortedPlayerCashoutData = playerTransactionResult?.data
        .sort((a, b) => b.totalCashout - a.totalCashout)
        .slice(0, 30);
      setPlayerCashoutData(sortedPlayerCashoutData);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleSubmit = () => {
    setSubmitted(true);
    setPage(1);
    setSearchTerm("");
    fetchData();
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const handleExportPDF = async () => {
    if (!filteredPlayerData || filteredPlayerData.length === 0) {
      console.warn("No data to export.");
      return;
    }
    const doc = new jsPDF();
    doc.text("Player Transaction Report", 10, 10);
    doc.autoTable({
      head: [
        [
          "No",
          "Player Name",
          "Total Recharge",
          "Total Redeem",
          "Total Cashout",
        ],
      ],
      body: filteredPlayerData.map((row, index) => [
        index + 1,
        row.username,
        row.totalRecharge,
        row.totalRedeem,
        row.totalCashout,
      ]),
    });
    doc.save("PlayerTransactionReport.pdf");
  };

  // Calculate totals for PieChart
  const calculateTotals = () => {
    if (!playerData.length) return [];

    let totalRecharge = 0;
    let totalRedeem = 0;
    let totalCashout = 0;

    playerData.forEach((username) => {
      totalRecharge += username.totalRecharge;
      totalRedeem += username.totalRedeem;
      totalCashout += username.totalCashout;
    });

    return [
      {
        id: 0,
        value: totalRecharge,
        label: "Recharge",
        color: "#43A047",
      },
      { id: 1, value: totalRedeem, label: "Redeem", color: "#E53935" },
      { id: 2, value: totalCashout, label: "Cashout", color: "#FB8C00" },
    ];
  };

  const handleSort = (column) => {
    setSortColumn(column);
    setSortOrder((prevSortOrder) => {
      const newSortOrder = prevSortOrder === "asc" ? "desc" : "asc";

      setFilteredPlayerData((prevData) => {
        const sortedData = [...prevData].sort((a, b) => {
          if (a[column] < b[column]) return newSortOrder === "asc" ? -1 : 1;
          if (a[column] > b[column]) return newSortOrder === "asc" ? 1 : -1;
          return 0;
        });
        return sortedData;
      });
      setPage(1);
      return newSortOrder; // Update the state with the new order
    });
  };
  const pieChartData = calculateTotals();

  const handleUserChange = (selectedId) => {
    setSelectedUser(selectedId);
  };

  const debouncedFetchUsers = useCallback(debounce(fetchUsers, 500), []);

  return (
    <>
      {/* Date Filters */}
      {identity?.email === "zen@zen.com" && (
        <>
          <Box   display="flex"
  flexDirection={{ xs: "column", sm: "row" }}
  flexWrap="wrap"
  gap={2}
  alignItems={{ xs: "stretch", sm: "flex-end" }}
  sx={{ mb: 2 }}>
            <Box display="flex" flexDirection="column">
              <Typography
                variant="body2"
                sx={{
                  mb: 0.5,
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#00000099",
                }}
              >
                Agent
              </Typography>
              <Autocomplete
                sx={{ width: { xs: "100%", md: 230 } }}
                options={choices}
                getOptionLabel={(option) => option.optionName}
                isOptionEqualToValue={(option, value) =>
                  option.id === value?.id
                }
                loading={userLoading}
                loadingText="....Loading"
                value={selectedUser}
                onChange={(event, newValue) => handleUserChange(newValue)}
                onInputChange={(event, newInputValue, reason) => {
                  if (reason === "input") {
                    debouncedFetchUsers(newInputValue, 1);
                    setSelectedUser(null);
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Search"
                    variant="outlined"
                    sx={{
                      "& .MuiInputBase-root": {
                        height: "40px",
                      },
                    }}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {userLoading ? <CircularProgress size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
            </Box>
            <Box display="flex" flexDirection="column">
              <Typography
                variant="body2"
                sx={{
                  mb: 0.5,
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#00000099",
                }}
              >
                Start Date<span style={{ color: "red" }}> *</span>
              </Typography>
              <TextField
                required
                sx={{
                  width: { xs: "100%", md: "auto" },
                  "& .MuiInputBase-root": {
                    height: "40px",
                  },
                }}
                type="date"
                InputLabelProps={{ shrink: true }}
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                inputProps={{
                  min: startDateLimit,
                  max: toDate || today,
                }}
              />
            </Box>
            <Box display="flex" flexDirection="column">
              <Typography
                variant="body2"
                sx={{
                  mb: 0.5,
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#00000099",
                }}
              >
                End Date<span style={{ color: "red" }}> *</span>
              </Typography>
              <TextField
                required
                sx={{
                  width: { xs: "100%", md: "auto" },
                  "& .MuiInputBase-root": {
                    height: "40px",
                  },
                }}
                type="date"
                InputLabelProps={{ shrink: true }}
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                inputProps={{
                  min: fromDate || startDateLimit,
                  max: today,
                }}
              />
            </Box>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={loading || !fromDate || !toDate}
            >
              {loading ? "Loading..." : "Apply Filter"}
            </Button>
          </Box>

          {loading ? (
            <Grid container justifyContent="center">
              <CircularProgress />
            </Grid>
          ) : submitted ? (
            !noDataFound ? (
              <>
                {/* PieChart for Totals */}
                <Box sx={{ mt: 4 }}>
                  <CardContent sx={{ p: 0 }}>
                    <Grid>
                      {/* Left Side - Pie Chart */}
                      <Grid item xs={12} md={4}>
                        <Box
                          sx={{
                            p: 2,
                            height: { xs: "auto", md: 422 },
                            minHeight: { xs: 400, md: "unset" },
                            border: "1px solid #E7E7E7",
                            borderRadius: 1,
                            backgroundColor: "#ffffff",
                            width: "100%",
                            gap: 2,
                            display: "flex",
                            flexDirection: "column",
                          }}
                        >
                          <Typography
                            variant="subtitle1"
                            gutterBottom
                            sx={{
                              fontFamily: "Inter",
                              fontWeight: 600,
                              fontSize: "16px",
                              lineHeight: "100%",
                              color: "#333333",
                            }}
                          >
                            Transaction Overview - Total Distribution
                          </Typography>
                          <Typography
                            sx={{
                              fontFamily: "Inter",
                              fontWeight: 400,
                              fontSize: "12px",
                              lineHeight: "150%",
                              color: "#666666",
                              mb: 2,
                            }}
                          >
                            The pie chart below shows the distribution of
                            different transaction types in the system.
                          </Typography>
                          <Box
                            sx={{
                              flex: 1,
                              minHeight: 300,
                              width: "100%",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                          >
                            {pieChartData.length > 0 ? (
                              <PieChart
                                series={[
                                  {
                                    data: pieChartData,
                                    highlightScope: {
                                      faded: "global",
                                      highlighted: "item",
                                    },
                                    faded: {
                                      innerRadius: 30,
                                      additionalRadius: -30,
                                      color: "gray",
                                    },
                                  },
                                ]}
                                height={300}
                                margin={{
                                  top: 0,
                                  bottom: 100,
                                  left: 30,
                                  right: 30,
                                }}
                                legend={{
                                  direction: "row",
                                  position: {
                                    vertical: "bottom",
                                    horizontal: "middle",
                                  },
                                  itemMarkWidth: 10,
                                  itemMarkHeight: 10,
                                }}
                                sx={{
                                  "& .MuiChartsLegend-mark": {
                                    width: "10px !important",
                                    height: "10px !important",
                                  },
                                }}
                              />
                            ) : (
                              <Typography>
                                No data available for pie chart
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </Grid>

                      {/* Right Side - Bar Chart */}
                      <Grid item xs={12} md={8}>
                        <Box
                          sx={{
                            p: 2,
                            height: 422,
                            border: "1px solid #E7E7E7",
                            borderRadius: 1,
                            backgroundColor: "#ffffff",
                            width: "100%",
                            display: "flex",
                            flexDirection: "column",
                          }}
                        >
                          {loading ? (
                            <Grid
                              container
                              justifyContent="center"
                              alignItems="center"
                              sx={{ height: "100%" }}
                            >
                              <CircularProgress />
                            </Grid>
                          ) : (
                            <Box
                              sx={{
                                width: "100%",
                                height: "100%",
                                display: "flex",
                                flexDirection: "column",
                                gap: 2,
                              }}
                            >
                              <Typography
                                variant="subtitle1"
                                gutterBottom
                                sx={{
                                  fontFamily: "Inter",
                                  fontWeight: 600,
                                  fontSize: "16px",
                                  lineHeight: "100%",
                                  color: "#333333",
                                }}
                              >
                                Players Transaction Overview
                              </Typography>
                              <Typography
                                sx={{
                                  fontFamily: "Inter",
                                  fontWeight: 400,
                                  fontSize: "12px",
                                  lineHeight: "150%",
                                  color: "#666666",
                                  mb: 2,
                                }}
                              >
                                The bar chart below shows the transaction
                                distribution among players.
                              </Typography>

                              <Box
                                sx={{
                                  flex: 1,
                                  width: "100%",
                                  position: "relative",
                                }}
                              >
                                <BarChart
                                  xAxis={[
                                    {
                                      data: playerRechargeData
                                        .slice(0, 10)
                                        .map((item) => item.username),
                                      scaleType: "band",
                                      tickLabelStyle: {
                                        fontSize: "7px",
                                      },
                                    },
                                  ]}
                                  series={[
                                    {
                                      data: playerRechargeData
                                        .slice(0, 10)
                                        .map((item) => item.totalRecharge),
                                      label: "Recharge",
                                      color: "#089B2D",
                                    },
                                    {
                                      data: playerRechargeData
                                        .slice(0, 10)
                                        .map((player) => {
                                          const redeemPlayer =
                                            playerRedeemData.find(
                                              (p) =>
                                                p.username === player.username
                                            );
                                          return redeemPlayer
                                            ? redeemPlayer.totalRedeem
                                            : 0;
                                        }),
                                      label: "Redeem",
                                      color: "#F20D33",
                                    },
                                    {
                                      data: playerRechargeData
                                        .slice(0, 10)
                                        .map((player) => {
                                          const cashoutPlayer =
                                            playerCashoutData.find(
                                              (p) =>
                                                p.username === player.username
                                            );
                                          return cashoutPlayer
                                            ? cashoutPlayer.totalCashout
                                            : 0;
                                        }),
                                      label: "Cashout",
                                      color: "#0D46F2",
                                    },
                                  ]}
                                  height={350}
                                  // width={Math.max(600, playerRechargeData.slice(0, 10).length * 60)}
                                  margin={{
                                    left: 70,
                                    right: 30,
                                    top: 30,
                                    bottom:
                                      playerRechargeData.length > 5 ? 100 : 70,
                                  }}
                                  slotProps={{
                                    legend: {
                                      direction: "row",
                                      position: {
                                        vertical: "top",
                                        horizontal: "right",
                                      },
                                      padding: { top: 0 },
                                      itemMarkWidth: 10,
                                      itemMarkHeight: 10,
                                    },
                                  }}
                                  sx={{
                                    "& .MuiChartsAxis-tickLabel": {
                                      fontSize: "0.75rem",
                                    },
                                  }}
                                />
                              </Box>
                            </Box>
                          )}
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Box>

                <Box
  sx={{
    display: "flex",
    flexDirection: { xs: "column", sm: "row" }, // ⬅️ stack on small, row on larger
    justifyContent: "space-between",
    alignItems: { xs: "stretch", sm: "center" },
    gap: 2,
    mt: 2,
    mb: 2,
  }}
>
  <Typography
    variant="h6"
    sx={{ fontWeight: 400, fontSize: "1.25rem" }}
  >
    Player Transaction Report
  </Typography>

  <Box
    sx={{
      display: "flex",
      flexDirection: { xs: "column", sm: "row" },
      alignItems: { xs: "stretch", sm: "center" },
      gap: 2,
      width: { xs: "100%", sm: "auto" },
    }}
  >
    <TextField
      fullWidth
      variant="outlined"
      placeholder="Search"
      value={searchTerm}
      onChange={handleSearch}
      sx={{
        maxWidth: { xs: "100%", sm: 256 },
        "& .MuiOutlinedInput-root": {
          height: "40px",
        },
      }}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <SearchIcon />
          </InputAdornment>
        ),
      }}
    />

    <Button
      fullWidth
      variant="contained"
      color="secondary"
      startIcon={<img src={downloadDark} alt="Export" />}
      onClick={handleExportPDF}
      sx={{
        height: "40px",
        whiteSpace: "nowrap",
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
  </Box>
</Box>

                <TableContainer   sx={{
                    width: { xs: "94%", sm: "100%" }, // mobile: 95% of screen, desktop: 100%
                    maxWidth: { xs: "90vw", sm: "100%" }, // cap width to 95% of viewport on mobile
                    overflowX: "auto", // enable horizontal scroll if needed
                    boxShadow: "none",
                  }} component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          <TableSortLabel
                            active={sortColumn === "username"}
                            direction={sortOrder}
                            onClick={() => handleSort("username")}
                          >
                            Player Name
                          </TableSortLabel>
                        </TableCell>
                        <TableCell>
                          <TableSortLabel
                            active={sortColumn === "totalRecharge"}
                            direction={sortOrder}
                            onClick={() => handleSort("totalRecharge")}
                          >
                            Total Recharge
                          </TableSortLabel>
                        </TableCell>
                        <TableCell>
                          <TableSortLabel
                            active={sortColumn === "totalRedeem"}
                            direction={sortOrder}
                            onClick={() => handleSort("totalRedeem")}
                          >
                            Total Redeem
                          </TableSortLabel>
                        </TableCell>
                        <TableCell>
                          <TableSortLabel
                            active={sortColumn === "totalCashout"}
                            direction={sortOrder}
                            onClick={() => handleSort("totalCashout")}
                          >
                            Total Cashout
                          </TableSortLabel>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {currentPlayerData.slice(0, 30).map((row, index) => (
                        <TableRow key={index}>
                          <TableCell>{row.username}</TableCell>
                          <TableCell>{row.totalRecharge}</TableCell>
                          <TableCell>{row.totalRedeem}</TableCell>
                          <TableCell>{row.totalCashout}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {allPlayerData.length > 0 && (
                    <CustomPagination
                      page={page}
                      perPage={rowsPerPage}
                      total={filteredPlayerData?.length}
                      setPage={setPage}
                      setPerPage={setRowsPerPage}
                    />
                  )}
                </TableContainer>
              </>
            ) : (
              <Grid container justifyContent="center" sx={{ mt: 4 }}>
                <Typography variant="h6" color="error">
                  No data found for the selected filters.
                </Typography>
              </Grid>
            )
          ) : (
            <Grid container justifyContent="center" sx={{ mt: 4 }}>
              <Typography variant="h6" color="info">
                Please apply filter to view data.
              </Typography>
            </Grid>
          )}
        </>
      )}
    </>
  );
};

export default PlayerOverview;
