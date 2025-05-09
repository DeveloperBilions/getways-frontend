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
      <DialogActions>
        <Button onClick={onClose} color="secondary" disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          variant="contained"
          disabled={loading}
        >
          {loading ? "Processing..." : "Submit"}
        </Button>
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
  const [redeemFeeEnabled, setRedeemFeeEnabled] = useState(true);
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

  const { totalRechargeAmount, totalRedeemAmount, drawerAgentResults } =
    summary;
  const conversionFee =
    (totalRechargeAmount * (Number(conversionFeePercent) || 0)) / 100;
  const redeemServiceFee = (totalRedeemAmount * redeemServiceFeePercent) / 100;
  const totalAgentTicketPaid =
    totalRechargeAmount -
    totalRedeemAmount -
    conversionFee -
    (redeemFeeEnabled ? redeemServiceFee : 0) -
    drawerAgentResults;

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
              <strong>Total Agent Ticket Paid:</strong>{" "}
              {drawerAgentResults.toFixed(2)}
            </Typography>
            <Typography>
              <strong>Total Agent Ticket To be Paid:</strong>{" "}
              {totalAgentTicketPaid.toFixed(2)}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ padding: 2 ,width:"100%"}}>
          <Button
            onClick={() => setShowHistoryModal(true)}
            color="info"
            variant="outlined"
            sx={{ width: "50%", paddingBottom: "10px", paddingTop: "10px" }}
          >
            View History
          </Button>
          <Button
                    sx={{ width: "50%", paddingBottom: "10px", paddingTop: "10px" }}

            onClick={() => setPayModalOpen(true)}
            color="primary"
            variant="contained"
          >
            Pay
          </Button>
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
