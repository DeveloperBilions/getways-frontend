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
  InputAdornment,
} from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import { PieChart } from "@mui/x-charts/PieChart";
import { useGetIdentity } from "react-admin";
import React, { useEffect, useState } from "react";
import { dataProvider } from "../../Provider/parseDataProvider";
import { fetchTransactionsofAgent } from "../../Utils/utils";
import CustomPagination from "../Common/CustomPagination";
import SearchIcon from "@mui/icons-material/Search";
import downloadDark from "../../Assets/icons/downloadDark.svg";
import jsPDF from "jspdf";
import TotalUser from "../../Assets/icons/TotalUser.svg";
import TotalAgent from "../../Assets/icons/TotalAgent.svg";

export const Overview = () => {
  const [data, setData] = useState();
  const [rechargeData, setRechargeData] = useState([]); // For agent recharge report
  const [filteredRechargeData, setFilteredRechargeData] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { identity } = useGetIdentity();
  const [sortColumn, setSortColumn] = useState("totalRecharge");
  const [sortOrder, setSortOrder] = useState("desc");
  const today = new Date().toISOString().split("T")[0]; // Format as YYYY-MM-DD
  const startDateLimit = "2024-12-01"; // Start date limit: 1st December 2025
  const [noDataFound, setNoDataFound] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentRechargeData, setCurrentRechargeData] = useState([]);
  
    useEffect(() => {
      const startIndex = (page - 1) * rowsPerPage;
      const endIndex = startIndex + rowsPerPage;
  
      setCurrentRechargeData(filteredRechargeData.slice(startIndex, endIndex));
    }, [page, rowsPerPage, filteredRechargeData]);
  
    useEffect(() => {
      setPage(1);
    }, [filteredRechargeData]);

     useEffect(() => {
       // Filter data based on search term whenever rechargeData or searchTerm changes
       if (searchTerm.trim() === "") {
         setFilteredRechargeData(rechargeData);
       } else {
         const filtered = rechargeData.filter((item) =>
           item.agentName.toLowerCase().includes(searchTerm.toLowerCase())
         );
         setFilteredRechargeData(filtered);
       }
     }, [searchTerm, rechargeData]);


  const fetchData = async () => {
    try {
      setLoading(true);
      const filter = {};
      if (fromDate) filter.fromDate = fromDate;
      if (toDate) filter.toDate = toDate;

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
      console.log(transactionResult);
      if (!transactionResult?.data || !transactionResult?.data.length) {
        setNoDataFound(true);
        setRechargeData([]);
        setFilteredRechargeData([]);
      } else {
        setNoDataFound(false);
        setRechargeData(transactionResult?.data || []);
        setFilteredRechargeData(transactionResult?.data || []);
      }
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
      if (!filteredRechargeData || filteredRechargeData.length === 0) {
        console.warn("No data to export.");
        return;
      }
       const doc = new jsPDF();
       doc.text("Agent overall Report", 10, 10);
       doc.autoTable({
         head: [["No", "Agent Name", "Total Recharge", "Total Redeem", "Total Cashout"]],
         body: filteredRechargeData.map((row, index) => [
           index + 1,
           row.agentName,
           row.totalRecharge,
           row.totalRedeem,
           row.totalCashout
         ]),
       });
       doc.save("AgentOverallReport.pdf");
    };

  const finalData = [
    {
      id: 1,
      name: "Conversion Rate (Fees Collected)",
      value: data?.totalFeesAmount?.[0]?.totalFees
        ? data.totalFeesAmount[0].totalFees.toFixed(2)
        : "0.00",
      bgColor: "#F2EFFF",
      borderColor: "#7EB9FB",
      color: "#3C24B2",
      icon: <img src={TotalUser} alt="Total User" />,
    },
    {
      id: 2,
      name: "Ticket Amount",
      value: data?.totalTicketAmount?.[0]?.totalTicketAmount
        ? data.totalTicketAmount[0].totalTicketAmount.toFixed(2)
        : "0.00",
      bgColor: "#F5FCFF",
      borderColor: "#adb5bd",
      color: "#276E91",
      icon: <img src={TotalAgent} alt="Total Agent" />,
    },
  ];

  // Calculate totals for PieChart
  const calculateTotals = () => {
    if (!rechargeData.length) return [];

    let totalRecharge = 0;
    let totalRedeem = 0;
    let totalCashout = 0;

    rechargeData.forEach((agent) => {
      totalRecharge += agent.totalRecharge;
      totalRedeem += agent.totalRedeem;
      totalCashout += agent.totalCashout;
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

  const pieChartData = calculateTotals();

  return (
    <>
      {/* Date Filters */}
      {identity?.email === "zen@zen.com" && (
        <>
          <Box
            display="flex"
            sx={{ mb: 1, gap: 2, height: "auto" }}
            alignItems={"end"}
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
                Start Date<span style={{ color: "red" }}> *</span>
              </Typography>
              <TextField
                type="date"
                InputLabelProps={{ shrink: true }}
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                inputProps={{
                  min: startDateLimit,
                  max: toDate || today,
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
                InputLabelProps={{ shrink: true }}
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                inputProps={{
                  min: fromDate || startDateLimit,
                  max: today,
                }}
                required
                sx={{
                  "& .MuiFormLabel-asterisk": {
                    color: "red",
                  },
                  "& .MuiInputBase-root": {
                    height: "40px",
                  },
                }}
              />
            </Box>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={loading || !fromDate || !toDate}
              sx={{
                height: "40px",
              }}
            >
              {loading ? "Loading..." : "Apply Filter"}
            </Button>
          </Box>
          {!loading && (
            <Grid container spacing={2}>
              {finalData?.map((item) => (
                <Grid item xs={12} md={4} key={item?.id}>
                  <Card
                    sx={{
                      backgroundColor: item?.bgColor,
                      // border: 2,
                      // borderColor: item?.borderColor,
                      borderRadius: 1,
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
                        sx={{
                          mt: 1,
                          fontWeight: 500,
                          color: item?.color,
                          fontSize: "32px",
                        }}
                      >
                        {item?.value}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
          {loading ? (
            <Grid container justifyContent="center">
              <CircularProgress />
            </Grid>
          ) : submitted ? (
            !noDataFound ? (
              <>
                {/* Summary Cards */}
                {/* <Grid container spacing={2}>
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
                </Grid> */}

                {/* PieChart for Totals */}
                <Box sx={{ mt: 4 }}>
                  <CardContent sx={{ p: 0 }}>
                    <Grid container spacing={2}>
                      {/* Left Box - Pie Chart */}
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
                                width={300}
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

                      {/* Right Box - Bar Chart */}
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
                              <Typography variant="subtitle1" gutterBottom>
                                Agents Overview
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
                                The bar chart below shows the distribution of
                                different transaction types in the system.
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
                                      data: rechargeData
                                        .slice(0, 10)
                                        .map((item) => item.agentName),
                                      scaleType: "band",
                                      tickLabelStyle: {
                                        fontSize: "8.5px",
                                      },
                                    },
                                  ]}
                                  series={[
                                    {
                                      data: rechargeData
                                        .slice(0, 10)
                                        .map((item) => item.totalRecharge),
                                      label: "Recharge",
                                      color: "#089B2D",
                                    },
                                    {
                                      data: rechargeData
                                        .slice(0, 10)
                                        .map((item) => item.totalRedeem),
                                      label: "Redeem",
                                      color: "#F20D33",
                                    },
                                    {
                                      data: rechargeData
                                        .slice(0, 10)
                                        .map((item) => item.totalCashout),
                                      label: "Cashout",
                                      color: "#0D46F2",
                                    },
                                  ]}
                                  height={350}
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
                                  margin={{
                                    left: 70,
                                    right: 30,
                                    top: 30,
                                    bottom: rechargeData.length > 5 ? 100 : 70,
                                  }}
                                  sx={{
                                    width: "100%",
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

                {/* Data Grid for Agent Recharge Report */}
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
                    Agent overall Report
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
                      {currentRechargeData.map((row, index) => (
                        <TableRow key={index}>
                          <TableCell>{row.agentName}</TableCell>
                          <TableCell>{row.totalRecharge}</TableCell>
                          <TableCell>{row.totalRedeem}</TableCell>
                          <TableCell>{row.totalCashout}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      width: "100% !important",
                      mt: 1,
                    }}
                  >
                    <CustomPagination
                      page={page}
                      perPage={rowsPerPage}
                      total={filteredRechargeData?.length}
                      setPage={setPage}
                      setPerPage={setRowsPerPage}
                    />
                  </Box>
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
