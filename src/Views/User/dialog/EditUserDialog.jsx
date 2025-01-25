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
} from "reactstrap";
// loader
import { Loader } from "../../Loader";
import { Parse } from "parse";
import { useGetIdentity } from "react-admin";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import IconButton from "@mui/material/IconButton";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
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
        <Modal isOpen={open} toggle={onClose} size="md" centered>
          <ModalHeader toggle={onClose} className="border-bottom-0">
            Edit User Details
          </ModalHeader>
          <ModalBody>
          <Box mb={3}>
              {errorMessage && (
                <Alert severity="error" onClose={() => setErrorMessage("")}>
                  {errorMessage}
                </Alert>
              )}
              {successMessage && (
                <Alert severity="success" onClose={() => setSuccessMessage("")}>
                  {successMessage}
                </Alert>
              )}
            </Box>
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={12}>
                  <FormGroup>
                    <Label for="userName">User Name</Label>
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
                    <Label for="name">Name</Label>
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
                    <Label for="email">Email</Label>
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
                {identity?.isPasswordPermission && (
                  <Col md={12}>
                    <FormGroup>
                      <Label for="password">Password</Label>
                      <div className="position-relative">
                        <Input
                          id="password"
                          name="password"
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
                <Col md={12}>
                  <div className="d-flex justify-content-end">
                    <Button className="mx-2" color="success" type="submit">
                      Confirm
                    </Button>
                    <Button color="secondary" onClick={onClose}>
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

export default EditUserDialog;
