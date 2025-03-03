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
  FormText,
  InputGroup,
  InputGroupText,
} from "reactstrap";
//react admin
import { useGetIdentity, usePermissions, useRefresh } from "react-admin";
import { Grid, Alert } from "@mui/material";
// mui icon
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
// loader
import { Loader } from "../../Loader";

import { Parse } from "parse";
// Initialize Parse
Parse.initialize(process.env.REACT_APP_APPID, process.env.REACT_APP_MASTER_KEY);
Parse.serverURL = process.env.REACT_APP_URL;

const CreateUserDialog = ({ open, onClose, fetchAllUsers,handleRefresh }) => {
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

  const resetFields = () => {
    setUserName("");
    setName("");
    setEmail("");
    setPassword("");
    setPhoneNumber("")
    setConfirmPassword("");
    setErrorMessage("");
    setUserType("")
    setParentType({})
  };

  const validatePassword = (password) => {
    const passwordRegex = /^.{6,}$/;
    return passwordRegex.test(password);
  };

  const validateUserName = (userName) => {
    const userNameRegex = /^[a-zA-Z0-9 _.-]+$/; // Allows letters, numbers, spaces, underscores, and dots
    return userNameRegex.test(userName);
  };

  const handleCancel = () => {
    onClose();
    resetFields();
  };

  const fetchUsersByRole = async () => {
    try {
      const users = await Parse.Cloud.run("getUsersByRole", {
        roleName: ["Agent", "Master-Agent"],
      });
      setParentOptions(users);
    } catch (error) {
      console.error("Error fetching users by role:", error.message);
      return [];
    }
  };

  useEffect(() => {
    fetchUsersByRole();
    if (identity) {
      setParentType({
        id: identity.objectId,
        name: identity.name,
        type: identity?.role,
      });
    }
  }, [identity]);

  // Function to create a new user in Parse
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateUserName(userName)) {
      setErrorMessage("Username can only contain letters, numbers, spaces, underscores (_), and dots (.)");
      return;
    }

    if (!validatePassword(password)) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      let response
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
          response =  await Parse.Cloud.run("createUser", {
            roleName: userType,
            username: userName,
            name,
            phoneNumber,
            email,
            password,
            userParentId: identity?.objectId,
            userParentName: identity?.name,
            redeemService: 5,
          });
        }
      } else if (permissions === "Agent") {
        response= await Parse.Cloud.run("createUser", {
          roleName: "Player",
          username: userName,
          name,
          phoneNumber,
          email,
          password,
          userParentId: identity?.objectId,
          userParentName: identity?.name,
        });
      }
      else if (permissions === "Master-Agent") {
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
      }

      if(response?.code != 200){
        setErrorMessage(response.message);
        return;
      }
      else{
        onClose();
    fetchAllUsers();
    resetFields();
    refresh();
    handleRefresh()
      }
      console.log("API Response:", response);
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
  const combinedOptions = [
    { id: identity?.objectId, name: identity?.name, role: identity?.role },
    ...parentOptions,
  ];

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
        <Modal isOpen={open} toggle={handleCancel} size="md" centered>
          <ModalHeader toggle={handleCancel} className="border-bottom-0">
            Add New user
          </ModalHeader>
 
          <ModalBody>
            <Form onSubmit={handleSubmit}>
            {errorMessage && (
  <Grid item xs={12}>
    <Alert severity="error">{errorMessage}</Alert>
  </Grid>
)}

              <Row>
                <Col md={6}>
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
                        if (/^[a-zA-Z0-9 _.-]*$/.test(value)) { // Prevents invalid characters from being typed
                          setUserName(value);
                        }
                      }}
                      required
                    />
                  </FormGroup>
                </Col>

                <Col md={6}>
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

                {permissions === "Super-User" && (
                  <>
                    <Col md={6}>
                      <FormGroup>
                        <Label for="exampleSelect">User Type</Label>
                        <Input
                          id="exampleSelect"
                          name="select"
                          type="select"
                          value={userType}
                          onChange={(e) => setUserType(e.target.value)}
                          required
                        >
                          <option value="">Select User Type</option>
                          <option value="Master-Agent">Master Agent</option>
                          <option value="Agent">Agent</option>
                          <option value="Player">Player</option>
                        </Input>
                      </FormGroup>
                    </Col>

                    <Col md={6}>
                      <FormGroup>
                        <Label for="exampleSelect">Parent Type</Label>
                        <Input
                          id="exampleSelect"
                          name="select"
                          type="select"
                          value={parentType.id}
                          onChange={handleParentTypeChange}
                          disabled={userType === "Master-Agent"}
                          required
                        >
                          <option value="">Select Parent</option>
                          {[
                            {
                              id: identity?.objectId,
                              name: identity?.name,
                              role: identity?.role,
                            }, // Always include identity
                            ...parentOptions.filter((user) => {
                              if (userType === "Agent")
                                return user.role === "Master-Agent"; // Show only Master-Agent
                              if (userType === "Player")
                                return (
                                  user.role === "Agent" ||
                                  user.role === "Master-Agent"
                                ); // Show Agents & Master-Agents
                              return true;
                            }),
                          ].map((user) => (
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
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <InputGroupText
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ cursor: "pointer" }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </InputGroupText>
                    </InputGroup>
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

                <Col md={12}>
                  <div className="d-flex justify-content-end">
                    <Button className="mx-2" color="success" type="submit">
                      Confirm
                    </Button>
                    <Button color="secondary" onClick={handleCancel}>
                      Cancel
                    </Button>
                  </div>
                </Col>
              </Row>
            </Form>
          </ModalBody>
        </Modal>
      )}
    </React.Fragment>
  );
};

export default CreateUserDialog;
