import React, { useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  FormGroup,
  Label,
  Input,
} from "reactstrap";
import { Box, Typography, Slider, CircularProgress ,Alert} from "@mui/material";
import { Parse } from "parse";
Parse.initialize(process.env.REACT_APP_APPID, process.env.REACT_APP_MASTER_KEY);
Parse.serverURL = process.env.REACT_APP_URL;
const PasswordPermissionDialog = ({ open, onClose, record, handleRefresh }) => {
  const [passwordPermission, setPasswordPermission] = useState(record?.isPasswordPermission || false);
  const [customDuration, setCustomDuration] = useState(0);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSave = async () => {
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");
  
    try {
      if (!record?.id) {
        throw new Error("No user record selected.");
      }
  
      // Create a Parse Query to update the specific user's record
      const userQuery = new Parse.Query(Parse.User);
      const user = await userQuery.get(record?.id, { useMasterKey: true });
  
      // Update fields
      user.set("isPasswordPermission", passwordPermission);  
      // Save the updated record
      await user.save(null, { useMasterKey: true });
  
      setSuccessMessage("Password permission updated successfully!");
      if (handleRefresh) {
        handleRefresh(); // Refresh the parent component's data
      }
  
      // Close the dialog after success
      setTimeout(() => {
        onClose();
        setSuccessMessage("");
        setErrorMessage("");
      }, 2000);
    } catch (error) {
      console.error("Error updating password permission:", error);
      setErrorMessage("Failed to update password permission. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  

  const handleSliderChange = (event, newValue) => {
    setCustomDuration(newValue);
  };

  return (
    <Modal isOpen={open} toggle={onClose} centered>
      <ModalHeader toggle={onClose}>
        <Typography variant="h6" sx={{ fontWeight: "bold", textAlign: "center" }}>
          Password Permission Settings
        </Typography>
      </ModalHeader>
      <ModalBody>
        {errorMessage && (
          <Alert severity="danger" className="mb-3">
            {errorMessage}
          </Alert>
        )}
        {successMessage && (
          <Alert severity="success" className="mb-3">
            {successMessage}
          </Alert>
        )}
        <FormGroup>
          <Label for="passwordPermission">
            <Typography variant="body1" sx={{ fontWeight: "bold" }}>
              Enable Password Permission
            </Typography>
          </Label>
          <div className="d-flex align-items-center">
            <Input
              type="checkbox"
              id="passwordPermission"
              checked={passwordPermission}
              onChange={(e) => setPasswordPermission(e.target.checked)}
              className="me-2"
            />
            <Typography variant="body2">
              Allow the Agent to set or reset their Player's password.
            </Typography>
          </div>
        </FormGroup>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          color="primary"
          onClick={handleSave}
          disabled={loading}
          className="ms-2"
        >
          {loading ? (
            <CircularProgress size={20} sx={{ color: "white" }} />
          ) : (
            "Save Changes"
          )}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default PasswordPermissionDialog;
