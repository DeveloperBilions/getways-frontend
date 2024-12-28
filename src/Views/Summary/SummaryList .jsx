import React, { useEffect, useState } from "react";
import { useDataProvider, useGetIdentity, Loading } from "react-admin";
// mui
import { Typography, Card, CardContent, Grid, Box } from "@mui/material";
// mui icons
import PersonIcon from "@mui/icons-material/Person";
import PaidIcon from "@mui/icons-material/Paid";
import ErrorIcon from "@mui/icons-material/Error";
import WarningIcon from "@mui/icons-material/Warning";
// loader
import { Loader } from "../Loader";

export const SummaryList = () => {
  const { identity } = useGetIdentity();
  const dataProvider = useDataProvider();

  const [data, setData] = useState({
    rechargeRecords: [],
    redeemRecords: [],
    userRecords: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const [usersResponse, rechargeResponse, redeemResponse] =
          await Promise.all([
            dataProvider.getList("users", {
              pagination: { page: 1, perPage: 10000 },
              sort: { field: "id", order: "ASC" },
              filter: {},
            }),
            dataProvider.getList("rechargeRecords", {
              pagination: { page: 1, perPage: 10000 },
              sort: { field: "id", order: "ASC" },
              filter: {},
            }),
            dataProvider.getList("redeemRecords", {
              pagination: { page: 1, perPage: 10000 },
              sort: { field: "id", order: "ASC" },
              filter: {},
            }),
          ]);
        setLoading(false);
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

  const totalAgents =
    data.userRecords?.filter((user) => user.roleName === "Agent").length || 0;

  const totalRechargeAmount =
    data.rechargeRecords
      ?.filter((item) => item.status === 2 || item.status === 3)
      .reduce((sum, item) => sum + item.transactionAmount, 0) || 0;

  const totalRedeemAmount =
    data.redeemRecords
      ?.filter((item) => item.status === 4)
      .reduce((sum, item) => sum + item.transactionAmount, 0) || 0;

  const totalPendingRecharge =
    data.rechargeRecords
      ?.filter((item) => item.status === 1)
      .reduce((sum, item) => sum + item.transactionAmount, 0) || 0;

  const totalFailRedeem =
    data.redeemRecords
      ?.filter((item) => item.status === 5)
      .reduce((sum, item) => sum + item.transactionAmount, 0) || 0;

  const finalData = [
    {
      id: 1,
      name: "Total User",
      value: data.userRecords?.length,
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

  // if (loading) {
  //   // React-admin Loading component
  //   return (
  //     <Box
  //       display="flex"
  //       justifyContent="center"
  //       alignItems="center"
  //       minHeight="50vh"
  //     >
  //       <Loading />
  //     </Box>
  //   );
  // }

  if (loading) {
    return <Loader />;
  }

  return (
    <Grid container spacing={2} mt>
      {finalData
        .filter((item) => {
          if (item.name === "Total Agent" && identity?.role !== "Super-User") {
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
  );
};
