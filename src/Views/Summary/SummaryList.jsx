import React, { useEffect, useState } from "react";
// react admin
import { useDataProvider, useGetIdentity } from "react-admin";
// mui
import { Typography } from "@mui/material";

export const SummaryList = () => {
  const { identity } = useGetIdentity();
  const dataProvider = useDataProvider();

  const [data, setData] = useState({
    rechargeRecords: [],
    redeemRecords: [],
    userRecords: [],
  });

  useEffect(() => {
    const fetchAllData = async () => {
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
      }
    };

    fetchAllData();
  }, [dataProvider]);

  const totalRechargeAmount =
    data.rechargeRecords
      ?.filter((item) => item.status === 2)
      .reduce((sum, item) => sum + item.transactionAmount, 0) || 0;

  const totalRedeemAmount =
    data.redeemRecords
      ?.filter((item) => item.status === 4)
      .reduce((sum, item) => sum + item.transactionAmount, 0) || 0;

  // Calculate total agents based on role: "agent"
  const totalAgents =
    data.userRecords?.filter((user) => user.roleName === "Agent").length || 0;

  return (
    <React.Fragment>
      <Typography sx={{ mt: 2 }}>
        Total Users: <b>{data.userRecords?.length || 0}</b>
      </Typography>
      {identity?.role === "Super-User" && (
        <Typography sx={{ mt: 2 }}>
          Total Agents: <b>{totalAgents}</b>
        </Typography>
      )}
      <Typography sx={{ mt: 2 }}>
        Total Recharged Amount: <b>${totalRechargeAmount}</b>
      </Typography>
      <Typography sx={{ mt: 2 }}>
        Total Redeemed Amount: <b>${totalRedeemAmount}</b>
      </Typography>
    </React.Fragment>
  );
};
