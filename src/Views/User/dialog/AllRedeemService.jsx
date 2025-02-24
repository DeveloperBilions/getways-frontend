import React, { useState, useEffect } from "react";
import { Button, Modal, ModalHeader, ModalBody, FormGroup, Label, Form, Input, FormText } from "reactstrap";
import { Loader } from "../../Loader";
import { Parse } from "parse";
import { useGetIdentity } from "react-admin";

Parse.initialize(process.env.REACT_APP_APPID, process.env.REACT_APP_MASTER_KEY);
Parse.serverURL = process.env.REACT_APP_URL;

const AllRedeemService = ({ open, onClose }) => {
  const { identity } = useGetIdentity();
  const [serviceFee, setServiceFee] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setServiceFee("");
      setError("");
    }
  }, [open]);

  const handleServiceFeeChange = (e) => {
    const value = e.target.value.trim();
    const parsedValue = parseInt(value, 10);

    if (!/^[0-9]*$/.test(value)) {
      setError("Only numeric values are allowed.");
    } else if (parsedValue < 1 || parsedValue > 20) {
      setError("Service Fee must be between 1 and 20.");
    } else {
      setError("");
      setServiceFee(parsedValue || "");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (serviceFee < 1 || serviceFee > 20) {
      setError("Service Fee must be between 1 and 20.");
      return;
    }

    setLoading(true);
    try {
      await Parse.Cloud.run("redeemServiceFeeAgentAll", {
        userId: identity?.objectId,
        redeemService: serviceFee,
      });
      onClose();
    } catch (error) {
      console.error("Error updating redeem service fee:", error);
      setError("Failed to update. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={open} toggle={onClose} size="md" centered>
      <ModalHeader toggle={onClose} className="border-bottom-0">
        Set Redeem Service Fee
      </ModalHeader>
      <ModalBody>
        {loading ? (
          <Loader />
        ) : (
          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label for="serviceFee">Redeem Service Fee (%)</Label>
              <Input
                id="serviceFee"
                name="serviceFee"
                type="text"
                autoComplete="off"
                value={serviceFee}
                onChange={handleServiceFeeChange}
                maxLength={2}
                required
              />
              {error && <FormText color="danger">{error}</FormText>}
            </FormGroup>
            <div className="d-flex justify-content-end">
              <Button className="mx-2" color="success" type="submit" disabled={!!error}>
                Confirm
              </Button>
              <Button color="secondary" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </Form>
        )}
      </ModalBody>
    </Modal>
  );
};

export default AllRedeemService;
