import React, { useState, useEffect } from "react";
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

  const refresh = useRefresh();
  const redirect = useRedirect();
  const location = useLocation();
  const login = useLogin();
  const notify = useNotify();

  const searchParams = new URLSearchParams(location.search);
  const emailPhoneParams = searchParams.get("emailPhone");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();

  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    if (emailPhoneParams) {
        const savedAccounts = JSON.parse(localStorage.getItem("accounts")) || [];
        const matchedAccount = savedAccounts.find(acc => acc.email === emailPhoneParams);
        if (matchedAccount) {
            setValue("emailPhone", matchedAccount.email);
            if (matchedAccount.password) {
                setValue("password", matchedAccount.password);
                setRememberMe(true);
            }
        }
    }
  },[]);


  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await login({
          email: emailPhoneParams,
          password: data.password,
      });
      await refetch();
      await refresh();
      // Retrieve existing saved accounts
      let savedAccounts = JSON.parse(localStorage.getItem("accounts")) || [];
      // Check if the current account exists
      const existingIndex = savedAccounts.findIndex(acc => acc.email === emailPhoneParams);
      if (rememberMe) {
          if (existingIndex !== -1) {
              // Update the existing account with a new password
              savedAccounts[existingIndex].password = data.password;
          } else {
              // Add new account with email & password
              savedAccounts.push({
                  email: emailPhoneParams,
                  password: data.password,
              });
          }
          // Save updated accounts to localStorage
          localStorage.setItem("accounts", JSON.stringify(savedAccounts));
          localStorage.setItem("rememberMe", "true");
      } else {
          // Remove password for non-remembered accounts
          if (existingIndex !== -1) {
                savedAccounts.splice(existingIndex, 1);
          }
          localStorage.setItem("accounts", JSON.stringify(savedAccounts));
          localStorage.removeItem("rememberMe");
      }
      // Redirect based on user role
      setTimeout(() => {
          if (response?.role === "Player") {
              redirect("/playerDashboard");
          } else if (["Super-User", "Agent"].includes(response?.role)) {
              redirect("/users");
          }
      }, 5);
    } catch (error) {
        notify(error?.message || "Login failed. Please try again.");
    } finally {
        setLoading(false);
        setTimeout(() => refresh(), 0);
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
        <Grid
          item
          xs={12}
          sm={8}
          md={5}
          component={Paper}
          elevation={6}
          square
          sx={{
            backgroundColor: "#e6e6e6",
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

              <Typography htmlFor="password" sx={{ mb: 0 }}>
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
              <Grid container spacing={2}>
                <Grid item xs={7}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                      />
                    }
                    label="Remember me"
                  />
                </Grid>
              </Grid>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 1 }}
              >
                Sign in
              </Button>

              <Button
                fullWidth
                variant="contained"
                sx={{ mt: 1 }}
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
