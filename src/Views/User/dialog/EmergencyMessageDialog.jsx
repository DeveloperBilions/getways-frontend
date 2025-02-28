import React, { useState, useEffect } from "react";
import { Modal, ModalHeader, ModalBody, Button, ListGroup, ListGroupItem, Alert } from "reactstrap";
import { TextField, CircularProgress, IconButton } from "@mui/material";
import { Parse } from "parse";
import { MdDelete } from "react-icons/md";

const EmergencyMessageDialog = ({ open, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

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
    if (newMessage.trim()) {
      setMessages([...messages, newMessage]);
      setNewMessage("");
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
    }
  };

  return (
    <Modal isOpen={open} toggle={onClose} centered>
      <ModalHeader toggle={onClose}>Manage Emergency Messages</ModalHeader>
      <ModalBody>
        {error && <Alert color="danger">{error}</Alert>}
        {success && <Alert color="success">Emergency messages updated successfully!</Alert>}
        
        <TextField
          fullWidth
          label="Enter Emergency Message"
          variant="outlined"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <Button color="primary" className="mt-2" onClick={handleAddMessage}>
          Add Message
        </Button>

        <ListGroup className="mt-3">
          {messages.map((msg, index) => (
            <ListGroupItem key={index} className="d-flex justify-content-between align-items-center">
              {msg}
              <IconButton color="error" onClick={() => handleDeleteMessage(index)}>
                <MdDelete />
              </IconButton>
            </ListGroupItem>
          ))}
        </ListGroup>

        <div className="text-end mt-4">
          <Button color="primary" onClick={handleSave} disabled={loading} className="me-2">
            {loading ? <CircularProgress size={20} color="inherit" /> : "Save"}
          </Button>
          <Button color="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
        </div>
      </ModalBody>
    </Modal>
  );
};

export default EmergencyMessageDialog;
