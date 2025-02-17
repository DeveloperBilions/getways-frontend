import {
    Typography,
    Card,
    CardContent,
    Grid,
    TextField,
    CircularProgress,
    Button,
  } from "@mui/material";
  import PersonIcon from "@mui/icons-material/Person";
  import { useEffect, useState } from "react";
  import { dataProvider } from "../../Provider/parseDataProvider";
  
  export const Reports = () => {
    const [data, setData] = useState();
    const [fromDate, setFromDate] = useState(""); // From Date
    const [toDate, setToDate] = useState(""); // To Date
    const [loading, setLoading] = useState(false); // Loading state
    const [submitted, setSubmitted] = useState(false); // To track if data should be fetched
  
    const fetchData = async () => {
      try {
        setLoading(true);
        const filter = {};
        if (fromDate) filter.fromDate = fromDate;
        if (toDate) filter.toDate = toDate;
  
        const result = await dataProvider.getList("Report", {
          pagination: { page: 1, perPage: 1000 },
          sort: { field: "transactionDate", order: "DESC" },
          filter, // Apply filters
        });
  
        setData(result[0]);
      } catch (error) {
        console.error("Error fetching summary report:", error);
      } finally {
        setLoading(false);
      }
    };
  
    useEffect(() =>{
        setSubmitted(true);
        fetchData();
    },[])
    // Trigger API only when submit button is clicked
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
  
    return (
      <>
        {/* Date Filters */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="From Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
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
  
        {/* Loading State */}
        {loading ? (
          <Grid container justifyContent="center">
            <CircularProgress />
          </Grid>
        ) : (
          submitted && (
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
                      <Typography variant="h4" sx={{ mt: 1, fontWeight: "bold" }}>
                        {item?.value}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )
        )}
      </>
    );
  };
  