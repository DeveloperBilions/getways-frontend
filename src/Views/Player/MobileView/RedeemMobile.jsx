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
import CoinReceive from "../../../Assets/icons/coin-recive.svg";
import MoneyReceiveWhite from "../../../Assets/icons/money-recive-light.svg";
import { useGetIdentity, useGetList, useRefresh } from "react-admin";
import { Loader } from "../../Loader";
import RedeemDialog from "../dialog/PlayerRedeemDialog";

export const RedeemMobile = () => {
  const { data, isLoading } = useGetList("playerDashboard");
  const refresh = useRefresh();
  const { identity } = useGetIdentity();
  const [redeemDialogOpen, setRedeemDialogOpen] = useState(false);

  const handleRefresh = async () => {
    refresh();
  };
  const transformedIdentity = {
    id: identity?.objectId,
    ...identity,
  };

  const redeemRequests =
    data?.filter((item) => item.status === 6).length || " ---";

  const totalRedeems =
    data
      ?.filter(
        (item) =>
          item.type === "redeem" && [item.status === 4 || item?.status === 8]
      )
      .reduce((sum, item) => sum + item.transactionAmount, 0) || " ---";

  if (isLoading) {
    return <Loader />;
  }

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
                  src={CoinReceive}
                  alt="Coin Receive Icon"
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
                  Total Redeem (Count)
                </Typography>
              </Stack>
              <Typography variant="h6">{redeemRequests}</Typography>
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
                  src={CoinReceive}
                  alt="Coin Receive Icon"
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
                  Total Redeem (Amount)
                </Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={1}>
                <img
                  src={AOG_Symbol}
                  alt="AOG Symbol"
                  style={{ width: 24, height: 24 }}
                />
                <Typography variant="h6">{totalRedeems}</Typography>
              </Stack>
            </Box>
          </CardContent>
        </Card>
        <Button
          variant="contained"
          sx={{
            bgcolor: "#4169E1",
            color: "white",
            borderRadius: 1,
            textTransform: "none",
            fontSize: "18px",
            fontWeight: 500,
          }}
          onClick={() => setRedeemDialogOpen(true)}
        >
          <img
            src={MoneyReceiveWhite}
            alt="Money Send Icon"
            style={{ width: 24, height: 24, marginRight: 8 }}
          />
          Redeem
        </Button>
      </Box>
      <RedeemDialog
        open={redeemDialogOpen}
        onClose={() => setRedeemDialogOpen(false)}
        record={transformedIdentity}
        handleRefresh={handleRefresh}
      />
    </React.Fragment>
  );
};
