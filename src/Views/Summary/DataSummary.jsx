import React, { useRef } from "react";
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
import { Loader, KPILoader } from "../Loader";

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
  const { data, isFetching } = useListContext();
  const { identity } = useGetIdentity();

  if (isFetching) {
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

  // if (isPending) {
  //   return <Loader />;
  // }

  const finalData = [
    {
      id: 1,
      name: "Total User",
      value: data[0].totalRegisteredUsers,
      bgColor: "#E3F2FD",
      borderColor: "#7EB9FB",
      icon: <PersonIcon color="primary" />,
    },
    {
      id: 2,
      name: "Total Agent",
      value: data[0].totalAgents,
      bgColor: "#dedede",
      borderColor: "#adb5bd",
      icon: <PersonIcon color="info" />,
    },
    {
      id: 3,
      name: "Total Recharges",
      value: "$" + data[0].totalRechargeAmount,
      bgColor: "#EBF9F0",
      borderColor: "#9CDAB8",
      icon: <PaidIcon color="success" />,
    },
    {
      id: 4,
      name: "Total Redeems",
      value: "$" + data[0].totalRedeemAmount,
      bgColor: "#F4F0F9",
      borderColor: "#C4B0DF",
      icon: <PaidIcon color="secondary" />,
    },
    {
      id: 5,
      name: "Pending Recharges",
      value: "$" + data[0].totalPendingRechargeAmount,
      bgColor: "#FFFCEB",
      borderColor: "#FFE787",
      icon: <WarningIcon color="warning" />,
    },
    {
      id: 6,
      name: "Failed Redeems",
      value: "$" + data[0].totalFailRedeemAmount,
      bgColor: "#FFEBEB",
      borderColor: "#FF9C9C",
      icon: <ErrorIcon color="error" />,
    },
  ];

  identity.role === "Agent" && finalData.splice(1, 1);

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

const SearchSelectUsersFilter = () => {
  const { data, isPending } = useGetList("users", {
    pagination: { page: 1, perPage: 10000 },
    sort: { field: "roleName", order: "ASC" },
    filter: { userReferralCode: null },
  });
  // console.log(data);
  // if (isPending) return null;

  if (isPending) {
    return <Loader />;
  }

  return (
    <SelectInput
      label="username"
      source="username"
      choices={data}
      optionText="username"
      optionValue="id"
      alwaysOn
      resettable
      emptyText="All"
    />
  );
};

export const DataSummary = () => {
  const { identity } = useGetIdentity();
  const { data, isFetching } = useGetList(
    "users",
    {
      pagination: { page: 1, perPage: 10000 },
      sort: { field: "roleName", order: "ASC" },
      // filter: { userReferralCode: "" },
      filter: {
        $or: [{ userReferralCode: "" }, { userReferralCode: null }],
      },
    },
    {
      refetchOnWindowFocus: false, // Prevent refetch on focus
      refetchOnReconnect: false,
    }
  );

  const newData = data?.map(
    (item) =>
      item.id !== identity.objectId && {
        ...item,
        optionName: "".concat(item.name, " (", item.roleName, ")"),
      }
  );

  const currentDate = new Date().toLocaleDateString("es-CL");
  const prevYearDate = new Date(
    new Date().setFullYear(new Date().getFullYear() - 1)
  ).toLocaleDateString("es-CL");
  const nextYearDate = new Date(
    new Date().setFullYear(new Date().getFullYear() + 1)
  ).toLocaleDateString("es-CL");
  const dataFilters = [
    <AutocompleteInput
      label="User"
      source="username"
      choices={newData}
      optionText="optionName"
      optionValue="id"
      alwaysOn
      resettable
      emptyText="All"
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
      InputProps={{
        inputProps: { max: new Date().toISOString().split("T")[0] },
      }}
    />,

    // <SearchSelectUsersFilter />,
  ];

  return (
    <React.Fragment>
      <ListBase>
        <FilterForm
          filters={dataFilters}
          sx={{
            flex: "0 2 auto !important",
            padding: "0px 0px 0px 0px !important",
            alignItems: "flex-start",
          }}
        />
        {isFetching ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="50vh"
          >
            <Loading />
          </Box>
        ) : (
          <Summary />
        )}
      </ListBase>
    </React.Fragment>
  );
};
