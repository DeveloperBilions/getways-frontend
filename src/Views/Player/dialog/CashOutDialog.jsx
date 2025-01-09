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
  Alert,
} from "reactstrap";
import { Loader } from "../../Loader";
import { Parse } from "parse";
import { walletService } from "../../../Provider/WalletManagement";

Parse.initialize(process.env.REACT_APP_APPID, process.env.REACT_APP_MASTER_KEY);
Parse.serverURL = process.env.REACT_APP_URL;

const CashOutDialog = ({ open, onClose, record, handleRefresh }) => {
  const [userName, setUserName] = useState("");
  const [redeemAmount, setRedeemAmount] = useState("");
  const [redeemFees, setRedeemFees] = useState("");
  const [remark, setRemark] = useState("");
  const [loading, setLoading] = useState(false);
  const [walletId,setWalletId] = useState("")
  const [balance,setBalance] = useState(0)
  const [paymentMethods, setPaymentMethods] = useState({
    cashAppId: "",
    paypalId: "",
    venmoId: "",
  });
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(""); // New state for selected payment method
  const [showAddPaymentMethodDialog, setShowAddPaymentMethodDialog] =
    useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedPaymentMethodType, setSelectedPaymentMethodType] =
    useState(""); // Store selected payment method type (e.g., cashAppId)
  const resetFields = () => {
    setUserName("");
    setRedeemAmount("");
    setRemark("");
    setWarningMessage("");
    setErrorMessage("");
  };
  console.log(record,"recordList")
  const parentServiceFee = async () => {
    try {
      const response = await Parse.Cloud.run("redeemParentServiceFee", {
        userId: record?.userParentId,
      });
      setRedeemFees(response?.redeemService || 0);
    } catch (error) {
      console.error("Error fetching parent service fee:", error);
    }
  };

  useEffect(() => {
    if (record && open) {
      parentServiceFee();
      setUserName(record.username || "");
    } else {
      resetFields();
    }
  }, [record, open]);

  useEffect(() => {
    async function WalletService() {
      const wallet = await walletService.getMyWalletData();
      const { cashAppId, paypalId, venmoId ,objectId , balance} = wallet.wallet;
      setBalance(balance)
      setPaymentMethods({ cashAppId, paypalId, venmoId });
      setWalletId(objectId)
    }

    if (open) {
      WalletService();
    }
  }, [open]);

  const handleConfirm = () => {
    const { cashAppId, paypalId, venmoId } = paymentMethods;
    const methodCount = [cashAppId, paypalId, venmoId].filter(Boolean).length;
    if (!selectedPaymentMethodType) {
      setErrorMessage("Please select a payment method type.");
      return;
    }
    if (parseFloat(redeemAmount) > parseFloat(balance || 0)) {
      setErrorMessage("Cash-out amount cannot exceed your wallet balance.");
      return;
    }
    else{
      setErrorMessage("");
    }
    if (methodCount === 0) {
      setWarningMessage(
        "No payment methods are added. Please add a payment method to proceed."
      );
      setShowWarningModal(true);
    } else if (methodCount > 0 && methodCount < 3) {
      setWarningMessage(
        `You have ${methodCount} payment mode${
          methodCount > 1 ? "s" : ""
        } added for refunds. Would you like to add/edit the payment method?`
      );
      setShowWarningModal(true);
    } else {
      handleSubmit(); // Call handleSubmit directly if 3 payment methods are already added
    }
  };

  const handleSubmit = async () => {
    const { cashAppId, paypalId, venmoId } = paymentMethods;
  
    if (!cashAppId && !paypalId && !venmoId) {
      setErrorMessage("Refund cannot be processed without a payment mode.");
      return;
    }

    const rawData = {
      ...record,
      redeemServiceFee: redeemFees,
      transactionAmount: redeemAmount,
      remark,
      type: "redeem",
      walletId: walletId,
      isCashOut: true,
      paymentMode:selectedPaymentMethodType ,
      paymentMethodType:selectedPaymentMethod
    };

    setLoading(true);
    try {
      const response = await Parse.Cloud.run("playerRedeemRedords", rawData);
      if (response?.status === "error") {
        setErrorMessage(response?.message);
      } else {
        onClose();
        setRedeemAmount("");
        setRemark("");
        handleRefresh();
      }
    } catch (error) {
      console.error("Error Redeem Record details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPaymentMethod = async (newMethods) => {
    try {
      await walletService.updatePaymentMethods(newMethods);
      setPaymentMethods(newMethods);
      setShowAddPaymentMethodDialog(false);
      setShowWarningModal(false);
     // handleSubmit(); // Automatically call handleSubmit after adding payment methods
    } catch (error) {
      console.error("Error updating payment methods:", error);
    }
  };
  return (
    <React.Fragment>
      {loading ? (
        <Loader />
      ) : (
        <Modal isOpen={open} toggle={onClose} size="md" centered>
          <ModalHeader toggle={onClose} className="border-bottom-0 pb-0">
            Cash Out Request
          </ModalHeader>
          <ModalBody>
            {errorMessage && (
              <Alert color="danger" className="mt-2">
                {errorMessage}
              </Alert>
            )}
            <Form>
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
                    <Label for="redeemAmount">Cash Out Amount</Label>
                    <Input
                      id="redeemAmount"
                      name="redeemAmount"
                      type="number"
                      autoComplete="off"
                      min="0"
                      onChange={(e) => setRedeemAmount(e.target.value)}
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
                  <FormGroup>
                    <Label for="remark">Payment Method</Label>
                    {Object.entries(paymentMethods).map(([key, value]) =>
                      value ? (
                        <div key={key} className="form-check">
                          <Input
                            type="radio"
                            id={key}
                            name="paymentMethod"
                            value={key}
                            checked={selectedPaymentMethodType === key}
                            onChange={(e) => {
                              setSelectedPaymentMethodType(e.target.value); // Set method type
                              setSelectedPaymentMethod(value); // Set method value
                            }}
                            required
                          />
                          <Label for={key} className="form-check-label">
                            {key.replace(/Id$/, "")} - {value}
                          </Label>
                        </div>
                      ) : null
                    )}
                  </FormGroup>
                </Col>
                <Col md={12} className="d-flex justify-content-end my-2">
                  <span
                    style={{
                      textDecoration: "underline",
                      color: "#007bff",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                    onClick={() => setShowAddPaymentMethodDialog(true)}
                  >
                    Add / Edit Payment Method
                  </span>
                </Col>
                <Col md={12}>
                  <div className="d-flex justify-content-end">
                    <Button
                      color="success"
                      className="mx-2"
                      onClick={handleConfirm}
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

      {/* Warning Modal */}
      <Modal
        isOpen={showWarningModal}
        toggle={() => {
          if (paymentMethods.cashAppId || paymentMethods.paypalId || paymentMethods.venmoId) {
            setShowWarningModal(false);
          } else {
            setErrorMessage("Refund cannot be processed without a payment mode.");
            setShowWarningModal(false);
          }
        }}
        size="md"
        centered
      >
        <ModalHeader toggle={() => setShowWarningModal(false)}>Attention</ModalHeader>
        <ModalBody>
          <p>{warningMessage}</p>
          <div className="d-flex justify-content-end">
            {paymentMethods.cashAppId || paymentMethods.paypalId || paymentMethods.venmoId ? (
              <Button
                color="primary"
                onClick={() => {
                  setShowWarningModal(false);
                  handleSubmit();
                }}
              >
                No, Continue
              </Button>
            ) : null}
            <Button
              color="primary"
              className="ms-2"
              onClick={() => {
                setShowAddPaymentMethodDialog(true);
                setShowWarningModal(false);
              }}
            >
              Add/Edit Payment Method
            </Button>
            <Button
              color="secondary"
              className="ms-2"
              onClick={() => {
                setShowWarningModal(false);
                handleSubmit();
              }}
            >
              Close
            </Button>

          </div>
        </ModalBody>
      </Modal>

      {/* Add Payment Method Modal */}
      <Modal
        isOpen={showAddPaymentMethodDialog}
        toggle={() => setShowAddPaymentMethodDialog(false)}
        size="md"
        centered
      >
        <ModalHeader>Add/Edit Payment Method</ModalHeader>
        <ModalBody>
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              handleAddPaymentMethod(paymentMethods);
            }}
          >
            <Row>
              <Col md={12}>
                <FormGroup>
                  <Label for="cashAppId">CashApp ID</Label>
                  <Input
                    id="cashAppId"
                    name="cashAppId"
                    type="text"
                    value={paymentMethods.cashAppId}
                    onChange={(e) =>
                      setPaymentMethods({
                        ...paymentMethods,
                        cashAppId: e.target.value,
                      })
                    }
                  />
                </FormGroup>
              </Col>
              <Col md={12}>
                <FormGroup>
                  <Label for="paypalId">PayPal ID</Label>
                  <Input
                    id="paypalId"
                    name="paypalId"
                    type="text"
                    value={paymentMethods.paypalId}
                    onChange={(e) =>
                      setPaymentMethods({
                        ...paymentMethods,
                        paypalId: e.target.value,
                      })
                    }
                  />
                </FormGroup>
              </Col>
              <Col md={12}>
                <FormGroup>
                  <Label for="venmoId">Venmo ID</Label>
                  <Input
                    id="venmoId"
                    name="venmoId"
                    type="text"
                    value={paymentMethods.venmoId}
                    onChange={(e) =>
                      setPaymentMethods({
                        ...paymentMethods,
                        venmoId: e.target.value,
                      })
                    }
                  />
                </FormGroup>
              </Col>
              <Col md={12} className="d-flex justify-content-end">
                <Button color="primary" type="submit">
                  Save
                </Button>
              </Col>
            </Row>
          </Form>
        </ModalBody>
      </Modal>
    </React.Fragment>
  );
};

export default CashOutDialog;
