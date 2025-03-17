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
  Alert
} from "reactstrap";
// loader
import { Loader } from "../../Loader";
import { Parse } from "parse";
import { dataProvider } from "../../../Provider/parseDataProvider";
import { checkActiveRechargeLimit } from "../../../Utils/utils";
// Initialize Parse
Parse.initialize(process.env.REACT_APP_APPID, process.env.REACT_APP_MASTER_KEY);
Parse.serverURL = process.env.REACT_APP_URL;

const RechargeDialog = ({ open, onClose, record, fetchAllUsers }) => {
  const [userName, setUserName] = useState("");
  const [rechargeAmount, setRechargeAmount] = useState();
  const [remark, setRemark] = useState();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); // New state for error message

  const resetFields = () => {
    setUserName("");
    setRechargeAmount("");
    setRemark("");
  };

  useEffect(() => {
    if (record && open) {
      setUserName(record.username || "");
    } else {
      resetFields();
    }
  }, [record, open]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (rechargeAmount <= 0) {
      setErrorMessage("Recharge Amount cannot be negative or 0. Please enter a valid amount.");
      return;
    }
    if (rechargeAmount < 10) {
      setErrorMessage("Non-Wallet transaction must be at least $10.");
      return;
    }
    const rawData = {
      ...record,
      transactionAmount: rechargeAmount * 100,
      remark,
      type: "recharge",
    };
    const transactionCheck = await checkActiveRechargeLimit(record.userParentId, rechargeAmount);
    if (!transactionCheck.success) {
      setErrorMessage(transactionCheck.message); // Show error if the limit is exceeded
      return;
    }
    setLoading(true);
    
    try {
      await dataProvider.userTransaction(rawData);
      onClose();
      fetchAllUsers();
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
        <Modal isOpen={open} toggle={onClose} size="md" centered>
          <ModalHeader toggle={onClose} className="border-bottom-0">
            Recharge Amount
          </ModalHeader>
          <ModalBody>
          {errorMessage && (
              <Alert color="danger" className="mt-2">
                {errorMessage}
              </Alert>
            )}
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
                      type="text"
                      autoComplete="off"
                      value={rechargeAmount}
                      onChange={(e) => {
                        let value = e.target.value;
                        if (value === '' || /^\d*$/.test(value)) {
                          if(value === ''){
                            setRechargeAmount(value);
                          }
                          else if (value.includes('.')) {
                            value = Math.floor(parseFloat(value));
                            setRechargeAmount(value);
                          }
                          else if (/^\d*$/.test(value)) {
                            setRechargeAmount(value);
                          }
                        }
                      }}
                      required
                      onKeyDown={(e) =>{
                        if (e.keyCode === 190) {
                          // Prevent the default behavior of typing a decimal
                          e.preventDefault();
                        }
                      }}
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
                      maxLength={30}
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
