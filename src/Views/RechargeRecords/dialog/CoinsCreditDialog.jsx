import React from "react";
import { Button, Modal, ModalHeader, ModalBody, Col, Form } from "reactstrap";
import { Parse } from "parse";
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
        <Form onSubmit={handleSubmit}>
          <Col md={12}>
            Are you sure you have transferred the points/coins to this user?
            This action is not reversible.
          </Col>
          <Col md={12}>
            <div className="d-flex justify-content-end mt-3">
              <Button
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "var(--primary-color)",
                }}
                type="submit"
                className="mx-2"
              >
                Confirm
              </Button>
              <Button
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "var(--secondary-color)",
                  color: "var(--primary-color)",
                }}
                onClick={onClose}
              >
                Cancel
              </Button>
            </div>
          </Col>
        </Form>
      </ModalBody>
    </Modal>
  );
};

export default CoinsCreditDialog;
