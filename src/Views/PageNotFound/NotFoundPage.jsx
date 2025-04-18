import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function NotFoundPage() {
  const role = localStorage.getItem("role");
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        height: "80vh",
        color: "#000",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        px: 2,
      }}
    >
      <Typography
        variant="h1"
        sx={{
          fontSize: { xs: "3rem", sm: "5rem" },
          fontWeight: "bold",
          mb: 2,
        }}
      >
        404
      </Typography>
      <Typography
        variant="h5"
        sx={{ fontWeight: 500, mb: 1 }}
      >
        Page Not Found
      </Typography>
      <Typography
        variant="body1"
        sx={{ mb: 4, color: "#bbb", textAlign: "center", maxWidth: "400px" }}
      >
        Sorry, the page you're looking for doesn't exist or has been moved.
      </Typography>
      <Button
  onClick={() => {
    if (role === "Player") {
      navigate("/playerDashboard");
    } else if (role === "Agent" || role === "Master-Agent" || role === "Super-User") {
      navigate("/users");
    } else {
      navigate("/");
    }
  }}
>
  Go to Home
</Button>
    </Box>
  );
}
