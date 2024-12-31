import React from "react";
import { useGetList } from "react-admin";
import { TextField, Autocomplete } from "@mui/material";

export const Summary = () => {
  const { data } = useGetList("users", {
    pagination: { page: 1, perPage: 10000 },
    sort: { field: "roleName", order: "DEC" },
    filter: { userReferralCode: null },
  });

  // Function to extract desired information
  const extractUserInfo = (item) => {
    if (item && item.length !== 0) {
      return item.map((ele) => ({
        id: ele.id,
        label: ele.username,
        roleName: ele.roleName,
        userParentId: ele.userParentId,
        userParentName: ele.userParentName,
      }));
    }
  };

  const userList = extractUserInfo(data);

  const handleSelect = (event, value) => {
    if (value) {
      console.log("ID:", value.id);
      console.log("Role:", value.roleName);
      console.log("Username:", value.label);
    }
  };
  return (
    <Autocomplete
      disablePortal
      options={userList || []}
      getOptionLabel={(option) => `${option.label} (${option.roleName})`}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      onChange={handleSelect}
      sx={{ width: 300 }}
      renderInput={(params) => <TextField {...params} label="Users" />}
    />
  );
};
