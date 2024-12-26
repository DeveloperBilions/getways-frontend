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
// loader
import { Loader } from "../../Loader";
import { Parse } from "parse";
// Initialize Parse
Parse.initialize(process.env.REACT_APP_APPID, process.env.REACT_APP_MASTER_KEY);
Parse.serverURL = process.env.REACT_APP_URL;

const ApproveRedeemDialog = ({ open, onClose, record, handleRefresh }) => {
  const [userName, setUserName] = useState("");
  const [redeemAmount, setRedeemAmount] = useState();
  const [remark, setRemark] = useState();
  const [redeemFees, setredeemFees] = useState();
  const [responseData, setResponseData] = useState("");
  const [loading, setLoading] = useState(false);
  const [redeemPercentage, setRedeemPercentage] = useState();

  //   console.log("===== record", record);

  const resetFields = () => {
    setUserName("");
    setRedeemAmount("");
    setRemark("");
    setRedeemPercentage("");
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
      setRedeemAmount(record?.transactionAmount || "");
      setRemark(record?.remark || "");
    } else {
      resetFields();
    }
  }, [record, open]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const rawData = {
      ...record,
      orderId: record?.id,
      transactionAmount: redeemAmount,
      percentageAmount:
        redeemAmount - redeemAmount * (redeemFees / 100).toFixed(2),
      remark,
      type: "redeem",
    };

    setLoading(true);
    try {
      await Parse.Cloud.run("agentApproveRedeemRedords", rawData);

      onClose();
      setLoading(false);
      handleRefresh();
    } catch (error) {
      console.error("Error Redeem Record details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    handleRefresh();
    resetFields();
  };
  return (
    <React.Fragment>
      {loading ? (
        <Loader />
      ) : (
        <Modal isOpen={open} toggle={handleClose} size="md" centered>
          <ModalHeader toggle={handleClose} className="border-bottom-0 pb-0">
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

                <Col md={12}>
                  <FormGroup>
                    <Label for="redeemAmount">Redeem Amount</Label>
                    <Input
                      id="redeemAmount"
                      name="redeemAmount"
                      type="number"
                      autoComplete="off"
                      value={redeemAmount}
                      disabled
                    />
                  </FormGroup>
                </Col>

                <p className="mb-0">
                  <small>Redeem Service Fee @ {redeemFees}%</small>
                </p>
                {redeemPercentage !== null &&
                  redeemPercentage !== undefined && (
                    <p className="mb-1">
                      <small>
                        Total amount to be redeemed = $
                        {redeemAmount - redeemAmount * (redeemFees / 100) || 0}
                      </small>
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
                      value={remark}
                      disabled
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
                    <Button color="secondary" onClick={handleClose}>
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

export default ApproveRedeemDialog;
