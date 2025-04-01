import React, { useState } from "react";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  Col,
  Label,
  Form,
  Input,
} from "reactstrap";
// loader
import { Loader } from "../../Loader";
import { Parse } from "parse";
import { dataProvider } from "../../../Provider/parseDataProvider";
// Initialize Parse
Parse.initialize(process.env.REACT_APP_APPID, process.env.REACT_APP_MASTER_KEY);
Parse.serverURL = process.env.REACT_APP_URL;

const FinalRejectRedeemDialog = ({
  open,
  onClose,
  handleRefresh,
  selectedRecord,
  cashout
}) => {
  const [loading, setLoading] = useState(false);
  const [remark, setRemark] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
        
      await dataProvider.finalReject(selectedRecord?.id,remark);

      onClose();
      handleRefresh();
      setRemark("");
      setError("");
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
            {cashout ? "Cashout Reject Request" : "Reject Redeem Amount"}
          </ModalHeader>
          <ModalBody>
            <Form onSubmit={handleSubmit}>
              <Col md={12}>
                <Label for="remark">Remark</Label>
                <Input
                  type="textarea"
                  id="remark"
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  placeholder="Enter your remark"
                  required
                />
                {error && <p className="text-danger">{error}</p>}
              </Col>
              <Label for="rechargeAmount" className="mt-3">
                Are you sure you wish to reject the{" "}
                <b>${selectedRecord?.transactionAmount}</b>{" "}
                {cashout ? "cashout" : "redeem"} request of{" "}
                <b>{selectedRecord?.username}</b> ?
                <br />
                This action cannot be undone.
              </Label>

              <Col md={12}>
                <div className="d-flex justify-content-end">
                  <Button
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "var(--primary-color)",
                    }}
                    type="submit"
                    className="mx-2"
                    disabled={loading}
                  >
                    {loading ? "Processing..." : "Confirm"}
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
      )}
    </React.Fragment>
  );
};

export default FinalRejectRedeemDialog;
