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
import "../../../Assets/css/cashoutDialog.css";
Parse.initialize(process.env.REACT_APP_APPID, process.env.REACT_APP_MASTER_KEY);
Parse.serverURL = process.env.REACT_APP_URL;

const CashOutDialog = ({ open, onClose, record, handleRefresh }) => {
  const [userName, setUserName] = useState(localStorage.getItem("username"));
  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("id");
  const [redeemAmount, setRedeemAmount] = useState("");
  const [redeemFees, setRedeemFees] = useState(0);
  const [remark, setRemark] = useState("");
  const [loading, setLoading] = useState(false);
  const [walletId, setWalletId] = useState("");
  const [balance, setBalance] = useState(0);
  const [paymentMethods, setPaymentMethods] = useState({
    cashAppId: "",
    paypalId: "",
    venmoId: "",
    zelleId:""
  });
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(""); // New state for selected payment method
  const [showAddPaymentMethodDialog, setShowAddPaymentMethodDialog] =
    useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [error, setError] = useState(""); // State to track errors
  const [selectedPaymentMethodType, setSelectedPaymentMethodType] =
    useState(""); // Store selected payment method type (e.g., cashAppId)
  const resetFields = () => {
    setRedeemAmount("");
    setRemark("");
    setWarningMessage("");
    setErrorMessage("");
  };

  useEffect(() => {
    if (record && open) {
      //setUserName(record.username || "");
      //parentServiceFee();
    } else {
      resetFields();
    }
  }, [record, open]);

  useEffect(() => {
    async function WalletService() {
      const wallet = await walletService.getMyWalletData();
      console.log(wallet,"walletdata")
      const { cashAppId, paypalId, venmoId, objectId, balance,zelleId } = wallet.wallet;
      setBalance(balance);
      setPaymentMethods({ cashAppId, paypalId, venmoId,zelleId });
      setWalletId(objectId);
    }

    if (open) {
      WalletService();
    }
  }, [open]);

  const handleConfirm = () => {
    const { cashAppId, paypalId, venmoId,zelleId } = paymentMethods;
    const methodCount = [cashAppId, paypalId, venmoId,zelleId].filter(Boolean).length;
    if (!selectedPaymentMethodType) {
      setErrorMessage("Please select a payment method type.");
      return;
    }
    if (parseFloat(redeemAmount) > parseFloat(balance || 0)) {
      setErrorMessage("Cash-out amount cannot exceed your wallet balance.");
      return;
    } else {
      setErrorMessage("");
    }
    if (methodCount === 0) {
      setWarningMessage(
        "No payment methods are added. Please add a payment method to proceed."
      );
      setShowWarningModal(true);
    }
    // else if (methodCount > 0 && methodCount < 3) {
    //   setWarningMessage(
    //     `You have ${methodCount} payment mode${
    //       methodCount > 1 ? "s" : ""
    //     } added for refunds. Would you like to add/edit the payment method?`
    //   );
    //   setShowWarningModal(true);
    // }
    else {
      handleSubmit(); // Call handleSubmit directly if 3 payment methods are already added
    }
  };

  const handleSubmit = async () => {
    const { cashAppId, paypalId, venmoId, zelleId } = paymentMethods;

    if (!cashAppId && !paypalId && !venmoId && !zelleId) {
      setErrorMessage("Refund cannot be processed without a payment mode.");
      return;
    }

    if (!redeemAmount) {
      setErrorMessage("Cashout amount cannot be empty. Please enter a valid amount.");
      return;
    }
    
    if (redeemAmount <= 0) {
      setErrorMessage("Cashout amount cannot be negative or 0. Please enter a valid amount.");
      return;
    }
    
    const rawData = {
      redeemServiceFee: redeemFees,
      transactionAmount: redeemAmount,
      remark,
      type: "redeem",
      walletId: walletId,
      username:userName,
      id:userId,
      isCashOut: true,
      paymentMode: selectedPaymentMethodType,
      paymentMethodType: selectedPaymentMethod,
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
    const trimmedMethods = {
      cashAppId: paymentMethods?.cashAppId?.trim() || "",
      venmoId: paymentMethods?.venmoId?.trim() || "",
      paypalId: paymentMethods?.paypalId?.trim() || "",
      zelleId: paymentMethods?.zelleId?.trim() || "",
    };
    if (
      (!paymentMethods?.cashAppId?.trim() || paymentMethods?.cashAppId?.trim() === "") &&
      (!paymentMethods?.venmoId?.trim() || paymentMethods?.venmoId?.trim() === "") &&
      (!paymentMethods?.paypalId?.trim() || paymentMethods?.paypalId?.trim() === "") && 
      (!paymentMethods?.zelleId?.trim() || paymentMethods?.zelleId?.trim() === "")
    ) {
      setError("Add at least one valid payment method.");
      return false;
    } 
    if (
      paymentMethods?.cashAppId?.trim() &&
      !/^(?=.*[a-zA-Z]).{1,20}$/.test(paymentMethods?.cashAppId.trim())
    ) {
      setError(
        "CashApp ID must include at least 1 letter and be no longer than 20 characters."
      );
      return false;
    }
    if (
      paymentMethods?.venmoId?.trim() &&
      !/^[a-zA-Z0-9]+$/.test(paymentMethods?.venmoId.trim())
    ) {
      setError(
        "Venmo ID can only contain letters and numbers (no symbols, dashes, or spaces)."
      );
      return false;
    }
    try {
      
      await walletService.updatePaymentMethods(trimmedMethods);
      // Check if the previously selected payment method still exists
      if (newMethods[selectedPaymentMethodType]) {
        setSelectedPaymentMethod(newMethods[selectedPaymentMethodType]);
      } else {
        // Reset selection if the previously selected method is no longer valid
        setSelectedPaymentMethodType("");
        setSelectedPaymentMethod("");
      }
      setPaymentMethods(newMethods);
      setShowAddPaymentMethodDialog(false);
      setShowWarningModal(false);
      // handleSubmit(); // Automatically call handleSubmit after adding payment methods
    } catch (error) {
      console.error("Error updating payment methods:", error);
    }
  };
  const paymentOptions = [
    { key: "cashAppId", label: "CashApp", disabled: paymentMethods.isCashAppDisabled },
    { key: "paypalId", label: "PayPal", disabled: paymentMethods.isPaypalDisabled },
    { key: "venmoId", label: "Venmo", disabled: paymentMethods.isVenmoDisabled },
    { key: "zelleId", label: "Zelle", disabled: paymentMethods.isZelleDisabled },
  ];
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
                      type="text"
                      autoComplete="off"
                      value={redeemAmount}
                      onChange={(e) => {
                        let value = e.target.value;
                        if (value === '' || /^\d*$/.test(value)) {
                          if(value === ''){
                            setRedeemAmount(value);
                          }
                          else if (value.includes('.')) {
                            value = Math.floor(parseFloat(value));
                            setRedeemAmount(value);
                          }
                          else if (/^\d*$/.test(value)) {
                            setRedeemAmount(value);
                          }
                        }
                      }}
                      onKeyDown={(e) =>{
                        if (e.keyCode === 190) {
                          // Prevent the default behavior of typing a decimal
                          e.preventDefault();
                        }
                      }}
                      required/>
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
                      maxLength={30}
                    />
                  </FormGroup>
                </Col>

                <Col md={12}>
                  <FormGroup>
                    <Label for="remark">Payment Method</Label>
                    <div className="row">
                      {Object.entries(paymentMethods).filter(
                        ([_, value]) => value
                      ).length === 0 ? (
                        <div className="col-12 text-start text-danger">
                          <p> ** No Payment methods added ** </p>
                        </div>
                      ) : (
                        Object.entries(paymentMethods)
                          .filter(([key, value]) => value) // Filter out methods with no value
                          .map(([key, value]) => (
                            <div key={key} className="col-6 mt-2">
                              <div className="border p-3 w-100 rounded d-flex align-items-start cashout">
                                <Input
                                  type="radio"
                                  id={key}
                                  name="paymentMethod"
                                  value={key}
                                  checked={selectedPaymentMethodType === key}
                                  onChange={(e) => {
                                    setSelectedPaymentMethodType(
                                      e.target.value
                                    ); // Set method type
                                    setSelectedPaymentMethod(value); // Set method value
                                  }}
                                  required
                                />
                                <Label
                                  for={key}
                                  className="form-check-label d-flex flex-column px-3"
                                >
                                  <span>{key.replace(/Id$/, "")}</span>
                                  <span style={{ fontSize: "12px" }}>
                                    {value}
                                  </span>
                                </Label>
                              </div>
                            </div>
                          ))
                      )}
                    </div>
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
          if (
            paymentMethods.cashAppId ||
            paymentMethods.paypalId ||
            paymentMethods.venmoId
          ) {
            setShowWarningModal(false);
          } else {
            setErrorMessage(
              "Refund cannot be processed without a payment mode."
            );
            setShowWarningModal(false);
          }
        }}
        size="md"
        centered
      >
        <ModalHeader toggle={() => setShowWarningModal(false)}>
          Attention
        </ModalHeader>
        <ModalBody>
          <p>{warningMessage}</p>
          <div className="d-flex justify-content-end">
            {paymentMethods.cashAppId ||
            paymentMethods.paypalId ||
            paymentMethods.venmoId ? (
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
        {error &&  <Alert color="danger" className="mt-2">{error}</Alert>}

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
              <Col md={12}>
                <FormGroup>
                  <Label for="zelleId">Zelle ID</Label>
                  <Input
                    id="zelleId"
                    name="zelleId"
                    type="text"
                    value={paymentMethods.zelleId}
                    onChange={(e) =>
                      setPaymentMethods({
                        ...paymentMethods,
                        zelleId: e.target.value,
                      })
                    }
                  />
                </FormGroup>
              </Col>
              <Col md={12} className="d-flex justify-content-end">
                <Button color="primary" type="submit" disabled={loading} onClick={()=> handleAddPaymentMethod(paymentMethods)}>
                  {loading ? (
                    <span className="d-flex align-items-center">
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Saving...
                    </span>
                  ) : (
                    "Save"
                  )}
                </Button>
                <Button
                  color="secondary"
                  className="ms-2"
                  onClick={() => setShowAddPaymentMethodDialog(false)}
                  disabled={loading} // Disable cancel button while saving
                >
                  Cancel
                </Button>
              </Col>
            </Row>
        </ModalBody>
      </Modal>
    </React.Fragment>
  );
};

export default CashOutDialog;
