import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  FormGroup,
  Label,
  Input,
  Col,
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
  
  useEffect(() => {
    setPasswordPermission(record?.isPasswordPermission || false);
  }, [record, open]);
  
  const handleSliderChange = (event, newValue) => {
    setCustomDuration(newValue);
  };

  return (
    <Modal isOpen={open} toggle={onClose} centered className="custom-modal">
      <ModalHeader toggle={onClose} className="custom-modal-header">
        <Typography
          variant="h6"
          sx={{ fontWeight: "400", textAlign: "center" }}
        >
          Password Permission Settings
        </Typography>
      </ModalHeader>
      <ModalBody className="custom-modal-body">
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
          <Label className="custom-label">
            <Typography
              variant="body1"
              sx={{ fontWeight: "500", marginTop: "10px" }}
            >
              Enable Password Permission
            </Typography>
          </Label>
          <div className="d-flex align-items-center bg-light rounded p-2 mt-2">
            <Input
              type="checkbox"
              id="passwordPermission"
              checked={passwordPermission}
              onChange={(e) => setPasswordPermission(e.target.checked)}
              className="black-checkbox me-2"
            />
            <Typography variant="body2">
              Allow the Agent to set or reset their Player's password.
            </Typography>
          </div>
        </FormGroup>
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
              className="custom-button cancel"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              className="custom-button confirm"
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={20} sx={{ color: "white" }} />
              ) : (
                "Save Changes"
              )}
            </Button>
          </Box>
        </Col>
      </ModalFooter>
    </Modal>
  );
};

export default PasswordPermissionDialog;
