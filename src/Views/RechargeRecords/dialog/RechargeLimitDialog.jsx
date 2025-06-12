import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useGetIdentity } from "react-admin";
import { updateRechargeLimit } from "../../../Provider/parseAuthProvider";
import { Col, ModalFooter, Modal, ModalBody } from "reactstrap";

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
      <Modal isOpen={open} toggle={onClose} size="md" centered>
           <ModalBody>
      <Box
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

<Button onClick={onClose} className="custom-button cancel"  >
            Cancel
          </Button>
          <Button onClick={handleSave}         className="custom-button confirm">
            {loading ? <CircularProgress size={24} color="inherit" /> : "Save"}
          </Button>
              </Box></Col></ModalFooter>
    </Modal>
  );
};

export default RechargeLimitDialog;