import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
} from "@mui/material";
import AOG_Symbol from "../../../Assets/icons/AOGsymbol.png";
import CoinSend from "../../../Assets/icons/coin-send.svg";
import MoneySendWhite from "../../../Assets/icons/money-send-light.svg";
import { useGetIdentity, useGetList, useRefresh } from "react-admin";
import { Loader } from "../../Loader";
import RechargeDialog from "../../RechargeRecords/dialog/RechargeDialog";

export const RechargeMobile = () => {
  const { data, isLoading } = useGetList("playerDashboard");
  const refresh = useRefresh();
  const { identity } = useGetIdentity();
  const [rechargeDialogOpen, setRechargeDialogOpen] = useState(false);

  if (isLoading) {
    return <Loader />;
  }
  const handleRefresh = async () => {
    refresh();
  };
  const totalRecharges =
    data?.filter((item) => item.type === "recharge").length || " ---";

  const pendingRecharges =
    data
      ?.filter((item) => item.status === 0 || item.status === 1)
      .reduce((sum, item) => sum + item.transactionAmount, 0) || " ---";

  return (
    <React.Fragment>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Card variant="outlined" sx={{ mb: 2 }}>
          <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                spacing={2}
              >
                <img
                  src={CoinSend}
                  alt="Coin Send Icon"
                  style={{ width: 24, height: 24 }}
                />
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: "18px",
                    fontWeight: 400,
                    color: "#00000099",
                  }}
                >
                  Total Recharges (Count)
                </Typography>
              </Stack>
              <Typography variant="h6">{pendingRecharges}</Typography>
            </Box>
          </CardContent>
        </Card>
        <Card variant="outlined" sx={{ mb: 2 }}>
          <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                spacing={2}
              >
                <img
                  src={CoinSend}
                  alt="Coin Send Icon"
                  style={{ width: 24, height: 24 }}
                />
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: "18px",
                    fontWeight: 400,
                    color: "#00000099",
                  }}
                >
                  Total Recharges (Amount)
                </Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={1}>
                <img
                  src={AOG_Symbol}
                  alt="AOG Symbol"
                  style={{ width: 24, height: 24 }}
                />
                <Typography variant="h6">{totalRecharges}</Typography>
              </Stack>
            </Box>
          </CardContent>
        </Card>
        <Button
          variant="contained"
          sx={{
            bgcolor: "#28A745",
            color: "white",
            borderRadius: 1,
            textTransform: "none",
            fontSize: "18px",
            fontWeight: 500,
          }}
          onClick={() => {
            if (!identity?.isBlackListed) {
              setRechargeDialogOpen(true);
            }
          }}
          fullWidth
          disabled={identity?.isBlackListed}
        >
          <img
            src={MoneySendWhite}
            alt="Money Send Icon"
            style={{ width: 24, height: 24, marginRight: 8 }}
          />
          Recharges
        </Button>
      </Box>
      <RechargeDialog
        open={rechargeDialogOpen}
        onClose={() => setRechargeDialogOpen(false)}
        handleRefresh={handleRefresh}
      />
    </React.Fragment>
  );
};
