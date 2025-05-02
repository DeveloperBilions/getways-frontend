import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Typography,
  Box,
  Divider,
} from "@mui/material";
import Parse from "parse";
import { useRefresh } from "react-admin";

Parse.initialize(process.env.REACT_APP_APPID, process.env.REACT_APP_MASTER_KEY);
Parse.serverURL = process.env.REACT_APP_URL;

const generateUniqueCheckNumber = (userId) => `${Date.now()}`;

const CheckbookPaymentDialog = ({ open, onClose, amount, handleRefresh }) => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("Cashout Request");

  const [userEmailExists, setUserEmailExists] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [savingDetails, setSavingDetails] = useState(false);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const refresh = useRefresh();

  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const isValidInput = (value) => value.trim() !== "";

  const allFieldsValid =
    isValidEmail(email) && isValidInput(name) && isValidInput(description);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const currentUser = await Parse.User.currentAsync();
        if (currentUser) {
          const checkbookEmail = currentUser.get("checkbookEmail") || "";
          const checkbookName = currentUser.get("checkbookName");
          const checkbookDescription = currentUser.get("checkbookDescription");

          setEmail(checkbookEmail);
          setName(checkbookName);
          setDescription(checkbookDescription);
          setUserEmailExists(!!checkbookEmail);
        } else {
          setErrorMessage("User not logged in.");
        }
      } catch (err) {
        console.error("Error fetching current user:", err);
        setErrorMessage("Unable to fetch user.");
      }
    };

    if (open) fetchCurrentUser();
  }, [open]);

  const handleSubmit = async () => {
    if (!allFieldsValid) {
      setErrorMessage("Please fill in all fields correctly.");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    const user = await Parse.User.currentAsync();
    const number = generateUniqueCheckNumber(user.id);

    try {
      const  res = await Parse.Cloud.run("sendCheckbookPayment", {
        amount,
        email,
        name,
        description,
      });
      if (res.success) {
        setSuccess(true); // Or any success state/action
        setTimeout(() => {
          handleClose();
          refresh();
          handleRefresh();
        }, 3000);
      } else {
        setErrorMessage(res.message || "Payment failed. Please try again.");
      }
      
    } catch (err) {
      console.error("Error sending check", err);
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setName("");
    setDescription("Cashout Request");
    setSuccess(false);
    setErrorMessage("");
    setIsEditMode(false);
    onClose();
  };

  const handleSaveDetails = async () => {
    if (!allFieldsValid) {
      setErrorMessage("Please fill all fields correctly.");
      return;
    }

    setSavingDetails(true);
    setErrorMessage("");
    try {
      const user = await Parse.User.currentAsync();
      if (user) {
        user.set("checkbookEmail", email.trim());
        user.set("checkbookName", name.trim());
        user.set("checkbookDescription", description.trim());
        await user.save(null);
        setUserEmailExists(true);
        setIsEditMode(false);
      }
    } catch (err) {
      console.error("Error saving user details:", err);
      setErrorMessage("Failed to save user details");
    } finally {
      setSavingDetails(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Send Payment</DialogTitle>
      <DialogContent>
        <Alert severity="warning">
          Please enter a valid email address, as the payment will be sent to
          your email.
        </Alert>
        <Typography sx={{ mt: 2, mb: 2, fontSize: "14px" }}>
          <strong>Amount:</strong> ${amount}
        </Typography>

        {isEditMode ? (
          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              label="Recipient Email"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={!isValidEmail(email)}
              helperText={
                !isValidEmail(email) ? "Enter a valid email address." : ""
              }
            />
            <TextField
              label="Recipient Name"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={!isValidInput(name)}
              helperText={!isValidInput(name) ? "Name is required." : ""}
            />
            <TextField
              label="Payment Description"
              fullWidth
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              error={!isValidInput(description)}
              helperText={
                !isValidInput(description) ? "Description is required." : ""
              }
            />
            <Button
              variant="contained"
              onClick={handleSaveDetails}
              disabled={savingDetails || !allFieldsValid}
              sx={{ alignSelf: "flex-start", mt: 1 }}
            >
              {savingDetails ? <CircularProgress size={20} /> : "Save Details"}
            </Button>
          </Box>
        ) : email && name && description ? (
          <Box>
            <Typography mb={1} sx={{ fontSize: "13px" }}>
              <strong>Email:</strong> {email}
            </Typography>
            <Typography mb={1} sx={{ fontSize: "13px" }}>
              <strong>Name:</strong> {name}
            </Typography>
            <Typography mb={2} sx={{ fontSize: "13px" }}>
              <strong>Description:</strong> {description}
            </Typography>
            <Button
              variant="outlined"
              onClick={() => setIsEditMode(true)}
              sx={{
                borderColor: "#1976d2",
                color: "#1976d2",
                fontWeight: 600,
                ":hover": {
                  backgroundColor: "#E3F2FD",
                },
              }}
            >
              Edit Details
            </Button>
          </Box>
        ) : (
          <>
          <Box
>
  <Typography sx={{fontSize:"15px"}} gutterBottom>
    Please add your details to continue
  </Typography>

  <Button
              variant="outlined"
              onClick={() => setIsEditMode(true)}
    sx={{
      mt: 1,
      fontWeight: 600,
      borderColor: "#1976d2",
      color: "#1976d2",
      fontWeight: 600,
      ":hover": {
        backgroundColor: "#E3F2FD",
      },
    }}
  >
    Add Details
  </Button>
</Box>

          </>
        )}
        {errorMessage && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {errorMessage}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mt: 2 }}>
            Payment sent successfully!
          </Alert>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !allFieldsValid}
        >
          {loading ? <CircularProgress size={24} /> : "Send"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CheckbookPaymentDialog;
