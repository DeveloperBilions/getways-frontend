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
  if (isPending) return null;
  // console.log(data);
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

  return (<>
      <div>Number of users: {totalUsers} </div>
      <div>Number of agents: {totalAgents} </div>
      <div>Total recharge: {totalRechargeAmount} </div>
      <div>Total redeem: {totalRedeemAmount} </div>
      <div>Pending Recharge: {totalPendingRechargeAmount} </div>
      <div>Failed Redeem: {totalFailRedeemAmount} </div>
    </>);
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

  const dataFilters = [
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
    // <SearchSelectUsersFilter />,
  ];

  return (
    <React.Fragment>
      <ListBase>
        <FilterForm filters={dataFilters} />
        <Summary />
      </ListBase>
    </React.Fragment>
  );
};
