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

export const PlayerOverview = () => {
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
        label: "Total Recharge",
        color: "#4caf50",
      },
      { id: 1, value: totalRedeem, label: "Total Redeem", color: "#2196f3" },
      { id: 2, value: totalCashout, label: "Total Cashout", color: "#f44336" },
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
          <Box display="flex" sx={{ mb: 1, gap: 2 }} alignItems="end">
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
                <Grid container spacing={2} sx={{ mt: 4 }}>
                  <Grid item xs={12}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Transaction Overview - Total Distribution
                        </Typography>
                        <div
                          style={{
                            height: 400,
                            width: "100%",
                            display: "flex",
                            justifyContent: "center",
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
                              height={400}
                              width={500}
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
                              }}
                            />
                          ) : (
                            <Typography>
                              No data available for pie chart
                            </Typography>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                <Grid container spacing={2} sx={{ mt: 4 }}>
                  <Grid item xs={12}>
                    <Card>
                      <CardContent>
                        {loading ? (
                          <Grid container justifyContent="center">
                            <CircularProgress />
                          </Grid>
                        ) : (
                          <div style={{ overflowX: "auto", width: "100%" }}>
                            <Typography variant="h6" gutterBottom>
                              Top {playerRechargeData.length} Player Recharge
                              Overview
                            </Typography>
                            <BarChart
                              xAxis={[
                                {
                                  data: playerRechargeData.map(
                                    (item) => item.username
                                  ),
                                  scaleType: "band",
                                },
                              ]}
                              series={[
                                {
                                  data: playerRechargeData.map(
                                    (item) => item.totalRecharge
                                  ),
                                  color: "#4caf50",
                                },
                              ]}
                              height={400}
                              width={1200} // Adjust width dynamically
                              margin={{ left: 100, right: 50, bottom: 50 }}
                            />
                            <Typography variant="h6" gutterBottom>
                              Top {playerRedeemData.length} Player Redeem
                              Overview
                            </Typography>
                            <BarChart
                              xAxis={[
                                {
                                  data: playerRedeemData.map(
                                    (item) => item.username
                                  ),
                                  scaleType: "band",
                                },
                              ]}
                              series={[
                                {
                                  data: playerRedeemData.map(
                                    (item) => item.totalRedeem
                                  ),
                                  color: "#4caf50",
                                },
                              ]}
                              height={400}
                              width={1200} // Adjust width dynamically
                              margin={{ left: 100, right: 50, bottom: 50 }}
                            />
                            <Typography variant="h6" gutterBottom>
                              Top {playerCashoutData.length} Player Cashout
                              Overview
                            </Typography>
                            <BarChart
                              xAxis={[
                                {
                                  data: playerCashoutData.map(
                                    (item) => item.username
                                  ),
                                  scaleType: "band",
                                },
                              ]}
                              series={[
                                {
                                  data: playerCashoutData.map(
                                    (item) => item.totalCashout
                                  ),
                                  color: "#4caf50",
                                },
                              ]}
                              height={400}
                              width={1200} // Adjust width dynamically
                              margin={{ left: 100, right: 50, bottom: 50 }}
                            />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    margin: "18px 0px",
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 400, fontSize: "1.25rem" }}
                  >
                    Player Transaction Report
                  </Typography>
                  <Box
                    sx={{ display: "flex", alignItems: "center", gap: "16px" }}
                  >
                    <TextField
                      fullWidth
                      variant="outlined"
                      placeholder="Search"
                      value={searchTerm}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          height: "40px",
                        },
                        maxWidth: "256px",
                      }}
                      onChange={handleSearch}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <SearchIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                    <Button
                      variant="contained"
                      color="secondary"
                      startIcon={<img src={downloadDark} alt="Export" />}
                      onClick={handleExportPDF}
                      sx={{
                        width: { xs: "100%", md: "auto" },
                        whiteSpace: "nowrap",
                        height: "40px",
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
                <TableContainer component={Paper}>
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
