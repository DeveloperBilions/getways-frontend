import React, { useState } from "react";
import { useNotify, useRedirect } from "react-admin";
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
} from "@mui/material";
// hook form
import { useForm } from "react-hook-form";
// loader
import { Loader } from "../../Loader";

import { Parse } from "parse";
import HelpVideoModal from "../HelpVideoModal";
import ReCAPTCHA from "react-google-recaptcha";

// Initialize Parse
Parse.initialize(process.env.REACT_APP_APPID, process.env.REACT_APP_MASTER_KEY);
Parse.serverURL = process.env.REACT_APP_URL;

const LoginPage = () => {
  const redirect = useRedirect();
  const notify = useNotify();
  const [helpOpen, setHelpOpen] = useState(false); // State for help video modal
  const [captchaValue, setCaptchaValue] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    if (!captchaValue) {
      notify("Please verify the reCAPTCHA");
      return;
    }
    console.log(data);
    try {
      setLoading(true);

      const response = await Parse.Cloud.run("checkpresence", data);
      localStorage.clear()
      if (response?.fromAgentExcel) {
        redirect(
          `/updateUser?emailPhone=${data?.emailPhone}&name=${response?.name}&username=${response?.username}`
        );
      } else {
        redirect(`/loginEmail?emailPhone=${data?.emailPhone}`);
      }
    } catch (error) {
      notify(error?.message || "User Checking failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <React.Fragment>
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
              my: 30,
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
              <Typography htmlFor="emailPhone" sx={{ mt: 1 }}>
                Email / Phone
              </Typography>

              <OutlinedInput
                required
                fullWidth
                id="emailPhone"
                type="text"
                label="emailPhone"
                name="emailPhone"
                autoComplete="tel"
                autoFocus
                {...register("emailPhone")}
              />

              {errors.email && (
                <FormHelperText>{errors.email.message}</FormHelperText>
              )}
              <Box mt={"10px"}>
              <ReCAPTCHA
                sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
                onChange={(value) => setCaptchaValue(value)}
              /> </Box>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 1 }}
              >
                Next
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
      <HelpVideoModal
        open={helpOpen}
        handleClose={() => setHelpOpen(false)}
      />
    </React.Fragment>
  );
};

export default LoginPage;
