import React, { useEffect, useState } from "react";
import { useDataProvider, useGetIdentity, Loading } from "react-admin";
// mui
import {
  Typography,
  Card,
  CardContent,
  Grid,
  Box,
  TextField,
} from "@mui/material";
// mui icons
import PersonIcon from "@mui/icons-material/Person";
import PaidIcon from "@mui/icons-material/Paid";
import ErrorIcon from "@mui/icons-material/Error";
import WarningIcon from "@mui/icons-material/Warning";
// date picker
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";

export const SummaryList = () => {
  const { identity } = useGetIdentity();
  const dataProvider = useDataProvider();
  console.log("=====", identity);

  const [data, setData] = useState({
    rechargeRecords: [],
    redeemRecords: [],
    userRecords: [],
  });

  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [selectedUsername, setSelectedUsername] = useState(null);

  // Fetch all data
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

  // Function to filter records based on date range
  const filterByDate = (records, startDate, endDate) => {
    return records.filter((record) => {
      const recordDate = new Date(record.createdAt); // assuming 'createdAt' is the field containing the record date
      return recordDate >= startDate && recordDate <= endDate;
    });
  };

  // Filter the users based on the selected username
  const selectedUser = data.userRecords.find(
    (user) => user.username === selectedUsername
  );

  const userChildren = selectedUser
    ? data.userRecords.filter((item) => item.userParentId === selectedUser.id)
    : [];

  // Filter users based on role
  const filteredUsers = !selectedUser
    ? data.userRecords // If no user is selected, show all users
    : selectedUser.roleName === "Super-User"
    ? data.userRecords // Show all users if Superuser
    : selectedUser.roleName === "Agent"
    ? userChildren // Show only child users if Agent
    : selectedUser.roleName === "Player"
    ? [selectedUser] // Show only the selected player if Player
    : []; // If no matching role, show nothing

  // Filter recharge records based on selected user role
  const filteredRecharge =
    selectedUser?.roleName === "Super-User"
      ? data.rechargeRecords // Show all recharge records if Super-User
      : selectedUser?.roleName === "Agent"
      ? data.rechargeRecords.filter(
          (record) => record.userId === selectedUser.id
        ) // Show agent's recharge records if Agent
      : selectedUser?.roleName === "Player"
      ? data.rechargeRecords.filter(
          (record) => record.userId === selectedUser.id
        ) // Show player's recharge records if Player
      : []; // No recharge records for undefined roles

  // Calculate the count based on the selected user's role
  const userCount = selectedUser
    ? selectedUser.roleName === "Super-User"
      ? data.userRecords?.filter((user) => user.roleName === "Agent").length
      : selectedUser.roleName === "Agent"
      ? 1 // Show children count for Agent
      : selectedUser.roleName === "Player"
      ? 1 // Show count of 1 for Player
      : 0 // Default case (no matching role)
    : data.userRecords?.filter((user) => user.roleName === "Agent").length;

  useEffect(() => {
    if (selectedUser) {
      // console.log("*** role ***", selectedUser.roleName);
      // console.log("$$$ child user $$$", filteredUsers);
      console.log("@@@ child recharge @@@", filteredRecharge);
    }
  }, [selectedUser]);

  console.log("&&&&&", data);

  const totalAgents =
    data.userRecords?.filter((user) => user.roleName === "Agent").length || 0;

  const filteredRechargeRecords = filterByDate(
    data.rechargeRecords,
    startDate,
    endDate
  );
  const filteredRedeemRecords = filterByDate(
    data.redeemRecords,
    startDate,
    endDate
  );

  const totalRechargeAmount =
    filteredRechargeRecords
      ?.filter((item) => item.status === 2 || item.status === 3)
      .reduce((sum, item) => sum + item.transactionAmount, 0) || 0;

  const totalRedeemAmount =
    filteredRedeemRecords
      ?.filter((item) => item.status === 4)
      .reduce((sum, item) => sum + item.transactionAmount, 0) || 0;

  const totalPendingRecharge =
    filteredRechargeRecords
      ?.filter((item) => item.status === 1)
      .reduce((sum, item) => sum + item.transactionAmount, 0) || 0;

  const totalFailRedeem =
    filteredRedeemRecords
      ?.filter((item) => item.status === 5)
      .reduce((sum, item) => sum + item.transactionAmount, 0) || 0;

  const finalData = [
    {
      id: 1,
      name: "Total User",
      value: filteredUsers?.length,
      bgColor: "#E3F2FD",
      borderColor: "#7EB9FB",
      icon: <PersonIcon color="primary" />,
    },
    {
      id: 2,
      name: "Total Agent",
      value: userCount,
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

  if (loading) {
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

  return (
    <React.Fragment>
      <div>
        {/* <label>Start Date: </label>
        <DatePicker
          selected={startDate}
          onChange={(date) => {
            setStartDate(date);
            console.log("Start Date changed:", date);
          }}
          dateFormat="yyyy/MM/dd"
        />
        <br />
        <label>End Date: </label>
        <DatePicker
          selected={endDate}
          onChange={(date) => {
            setEndDate(date);
            console.log("End Date changed:", date);
          }}
          dateFormat="yyyy/MM/dd"
        /> */}
        <br />
        <label>Username: </label>
        <select
          onChange={(e) => setSelectedUsername(e.target.value)}
          value={selectedUsername || ""}
        >
          <option value="">Select User</option>
          {data.userRecords.map((user) => (
            <option key={user.id} value={user.username}>
              {user.username} - {user.roleName}
            </option>
          ))}
        </select>
      </div>
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
    </React.Fragment>
  );
};
