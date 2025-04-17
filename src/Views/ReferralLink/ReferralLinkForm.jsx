import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useNotify } from "react-admin";
import { useNavigate } from "react-router-dom";
// mui icon
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import "./ReferralLinkForm.css";
import { Parse } from "parse";
import { validateCreateUser } from "../../Validators/user.validator";
import { validatePassword } from "../../Validators/Password";

import {
  Box,
  Card,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  FormControl,
} from "@mui/material";
// import "./ReferralLinkForm.css";
import Getways_Logo_White from "../../Assets/icons/Logo.svg";
// Initialize Parse
Parse.initialize(process.env.REACT_APP_APPID, process.env.REACT_APP_MASTER_KEY);
Parse.serverURL = process.env.REACT_APP_URL;

const ReferralLinkForm = () => {
  const notify = useNotify();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const referral = searchParams.get("referral");

  const [disableButtonState, setDisableButtonState] = useState(false);
  const [userName, setUserName] = useState("");
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

   useEffect(() => {
    const logoutIfLoggedIn = async () => {
      try {
        await Parse.User.logOut(); // Ensure Parse session is cleared
      } catch (err) {
        console.error("Logout error:", err);
      }
    };

    logoutIfLoggedIn();
  }, []);

  useEffect(() => {
    const fetchReferral = async () => {
      try {
        const response = await Parse.Cloud.run("referralUserCheck", {
          userReferralCode: referral,
        });
        if (response?.status === "error") {
          navigate("/login");
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error Fetching Referral Code", error);
      }
    };

    fetchReferral();
  }, [referral]);

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setIsTyping(true);
    validatePassword(newPassword, setPasswordErrors);
    if (validatePassword(newPassword, setPasswordErrors)) {
      setIsTyping(false);
    }
  };
  const validateUserName = (userName) => {
    const userNameRegex = /^[a-zA-Z0-9 _.-]+$/; // Allows letters, numbers, spaces, underscores, and dots
    return userNameRegex.test(userName);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setDisableButtonState(true);

    const validationData = {
      username: userName,
      name,
      phoneNumber,
      email,
      password,
    }

    const validationResponse = validateCreateUser(validationData);
      if (!validationResponse.isValid) {
        setErrorMessage(Object.values(validationResponse.errors).join(" "));
        setDisableButtonState(false);
        return;
      }

    if (!validateUserName(userName)) {
      setErrorMessage("Username can only contain letters, numbers, spaces, underscores (_), and dots (.)");
      setDisableButtonState(false);
      return;
    }
    if (!validatePassword(password, setPasswordErrors)) {
      setErrorMessage("Please fix all password requirements.");
      setDisableButtonState(false);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      setDisableButtonState(false);
      return;
    }

    setErrorMessage("");

    const rawData = {
      userReferralCode: referral,
      username: userName,
      name,
      phoneNumber,
      email,
      password,
    };

    setLoading(true);

    try {
      const response = await Parse.Cloud.run("referralUserUpdate", rawData);
      if (response.status === "error") {
        setLoading(false);
        navigate("/login");
      }
      if (response.status === "success") {
        setLoading(false);
        notify(response.message, { type: "success", autoHideDuration: 5000 });
        navigate("/login");
      }
    } catch (error) {
      console.error("Error Creating User details", error);
      notify(error?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
      setDisableButtonState(false);
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <Box
      sx={{
        width: "100vw",
        minHeight: "100vh",
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        background: "#F6F4F4",
        overflow: "hidden",
      }}
    >
      {/* Left Sidebar */}
      <Box
        sx={{
          width: { xs: "100%", md: "30%" },
          minWidth: { md: "200px" },
          maxWidth: { md: "480px" },
          height: { xs: "auto", md: "100vh" },
          bgcolor: "#07070E",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          py: { xs: 4, md: 0 },
        }}
      >
        <img
          src={Getways_Logo_White}
          alt="Getways Logo"
          style={{
            width: "80%",
            maxWidth: "200px",
          }}
        />
      </Box>

      {/* Right Content */}
      <Box
        sx={{
          flex: 1,
          minHeight: { xs: "auto", md: "100vh" },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          py: { xs: 4, md: 0 },
        }}
      >
        {/* Form Card */}
        <Card
          sx={{
            width: { xs: "90%", sm: "80%", md: "520px" },
            maxWidth: "520px",
            borderRadius: "8px",
            p: { xs: "16px", sm: "24px 32px" },
            background: "#FFFFFF",
            boxShadow: 3,
          }}
        >
          <Typography
            sx={{
              fontFamily: "Inter",
              fontWeight: 400,
              fontSize: { xs: "20px", sm: "24px" },
              lineHeight: "100%",
              mb: "24px",
            }}
          >
            Get Started
          </Typography>

          <form onSubmit={handleSubmit}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Referral */}
              <FormControl>
                <Typography
                  sx={{
                    fontFamily: "Inter",
                    fontWeight: 600,
                    fontSize: "12px",
                    lineHeight: "14px",
                    letterSpacing: "1.2%",
                    mb: "4px",
                  }}
                >
                  Referral
                </Typography>
                <TextField
                  value={referral}
                  disabled
                  required
                  fullWidth
                  sx={{
                    "& .MuiInputBase-root": {
                      height: { xs: "36px", sm: "40px" },
                      borderRadius: "5px",
                      backgroundColor: "#ffffff",
                      borderColor: "#CFD4DB",
                    },
                  }}
                />
              </FormControl>

              {/* Username */}
              <FormControl>
                <Typography
                  sx={{
                    fontFamily: "Inter",
                    fontWeight: 600,
                    fontSize: "12px",
                    lineHeight: "14px",
                    letterSpacing: "1.2%",
                    mb: "4px",
                  }}
                >
                  Username
                </Typography>
                <TextField
                  value={userName}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^[a-zA-Z0-9_.-]*$/.test(value)) {
                      setUserName(value);
                    }
                  }}
                  required
                  autoComplete="off"
                  fullWidth
                  sx={{
                    "& .MuiInputBase-root": {
                      height: { xs: "36px", sm: "40px" },
                      borderRadius: "5px",
                      backgroundColor: "#ffffff",
                      borderColor: "#CFD4DB",
                    },
                  }}
                />
              </FormControl>

              {/* Name */}
              <FormControl>
                <Typography
                  sx={{
                    fontFamily: "Inter",
                    fontWeight: 600,
                    fontSize: "12px",
                    lineHeight: "14px",
                    letterSpacing: "1.2%",
                    mb: "4px",
                  }}
                >
                  Name
                </Typography>
                <TextField
                  value={name}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^[a-zA-Z\s]*$/.test(value)) {
                      setName(value);
                    }
                  }}
                  required
                  autoComplete="off"
                  fullWidth
                  sx={{
                    "& .MuiInputBase-root": {
                      height: { xs: "36px", sm: "40px" },
                      borderRadius: "5px",
                      backgroundColor: "#ffffff",
                      borderColor: "#CFD4DB",
                    },
                  }}
                />
              </FormControl>

              {/* Phone Number */}
              <FormControl>
                <Typography
                  sx={{
                    fontFamily: "Inter",
                    fontWeight: 600,
                    fontSize: "12px",
                    lineHeight: "14px",
                    letterSpacing: "1.2%",
                    mb: "4px",
                  }}
                >
                  Phone Number
                </Typography>
                <TextField
                  value={phoneNumber}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d{0,10}$/.test(value)) {
                      setPhoneNumber(value);
                    }
                  }}
                  required
                  autoComplete="off"
                  fullWidth
                  sx={{
                    "& .MuiInputBase-root": {
                      height: { xs: "36px", sm: "40px" },
                      borderRadius: "5px",
                      backgroundColor: "#ffffff",
                      borderColor: "#CFD4DB",
                    },
                  }}
                />
              </FormControl>

              {/* Email */}
              <FormControl>
                <Typography
                  sx={{
                    fontFamily: "Inter",
                    fontWeight: 600,
                    fontSize: "12px",
                    lineHeight: "14px",
                    letterSpacing: "1.2%",
                    mb: "4px",
                  }}
                >
                  Email
                </Typography>
                <TextField
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="off"
                  fullWidth
                  sx={{
                    "& .MuiInputBase-root": {
                      height: { xs: "36px", sm: "40px" },
                      borderRadius: "5px",
                      backgroundColor: "#ffffff",
                      borderColor: "#CFD4DB",
                    },
                  }}
                />
              </FormControl>

              {/* Password */}
              <FormControl>
                <Typography
                  sx={{
                    fontFamily: "Inter",
                    fontWeight: 600,
                    fontSize: "12px",
                    lineHeight: "14px",
                    letterSpacing: "1.2%",
                    mb: "4px",
                  }}
                >
                  Password
                </Typography>
                <TextField
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={handlePasswordChange}
                  required
                  autoComplete="off"
                  fullWidth
                  sx={{
                    "& .MuiInputBase-root": {
                      height: { xs: "36px", sm: "40px" },
                      borderRadius: "5px",
                      backgroundColor: "#ffffff",
                      borderColor: "#CFD4DB",
                    },
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                {isTyping && passwordErrors.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    {passwordErrors.map((error, index) => (
                      <Typography
                        key={index}
                        sx={{ color: "error.main", fontSize: "0.875rem" }}
                      >
                        • {error}
                      </Typography>
                    ))}
                  </Box>
                )}
              </FormControl>

              {/* Confirm Password */}
              <FormControl>
                <Typography
                  sx={{
                    fontFamily: "Inter",
                    fontWeight: 600,
                    fontSize: "12px",
                    lineHeight: "14px",
                    letterSpacing: "1.2%",
                    mb: "4px",
                  }}
                >
                  Confirm Password
                </Typography>
                <TextField
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="off"
                  fullWidth
                  sx={{
                    "& .MuiInputBase-root": {
                      height: { xs: "36px", sm: "40px" },
                      borderRadius: "5px",
                      backgroundColor: "#ffffff",
                      borderColor: "#CFD4DB",
                    },
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          edge="end"
                          
                        >
                          {showConfirmPassword ? (
                            <VisibilityOff />
                          ) : (
                            <Visibility />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </FormControl>

              {/* Error Message */}
              {errorMessage && (
                <Typography sx={{ color: "error.main", fontSize: "0.875rem" }}>
                  {errorMessage}
                </Typography>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={disableButtonState}
                sx={{
                  width: "100%",
                  height: { xs: "36px", sm: "40px" },
                  borderRadius: "4px",
                  background: "#1671C5",
                  color: "#FFFFFF",
                  textTransform: "none",
                  fontFamily: "Inter",
                  fontWeight: 400,
                  fontSize: { xs: "13px", sm: "14px" },
                  "&:hover": {
                    background: "#135ea3",
                  },
                }}
              >
                Create Account
              </Button>
            </Box>
          </form>
        </Card>
      </Box>
    </Box>
  );
};

export default ReferralLinkForm;
