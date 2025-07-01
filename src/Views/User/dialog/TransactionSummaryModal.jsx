import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from "@mui/material";
import { fetchTransactionSummary, addPayHistory } from "../../../Utils/utils";
import { useGetIdentity } from "react-admin";
import DrawerAgentHistoryModal from "./DrawerAgentHistoryModal"; // Import History Modal
import CloseIcon from "@mui/icons-material/Close";
import { IconButton } from "@mui/material";

const PayModal = ({ open, onClose, userId }) => {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false); // State for showing success message
  const { identity } = useGetIdentity();
  const handleSubmit = async () => {
    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Please enter a valid positive amount greater than 0.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await addPayHistory(
        userId,
        parsedAmount,
        identity?.objectId
      );

      if (response.success) {
        setSuccessMessage(true); // Show success message
        setTimeout(() => {
          setSuccessMessage(false);
          onClose();
        }, 3000); // Close modal after 3 seconds
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
      console.error("Payment Error:", err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    setAmount("");
  }, [open, userId]);
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Enter Payment Amount</DialogTitle>
      <DialogContent>
        <TextField
          label="Amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          fullWidth
          margin="dense"
          error={!!error}
          helperText={error}
          disabled={loading}
        />
      </DialogContent>
      <DialogActions sx={{ px: 5, py: 2 }} className="custom-modal-footer">
        <Box
          className="d-flex w-100 justify-content-between"
          sx={{
            flexDirection: { xs: "column-reverse", sm: "row" }, // 🔁 Reverse order on mobile
            alignItems: { xs: "stretch", sm: "stretch" }, // Stretch items to take full width in both modes
            gap: { xs: 2, sm: 2 }, // Add spacing between buttons
            marginBottom: { xs: 2, sm: 2 }, // Add margin at the bottom
            width: "100% !important", // Ensure the container takes full width
            paddingRight: { xs: 0, sm: 1 },
          }}
        >
        <Button onClick={onClose} className="custom-button cancel" disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          className="custom-button confirm"
          disabled={loading}
        >
          {loading ? "Processing..." : "Submit"}
        </Button></Box>
      </DialogActions>

      {/* Success Message Snackbar */}
      {successMessage && <Alert severity="success">Payment successful!</Alert>}
    </Dialog>
  );
};

const TransactionSummaryModal = ({ open, onClose, record }) => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const redeemServiceFeePercent = 3;
  const [redeemFeeEnabled, setRedeemFeeEnabled] = useState(false);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false); // State for history modal
  const [conversionFeePercent, setConversionFeePercent] = useState(10); // default 10%

  useEffect(() => {
    fetchSummary();
  }, [open, record]);

  const fetchSummary = async () => {
    if (open && record) {
      setLoading(true);
      try {
        const data = await fetchTransactionSummary(record?.id);
        setSummary(data);
      } catch (error) {
        console.error("Error fetching transaction summary:", error);
      } finally {
        setLoading(false);
      }
    }
  };
  if (loading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pr: 1,
          }}
        >
          Transaction Summary
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
              height: 100,
            }}
          >
            <CircularProgress />
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  if (!summary) {
    return null;
  }

  const { totalRechargeAmount, totalRedeemAmount, drawerAgentResults,totalRedeemServiceFee } =
    summary;
  const conversionFee =
    (totalRechargeAmount * (Number(conversionFeePercent) || 0)) / 100;
  const redeemServiceFee = totalRedeemServiceFee;
  const totalAgentTicketPaid =
    totalRechargeAmount -
    drawerAgentResults-
    totalRedeemAmount -
    conversionFee 
    ;

    const totalTicketAmount =
    totalRechargeAmount -
    totalRedeemAmount -
    conversionFee  + (redeemFeeEnabled ? redeemServiceFee : 0)
    ;
    const toBePaidAmount = totalTicketAmount - drawerAgentResults;

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pr: 1,
          }}
        >
          Transaction Summary
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography>
              <strong>Total Recharge:</strong> {totalRechargeAmount.toFixed(2)}
            </Typography>
            <Typography>
              <strong>Total Redeem:</strong> {totalRedeemAmount.toFixed(2)}
            </Typography>
            <TextField
              label="Conversion Fee (%)"
              type="number"
              value={conversionFeePercent}
              onChange={(e) => setConversionFeePercent(Number(e.target.value))}
              InputProps={{ inputProps: { min: 0, step: 0.1 } }}
              fullWidth
              size="small"
            />
            <Typography>
              <strong>Conversion Fee Amount:</strong> {conversionFee.toFixed(2)}
            </Typography>
            <Typography>
              <strong>Redeem Service Fees:</strong>{" "}
              {redeemServiceFee.toFixed(2)}
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={redeemFeeEnabled}
                  onChange={() => setRedeemFeeEnabled(!redeemFeeEnabled)}
                />
              }
              label="Include Redeem Service Fee in Ticket Balance"
            />
            <Typography>
              <strong>Total Agent Ticket Amount: </strong>{" "}
              {totalTicketAmount.toFixed(2)}
            </Typography>
            <Typography>
              <strong>Total Agent Ticket Paid:</strong>{" "}
              {drawerAgentResults.toFixed(2)}
            </Typography>
            
            <Typography>
              <strong>Total Agent Ticket To be Paid:</strong>{" "}
              { (totalTicketAmount.toFixed(2) - drawerAgentResults.toFixed(2) ).toFixed(2)}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }} className="custom-modal-footer">
        <Box
          className="d-flex w-100 justify-content-between"
          sx={{
            flexDirection: { xs: "column-reverse", sm: "row" }, // 🔁 Reverse order on mobile
            alignItems: { xs: "stretch", sm: "stretch" }, // Stretch items to take full width in both modes
            gap: { xs: 2, sm: 2 }, // Add spacing between buttons
            marginBottom: { xs: 2, sm: 2 }, // Add margin at the bottom
            width: "100% !important", // Ensure the container takes full width
            paddingRight: { xs: 0, sm: 1 },
          }}
        >

          <Button
            onClick={() => setShowHistoryModal(true)}
            className="custom-button cancel"
          >
            View History
          </Button>
          <Button
            className="custom-button confirm"
            onClick={() => setPayModalOpen(true)}
              disabled={toBePaidAmount <= 0} 
              sx={{"&.Mui-disabled": {
                backgroundColor: "#B0B0B0", // Light gray background
                color: "#F0F0F0",            // Faded text
                cursor: "not-allowed",
              }}}
          >
            Pay
          </Button>
          </Box>
        </DialogActions>
      </Dialog>

      <DrawerAgentHistoryModal
        open={showHistoryModal}
        onClose={() => {
          fetchSummary();
          setShowHistoryModal(false);
        }}
        record={record}
      />
      {/* Pay Modal */}
      <PayModal
        open={payModalOpen}
        onClose={() => {
          fetchSummary();
          setPayModalOpen(false);
        }}
        userId={record?.id}
      />
    </>
  );
};

export default TransactionSummaryModal;
