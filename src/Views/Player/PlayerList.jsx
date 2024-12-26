import React, { useEffect, useState } from "react";
import {
  useDataProvider,
  useGetIdentity,
  useRefresh,
  useRedirect,
} from "react-admin";
// mui
import {
  Card,
  CardContent,
  CardActionArea,
  Button,
  Typography,
  Grid,
  Box,
} from "@mui/material";
// mui icons
import PaidIcon from "@mui/icons-material/Paid";
// icons
import MoneyReciveIcon from "../../Assets/icons/money-recive.svg";
import MoneySendIcon from "../../Assets/icons/money-send.svg";
// dialog
import RechargeDialog from "../RechargeRecords/dialog/RechargeDialog";
import RedeemDialog from "./dialog/PlayerRedeemDialog";

export const PlayerList = () => {
  const redirect = useRedirect();
  const refresh = useRefresh();
  const dataProvider = useDataProvider();
  const { identity } = useGetIdentity();

  const transformedIdentity = {
    id: identity?.objectId,
    ...identity,
  };

  const [rechargeDialogOpen, setRechargeDialogOpen] = useState(false);
  const [redeemDialogOpen, setRedeemDialogOpen] = useState(false);
  const [rawData, setRawData] = useState({
    rechargeRecords: [],
    redeemRecords: [],
  });

  const fetchAllData = async () => {
    try {
      const fetchAll = async (resource) => {
        let page = 1;
        let allData = [];
        let shouldFetch = true;

        while (shouldFetch) {
          const response = await dataProvider.getList(resource, {
            pagination: { page, perPage: 100 },
            sort: { field: "id", order: "ASC" },
            filter: {},
          });

          allData = [...allData, ...response.data];

          if (response.total <= allData.length) {
            shouldFetch = false;
          } else {
            page += 1;
          }
        }

        return allData;
      };

      const [rechargeRecords, redeemRecords] = await Promise.all([
        fetchAll("rechargeRecords"),
        fetchAll("redeemRecords"),
      ]);

      setRawData({
        rechargeRecords,
        redeemRecords,
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [dataProvider]);

  const totalSuccessRecharge =
    rawData?.rechargeRecords?.filter(
      (item) => item.status === 2 || item.status === 3
    ).length || 0;

  const totalPendingRecharge =
    rawData?.rechargeRecords?.filter(
      (item) => item.status === 0 || item.status === 1
    ).length || 0;

  const totalSuccessRedeem =
    rawData?.redeemRecords?.filter((item) => item.status === 4).length || 0;

  const totalFailRedeem =
    rawData?.redeemRecords?.filter((item) => item.status === 5).length || 0;

  const finalData = [
    {
      id: 1,
      name: "Total Recharges(count)",
      value: totalSuccessRecharge,
    },
    {
      id: 2,
      name: "Total Redeems(Amount)",
      value: totalSuccessRedeem,
    },
    {
      id: 3,
      name: "Pending Recharges(Amount)",
      value: totalPendingRecharge,
      url: "rechargeRecords",
    },
    {
      id: 4,
      name: "Redeem Requests(count)",
      value: totalFailRedeem,
      url: "redeemRecords",
    },
  ];

  const handleRefresh = async () => {
    await fetchAllData();
    refresh();
  };

  return (
    <React.Fragment>
      <Card
        variant="outlined"
        sx={{
          mt: 2,
          backgroundColor: "#e3e3e3",
        }}
      >
        <CardContent>
          <Typography
            gutterBottom
            variant="h5"
            component="div"
            sx={{ fontSize: 24, fontWeight: 600 }}
          >
            Game actions
          </Typography>
          <Typography
            gutterBottom
            sx={{ fontSize: 16, fontWeight: 400, color: "#0000008f" }}
          >
            Recharge your account or redeem your rewards quickly and securely.
          </Typography>

          <Grid container spacing={2}>
            {finalData?.map((item) => (
              <Grid item xs={6} key={item?.id}>
                <Card
                  variant="outlined"
                  sx={{
                    mt: 1,
                    border: "1px solid #CFD4DB",
                  }}
                >
                  <CardActionArea
                    onClick={() => {
                      if (item?.url) {
                        redirect(`/${item.url}`);
                      }
                    }}
                  >
                    <CardContent>
                      <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                        mb={1}
                      >
                        <PaidIcon sx={{ fontSize: 20, mr: 1 }} />
                        <Typography
                          variant="body2"
                          sx={{
                            fontSize: 18,
                            fontWeight: 400,
                            color: "#0000008f",
                          }}
                        >
                          {item?.name}
                        </Typography>
                      </Box>
                      <Typography
                        variant="h5"
                        sx={{
                          fontSize: 24,
                          fontWeight: 400,
                        }}
                      >
                        {item?.value}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={6} md={6}>
              <Button
                variant="contained"
                color="success"
                sx={{
                  mt: 2,
                  p: 2,
                  background: "#006227",
                  textTransform: "capitalize",
                  fontSize: "18px",
                }}
                startIcon={
                  <img
                    src={MoneySendIcon}
                    alt="Money Recive Icon"
                    style={{ width: 24, height: 24 }}
                  />
                }
                onClick={() => setRechargeDialogOpen(true)}
                fullWidth
              >
                Recharge
              </Button>
            </Grid>
            <Grid item xs={6} md={6}>
              <Button
                variant="contained"
                color="secondary"
                sx={{
                  mt: 2,
                  p: 2,
                  background: "#683DA3",
                  textTransform: "capitalize",
                  fontSize: "18px",
                }}
                startIcon={
                  <img
                    src={MoneyReciveIcon}
                    alt="Money Recive Icon"
                    style={{ width: 24, height: 24 }}
                  />
                }
                onClick={() => setRedeemDialogOpen(true)}
                fullWidth
              >
                Redeem Request
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      <RechargeDialog
        open={rechargeDialogOpen}
        onClose={() => setRechargeDialogOpen(false)}
        handleRefresh={handleRefresh}
      />
      <RedeemDialog
        open={redeemDialogOpen}
        onClose={() => setRedeemDialogOpen(false)}
        record={transformedIdentity}
        handleRefresh={handleRefresh}
      />
    </React.Fragment>
  );
};
