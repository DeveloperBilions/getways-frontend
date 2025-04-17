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
} from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import { useGetIdentity } from "react-admin";
import React, { useState } from "react";
import { fetchTransactionComparison } from "../../Utils/utils";

export const Comparison = () => {
  const [comparisonData, setComparisonData] = useState([]);
  const [compareLoading, setCompareLoading] = useState(false);
  const [compareSubmitted, setCompareSubmitted] = useState(false);
  const { identity } = useGetIdentity();
  const [type, setType] = useState("date");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const today = new Date().toISOString().split("T")[0]; // Format as YYYY-MM-DD
  const startDateLimit = "2024-12-01"; // Start date limit: 1st December 2025
  const currentYear = new Date().getFullYear(); // Get current year
  const [noDataFound, setNoDataFound] = useState(false);

  const fetchCompareData = async () => {
    try {
      setCompareLoading(true);
      const selectedDates = [fromDate, toDate];
      // Fetch transaction comparison data
      const transactionComparison = await fetchTransactionComparison({
        sortOrder: "desc",
        selectedDates,
        type: type,
      });
      setComparisonData(transactionComparison?.data || []);
      if (
        transactionComparison?.data.length === 0 ||
        !transactionComparison?.data
      ) {
        setNoDataFound(true);
      } else {
        setNoDataFound(false);
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
  const prepareComparisonChartData = (transactionType) => {
    if (!comparisonData || comparisonData.length === 0) return null;

    // Get all unique agents
    const agents = [...new Set(comparisonData.map((item) => item.agentName))];

    // Get all unique dates
    const dates = [
      ...new Set(
        comparisonData
          .map((item) => Object.keys(item.transactions).map((date) => date))
          .flat()
      ),
    ].sort();

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

      // Get transaction values for this date from each agent
      const values = agents.map((agent) => {
        const agentData = comparisonData.find(
          (item) => item.agentName === agent
        );
        return agentData?.transactions[date]?.[transactionType] || 0;
      });

      return {
        data: values,
        label: displayDate,
        color: color,
      };
    });

    return {
      agents,
      series,
    };
  };
  const handleSetType = (typeBy) => {
    setType(typeBy);
    setFromDate("");
    setToDate("");
  };

  // Prepare data for each transaction type
  const rechargeComparisonData = prepareComparisonChartData("totalRecharge");
  const redeemComparisonData = prepareComparisonChartData("totalRedeem");
  const cashoutComparisonData = prepareComparisonChartData("totalCashout");

  return (
    <>
      {/* Date Filters */}
      {identity?.email === "zen@zen.com" && (
        <>
          <Box display="flex" sx={{ mb: 1, gap: 2 }}>
            {type === "date" && (
              <>
                <TextField
                  label="Date"
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
                    "& .MuiFormLabel-asterisk": {
                      color: "red",
                    },
                  }}
                />
                <TextField
                  label="Date"
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
                    "& .MuiFormLabel-asterisk": {
                      color: "red",
                    },
                  }}
                />
              </>
            )}
            {type === "month" && (
              <>
                <TextField
                  label="Month"
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
                    "& .MuiFormLabel-asterisk": {
                      color: "red",
                    },
                  }}
                />
                <TextField
                  label="Month"
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
                    "& .MuiFormLabel-asterisk": {
                      color: "red",
                    },
                  }}
                />
              </>
            )}
            {type === "year" && (
              <>
                <TextField
                  label="Year"
                  type="number"
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
                    "& .MuiFormLabel-asterisk": {
                      color: "red",
                    },
                  }}
                  onInput={(e) => {
                    if (e.target.value < 2024) e.target.value = 2024;
                    if (e.target.value > currentYear)
                      e.target.value = currentYear;
                  }}
                />
                <TextField
                  label="Year"
                  type="number"
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
                    "& .MuiFormLabel-asterisk": {
                      color: "red",
                    },
                  }}
                  onInput={(e) => {
                    if (e.target.value < 2024) e.target.value = 2024;
                    if (e.target.value > currentYear)
                      e.target.value = currentYear;
                  }}
                />
              </>
            )}

            <FormControl>
              <Select
                value={type}
                onChange={(e) => handleSetType(e.target.value)}
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
            !noDataFound ? (
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
                              <Typography variant="h6" gutterBottom>
                                Date Comparison - Recharge
                              </Typography>
                              <BarChart
                                xAxis={[
                                  {
                                    data: rechargeComparisonData.agents,
                                    scaleType: "band",
                                  },
                                ]}
                                series={rechargeComparisonData.series}
                                height={400}
                                width={1200}
                                margin={{ left: 100, right: 50, bottom: 50 }}
                              />
                            </>
                          )}

                          {/* Redeem Date Comparison Chart */}
                          {redeemComparisonData && (
                            <>
                              <Typography
                                variant="h6"
                                gutterBottom
                                sx={{ mt: 4 }}
                              >
                                Date Comparison - Redeem
                              </Typography>
                              <BarChart
                                xAxis={[
                                  {
                                    data: redeemComparisonData.agents,
                                    scaleType: "band",
                                  },
                                ]}
                                series={redeemComparisonData.series}
                                height={400}
                                width={1200}
                                margin={{ left: 100, right: 50, bottom: 50 }}
                              />
                            </>
                          )}

                          {/* Cashout Date Comparison Chart */}
                          {cashoutComparisonData && (
                            <>
                              <Typography
                                variant="h6"
                                gutterBottom
                                sx={{ mt: 4 }}
                              >
                                Date Comparison - Cashout
                              </Typography>
                              <BarChart
                                xAxis={[
                                  {
                                    data: cashoutComparisonData.agents,
                                    scaleType: "band",
                                  },
                                ]}
                                series={cashoutComparisonData.series}
                                height={400}
                                width={1200}
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
