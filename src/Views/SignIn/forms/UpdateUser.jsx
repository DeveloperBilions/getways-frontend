import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { useLogin, useNotify, useRedirect } from "react-admin";
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
  IconButton,
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

// Initialize Parse
Parse.initialize(process.env.REACT_APP_APPID, process.env.REACT_APP_MASTER_KEY);
Parse.serverURL = process.env.REACT_APP_URL;

const LoginPage = () => {
  const login = useLogin();
  const redirect = useRedirect();
  const notify = useNotify();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const emailPhoneParams = searchParams.get("emailPhone");
  const nameParams = searchParams.get("name");
  const usernameParams = searchParams.get("username");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      emailPhone: emailPhoneParams || "",
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleClickShowConfirmPassword = () =>
    setShowConfirmPassword((show) => !show);

  const handleMouseDownPassword = (evt) => evt.preventDefault();

  const onSubmit = async (data) => {
    const password = data?.password;

    const rawData = {
      emailPhone: emailPhoneParams,
      password: data?.password,
    };

    setLoading(true);
    try {
      const response = await Parse.Cloud.run("excelUserUpdate", rawData);

      if (response.success) {
        const loginresponse = await login({
          email: emailPhoneParams,
          password,
        });
        setLoading(false);
        if (loginresponse?.role === "Player") {
          redirect("/playerDashboard");
        }
      }
    } catch (error) {
      notify(error?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }
  return (
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
            my: 10,
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
          <Typography component="h4" variant="h4" sx={{ mb: 1 }}>
            Register User
          </Typography>
          <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)}>
            <Typography sx={{ mt: 1 }}>Email / Phone</Typography>
            <OutlinedInput
              required
              fullWidth
              name="emailPhone"
              label="emailPhone"
              type="text"
              id="emailPhone"
              autoComplete="off"
              sx={{ mt: 0 }}
              disabled
              value={emailPhoneParams}
            />

            <Typography sx={{ mt: 1 }}>Name</Typography>
            <OutlinedInput
              required
              fullWidth
              name="name"
              label="name"
              type="text"
              id="name"
              autoComplete="off"
              sx={{ mt: 0 }}
              disabled
              value={nameParams}
            />

            {/* <Typography sx={{ mt: 1 }}>User Name</Typography>
            <OutlinedInput
              required
              fullWidth
              name="username"
              label="username"
              type="text"
              id="username"
              autoComplete="off"
              sx={{ mt: 0 }}
              disabled
              value={usernameParams}
            /> */}

            <Typography sx={{ mt: 1 }}>Password</Typography>
            <OutlinedInput
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              id="password"
              autoComplete="off"
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

            <Typography sx={{ mt: 1 }}>Confirm Password</Typography>
            <OutlinedInput
              required
              fullWidth
              name="confirmPassword"
              label="ConfirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              autoComplete="off"
              sx={{ mt: 0 }}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowConfirmPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
              {...register(
                "confirmPassword",
                inputValidations["confirmPassword"]
              )}
            />
            {errors.confirmPassword && (
              <FormHelperText>{errors.confirmPassword.message}</FormHelperText>
            )}

            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3 }}>
              Submit
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
        </Box>
      </Grid>
    </Grid>
  );
};

export default LoginPage;
