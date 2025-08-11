import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Alert,
  CircularProgress,
  Typography,
  IconButton,
} from "@mui/material";
import Parse from "parse";
import { FormGroup, Input } from "reactstrap";

const ChatbotDialog = ({ open, onClose }) => {
  const [chatbotEnabled, setChatbotEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (open) {
      fetchSettings();
      console.log("fetching settings");
    }
  }, [open]);

  const fetchSettings = async () => {
    try {
      const query = new Parse.Query("Settings");
      query.equalTo("type", "chatbot");
      let obj = await query.first({ useMasterKey: true });
      if (!obj) {
        const Settings = Parse.Object.extend("Settings");
        obj = new Settings();
        obj.set("type", "chatbot");
      }
      setChatbotEnabled(obj.get("settings")?.[0] === "true");
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  const handleSave = async (value) => {
    setLoading(true);
    try {
      const query = new Parse.Query("Settings");
      query.equalTo("type", "chatbot");
      let obj = await query.first({ useMasterKey: true });

      if (!obj) {
        const Settings = Parse.Object.extend("Settings");
        obj = new Settings();
        obj.set("type", "chatbot");
      }
      obj.set("settings", value);
      await obj.save(null, { useMasterKey: true });

      setSuccessMsg("Settings updated successfully!");
      setTimeout(() => {
        setSuccessMsg("");
        onClose();
      }, 3000);
    } catch (err) {
      console.error("Error saving settings:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: 2,
          py: 2,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: "18px" }}>
          Chatbot Settings
        </Typography>
        <IconButton onClick={onClose} size="small">
          {/* <CloseIcon /> */}
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ px: 2, py: 2 }}>
        {successMsg && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMsg}
          </Alert>
        )}

        <Box display="flex" flexDirection="column" gap={1}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            bgcolor="#F6F4F4"
            p={1.5}
            borderRadius={1}
            height="40px"
          >
            <Typography>Enable Chatbot</Typography>
            <FormGroup check className="form-switch">
              <Input
                type="switch"
                id="ChatbotSwitch"
                className="green-switch"
                checked={chatbotEnabled}
                onChange={(e) => setChatbotEnabled(e.target.checked)}
                style={{ width: "40px", height: "20px" }}
              />
            </FormGroup>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, justifyContent: "space-between" }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            px: 4,
            paddingBottom: "10px",
            paddingTop: "10px",
            borderColor: "#e0e0e0",
            color: "#000",
            width: "50%",
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={() => handleSave([chatbotEnabled.toString()])}
          variant="contained"
          disabled={loading}
          sx={{
            width: "50%",
            px: 4,
            paddingBottom: "10px",
            paddingTop: "10px",
            bgcolor: "black",
            "&:hover": { bgcolor: "#333" },
          }}
          startIcon={loading && <CircularProgress size={18} color="inherit" />}
        >
          {loading ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChatbotDialog;
