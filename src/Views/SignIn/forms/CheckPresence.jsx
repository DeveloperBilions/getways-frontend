import React, { useEffect, useRef, useState } from "react";
import { Form, useNotify, useRedirect } from "react-admin";
// mui
import {
  Button,
  CssBaseline,
  Box,
  Typography,
  FormHelperText,
  OutlinedInput,
  Alert,
} from "@mui/material";
// hook form
import { useForm } from "react-hook-form";
// loader
import { Loader } from "../../Loader";

import { Parse } from "parse";
import HelpVideoModal from "../HelpVideoModal";
import { useNavigate } from "react-router-dom";
import logo from "../../../Assets/icons/Logo.svg";
import { Label } from "reactstrap";
import "../../../Assets/css/style.css"
// import ReCAPTCHA from "react-google-recaptcha";

// Initialize Parse
Parse.initialize(process.env.REACT_APP_APPID, process.env.REACT_APP_MASTER_KEY);
Parse.serverURL = process.env.REACT_APP_URL;

const LoginPage = () => {
  const navigate = useNavigate();
  const redirect = useRedirect();
  const notify = useNotify();
  const [helpOpen, setHelpOpen] = useState(false); // State for help video modal
  const recaptchaRef = useRef();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  // const [captchaValue, setCaptchaValue] = useState(null);
  // const [captchaVerified, setCaptchaVerified] = useState(false); // Track captcha verification
  // const [isCaptchaReady, setIsCaptchaReady] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  //  useEffect(() => {
  //     // This ensures that reCAPTCHA is fully loaded and ready before we attempt to reset
  //     if (recaptchaRef.current) {
  //       setIsCaptchaReady(true);  // Set ready status to true when ref is available
  //     }
  //   }, [recaptchaRef.current]);


  useEffect(() => {
    // Check if user is already logged in
    const currentUser = Parse.User.current();
    if (currentUser) {
      navigate("/"); // Redirect to default route
    }
  }, [navigate]);

  useEffect(() => {
    // This ensures that reCAPTCHA is fully loaded and ready before we attempt to reset
    const savedAccounts = JSON.parse(localStorage.getItem("accounts")) || [];

    if (savedAccounts.length > 0) {
      const lastUsedAccount = savedAccounts[savedAccounts.length - 1]; // Get last used account
      setValue("emailPhone", lastUsedAccount.email);
    }
  }, [recaptchaRef.current]); // Watch the ref to ensure it is correctly initialized

  const onSubmit = async (data) => {
    // if (!captchaValue) {
    //   notify("Please verify the reCAPTCHA");
    //   return;
    // }
    try {
      setLoading(true);
      if (data?.emailPhone === "") {
        setErrorMessage("Please enter email or phone number");
        return;
      }
      const response = await Parse.Cloud.run("checkpresence", data);
      // setCaptchaVerified(true); 

      if (response?.fromAgentExcel) {
        redirect(
          `/updateUser?emailPhone=${data?.emailPhone}&name=${response?.name}&username=${response?.username}`
        );
      } else {
        redirect(`/loginEmail?emailPhone=${data?.emailPhone}`);
      }
      let savedAccounts = JSON.parse(localStorage.getItem("accounts")) || [];
      const existingAccount = savedAccounts.find(
        (acc) => acc.email === data.emailPhone
      );
      if (!existingAccount) {
        savedAccounts.push({ email: data.emailPhone });
      }
      localStorage.setItem("accounts", JSON.stringify(savedAccounts));
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
            <Box mb={3}>
              {errorMessage && (
                <Alert severity="error" onClose={() => setErrorMessage("")}>
                  {errorMessage}
                </Alert>
              )}
            </Box>
            <Form component="form" noValidate onSubmit={handleSubmit(onSubmit)}>
              <Label className="custom-label">Email / Phone</Label>

              {/* <OutlinedInput
                required
                fullWidth
                id="emailPhone"
                type="text"
                label="emailPhone"
                name="emailPhone"
                autoComplete="tel"
                sx={{
                  mb: 2,
                  height: "40px",
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    border: "1px solid var(--text-color)",
                  },
                }}
                autoFocus
                {...register("emailPhone")}
              /> */}
              <Box sx={{ position: 'relative', width: '100%' }}>
              {/* <Label className="custom-label">Email / Phone</Label> */}
              <OutlinedInput
                required
                fullWidth
                id="emailPhone"
                type="text"
                name="emailPhone"
                autoComplete="tel"
                sx={{
                  mb: 2,
                  height: "40px",
                  // Complete border override
                  '& fieldset': {
                    border: '1px solid black !important',
                    borderWidth: '1px !important',
                  },
                  '&:hover fieldset': {
                    border: '1px solid black !important',
                  },
                  '&.Mui-focused fieldset': {
                    border: '1px solid black !important',
                    borderWidth: '1px !important',
                  },
                  // Remove all animations
                  transition: 'none !important',
                  // Fix for text color
                  '& input': {
                    color: 'black !important',
                  },
                  // Fix for autofill
                  '& input:-webkit-autofill': {
                    '-webkit-text-fill-color': 'black !important',
                    '-webkit-box-shadow': '0 0 0 1000px white inset !important',
                  },
                }}
                autoFocus
                {...register("emailPhone")}
              />
            </Box>

              {errors.email && (
                <FormHelperText>{errors.email.message}</FormHelperText>
              )}
              {/* {!captchaVerified && (
                <Box mt={"10px"}>
                  <div className="recaptcha-container">
                    <ReCAPTCHA
                      sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
                      onChange={(value) => setCaptchaValue(value)}
                      ref={recaptchaRef}
                    />
                  </div>
                </Box>
              )} */}
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
                Next
              </Button>
            </Form>
            {/* <Button
              fullWidth
              variant="outlined"
              sx={{ mt: 1 }}
              onClick={() => setHelpOpen(true)}
            >
              Need Help? Watch Videos
            </Button> */}
          </Box>
        </Box>
      </Box>
      <HelpVideoModal open={helpOpen} handleClose={() => setHelpOpen(false)} />
    </React.Fragment>
  );
};

export default LoginPage;
