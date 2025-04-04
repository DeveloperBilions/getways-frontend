import React from "react";
// import { useForm } from "react-hook-form";
import {
  Box,
  Typography,
  Container,
  Paper,
  IconButton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack"; // Import the back arrow icon

const CheckoutFormV2 = () => {
  // const {
  //   register,
  //   handleSubmit,
  //   formState: { errors },
  // } = useForm();
  // const [cardDetails, setCardDetails] = useState({
  //   email: "",
  //   number: "",
  //   name: "",
  //   expiry: "",
  //   cvc: "",
  //   country: "India",
  // });

  // const handleInputChange = (e) => {
  //   setCardDetails({ ...cardDetails, [e.target.name]: e.target.value });
  // };

  // const onSubmit = (data) => {
  //   alert("Payment Successful!");
  // };

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
        <iframe
    src="https://buy.moneybridge.net/buy/select-coin?apiKey=7b354e84e417f840460e3d7686ccd0598082aff542ac657acc599f1679d29345"
    height="600px"
    width="600px"
    title="Payment Form"
  ></iframe>
        </Box>
      </Paper>
    </Container>
  );
};

export default CheckoutFormV2;
