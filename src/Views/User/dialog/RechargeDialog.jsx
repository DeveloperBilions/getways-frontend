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
  Alert,
  ModalFooter,
} from "reactstrap";
// loader
import { Loader } from "../../Loader";
import { Parse } from "parse";
import { dataProvider } from "../../../Provider/parseDataProvider";
import "../../../Assets/css/Dialog.css";
import { checkActiveRechargeLimit } from "../../../Utils/utils";
import { Box } from "@mui/material";
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
      setErrorMessage("");
    } else {
      resetFields();
    }
  }, [record, open]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (rechargeAmount <= 0) {
      setErrorMessage(
        "Recharge Amount cannot be negative or 0. Please enter a valid amount."
      );
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
        <Modal
          isOpen={open}
          toggle={onClose}
          // size="md"
          centered
          className="custom-modal"
        >
          <ModalHeader
            toggle={onClose}
            className="custom-modal-header border-bottom-0"
          >
            Recharge Amount
          </ModalHeader>
          <ModalBody className="custom-modal-body">
            {errorMessage && (
              <Alert color="danger" className="mt-2">
                {errorMessage}
              </Alert>
            )}
            <Form>
              <Row>
                <Col md={12}>
                  <FormGroup>
                    <Label for="userName" className="custom-label">
                      Account
                    </Label>
                    <Input
                      id="userName"
                      name="userName"
                      type="text"
                      className="custom-input"
                      value={userName}
                      required
                      disabled
                    />
                  </FormGroup>
                </Col>

                <Col md={12}>
                  <FormGroup>
                    <Label for="rechargeAmount" className="custom-label">
                      Recharge Amount
                    </Label>
                    <Input
                      id="rechargeAmount"
                      name="rechargeAmount"
                      type="text"
                      autoComplete="off"
                      placeholder="e.g. 500"
                      className="custom-input"
                      value={rechargeAmount}
                      onChange={(e) => {
                        let value = e.target.value;
                        if (value === "" || /^\d*$/.test(value)) {
                          if (value === "") {
                            setRechargeAmount(value);
                          } else if (value.includes(".")) {
                            value = Math.floor(parseFloat(value));
                            setRechargeAmount(value);
                          } else if (/^\d*$/.test(value)) {
                            setRechargeAmount(value);
                          }
                        }
                      }}
                      required
                      onKeyDown={(e) => {
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
                    <Label for="remark" className="custom-label">
                      Remark
                    </Label>
                    <Input
                      id="remark"
                      name="remark"
                      type="textarea"
                      autoComplete="off"
                      placeholder="e.g. Recharge text"
                      className="custom-input"
                      maxLength={30}
                      onChange={(e) => setRemark(e.target.value)}
                    />
                  </FormGroup>
                </Col>
              </Row>
            </Form>
          </ModalBody>
          <ModalFooter className="custom-modal-footer">
            <Col md={12}>
              <Box
                className="d-flex w-100 justify-content-between"
                sx={{
                  flexDirection: { xs: "column", sm: "row" }, // Column on small screens, row on larger screens
                  alignItems: { xs: "stretch", sm: "stretch" }, // Stretch items to take full width in both modes
                  gap: { xs: 2, sm: 2 }, // Add spacing between buttons
                  marginBottom: { xs: 2, sm: 2 }, // Add margin at the bottom
                  width: "100% !important", // Ensure the container takes full width
                }}
              >
                <Button
                  onClick={() => {
                    onClose();
                    setErrorMessage("");
                  }}
                  className="custom-button cancel"
                >
                  Cancel
                </Button>
                <Button
                  className="custom-button confirm"
                  onClick={handleSubmit}
                  disabled={loading}
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

export default RechargeDialog;
