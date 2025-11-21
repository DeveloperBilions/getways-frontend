import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Collapse,
  TextField,
  MenuItem,
  Grid,
  ImageList,
  ImageListItem,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import { useDataProvider } from "react-admin";
import CustomPagination from "../../Views/Common/CustomPagination";

const formatDateTime = (date) => {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

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

// Helper function to check if URL is an image
const isImageUrl = (url) => {
  if (!url) return false;
  const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"];
  const lowerUrl = url.toLowerCase();
  return imageExtensions.some((ext) => lowerUrl.includes(ext));
};

// Helper function to check if URL is a video
const isVideoUrl = (url) => {
  if (!url) return false;
  const videoExtensions = [".mp4", ".mpeg", ".mov", ".avi", ".webm"];
  const lowerUrl = url.toLowerCase();
  return videoExtensions.some((ext) => lowerUrl.includes(ext));
};

// Attachment Preview Dialog
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

// Row component with expandable details
const TicketRow = ({ ticket }) => {
  const [open, setOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const hasAttachments =
    ticket.attachmentURL && Array.isArray(ticket.attachmentURL) && ticket.attachmentURL.length > 0;

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
      <TableRow
        sx={{
          "&:hover": {
            bgcolor: "action.hover",
          },
          "& > *": { borderBottom: "unset" },
        }}
      >
        <TableCell sx={{ width: 50 }}>
          <IconButton
            size="small"
            onClick={() => setOpen(!open)}
            sx={{
              transition: "transform 0.2s",
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
            }}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell sx={{ fontSize: 13 }}>
          {formatDateTime(ticket.createdAt)}
        </TableCell>
        <TableCell sx={{ fontSize: 13, fontWeight: 500 }}>
          {ticket.ticketId || ticket.id}
        </TableCell>
        <TableCell sx={{ fontSize: 13 }}>
          {capitalizeFirstLetter(ticket.category)}
        </TableCell>
        <TableCell>
          <Chip
            label={capitalizeFirstLetter(ticket.status)}
            color={getStatusColor(ticket.status)}
            size="small"
            sx={{
              fontWeight: 500,
              fontSize: 12,
            }}
          />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 2 }}>
              <Box sx={{ mb: 2 }}>
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
                    {ticket.description || "No description provided"}
                  </Typography>
                </Paper>
              </Box>

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

              {hasAttachments && (
                <Box sx={{ mt: 2 }}>
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
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>

      {/* Attachment Preview Dialog */}
      <AttachmentPreviewDialog
        open={previewOpen}
        onClose={handlePreviewClose}
        url={previewUrl}
      />
    </>
  );
};

const CATEGORIES = [
  { value: "", label: "All Categories" },
  { value: "redeem", label: "Redeem" },
  { value: "recharge", label: "Recharge" },
  { value: "wallet", label: "Wallet" },
  { value: "giftcard", label: "Gift Card" },
  { value: "login", label: "Login" },
  { value: "others", label: "Others" },
];

const STATUSES = [
  { value: "", label: "All Statuses" },
  { value: "new", label: "New" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
];

const MyTicketsDialog = ({ open, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const dataProvider = useDataProvider();

  const fetchTickets = useCallback(async () => {
    setIsLoading(true);
    try {
      const filters = {};
      if (statusFilter) filters.status = statusFilter;
      if (categoryFilter) filters.category = categoryFilter;

      const { data, total } = await dataProvider.getList("tickets", {
        pagination: { page, perPage },
        sort: { field: "createdAt", order: "DESC" },
        filter: filters,
      });
      setTickets(data);
      setTotal(total);
    } catch (error) {
      console.error("Error fetching tickets:", error);
      setTickets([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [dataProvider, page, perPage, statusFilter, categoryFilter]);

  // Fetch tickets when dialog opens or pagination changes
  useEffect(() => {
    if (open) {
      fetchTickets();
    }
  }, [open, fetchTickets]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          minHeight: "500px",
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
          My Support Tickets
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
        {/* Filters Section */}
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                size="small"
                label="Filter by Status"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1); // Reset to first page when filter changes
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 1.5,
                  },
                }}
              >
                {STATUSES.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                size="small"
                label="Filter by Category"
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setPage(1); // Reset to first page when filter changes
                }}
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
            </Grid>
          </Grid>
        </Box>

        {isLoading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: 300,
            }}
          >
            <CircularProgress />
          </Box>
        ) : tickets.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              minHeight: 300,
              gap: 2,
            }}
          >
            <Typography variant="h6" color="text.secondary">
              No Tickets Found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              You haven't created any support tickets yet.
            </Typography>
          </Box>
        ) : (
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
            }}
          >
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "grey.50" }}>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      fontSize: 14,
                      color: "text.primary",
                      width: 50,
                    }}
                  >
                    Actions
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      fontSize: 14,
                      color: "text.primary",
                    }}
                  >
                    Date & Time
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      fontSize: 14,
                      color: "text.primary",
                    }}
                  >
                    Ticket ID
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      fontSize: 14,
                      color: "text.primary",
                    }}
                  >
                    Category
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      fontSize: 14,
                      color: "text.primary",
                    }}
                  >
                    Status
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tickets.map((ticket) => (
                  <TicketRow key={ticket.id} ticket={ticket} />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {total > 0 && (
          <Box sx={{ mt: 2 }}>
            <CustomPagination
              page={page}
              perPage={perPage}
              total={total}
              setPage={setPage}
              setPerPage={setPerPage}
              player={true}
            />
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MyTicketsDialog;
