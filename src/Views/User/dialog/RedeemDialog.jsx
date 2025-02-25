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
import { validatePositiveNumber } from "../../../Validators/number.validator";

// Initialize Parse
Parse.initialize(process.env.REACT_APP_APPID, process.env.REACT_APP_MASTER_KEY);
Parse.serverURL = process.env.REACT_APP_URL;

const RedeemDialog = ({ open, onClose, record, handleRefresh }) => {
  const [userName, setUserName] = useState("");
  const [redeemAmount, setRedeemAmount] = useState();
  const [remark, setRemark] = useState();
  const [redeemFees, setRedeemFees] = useState(); // Original fees from backend
  const [editedFees, setEditedFees] = useState(); // Editable fees (user changes)
  const [responseData, setResponseData] = useState("");
  const [loading, setLoading] = useState(false);
  const [redeemPercentage, setRedeemPercentage] = useState();
  const [isEditingFees, setIsEditingFees] = useState(false); // Manage edit mode
  const [showConfirmationModal, setShowConfirmationModal] = useState(false); // Confirmation modal visibility
  const [redeemEnabled, setRedeemEnabled] = useState(false); // Confirmation modal visibility
  const [isReedeemZeroAllowed,setisReedeemZeroAllowed]= useState(false);
  const role = localStorage.getItem("role");
  const [feeError, setFeeError] = useState("");
  const [amountError, setAmountError] = useState("");
  const [serviceError, setServiceError] = useState("");

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
      setRedeemFees(response?.redeemService || 0);
      setEditedFees(response?.redeemService || 0); // Initialize edited fees
      setRedeemEnabled(response?.redeemServiceEnabled);
      setisReedeemZeroAllowed(response?.redeemService === 0 ? true : response?.isReedeemZeroAllowed)
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

  // Calculate redeem percentage whenever redeemFees or redeemAmount changes
  useEffect(() => {
    const feesToUse = editedFees !== redeemFees ? editedFees : redeemFees; // Use edited fees if changed
    if (redeemAmount && feesToUse !== undefined) {
      const calculatedAmount = redeemAmount - redeemAmount * (feesToUse / 100);
      setRedeemPercentage(calculatedAmount.toFixed(2));
    } else {
      setRedeemPercentage(redeemAmount || 0);
    }
  }, [redeemAmount, redeemFees, editedFees]);

  const handleConfirmClick = () => {
       if (!redeemAmount || redeemAmount === "") {
         setAmountError("Redeem amount cannot be empty");
         return;
       }
    if ((role === "Agent"  || role === "Master-Agent") && !isReedeemZeroAllowed && (editedFees < 5 || editedFees > 20)) {
      setFeeError(
        "As an Agent, the redeem service fee must be between 5% and 20%."
      );
      return false;
    }
    if ((role === "Agent" || role === "Master-Agent") && isReedeemZeroAllowed && (editedFees < 0 || editedFees > 20)) {
      setFeeError(
        "As an Agent, the redeem service fee must be between 0% and 20%."
      );
      return false;
    }
    setFeeError(""); // Clear error if input is valid

    // Check if the redeem fees were changed by the user
    if (redeemFees !== parseFloat(editedFees)) {
      setShowConfirmationModal(true); // Show confirmation modal if fees changed
    } else {
      handleSubmit(); // Directly submit if fees haven't changed
    }
  };

  const handleSubmit = async () => {
    
    const validatorResponse = validatePositiveNumber(redeemAmount);
    if (!validatorResponse.isValid) {
      setResponseData(validatorResponse.error);
      return;
    }
    const rawData = {
      ...record,
      redeemServiceFee: parseFloat(editedFees), // Use edited fees in submission
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
        setLoading(false);
        setRedeemAmount("");
        setRemark("");
        handleRefresh();
      }
    } catch (error) {
      console.error("Error Redeem Record details:", error);
    } finally {
      setLoading(false);
      setShowConfirmationModal(false); // Close confirmation modal after submission
    }
  };

  const handleClose = () => {
    onClose();
    handleRefresh();
    resetFields();
  };

  const handleEditFees = () => {
    setIsEditingFees(true);
  };

  const handleSaveFees = () => {
    setEditedFees(parseFloat(editedFees)); // Save the edited fees
    setIsEditingFees(false);
  };

  const handleCancelEditFees = () => {
    setEditedFees(redeemFees); // Revert changes
    setIsEditingFees(false);
  };
  console.log(role, "role", redeemEnabled, "priti");
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
            <Form onSubmit={(e) => e.preventDefault()}>
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
                      min="1"
                      value={redeemAmount}
                      required
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

                        setRedeemAmount(value);
                      }}
                      onKeyDown={(e) => {
                        if (e.keyCode === 190) {
                          e.preventDefault();
                        }
                      }}
                      // required
                    />
                    {amountError && (
                      <small className="text-danger">{amountError}</small>
                    )}
                  </FormGroup>
                </Col>
                {isEditingFees && (
                  <Col md={12}>
                    <FormGroup>
                      <Label for="redeemFees">Redeem Service Fee (%)</Label>
                      <div className="d-flex align-items-center">
                        <Input
                          id="redeemFees"
                          name="redeemFees"
                          type="number"
                          min={role === "Agent" ? "5" : "0"}
                          max={role === "Agent" ? "20" : "100"}
                          value={editedFees}
                          onChange={(e) => {
                            let value = parseFloat(e.target.value);
                            if (value > 20) {
                              setEditedFees(20);
                              setServiceError(
                                "Redeem Service Fee cannot exceed 20%"
                              );
                            } else {
                              setServiceError("");
                              setEditedFees(value);
                            }
                          }}
                        />
                        <Button
                          color="success"
                          className="ms-2"
                          onClick={handleSaveFees}
                        >
                          Save
                        </Button>
                        <Button
                          color="secondary"
                          className="ms-2"
                          onClick={handleCancelEditFees}
                        >
                          Cancel
                        </Button>
                      </div>
                    </FormGroup>
                  </Col>
                )}

                <p className="mb-0">
                  <small>
                    Redeem Service Fee @ {editedFees}%{" "}
                    {role === "Agent" && redeemEnabled && (
                      <Button
                        color="link"
                        className="ms-2"
                        onClick={handleEditFees}
                      >
                        Edit
                      </Button>
                    )}
                    {role === "Super-User" && (
                      <Button
                        color="link"
                        className="ms-2"
                        onClick={handleEditFees}
                      >
                        Edit
                      </Button>
                    )}
                  </small>
                </p>
                {feeError && <small className="text-danger">{feeError}</small>}

                {redeemPercentage !== null &&
                  redeemPercentage !== undefined && (
                    <p className="mb-1">
                      <small>
                        Total amount to be redeemed = $
                        {Math.floor(redeemPercentage) || 0}
                      </small>
                    </p>
                  )}
                <span
                  style={{
                    fontStyle: "italic",
                    color: "#007BFF", // Bright blue for highlighting
                    fontSize: "13px",
                    fontWeight: "bold", // To make the text stand out
                  }}
                >
                  ** The amount has been rounded down to the nearest lower
                  value. **
                </span>

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
                      type="button"
                      className="mx-2"
                      disabled={loading}
                      onClick={handleConfirmClick} // Check and open confirmation modal if needed
                    >
                      {loading ? "Processing..." : "Confirm"}
                    </Button>
                    <Button color="secondary" onClick={handleClose}>
                      Cancel
                    </Button>
                  </div>
                  {serviceError && (
                    <small className="text-danger">{serviceError}</small>
                  )}
                </Col>
              </Row>
            </Form>
          </ModalBody>
        </Modal>
      )}

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmationModal}
        toggle={() => setShowConfirmationModal(false)}
        size="md"
        centered
      >
        <ModalHeader>Confirm Redeem Fee Change</ModalHeader>
        <ModalBody>
          <p>
            You have changed the redeem service fee from{" "}
            <strong>{redeemFees}%</strong> to <strong>{editedFees}%</strong>. Do
            you want to proceed with this change?
          </p>
          <div className="d-flex justify-content-end">
            <Button
              color="success"
              className="mx-2"
              onClick={handleSubmit} // Proceed with submission
            >
              Yes, Proceed
            </Button>
            <Button
              color="secondary"
              onClick={() => setShowConfirmationModal(false)}
            >
              Cancel
            </Button>
          </div>
        </ModalBody>
      </Modal>
    </React.Fragment>
  );
};

export default RedeemDialog;
