import React, { useCallback } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";
import { Parse } from "parse";
import { useLocation, useNavigate } from "react-router-dom";
import { Box, Button } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useGetIdentity } from "react-admin";
Parse.initialize(process.env.REACT_APP_APPID, process.env.REACT_APP_MASTER_KEY);
Parse.serverURL = process.env.REACT_APP_URL;

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_KEY_PRIVATE);

export const CheckoutFormStripe = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { identity } = useGetIdentity();
  const rechargeAmount = location?.state?.rechargeAmount
  const remark = location?.state?.remark
  // const PRICE_MAP = {
  //   10:"price_1RYieyIoQix8s1JaoYhmXVBt",
  //  // 10:  "price_1RYjXKIpBVdSQdgPNzGM6rFE",
  //   15:  "price_1RYjYlIpBVdSQdgPieQFXJrs",
  //   20:  "price_1RYjhMIpBVdSQdgPpztdKb9Q",
  //   30:  "price_1RYjiFIpBVdSQdgPRtssYqZ3",
  //   40:  "price_1RYjjUIpBVdSQdgPv3gmCaJd",
  //   50:  "price_1RYjkWIpBVdSQdgP9OIlDeKk",
  //   75:  "price_1RYjm0IpBVdSQdgPiPk1tej7",
  //   100: "price_1RYjn6IpBVdSQdgP7dCfnYwk",
  // };
  const PRICE_MAP = {
    10:"price_1RYieyIoQix8s1JaoYhmXVBt",
    15:  "price_1RYjHXIoQix8s1JaoZmDREVB",
    20:  "price_1RYjIAIoQix8s1Ja9GZOolgV",
    30:  "price_1RYjIsIoQix8s1JanZEhhJ5T",
    40:  "price_1RYjJwIoQix8s1Ja8Z3J3LIO",
    50:  "price_1RYjLGIoQix8s1JadBMS3PZ0",
    75:  "price_1RYjMHIoQix8s1Jav9VnL4gh",
    100: "price_1RYjMhIoQix8s1JageWsP4fM",
  };
  const priceId = PRICE_MAP[rechargeAmount];
  const fetchClientSecret = useCallback(() => {
    if (!priceId) {
      console.error(`Unsupported recharge amount: ${rechargeAmount}`);
      return Promise.reject(new Error("Unsupported recharge amount"));
    }
    return Parse.Cloud.run("createStripeCheckoutSession", {
      priceID:priceId,
      amount: rechargeAmount, 
      currency: "usd",
      // productName: "Recharge AOG",
      returnBaseUrl: process.env.REACT_APP_REDIRECT_URL,
      userId:identity?.objectId,
      remark
    })
      .then((data) => data.clientSecret)
      .catch((err) => {
        console.error("Failed to fetch client secret:", err);
        return null;
      });
  }, []);
  const options = { fetchClientSecret };
  return (
    <Box className="container py-4">
      <Box display="flex" justifyContent="start" mb={2}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/playerDashboard")}
        >
          Back
        </Button>
      </Box>
      <div id="checkout">
        <EmbeddedCheckoutProvider stripe={stripePromise} options={options}>
          <EmbeddedCheckout />
        </EmbeddedCheckoutProvider>
      </div>
    </Box>
  );
};
