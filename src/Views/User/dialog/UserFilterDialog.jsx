import React from "react";
import { Button, required, SelectInput } from "react-admin";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

export const UserFilterDialog = ({
  open,
  onClose,
  searchBy,
  role,
  filterValues,
  setFilters,
  handleSearchByChange,
}) => {
  //   const [localSearchBy, setLocalSearchBy] = React.useState(searchBy);
  const [localRole, setLocalRole] = React.useState(filterValues.role || "");

  const searchByChoices =
    role === "Super-User"
      ? [
          { id: "username", name: "Username" },
          { id: "email", name: "Email" },
          { id: "userParentName", name: "Parent Name" },
        ]
      : [
          { id: "username", name: "Username" },
          { id: "email", name: "Email" },
        ];

  const roleChoices = [
    { id: "Super-User", name: "Super-User" },
    { id: "Player", name: "Player" },
    { id: "Agent", name: "Agent" },
    { id: "Master-Agent", name: "Master-Agent" },
  ];

  const handleApply = () => {
    const newFilters = {
      searchBy: searchBy,
    };

    if (localRole) {
      newFilters.role = localRole;
    }

    setFilters(newFilters, false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Filter Options</DialogTitle>
      <DialogContent>
        <FormControl fullWidth sx={{ mb: 2, mt: 2 }}>
          <InputLabel>Search By</InputLabel>
          <Select
            value={searchBy}
            label="Search By"
            onChange={(e) => {
              setLocalRole("");
              const newSearchBy = e.target.value || "username";
              handleSearchByChange(newSearchBy);
            }}
          >
            {searchByChoices.map((choice) => (
              <MenuItem key={choice.id} value={choice.id}>
                {choice.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {role === "Super-User" && (
          <FormControl fullWidth>
            <InputLabel>Role</InputLabel>
            <Select
              value={localRole}
              label="Role"
              onChange={(e) => setLocalRole(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              {roleChoices.map((choice) => (
                <MenuItem key={choice.id} value={choice.id}>
                  {choice.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </DialogContent>
      <DialogActions
        className="p-16 d-flex w-100 justify-content-between"
        sx={{
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "center", sm: "stretch" },
          gap: { xs: 2, sm: 0 },
          marginBottom: 2,
          paddingX: 3,
        }}
      >
        <Button
          onClick={handleApply}
          variant="contained"
          sx={{
            width: "100% !important",
            height: "48px",
            gap: "8px",
            padding: "14px 20px",
            backgroundColor: "#000",
            color: "#fff",
            borderRadius: "4px",
            fontSize: "16px",
            fontWeight: "500",
          }}
        >
          Apply
        </Button>
        <Button
          onClick={onClose}
            sx={{
              width: "100% !important",
              height: "48px",
              gap: "8px",
              padding: "14px 20px",
              border: "1px solid var(--primary-color)", 
              borderRadius: "4px",
              fontSize: "16px",
              fontWeight: "500",
              marginRight: {xs: 1, sm: 0},
            }}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};
