import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Grid,
  Paper,
  MenuItem,
  IconButton,
} from "@mui/material";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import ArrowBackIcon from "@mui/icons-material/ArrowBack"; // Import the back arrow icon

const countries = ["India", "United States", "United Kingdom", "Australia"];

const CheckoutForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [cardDetails, setCardDetails] = useState({
    email: "",
    number: "",
    name: "",
    expiry: "",
    cvc: "",
    country: "India",
  });

  const handleInputChange = (e) => {
    setCardDetails({ ...cardDetails, [e.target.name]: e.target.value });
  };

  const onSubmit = (data) => {
    alert("Payment Successful!");
  };

  const handleBackClick = () => {
    // Add your navigation logic here, for example:
    window.history.back(); // Simple example to navigate back
  };
  return (
    <Container>
      <Paper
        Paper
        elevation={0} // Remove unwanted shadows
        sx={{
          padding: 4,
          borderRadius: 3,
          display: "flex",
          flexDirection: "row",
          alignItems: "stretch",
          minHeight: "100%",
          position: "relative", // Needed for absolute positioning of shadow
        }}
      >
        <Box
          sx={{
            flex: 1,
            textAlign: "start",
            paddingRight: 4,
            borderRight: "2px solid #E0E0E0", // Vertical border
            paddingY: 3,
            position: "relative", // Allows absolute positioning inside
            "&::after": {
              content: '""',
              position: "absolute",
              top: 0,
              right: "-2px", // Position shadow at the right edge
              width: "4px", // Adjust thickness of the shadow effect
              height: "100%",
              boxShadow: "4px 0 6px rgba(0, 0, 0, 0.1)", // Shadow only on the right side
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
            }}
          >
            <IconButton onClick={handleBackClick}>
              <ArrowBackIcon />
            </IconButton>
            <Typography sx={{ color: "#9E9E9E", fontSize: "14px" }}>
              AOG
            </Typography>
          </Box>
          <Box sx={{ alignItems: "center", paddingLeft: 4 }}>
            <Typography sx={{ color: "#9E9E9E", fontSize: "14px" }}>
              One-time Payment
            </Typography>
            <Typography variant="h5" fontWeight="bold">
              US$20.00
            </Typography>
          </Box>
        </Box>
        <Box sx={{ flex: 1, paddingLeft: 4, marginY: 4 }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Email Section */}
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              Email
            </Typography>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Email address"
              {...register("email", { required: "Email is required" })}
              error={!!errors.email}
              helperText={errors.email?.message}
              sx={{ mb: 3, borderRadius: "30px" }}
              InputProps={{
                sx: {
                  borderRadius: "10px",
                },
              }}
            />

            {/* Card Information Section */}
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              Card Information
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                border: "1px solid #ccc",
                borderRadius: 2,
                padding: "8px 12px",
                mb: 2,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  borderBottom: "1px solid #ccc",
                  pb: 1,
                }}
              >
                <CreditCardIcon sx={{ color: "#757575", mr: 1 }} />
                <TextField
                  variant="standard"
                  placeholder="1234 1234 1234 1234"
                  fullWidth
                  {...register("number", {
                    required: "Card number is required",
                  })}
                  error={!!errors.number}
                  InputProps={{ disableUnderline: true }}
                />
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={6} sx={{ pr: 1 }}>
                  <TextField
                    placeholder="MM / YY"
                    fullWidth
                    variant="standard"
                    {...register("expiry", {
                      required: "Expiry date is required",
                    })}
                    error={!!errors.expiry}
                    helperText={errors.expiry?.message}
                    InputProps={{ disableUnderline: true }}
                    sx={{ borderRight: "1px solid #ccc" }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    placeholder="CVC"
                    fullWidth
                    variant="standard"
                    {...register("cvc", { required: "CVC is required" })}
                    error={!!errors.cvc}
                    helperText={errors.cvc?.message}
                    InputProps={{ disableUnderline: true }}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Cardholder Name Section */}
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              Cardholder Name
            </Typography>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Full name on card"
              {...register("name", { required: "Cardholder name is required" })}
              error={!!errors.name}
              helperText={errors.name?.message}
              sx={{ mb: 3, borderRadius: 2 }}
              InputProps={{
                sx: {
                  borderRadius: "10px",
                },
              }}
            />

            {/* Country Selection */}
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              Country or Region
            </Typography>
            <TextField
              select
              fullWidth
              variant="outlined"
              value={cardDetails.country}
              onChange={handleInputChange}
              {...register("country", { required: "Country is required" })}
              error={!!errors.country}
              helperText={errors.country?.message}
              sx={{ mb: 3, borderRadius: 2 }}
              InputProps={{
                sx: {
                  borderRadius: "10px",
                },
              }}
            >
              {countries.map((country) => (
                <MenuItem key={country} value={country}>
                  {country}
                </MenuItem>
              ))}
            </TextField>
            {/* Pay Button */}
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ fontSize: "1rem", padding: 1.5, borderRadius: 2 }}
            >
              Pay
            </Button>
          </form>
        </Box>
      </Paper>
    </Container>
  );
};

export default CheckoutForm;
