import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Alert,
} from "@mui/material";
import { Parse } from "parse";
import CloseIcon from "@mui/icons-material/Close";
import { IconButton } from "@mui/material";
Parse.initialize(process.env.REACT_APP_APPID, process.env.REACT_APP_MASTER_KEY);
Parse.serverURL = process.env.REACT_APP_URL;

export const AllowUserCreationDialog = ({
  open,
  onClose,
  record,
  handleRefresh,
}) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState("success");

  const handleConfirm = async () => {
    setLoading(true);
    setMessage("");
    try {
      if (!record?.id) {
        throw new Error("No user record selected.");
      }

      const userQuery = new Parse.Query(Parse.User);
      const user = await userQuery.get(record.id, { useMasterKey: true });
      user.set("allowUserCreation", !record.allowUserCreation);
      await user.save(null, { useMasterKey: true });

      setMessage(
        `User creation ${
          record.allowUserCreation ? "disabled" : "enabled"
        } successfully`
      );
      setSeverity("success");
      handleRefresh();
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (error) {
      console.error("Toggle Error:", error);
      setMessage("Failed to update user creation permission");
      setSeverity("error");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setMessage("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pr: 1,
        }}
      >
        Confirm Change
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          {record?.allowUserCreation ? (
            <>
              Do you want to{" "}
              <span style={{ color: "#d32f2f", fontWeight: 600 }}>disable</span>{" "}
              user creation for this agent?
            </>
          ) : (
            <>
              Do you want to{" "}
              <span style={{ color: "#2e7d32", fontWeight: 600 }}>allow</span>{" "}
              user creation for this agent?
            </>
          )}
        </DialogContentText>

        {message && (
          <Alert severity={severity} sx={{ mb: 1 }}>
            {message}
          </Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ padding: 2 }}>
        <Button
          variant="outlined"
          onClick={handleClose}
          disabled={loading}
          sx={{ width: "50%", paddingBottom: "10px", paddingTop: "10px" }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleConfirm}
          disabled={loading}
          sx={{ width: "50%", paddingBottom: "10px", paddingTop: "10px" }}
        >
          {loading ? "Updating..." : "Confirm"}{" "}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
