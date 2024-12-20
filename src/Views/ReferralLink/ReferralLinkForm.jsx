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
  Container,
  CardBody,
  Button,
} from "reactstrap";
import { useLocation } from "react-router-dom";
import { useNotify } from "react-admin";
import { useNavigate } from "react-router-dom";
import "./ReferralLinkForm.css";
import { Parse } from "parse";
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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchReferral = async () => {
      try {
        const response = await Parse.Cloud.run("referralUserCheck", {
          userReferralCode: referral,
        });
        if (response.status === "error") {
          navigate("/login");
        }
      } catch (error) {
        console.error("Error Fetching Referral Code", error);
      }
    };

    fetchReferral();
  }, [referral]);

  const validatePassword = (password) => {
    const passwordRegex = /^.{6,}$/;
    return passwordRegex.test(password);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setDisableButtonState(true);

    if (!validatePassword(password)) {
      setErrorMessage("Password must be at least 6 characters long.");
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
      email,
      password,
    };

    try {
      const response = await Parse.Cloud.run("referralUserUpdate", rawData);

      if (response.status === "error") {
        navigate("/login");
      }
      if (response.status === "success") {
        notify(response.message, { type: "success", autoHideDuration: 5000 });
        navigate("/login");
      }
    } catch (error) {
      console.error("Error Creating User details", error);
    } finally {
      setDisableButtonState(false);
    }
  };

  return (
    <React.Fragment>
      {/* <Container>
        <Row>
          <Col md={4}>
            <img
              src="/assets/referral_link.svg"
              alt="Testimonial"
              className="testimonial-image"
            />
          </Col>
          <Col md={8}>
            <Card className="mt-5">
              <CardBody>
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Label className="fs-3 fw-bolder">Get Stated</Label>
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
                          onChange={(e) => setUserName(e.target.value)}
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
                        <Input
                          id="password"
                          name="password"
                          type="password"
                          autoComplete="off"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                        <FormText>
                          Password must be at least 6 characters long.
                        </FormText>
                      </FormGroup>
                    </Col>

                    <Col md={12}>
                      <FormGroup>
                        <Label for="confirmPassword" className="pb-0 mb-0">
                          Confirm Password
                        </Label>
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          autoComplete="off"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                        />
                      </FormGroup>
                    </Col>

                    {errorMessage && (
                      <Col sm={12}>
                        <Label
                          for="errorResponse"
                          invalid={true}
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
                          Confirm
                        </Button>
                      </div>
                    </Col>
                  </Row>
                </Form>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container> */}

      <div className="container123">
        {/* Left Side: Image and Text */}
        <div className="left-section">
          <img
            src="/assets/referral_link.jpg"
            alt="Testimonial"
            className="testimonial-image"
          />
          <div className="testimonial-text">
            {/* <span>
              This is a realistic program for anyone looking for site to invest.
              Paid to me regularly, keep up good work!
            </span>
            <ul>
              <li>Lucy Smith (USA)</li>
            </ul> */}
          </div>
        </div>

        <div className="right-section">
          <Card className="mt-5 card-overrid">
            <CardBody>
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Label className="fs-3 fw-normal">Get Stated</Label>
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
                        onChange={(e) => setUserName(e.target.value)}
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
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="off"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <FormText>
                        Password must be at least 6 characters long.
                      </FormText>
                    </FormGroup>
                  </Col>

                  <Col md={12}>
                    <FormGroup>
                      <Label for="confirmPassword" className="pb-0 mb-0">
                        Confirm Password
                      </Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        autoComplete="off"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </FormGroup>
                  </Col>

                  {errorMessage && (
                    <Col sm={12}>
                      <Label
                        for="errorResponse"
                        invalid={true}
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
    </React.Fragment>
  );
};

export default ReferralLinkForm;
