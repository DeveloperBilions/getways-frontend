import React, { useState } from "react";
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
  Alert,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import DeleteIcon from "@mui/icons-material/Delete";
import { validateTicket, TICKET_CONSTANTS } from "../../Validators/ticket.validator";

const CATEGORIES = [
  { value: "redeem", label: "Redeem" },
  { value: "recharge", label: "Recharge" },
  { value: "wallet", label: "Wallet" },
  { value: "giftcard", label: "Gift Card" },
  { value: "login", label: "Login" },
  { value: "others", label: "Others" },
];

const NewTicketDialog = ({ open, onClose, onSubmit }) => {
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [fileError, setFileError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFileError("");

    if (selectedFile) {
      // Check file size
      if (selectedFile.size > TICKET_CONSTANTS.MAX_FILE_SIZE) {
        setFileError("File size must be less than 25MB");
        return;
      }

      // Check file type
      const isImage = TICKET_CONSTANTS.ALLOWED_IMAGE_TYPES.includes(selectedFile.type);
      const isVideo = TICKET_CONSTANTS.ALLOWED_VIDEO_TYPES.includes(selectedFile.type);

      if (!isImage && !isVideo) {
        setFileError("Only image and video files are allowed");
        return;
      }

      setFile(selectedFile);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setFileError("");
  };

  const validateForm = () => {
    const ticketData = {
      category,
      description,
      file,
    };

    const validation = validateTicket(ticketData);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      if (validation.errors.file) {
        setFileError(validation.errors.file);
      }
    }

    return validation.isValid;
  };

  // Helper function to convert file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const ticketData = {
        category,
        description: description.trim(),
      };

      // Convert file to base64 if exists
      if (file) {
        try {
          const base64Data = await fileToBase64(file);
          ticketData.fileBase64 = base64Data;
          ticketData.fileName = file.name;
          ticketData.fileType = file.type;
          ticketData.fileSize = file.size;
        } catch (error) {
          console.error("Error converting file to base64:", error);
          setFileError("Failed to process file. Please try again.");
          setIsSubmitting(false);
          return;
        }
      }

      await onSubmit(ticketData);

      // Reset form
      setCategory("");
      setDescription("");
      setFile(null);
      setErrors({});
      setFileError("");
      onClose();
    } catch (error) {
      console.error("Error submitting ticket:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setCategory("");
      setDescription("");
      setFile(null);
      setErrors({});
      setFileError("");
      onClose();
    }
  };

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
          Create New Ticket
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
          {/* Category Dropdown */}
          <Box>
            <TextField
              select
              fullWidth
              label="Category"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setErrors((prev) => ({ ...prev, category: "" }));
              }}
              error={!!errors.category}
              helperText={errors.category}
              required
              disabled={isSubmitting}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1.5,
                },
              }}
            >
              {CATEGORIES.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {/* Description Field */}
          <Box>
            <TextField
              fullWidth
              multiline
              rows={5}
              label="Description"
              placeholder="Please describe your issue in detail..."
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setErrors((prev) => ({ ...prev, description: "" }));
              }}
              error={!!errors.description}
              helperText={errors.description || `${description.length} characters`}
              required
              disabled={isSubmitting}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1.5,
                },
              }}
            />
          </Box>

          {/* File Upload */}
          <Box>
            <Typography
              variant="body2"
              sx={{ mb: 1, color: "text.secondary", fontWeight: 500 }}
            >
              Attach Screenshot (Optional)
            </Typography>

            {!file ? (
              <Button
                variant="outlined"
                component="label"
                startIcon={<AttachFileIcon />}
                disabled={isSubmitting}
                sx={{
                  borderRadius: 1.5,
                  textTransform: "none",
                  borderStyle: "dashed",
                  py: 1.5,
                  width: "100%",
                  "&:hover": {
                    borderStyle: "dashed",
                  },
                }}
              >
                Upload Image/Video (Max 25MB)
                <input
                  type="file"
                  hidden
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/bmp,video/mp4,video/mpeg,video/quicktime,video/x-msvideo,video/webm"
                  onChange={handleFileChange}
                />
              </Button>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  p: 1.5,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1.5,
                  bgcolor: "grey.50",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <AttachFileIcon fontSize="small" color="primary" />
                  <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
                    {file.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ({file.size > 1024 * 1024 
                      ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
                      : `${(file.size / 1024).toFixed(1)} KB`})
                  </Typography>
                </Box>
                <IconButton
                  size="small"
                  onClick={handleRemoveFile}
                  disabled={isSubmitting}
                  sx={{ color: "error.main" }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            )}

            {fileError && (
              <Alert severity="error" sx={{ mt: 1 }}>
                {fileError}
              </Alert>
            )}

            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
              Supported formats: Images (JPEG, PNG, GIF, WebP, BMP) and Videos (MP4, MPEG, MOV, AVI, WebM) - Max size: 25MB
            </Typography>
          </Box>
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
            "Submit Ticket"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewTicketDialog;
