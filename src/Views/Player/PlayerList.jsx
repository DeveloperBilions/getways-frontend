import React, { useState } from "react";
//react admin
import {
  useGetIdentity,
  useRefresh,
  useRedirect,
  useGetList,
} from "react-admin";
import { useNavigate } from "react-router-dom";
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
import NumbersIcon from "@mui/icons-material/Numbers";
// icons
import MoneyReciveLightIcon from "../../Assets/icons/money-recive-light.svg";
import MoneySendLightIcon from "../../Assets/icons/money-send-light.svg";
import MoneyReciveDarkIcon from "../../Assets/icons/money-recive-dark.svg";
import MoneySendDarkIcon from "../../Assets/icons/money-send-dark.svg";
// dialog
import RechargeDialog from "../RechargeRecords/dialog/RechargeDialog";
import RedeemDialog from "./dialog/PlayerRedeemDialog";
// loader
import { Loader } from "../Loader";

export const PlayerList = () => {
  const { data, isLoading } = useGetList("playerDashboard");
  const navigate = useNavigate();
  const redirect = useRedirect();
  const refresh = useRefresh();
  const { identity } = useGetIdentity();

  const transformedIdentity = {
    id: identity?.objectId,
    ...identity,
  };

  const [rechargeDialogOpen, setRechargeDialogOpen] = useState(false);
  const [redeemDialogOpen, setRedeemDialogOpen] = useState(false);
  const role = localStorage.getItem("role");

  if (!role) {
    navigate("/login");
  }

  if (isLoading || !data) {
    return <Loader />;
  }

  const totalRecharges =
    data?.filter((item) => item.type === "recharge").length || " ---";

  const totalRedeems =
    data
      ?.filter((item) => item.type === "redeem" && item.status === 4)
      .reduce((sum, item) => sum + item.transactionAmount, 0) || " ---";

  const pendingRecharges =
    data
      ?.filter((item) => item.status === 0 || item.status === 1)
      .reduce((sum, item) => sum + item.transactionAmount, 0) || " ---";

  const redeemRequests =
    data?.filter((item) => item.status === 6).length || " ---";

  const finalData = [
    {
      id: 1,
      name: "Total Recharges",
      value: totalRecharges,
      icon: NumbersIcon,
    },
    {
      id: 2,
      name: "Total Redeems",
      value: "$" + totalRedeems,
      icon: MoneyReciveDarkIcon,
    },
    {
      id: 3,
      name: "Pending Recharges",
      value: "$" + pendingRecharges,
      icon: MoneySendDarkIcon,
      url: "rechargeRecords",
    },
    {
      id: 4,
      name: "Redeem Requests",
      value: redeemRequests,
      icon: NumbersIcon,
      url: "redeemRecords",
    },
  ];

  const handleRefresh = async () => {
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
              <Grid item xs={12} sm={6} md={6} key={item?.id}>
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
                        {item.icon ? (
                          typeof item.icon === "string" ? (
                            <img
                              src={item?.icon}
                              alt={item.name}
                              style={{ width: 24, height: 24, marginRight: 8 }}
                            />
                          ) : (
                            <item.icon
                              style={{ fontSize: 24, marginRight: 8 }}
                            />
                          )
                        ) : (
                          <span>No Icon</span>
                        )}
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
            <Grid item xs={12} sm={6} md={6}>
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
                    src={MoneySendLightIcon}
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
            <Grid item xs={12} sm={6} md={6}>
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
                    src={MoneyReciveLightIcon}
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
            <Grid item xs={12} sm={6} md={6}>
              <Button
                variant="contained"
                color="success"
                sx={{
                  mt: 2,
                  p: 2,
                  background: "#000000",
                  textTransform: "capitalize",
                  fontSize: "18px",
                }}
                startIcon={
                  <img
                    src={MoneySendLightIcon}
                    alt="Money Recive Icon"
                    style={{ width: 24, height: 24 }}
                  />
                }
                onClick={() => navigate("/wallet")}
                fullWidth
              >
                Wallet
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
