import React, { useEffect, useState } from "react";
import {
  useGetIdentity,
  useGetList,
  Loading,
  SearchInput,
  List,
  TextInput,
  SelectInput,
  AutocompleteInput,
  DateInput,
  SimpleForm,
  TextField,
  SimpleShowLayout,
  useListContext,
  ListBase,
  FilterForm,
  minValue,
  maxValue,
} from "react-admin";

import { Loader } from "../Loader";

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

const Test = () => {
  const { data, isPending, isFetching } = useListContext();

  if (isPending) {
    return <Loader />;
  }

  if (isFetching) {
    return <Loading />;
  }

  // Convert the array into an object
  const rawData = data?.reduce((acc, { key, value }) => {
    acc[key] = value;
    return acc;
  }, {});

  const finalData = [
    {
      id: 1,
      name: "Total User",
      value: rawData?.totalUsersCount,
      bgColor: "#E3F2FD",
      borderColor: "#7EB9FB",
      icon: <PersonIcon color="primary" />,
    },
    {
      id: 2,
      name: "Total Agent",
      value: rawData?.totalAgentCount,
      bgColor: "#dedede",
      borderColor: "#adb5bd",
      icon: <PersonIcon color="info" />,
    },
    {
      id: 3,
      name: "Total Recharges",
      value: "$" + rawData?.totalRechargeAmount,
      bgColor: "#EBF9F0",
      borderColor: "#9CDAB8",
      icon: <PaidIcon color="success" />,
    },
    {
      id: 4,
      name: "Total Redeems",
      value: "$" + rawData?.totalRedeemAmount,
      bgColor: "#F4F0F9",
      borderColor: "#C4B0DF",
      icon: <PaidIcon color="secondary" />,
    },
    {
      id: 5,
      name: "Pending Recharges",
      value: "$" + rawData?.totalPendingRechargeAmount,
      bgColor: "#FFFCEB",
      borderColor: "#FFE787",
      icon: <WarningIcon color="warning" />,
    },
    {
      id: 6,
      name: "Failed Redeems",
      value: "$" + rawData?.totalFailRedeemAmount,
      bgColor: "#FFEBEB",
      borderColor: "#FF9C9C",
      icon: <ErrorIcon color="error" />,
    },
  ];

  return (
    <Grid container spacing={2} mt>
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
  );
};

export const Summary = () => {
  const [filters, setFilters] = useState({
    roleName: "",
    userId: "",
  });

  const { data , isFetching } = useGetList("users", {
    pagination: { page: 1, perPage: 10000 },
    sort: { field: "roleName", order: "DEC" },
    filter: { userReferralCode: "" },
  });

  const choices = data?.map((item) => ({
    id: item.id,
    roleName: item.roleName,
    username: item.username,
    displayText: `${item.username} (${item.roleName})`,
  }));

  // Handle filter update
  const handleFilterUpdate = (value) => {
    if (value) {
      // Update filters based on the selected value
      const updatedFilters = {
        ...filters,
        roleName: value.roleName,
        userId: value.id,
      };
      setFilters(updatedFilters);
      console.log("Updated Filters:", updatedFilters);
    }
  };

  const dataFilters = [
    <AutocompleteInput
      label="User"
      source="username"
      choices={choices}
      optionText="displayText"
      onChange={(event, value) => handleFilterUpdate(value)}
      optionValue="id"
      alwaysOn
      resettable
      emptyText="All"
      sx={{width:"200px"}}
    />,
    <DateInput
      label="Start date"
      source="startdate"
      alwaysOn
      resettable
      // validate={maxValue(currentDate)}
    />,
    <DateInput
      label="End date"
      source="enddate"
      alwaysOn
      resettable
      // validate={maxValue(currentDate)}
    />,
  ];

  return (
    <React.Fragment>
      <ListBase filter={filters}>
        <FilterForm
          filters={dataFilters}
          sx={{
            flex: "0 2 auto !important",
            padding: "0px 0px 0px 0px !important",
            alignItems: "flex-start",
          }}
        />
          {isFetching ? <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
      >
        <Loading />
      </Box> :  <Test />}
      </ListBase>
    </React.Fragment>
  );
};
