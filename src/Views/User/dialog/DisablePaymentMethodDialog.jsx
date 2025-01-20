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
import { Parse } from "parse";

const DisablePaymentMethodDialog = ({ open, onClose, paymentMethods = {},record }) => {
  const [disableMethods, setDisableMethods] = useState({
    cashAppId: paymentMethods?.isCashAppDisabled || false,
    paypalId: paymentMethods?.isPaypalDisabled || false,
    venmoId: paymentMethods?.isVenmoDisabled || false,
    zelleId: paymentMethods?.isZelleDisabled || false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const userId = record?.id
  useEffect(() => {
    // Update local state when paymentMethods prop changes
    setDisableMethods({
      cashAppId: paymentMethods?.isCashAppDisabled || false,
      paypalId: paymentMethods?.isPaypalDisabled || false,
      venmoId: paymentMethods?.isVenmoDisabled || false,
      zelleId: paymentMethods?.isZelleDisabled || false,
    });
  }, [paymentMethods]);

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

    // Validation: At least one payment method must remain enabled
    if (enabledMethods === 0) {
      setError("At least one payment method must be enabled.");
      return;
    }

    setError(""); // Clear any previous errors
    setLoading(true);

    try {
      // Update Parse Wallet data
      const walletQuery = new Parse.Query("Wallet");
      walletQuery.equalTo("userID", userId); // Query by the user ID
      const wallet = await walletQuery.first();

      if (!wallet) {
        throw new Error("Wallet not found.");
      }

      wallet.set("isCashAppDisabled", disableMethods.cashAppId);
      wallet.set("isPaypalDisabled", disableMethods.paypalId);
      wallet.set("isVenmoDisabled", disableMethods.venmoId);
      wallet.set("isZelleDisabled", disableMethods.zelleId);

      await wallet.save(null);

      onClose(); // Close dialog after successful save
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
