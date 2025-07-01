import React, { useState } from "react";
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
import { useNotify } from "react-admin";
import Box from "@mui/material/Box";
// Initialize Parse
Parse.initialize(process.env.REACT_APP_APPID, process.env.REACT_APP_MASTER_KEY);
Parse.serverURL = process.env.REACT_APP_URL;

const DeleteUserDialog = ({
  open,
  onClose,
  record,
  fetchAllUsers,
  handleRefresh,
}) => {
  const [deleteInput, setDeleteInput] = useState("");
  const [loading, setLoading] = useState(false);
  const notify = useNotify();

  const handleInputChange = (event) => {
    setDeleteInput(event.target.value);
  };

  const handleCancel = () => {
    onClose();
    setDeleteInput("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const userId = record.id;
      await Parse.Cloud.run("deleteUser", {
        userId,
      });
      notify("User deleted successfully", { type: "success", autoHideDuration: 5000 });
      onClose();
      setLoading(false);
      fetchAllUsers();
      handleRefresh();
    } catch (error) {
      console.error("Error Deleting User details", error);
      notify("Error Deleting User details", { type: "warning", autoHideDuration: 5000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <React.Fragment>
      {loading ? (
        <Loader />
      ) : (
        <Modal
          isOpen={open}
          toggle={handleCancel}
          size="md"
          centered
          className="custom-modal"
        >
          <ModalHeader
            toggle={handleCancel}
            className="custom-modal-header border-bottom-0"
          >
            Delete User
          </ModalHeader>
          <ModalBody className="custom-modal-body">
            <Form onSubmit={handleSubmit}>
              <Row>
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
                      className="custom-input"
                      style={{
                        backgroundColor: "#DEDEDE",
                        border: "1px solid #A5AFBC",
                      }}
                      value={record.name}
                      disabled
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
                      className="custom-input"
                      style={{
                        backgroundColor: "#DEDEDE",
                        border: "1px solid #A5AFBC",
                      }}
                      autoComplete="off"
                      value={record.email}
                      disabled
                    />
                  </FormGroup>
                </Col>

                <Col md={12}>
                  <FormGroup>
                    <Label for="delete" className="custom-label">
                      To confirm this, type ”
                      <span style={{ color: "red" }}>DELETE</span>”
                    </Label>
                    <Input
                      id="delete"
                      name="delete"
                      type="text"
                      autoComplete="off"
                      className="custom-input"
                      placeholder="DELETE"
                      style={{ color: "red" }}
                      value={deleteInput}
                      onChange={handleInputChange}
                      required
                    />
                  </FormGroup>
                </Col>
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
                  paddingRight: { xs: 0, sm: 1 },
                }}
              >
                <Button
                  className="custom-button"
                  color="danger"
                  type="submit"
                  onClick={handleSubmit}
                  disabled={deleteInput !== "DELETE"}
                  style={{ border: "none" }}
                >
                  Delete
                </Button>
                <Button
                  className="custom-button cancel"
                  onClick={handleCancel}
                >
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

export default DeleteUserDialog;
