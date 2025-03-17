import {
  Grid,
  CircularProgress,
  Button,
  TextField,
  Autocomplete,
  Box,
  Typography,
} from "@mui/material";
import { LineChart } from "@mui/x-charts/LineChart";
import { PieChart } from "@mui/x-charts/PieChart";
import { useGetIdentity } from "react-admin";
import React, { useCallback, useState } from "react";
import { dataProvider } from "../../Provider/parseDataProvider";
import { fetchTransactionsofPlayerByDate } from "../../Utils/utils"; // Ensure this utility exists
import debounce from "lodash/debounce";

export const ParticularPlayer = () => {
  const { identity } = useGetIdentity();
  const [formattedData, setFormattedData] = useState([]);
  const [lineChartDates, setLineChartDates] = useState([]);
  const [playerUsername, setPlayerUsername] = useState("");
  const perPage = 10;
  const [choices, setChoices] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userLoading, setUserLoading] = useState(false);
  const today = new Date().toISOString().split("T")[0];
  const startDateLimit = "2024-12-01";
  const [tempStartDate, setTempStartDate] = useState("");
  const [tempEndDate, setTempEndDate] = useState("");
  const [selectedUsertemp, setSelectedUsertemp] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [playerLoading, setPlayerLoading] = useState(false);
  const [totalData, setTotalData] = useState({
    totalDeposit: 0,
    totalWithdraw: 0,
    totalBet: 0,
  });

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
              roleName:"Player"
            }
          : {
              $or: [{ userReferralCode: "" }, { userReferralCode: null }],
              roleName:"Player"
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
        .filter(Boolean);

      setChoices(formattedData);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
    setUserLoading(false);
  };

  const handleUserChange = (selectedId) => {
    setSelectedUsertemp(selectedId);
  };

  const debouncedFetchUsers = useCallback(debounce(fetchUsers, 500), []);

  const fetchSinglePlayerData = async () => {
    try {
      setPlayerLoading(true);
      const transactionResultByDate = await fetchTransactionsofPlayerByDate({
        startDate: tempStartDate,
        endDate: tempEndDate,
        playerId: selectedUsertemp.id,
      });

      const player = transactionResultByDate.data[0];
      setPlayerUsername(player);
      const dates = Object.keys(player.transactions).sort(
        (a, b) => new Date(a) - new Date(b)
      );

      const formattedDates = dates.map((date) => {
        const d = new Date(date);
        return `${d.toLocaleString("default", {
          month: "short",
        })} ${d.getDate()}, ${d.getFullYear()}`;
      });
      setLineChartDates(dates);
      setFormattedData(formattedDates);

      // Calculate totals for pie chart
      let totalDeposit = 0;
      let totalWithdraw = 0;
      let totalBet = 0;

      dates.forEach((date) => {
        totalDeposit += player.transactions[date].totalRecharge;
        totalWithdraw += player.transactions[date].totalRedeem;
        totalBet += player.transactions[date].totalCashout;
      });

      setTotalData({
        totalDeposit,
        totalWithdraw,
        totalBet,
      });
    } catch (error) {
      console.error("Error fetching player reports:", error);
    } finally {
      setPlayerLoading(false);
    }
  };

  const handleFilterSubmit = () => {
    setStartDate(tempStartDate);
    setEndDate(tempEndDate);
    setSelectedUser(selectedUsertemp);
    fetchSinglePlayerData();
  };

  return (
    <>
      {identity?.email === "zen@zen.com" && (
        <>
          <Box display="flex" sx={{ mb: 1, gap: 2 }}>
            <Autocomplete
              sx={{ width: 230 }}
              options={choices}
              getOptionLabel={(option) => option.optionName}
              isOptionEqualToValue={(option, value) => option.id === value?.id}
              loading={userLoading}
              loadingText="....Loading"
              value={selectedUsertemp}
              onChange={(event, newValue) => handleUserChange(newValue)}
              onInputChange={(event, newInputValue, reason) => {
                if (reason === "input") {
                  debouncedFetchUsers(newInputValue, 1);
                  setSelectedUsertemp(null);
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Player Username"
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
              label="From Date"
              type="date"
              value={tempStartDate}
              onChange={(event) => setTempStartDate(event.target.value)}
              InputLabelProps={{ shrink: true }}
              inputProps={{
                min: startDateLimit,
                max: tempEndDate || today,
              }}
            />
            <TextField
              label="To Date"
              type="date"
              value={tempEndDate}
              onChange={(event) => setTempEndDate(event.target.value)}
              InputLabelProps={{ shrink: true }}
              inputProps={{
                min: tempStartDate || startDateLimit,
                max: today,
              }}
            />
            <Button
              variant="contained"
              onClick={handleFilterSubmit}
              sx={{ whiteSpace: "nowrap" }}
              disabled={
                !tempStartDate ||
                !tempEndDate ||
                !selectedUsertemp ||
                playerLoading
              }
            >
              {playerLoading ? "Loading..." : "Apply Filter"}
            </Button>
          </Box>

          {playerLoading ? (
            <Grid container justifyContent="center">
              <CircularProgress />
            </Grid>
          ) : formattedData && lineChartDates && playerUsername ? (
            <>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Daily Player Transactions
                  </Typography>
                  <LineChart
                    xAxis={[
                      {
                        data: formattedData,
                        scaleType: "band",
                        label: "Date",
                      },
                    ]}
                    yAxis={[{ label: "Amount" }]}
                    series={[
                      {
                        data: lineChartDates.map(
                          (date) =>
                            playerUsername.transactions[date].totalRecharge
                        ),
                        label: "Total Recharge",
                        color: "#2196f3",
                      },
                      {
                        data: lineChartDates.map(
                          (date) =>
                            playerUsername.transactions[date].totalRedeem
                        ),
                        label: "Total Redeem",
                        color: "#f44336",
                      },
                      {
                        data: lineChartDates.map(
                          (date) =>
                            playerUsername.transactions[date].totalCashout
                        ),
                        label: "Total Cashout",
                        color: "#4caf50",
                      },
                    ]}
                    width={1200}
                    height={400}
                    margin={{ left: 70, right: 40, top: 40, bottom: 70 }}
                  />
                </Grid>

                <Grid item xs={12} md={6} lg={6}>
                  <Box
                    sx={{ p: 2, border: "1px solid #eaeaea", borderRadius: 2 }}
                  >
                    <Typography variant="h6" gutterBottom align="center">
                      Total Transaction Summary
                    </Typography>
                    <Box
                      sx={{ mt: 2, display: "flex", justifyContent: "center" }}
                    >
                      <PieChart
                        series={[
                          {
                            data: [
                              {
                                id: 0,
                                value: totalData.totalDeposit,
                                label: "Recharge",
                                color: "#2196f3",
                              },
                              {
                                id: 1,
                                value: totalData.totalWithdraw,
                                label: "Redeem",
                                color: "#f44336",
                              },
                              {
                                id: 2,
                                value: totalData.totalBet,
                                label: "Cashout",
                                color: "#4caf50",
                              },
                            ],
                            innerRadius: 30,
                            outerRadius: 100,
                            cx: 150,
                            cy: 150,
                          },
                        ]}
                        width={400}
                        height={300}
                        slotProps={{
                          legend: {
                            direction: "row",
                            position: {
                              vertical: "bottom",
                              horizontal: "middle",
                            },
                          },
                        }}
                      />
                    </Box>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" align="center">
                        Period: {tempStartDate} to {tempEndDate}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </>
          ) : (
            <Grid container justifyContent="center">
              <p>No data found for the selected player and date range.</p>
            </Grid>
          )}
        </>
      )}
    </>
  );
};
