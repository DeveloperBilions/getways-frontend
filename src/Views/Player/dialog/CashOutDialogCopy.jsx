import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";
import AOG_Symbol from "../../../Assets/icons/AOGsymbol.png";
import { Box, IconButton, TextField, Typography, Select, MenuItem } from "@mui/material";
import SelectGiftCardDialog from "./SelectGiftCardDialog";
import Close from "../../../Assets/icons/close.svg";
import { isCashoutEnabledForAgent } from "../../../Utils/utils";
import { useGetIdentity } from "react-admin";
import { Alert ,Button} from "@mui/material";
import CheckbookPaymentDialog from './CheckbookPaymentDialog';
import Parse from "parse";
import ClkkDialog from "../ClkkDialog";
import FiservDisbursementDialog from "../../Fiserv/FiservDisbursementDialog";

const ALL_METHODS = {
  giftcard: "Gift Card",
  paypal: "PayPal",
  venmo: "Venmo",
  card: "Push To Card",
  clkk: "CLKK",
  fiservpaypal: "Fiserv PayPal", // Fiserv Digital Disbursements - PayPal
  fiservvenmo: "Fiserv Venmo",   // Fiserv Digital Disbursements - Venmo
  fiservdebit: "Fiserv Debit Card",  // Fiserv Digital Disbursements - Debit Card
  fiservach: "Fiserv ACH",          // Fiserv Digital Disbursements - ACH
  fiservrtp: "Fiserv RTP",          // Fiserv Digital Disbursements - Real-Time Payments
  fiservcoinbase: "Fiserv Coinbase", // Fiserv Digital Disbursements - Coinbase
  fiservvisaplus: "Fiserv Visa+",    // Fiserv Digital Disbursements - VisaPlus
  fiservecheck: "Fiserv eCheck",     // Fiserv Digital Disbursements - Printable eCheck
};

// Maps fiserv keys to the method name used by FiservDisbursementDialog
const FISERV_KEY_MAP = {
  fiservpaypal: "paypal",
  fiservvenmo: "venmo",
  fiservdebit: "debit",
  fiservach: "ach",
  fiservrtp: "rtp",
  fiservcoinbase: "coinbase",
  fiservvisaplus: "visaplus",
  fiservecheck: "echeck",
};

