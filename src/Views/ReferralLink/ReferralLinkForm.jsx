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
  FormControlLabel,
  Checkbox,
} from "@mui/material";
// import "./ReferralLinkForm.css";
import Getways_Logo_White from "../../Assets/icons/Logo.svg";
import Person from "../../Assets/icons/Person.svg";
import Phone from "../../Assets/icons/Phone.svg";
import Gmail from "../../Assets/icons/Gmail.svg";
import Password from "../../Assets/icons/Password.svg";
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
  const [isEnable, setIsEnable] = useState(false);

  useEffect(() => {
    const clearSession = async () => {
      try {
        // Log out from Parse session
        await Parse.User.logOut();
  
        // Clear localStorage and sessionStorage
        localStorage.clear();
        sessionStorage.clear();
  
        // Optionally clear cookies if needed
        // document.cookie = ''; // Or use cookie utilities
      } catch (err) {
        console.error("Session cleanup failed:", err);
      } finally {
        console.log("✅ Session cleared");
      }
    };
  
    clearSession();
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
    if (email.toLowerCase().endsWith("@get.com")) {
      setErrorMessage("Email addresses ending with @get.com are not allowed.");
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
        window.location.href = "/login";
      }
      if (response.status === "success") {
        setLoading(false);
        notify(response.message, { type: "success", autoHideDuration: 5000 });
        window.location.href = "/login";
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
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        background: "#F6F4F4",
        overflow: "hidden",
      }}
    >
      {/* Left Sidebar */}
      <Box
        sx={{
          width: { xs: "88%", sm: "95%", md: "30%" },
          bgcolor: "#07070E",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "24px",
          borderRadius: "12px",
          p: 3,
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
          mx: "24px",
        }}
      >
        {/* Form Card */}
        <Card
          sx={{
            width: "450px",
            maxWidth: "450px",
            borderRadius: "8px",
            p: { xs: "16px", sm: "24px 32px" },
            background: "#FFFFFF",
            boxShadow: 3,
            my: 4,
          }}
        >
          <Typography
            sx={{
              fontFamily: "Inter",
              fontWeight: 400,
              fontSize: { xs: "20px", sm: "24px" },
              mb: 2,
            }}
          >
            Get Started
          </Typography>

          <form onSubmit={handleSubmit}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {/* Referral */}
              <FormControl>
                <Typography
                  sx={{
                    fontFamily: "Inter",
                    fontWeight: 600,
                    fontSize: "12px",
                    mb: "2px",
                    color: "#374151",
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
                    mb: "2px",
                    color: "#374151",
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
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <img
                          src={Person}
                          alt="username icon"
                          style={{
                            width: "16px",
                            height: "16px",
                          }}
                        />
                      </InputAdornment>
                    ),
                  }}
                  required
                  autoComplete="off"
                  fullWidth
                  placeholder="Choose a username"
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
                    mb: "2px",
                    color: "#374151",
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
                  placeholder="Your full name"
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
                    mb: "2px",
                    color: "#374151",
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
                  placeholder="Your phone number"
                  required
                  autoComplete="off"
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <img
                          src={Phone}
                          alt="phone icon"
                          style={{
                            width: "20px",
                            height: "20px",
                          }}
                        />
                      </InputAdornment>
                    ),
                  }}
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
                    mb: "2px",
                    color: "#374151",
                  }}
                >
                  Email
                </Typography>
                <TextField
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="off"
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <img
                          src={Gmail}
                          alt="gmail icon"
                          style={{
                            width: "18px",
                            height: "18px",
                          }}
                        />
                      </InputAdornment>
                    ),
                  }}
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
                    mb: "2px",
                    color: "#374151",
                  }}
                >
                  Password
                </Typography>
                <TextField
                  type={showPassword ? "text" : "password"}
                  value={password}
                  placeholder="Create a secure password"
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
                    startAdornment: (
                      <InputAdornment position="start">
                        <img
                          src={Password}
                          alt="password icon"
                          style={{
                            width: "16px",
                            height: "16px",
                          }}
                        />
                      </InputAdornment>
                    ),
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
                    mb: "2px",
                    color: "#374151",
                  }}
                >
                  Confirm Password
                </Typography>
                <TextField
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  placeholder="Create a secure password"
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
                    startAdornment: (
                      <InputAdornment position="start">
                        <img
                          src={Password}
                          alt="password icon"
                          style={{
                            width: "16px",
                            height: "16px",
                          }}
                        />
                      </InputAdornment>
                    ),
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

              <FormControlLabel
                control={
                  <Checkbox
                    checked={isEnable}
                    onChange={() => setIsEnable(!isEnable)}
                    sx={{
                      color: "#CFD4DB",
                      "&.Mui-checked": {
                        color: "#374351",
                      },
                    }}
                  />
                }
                label="Accept terms and conditions"
                sx={{
                  "& .MuiFormControlLabel-label": {
                    fontSize: "14px",
                    fontWeight: 400,
                  },
                }}
              />

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={!isEnable}
                sx={{
                  width: "100%",
                  height: { xs: "36px", sm: "40px" },
                  borderRadius: "5px",
                  background: "#000000",
                  color: "#FFFFFF",
                  textTransform: "none",
                  fontFamily: "Inter",
                  fontWeight: 400,
                  fontSize: { xs: "13px", sm: "14px" },
                  cursor: "pointer",
                  "&:hover": {
                    background: "#000000",
                  },
                  "&.Mui-disabled": {
                    background: "#BDBDBD",
                    color: "#FFFFFF",
                    cursor: "not-allowed",
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
