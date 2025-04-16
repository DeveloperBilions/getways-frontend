import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  Button,
  ListGroup,
  ListGroupItem,
  Alert,
  Label,
} from "reactstrap";
import { TextField, CircularProgress, IconButton, Box } from "@mui/material";
import { Parse } from "parse";
import deleteIcon from "../../../Assets/icons/delete.svg";
import "../../../Assets/css/EmergencyDialog.css";

const EmergencyMessageDialog = ({ open, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [newMessageError, setNewMessageError] = useState("");

  // Fetch emergency messages from Parse
  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      setError("");
      try {
        const query = new Parse.Query("Settings");
        query.equalTo("type", "emergencymsg");
        const settingsRecord = await query.first();

        if (settingsRecord) {
          const storedMessages = settingsRecord.get("settings") || [];
          setMessages(storedMessages);
        } else {
          setMessages([]);
        }
      } catch (err) {
        setError(err.message || "Error fetching emergency messages.");
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchMessages();
    }
  }, [open]);

  // Add new message
  const handleAddMessage = () => {
    if (!newMessage.trim()) {
      setNewMessageError("Message cannot be empty.");
    } else {
      setMessages([...messages, newMessage]);
      setNewMessage("");
      setNewMessageError("");
    }
  };

  // Delete a message
  const handleDeleteMessage = (index) => {
    setMessages(messages.filter((_, i) => i !== index));
  };

  // Save messages to Parse
  const handleSave = async () => {
    setLoading(true);
    setError("");

    try {
      const query = new Parse.Query("Settings");
      query.equalTo("type", "emergencymsg");
      let settingsRecord = await query.first();

      if (!settingsRecord) {
        settingsRecord = new Parse.Object("Settings");
        settingsRecord.set("type", "emergencymsg");
      }

      settingsRecord.set("settings", messages);
      await settingsRecord.save();

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.message || "Error saving emergency messages.");
    } finally {
      setLoading(false);
      setNewMessageError("");
    }
  };

  return (
    <Modal isOpen={open} toggle={onClose} centered className="emergency-modal">
      <ModalHeader toggle={onClose} className="emergency-modal-header">
        Manage Emergency Messages
      </ModalHeader>
      <ModalBody className="emergency-modal-body">
        {error && (
          <Alert color="danger" className="emergency-alert">
            {error}
          </Alert>
        )}
        {success && (
          <Alert color="success" className="emergency-alert">
            Emergency messages updated successfully!
          </Alert>
        )}

        {/* <TextField fullWidth
          label="Enter Emergency Message"
          variant="outlined"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          error={Boolean(newMessageError)}
          helperText={newMessageError}
          className="emergency-text-field"
        /> */}
        <Label for="name" className="custom-label">
          Enter Emergency Message
        </Label>

        <TextField
          fullWidth
          variant="outlined"
          placeholder="e.g. portal under maintenance "
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          error={Boolean(newMessageError)}
          helperText={newMessageError}
          sx={{
            "& .MuiOutlinedInput-root": {
              height: "48px",
              backgroundColor: "var(--secondary-color)",
              "& fieldset": {
                borderColor: "#CFD4DB", // Default border
              },
              "&:hover fieldset": {
                borderColor: "black", // Hover state
              },
              "&.Mui-focused fieldset": {
                borderColor: "black", // Focus state
                borderWidth: "1px !important",
              },
            },
            "& .MuiInputLabel-root": {
              color: "black", // Label color
              "&.Mui-focused": {
                color: "black", // Focused label color
              },
            },
            //  mb: 2, // Margin bottom
          }}
        />

        <div className="emergency-add-button-container">
          <Button
            className="emergency-button primary add-message"
            onClick={handleAddMessage}
          >
            Add Message
          </Button>
        </div>

        {/* <ListGroup className="emergency-list-group">
          {messages.map((msg, index) => (
            <ListGroupItem
              key={index}
              className="emergency-list-item"
            >
              {msg}
              <IconButton
                color="error"
                onClick={() => handleDeleteMessage(index)}
                className="emergency-icon-button"
              >
                <MdDelete />
              </IconButton>
            </ListGroupItem>
          ))}
        </ListGroup> */}

        {messages.length > 0 && (
          <ListGroup className="emergency-list-group">
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Label style={{ fontWeight: 600, fontSize: "14px" }}>
                Last open message
              </Label>
              <Label style={{ fontWeight: 600, fontSize: "14px" }}>
                Delete
              </Label>
            </Box>
            {messages.map((msg, index) => (
              <ListGroupItem key={index} className="emergency-list-item">
                <div className="emergency-list-content">{msg}</div>
                <IconButton
                  color="error"
                  onClick={() => handleDeleteMessage(index)}
                  className="emergency-icon-button"
                >
                  <img src={deleteIcon} alt="Delete" />
                </IconButton>
              </ListGroupItem>
            ))}
          </ListGroup>
        )}

        <div className="emergency-footer">
          <Button
            className="emergency-button secondary"
            onClick={onClose}
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            Cancel
          </Button>
          <Button
            className="emergency-button primary"
            onClick={handleSave}
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {loading ? (
              <CircularProgress size={20} className="emergency-loader" />
            ) : (
              "Send message"
            )}
          </Button>
        </div>
      </ModalBody>
    </Modal>
  );
};

export default EmergencyMessageDialog;
