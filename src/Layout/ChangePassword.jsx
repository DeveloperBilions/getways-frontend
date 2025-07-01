import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material"; // Import icons
import { changePassword } from "../Provider/parseAuthProvider";
import { useNavigate } from "react-router-dom";
import { validatePassword } from "../Validators/Password";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Col
} from "reactstrap";
const ChangePassword = ({ open, onClose }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState([]);
  const navigate = useNavigate(); // Initialize useNavigate

  const handleSave = async () => {
    // Clear previous messages
    setError("");
    setSuccess("");

    // Trim whitespace
    const trimmedCurrentPassword = currentPassword.trim();
    const trimmedNewPassword = newPassword.trim();
    const trimmedConfirmPassword = confirmPassword.trim();

    // Validation
    if (
      !trimmedCurrentPassword ||
      !trimmedNewPassword ||
      !trimmedConfirmPassword
    ) {
      setError("All fields are required.");
      return;
    }

    // if (trimmedNewPassword.length < 6) {
    //   setError("New password must be at least 6 characters long.");
    //   return;
    // }

   
    const validationResult = validatePassword(trimmedNewPassword, setPasswordErrors);
if (validationResult === false) {
  return; // prevent form submit if password is invalid
}

if (trimmedNewPassword !== trimmedConfirmPassword) {
  setError("New password and confirm password do not match.");
  return;
}
    try {
      setLoading(true); // Hide loader in case of error
      await changePassword(trimmedCurrentPassword, trimmedNewPassword, trimmedConfirmPassword);
      setSuccess("Password changed successfully!");
      // Clear inputs after successful change
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      // Close modal after a short delay
      setTimeout(() => {
        setLoading(false);
        localStorage.clear()
        window.location.href = "/login"; // Reloads the page after redirect
      }, 2000);
    } catch (err) {
      setError(err.message);
      setLoading(false); // Hide loader in case of error
    }
  };

  return (
    <Modal isOpen={open} toggle={onClose} size="md" centered>
      <ModalBody>
      <Box
      >
        <Typography variant="h6" mb={2}>
          Change Password
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}
        <TextField
          fullWidth
          label="Current Password"
          type={showCurrentPassword ? "text" : "password"}
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          margin="normal"
          disabled={loading} // Disable input while loading
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  edge="end"
                  disabled={loading}
                >
                  {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <TextField
          fullWidth
          label="New Password"
          type={showNewPassword ? "text" : "password"}
          value={newPassword}
          onChange={(e) => {
            const value = e.target.value;
            setNewPassword(value);
            validatePassword(value, setPasswordErrors);
          }}          
         // onChange={(e) => setNewPassword(e.target.value)}
          margin="normal"
          disabled={loading} // Disable input while loading
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  edge="end"
                  disabled={loading}
                >
                  {showNewPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        {passwordErrors.length > 0 && (
  <Box mt={1} ml={1}>
    {passwordErrors.map((err, idx) => (
      <Typography key={idx} variant="caption" color="error" display="block">
        • {err}
      </Typography>
    ))}
  </Box>
)}

        <TextField
          fullWidth
          label="Confirm Password"
          type={showConfirmPassword ? "text" : "password"}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          margin="normal"
          disabled={loading} // Disable input while loading
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  edge="end"
                  disabled={loading}
                >
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>
      </ModalBody>
      <ModalFooter className="custom-modal-footer">
          <Col md={12}>
          <Box className="d-flex w-100 justify-content-between"
            sx={{
              flexDirection: { xs: "column-reverse", sm: "row" }, // 🔁 Reverse order on mobile
              alignItems: { xs: "stretch", sm: "stretch" }, // Stretch items to take full width in both modes
              gap: { xs: 2, sm: 2 }, // Add spacing between buttons
              marginBottom: { xs: 2, sm: 2 }, // Add margin at the bottom
              width: "100% !important", // Ensure the container takes full width
              paddingRight: { xs: 0, sm: 1 },
            }}>
             
             <Button onClick={onClose}  className="custom-button cancel" >
            Cancel
          </Button>
          <Button onClick={handleSave} className="custom-button confirm"  disabled={loading} >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Save"}
          </Button>
            </Box>
            </Col>
            </ModalFooter>
    </Modal>
  );
};

export default ChangePassword;
