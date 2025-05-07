import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Modal,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material"; // Import icons
import { changePassword } from "../Provider/parseAuthProvider";
import { useNavigate } from "react-router-dom";

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

    if (trimmedNewPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
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
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}
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
          onChange={(e) => setNewPassword(e.target.value)}
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
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 2,
            mt: 3,
          }}
        >
          <Button onClick={onClose} variant="outlined" disabled={loading} sx={{width: "50%",paddingBottom:"10px",paddingTop:"10px"}}>
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained" disabled={loading} sx={{width: "50%",paddingBottom:"10px",paddingTop:"10px"}}>
          {loading ? <CircularProgress size={24} color="inherit" /> : "Save"}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ChangePassword;
