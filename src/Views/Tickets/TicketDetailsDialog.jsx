import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Paper,
  Chip,
  ImageList,
  ImageListItem,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";

const getStatusColor = (status) => {
  if (!status) return "default";
  switch (status.toLowerCase()) {
    case "new":
      return "primary";
    case "in_progress":
      return "warning";
    case "resolved":
      return "success";
    default:
      return "default";
  }
};

const capitalizeFirstLetter = (string) => {
  if (!string) return "";
  return string.split(/[ _]/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

const isImageUrl = (url) => {
  if (!url) return false;
  const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"];
  const lowerUrl = url.toLowerCase();
  return imageExtensions.some((ext) => lowerUrl.includes(ext));
};

const isVideoUrl = (url) => {
  if (!url) return false;
  const videoExtensions = [".mp4", ".mpeg", ".mov", ".avi", ".webm"];
  const lowerUrl = url.toLowerCase();
  return videoExtensions.some((ext) => lowerUrl.includes(ext));
};

const AttachmentPreviewDialog = ({ open, onClose, url }) => {
  const isImage = isImageUrl(url);
  const isVideo = isVideoUrl(url);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
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
        }}
      >
        <Typography variant="h6">Attachment Preview</Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: 300,
          }}
        >
          {isImage ? (
            <img
              src={url}
              alt="Attachment"
              style={{
                maxWidth: "100%",
                maxHeight: "70vh",
                objectFit: "contain",
              }}
            />
          ) : isVideo ? (
            <video
              controls
              style={{
                maxWidth: "100%",
                maxHeight: "70vh",
              }}
            >
              <source src={url} />
              Your browser does not support the video tag.
            </video>
          ) : (
            <Box sx={{ textAlign: "center" }}>
              <AttachFileIcon sx={{ fontSize: 60, color: "text.secondary" }} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Preview not available for this file type
              </Typography>
              <Typography
                component="a"
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  display: "block",
                  mt: 2,
                  color: "primary.main",
                  textDecoration: "none",
                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}
              >
                Open in new tab
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

const TicketDetailsDialog = ({ open, onClose, ticket }) => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  if (!ticket) return null;

  const hasAttachments =
    ticket.attachmentURL &&
    Array.isArray(ticket.attachmentURL) &&
    ticket.attachmentURL.length > 0;

  const handlePreviewOpen = (url) => {
    setPreviewUrl(url);
    setPreviewOpen(true);
  };

  const handlePreviewClose = () => {
    setPreviewOpen(false);
    setPreviewUrl(null);
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
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
            Ticket Details - {ticket.ticketId || ticket.id}
          </Typography>
          <IconButton
            onClick={onClose}
            size="small"
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
            {/* Ticket Info */}
            <Box
              sx={{
                p: 2,
                bgcolor: "grey.50",
                borderRadius: 1,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Username:</strong> {ticket.username}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Category:</strong> {capitalizeFirstLetter(ticket.category)}
                  </Typography>
                </Box>
                <Chip
                  label={capitalizeFirstLetter(ticket.status)}
                  color={getStatusColor(ticket.status)}
                  sx={{ fontWeight: 500 }}
                />
              </Box>
              <Typography variant="body2" color="text.secondary">
                <strong>Created:</strong>{" "}
                {new Date(ticket.createdAt).toLocaleString()}
              </Typography>
            </Box>

            {/* Description */}
            <Box>
              <Typography
                variant="subtitle2"
                gutterBottom
                sx={{ fontWeight: 600, color: "primary.main" }}
              >
                Description
              </Typography>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor: "grey.50",
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {ticket.description}
                </Typography>
              </Paper>
            </Box>

            {/* Attachments */}
            {hasAttachments && (
              <Box>
                <Typography
                  variant="subtitle2"
                  gutterBottom
                  sx={{ fontWeight: 600, color: "info.main" }}
                >
                  Attachments ({ticket.attachmentURL.length})
                </Typography>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    bgcolor: "info.50",
                    borderRadius: 1,
                    border: "1px solid",
                    borderColor: "info.light",
                  }}
                >
                  <ImageList
                    sx={{
                      width: "100%",
                      maxHeight: 300,
                    }}
                    cols={3}
                    rowHeight={120}
                    gap={8}
                  >
                    {ticket.attachmentURL.map((url, index) => (
                      <ImageListItem
                        key={index}
                        sx={{
                          cursor: "pointer",
                          border: "1px solid",
                          borderColor: "divider",
                          borderRadius: 1,
                          overflow: "hidden",
                          position: "relative",
                          "&:hover": {
                            opacity: 0.8,
                            boxShadow: 2,
                          },
                        }}
                        onClick={() => handlePreviewOpen(url)}
                      >
                        {isImageUrl(url) ? (
                          <img
                            src={url}
                            alt={`Attachment ${index + 1}`}
                            loading="lazy"
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "contain",
                            }}
                          />
                        ) : isVideoUrl(url) ? (
                          <Box
                            sx={{
                              width: "100%",
                              height: "100%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              bgcolor: "grey.200",
                              position: "relative",
                            }}
                          >
                            <video
                              src={url}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                            <PlayCircleOutlineIcon
                              sx={{
                                position: "absolute",
                                fontSize: 40,
                                color: "white",
                                opacity: 0.9,
                              }}
                            />
                          </Box>
                        ) : (
                          <Box
                            sx={{
                              width: "100%",
                              height: "100%",
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              justifyContent: "center",
                              bgcolor: "grey.100",
                            }}
                          >
                            <AttachFileIcon
                              sx={{ fontSize: 40, color: "text.secondary" }}
                            />
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ mt: 1 }}
                            >
                              File {index + 1}
                            </Typography>
                          </Box>
                        )}
                      </ImageListItem>
                    ))}
                  </ImageList>
                </Paper>
              </Box>
            )}

            {/* Remarks */}
            {ticket.remarks && (
              <Box>
                <Typography
                  variant="subtitle2"
                  gutterBottom
                  sx={{ fontWeight: 600, color: "success.main" }}
                >
                  Remarks
                </Typography>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    bgcolor: "success.50",
                    borderRadius: 1,
                    border: "1px solid",
                    borderColor: "success.light",
                  }}
                >
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    {ticket.remarks}
                  </Typography>
                </Paper>
              </Box>
            )}
          </Box>
        </DialogContent>
      </Dialog>

      {/* Attachment Preview Dialog */}
      <AttachmentPreviewDialog
        open={previewOpen}
        onClose={handlePreviewClose}
        url={previewUrl}
      />
    </>
  );
};

export default TicketDetailsDialog;
