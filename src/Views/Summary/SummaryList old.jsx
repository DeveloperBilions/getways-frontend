import React, { useEffect, useState } from "react";
import {
  useDataProvider,
  useGetIdentity,
  Loading,
  SearchInput,
  List,
  TextInput,
  SimpleForm,
  TextField,
  SimpleShowLayout,
  useListContext,
  ListContextProvider,
  useListController,
  ListBase,
  FilterForm,
} from "react-admin";
// mui
import {
  Typography,
  Card,
  CardContent,
  Grid,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from "@mui/material";
// mui icons
import PersonIcon from "@mui/icons-material/Person";
import PaidIcon from "@mui/icons-material/Paid";
import ErrorIcon from "@mui/icons-material/Error";
import WarningIcon from "@mui/icons-material/Warning";

import { Parse } from "parse";
// Initialize Parse
Parse.initialize(process.env.REACT_APP_APPID, process.env.REACT_APP_MASTER_KEY);
Parse.serverURL = process.env.REACT_APP_URL;

export const Aside = () => {
  const { data, isPending, filterValues, setFilters, resource, perPage } =
    useListContext();

  setFilters({ username: "dhyan" });

  const totalUsers =
    data?.filter(
      (ele) =>
        ele.roleName === "Super-User" ||
        ele.roleName === "Agent" ||
        ele.roleName === "Player"
    ).length || 1;

  const totalAgents =
    data?.filter((ele) => ele.roleName === "Agent").length || 1;

  const totalRechargeAmount =
    data
      ?.filter((item) => item.status === 2 || item.status === 3)
      .reduce((sum, item) => sum + item.transactionAmount, 0) || 0;

  const totalRedeemAmount =
    data
      ?.filter((item) => item.status === 4)
      .reduce((sum, item) => sum + item.transactionAmount, 0) || 0;

  const totalPendingRecharge =
    data
      ?.filter((item) => item.status === 1)
      .reduce((sum, item) => sum + item.transactionAmount, 0) || 0;

  const totalFailRedeem =
    data
      ?.filter((item) => item.status === 5)
      .reduce((sum, item) => sum + item.transactionAmount, 0) || 0;

  if (isPending) return null;
  return (
    <div>
      <div>Total Users:{totalUsers}</div>
      <div>Total Agent:{totalAgents}</div>
      <div>Total Recharges:{totalRechargeAmount}</div>
      <div>Total Redeems:{totalRedeemAmount}</div>
      <div>Pending Recharges:{totalPendingRecharge}</div>
      <div>Failed Redeems:{totalFailRedeem}</div>
    </div>
  );
};

export const SummaryList = () => {
  const { identity } = useGetIdentity();
  const dataProvider = useDataProvider();

  const [sumaryData, setSumaryData] = useState({});
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState("");

  const [data, setData] = useState({
    rechargeRecords: [],
    redeemRecords: [],
    userRecords: [],
  });

  const summaryData = async () => {
    try {
      const response = await Parse.Cloud.run("summaryFilter", {
        role: identity?.role,
        id: identity?.objectId,
      });
      setSumaryData(response);
    } catch (error) {
      console.error("Error fetching summary", error.message);
    }
  };

  const readableUsersData = sumaryData?.data?.users.map((user) =>
    user.toJSON()
  );
  const readableTransactionData =
    sumaryData?.data?.transactions &&
    sumaryData?.data?.transactions.map((user) => user.toJSON());

  useEffect(() => {
    summaryData();
  }, [identity]);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const [usersResponse, rechargeResponse, redeemResponse] =
          await Promise.all([
            dataProvider.getList("users", {
              pagination: { page: 1, perPage: 100 },
              sort: { field: "id", order: "ASC" },
              filter: {},
            }),
            dataProvider.getList("rechargeRecords", {
              pagination: { page: 1, perPage: 100 },
              sort: { field: "id", order: "ASC" },
              filter: {},
            }),
            dataProvider.getList("redeemRecords", {
              pagination: { page: 1, perPage: 100 },
              sort: { field: "id", order: "ASC" },
              filter: {},
            }),
          ]);

        setData({
          userRecords: usersResponse.data,
          rechargeRecords: rechargeResponse.data,
          redeemRecords: redeemResponse.data,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [dataProvider]);

  const totalAgents =
    readableUsersData?.filter((ele) => ele.roleName === "Agent").length || 1;

  const totalRechargeAmount =
    readableTransactionData
      ?.filter((item) => item.status === 2 || item.status === 3)
      .reduce((sum, item) => sum + item.transactionAmount, 0) || 0;

  const totalRedeemAmount =
    readableTransactionData
      ?.filter((item) => item.status === 4)
      .reduce((sum, item) => sum + item.transactionAmount, 0) || 0;

  const totalPendingRecharge =
    readableTransactionData
      ?.filter((item) => item.status === 1)
      .reduce((sum, item) => sum + item.transactionAmount, 0) || 0;

  const totalFailRedeem =
    readableTransactionData
      ?.filter((item) => item.status === 5)
      .reduce((sum, item) => sum + item.transactionAmount, 0) || 0;

  const finalData = [
    {
      id: 1,
      name: "Total User",
      value: readableUsersData?.length,
      bgColor: "#E3F2FD",
      borderColor: "#7EB9FB",
      icon: <PersonIcon color="primary" />,
    },
    {
      id: 2,
      name: "Total Agent",
      value: totalAgents,
      bgColor: "#dedede",
      borderColor: "#adb5bd",
      icon: <PersonIcon color="info" />,
    },
    {
      id: 3,
      name: "Total Recharges",
      value: "$" + totalRechargeAmount,
      bgColor: "#EBF9F0",
      borderColor: "#9CDAB8",
      icon: <PaidIcon color="success" />,
    },
    {
      id: 4,
      name: "Total Redeems",
      value: "$" + totalRedeemAmount,
      bgColor: "#F4F0F9",
      borderColor: "#C4B0DF",
      icon: <PaidIcon color="secondary" />,
    },
    {
      id: 5,
      name: "Pending Recharges",
      value: "$" + totalPendingRecharge,
      bgColor: "#FFFCEB",
      borderColor: "#FFE787",
      icon: <WarningIcon color="warning" />,
    },
    {
      id: 6,
      name: "Failed Redeems",
      value: "$" + totalFailRedeem,
      bgColor: "#FFEBEB",
      borderColor: "#FF9C9C",
      icon: <ErrorIcon color="error" />,
    },
  ];

  const handleSubmit = async () => {
    // Find the selected user from the data
    const selectedUserObj = data.userRecords?.find(
      (user) => user.username === selectedUser
    );
    try {
      const response = await Parse.Cloud.run("summaryFilter", {
        role: selectedUserObj?.roleName,
        id: selectedUserObj?.id,
      });
      setSumaryData(response);
    } catch (error) {
      console.error("Error fetching summary", error.message);
    }
  };

  useEffect(() => {
    summaryData();
  }, [identity]);

  if (loading) {
    // React-admin Loading component
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
      >
        <Loading />
      </Box>
    );
  }

  const dataFilters = [<SearchInput source="username" alwaysOn resettable />];

  const ListToolbar = () => <FilterForm filters={dataFilters} />;

  return (
    <React.Fragment>
      <ListBase>
        {/* <ListToolbar /> */}
        <Aside />
        {/* <Box sx={{ mt: 2 }}>
        <FormControl sx={{ minWidth: 410 }}>
          <InputLabel id="demo-simple-select-label">User Name</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            label="User Name"
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
          >
            {data.userRecords?.map((user) => (
              <MenuItem key={user?.id} value={user.username}>
                {user.username} - {user.roleName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <Box mt={2}>
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          Submit
        </Button>
      </Box> */}
        <Grid container spacing={2} mt>
          {finalData
            .filter((item) => {
              if (
                item.name === "Total Agent" &&
                identity?.role !== "Super-User"
              ) {
                return false;
              }
              return true;
            })
            .map((item) => (
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
      </ListBase>
    </React.Fragment>
  );
};
