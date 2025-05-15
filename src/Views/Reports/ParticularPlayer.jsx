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

const ParticularPlayer = () => {
  const { identity } = useGetIdentity();
  const [formattedData, setFormattedData] = useState([]);
  const [lineChartDates, setLineChartDates] = useState([]);
  const [playerUsername, setPlayerUsername] = useState("");
  const perPage = 10;
  const [choices, setChoices] = useState([]);
  const [userLoading, setUserLoading] = useState(false);
  const today = new Date().toISOString().split("T")[0];
  const startDateLimit = "2024-12-01";
  const [tempStartDate, setTempStartDate] = useState("");
  const [tempEndDate, setTempEndDate] = useState("");
  const [selectedUsertemp, setSelectedUsertemp] = useState(null);
  const [playerLoading, setPlayerLoading] = useState(false);
  const [totalData, setTotalData] = useState({
    totalRecharge: 0,
    totalRedeem: 0,
    totalCashout: 0,
  });
  const [noDataFound, setNoDataFound] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

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
      if (!transactionResultByDate.data.length) {
        setNoDataFound(true);
        return;
      } else {
        setNoDataFound(false);
      }
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
      let totalRecharge = 0;
      let totalRedeem = 0;
      let totalCashout = 0;

      dates.forEach((date) => {
        totalRecharge += player.transactions[date].totalRecharge;
        totalRedeem += player.transactions[date].totalRedeem;
        totalCashout += player.transactions[date].totalCashout;
      });

      setTotalData({
        totalRecharge,
        totalRedeem,
        totalCashout,
      });
    } catch (error) {
      console.error("Error fetching player reports:", error);
    } finally {
      setPlayerLoading(false);
    }
  };

  const handleFilterSubmit = () => {
    setIsSubmitted(true);
    fetchSinglePlayerData();
  };

  return (
    <>
      {identity?.email === "zen@zen.com" && (
        <>
          <Box
            display="flex"
            flexDirection={{ xs: "column", sm: "row" }}
            flexWrap="wrap"
            gap={2}
            alignItems={{ xs: "stretch", sm: "flex-end" }}
            sx={{ mb: 2 }}
          >
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
                Player<span style={{ color: "red" }}> *</span>
              </Typography>
              <Autocomplete
                sx={{ width: { xs: "100%", sm: 230 } }}
                options={choices}
                getOptionLabel={(option) => option.optionName}
                isOptionEqualToValue={(option, value) =>
                  option.id === value?.id
                }
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
                    placeholder="Search"
                    variant="outlined"
                    required
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
                type="date"
                value={tempStartDate}
                onChange={(event) => setTempStartDate(event.target.value)}
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  min: startDateLimit,
                  max: tempEndDate || today,
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
                End Date<span style={{ color: "red" }}> *</span>
              </Typography>
              <TextField
                type="date"
                value={tempEndDate}
                onChange={(event) => setTempEndDate(event.target.value)}
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  min: tempStartDate || startDateLimit,
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
          ) : isSubmitted ? (
            !noDataFound ? (
              <>
                <Grid container spacing={3} mt={3}>
                  {/* Pie Chart - Left Side */}
                  <Grid item md={6} xs={12} >
                    <Box
                      sx={{
                        p: 2,
                        border: "1px solid #eaeaea",
                        borderRadius: 2,
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        minWidth: "300px",
                      }}
                    >
                      <Typography variant="h6" gutterBottom align="center">
                        Total Transaction Summary
                      </Typography>
                      <Box
                        sx={{
                          flex: 1,
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                        }}
                      >
<Box
  sx={{
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: 300,
    position: "relative",
  }}
>
  <PieChart
    series={[
      {
        data: [
          {
            id: 0,
            value: totalData.totalRecharge,
            label: "Recharge",
            color: "#43A047",
          },
          {
            id: 1,
            value: totalData.totalRedeem,
            label: "Redeem",
            color: "#E53935",
          },
          {
            id: 2,
            value: totalData.totalCashout,
            label: "Cashout",
            color: "#FB8C00",
          },
        ],
        innerRadius: 30,
        outerRadius: 100,
        paddingAngle: 1,
        cornerRadius: 5,
        startAngle: -90,
        endAngle: 270,
        cx: "70%",
        cy: "50%",
      },
    ]}
    slotProps={{
      legend: {
        direction: "row",
        position: { vertical: "bottom", horizontal: "middle" },
        padding: { top: 20 },
        itemMarkWidth: 10,
        itemMarkHeight: 10,
        labelStyle: { fontSize: 16 },
      },
    }}
    height={300}
    width={300}
  />
</Box>

                        <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          height: "100%",
                        }}
                      >
                        <PieChart
                          series={[
                            {
                              data: [
                                {
                                  id: 0,
                                  value: totalData.totalRecharge,
                                  label: "Recharge",
                                  color: "#43A047",
                                },
                                {
                                  id: 1,
                                  value: totalData.totalRedeem,
                                  label: "Redeem",
                                  color: "#E53935",
                                },
                                {
                                  id: 2,
                                  value: totalData.totalCashout,
                                  label: "Cashout",
                                  color: "#FB8C00",
                                },
                              ],
                              innerRadius: 30,
                              outerRadius: 100,
                              paddingAngle: 1,
                              cornerRadius: 5,
                              startAngle: -90,
                              endAngle: 270,
                              cx: "65%",
                              cy: "50%",
                            },
                          ]}
                          // width={400}
                        //  height={300}
                          slotProps={{
                            legend: {
                              direction: 'row',
                          position: { vertical: 'bottom', horizontal: 'middle' },
                          padding: { top: 20 }, 
                          itemMarkWidth: 10, 
                          itemMarkHeight: 10, 
                          labelStyle: { fontSize: 16 },
                            },
                          }}
                          height={300}
                        />
                      </Box>
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" align="center">
                          Period: {tempStartDate} to {tempEndDate}
                        </Typography>
                      </Box>
                    </Box>
                    </Box>
                  </Grid>

                  {/* Line Chart - Right Side */}
                  <Grid item md={6} xs={12} >
                    <Box
                      sx={{
                        p: 2,
                        border: "1px solid #eaeaea",
                        borderRadius: 2,
                        height: "100%",
                      }}
                    >
                      <Typography variant="h6" gutterBottom>
                        Daily Player Transactions
                      </Typography>
                      <LineChart
                        xAxis={[
                          {
                            data: formattedData,
                            scaleType: "band",
                          },
                        ]}
                        yAxis={[{ label: "Amount", labelStyle: {  fontSize: 14 } }]}
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
                        // width={400}
                        height={300}
                        margin={{ left: 70, right: 40, top: 30, bottom: 70}}
                        slotProps={{
                        legend: {
                          direction: 'row',
                          position: { vertical: 'bottom', horizontal: 'middle' },
                          padding: { top: 20 }, 
                          itemMarkWidth: 10, 
                          itemMarkHeight: 10, 
                          labelStyle: { fontSize: 16 },
                        },
                        }}
                      />
                    </Box>
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

export default ParticularPlayer;
