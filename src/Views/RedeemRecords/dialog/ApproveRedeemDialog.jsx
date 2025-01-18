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
  const [redeemRemarks, setRedeemRemarks] = useState(""); // State for Redeem Remarks
  const [remark, setRemark] = useState();
  const [redeemFees, setRedeemFees] = useState();
  const [responseData, setResponseData] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEditingFees, setIsEditingFees] = useState(false);
  const [editedFees, setEditedFees] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [redeemEnabled, setRedeemEnabled] = useState(false); // Confirmation modal visibility
  const role = localStorage.getItem("role");
  const [feeError, setFeeError] = useState("");

  const resetFields = () => {
    setUserName("");
    setRedeemAmount("");
    setRemark("");
    setRedeemFees("");
  };

  const parentServiceFee = async () => {
    try {
      const response = await Parse.Cloud.run("redeemParentServiceFee", {
        userId: record?.userParentId,
      });
      setRedeemFees(response?.redeemService || 0);
      setEditedFees(response?.redeemService || 0); // Initialize edited fees
      setRedeemEnabled(response?.redeemServiceEnabled);
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

  const handleConfirmClick = () => {
    if (role === "Agent" && (editedFees < 5 || editedFees > 20)) {
      setFeeError(
        "As an Agent, the redeem service fee must be between 5% and 20%."
      );
      return false;
    }
    setFeeError(""); // Clear error if input is valid
    // Show confirmation modal only if the fees have been changed
    if (parseFloat(redeemFees) !== parseFloat(editedFees)) {
      setShowConfirmModal(true);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    const percentageAmount = (
      redeemAmount -
      redeemAmount * (editedFees / 100)
    ).toFixed(2);

    const rawData = {
      ...record,
      orderId: record?.id,
      transactionAmount: redeemAmount,
      percentageAmount,
      remark,
      redeemFees: (redeemAmount - percentageAmount).toFixed(2),
      type: "redeem",
      redeemServiceFee: editedFees, // Use the updated fees,
      redeemRemarks: redeemRemarks,
    };

    setLoading(true);
    try {
      await Parse.Cloud.run("agentApproveRedeemRedords", rawData);

      onClose();
      handleRefresh();
    } catch (error) {
      console.error("Error Redeem Record details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditFees = () => {
    setIsEditingFees(true);
  };

  const handleSaveFees = () => {
    setEditedFees(editedFees); // Save the edited fees locally
    setIsEditingFees(false);
  };

  const handleCancelEditFees = () => {
    setEditedFees(redeemFees); // Revert to original fees
    setIsEditingFees(false);
  };

  const confirmFeesChange = () => {
    setRedeemFees(editedFees); // Apply new fees
    setShowConfirmModal(false); // Close modal
    handleSubmit(); // Submit data
  };

  const cancelFeesChange = () => {
    setEditedFees(redeemFees); // Revert to original fees
    setShowConfirmModal(false); // Close modal
  };

  return (
    <React.Fragment>
      {loading ? (
        <Loader />
      ) : (
        <Modal isOpen={open} toggle={onClose} size="md" centered>
          <ModalHeader toggle={onClose} className="border-bottom-0 pb-0">
            Redeem Amount
          </ModalHeader>
          <ModalBody>
            <FormText className="font-weight-bold">
              Redeems may take up to 2 hours
            </FormText>
            <Form>
              <Row>
                <Col md={12}>
                  <FormGroup>
                    <Label for="userName">Account</Label>
                    <Input
                      id="userName"
                      name="userName"
                      value={userName}
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
                      value={redeemAmount}
                      disabled
                    />
                  </FormGroup>
                </Col>

                {isEditingFees ? (
                  <Col md={12}>
                    <FormGroup>
                      <Label for="redeemFees">Redeem Service Fee (%)</Label>
                      <div className="d-flex align-items-center">
                        <Input
                          id="redeemFees"
                          name="redeemFees"
                          type="number"
                          min="0"
                          max="100"
                          value={editedFees}
                          onChange={(e) => setEditedFees(e.target.value)}
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
                ) : (
                  <p className="mb-0">
                    <small>
                      Redeem Service Fee @ {editedFees || redeemFees}%{" "}
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
                )}
                {feeError && <small className="text-danger">{feeError}</small>}

                <p className="mb-1">
                  <small>
                    Total amount to be redeemed = $
                    {Math.floor(
                      redeemAmount -
                        (redeemAmount *
                          (editedFees
                            ? parseFloat(editedFees)
                            : parseFloat(redeemFees))) /
                          100
                    )}
                  </small>
                </p>
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
                      value={remark}
                      disabled
                    />
                  </FormGroup>
                </Col>
                <Col md={12}>
                  <FormGroup>
                    <Label for="redeemRemarks">Redeem Remarks</Label>
                    <Input
                      id="redeemRemarks"
                      name="redeemRemarks"
                      type="textarea"
                      autoComplete="off"
                      value={redeemRemarks}
                      maxLength={30}
                      onChange={(e) => setRedeemRemarks(e.target.value)}
                    />
                  </FormGroup>
                </Col>

                <Col md={12}>
                  <div className="d-flex justify-content-end">
                    <Button
                      color="success"
                      onClick={handleConfirmClick}
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

      {/* Confirmation Modal */}
      <Modal isOpen={showConfirmModal} toggle={cancelFeesChange} centered>
        <ModalHeader toggle={cancelFeesChange}>Confirm Fees Change</ModalHeader>
        <ModalBody>
          <p>
            You have changed the redeem service fee from {redeemFees}% to{" "}
            {editedFees}%. Do you want to proceed?
          </p>
          <div className="d-flex justify-content-end">
            <Button
              color="success"
              onClick={confirmFeesChange}
              className="me-2"
            >
              Yes, Proceed
            </Button>
            <Button color="secondary" onClick={cancelFeesChange}>
              No, Cancel
            </Button>
          </div>
        </ModalBody>
      </Modal>
    </React.Fragment>
  );
};

export default ApproveRedeemDialog;
