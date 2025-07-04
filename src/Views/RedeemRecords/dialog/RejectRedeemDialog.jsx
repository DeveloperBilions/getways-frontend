import React, { useState } from "react";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Col,
  Label,
  Form,
} from "reactstrap";
import { Box } from "@mui/material";
// loader
import { Loader } from "../../Loader";
import { Parse } from "parse";
// Initialize Parse
Parse.initialize(process.env.REACT_APP_APPID, process.env.REACT_APP_MASTER_KEY);
Parse.serverURL = process.env.REACT_APP_URL;

const RejectRedeemDialog = ({
  open,
  onClose,
  handleRefresh,
  selectedRecord,
}) => {
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (event) => {
    const rawData = {
      orderId: selectedRecord?.id,
    };
    setLoading(true);
    try {
      await Parse.Cloud.run("agentRejectRedeemRedords", rawData);

      onClose();
      handleRefresh();
      setLoading(false);
    } catch (error) {
      console.error("Error Redeem Record details:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <React.Fragment>
      {loading ? (
        <Loader />
      ) : (
        <Modal
          isOpen={open}
          toggle={onClose}
          size="md"
          centered
          className="overflow-visible"
        >
          <ModalHeader toggle={onClose} className="border-bottom-0">
            Reject Redeem Amount
          </ModalHeader>
          <ModalBody>
            <Form>
              <Label for="rechargeAmount">
                Are you sure you wish to reject the{" "}
                <b>${selectedRecord?.transactionAmount}</b> redeem request of{" "}
                <b>{selectedRecord?.username}</b> ?
                <br />
                This action cannot be undone.
              </Label>
            </Form>
          </ModalBody>
          <ModalFooter className="custom-modal-footer">
            <Col md={12}>
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
                <Button className="custom-button cancel" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  className="custom-button confirm"
                  disabled={loading}
                  onClick={handleSubmit}
                >
                  {loading ? "Processing..." : "Confirm"}
                </Button>
              </Box>
            </Col>
          </ModalFooter>
        </Modal>
      )}
    </React.Fragment>
  );
};

export default RejectRedeemDialog;
