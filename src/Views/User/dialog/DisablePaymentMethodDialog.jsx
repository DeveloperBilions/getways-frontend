import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  Button,
  ListGroup,
  ListGroupItem,
  Alert,
} from "reactstrap";
import { FaCashRegister, FaPaypal } from "react-icons/fa";
import { BiLogoVenmo } from "react-icons/bi";
import { SiZelle } from "react-icons/si";
import { Switch, CircularProgress } from "@mui/material";
import { Snackbar, Alert as MuiAlert } from "@mui/material";
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
    <Modal isOpen={open} toggle={onClose} centered>
      <ModalHeader toggle={onClose}>Manage Payment Methods</ModalHeader>
      <ModalBody>
        {error && (
          <Alert color="danger" className="mb-3">
            {error}
          </Alert>
        )}
         {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Payment methods changed successfully
          </Alert>
        )}
        <ListGroup flush>
          {Object.keys(disableMethods).map((method) => (
            <ListGroupItem
              key={method}
              style={{
                background: "transparent",
                border: "none",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div className="d-flex align-items-center">
                {method === "cashAppId" && (
                  <FaCashRegister
                    style={{ marginRight: "10px", color: "#FFD700" }}
                  />
                )}
                {method === "paypalId" && (
                  <FaPaypal
                    style={{ marginRight: "10px", color: "#0070BA" }}
                  />
                )}
                {method === "venmoId" && (
                  <BiLogoVenmo
                    style={{ marginRight: "10px", color: "#3D95CE" }}
                  />
                )}
                {method === "zelleId" && (
                  <SiZelle
                    style={{ marginRight: "10px", color: "#6C757D" }}
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
        <div className="text-end mt-4">
          <Button
            color="primary"
            onClick={handleSave}
            disabled={loading}
            className="me-2"
          >
            {loading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "Save"
            )}
          </Button>
          <Button color="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
        </div>
      </ModalBody>
    </Modal>
  );
};

export default DisablePaymentMethodDialog;
