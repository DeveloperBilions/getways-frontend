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
          <ModalBody className="modal-body">
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
          <ModalFooter className="modal-footer">
            <Col md={12}>
              <div className="d-flex w-100 justify-content-between">
                <Button className="custom-button cancel" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button
                  className="mx-2 custom-button"
                  color="danger"
                  type="submit"
                  onClick={handleSubmit}
                  disabled={deleteInput !== "DELETE"}
                >
                  Delete
                </Button>
              </div>
            </Col>
          </ModalFooter>
        </Modal>
      )}
    </React.Fragment>
  );
};

export default DeleteUserDialog;
