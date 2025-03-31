import React, { useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  Button,
  ModalFooter,
  Col,
  Input,
} from "reactstrap";
import AOG_Symbol from "../../../Assets/icons/AOGsymbol.png";
import { Box, IconButton, TextField, Typography } from "@mui/material";
import SelectGiftCardDialog from "./SelectGiftCardDialog";
import Close from "../../../Assets/icons/close.svg";

const CashOutModal = ({
  setOpen,
  open,
  onClose,
  balance: initialBalance,
  record,
}) => {
  const [isGiftCardOpen, setIsGiftCardOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [balance, setBalance] = useState(initialBalance);
  const handalOpenGiftCard = () => {
    if (!balance) {
      setErrorMessage(
        "Cashout amount cannot be empty. Please enter a valid amount."
      );
      return;
    }
    if (balance <= 0) {
      setErrorMessage(
        "Cashout amount cannot be negative or 0. Please enter a valid amount."
      );
      return;
    }
    if (balance < 15) {
      setErrorMessage("Cashout request should not be less than $15.");
      return;
    }
    if (balance > initialBalance) {
      setErrorMessage(
        "Cashout amount cannot be greater than your current balance."
      );
      return;
    }
    setIsGiftCardOpen(true);
    onClose();
  };
  const handleGiftCardSuccess = (data) => {
    setIsGiftCardOpen(false);
    onClose();
  };
  const handleBalanceChange = (e) => {
    setBalance(e.target.value);
    setErrorMessage(""); // Clear error message when user starts typing
  };

  const handleClose = () => {
    setBalance(initialBalance);
    setIsGiftCardOpen(false);
    onClose();
  };

  return (
    <>
      <Modal isOpen={open && !isGiftCardOpen} toggle={handleClose} centered>
        <Box
          sx={{
            borderRadius: "8px",
            border: "1px solid #E7E7E7",
            backgroundColor: "#FFFFFF",
            boxShadow:
              "4px 4px 16px 0px rgba(255, 255, 255, 0.25), -4px -4px 16px 0px rgba(255, 255, 255, 0.25)",
            // outline: "none",
          }}
        >
          <ModalHeader
            toggle={handleClose}
            className="border-bottom-0 pb-0 font-weight-[500] font-size-[24px]"
            close={
              <IconButton
                onClick={onClose}
                sx={{
                  position: "absolute",
                  right: "16px",
                  top: "16px",
                }}
              >
                <img src={Close} alt="cancel" width="24px" height="24px" />
              </IconButton>
            }
          >
            Cash out
          </ModalHeader>
          <ModalBody>
            <Box
              className="d-flex align-items-center rounded mb-4 justify-content-between"
              sx={{ bgcolor: "#F4F3FC", padding: "16px 22px" }}
            >
              <Typography
                style={{ color: "#4A4A4A", fontSize: "14px", fontWeight: 400 }}
              >
                Available Balance
              </Typography>

              <Box className="d-flex align-items-center">
                <img
                  src={AOG_Symbol} // Replace with the actual path to your coin icon
                  alt="Coin"
                  style={{ width: "24px", height: "24px", marginRight: "5px" }}
                />
                <Typography style={{ fontSize: "24px", fontWeight: 600 }}>
                  {initialBalance}
                </Typography>
              </Box>
            </Box>
            {errorMessage && (
              <Box className="alert alert-danger mt-2">{errorMessage}</Box>
            )}

            <Box className="text-center mb-4">
              <Typography
                style={{
                  fontSize: "14px",
                  color: "#333",
                  fontWeight: 400,
                  display: "block",
                  textAlign: "start",
                }}
              >
                You can use your wallet funds for instant recharges! Want to
                recharge instead?
              </Typography>
              <Box
                className="d-flex align-items-center justify-content-start rounded p-2 mt-4"
                sx={{ border: "1px solid #E7E7E7" }}
              >
                <img
                  src={AOG_Symbol} // Replace with the actual path to your coin icon
                  alt="Coin"
                  style={{ width: "40px", height: "40px", marginRight: "10px" }}
                />
                <TextField
                  type="number"
                  value={balance}
                  onChange={handleBalanceChange}
                  variant="standard" // Removes the default border
                  InputProps={{
                    disableUnderline: true, // Removes the underline
                    style: {
                      fontSize: "40px",
                      fontWeight: 600,
                    },
                    // Remove the up/down arrows
                    sx: {
                      "& input[type=number]": {
                        MozAppearance: "textfield", // For Firefox
                      },
                      "& input[type=number]::-webkit-outer-spin-button": {
                        WebkitAppearance: "none", // For Chrome, Safari, Edge
                        margin: 0,
                      },
                      "& input[type=number]::-webkit-inner-spin-button": {
                        WebkitAppearance: "none", // For Chrome, Safari, Edge
                        margin: 0,
                      },
                    },
                  }}
                  sx={{
                    width: "100%",
                  }}
                />
              </Box>
            </Box>
          </ModalBody>
          <ModalFooter className="custom-modal-footer">
            <Col md={12}>
              <Box
                className="d-flex w-100 justify-content-between"
                sx={{
                  flexDirection: { xs: "column", sm: "row" }, // Column on small screens, row on larger screens
                  alignItems: { xs: "stretch", sm: "stretch" }, // Stretch items to take full width in both modes
                  gap: { xs: 2, sm: 2 }, // Add spacing between buttons
                  marginBottom: { xs: 2, sm: 2 }, // Add margin at the bottom
                  width: "100% !important", // Ensure the container takes full width
                }}
              >
                <Button
                  className="custom-button cancel"
                  style={{
                    border: "#E7E7E7 !important",
                    fontSize: "18px",
                    fontWeight: 500,
                    fontFamily: "Inter",
                  }}
                  onClick={handleClose}
                >
                  Cancel
                </Button>
                <Button
                  className="custom-button"
                  style={{
                    backgroundColor: "#2E5BFF",
                    fontSize: "18px",
                    fontWeight: 500,
                    fontFamily: "Inter",
                  }}
                  onClick={handalOpenGiftCard}
                >
                  Next
                </Button>
              </Box>
            </Col>
          </ModalFooter>
        </Box>
      </Modal>
      <SelectGiftCardDialog
        open={isGiftCardOpen}
        onClose={() => {
          setIsGiftCardOpen(false);
          handleClose();
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
    </>
  );
};

export default CashOutModal;
