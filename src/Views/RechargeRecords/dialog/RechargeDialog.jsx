import React, { useState, useEffect } from "react";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  Row,
  Col,
  FormGroup,
  Label,
  Form,
  Input,
} from "reactstrap";
import { useGetIdentity } from "react-admin";
// loader
import { Loader } from "../../Loader";

import { Parse } from "parse";
import { dataProvider } from "../../../Provider/parseDataProvider";
// Initialize Parse
Parse.initialize(process.env.REACT_APP_APPID, process.env.REACT_APP_MASTER_KEY);
Parse.serverURL = process.env.REACT_APP_URL;

const RechargeDialog = ({ open, onClose, handleRefresh }) => {
  const { identity } = useGetIdentity();

  const [userName, setUserName] = useState("");
  const [rechargeAmount, setRechargeAmount] = useState();
  const [remark, setRemark] = useState();
  const [loading, setLoading] = useState(false);

  const resetFields = () => {
    setUserName("");
    setRechargeAmount("");
    setRemark("");
  };

  useEffect(() => {
    if (identity && open) {
      // Populate fields when modal opens
      setUserName(identity.username || "");
    } else {
      // Reset fields when modal closes
      resetFields();
    }
  }, [identity, open]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const rawData = {
      id: identity.objectId,
      type: "recharge",
      username: identity.username,
      transactionAmount: rechargeAmount * 100,
      remark,
    };
    setLoading(true);
    try {

      const response = await dataProvider.userTransaction(rawData);
      if (response?.success) { // Ensure the response indicates success
        if (identity?.role === "Player") {
          const paymentUrl = response?.apiResponse?.url;
          if (paymentUrl) {
            // Open the URL in a new tab
            window.open(paymentUrl, "_blank");
          } else {
            console.error("Payment URL is missing from the response");
            // Optionally, notify the user about the missing URL
          }
        }
      } else {
        console.error("Transaction failed:", response?.message || "Unknown error");
        // Optionally, show a user-friendly error message
      }
      onClose();
      handleRefresh();
      setLoading(false);
      setRechargeAmount("");
      setRemark("");
    } catch (error) {
      console.error("Error Recharge Record details:", error);
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
            Recharge Amount
          </ModalHeader>
          <ModalBody>
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={12}>
                  <FormGroup>
                    <Label for="userName">Account</Label>
                    <Input
                      id="userName"
                      name="userName"
                      type="text"
                      value={userName}
                      required
                      disabled
                    />
                  </FormGroup>
                </Col>

                <Col md={12}>
                  <FormGroup>
                    <Label for="rechargeAmount">Recharge Amount</Label>
                    <Input
                      id="rechargeAmount"
                      name="rechargeAmount"
                      type="number"
                      autoComplete="off"
                      onChange={(e) => setRechargeAmount(e.target.value)}
                      required
                    />
                  </FormGroup>
                </Col>

                <Col md={12}>
                  <FormGroup>
                    <Label for="remark">Remark</Label>
                    <Input
                      id="remark"
                      name="remark"
                      type="textarea"
                      autoComplete="off"
                      onChange={(e) => setRemark(e.target.value)}
                    />
                  </FormGroup>
                </Col>

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
              </Row>
            </Form>
          </ModalBody>
        </Modal>
      )}
    </React.Fragment>
  );
};

export default RechargeDialog;
