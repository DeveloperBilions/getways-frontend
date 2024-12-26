import React from "react";
import {
  useGetIdentity,
  useGetList,
  Loading,
  SearchInput,
  List,
  TextInput,
  SelectInput,
  SimpleForm,
  TextField,
  SimpleShowLayout,
  useListContext,
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

const Summary = () => {
  const { data, isPending } = useListContext();
  
  if (isPending) {
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

  const totalUsers = data[0]?.users.length - 1; //excluding self
  const totalAgents = data[0]?.users
    ?.filter(item => item.roleName === 'Agent')
    .length;
  const totalRechargeAmount =
    data[0]?.transactions
      ?.filter((item) => item.status === 2 || item.status === 3)
      .reduce((sum, item) => sum + item.transactionAmount, 0) || 0;
  const totalRedeemAmount =
    data[0]?.transactions
      ?.filter((item) => item.status === 4)
      .reduce((sum, item) => sum + item.transactionAmount, 0) || 0;
  const totalPendingRechargeAmount =
    data[0]?.transactions
      ?.filter((item) => item.status === 1)
      .reduce((sum, item) => sum + item.transactionAmount, 0) || 0;
  const totalFailRedeemAmount =
    data[0]?.transactions
      ?.filter((item) => item.status === 5)
      .reduce((sum, item) => sum + item.transactionAmount, 0) || 0;

  const finalData = [
    {
      id: 1,
      name: "Total User",
      value: totalUsers,
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
      value: "$" + totalPendingRechargeAmount,
      bgColor: "#FFFCEB",
      borderColor: "#FFE787",
      icon: <WarningIcon color="warning" />,
    },
    {
      id: 6,
      name: "Failed Redeems",
      value: "$" + totalFailRedeemAmount,
      bgColor: "#FFEBEB",
      borderColor: "#FF9C9C",
      icon: <ErrorIcon color="error" />,
    },
  ];


  return <Grid container spacing={2} mt>
        {finalData
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
      </Grid>;

  /*return (<>
      <div>Number of users: {totalUsers} </div>
      <div>Number of agents: {totalAgents} </div>
      <div>Total recharge: {totalRechargeAmount} </div>
      <div>Total redeem: {totalRedeemAmount} </div>
      <div>Pending Recharge: {totalPendingRechargeAmount} </div>
      <div>Failed Redeem: {totalFailRedeemAmount} </div>
    </>); */
}

const SearchSelectUsersFilter = () => {
  const { data, isPending } = useGetList('users');
  // console.log(data);
  // if (isPending) return null;
  return (<SelectInput 
    label="username" 
    source="username" 
    choices={data}
    optionText="username"
    optionValue="id"
    alwaysOn 
    resettable 
    emptyText="All"
  />);
}

export const DataSummary = () => {
  const { data, isPending } = useGetList('users');

  const newData = data.map(item => ({...item, optionName: "Role: ".concat(item.roleName, " - ", item.name)}))

  const dataFilters = [
      <SelectInput 
      label="User" 
      source="username" 
      choices={newData}
      optionText="optionName"
      optionValue="id"
      alwaysOn 
      resettable 
      emptyText="All"
    />
    // <SearchSelectUsersFilter />,
  ];

  return (
    <React.Fragment>
      <ListBase>
        <FilterForm filters={dataFilters} sx={{flex: "0 2 auto", padding: "4px 0 px 0"}}/>
        <Summary />
      </ListBase>
    </React.Fragment>
  );
};
