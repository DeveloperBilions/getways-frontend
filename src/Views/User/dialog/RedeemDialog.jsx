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
  FormText,
} from "reactstrap";
import { Parse } from "parse";
// Initialize Parse
Parse.initialize(process.env.REACT_APP_APPID, process.env.REACT_APP_MASTER_KEY);
Parse.serverURL = process.env.REACT_APP_URL;

const RedeemDialog = ({ open, onClose, record, fetchAllUsers }) => {
  const [userName, setUserName] = useState("");
  const [balance, setBalance] = useState("");
  const [redeemAmount, setRedeemAmount] = useState();
  const [remark, setRemark] = useState();
  const [redeemFees, setredeemFees] = useState();
  const [responseData, setResponseData] = useState("");
  const [loading, setLoading] = useState(false);
  const [redeemPercentage, setRedeemPercentage] = useState();

  const resetFields = () => {
    setUserName("");
    setBalance("");
    setRedeemAmount("");
    setRemark("");
  };

  const parentServiceFee = async () => {
    try {
      const response = await Parse.Cloud.run("redeemParentServiceFee", {
        userId: record?.userParentId,
      });
      setredeemFees(response?.redeemService || 0);
    } catch (error) {
      console.error("Error fetching parent service fee:", error);
    }
  };

  useEffect(() => {
    if (record && open) {
      parentServiceFee();
      setUserName(record.username || "");
      setBalance(record.balance || "");
    } else {
      resetFields();
    }
  }, [record, open]);

  const calculateRedeemedAmount = () => {
    if (redeemAmount && redeemFees) {
      const calculatedAmount = redeemAmount - redeemAmount * (redeemFees / 100);
      setRedeemPercentage(calculatedAmount.toFixed(2));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const rawData = {
      ...record,
      transactionAmount: redeemAmount,
      percentageAmount: redeemPercentage,
      remark,
      type: "redeem",
    };

    setLoading(true);
    try {
      const response = await Parse.Cloud.run("redeemRedords", rawData);
      if (response?.status === "error") {
        setResponseData(response?.message);
      } else {
        onClose();
        fetchAllUsers();
        setRedeemAmount("");
        setRemark("");
      }
    } catch (error) {
      console.error("Error Redeem Record details:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={open} toggle={onClose} size="md" centered>
      <ModalHeader toggle={onClose} className="border-bottom-0 pb-0">
        Redeem Amount
      </ModalHeader>
      <ModalBody>
        <FormText className="font-weight-bold">
          Redeems may take up to 2 hours
        </FormText>
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

            {/* <Col md={12}>
              <FormGroup>
                <Label for="gameId">Game ID</Label>
                <Input
                  id="gameId"
                  name="gameId"
                  type="text"
                  value={786}
                  required
                  disabled
                />
              </FormGroup>
            </Col> */}

            {/* <Col md={12}>
              <FormGroup>
                <Label for="balance">Balance</Label>
                <Input
                  id="balance"
                  name="balance"
                  type="number"
                  value={balance || 0}
                  required
                  disabled
                />
              </FormGroup>
            </Col> */}

            <Col md={12}>
              <FormGroup>
                <Label for="redeemAmount">Redeem Amount</Label>
                <Input
                  id="redeemAmount"
                  name="redeemAmount"
                  type="number"
                  autoComplete="off"
                  min="0"
                  onChange={(e) => setRedeemAmount(e.target.value)}
                  onBlur={calculateRedeemedAmount}
                  required
                />
              </FormGroup>
            </Col>

            <p className="mb-0">
              <small>Redeem Service Fee @ {redeemFees}%</small>
            </p>
            {redeemPercentage && (
              <p className="mb-1">
                <small>Total amount to be redeemed = ${redeemPercentage}</small>
              </p>
            )}

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

            {responseData && (
              <Col sm={12}>
                <Label
                  for="errorResponse"
                  invalid={true}
                  className="text-danger mb-2"
                >
                  {responseData}
                </Label>
              </Col>
            )}

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
  );
};

export default RedeemDialog;
