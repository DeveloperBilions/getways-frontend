import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PayArcCheckout from "../Player/PayArcHostedFields";
import BillingAddressForm from "./BillingAddressForm";

import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Button,
  Card,
  CardContent,
  Paper,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import BillingAddressFormAOG from "./BillingAddressFormAOG";
import { useSearchParams } from "react-router-dom";
import PayArcCheckoutAOG from "../Player/PayArcHostedFieldsAOG";

const steps = ["Billing Address", "Payment"];

export default function CheckoutPayARCAOG() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const amount = searchParams.get("amount");
  const userId = searchParams.get("userId");
  const sc_coins = searchParams.get("sc_coins");
  const gc_coins = searchParams.get("gc_coins");
  const [activeStep, setActiveStep] = useState(0);
  const [billingData, setBillingData] = useState(null);

  const handleBillingSubmit = (formData) => {
    setBillingData(formData);
    setActiveStep(1);
  };
  console.log(location?.state,"location.state")
  return (
    <Box className="container py-4">

      <Typography variant="h5" className="mb-3 fw-bold text-center">
        Checkout
      </Typography>

      <Box className="mb-4">
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      {/* Step Content with Card Styling */}
      <Box display="flex" justifyContent="center">
        <Card elevation={3} sx={{ width: "100%", maxWidth: 800, p: 2 }}>
          <CardContent>
            {activeStep === 0 && (
              <BillingAddressFormAOG onSubmit={handleBillingSubmit} aog="true" userId={userId} />
            )}

            {activeStep === 1 && (
              <PayArcCheckoutAOG rechargeAmount={amount} aog="true" userId={userId} sc_coins={sc_coins} gc_coins={gc_coins} />
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
