import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Modal,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useGetIdentity } from "react-admin";
import { updateRechargeLimit } from "../../../Provider/parseAuthProvider";

const RechargeLimitDialog = ({ open, onClose }) => {
  const [rechargeLimit, setRechargeLimit] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const { identity, refetch } = useGetIdentity(); // Get current user info and refetch function

  useEffect(() => {
    if (open) {
      // Refetch identity when modal opens
      refetch()
        .then((newIdentity) => {
          if (newIdentity && newIdentity.data.rechargeLimit !== undefined) {
            setRechargeLimit(newIdentity.data.rechargeLimit.toString()); // Set the recharge limit
          }
        })
        .catch(() => {
          setError("Failed to load user identity.");
        });
    }
  }, [open, refetch]);

  const handleSave = async () => {
    setError("");
    setSuccess("");

    const limit = parseFloat(rechargeLimit);

    // Validation
    if (!rechargeLimit) {
      setError("Recharge limit is required.");
      return;
    }

    if (isNaN(limit) || limit <= 0) {
      setError("Recharge limit must be a number greater than zero.");
      return;
    }

    try {
      setLoading(true);
      // Call the function to update the recharge limit
      await updateRechargeLimit(identity.objectId, limit); // Pass the user ID and new limit
      setSuccess("Recharge limit updated successfully!");
      setRechargeLimit("");

      // Close modal after a short delay
      setTimeout(() => {
        setLoading(false);
        onClose();
        setError("");
        setSuccess("");
      }, 2000);
    } catch (err) {
      setError(err.message);
      setLoading(false);
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
          Set Recharge Limit
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
          label="Recharge Limit"
          type="number"
          value={rechargeLimit}
          onChange={(e) => setRechargeLimit(e.target.value)}
          margin="normal"
          disabled={loading} // Disable input while loading
          InputProps={{
            inputProps: { min: 1 }, // Enforces that the number must be at least 1
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

export default RechargeLimitDialog;