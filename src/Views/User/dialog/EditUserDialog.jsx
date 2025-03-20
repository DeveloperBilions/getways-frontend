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
  ModalFooter,
} from "reactstrap";
// loader
import { Loader } from "../../Loader";
import { Parse } from "parse";
import { useGetIdentity } from "react-admin";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import IconButton from "@mui/material/IconButton";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import { validateUpdateUser } from "../../../Validators/user.validator";
// Initialize Parse
Parse.initialize(process.env.REACT_APP_APPID, process.env.REACT_APP_MASTER_KEY);
Parse.serverURL = process.env.REACT_APP_URL;

const EditUserDialog = ({
  open,
  onClose,
  record,
  fetchAllUsers,
  handleRefresh,
}) => {
  const [userName, setUserName] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState(""); // New state for password
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
  const [errorMessage, setErrorMessage] = useState(""); // State for error message
  const [successMessage, setSuccessMessage] = useState(""); // State for success message  const { identity } = useGetIdentity();
  const { identity } = useGetIdentity();

  const resetFields = () => {
    setUserName("");
    setName("");
    setEmail("");
      setErrorMessage(""); // Clear error message
    setSuccessMessage(""); // Clear success message
  };

  useEffect(() => {
    if (record && open) {
      setUserName(record.username || "");
      setName(record.name || "");
      setEmail(record.email || "");
    } else {
      resetFields();
    }
  }, [record, open]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
     // Password validation
     if (identity?.isPasswordPermission && password && password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    const validationData = {
      username: userName,
      name,
      email,
      password
    };

    const validationResponse = validateUpdateUser(validationData);
    if (!validationResponse.isValid) {
      setErrorMessage(Object.values(validationResponse.errors).join(" "));
      setLoading(false);
      return;
    }

    try {
      const payload = {
        userId: record.id,
        username: userName,
        name,
        email,
      };
      if (identity?.isPasswordPermission && password) {
        payload.password = password;
      }
      await Parse.Cloud.run("updateUser", payload);
      onClose();
      setLoading(false);
      fetchAllUsers();
      resetFields();
      handleRefresh();
    } catch (error) {
      console.error("Error Editing User details", error);
    } finally {
      setLoading(false);
    }
  };
  console.log(identity,"identitfy from the EEdituSER")
  return (
    <React.Fragment>
      {loading ? (
        <Loader />
      ) : (
        <Modal
          isOpen={open}
          toggle={onClose}
          // size="md"
          centered
          className="custom-modal"
        >
          <ModalHeader
            toggle={onClose}
            className="custom-modal-header border-bottom-0"
          >
            Edit User Details
          </ModalHeader>
          <ModalBody className="custom-modal-body">
            {(errorMessage || successMessage) && (
              <Box mb={3}>
                {errorMessage && (
                  <Alert severity="error" onClose={() => setErrorMessage("")}>
                    {errorMessage}
                  </Alert>
                )}
                {successMessage && (
                  <Alert
                    severity="success"
                    onClose={() => setSuccessMessage("")}
                  >
                    {successMessage}
                  </Alert>
                )}
              </Box>
            )}
            <Form>
              <Row>
                <Col md={12}>
                  <FormGroup>
                    <Label for="userName" className="custom-label">
                      User Name
                    </Label>
                    <Input
                      id="userName"
                      name="userName"
                      type="text"
                      autoComplete="off"
                      value={userName}
                      className="custom-input"
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

                <Col md={12}>
                  <FormGroup>
                    <Label for="name" className="custom-label">
                      Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="off"
                      value={name}
                      className="custom-input"
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
                    <Label for="email" className="custom-label">
                      Email
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="off"
                      className="custom-input"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </FormGroup>
                </Col>
                {identity?.isPasswordPermission && (
                  <Col md={12}>
                    <FormGroup>
                      <Label for="password" className="custom-label">
                        Password
                      </Label>
                      <div className="position-relative">
                        <Input
                          id="password"
                          name="password"
                          className="custom-input"
                          type={showPassword ? "text" : "password"} // Toggle between text and password
                          autoComplete="off"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter new password"
                        />
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword((prev) => !prev)}
                          style={{
                            position: "absolute",
                            top: "50%",
                            right: "10px",
                            transform: "translateY(-50%)",
                          }}
                        >
                          {!showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </div>
                    </FormGroup>
                  </Col>
                )}
              </Row>
            </Form>
          </ModalBody>
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
                }}
              >
                <Button
                  className="custom-button confirm"
                  onClick={handleSubmit}
                >
                  Update
                </Button>
                <Button className="custom-button cancel" onClick={onClose}>
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

export default EditUserDialog;
