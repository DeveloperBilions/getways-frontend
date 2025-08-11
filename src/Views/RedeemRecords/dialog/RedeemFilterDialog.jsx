import React from "react";
import { Button } from "react-admin";
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

export const ReedemFilterDialog = ({
  open,
  onClose,
  searchBy,
  role,
  filterValues,
  setFilters,
  handleSearchByChange,
}) => {
  //   const [localSearchBy, setLocalSearchBy] = React.useState(searchBy);
  const [localStatus, setLocalStatus] = React.useState(
    filterValues.status || ""
  );

  const searchByChoices =
    role === "Super-User"
      ? [
          { id: "username", name: "Account" },
          { id: "transactionAmount", name: "Reedem" },
          { id: "remark", name: "Remark" },
          { id: "userParentName", name: "Parent Name" },
        ]
      : role === "Player"
      ? [
          { id: "transactionAmount", name: "Redeem" },
          { id: "remark", name: "Remark" },
        ]
      : [
          { id: "username", name: "Account" },
          { id: "transactionAmount", name: "Redeem" },
          { id: "remark", name: "Remark" },
        ];

  const statusChoices = [
    // { id: 5, name: "Failed" },
    { id: 6, name: "Pending Approval" },
    { id: 7, name: "Rejected" },
    { id: 8, name: "Redeem Successfully" },
    { id: 9, name: "Expired" },
    { id: 10, name: "Failed Transaction" },
    ...(role === "Super-User"
      ? [
          { id: 11, name: "Cashouts" },
          { id: 12, name: "Cashout Successfully" },
          { id: 13, name: "Cashout Reject" },
        ]
      : []),
  ];

  const handleApply = () => {
    const newFilters = {
      searchBy: searchBy,
    };

    if (localStatus) {
      newFilters.status = localStatus;
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
              setLocalStatus("");
              const newSearchBy = e.target.value;
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

        {role !== "Player" && (
          <FormControl fullWidth>
            <InputLabel shrink>Status</InputLabel>
            <Select
            displayEmpty
            value={localStatus}
            renderValue={(selected) => {
              if (selected === "") {
                return <em>All</em>;
              }
              const found = statusChoices.find((c) => c.id === selected);
                return found ? found.name : selected;
            }}
              label="Status"
              onChange={(e) => setLocalStatus(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              {statusChoices.map((choice) => (
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
            marginRight: { xs: 1, sm: 0 },
          }}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};
