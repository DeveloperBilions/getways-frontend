import {
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Button,
  TextField,
  FormControl,
  Select,
  MenuItem,
  Box,
  Autocomplete,
} from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import { useGetIdentity } from "react-admin";
import React, { useCallback, useState } from "react";
import { fetchPlayerTransactionComparison } from "../../Utils/utils";
import debounce from "lodash/debounce";
import { dataProvider } from "../../Provider/parseDataProvider";

export const PlayerComparison = () => {
  const [comparisonData, setComparisonData] = useState([]);
  const [compareLoading, setCompareLoading] = useState(false);
  const [compareSubmitted, setCompareSubmitted] = useState(false);
  const { identity } = useGetIdentity();
  const [type, setType] = useState("date");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  // Add state for player count filters
  const [rechargePlayerCount, setRechargePlayerCount] = useState("30");
  const [redeemPlayerCount, setRedeemPlayerCount] = useState("30");
  const [cashoutPlayerCount, setCashoutPlayerCount] = useState("30");
  const [dataNotFound, setDataNotFound] = useState(false);

  const today = new Date().toISOString().split("T")[0]; // Format as YYYY-MM-DD
  const startDateLimit = "2024-12-01"; // Start date limit: 1st December 2025
  const currentYear = new Date().getFullYear(); // Get current year

  const [choices, setChoices] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userLoading, setUserLoading] = useState(false);
  const perPage = 10;

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
              roleName: "Player",
            }
          : {
              $or: [{ userReferralCode: "" }, { userReferralCode: null }],
              roleName: "Player",
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

  const handleUserChange = (selectedId) => {
    setSelectedUser(selectedId);
  };

  const debouncedFetchUsers = useCallback(debounce(fetchUsers, 500), []);

  const fetchCompareData = async () => {
    try {
      setCompareLoading(true);
      const selectedDates = [fromDate, toDate];
      // Fetch transaction comparison data
      const transactionComparison = await fetchPlayerTransactionComparison({
        playerId: selectedUser?.id,
        selectedDates,
        type: type,
      });
      setComparisonData(transactionComparison?.data || []);
      if (transactionComparison?.data.length === 0) {
        setDataNotFound(true);
      } else {
        setDataNotFound(false);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setCompareLoading(false);
    }
  };

  const handleSubmitCompare = () => {
    setCompareSubmitted(true);
    fetchCompareData();
  };

  // Function to prepare data for the comparison charts
  const prepareComparisonChartData = (transactionType, playerCount) => {
    if (!comparisonData || comparisonData.length === 0) return null;

    // Get all unique dates from the data
    const dates = [
      ...new Set(
        comparisonData
          .map((item) => Object.keys(item.transactions).map((date) => date))
          .flat()
      ),
    ].sort();

    // Make sure we have at least two dates to compare
    if (dates.length === 0) return null;

    // Calculate growth/difference for each player between the two dates
    const playerGrowthData = comparisonData.map((player) => {
      const firstDateValue =
        player.transactions[dates[0]]?.[transactionType] || 0;
      const secondDateValue =
        player.transactions[dates[1]]?.[transactionType] || 0;
      const growth = secondDateValue - firstDateValue;
      const growthPercentage =
        firstDateValue > 0 ? (growth / firstDateValue) * 100 : 0;

      return {
        username: player.username,
        firstDateValue,
        secondDateValue,
        growth,
        growthPercentage,
        rawData: player,
      };
    });

    // Sort players by growth (difference between dates)
    const sortedPlayers = [...playerGrowthData].sort((a, b) => {
      return Math.abs(b.growth) - Math.abs(a.growth); // Sort by absolute growth value
    });

    // Filter players based on selected count
    let filteredPlayers = sortedPlayers;
    if (playerCount !== "all" && sortedPlayers.length > parseInt(playerCount)) {
      filteredPlayers = sortedPlayers.slice(0, parseInt(playerCount));
    }

    // Get player usernames for chart
    const players = filteredPlayers.map((player) => player.username);

    // Create series for each date
    const series = dates.map((date, index) => {
      // Format date for display
      const displayDate = new Date(date).toLocaleDateString(
        "en-US",
        type === "year"
          ? { year: "numeric" }
          : type === "month"
          ? { year: "numeric", month: "short" }
          : { month: "short", day: "numeric" }
      );

      // Colors for different dates
      const colors = [
        "#4caf50",
        "#2196f3",
        "#ff9800",
        "#f44336",
        "#9c27b0",
        "#795548",
      ];
      const color = colors[index % colors.length];

      // Get transaction values for this date from each filtered player
      const values = players.map((username) => {
        const playerData = comparisonData.find(
          (item) => item.username === username
        );
        return playerData?.transactions[date]?.[transactionType] || 0;
      });

      return {
        data: values,
        label: displayDate,
        color: color,
      };
    });

    return {
      players,
      series,
    };
  };

  const handleSetType = (typeBy) => {
    setType(typeBy);
    setFromDate("");
    setToDate("");
  };

  // Prepare data for each transaction type with player count filter
  const rechargeComparisonData = prepareComparisonChartData(
    "totalRecharge",
    rechargePlayerCount
  );
  const redeemComparisonData = prepareComparisonChartData(
    "totalRedeem",
    redeemPlayerCount
  );
  const cashoutComparisonData = prepareComparisonChartData(
    "totalCashout",
    cashoutPlayerCount
  );

  return (
    <>
      {/* Date Filters */}
      {identity?.email === "zen@zen.com" && (
        <>
          <Box  display="flex"
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
                Player
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
            {type === "date" && (
              <>
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
                    Date<span style={{ color: "red" }}> *</span>
                  </Typography>
                  <TextField
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    inputProps={{
                      min: startDateLimit,
                      max: today,
                    }}
                    required
                    sx={{
                      "& .MuiInputBase-root": {
                        height: "40px",
                      },
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
                    Date<span style={{ color: "red" }}> *</span>
                  </Typography>
                  <TextField
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    inputProps={{
                      min: startDateLimit,
                      max: today,
                    }}
                    required
                    sx={{
                      "& .MuiInputBase-root": {
                        height: "40px",
                      },
                    }}
                  />
                </Box>
              </>
            )}
            {type === "month" && (
              <>
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
                    Month<span style={{ color: "red" }}> *</span>
                  </Typography>
                  <TextField
                    type="month"
                    InputLabelProps={{ shrink: true }}
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    inputProps={{
                      min: startDateLimit.slice(0, 7),
                      max: today.slice(0, 7),
                    }}
                    required
                    sx={{
                      "& .MuiInputBase-root": {
                        height: "40px",
                      },
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
                    Month<span style={{ color: "red" }}> *</span>
                  </Typography>
                  <TextField
                    type="month"
                    InputLabelProps={{ shrink: true }}
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    inputProps={{
                      min: startDateLimit.slice(0, 7),
                      max: today.slice(0, 7),
                    }}
                    required
                    sx={{
                      "& .MuiInputBase-root": {
                        height: "40px",
                      },
                    }}
                  />
                </Box>
              </>
            )}
            {type === "year" && (
              <>
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
                    Year<span style={{ color: "red" }}> *</span>
                  </Typography>
                  <TextField
                    type="number"
                    placeholder="YYYY"
                    InputLabelProps={{ shrink: true }}
                    value={fromDate}
                    onChange={(e) => {
                      const value = parseInt(e.target.value, 10);
                      if (value >= 2024 && value <= currentYear)
                        setFromDate(value.toString());
                    }}
                    inputProps={{
                      min: 2024,
                      max: currentYear,
                    }}
                    required
                    sx={{
                      "& .MuiInputBase-root": {
                        height: "40px",
                      },
                    }}
                    onInput={(e) => {
                      if (e.target.value < 2024) e.target.value = 2024;
                      if (e.target.value > currentYear)
                        e.target.value = currentYear;
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
                    Year<span style={{ color: "red" }}> *</span>
                  </Typography>
                  <TextField
                    type="number"
                    placeholder="YYYY"
                    InputLabelProps={{ shrink: true }}
                    value={toDate}
                    onChange={(e) => {
                      const value = parseInt(e.target.value, 10);
                      if (value >= 2024 && value <= currentYear)
                        setToDate(value.toString());
                    }}
                    inputProps={{
                      min: 2024,
                      max: currentYear,
                    }}
                    required
                    sx={{
                      "& .MuiInputBase-root": {
                        height: "40px",
                      },
                    }}
                    onInput={(e) => {
                      if (e.target.value < 2024) e.target.value = 2024;
                      if (e.target.value > currentYear)
                        e.target.value = currentYear;
                    }}
                  />
                </Box>
              </>
            )}

            <FormControl>
              <Select
                value={type}
                onChange={(e) => handleSetType(e.target.value)}
                sx={{
                  height: "40px",
                }}
              >
                <MenuItem value="date">Date</MenuItem>
                <MenuItem value="month">Month</MenuItem>
                <MenuItem value="year">Year</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmitCompare}
              disabled={compareLoading || !fromDate || !toDate}
            >
              {compareLoading ? "Loading..." : "Apply filter"}
            </Button>
          </Box>
          {compareLoading ? (
            <Grid container justifyContent="center">
              <CircularProgress />
            </Grid>
          ) : compareSubmitted ? (
            !dataNotFound ? (
              <>
                {/* Date Comparison Charts */}
                <Grid container spacing={2} sx={{ mt: 4 }}>
                  <Grid item xs={12}>
                    <Card>
                      <CardContent>
                        <div style={{ overflowX: "auto", width: "100%" }}>
                          {/* Recharge Date Comparison Chart */}
                          {rechargeComparisonData && (
                            <>
                              <Box
                                display="flex"
                                alignItems="center"
                                justifyContent="space-between"
                                mb={2}
                              >
                                <Typography variant="h6">
                                  Date Comparison - Recharge
                                </Typography>
                                <FormControl sx={{ minWidth: 120 }}>
                                  <Select
                                    value={rechargePlayerCount}
                                    onChange={(e) =>
                                      setRechargePlayerCount(e.target.value)
                                    }
                                    size="small"
                                    displayEmpty
                                    inputProps={{
                                      "aria-label": "Player count",
                                    }}
                                  >
                                    <MenuItem value="all">All Players</MenuItem>
                                    <MenuItem value="5">Top 5 Players</MenuItem>
                                    <MenuItem value="10">
                                      Top 10 Players
                                    </MenuItem>
                                    <MenuItem value="30">
                                      Top 30 Players
                                    </MenuItem>
                                  </Select>
                                </FormControl>
                              </Box>
                              <BarChart
                                xAxis={[
                                  {
                                    data: rechargeComparisonData.players,
                                    scaleType: "band",
                                  },
                                ]}
                                series={rechargeComparisonData.series}
                                height={400}
                                margin={{ left: 100, right: 50, bottom: 50 }}
                              />
                            </>
                          )}

                          {/* Redeem Date Comparison Chart */}
                          {redeemComparisonData && (
                            <>
                              <Box
                                display="flex"
                                alignItems="center"
                                justifyContent="space-between"
                                mt={4}
                                mb={2}
                              >
                                <Typography variant="h6">
                                  Date Comparison - Redeem
                                </Typography>
                                <FormControl sx={{ minWidth: 120 }}>
                                  <Select
                                    value={redeemPlayerCount}
                                    onChange={(e) =>
                                      setRedeemPlayerCount(e.target.value)
                                    }
                                    size="small"
                                    displayEmpty
                                    inputProps={{
                                      "aria-label": "Player count",
                                    }}
                                  >
                                    <MenuItem value="all">All Players</MenuItem>
                                    <MenuItem value="5">Top 5 Players</MenuItem>
                                    <MenuItem value="10">
                                      Top 10 Players
                                    </MenuItem>
                                    <MenuItem value="30">
                                      Top 30 Players
                                    </MenuItem>
                                  </Select>
                                </FormControl>
                              </Box>
                              <BarChart
                                xAxis={[
                                  {
                                    data: redeemComparisonData.players,
                                    scaleType: "band",
                                  },
                                ]}
                                series={redeemComparisonData.series}
                                height={400}
                                margin={{ left: 100, right: 50, bottom: 50 }}
                              />
                            </>
                          )}

                          {/* Cashout Date Comparison Chart */}
                          {cashoutComparisonData && (
                            <>
                              <Box
                                display="flex"
                                alignItems="center"
                                justifyContent="space-between"
                                mt={4}
                                mb={2}
                              >
                                <Typography variant="h6">
                                  Date Comparison - Cashout
                                </Typography>
                                <FormControl sx={{ minWidth: 120 }}>
                                  <Select
                                    value={cashoutPlayerCount}
                                    onChange={(e) =>
                                      setCashoutPlayerCount(e.target.value)
                                    }
                                    size="small"
                                    displayEmpty
                                    inputProps={{
                                      "aria-label": "Player count",
                                    }}
                                  >
                                    <MenuItem value="all">All Players</MenuItem>
                                    <MenuItem value="5">Top 5 Players</MenuItem>
                                    <MenuItem value="10">
                                      Top 10 Players
                                    </MenuItem>
                                    <MenuItem value="30">
                                      Top 30 Players
                                    </MenuItem>
                                  </Select>
                                </FormControl>
                              </Box>
                              <BarChart
                                xAxis={[
                                  {
                                    data: cashoutComparisonData.players,
                                    scaleType: "band",
                                  },
                                ]}
                                series={cashoutComparisonData.series}
                                height={400}
                                margin={{ left: 100, right: 50, bottom: 50 }}
                              />
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
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
