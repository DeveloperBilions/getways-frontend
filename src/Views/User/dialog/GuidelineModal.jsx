import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Divider,
  IconButton,
  Box,
} from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import CloseIcon from "@mui/icons-material/Close";
import AOGSymbol from "../../../Assets/icons/AOGsymbol.png";

const GuidelineModal = ({ open, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      {/* Modal Header */}
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          bgcolor: "white",
          color: "black",
          fontWeight: "bold",
          borderBottom: "1px solid #ddd",
          fontSize: "0.9rem",
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <HelpOutlineIcon fontSize="small" />
          <Typography variant="body1" fontWeight="bold">
            Account Transactions Help
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: "black" }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      {/* Modal Content */}
      <DialogContent sx={{ bgcolor: "white", color: "black" }}>
        <Typography variant="subtitle2" sx={{ fontWeight: "bold", mt: 1 }}>
          Recharge through portals
        </Typography>
        <Typography variant="body2">Maximum Amount per transaction: <b><img
                  src={AOGSymbol}
                  alt="AOG Symbol"
                  style={{ width: "15px", height: "15px" }}
                /> 500</b></Typography>
        <Typography variant="body2">Minimum Amount per transaction: <b><img
                  src={AOGSymbol}
                  alt="AOG Symbol"
                  style={{ width: "15px", height: "15px"}}
                /> 15</b></Typography>
        <Divider sx={{ my: 1.5 }} />

        <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
          Recharge through Wallet
        </Typography>
        <Typography variant="body2">Maximum Amount per transaction: <b><img
                  src={AOGSymbol}
                  alt="AOG Symbol"
                  style={{ width: "15px", height: "15px"}}
                /> 500</b></Typography>
        <Typography variant="body2">Minimum Amount: <b>No limit</b></Typography>
        <Divider sx={{ my: 1.5 }} />

        <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
          Redeems
        </Typography>
        <Typography variant="body2">Maximum Amount per day: <b><img
                  src={AOGSymbol}
                  alt="AOG Symbol"
                  style={{ width: "15px", height: "15px"}}
                /> 2000</b></Typography>
        <Typography variant="body2">Minimum Amount per transaction: <b><img
                  src={AOGSymbol}
                  alt="AOG Symbol"
                  style={{ width: "15px", height: "15px"}}
                /> 15</b></Typography>
        <Divider sx={{ my: 1.5 }} />

        <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
          Cashout for Players
        </Typography>
        <Typography variant="body2">Maximum Cashout per day: <b><img
                  src={AOGSymbol}
                  alt="AOG Symbol"
                  style={{ width: "15px", height: "15px"}}
                /> 1000</b></Typography>
        <Typography variant="body2">Minimum Cashout per transaction: <b><img
                  src={AOGSymbol}
                  alt="AOG Symbol"
                  style={{ width: "15px", height: "15px"}}
                /> 15</b></Typography>
        <Typography variant="body2">
          Processing Time: <b>Cashouts may take minimum 2 hours to maximum upto 6 hours in certain cases.</b>
        </Typography>
        <Typography variant="caption" sx={{ mt: 1, fontStyle: "italic" }}>
          Refund Notice: If a refund is processed through any of our payment gateways, it might take up to <b>24 hours</b> for the refunded money to reflect in your wallet, depending on the payment mode used.
        </Typography>
        <Divider sx={{ my: 1.5 }} />

        <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
          Cashout for Agents
        </Typography>
        <Typography variant="body2">
          <b>New Agents:</b> A pot balance of <img
                  src={AOGSymbol}
                  alt="AOG Symbol"
                  style={{ width: "15px", height: "15px"}}
                /> 200 is required to enable cashouts for their players.
        </Typography>
        <Typography variant="body2">
          <b>Existing Agents (Accounts Older Than 30 Days):</b> A minimum balance of <img
                  src={AOGSymbol}
                  alt="AOG Symbol"
                  style={{ width: "15px", height: "15px"}}
                /> 500 is required for cashouts for their players.
        </Typography>
        <Typography variant="body2">
          <b>Cashout Schedule for Agents:</b> Cashouts are processed monthly on the 6th of next month.
        </Typography>
      </DialogContent>

      {/* Modal Footer */}
      <DialogActions sx={{ bgcolor: "white", justifyContent: "center", borderTop: "1px solid #ddd" }}>
        <Button onClick={onClose} variant="contained" sx={{ bgcolor: "black", color: "white", fontSize: "0.75rem" }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GuidelineModal;
