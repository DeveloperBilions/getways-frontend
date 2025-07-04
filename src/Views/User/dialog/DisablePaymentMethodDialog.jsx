import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  ListGroup,
  ListGroupItem,
  Alert,
} from "reactstrap";
import { Box } from "@mui/material";
import { FaCashRegister, FaPaypal } from "react-icons/fa";
import { BiLogoVenmo } from "react-icons/bi";
import { SiZelle } from "react-icons/si";
import { Switch, CircularProgress } from "@mui/material";
import '../../../Assets/css/DisablePaymentMethodDialog.css';
import { Parse } from "parse";

const DisablePaymentMethodDialog = ({ open, onClose }) => {
  const [disableMethods, setDisableMethods] = useState({
    cashAppId: false,
    paypalId: false,
    venmoId: false,
    zelleId: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false); // State for success message

  useEffect(() => {
    // Fetch payment methods from the PaymentMethods table
    const fetchPaymentMethods = async () => {
      setLoading(true);
      setError("");

      try {
        const query = new Parse.Query("PaymentMethods");
        const paymentMethods = await query.first();

        if (paymentMethods) {
          setDisableMethods({
            cashAppId: paymentMethods.get("isCashAppDisabled") || false,
            paypalId: paymentMethods.get("isPaypalDisabled") || false,
            venmoId: paymentMethods.get("isVenmoDisabled") || false,
            zelleId: paymentMethods.get("isZelleDisabled") || false,
          });
        } else {
          throw new Error("No PaymentMethods record found.");
        }
      } catch (err) {
        setError(err.message || "An error occurred while loading data.");
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchPaymentMethods();
    }
  }, [open]);

  const handleToggleDisable = (method) => {
    setDisableMethods((prev) => ({
      ...prev,
      [method]: !prev[method],
    }));
  };

  const handleSave = async () => {
    const enabledMethods = Object.values(disableMethods).filter(
      (disabled) => !disabled
    ).length;

    if (enabledMethods === 0) {
      setError("At least one payment method must be enabled.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const query = new Parse.Query("PaymentMethods");
      const paymentMethods = await query.first();

      if (!paymentMethods) {
        throw new Error("PaymentMethods record not found.");
      }

      paymentMethods.set("isCashAppDisabled", disableMethods.cashAppId);
      paymentMethods.set("isPaypalDisabled", disableMethods.paypalId);
      paymentMethods.set("isVenmoDisabled", disableMethods.venmoId);
      paymentMethods.set("isZelleDisabled", disableMethods.zelleId);

      await paymentMethods.save(null);
      setSuccess(true); // Show success message
      setTimeout(() => {
        setSuccess(false);
        onClose(); // Close dialog after success message disappears
      }, 2000);
    } catch (err) {
      setError(err.message || "An error occurred while saving.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={open} toggle={onClose} centered size="md">
      <ModalHeader toggle={onClose} className="payment-modal-header">Manage Payment Methods</ModalHeader>
      <ModalBody className="payment-modal-body">
        {error && (
          <Alert color="danger" className="payment-alert">
            {error}
          </Alert>
        )}
         {success && (
          <Alert color="success" className="payment-alert">
            Payment methods changed successfully
          </Alert>
        )}
        <ListGroup flush className="payment-list-group">
          {Object.keys(disableMethods).map((method) => (
            <ListGroupItem
              key={method}
              className="payment-list-item"
            >
              <div className="payment-list-content">
                {method === "cashAppId" && (
                  <FaCashRegister
                    style={{ marginRight: "8px", color: "#FFD700" }}
                  />
                )}
                {method === "paypalId" && (
                  <FaPaypal
                    style={{ marginRight: "8px", color: "#0070BA" }}
                  />
                )}
                {method === "venmoId" && (
                  <BiLogoVenmo
                    style={{ marginRight: "8px", color: "#3D95CE" }}
                  />
                )}
                {method === "zelleId" && (
                  <SiZelle
                    style={{ marginRight: "8px", color: "#6C757D" }}
                  />
                )}
                <strong>{method.replace("Id", "").toUpperCase()}:</strong>
              </div>
              <Switch
                checked={!disableMethods[method]}
                onChange={() => handleToggleDisable(method)}
                color="primary"
              />
            </ListGroupItem>
          ))}
        </ListGroup>
      </ModalBody>

       <ModalFooter className="custom-modal-footer">
          <Box className="d-flex w-100 justify-content-between"
            sx={{
              flexDirection: { xs: "column-reverse", sm: "row" }, // 🔁 Reverse order on mobile
              alignItems: { xs: "stretch", sm: "stretch" }, // Stretch items to take full width in both modes
              gap: { xs: 2, sm: 2 }, // Add spacing between buttons
              marginBottom: { xs: 2, sm: 2 }, // Add margin at the bottom
              width: "100% !important", // Ensure the container takes full width
              paddingRight: { xs: 0, sm: 1 },
            }}>

          <Button  className="custom-button cancel"  onClick={onClose} disabled={loading}>
            Cancel
          </Button>
              <Button
             className="custom-button confirm" 
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={20} className="payment-loader" />
            ) : (
              "Save"
            )}
          </Button>
            </Box>
            </ModalFooter>
    </Modal>
  );
};

export default DisablePaymentMethodDialog;
