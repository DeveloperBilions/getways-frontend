import {
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Button,
  TextField
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import {
  Datagrid,
  List,
  SearchInput,
  DateField,
  NumberField,
  FunctionField,
  TopToolbar,
  usePermissions,
  useGetIdentity,
  useGetList,
  useRefresh,
  SelectInput,
  useListController,
  Pagination,
} from "react-admin";
import { useEffect, useState } from "react";
import { dataProvider } from "../../Provider/parseDataProvider";
import { fetchTransactionsofAgent, getAgentRechargeReport } from "../../Utils/utils";

export const Reports = () => {
  const [data, setData] = useState();
  const [rechargeData, setRechargeData] = useState([]); // For agent recharge report
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const fetchData = async () => {
    try {
      console.log(fromDate,toDate,"date")
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
        endDate: toDate
      });
             setRechargeData(transactionResult?.data || []);
      console.log(transactionResult ,"rechargeDatarechargeDatarechargeData")
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    //setSubmitted(true);
    //fetchData();
  }, []);

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

  const columns = [
    { field: "agentName", headerName: "Agent Name", width: 200 },
    { field: "totalAmount", headerName: "Total Recharge", width: 200 },
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
                      <Typography variant="h4" sx={{ mt: 1, fontWeight: "bold" }}>
                        {item?.value}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Data Grid for Agent Recharge Report */}
            <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
              Agent Recharge Report
            </Typography>
            <div style={{ height: 400, width: "100%" }}>
            <List title="Agent Transactions" exporter={false} actions={false}>
  <Datagrid data={rechargeData}>
    <FunctionField
            label="agentName"
            render={(record) => {
              return record?.agentName;
            }}
          />
          <FunctionField
            label="totalTransactionAmount"
            render={(record) => {
              return record?.totalAmount;
            }}
            sortable
          />
  </Datagrid>
</List>
            </div>
          </>
        )
      )}
    </>
  );
};
