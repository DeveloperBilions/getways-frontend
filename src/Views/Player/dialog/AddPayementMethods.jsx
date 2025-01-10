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

const AddPaymentMethods = ({ open, onClose, handleRefresh,wallet }) => {
  const [paymentMethods, setPaymentMethods] = useState({...wallet});
  const [loading, setLoading] = useState(false); // State to track loading status
  const [error, setError] = useState(""); // State to track errors

  const handleAddPaymentMethod = async (newMethods) => {
    setLoading(true);
    setError("");
    try {
      await walletService.updatePaymentMethods(newMethods);
      setPaymentMethods(newMethods);
      if (handleRefresh) {
        handleRefresh(); // Refresh parent data if necessary
      }
      onClose(); // Close the modal
    } catch (error) {
      console.error("Error updating payment methods:", error);
      setError("Failed to save payment methods. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={open} toggle={onClose} size="md" centered>
      <ModalHeader toggle={onClose}>Add / Edit Payment Method</ModalHeader>
      <ModalBody>
        {error && <div className="text-danger mb-3">{error}</div>}
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
                  onClick={onClose}
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
