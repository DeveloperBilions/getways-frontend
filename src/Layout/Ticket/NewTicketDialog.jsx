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
  Alert,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  validateTicket,
  TICKET_CONSTANTS,
} from "../../Validators/ticket.validator";
import Compressor from "compressorjs";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import { useGetIdentity } from "react-admin";

const CATEGORIES = {
  "Player": [
  { value: "redeem", label: "Redeem" },
  { value: "recharge", label: "Recharge" },
  { value: "wallet", label: "Wallet" },
  { value: "login", label: "Login" },
  { value: "password", label: "Password" },
  { value: "others", label: "Others" },
  ],
  "Master-Agent": [
    { value: "user_management", label: "User Management" },
    { value: "summary_reports", label: "Summary Reports" },
    { value: "recharge_records", label: "Recharge Records" },
    { value: "redeem_records", label: "Redeem Records" },
    { value: "balance_display", label: "Balance Display" },
    { value: "recharge_limit", label: "Recharge Limit" },
    { value: "login", label: "Login" },
    { value: "others", label: "Others" },
  ],
  "Agent": [
    { value: "user_management", label: "User Management" },
    { value: "summary_reports", label: "Summary Reports" },
    { value: "recharge_records", label: "Recharge Records" },
    { value: "redeem_records", label: "Redeem Records" },
    { value: "balance_display", label: "Balance Display" },
    { value: "recharge_limit", label: "Recharge Limit" },
    { value: "login", label: "Login" },
    { value: "others", label: "Others" },
  ],
};

const MAX_SIZE = 512 * 1024; // 512 KB

const NewTicketDialog = ({ open, onClose, onSubmit }) => {
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [fileError, setFileError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ffmpeg] = useState(new FFmpeg());
  const [ffmpegReady, setFfmpegReady] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const { identity } = useGetIdentity();
  const role = identity?.role;

  // Load ffmpeg once
  useEffect(() => {
    (async () => {
      try {
        await ffmpeg.load();
        setFfmpegReady(true);
      } catch (error) {
        console.error("Failed to load FFmpeg:", error);
      }
    })();
  }, [ffmpeg]);

  // Get video duration helper
  const getVideoDuration = (file) => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        resolve(video.duration);
      };
      video.onerror = () => reject("Failed to load video metadata");
      video.src = URL.createObjectURL(file);
    });
  };

  // Image compressor using CompressorJS
  const compressImage = async (file) => {
    return new Promise((resolve, reject) => {
      let quality = 0.6;
      const attempt = () => {
        new Compressor(file, {
          quality,
          convertTypes: ["image/jpeg"],
          success(result) {
            if (result.size <= MAX_SIZE) {
              resolve(result);
            } else if (quality <= 0.1) {
              // If we've reached minimum quality and still above 512KB, reject
              reject(new Error("Please try a smaller image."));
            } else {
              quality -= 0.1;
              attempt();
            }
          },
          error(err) {
            reject(err);
          },
        });
      };
      attempt();
    });
  };

  const compressVideo = async (file) => {
    const duration = await getVideoDuration(file);

    const MAX_SIZE = 512 * 1024; // 512KB
    const targetBits = MAX_SIZE * 8; // convert to bits

    // bitrate needed to reach 512KB
    let calculatedBitrate = Math.floor(targetBits / duration / 1000); // in kbps

    // Minimum bitrate required for acceptable 480p clarity
    const MIN_480P_BITRATE = 300; // kbps

    // If compression requires bitrate lower than clarity threshold → ERROR
    if (calculatedBitrate < MIN_480P_BITRATE) {
      throw new Error("Please try a smaller file");
    }

    // Use the calculated bitrate
    const bitrate = calculatedBitrate;

    ffmpeg.writeFile("input.mp4", await fetchFile(file));

    await ffmpeg.exec([
      "-i",
      "input.mp4",
      "-vf",
      "scale=854:480", // Force 480p resolution (minimum requirement)
      "-b:v",
      `${bitrate}k`,
      "-maxrate",
      `${bitrate}k`,
      "-bufsize",
      `${bitrate * 2}k`,
      "-preset",
      "veryfast",
      "-crf",
      "28",
      "output.mp4",
    ]);

    const data = await ffmpeg.readFile("output.mp4");
    const blob = new Blob([data.buffer], { type: "video/mp4" });

    // Final safety check
    if (blob.size > MAX_SIZE) {
      throw new Error(
        "Please try a smaller file"
      );
    }

    return blob;
  };

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];
    setFileError("");

    if (!selectedFile) return;

    // Check file size
    if (selectedFile.size > TICKET_CONSTANTS.MAX_FILE_SIZE) {
      setFileError("File size must be less than 25MB");
      return;
    }

    // Check file type
    const isImage = TICKET_CONSTANTS.ALLOWED_IMAGE_TYPES.includes(
      selectedFile.type
    );
    const isVideo = TICKET_CONSTANTS.ALLOWED_VIDEO_TYPES.includes(
      selectedFile.type
    );

    if (!isImage && !isVideo) {
      setFileError("Only image and video files are allowed");
      return;
    }

    // Compress file if needed
    if (selectedFile.size > MAX_SIZE) {
      setIsCompressing(true);
      try {
        let compressedFile;

        if (isImage) {
          compressedFile = await compressImage(selectedFile);
          // Convert Blob to File
          compressedFile = new File([compressedFile], selectedFile.name, {
            type: compressedFile.type,
            lastModified: Date.now(),
          });
        } else if (isVideo) {
          if (!ffmpegReady) {
            setFileError("Video compressor is still loading. Please wait...");
            setIsCompressing(false);
            return;
          }
          compressedFile = await compressVideo(selectedFile);
          // Convert Blob to File
          compressedFile = new File(
            [compressedFile],
            selectedFile.name.replace(/\.[^/.]+$/, ".mp4"),
            {
              type: "video/mp4",
              lastModified: Date.now(),
            }
          );
        }

        setFile(compressedFile);
      } catch (error) {
        console.error("Compression error:", error);
        setFileError("Please try a smaller file.");
      } finally {
        setIsCompressing(false);
      }
    } else {
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
      role,
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
              {CATEGORIES[role]?.map((option) => (
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
              helperText={
                errors.description || `${description.length} characters`
              }
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
                startIcon={
                  isCompressing ? (
                    <CircularProgress size={20} />
                  ) : (
                    <AttachFileIcon />
                  )
                }
                disabled={isSubmitting || isCompressing}
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
                {isCompressing
                  ? "Compressing..."
                  : "Upload Image/Video"}
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

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 0.5, display: "block" }}
            >
              Supported formats: Images (JPEG, JPG, PNG, GIF, WebP, BMP) and
              Videos (MP4, MPEG, MOV, AVI, WebM). Files will be
              automatically compressed to 512KB if larger.
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
