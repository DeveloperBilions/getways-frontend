import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
} from "@mui/material";

const UserGiftInfoDialog = ({ open, onClose, onSubmit, initialData }) => {
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFname(initialData.firstName || "");
      setLname(initialData.lastName || "");
      setUserEmail(initialData.email || "");

      const hasAllData =
        initialData.firstName && initialData.lastName && initialData.email;

      setIsEditing(!hasAllData); // Enable edit if any data is missing
    }
  }, [initialData, open]);

  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const handleConfirm = () => {
    const trimmedFname = fname.trim();
    const trimmedLname = lname.trim();
    const trimmedEmail = userEmail.trim();

    if (!trimmedFname || !trimmedLname || !trimmedEmail) {
      setError("All fields are required and must not be empty.");
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      setError("Invalid email format.");
      return;
    }

    setError("");
    onSubmit({
      firstName: trimmedFname,
      lastName: trimmedLname,
      email: trimmedEmail,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {isEditing
          ? "Edit Your Details"
          : !initialData?.firstName ||
            !initialData?.lastName ||
            !initialData?.email
          ? "Add Your Details"
          : "Confirm Your Details"}
      </DialogTitle>

      <DialogContent>
        <Alert severity="warning">
          Please enter a valid email address, as the Gift card will be sent to
          your email.
        </Alert>
        <Box sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="First Name"
            value={fname}
            onChange={(e) => setFname(e.target.value)}
            fullWidth
            disabled={!isEditing}
          />
          <TextField
            label="Last Name"
            value={lname}
            onChange={(e) => setLname(e.target.value)}
            fullWidth
            disabled={!isEditing}
          />
          <TextField
            label="Email"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            fullWidth
            disabled={!isEditing}
          />
          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Box sx={{ display: "flex", gap: 2, width: "100%", px: 2, pb: 2 }}>
          {isEditing ? (
            <>
              <Button
                variant="outlined"
                onClick={() => {
                  setIsEditing(false);
                  setError("");
                }}
                sx={{ flex: 1 }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleConfirm}
                sx={{ flex: 1 }}
              >
                {initialData?.firstName &&
                initialData?.lastName &&
                initialData?.email
                  ? "Save Changes"
                  : "Save & Confirm"}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outlined"
                onClick={() => setIsEditing(true)}
                sx={{ flex: 1 }}
              >
                Edit Details
              </Button>
              <Button
                variant="contained"
                onClick={handleConfirm}
                sx={{ flex: 1 }}
              >
                Confirm & Proceed
              </Button>
            </>
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default UserGiftInfoDialog;
