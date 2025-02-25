import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import {
  useLogin,
  useNotify,
  useRedirect,
  useRefresh,
  usePermissions,
} from "react-admin";
// mui
import {
  Button,
  CssBaseline,
  Paper,
  Box,
  Grid,
  Typography,
  FormHelperText,
  OutlinedInput,
  InputAdornment,
  FormControlLabel,
  IconButton,
  Checkbox,
  useMediaQuery,
} from "@mui/material";
// mui icon
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
// validation
import { inputValidations } from "../validations";
// hook form
import { useForm } from "react-hook-form";
// loader
import { Loader } from "../../Loader";

import { Parse } from "parse";
import HelpVideoModal from "../HelpVideoModal";

// Initialize Parse
Parse.initialize(process.env.REACT_APP_APPID, process.env.REACT_APP_MASTER_KEY);
Parse.serverURL = process.env.REACT_APP_URL;

const LoginPage = () => {
  const { permissions, refetch } = usePermissions();
  const [helpOpen, setHelpOpen] = useState(false); // State for help video modal
   const isSmallScreen = useMediaQuery("(max-width:900px)");

  const refresh = useRefresh();
  const redirect = useRedirect();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const emailPhoneParams = searchParams.get("emailPhone");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const login = useLogin();
  const notify = useNotify();

  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    const password = data?.password;
    setLoading(true);
    try {
      const response = await login({ email: emailPhoneParams, password });
      await refetch();
      await refresh()
      setTimeout(() => {
      // Handle redirection based on role
      if (response?.role === "Player") {
        redirect("/playerDashboard");
      } else if (response?.role === "Super-User" || response?.role === "Agent" || response?.role === "Master-Agent" ) {
        redirect("/users");
      }
    },5)
    } catch (error) {
      notify(error?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
      // Adding a small delay before refresh
      setTimeout(() => {
        refresh();
      }, 0); // Delay is set to 0 ms, just deferring it to the next event loop
    }
  };
  

  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (evt) => evt.preventDefault();

  if (loading) {
    return <Loader />;
  }
  return (
    <>
      <Grid container component="main" sx={{ height: "100vh" }}>
        <CssBaseline />
        {!isSmallScreen && (
          <Grid
            item
            xs={false}
            sm={4}
            md={7}
            sx={{
              backgroundImage: "url(/assets/login.jpg)",
              backgroundRepeat: "no-repeat",
              backgroundColor: (t) =>
                t.palette.mode === "light"
                  ? t.palette.grey[50]
                  : t.palette.grey[900],
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        )}
        <Grid
          item
          xs={12}
          sm={isSmallScreen ? 12 : 8}
          md={isSmallScreen ? 12 : 5}
          component={Paper}
          elevation={6}
          square
          sx={{
            backgroundColor: "#e6e6e6",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <Box
            sx={{
              my: 20,
              mx: 8,
              display: "flex",
              justifyContent: "center",
              flexDirection: "column",
              alignItems: "left",
              border: "1px solid grey",
              backgroundColor: "white",
              borderRadius: "2px",
              padding: 3,
            }}
          >
            <Typography component="h4" variant="h4" sx={{ mb: 1.5 }}>
              Sign in
            </Typography>
            <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)}>
              <Typography htmlFor="email" sx={{ mb: 0, mt: 1 }}>
                Email / Phone
              </Typography>
              <OutlinedInput
                margin="normal"
                required
                fullWidth
                label="emailPhone"
                type="text"
                name="emailPhone"
                id="emailPhone"
                autoComplete="off"
                sx={{ mt: 0 }}
                disabled
                value={emailPhoneParams}
              />

              <Typography htmlFor="password" sx={{ mb: 0, mt: 1 }}>
                Password
              </Typography>
              <OutlinedInput
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                id="password"
                autoComplete="current-password"
                sx={{ mt: 0 }}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
                {...register("password", inputValidations["password"])}
              />
              {errors.password && (
                <FormHelperText>{errors.password.message}</FormHelperText>
              )}
              <Grid container spacing={1}>
                <Grid item>
                  <FormControlLabel
                    control={<Checkbox value="remember" color="primary" />}
                    label="Remember me"
                  />
                </Grid>
              </Grid>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 1, mb: 1 }}
              >
                Sign in
              </Button>

              <Button
                fullWidth
                variant="contained"
                sx={{ mt: 1, mb: 1 }}
                onClick={() => redirect("/login")}
              >
                Back
              </Button>
            </Box>
            <Button
              fullWidth
              variant="outlined"
              sx={{ mt: 1 }}
              onClick={() => setHelpOpen(true)}
            >
              Need Help? Watch Videos
            </Button>
          </Box>
        </Grid>
      </Grid>
      <HelpVideoModal open={helpOpen} handleClose={() => setHelpOpen(false)} />
    </>
  );
};

export default LoginPage;
