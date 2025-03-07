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
} from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import PersonIcon from "@mui/icons-material/Person";
import { useGetIdentity, TextField as AdminTextField } from "react-admin";
import React, { useEffect, useState } from "react";
import { dataProvider } from "../../Provider/parseDataProvider";
import { fetchTransactionsofAgent } from "../../Utils/utils";

export const Overview = () => {
  const [data, setData] = useState();
  const [rechargeData, setRechargeData] = useState([]); // For agent recharge report
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { identity } = useGetIdentity();
  const [sortColumn, setSortColumn] = useState("totalRecharge");
  const [sortOrder, setSortOrder] = useState("desc");
  const today = new Date().toISOString().split("T")[0]; // Format as YYYY-MM-DD
  const startDateLimit = "2024-12-01"; // Start date limit: 1st December 2025

  const fetchData = async () => {
    try {
      console.log(fromDate, toDate, "date");
      setLoading(true);
      const filter = {};
      if (fromDate) filter.startDate = fromDate;
      if (toDate) filter.endDate = toDate;

      const result = await dataProvider.getList("Report", {
        pagination: { page: 1, perPage: 1000 },
        sort: { field: "transactionDate", order: "DESC" },
        filter,
      });

      setData(result[0]);

      // Fetch agent recharge report
      const transactionResult = await fetchTransactionsofAgent({
        sortOrder: "desc",
        startDate: fromDate,
        endDate: toDate,
      });
      setRechargeData(transactionResult?.data || []);
      console.log(transactionResult, "rechargeDatarechargeDatarechargeData");
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

  const finalData = [
    {
      id: 1,
      name: "Conversion Rate (Fees Collected)",
      value: data?.totalFeesAmount?.[0]?.totalFees
        ? data.totalFeesAmount[0].totalFees.toFixed(2)
        : "0.00",
      bgColor: "#E3F2FD",
      borderColor: "#7EB9FB",
      icon: <PersonIcon color="primary" />,
    },
    {
      id: 2,
      name: "Ticket Amount",
      value: data?.totalTicketAmount?.[0]?.totalTicketAmount
        ? data.totalTicketAmount[0].totalTicketAmount.toFixed(2)
        : "0.00",
      bgColor: "#dedede",
      borderColor: "#adb5bd",
      icon: <PersonIcon color="info" />,
    },
  ];

  const handleSort = (column) => {
    setSortColumn(column);
    setSortOrder((prevSortOrder) => {
      const newSortOrder = prevSortOrder === "asc" ? "desc" : "asc";

      setRechargeData((prevData) => {
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

  return (
    <>
      {/* Date Filters */}
      {identity?.email === "zen@zen.com" && (
        <>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
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
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
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
            </Grid>
            <Grid item xs={12} md={4} display="flex" alignItems="center">
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Loading..." : "Submit"}
              </Button>
            </Grid>
          </Grid>

          {loading ? (
            <Grid container justifyContent="center">
              <CircularProgress />
            </Grid>
          ) : (
            submitted && (
              <>
                {/* Summary Cards */}
                <Grid container spacing={2}>
                  {finalData?.map((item) => (
                    <Grid item xs={12} md={4} key={item?.id}>
                      <Card
                        sx={{
                          backgroundColor: item?.bgColor,
                          border: 2,
                          borderColor: item?.borderColor,
                          borderRadius: 0,
                          boxShadow: 0,
                        }}
                      >
                        <CardContent>
                          <Typography
                            variant="subtitle1"
                            display="flex"
                            alignItems="center"
                          >
                            {item?.icon}
                            &nbsp;{item?.name}
                          </Typography>
                          <Typography
                            variant="h4"
                            sx={{ mt: 1, fontWeight: "bold" }}
                          >
                            {item?.value}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
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
                              Agent Recharge Overview
                            </Typography>
                            <BarChart
                              xAxis={[
                                {
                                  data: rechargeData.map(
                                    (item) => item.agentName
                                  ),
                                  scaleType: "band",
                                },
                              ]}
                              series={[
                                {
                                  data: rechargeData.map(
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
                              Agent Redeem Overview
                            </Typography>
                            <BarChart
                              xAxis={[
                                {
                                  data: rechargeData.map(
                                    (item) => item.agentName
                                  ),
                                  scaleType: "band",
                                },
                              ]}
                              series={[
                                {
                                  data: rechargeData.map(
                                    (item) => item.totalCashout
                                  ),
                                  color: "#4caf50",
                                },
                              ]}
                              height={400}
                              width={1200} // Adjust width dynamically
                              margin={{ left: 100, right: 50, bottom: 50 }}
                            />
                            <Typography variant="h6" gutterBottom>
                              Agent Cashout Overview
                            </Typography>
                            <BarChart
                              xAxis={[
                                {
                                  data: rechargeData.map(
                                    (item) => item.agentName
                                  ),
                                  scaleType: "band",
                                },
                              ]}
                              series={[
                                {
                                  data: rechargeData.map(
                                    (item) => item.totalRedeem
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

                {/* Data Grid for Agent Recharge Report */}
                <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
                  Agent Recharge Report
                </Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          <TableSortLabel
                            active={sortColumn === "agentName"}
                            direction={sortOrder}
                            onClick={() => handleSort("agentName")}
                          >
                            Agent Name
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
                      {rechargeData.map((row, index) => (
                        <TableRow key={index}>
                          <TableCell>{row.agentName}</TableCell>
                          <TableCell>{row.totalRecharge}</TableCell>
                          <TableCell>{row.totalRedeem}</TableCell>
                          <TableCell>{row.totalCashout}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )
          )}
        </>
      )}
    </>
  );
};
