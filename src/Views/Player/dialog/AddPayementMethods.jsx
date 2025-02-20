import { useState } from "react";
import { walletService } from "../../../Provider/WalletManagement";
import {
  Modal,
  ModalHeader,
  ModalBody,
  Form,
  Row,
  Col,
  FormGroup,
  Label,
  Input,
  Button,
  Spinner,
} from "reactstrap";
import { Alert } from "reactstrap";

const AddPaymentMethods = ({ open, onClose, handleRefresh,wallet }) => {
  const [originalPaymentMethods, setOriginalPaymentMethods] = useState({...wallet});
  const [paymentMethods, setPaymentMethods] = useState({...wallet});
  const [loading, setLoading] = useState(false); // State to track loading status
  const [error, setError] = useState(""); // State to track errors

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
      paymentMethods?.paypalId?.trim() &&
      !/^[a-zA-Z0-9]{13}$/.test(paymentMethods?.paypalId.trim())
    ) {
      setError("PayPal ID must be exactly 13 alphanumeric characters.");
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
    setLoading(true);
    setError("");
    try {
      await walletService.updatePaymentMethods(trimmedMethods);
      setPaymentMethods(newMethods);
      setOriginalPaymentMethods(newMethods);
      if (handleRefresh) {
        handleRefresh(); // Refresh parent data if necessary
      }
      onClose(); // Close the modal
    } catch (error) {
      console.error("Error updating payment methods:", error);
      setError(error.message ? error.message :"Failed to save payment methods. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={open} toggle={onClose} size="md" centered>
      <ModalHeader toggle={onClose}>Add / Edit Payment Method</ModalHeader>
      <ModalBody>
        {error &&  <Alert color="danger" className="mt-2">{error}</Alert>}
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
                  value={paymentMethods.cashAppId || ""}
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
                  value={paymentMethods.paypalId || ""}
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
                  value={paymentMethods.venmoId || ""}
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
              <Button color="primary" type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Spinner size="sm" className="me-2" /> Saving...
                  </>
                ) : (
                  "Save"
                )}
              </Button>
              <Button
                  color="secondary"
                  className="ms-2"
                  onClick={() => {
                    setPaymentMethods(originalPaymentMethods);
                    onClose();
                  }}
                  disabled={loading} // Disable cancel button while saving
                >
                  Cancel
                </Button>
            </Col>
          </Row>
        </Form>
      </ModalBody>
    </Modal>
  );
};

export default AddPaymentMethods;
