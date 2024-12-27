import { useState } from "react";
import { useLogin, useNotify, Notification, useRedirect } from "react-admin";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import FormHelperText from "@mui/material/FormHelperText";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

import PasswordResetEmail from "./PasswordResetEmail";
import { inputValidations } from "../validations";

import { useForm } from "react-hook-form";

import { Parse } from "parse";

// Initialize Parse
Parse.initialize(process.env.REACT_APP_APPID, process.env.REACT_APP_MASTER_KEY);
Parse.serverURL = process.env.REACT_APP_URL;

// const defaultTheme = createTheme();

const LoginPage = () => {
  const redirect = useRedirect();

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm();

  const login = useLogin();
  const notify = useNotify();

  const onSubmit = async (data) => {
    const email = data?.email;
    const password = data?.password;

    try {
      const response = await login({ email, password });

      if (response?.role === "Player") {
        redirect("/playerDashboard");
      }
    } catch (error) {
      console.error("Error Transaction Status", error);
      notify(error?.message || "Login failed. Please try again.");
    }
  };

  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (evt) => evt.preventDefault();

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
          {/* <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
              <LockOutlinedIcon />
            </Avatar> */}
          <Typography component="h4" variant="h4" sx={{ mb: 1.5 }}>
            {/* <Typography component="h1" variant="h5"> */}
            Sign in
          </Typography>
          {/* <Grid container>
            <Grid item>
              <Typography variant="body2">Don't have an account?
                <Link href="#/signup" variant="body2">
                  {" Sign up now"}
                </Link>
              </Typography>
            </Grid>
          </Grid> */}
          <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)}>
            <label htmlFor="email" sx={{ mb: 0, mt: 1 }}>
              Email
            </label>
            <OutlinedInput
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              sx={{ mt: 0 }}
              {...register("email", inputValidations["email"])}
            />
            {errors.email && (
              <FormHelperText>{errors.email.message}</FormHelperText>
            )}

            <label htmlFor="password" sx={{ mb: 0 }}>
              Password
            </label>
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
                  control={<Checkbox value="remember" color="primary" />}
                  label="Remember me"
                />
              </Grid>
              {/* <Grid item xs={5}>
                <Link href="#/reset-email" variant="body2">
                  Forgot password?
                </Link>
              </Grid> */}
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 1 }}
            >
              Sign in
            </Button>
            {/* <Typography variant="body1" align='center'>OR</Typography>
            <Button
              fullWidth
              variant="outlined"
              sx={{ mt: 1 }}
            >
              Login with Google
            </Button> */}
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
};

export default LoginPage;