const CashOutModal = ({
  setOpen,
  open,
  onClose,
  balance: initialBalance,
  record,
  handleRefresh,
  handleCashoutRefresh
}) => {
  const { identity } = useGetIdentity();
  const [isGiftCardOpen, setIsGiftCardOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [balance, setBalance] = useState(initialBalance);
  const [cashoutDisabled, setCashoutDisabled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const [availableMethods, setAvailableMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(""); // ✅ default empty
  const [clkkDialogOpen, setClkkDialogOpen] = useState(false);
  const [fiservDialogOpen, setFiservDialogOpen] = useState(false);
  const [dbMethods, setDbMethods] = useState({});

  useEffect(() => {
    setErrorMessage("");
  }, [open]);

  useEffect(() => {
    const checkRechargeAccess = async () => {
      const disabled = !(await isCashoutEnabledForAgent(identity?.userParentId));
      setCashoutDisabled(disabled);
    };
    checkRechargeAccess();
  }, [identity]);

  // Fetch available payment methods
  const fetchAvailableMethods = async () => {
    if (!identity?.userParentId) return;
    try {
      // Fetch DB methods and build a lookup by key
      const dbMethodsMap = {};
      try {
        const methods = await Parse.Cloud.run("getCashoutMethods");
        methods.forEach((m) => { dbMethodsMap[m.key] = m; });
      } catch (dbErr) {
        console.error("Error fetching DB cashout methods:", dbErr);
      }
      setDbMethods(dbMethodsMap);

      // Merge DB methods into ALL_METHODS for the dropdown labels
      const combinedMethods = { ...ALL_METHODS };
      Object.keys(dbMethodsMap).forEach((key) => {
        if (!combinedMethods[key]) {
          combinedMethods[key] = dbMethodsMap[key].label;
        }
      });

      const q = new Parse.Query("Settings");
      q.startsWith("type", "allowedCashoutAgentsFor_");
      const results = await q.find({ useMasterKey: true });

      const allowed = [];
      results.forEach((r) => {
        const ids = r.get("settings") || [];
        if (ids.includes(identity.userParentId)) {
          const type = r.get("type");
          const key = type.replace("allowedCashoutAgentsFor_", "");
          if (combinedMethods[key]) {
            allowed.push(key);
          }
        }
      });

      setAvailableMethods(allowed);
      setSelectedMethod(""); // ✅ don't auto-select
    } catch (err) {
      console.error("Error fetching allowed cashout methods:", err);
    }
  };

  useEffect(() => {
    if (open) {
      fetchAvailableMethods();
    }
  }, [open]);

  const validateBalance = () => {
    if (!balance) return "Cashout amount cannot be empty.";
    if (balance <= 0) return "Cashout amount cannot be negative or 0.";
    if (!selectedMethod) return "Please select a payment method.";

    const amount = Number(balance);

    // Use DB min/max if available, otherwise fall back to hardcoded defaults
    const dbInfo = dbMethods[selectedMethod];
    if (dbInfo) {
      const min = dbInfo.minAmount || 0;
      const max = dbInfo.maxAmount || 10000;
      if (min > 0 && amount < min) return `${ALL_METHODS[selectedMethod] || dbInfo.label} cashout must be at least $${min}.`;
      if (max > 0 && amount > max) return `${ALL_METHODS[selectedMethod] || dbInfo.label} cashout cannot exceed $${max}.`;
    } else if (selectedMethod === "giftcard") {
      if (amount < 15) return "Gift card cashout must be at least $15.";
    } else if (["paypal", "venmo", "card", "clkk", "fiservpaypal", "fiservvenmo", "fiservdebit", "fiservach", "fiservrtp", "fiservcoinbase", "fiservvisaplus", "fiservecheck"].includes(selectedMethod)) {
      if (amount < 25) return `${ALL_METHODS[selectedMethod]} cashout must be at least $25.`;
      if (amount > 500) return `${ALL_METHODS[selectedMethod]} cashout cannot exceed $500.`;
    }

    if (amount > initialBalance) {
      return "Cashout amount cannot be greater than your current balance.";
    }
    return "";
  };

  const handleNext = () => {
    const validationError = validateBalance();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }
    if (selectedMethod === "giftcard") {
      setIsGiftCardOpen(true);
      onClose();
    } else if (FISERV_KEY_MAP[selectedMethod] || dbMethods[selectedMethod]?.provider === "fiserv") {
      // Open Fiserv Digital Disbursements Dialog
      setFiservDialogOpen(true);
      onClose();
    } else {
      setClkkDialogOpen(true);
      onClose();
    }
  };

  const handleGiftCardSuccess = () => {
    setIsGiftCardOpen(false);
    onClose();
  };

  const handleBalanceChange = (e) => {
    const raw = e.target.value;
    const numeric = raw.replace(/\D/g, "");
    if (numeric.length > 4) return;
    setBalance(numeric);
    setErrorMessage("");
  };

  const handleClose = () => {
    setBalance(initialBalance);
    setIsGiftCardOpen(false);
    onClose();
  };

  return (
    <>
      <Modal isOpen={open && !isGiftCardOpen} toggle={handleClose} centered>
        <Box sx={{ borderRadius: "8px", border: "1px solid #E7E7E7", backgroundColor: "#FFFFFF" }}>
          <ModalHeader
            toggle={handleClose}
            className="border-bottom-0 pb-0"
            close={
              <IconButton
                onClick={onClose}
                sx={{ position: "absolute", right: "16px", top: "16px" }}
              >
                <img src={Close} alt="cancel" width="24px" height="24px" />
              </IconButton>
            }
          >
            Cash out
          </ModalHeader>
          <ModalBody>
            {cashoutDisabled && (
              <Alert severity="warning" sx={{ my: 2 }}>
                Cashouts are not available at this time. Please try again later.
              </Alert>
            )}
             {availableMethods.length === 0 && !cashoutDisabled && (
    <Alert severity="error" sx={{ my: 2 }}>
      No payment methods are available for your account. Please contact support.
    </Alert>
  )}
            <Box className="d-flex align-items-center rounded mb-4 justify-content-between"
                 sx={{ bgcolor: "#F4F3FC", padding: "16px 22px" }}>
              <Typography sx={{ color: "#4A4A4A", fontSize: "14px" }}>
                Available Balance
              </Typography>
              <Box className="d-flex align-items-center">
                <img src={AOG_Symbol} alt="Coin" style={{ width: 24, height: 24, marginRight: 5 }} />
                <Typography sx={{ fontSize: 24, fontWeight: 600 }}>
                  {initialBalance}
                </Typography>
              </Box>
            </Box>
            {errorMessage && (
              <Box className="alert alert-danger mt-2">{errorMessage}</Box>
            )}

            <Box className="text-center mb-4">
              <Typography sx={{ fontSize: "14px", color: "#333", fontWeight: 400, textAlign: "start" }}>
                You can use your wallet funds for instant recharges! Want to recharge instead?
              </Typography>
              <Box className="d-flex align-items-center justify-content-start rounded p-2 mt-4"
                   sx={{ border: "1px solid #E7E7E7" }}>
                <img src={AOG_Symbol} alt="Coin" style={{ width: 40, height: 40, marginRight: 10 }} />
                <TextField
                  type="text"
                  value={balance}
                  onChange={handleBalanceChange}
                  variant="standard"
                  InputProps={{
                    disableUnderline: true,
                    style: { fontSize: "40px", fontWeight: 600 },
                  }}
                  sx={{ width: "100%" }}
                />
              </Box>
            </Box>

            {/* Payment Method dropdown */}
            <Box sx={{ mb: 3 }}>
              <Typography sx={{ fontSize: "14px", mb: 1 }}>
                Select Method
              </Typography>
              <Select
                fullWidth
                value={selectedMethod}
                onChange={(e) => setSelectedMethod(e.target.value)}
                displayEmpty
              >
                <MenuItem value="">-- Select Method --</MenuItem>
                {availableMethods.map((m) => (
                  <MenuItem key={m} value={m}>
                    {ALL_METHODS[m] || dbMethods[m]?.label || m}
                  </MenuItem>
                ))}
              </Select>
            </Box>
          </ModalBody>
          <ModalFooter>
            <Box className="d-flex w-100 justify-content-between"
                 sx={{ flexDirection: { xs: "column-reverse", sm: "row" }, gap: 2 }}>
              <Button onClick={handleClose}>Cancel</Button>
              <Button onClick={handleNext} disabled={cashoutDisabled} variant="contained">
                Next
              </Button>
            </Box>
          </ModalFooter>
        </Box>
      </Modal>

      {/* GiftCard Flow */}
      <SelectGiftCardDialog
        open={isGiftCardOpen}
        onClose={() => {
          setIsGiftCardOpen(false);
          handleClose();
          handleRefresh();
        }}
        onBack={() => {
          setIsGiftCardOpen(false);
          setOpen();
        }}
        balance={initialBalance}
        redeemAmount={balance}
        record={record}
        onSuccess={handleGiftCardSuccess}
      />

      {/* CLKK Flow */}
      <ClkkDialog
        open={clkkDialogOpen}
        onClose={() => setClkkDialogOpen(false)}
        handleRefresh={handleCashoutRefresh}
        amount={balance}
        method={selectedMethod}
        availableMethods={availableMethods}
      />

      {/* Checkbook Flow */}
      <CheckbookPaymentDialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        amount={balance}
        handleRefresh={handleRefresh}
      />

      {/* Fiserv Digital Disbursements Flow */}
      <FiservDisbursementDialog
        open={fiservDialogOpen}
        onClose={() => {
          setFiservDialogOpen(false);
          handleCashoutRefresh();
        }}
        amount={balance}
        method={
          dbMethods[selectedMethod]?.fiservKey ||
          FISERV_KEY_MAP[selectedMethod] ||
          "paypal"
        }
        handleRefresh={handleCashoutRefresh}
      />
    </>
  );
};

export default CashOutModal;
