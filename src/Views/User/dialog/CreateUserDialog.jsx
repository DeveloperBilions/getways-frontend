import React, { useState, useEffect } from "react";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  Row,
  Col,
  FormGroup,
  Label,
  Form,
  Input,
  InputGroup,
  InputGroupText,
  ModalFooter,
} from "reactstrap";
//react admin
import { useGetIdentity, usePermissions, useRefresh } from "react-admin";
import { Grid, Alert, Box } from "@mui/material";
// mui icon
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
// loader
import { Loader } from "../../Loader";

import { Parse } from "parse";
import { validateCreateUser } from "../../../Validators/user.validator";
import { validatePassword } from "../../../Validators/Password";
import "../../../Assets/css/Dialog.css";
// Initialize Parse
Parse.initialize(process.env.REACT_APP_APPID, process.env.REACT_APP_MASTER_KEY);
Parse.serverURL = process.env.REACT_APP_URL;

const CreateUserDialog = ({ open, onClose, fetchAllUsers, handleRefresh }) => {
  const refresh = useRefresh();
  const { identity } = useGetIdentity();
  const { permissions } = usePermissions();

  // State for form fields (initially empty)
  const [userName, setUserName] = useState("");
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [parentOptions, setParentOptions] = useState([]);
  const [parentType, setParentType] = useState({});
  const [userType, setUserType] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  const resetFields = () => {
    setUserName("");
    setName("");
    setEmail("");
    setPhoneNumber("");
    setPassword("");
    setPhoneNumber("");
    setConfirmPassword("");
    setErrorMessage("");
    setUserType("");
    setParentType({});
  };

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

  const handleCancel = () => {
    onClose();
    resetFields();
    setPasswordErrors("");
  };

  const fetchUsersByRole = async () => {
    try {
      let params = {
        roleName:
          permissions === "Master-Agent"
            ? ["Agent"]
            : ["Agent", "Master-Agent"],
        currentusr:
          permissions === "Master-Agent" ? identity?.objectId : undefined,
      };

      const users = await Parse.Cloud.run("getUsersByRole", params);
      setParentOptions(users);
    } catch (error) {
      console.error("Error fetching users by role:", error.message);
      return [];
    }
  };

  useEffect(() => {
    fetchUsersByRole();
    // if (identity) {
    //   setParentType({
    //     id: identity.objectId,
    //     name: identity.name,
    //     type: identity?.role,
    //   });
    // }
  }, [identity]);

  useEffect(() => {
    if (userType === "Master-Agent" && identity?.role === "Super-User") {
      // Set Super-User as parent for Master-Agent
      setParentType({
        id: identity?.objectId,
        name: identity?.name,
        type: identity?.role,
      });
    } else if (userType === "Player") {
      // Reset parentType for Player (force selection from dropdown)
      setParentType({});
    } else {
      // Clear parentType for other cases (e.g. Agent)
      setParentType({});
    }
  }, [userType, identity]);

  // Function to create a new user in Parse
  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationData = {
      username: userName,
      name,
      phoneNumber,
      email,
      password,
    };

    const validationResponse = validateCreateUser(validationData);
    if (!validationResponse.isValid) {
      setErrorMessage(Object.values(validationResponse.errors).join(" "));
      return;
    }

    if (!validateUserName(userName)) {
      setErrorMessage(
        "Username can only contain letters, numbers, spaces, underscores (_), and dots (.)"
      );
      return;
    }

    if (!validatePassword(password, setPasswordErrors)) {
      setErrorMessage("Please fix all password requirements.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    if (userType === "Player" && email.toLowerCase().endsWith("@get.com")) {
      setErrorMessage(
        "Players are not allowed to use @get.com email addresses."
      );
      return;
    }

    setLoading(true);
    try {
      let response;
      if (permissions === "Super-User") {
        if (userType === "Agent") {
          if (!identity?.objectId && !identity?.name) {
            setErrorMessage("Parent User data is not valid");
            return;
          }
          response = await Parse.Cloud.run("createUser", {
            roleName: userType,
            username: userName,
            name,
            phoneNumber,
            email,
            password,
            userParentId: parentType?.id,
            userParentName: parentType?.name,
            redeemService: 5,
          });
        } else if (userType === "Player") {
          if (!parentType?.id && !parentType?.name) {
            setErrorMessage("Parent User data is not valid");
            return;
          }
          response = await Parse.Cloud.run("createUser", {
            roleName: userType,
            username: userName,
            name,
            phoneNumber,
            email,
            password,
            userParentId: parentType?.id,
            userParentName: parentType?.name,
          });
        } else if (userType === "Master-Agent") {
          if (!parentType?.id && !parentType?.name) {
            setErrorMessage("Parent User data is not valid");
            return;
          }
          response = await Parse.Cloud.run("createUser", {
            roleName: userType,
            username: userName,
            name,
            phoneNumber,
            email,
            password,
            userParentId: parentType?.id,
            userParentName: parentType?.name,
          });
        } else if (permissions === "Master-Agent") {
          if (userType === "Agent") {
            if (!identity?.objectId && !identity?.name) {
              setErrorMessage("Parent User data is not valid");
              return;
            }
            response = await Parse.Cloud.run("createUser", {
              roleName: userType,
              username: userName,
              name,
              phoneNumber,
              email,
              password,
              userParentId: parentType?.id,
              userParentName: parentType?.name,
              redeemService: 5,
            });
          } else if (userType === "Player") {
            if (!parentType?.id && !parentType?.name) {
              setErrorMessage("Parent User data is not valid");
              return;
            }
            response = await Parse.Cloud.run("createUser", {
              roleName: userType,
              username: userName,
              name,
              phoneNumber,
              email,
              password,
              userParentId: parentType?.id,
              userParentName: parentType?.name,
            });
          }
        }
      } else if (permissions === "Agent") {
        response = await Parse.Cloud.run("createUser", {
          roleName: "Player",
          username: userName,
          name,
          phoneNumber,
          email,
          password,
          userParentId: identity?.objectId,
          userParentName: identity?.name,
        });
      } else if (permissions === "Master-Agent") {
        if (userType === "Agent") {
          if (!identity?.objectId && !identity?.name) {
            setErrorMessage("Parent User data is not valid");
            return;
          }
          response = await Parse.Cloud.run("createUser", {
            roleName: userType,
            username: userName,
            name,
            phoneNumber,
            email,
            password,
            userParentId: parentType?.id,
            userParentName: parentType?.name,
            redeemService: 5,
          });
        } else if (userType === "Player") {
          if (!parentType?.id && !parentType?.name) {
            setErrorMessage("Parent User data is not valid");
            return;
          }
          response = await Parse.Cloud.run("createUser", {
            roleName: userType,
            username: userName,
            name,
            phoneNumber,
            email,
            password,
            userParentId: parentType?.id,
            userParentName: parentType?.name,
          });
        }
      }
      if (!response?.success) {
        setErrorMessage(response?.message);
        return;
      } else {
        onClose();
        fetchAllUsers();
        resetFields();
        refresh();
        handleRefresh();
      }
    } catch (error) {
      console.error("Error Creating User:", error);

      // Handle Parse-specific errors
      if (error?.code && error?.message) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };
  // Combine parentOptions with identity
  const combinedOptions = (() => {
    if (!userType) return [];

    // Master-Agent should be created under Super-User
    if (userType === "Master-Agent" && identity?.role === "Super-User") {
      return [
        { id: identity?.objectId, name: identity?.name, role: identity?.role },
      ];
    }
    if (userType === "Agent" && identity?.role === "Master-Agent") {
      return [
        { id: identity?.objectId, name: identity?.name, role: identity?.role },
      ];
    }
    // Player can only be created under Agent or Master-Agent (not Super-User)
    if (userType === "Player") {
      return parentOptions.filter(
        (user) => user.role === "Agent"
      );
    }

    // Agent can only be created under Master-Agent
    if (userType === "Agent") {
      return parentOptions.filter((user) => user.role === "Master-Agent");
    }

    return [];
  })();

  const handleParentTypeChange = (e) => {
    const selectedId = e.target.value;
    const selectedParent = combinedOptions.find(
      (option) => option.id === selectedId
    );

    setParentType({
      id: selectedParent?.id || identity?.objectId,
      name: selectedParent?.name || identity?.name,
      type: selectedParent?.role || identity?.role,
    });
  };
  return (
    <React.Fragment>
      {loading ? (
        <Loader />
      ) : (
        <Modal
          isOpen={open}
          toggle={handleCancel}
          // size="md"
          centered
          className="custom-modal"
        >
          <ModalHeader
            toggle={handleCancel}
            className="custom-modal-header border-bottom-0"
          >
            Add New user
          </ModalHeader>

          <ModalBody className="custom-modal-body">
            <Form>
              {errorMessage && (
                <Grid item xs={12}>
                  <Alert severity="error">{errorMessage}</Alert>
                </Grid>
              )}

              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Label for="userName" className="custom-label">
                      User name
                    </Label>
                    <Input
                      id="userName"
                      name="userName"
                      type="text"
                      autoComplete="off"
                      placeholder="e.g. John_Doe"
                      className="custom-input"
                      value={userName}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^[a-zA-Z0-9_.-]*$/.test(value)) {
                          // Prevents invalid characters from being typed
                          setUserName(value);
                        }
                      }}
                      required
                    />
                  </FormGroup>
                </Col>

                <Col md={6}>
                  <FormGroup>
                    <Label for="name" className="custom-label">
                      Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="off"
                      placeholder="e.g. John"
                      className="custom-input"
                      value={name}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^[a-zA-Z\s]*$/.test(value)) {
                          // Prevents invalid characters from being typed
                          setName(value);
                        }
                      }}
                      required
                    />
                  </FormGroup>
                </Col>

                <Col md={12}>
                  <FormGroup>
                    <Label for="phoneNumber" className="custom-label">
                      Phone number
                    </Label>
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="text"
                      autoComplete="off"
                      placeholder="e.g. 0123456789"
                      className="custom-input"
                      value={phoneNumber}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^\d{0,10}$/.test(value)) {
                          setPhoneNumber(value);
                        }
                      }}
                      required
                    />
                  </FormGroup>
                </Col>

                <Col md={12}>
                  <FormGroup>
                    <Label for="email" className="custom-label">
                      Email
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="off"
                      placeholder="e.g. johndoe@example.com"
                      className="custom-input"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </FormGroup>
                </Col>

                {(permissions === "Super-User" ||
                  permissions === "Master-Agent") && (
                  <>
                    <Col md={6}>
                      <FormGroup>
                        <Label for="exampleSelect" className="custom-label">
                          User Type
                        </Label>
                        <Input
                          id="exampleSelect"
                          name="select"
                          type="select"
                          className="custom-input"
                          value={userType}
                          onChange={(e) => setUserType(e.target.value)}
                          required
                        >
                          <option value="" style={{ color: "#0000008F" }}>
                            Select User Type
                          </option>
                          {permissions === "Super-User" && (
                            <option value="Master-Agent">Master Agent</option>
                          )}
                          <option value="Agent">Agent</option>
                          <option value="Player">Player</option>
                        </Input>
                      </FormGroup>
                    </Col>

                    <Col md={6}>
                      <FormGroup>
                        <Label for="exampleSelect" className="custom-label">
                          Parent Type
                        </Label>
                        <Input
                          id="exampleSelect"
                          name="select"
                          type="select"
                          className="custom-input"
                          value={parentType.id}
                          onChange={handleParentTypeChange}
                          disabled={!userType || userType === "Master-Agent"} // disable if no user type or master-agent
                          required
                        >
                          <option value="">
                            {userType
                              ? "Select Parent"
                              : "Select user type first"}
                          </option>
                          {combinedOptions.map((user) => (
                            <option key={user.id} value={user.id}>
                              {`${user.role}: ${user.name}`}
                            </option>
                          ))}
                        </Input>
                      </FormGroup>
                    </Col>
                  </>
                )}

                <Col md={12}>
                  <FormGroup>
                    <Label for="password" className="custom-label">
                      Password
                    </Label>
                    <InputGroup>
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="off"
                        value={password}
                        className="custom-input"
                        onChange={handlePasswordChange}
                        required
                      />
                      <InputGroupText
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ cursor: "pointer", height: "35px" }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </InputGroupText>
                    </InputGroup>
                    {isTyping && passwordErrors.length > 0 && (
                      <div className="mt-1" style={{ fontSize: "0.875rem" }}>
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
                    <Label for="confirmPassword" className="custom-label">
                      Confirm Password
                    </Label>
                    <InputGroup>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        autoComplete="off"
                        value={confirmPassword}
                        className="custom-input"
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                      <InputGroupText
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        style={{ cursor: "pointer", height: "35px" }}
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
              </Row>
            </Form>
          </ModalBody>

          {/* {errorMessage && (
                  <Col sm={12}>
                    <Label
                      for="errorResponse"
                      invalid={true}
                      className="text-danger mb-2"
                    >
                      {errorMessage}
                    </Label>
                  </Col>
                )} */}
          <ModalFooter className="custom-modal-footer">
            <Col md={12}>
              <Box
                className="d-flex w-100 justify-content-between"
                sx={{
                  flexDirection: { xs: "column", sm: "row" }, // Column on small screens, row on larger screens
                  alignItems: { xs: "stretch", sm: "stretch" }, // Stretch items to take full width in both modes
                  gap: { xs: 2, sm: 2 }, // Add spacing between buttons
                  marginBottom: { xs: 2, sm: 2 }, // Add margin at the bottom
                  width: "100% !important", // Ensure the container takes full width
                  paddingRight: { xs: 0, sm: 1 },
                }}
              >
                <Button
                  className="custom-button confirm"
                  onClick={handleSubmit}
                >
                  Confirm
                </Button>
                <Button className="custom-button cancel" onClick={handleCancel}>
                  Cancel
                </Button>
              </Box>
            </Col>
          </ModalFooter>
        </Modal>
      )}
    </React.Fragment>
  );
};

export default CreateUserDialog;
