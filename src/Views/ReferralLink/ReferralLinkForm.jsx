import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  FormGroup,
  Label,
  Form,
  Input,
  FormText,
  Card,
  CardBody,
  Button,
  InputGroup,
  InputGroupText,
} from "reactstrap";
import { useLocation } from "react-router-dom";
import { useNotify } from "react-admin";
import { useNavigate } from "react-router-dom";
// mui icon
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
// loader
import { Loader } from "../Loader";
import "./ReferralLinkForm.css";
import { Parse } from "parse";
import { validatePassword } from "../../Validators/Password"
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
    <React.Fragment>
      {loading ? (
        <Loader />
      ) : (
        <div className="container123">
          {/* Left Side: Image and Text */}
          <div className="left-section">
            <img
              src="/assets/referral_link.jpg"
              alt="Testimonial"
              className="testimonial-image"
            />
            <div className="testimonial-text"></div>
          </div>

          <div className="right-section ">
            <Card className="mt-5 card-overrid">
              <CardBody>
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Label className="fs-3 fw-normal">Get Started</Label>
                    <Col md={12}>
                      <FormGroup>
                        <Label for="userName" className="pb-0 mb-0">
                          Referral
                        </Label>
                        <Input
                          id="userName"
                          name="userName"
                          type="text"
                          autoComplete="off"
                          value={referral}
                          required
                          disabled
                        />
                      </FormGroup>
                    </Col>

                    <Col md={12}>
                      <FormGroup>
                        <Label for="userName" className="pb-0 mb-0">
                          User Name
                        </Label>
                        <Input
                          id="userName"
                          name="userName"
                          type="text"
                          autoComplete="off"
                          value={userName}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (/^[a-zA-Z0-9 _.-]*$/.test(value)) {
                              setUserName(value);
                            }
                          }}
                          required
                        />
                      </FormGroup>
                    </Col>

                    <Col md={12}>
                      <FormGroup>
                        <Label for="name" className="pb-0 mb-0">
                          Name
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          autoComplete="off"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                        />
                      </FormGroup>
                    </Col>

                    <Col md={12}>
                      <FormGroup>
                        <Label for="phoneNumber" className="pb-0 mb-0">
                          Phone Number
                        </Label>
                        <Input
                          id="phoneNumber"
                          name="phoneNumber"
                          type="text"
                          autoComplete="off"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          required
                        />
                      </FormGroup>
                    </Col>

                    <Col md={12}>
                      <FormGroup>
                        <Label for="email" className="pb-0 mb-0">
                          Email
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          autoComplete="off"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </FormGroup>
                    </Col>

                    <Col md={12}>
                      <FormGroup>
                        <Label for="password" className="pb-0 mb-0">
                          Password
                        </Label>
                        <InputGroup>
                          <Input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="off"
                            value={password}
                            onChange={handlePasswordChange}
                            required
                          />
                          <InputGroupText
                            onClick={() => setShowPassword(!showPassword)}
                            style={{ cursor: "pointer" }}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </InputGroupText>
                        </InputGroup>
                        {isTyping && passwordErrors.length > 0 && (
                          <div
                            className="mt-1"
                            style={{ fontSize: "0.875rem" }}
                          >
                            {passwordErrors.map((error, index) => (
                              <div key={index} className="text-danger">
                                • {error}
                              </div>
                            ))}
                          </div>
                        )}
                      </FormGroup>
                    </Col>

                    <Col md={12}>
                      <FormGroup>
                        <Label for="confirmPassword" className="pb-0 mb-0">
                          Confirm Password
                        </Label>
                        <InputGroup>
                          <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            autoComplete="off"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                          />
                          <InputGroupText
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            style={{ cursor: "pointer" }}
                          >
                            {showConfirmPassword ? (
                              <VisibilityOff />
                            ) : (
                              <Visibility />
                            )}
                          </InputGroupText>
                        </InputGroup>
                      </FormGroup>
                    </Col>

                    {errorMessage && (
                      <Col sm={12}>
                        <Label
                          for="errorResponse"
                          invalid
                          className="text-danger mb-2"
                        >
                          {errorMessage}
                        </Label>
                      </Col>
                    )}

                    <Col md={12}>
                      <div className="d-flex justify-content-end">
                        <Button
                          className="w-100"
                          disabled={disableButtonState}
                          type="submit"
                          color="primary"
                        >
                          Create Account
                        </Button>
                      </div>
                    </Col>
                  </Row>
                </Form>
              </CardBody>
            </Card>
          </div>
        </div>
      )}
    </React.Fragment>
  );
};

export default ReferralLinkForm;
