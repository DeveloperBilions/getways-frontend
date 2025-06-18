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
  Input,
} from "reactstrap";
import { Box } from "@mui/material";
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
  cashout,
}) => {
  const [loading, setLoading] = useState(false);
  const [remark, setRemark] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    setLoading(true);
    try {
      await dataProvider.finalReject(selectedRecord?.id, remark);

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
            <Form>
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
            </Box>{" "}
          </ModalFooter>
        </Modal>
      )}
    </React.Fragment>
  );
};

export default FinalRejectRedeemDialog;
