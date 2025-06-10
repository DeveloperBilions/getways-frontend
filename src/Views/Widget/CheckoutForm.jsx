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

const stripePromise = loadStripe(
  "pk_test_51RYLCFIxHcaBBdLXz5GogeLdo7j2FM6JVH8rhF95VmHFFGl7EA133DgL9rVPZ6DynqudayulWbotJfRrTNtyhDND00xeNV9vdC"
);

export const CheckoutFormStripe = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { identity } = useGetIdentity();
  const rechargeAmount = location?.state?.rechargeAmount
  const remark = location?.state?.remark
  const fetchClientSecret = useCallback(() => {
    return Parse.Cloud.run("createStripeCheckoutSession", {
      amount: rechargeAmount, 
      currency: "usd",
      productName: "Recharge AOG",
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
