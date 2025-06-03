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
  ModalFooter,
} from "reactstrap";
// loader
import { Loader } from "../../Loader";
import { Parse } from "parse";
import { Alert, Box, Typography } from "@mui/material";
import cancel from "../../../Assets/icons/cancel.svg";
import { validatePositiveNumber } from "../../../Validators/number.validator";
import "../../../Assets/css/Dialog.css";

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
  const [isReedeemZeroAllowed, setisReedeemZeroAllowed] = useState(false);
  const role = localStorage.getItem("role");
  const [feeError, setFeeError] = useState("");
  const [amountError, setAmountError] = useState("");
  const [serviceError, setServiceError] = useState("");

  const [parentBalance, setParentBalance] = useState(0);
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
      setisReedeemZeroAllowed(
        response?.redeemService === 0 ? true : response?.isReedeemZeroAllowed
      );
      setParentBalance(response?.potBalance);
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
    if (parentBalance <= 500) {
      setAmountError(
        "Redeem not allowed. Parent balance must be greater than 500."
      );
      return false;
    }

    if (redeemAmount >= parentBalance) {
      setAmountError(
        "Redeem amount cannot be equal to or greater than the available Agent balance."
      );
      return false;
    }

    if (
      (role === "Agent" || role === "Master-Agent") &&
      !isReedeemZeroAllowed &&
      (editedFees < 5 || editedFees > 20)
    ) {
      setFeeError(
        "As an Agent, the redeem service fee must be between 5% and 20%."
      );
      return false;
    }
    if (
      (role === "Agent" || role === "Master-Agent") &&
      isReedeemZeroAllowed &&
      (editedFees < 0 || editedFees > 20)
    ) {
      setFeeError(
        "As an Agent, the redeem service fee must be between 0% and 20%."
      );
      return false;
    }
    if (!redeemAmount || redeemAmount < 0) {
      setAmountError("Redeem amount must be greater than zero.");
      return false;
    }
    if (redeemAmount < 15) {
      setAmountError("Redeem amount cannot be less than 15.");
      return false;
    }
    setFeeError(""); // Clear error if input is valid
    setAmountError("");
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
  return (
    <React.Fragment>
      {loading ? (
        <Loader />
      ) : (
        <Modal
          isOpen={open}
          toggle={handleClose}
          // size="md"
          centered
          className="custom-modal"
        >
          <ModalHeader
            toggle={handleClose}
            className="custom-modal-header border-bottom-0"
            style={{paddingBottom:"0px"}}
          >
            Redeem Amount
          </ModalHeader>
          <ModalBody className="custom-modal-body">
            {amountError && (
              <Alert severity="error" sx={{ mb: 1 }}>
                {amountError}
              </Alert>
            )}
            <FormText className="mb-3">Redeems may take up to 2 hours</FormText>
            <Form onSubmit={(e) => e.preventDefault()}>
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
                      style={{
                        backgroundColor: "#DEDEDE",
                        border: "1px solid #A5AFBC",
                      }}
                      value={userName}
                      required
                      disabled
                    />
                  </FormGroup>
                </Col>

                <Col md={12}>
                  <FormGroup>
                    <Label for="redeemAmount" className="custom-label">
                      Redeem Amount
                    </Label>
                    <Input
                      id="redeemAmount"
                      name="redeemAmount"
                      type="number"
                      autoComplete="off"
                      min="1"
                      className="custom-input"
                      placeholder="e.g. 500"
                      value={redeemAmount}
                      required
                      onChange={(e) => {
                        let value = e.target.value;
                        if (value === "" || /^\d*$/.test(value)) {
                          if (value === "") {
                            setRedeemAmount(value);
                          } else if (value.includes(".")) {
                            value = Math.floor(parseFloat(value));
                            setRedeemAmount(value);
                          } else if (/^\d*$/.test(value)) {
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
                <Col md={12}>
                <p className="redeem-fees-text" style={{backgroundColor:"#F6F4F4"}}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <small>Redeem Service Fee @ {editedFees}%</small>
                    {isEditingFees && (
                      <Button
                        color="secondary"
                        className="cancel"
                        onClick={handleCancelEditFees}
                      >
                        <img
                          src={cancel}
                          alt="cancel"
                          style={{ width: 11, height: 11 }}
                        />
                      </Button>
                    )}
                    {role === "Agent" && redeemEnabled && !isEditingFees && (
                      <Button color="link" onClick={handleEditFees}>
                        Edit
                      </Button>
                    )}
                    {role === "Super-User" && !isEditingFees && (
                      <Button color="link" onClick={handleEditFees}>
                        Edit
                      </Button>
                    )}
                  </div>
                  {isEditingFees && (
                    <>
                      <div className="fee-edit-container">
                        <Input
                          id="redeemFees"
                          name="redeemFees"
                          type="number"
                          min={role === "Agent" ? "5" : "0"}
                          max={role === "Agent" ? "20" : "100"}
                          value={editedFees}
                          className="custom-input"
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
                          className="btn-change ms-2"
                          onClick={handleSaveFees}
                        >
                          Change
                        </Button>
                      </div>
                      {serviceError && (
                        <small className="text-danger">{serviceError}</small>
                      )}
                    </>
                  )}
                </p>
                </Col>

                {feeError && <small className="text-danger">{feeError}</small>}

                {redeemPercentage !== null &&
                  redeemPercentage !== undefined && (
                    <p className="mb-3 ml-1">
                      <small style={{ fontSize: "13px"}}>
                        Total amount to be redeemed = $
                        {Math.floor(redeemPercentage) || 0}
                      </small>
                    </p>
                  )}
                <Box
                  style={{
                    width: "95%",
                    height: "auto",
                    borderRadius: "4px",
                    gap: "8px",
                    padding: "0 12px",
                    marginLeft: "10px",
                    marginBottom: "16px",
                    background: "var(--semantic-warning-light, #FEF3C7)", // Parent div background
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 400,
                      fontSize: "12px",
                      lineHeight: "150%",
                      letterSpacing: "1.2%",
                      verticalAlign: "middle",
                      color: "var(--semantic-warning, #F59E0B)",
                      padding: "5px 4px",
                    }}
                  >
                    "The amount has been rounded down to the nearest lower
                    value."
                  </Typography>
                </Box>

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
                      className="custom-input"
                      placeholder="Enter Remark"
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
                      className="custom-label text-danger mb-2"
                    >
                      {responseData}
                    </Label>
                  </Col>
                )}
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
                  paddingRight: { xs: 0, sm: 1 },
                }}
              >
                <Button
                  type="button"
                  className="custom-button confirm"
                  disabled={loading}
                  onClick={handleConfirmClick}
                >
                  {loading ? "Processing..." : "Confirm"}
                </Button>
                <Button
                  className="custom-button cancel"
                  onClick={handleClose}
                  // Check and open confirmation modal if needed
                >
                  Cancel
                </Button>
              </Box>
            </Col>
          </ModalFooter>
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
