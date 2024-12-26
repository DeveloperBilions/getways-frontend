import React, { useState } from "react";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  Col,
  Label,
  Form,
} from "reactstrap";
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
    event.preventDefault();

    const rawData = {
      userId: selectedRecord?.id,
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
            <Form onSubmit={handleSubmit}>
              <Label for="rechargeAmount">
                Are you sure you wish to reject the redeem amount? <br />
                This action cannot be undone.
              </Label>

              <Col md={12}>
                <div className="d-flex justify-content-end">
                  <Button
                    color="success"
                    type="submit"
                    className="mx-2"
                    disabled={loading}
                  >
                    {loading ? "Processing..." : "Confirm"}
                  </Button>
                  <Button color="secondary" onClick={onClose}>
                    Cancel
                  </Button>
                </div>
              </Col>
            </Form>
          </ModalBody>
        </Modal>
      )}
    </React.Fragment>
  );
};

export default RejectRedeemDialog;
