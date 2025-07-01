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

const steps = ["Billing Address", "Payment"];

export default function CheckoutPayARC() {
  const location = useLocation();
  const navigate = useNavigate();

  const [activeStep, setActiveStep] = useState(0);
  const [billingData, setBillingData] = useState(null);

  const handleBillingSubmit = (formData) => {
    setBillingData(formData);
    setActiveStep(1);
  };

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
              <BillingAddressForm onSubmit={handleBillingSubmit} />
            )}

            {activeStep === 1 && (
              <PayArcCheckout rechargeAmount={location?.state?.rechargeAmount} />
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
