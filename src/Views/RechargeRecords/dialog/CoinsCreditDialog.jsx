import React from "react";
import { Button, Modal, ModalHeader, ModalBody, Col, Form,ModalFooter } from "reactstrap";
import { Parse } from "parse";
import { Box } from "@mui/material";
// Initialize Parse
Parse.initialize(process.env.REACT_APP_APPID, process.env.REACT_APP_MASTER_KEY);
Parse.serverURL = process.env.REACT_APP_URL;

const CoinsCreditDialog = ({ open, onClose, data, handleRefresh }) => {
  console.log(data,"daudaoio")
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await Parse.Cloud.run("coinsCredit", { id: data?.id });
      onClose();
      handleRefresh();
    } catch (error) {
      console.error("Error Changing The Status", error);
    }
  };

  return (
    <Modal isOpen={open} toggle={onClose} size="md" centered>
      <ModalHeader toggle={onClose} className="border-bottom-0">
        Credit Coins
      </ModalHeader>
      <ModalBody>
        <Form >
          <Col md={12}>
            Are you sure you have transferred the points/coins to this user?
            This action is not reversible.
          </Col>
        </Form>
      </ModalBody>
      <ModalFooter className="custom-modal-footer">
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
                className="custom-button cancel"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                className="custom-button confirm"
                onClick={handleSubmit}
              >
                Confirm
              </Button>
            </Box></ModalFooter>
    </Modal>
  );
};

export default CoinsCreditDialog;
