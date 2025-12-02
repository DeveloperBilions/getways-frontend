import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { dataProvider } from "../../Provider/parseDataProvider";

const STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
];

const capitalizeFirstLetter = (string) => {
  if (!string) return "";
  return string.split(/[ _]/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

const EditTicketDialog = ({ open, onClose, ticket, onSuccess }) => {
  const [status, setStatus] = useState("");
  const [remarks, setRemarks] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Initialize form with ticket data when dialog opens
  useEffect(() => {
    if (ticket && open) {
      setStatus(ticket.status || "");
      setRemarks(ticket.remarks || "");
      setErrors({});
      setSubmitError("");
    }
  }, [ticket, open]);

  const validateForm = () => {
    const newErrors = {};

    if (!status) {
      newErrors.status = "Status is required";
    }

    if (remarks && remarks.trim().length > 0) {
      if (remarks.trim().length < 5) {
        newErrors.remarks = "Remarks must be at least 5 characters";
      } else if (remarks.trim().length > 500) {
        newErrors.remarks = "Remarks must not exceed 500 characters";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const result = await dataProvider.updateTicket({
        ticketId: ticket.id,
        status: status,
        remarks: remarks.trim(),
      });

      if (result.success) {
        // Call success callback to refresh the list
        if (onSuccess) {
          onSuccess(result.data);
        }
        handleClose();
      } else {
        setSubmitError(result.message || "Failed to update ticket");
        if (result.errors) {
          setErrors(result.errors);
        }
      }
    } catch (error) {
      console.error("Error updating ticket:", error);
      setSubmitError(error.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setStatus("");
      setRemarks("");
      setErrors({});
      setSubmitError("");
      onClose();
    }
  };

  if (!ticket) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 1,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Edit Ticket - {ticket.ticketId || ticket.id}
        </Typography>
        <IconButton
          onClick={handleClose}
          size="small"
          disabled={isSubmitting}
          sx={{
            "&:hover": {
              transform: "rotate(90deg)",
              transition: "transform 0.3s",
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          {/* Ticket Information */}
          <Box
            sx={{
              p: 2,
              bgcolor: "grey.50",
              borderRadius: 1,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Ticket Information
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Username:</strong> {ticket.username}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Role:</strong> {ticket.role}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Category:</strong> {capitalizeFirstLetter(ticket.category)}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              <strong>Description:</strong> {ticket.description}
            </Typography>
          </Box>

          {/* Status Dropdown */}
          <Box>
            <TextField
              select
              fullWidth
              label="Status"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setErrors((prev) => ({ ...prev, status: "" }));
              }}
              error={!!errors.status}
              helperText={errors.status}
              required
              disabled={isSubmitting}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1.5,
                },
              }}
            >
              {STATUS_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {/* Remarks Field */}
          <Box>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Remarks"
              placeholder="Add remarks or comments about this ticket..."
              value={remarks}
              onChange={(e) => {
                setRemarks(e.target.value);
                setErrors((prev) => ({ ...prev, remarks: "" }));
              }}
              error={!!errors.remarks}
              helperText={
                errors.remarks ||
                `${remarks.length}/500 characters (minimum 5 if provided)`
              }
              disabled={isSubmitting}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1.5,
                },
              }}
            />
          </Box>

          {/* Error Alert */}
          {submitError && (
            <Alert severity="error" sx={{ mt: 1 }}>
              {submitError}
            </Alert>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          onClick={handleClose}
          disabled={isSubmitting}
          sx={{
            textTransform: "none",
            borderRadius: 1.5,
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isSubmitting}
          sx={{
            textTransform: "none",
            borderRadius: 1.5,
            minWidth: 100,
          }}
        >
          {isSubmitting ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Update Ticket"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditTicketDialog;
