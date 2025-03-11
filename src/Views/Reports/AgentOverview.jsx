import {
  Grid,
  CircularProgress,
  Button,
  TextField,
  Autocomplete,
  Box,
} from "@mui/material";
import { LineChart } from "@mui/x-charts/LineChart";
import { useGetIdentity } from "react-admin";
import React, { useCallback, useState } from "react";
import { dataProvider } from "../../Provider/parseDataProvider";
import { fetchTransactionsofAgentByDate } from "../../Utils/utils";
import debounce from "lodash/debounce";

export const AgentOverview = () => {
  const { identity } = useGetIdentity();
  const [formattedData, setFormattedData] = useState([]);
  const [lineChartDates, setLineChartDates] = useState([]);
  const [agentUsername, setAgentUsername] = useState("");
  const perPage = 10;
  const [choices, setChoices] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userLoading, setUserLoading] = useState(false);
  const today = new Date().toISOString().split("T")[0]; // Format as YYYY-MM-DD
  const startDateLimit = "2024-12-01"; // Start date limit: 1st December 2025
  const [tempStartDate, setTempStartDate] = useState("");
  const [tempEndDate, setTempEndDate] = useState("");
  const [selectedUsertemp, setSelectedUsertemp] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [agentLoading, setAgentLoading] = useState(false);

  const fetchUsers = async (search = "", pageNum = 1) => {
    setUserLoading(true);
    try {
      const { data } = await dataProvider.getList("users", {
        pagination: { page: pageNum, perPage },
        sort: { field: "username", order: "ASC" },
        filter: search
          ? {
              username: search,
              $or: [{ userReferralCode: "" }, { userReferralCode: null }],
            }
          : {
              $or: [{ userReferralCode: "" }, { userReferralCode: null }],
            },
      });

      const formattedData = data
        ?.map(
          (item) =>
            item?.id !== identity?.objectId && {
              ...item,
              optionName: `${item.username} (${item.roleName})`,
            }
        )
        .filter(Boolean); // Remove `false` values (filtered-out identities)

      setChoices(formattedData);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
    setUserLoading(false);
  };

  const handleUserChange = (selectedId) => {
    setSelectedUsertemp(selectedId);
  };

  const debouncedFetchUsers = useCallback(debounce(fetchUsers, 500), []);

  const fetchSingleAgentData = async () => {
    try {
      setAgentLoading(true);
      const transactionResultByDate = await fetchTransactionsofAgentByDate({
        startDate: tempStartDate,
        endDate: tempEndDate,
        agentId: selectedUsertemp.id,
      });
      console.log("transactionResultByDate", transactionResultByDate);

      const agent = transactionResultByDate.data[0];
      setAgentUsername(agent);
      const dates = Object.keys(agent.transactions).sort(
        (a, b) => new Date(a) - new Date(b)
      );
      const formattedDates = dates.map((date) => {
        const d = new Date(date);
        return `${d.toLocaleString("default", {
          month: "short",
        })} ${d.getDate()}, ${d.getFullYear()}`;
      });
      setLineChartDates(dates);
      setFormattedData(formattedDates);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setAgentLoading(false);
    }
  };

  const handleFilterSubmit = () => {
    setStartDate(tempStartDate);
    setEndDate(tempEndDate);
    setSelectedUser(selectedUsertemp);
    fetchSingleAgentData();
  };

  return (
    <>
      {/* Date Filters */}
      {identity?.email === "zen@zen.com" && (
        <>
          {/* <Box display="flex" sx={{ mb: 1 }}>
            <ListBase resource="users" filter={{ username: selectedUser?.id }}>
              <FilterForm
                filters={dataFilters}
                sx={{
                  flex: "0 2 auto !important",
                  padding: "0px 0px 0px 0px !important",
                  alignItems: "flex-start",
                }}
              />
              <Button
                source="date"
                variant="contained"
                onClick={handleFilterSubmit}
                sx={{ marginRight: "10px", whiteSpace: "nowrap" }}
              >
                Apply Filter
              </Button>
            </ListBase>
          </Box> */}
          <Box display="flex" sx={{ mb: 1, gap: 2 }}>
            <Autocomplete
              sx={{ width: 230 }}
              options={choices}
              getOptionLabel={(option) => option.optionName}
              isOptionEqualToValue={(option, value) => option.id === value?.id}
              loading={userLoading}
              loadingText="....Loading"
              value={selectedUsertemp}
              onChange={(event, newValue) => handleUserChange(newValue)}
              onInputChange={(event, newInputValue, reason) => {
                if (reason === "input") {
                  debouncedFetchUsers(newInputValue, 1);
                  setSelectedUsertemp(null);
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Username"
                  variant="outlined"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {userLoading ? <CircularProgress size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
            <TextField
              label="Start Date"
              type="date"
              value={tempStartDate}
              onChange={(event) => setTempStartDate(event.target.value)}
              InputLabelProps={{ shrink: true }}
              inputProps={{
                min: startDateLimit,
                max: tempEndDate || today,
              }}
            />
            <TextField
              label="End Date"
              type="date"
              value={tempEndDate}
              onChange={(event) => setTempEndDate(event.target.value)}
              InputLabelProps={{ shrink: true }}
              inputProps={{
                min: tempStartDate || startDateLimit,
                max: today,
              }}
            />
            <Button
              variant="contained"
              onClick={handleFilterSubmit}
              sx={{ whiteSpace: "nowrap" }}
            >
              Apply Filter
            </Button>
          </Box>

          {/* Line Chart */}
          {agentLoading ? (
            <Grid container justifyContent="center">
              <CircularProgress />
            </Grid>
          ) : formattedData && lineChartDates && agentUsername ? (
            <LineChart
              xAxis={[
                {
                  data: formattedData,
                  scaleType: "band",
                  label: "Date",
                },
              ]}
              yAxis={[
                {
                  label: "Amount",
                },
              ]}
              series={[
                {
                  data: lineChartDates.map(
                    (date) => agentUsername.transactions[date].totalRecharge
                  ),
                  label: "Total Recharge",
                  color: "#2196f3",
                },
                {
                  data: lineChartDates.map(
                    (date) => agentUsername.transactions[date].totalRedeem
                  ),
                  label: "Total Redeem",
                  color: "#f44336",
                },
                {
                  data: lineChartDates.map(
                    (date) => agentUsername.transactions[date].totalCashout
                  ),
                  label: "Total Cashout",
                  color: "#4caf50",
                },
              ]}
              width={1200}
              height={400}
              margin={{ left: 70, right: 40, top: 40, bottom: 70 }}
            ></LineChart>
          ) : (
            <>
              <Grid container justifyContent="center">
                <p>No data found for the selected filters.</p>
              </Grid>
            </>
          )}
        </>
      )}
    </>
  );
};
