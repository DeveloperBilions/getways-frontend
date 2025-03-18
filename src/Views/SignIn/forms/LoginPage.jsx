import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  useLogin,
  useNotify,
  useRedirect,
  useRefresh,
  usePermissions,
  Form,
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
import logo from "../../../Assets/icons/Logo.svg";
import "../../../Assets/css/Dialog.css";
import { Label } from "reactstrap";

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
      const matchedAccount = savedAccounts.find(
        (acc) => acc.email === emailPhoneParams
      );
      if (matchedAccount) {
        setValue("emailPhone", matchedAccount.email);
        if (matchedAccount.password) {
          setValue("password", matchedAccount.password);
          setRememberMe(true);
        }
      }
    }
  }, []);

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
      const existingIndex = savedAccounts.findIndex(
        (acc) => acc.email === emailPhoneParams
      );
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
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "var(--secondary-color)",
        }}
      >
        <CssBaseline />
        <Box
          sx={{
            flex: 1,
            backgroundColor: "var(--primary-color)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "40vh", // Adjust based on your design
            color: "var(--secondary-color)",
            maxHeight: "384px",
          }}
        >
          <img src={logo} alt="cancel" style={{ width: 185, height: 64 }} />
          <Typography
            variant="h6"
            sx={{
              fontFamily: "var(--font-family)",
              fontWeight: 400,
              fontSize: "24px",
            }}
          >
            Sign in to your Account
          </Typography>
        </Box>
        <Box
          sx={{
            flex: 1,
            backgroundColor: "var(--secondary-color)",
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
            padding: 4,
          }}
        >
          <Box
            sx={{
              width: "100%",
              maxWidth: 400,
              backgroundColor: "var(--secondary-color)",
              padding: "0px 24px",
              borderRadius: 2,
              boxShadow: 0,
            }}
          >
            <Form component="form" noValidate onSubmit={handleSubmit(onSubmit)}>
              <Label className="custom-label">Email address or User name</Label>
              <OutlinedInput
                margin="normal"
                required
                fullWidth
                label="emailPhone"
                type="text"
                name="emailPhone"
                id="emailPhone"
                autoComplete="off"
                sx={{ mb: 2, height: "40px" }}
                disabled
                value={emailPhoneParams}
              />

              <Label className="custom-label">Password</Label>
              <OutlinedInput
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                id="password"
                autoComplete="current-password"
                sx={{
                  mb: 2,
                  height: "40px",
                  backgroundColor: "var(--secondary-color)",
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    border: "1px solid var(--text-color)",
                  },
                }}
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
                    control={
                      <Checkbox
                        checked={rememberMe}
                        sx={{
                          color: "var(--primary-color)", // Unchecked color
                          "&.Mui-checked": {
                            color: "var(--primary-color)", // Checked color
                          },
                        }}
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
                sx={{
                  mb: 2,
                  backgroundColor: "var(--primary-color)",
                  color: "var(--secondary-color)",
                  fontWeight: 400,
                  "&:hover": {
                    backgroundColor: "var(--primary-color)",
                  },
                }}
              >
                Login
              </Button>

              <Button
                fullWidth
                variant="contained"
                sx={{
                  mb: 2,
                  backgroundColor: "var(--primary-color)",
                  color: "var(--secondary-color)",
                  fontWeight: 400,
                  "&:hover": {
                    backgroundColor: "var(--primary-color)",
                  },
                }}
                onClick={() => redirect("/login")}
              >
                Back
              </Button>
            </Form>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                cursor: "pointer",
                marginTop: "10px",
              }}
              onClick={() => setHelpOpen(true)}
            >
              <span style={{ color: "var(--primary-color)", fontWeight: 400 }}>
                Need Help?{" "}
              </span>
              &nbsp;
              <span style={{ color: "#1671C5", fontWeight: 400 }}>
                {" "}
                Watch Videos
              </span>
            </Box>
          </Box>
        </Box>
      </Box>
      <HelpVideoModal open={helpOpen} handleClose={() => setHelpOpen(false)} />
    </>
  );
};
export default LoginPage;
