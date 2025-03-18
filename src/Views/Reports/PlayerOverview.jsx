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
} from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import { PieChart } from "@mui/x-charts/PieChart";
import { useGetIdentity } from "react-admin";
import React, { useCallback, useState } from "react";
import { fetchTransactionsofPlayer } from "../../Utils/utils";
import debounce from "lodash/debounce";
import { dataProvider } from "../../Provider/parseDataProvider";

export const PlayerOverview = () => {
  const [playerData, setPlayerData] = useState([]); // For Player transaction report
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
      // Fetch Player recharge report
      const playerTransactionResult = await fetchTransactionsofPlayer({
        startDate: fromDate,
        endDate: toDate,
        userParentId: selectedUser?.id,
      });

      setPlayerData(playerTransactionResult?.data || []);
      if (!playerTransactionResult?.data.length) {
        setNoDataFound(true);
        return;
      } else {
        setNoDataFound(false);
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
    fetchData();
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

      setPlayerData((prevData) => {
        const sortedData = [...prevData].sort((a, b) => {
          if (a[column] < b[column]) return newSortOrder === "asc" ? -1 : 1;
          if (a[column] > b[column]) return newSortOrder === "asc" ? 1 : -1;
          return 0;
        });
        return sortedData;
      });

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
          <Box display="flex" sx={{ mb: 1, gap: 2 }}>
            <Autocomplete
              sx={{ width: { xs: "100%", md: 230 } }}
              options={choices}
              getOptionLabel={(option) => option.optionName}
              isOptionEqualToValue={(option, value) => option.id === value?.id}
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
                  label="Agent Username"
                  variant="outlined"
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
            <TextField
              required
              sx={{
                width: { xs: "100%", md: "auto" },
                "& .MuiFormLabel-asterisk": {
                  color: "red",
                },
              }}
              label="From Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              inputProps={{
                min: startDateLimit,
                max: toDate || today,
              }}
            />
            <TextField
              required
              sx={{
                width: { xs: "100%", md: "auto" },
                "& .MuiFormLabel-asterisk": {
                  color: "red",
                },
              }}
              label="To Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              inputProps={{
                min: fromDate || startDateLimit,
                max: today,
              }}
            />
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

                {/* Data Grid for Player Recharge Report */}
                <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
                  Top {playerData.slice(0, 30).length} Player Transaction Report
                </Typography>
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
                      {playerData.slice(0, 30).map((row, index) => (
                        <TableRow key={index}>
                          <TableCell>{row.username}</TableCell>
                          <TableCell>{row.totalRecharge}</TableCell>
                          <TableCell>{row.totalRedeem}</TableCell>
                          <TableCell>{row.totalCashout}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
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
