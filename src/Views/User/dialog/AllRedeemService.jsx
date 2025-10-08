import React, { useState, useEffect } from "react";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  FormGroup,
  Label,
  Form,
  Input,
  FormText,
} from "reactstrap";
import { Loader } from "../../Loader";
import { Parse } from "parse";
import { useGetIdentity, useRefresh } from "react-admin";
import { Box, CircularProgress } from "@mui/material";
Parse.initialize(process.env.REACT_APP_APPID, process.env.REACT_APP_MASTER_KEY);
Parse.serverURL = process.env.REACT_APP_URL;

const AllRedeemService = ({ open, onClose }) => {
  const { identity } = useGetIdentity();
  const [serviceFee, setServiceFee] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const refresh = useRefresh();

  useEffect(() => {
    if (open && identity?.redeemService !== undefined) {
      setServiceFee(identity.redeemService.toString());
    } else if (!open) {
      setServiceFee("");
      setError("");
    }
  }, [open, identity]);

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
      refresh();
      setTimeout(() => {
        onClose();
      }, 300);
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
              <Box
                className="d-flex w-100 justify-content-between"
                sx={{
                  flexDirection: { xs: "column-reverse", sm: "row" }, // 🔁 Reverse order on mobile
                  alignItems: { xs: "stretch", sm: "stretch" }, // Stretch items to take full width in both modes
                  gap: { xs: 2, sm: 2 }, // Add spacing between buttons
                  marginBottom: { xs: 2, sm: 2 }, // Add margin at the bottom
                  width: "100% !important", // Ensure the container takes full width
                  paddingRight: { xs: 0, sm: 1 },
                }}
              >
                <Button onClick={onClose} className="custom-button cancel">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!!error}
                  className="custom-button confirm"
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Confirm"
                  )}
                </Button>
              </Box>
            </div>
          </Form>
        )}
      </ModalBody>
    </Modal>
  );
};

export default AllRedeemService;
