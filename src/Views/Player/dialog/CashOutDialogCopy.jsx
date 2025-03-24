import React, { useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  Button,
  ModalFooter,
  Col,
} from "reactstrap";
import AOG_Symbol from "../../../Assets/icons/AOGsymbol.png";
import { Box, Typography } from "@mui/material";
import SelectGiftCardDialog from "./SelectGiftCardDialog";
import { set } from "react-hook-form";

const CashOutModal = ({ setOpen, open, onClose, balance }) => {
  const [isGiftCardOpen, setIsGiftCardOpen] = useState(false);
  console.log(isGiftCardOpen);
  const handalOpenGiftCard = () => {
    setIsGiftCardOpen(true);
    onClose();
  };
  const handleGiftCardSuccess = (data) => {
    setIsGiftCardOpen(false);
    onClose();
  };

  return (
    <>
      <Modal isOpen={open && !isGiftCardOpen} toggle={onClose} centered>
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
            toggle={onClose}
            className="border-bottom-0 pb-0 font-weight-[500] font-size-[24px]"
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
                  {balance}
                </Typography>
              </Box>
            </Box>

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
                <Typography style={{ fontSize: "40px", fontWeight: 600 }}>
                  {balance}
                </Typography>
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
                  sx={{ border: "#E7E7E7 !important" }}
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button
                  className="custom-button"
                  color="primary"
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
        }}
        onBack={() => {
          setIsGiftCardOpen(false);
          setOpen();
        }}
        balance={balance}
        onSuccess={handleGiftCardSuccess}
      />
    </>
  );
};

export default CashOutModal;
