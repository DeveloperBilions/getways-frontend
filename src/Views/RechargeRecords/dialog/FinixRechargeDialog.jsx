import React, { useState, useEffect, useRef } from "react";
import { Modal, ModalHeader, ModalBody, Input, Alert } from "reactstrap";
import { useGetIdentity, useNotify } from "react-admin";
import { Loader } from "../../Loader";
import { Parse } from "parse";
import { checkActiveRechargeLimit } from "../../../Utils/utils";

// Initialize Parse
Parse.initialize(process.env.REACT_APP_APPID, process.env.REACT_APP_MASTER_KEY);
Parse.serverURL = process.env.REACT_APP_URL;

// Finix config
const FINIX_APPLICATION_ID = process.env.REACT_APP_FINIX_APPLICATION_ID || "APfoMeGZfdKsWmcmjcLhHjER";
const FINIX_ENVIRONMENT = process.env.REACT_APP_FINIX_ENVIRONMENT || "sandbox";
const FINIX_MERCHANT_ID = process.env.REACT_APP_FINIX_MERCHANT_ID || "MUeVMGsieX8Dny8dmVbMHTJ9";

const FinixRechargeDialog = ({ open, onClose, handleRefresh }) => {
  const { identity } = useGetIdentity();
  const notify = useNotify();
  const [userName, setUserName] = useState("");
  const [rechargeAmount, setRechargeAmount] = useState("");
  const [remark, setRemark] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [walletBalance, setWalletBalance] = useState(0);
  const [redeemFees, setRedeemFees] = useState(0);
  const [minLimitLoading, setMinLimitLoading] = useState(false);
  const [formInitialized, setFormInitialized] = useState(false);
  const [fraudSessionId, setFraudSessionId] = useState(null);
  const formRef = useRef(null);
  const fraudSessionRef = useRef(null);

  // Refs for fresh values inside Finix onSubmit callback (avoids stale closures)
  const rechargeAmountRef = useRef("");
  const userNameRef = useRef("");
  const remarkRef = useRef("");
  const identityRef = useRef(null);
  const redeemFeesRef = useRef(0);
  const notifyRef = useRef(notify);
  const onCloseRef = useRef(onClose);
  const handleRefreshRef = useRef(handleRefresh);

  // Keep refs in sync with state/props
  useEffect(() => { rechargeAmountRef.current = rechargeAmount; }, [rechargeAmount]);
  useEffect(() => { userNameRef.current = userName; }, [userName]);
  useEffect(() => { remarkRef.current = remark; }, [remark]);
  useEffect(() => { identityRef.current = identity; }, [identity]);
  useEffect(() => { redeemFeesRef.current = redeemFees; }, [redeemFees]);
  useEffect(() => { notifyRef.current = notify; }, [notify]);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);
  useEffect(() => { handleRefreshRef.current = handleRefresh; }, [handleRefresh]);

  const resetFields = () => {
    setUserName("");
    setRechargeAmount("");
    setRemark("");
    setErrorMessage("");
    setFormInitialized(false);
    setFraudSessionId(null);
    fraudSessionRef.current = null;
  };

  useEffect(() => {
    const fetchWalletBalance = async () => {
      try {
        const walletQuery = new Parse.Query("Wallet");
        walletQuery.equalTo("userID", identity.objectId);
        const wallet = await walletQuery.first();
        if (wallet) setWalletBalance(wallet.get("balance") || 0);
      } catch (error) {
        console.error("Error fetching wallet balance:", error);
      }
    };

    if (identity && open) {
      setUserName(identity.username || "");
      fetchWalletBalance();
      parentServiceFee();
    } else {
      resetFields();
    }
  }, [identity, open]);

  // Initialize Finix Auth for fraud detection when modal opens
  useEffect(() => {
    if (open && window.Finix && !fraudSessionRef.current) {
      try {
        const finixAuth = window.Finix.Auth(FINIX_ENVIRONMENT, FINIX_MERCHANT_ID, (sessionKey) => {
          setFraudSessionId(sessionKey);
          fraudSessionRef.current = sessionKey;
        });
        // Fallback: get session key synchronously if callback didn't fire
        setTimeout(() => {
          if (!fraudSessionRef.current && finixAuth?.getSessionKey) {
            const key = finixAuth.getSessionKey();
            if (key) {
              setFraudSessionId(key);
              fraudSessionRef.current = key;
            }
          }
        }, 1000);
      } catch (err) {
        console.error("Finix Auth init error:", err);
      }
    }
  }, [open]);

  // Initialize Finix form after modal opens
  useEffect(() => {
    if (open && !formInitialized) {
      const timer = setTimeout(() => initializeFinixForm(), 300);
      return () => clearTimeout(timer);
    }
  }, [open, formInitialized]);

  // Validate amount and limits, then send token to backend
  const validateAndProcess = async (token, instrumentType) => {
    const currentAmount = parseFloat(rechargeAmountRef.current);
    const currentIdentity = identityRef.current;
    const minFee = redeemFeesRef.current;

    // Validation
    if (!rechargeAmountRef.current || isNaN(currentAmount) || currentAmount < 10) {
      setErrorMessage("Please enter a recharge amount of at least $10.");
      setLoading(false);
      return;
    }
    if (currentAmount < minFee) {
      setErrorMessage(`Recharge amount must be at least $${minFee.toFixed(2)}.`);
      setLoading(false);
      return;
    }
    if (!userNameRef.current || !currentIdentity?.objectId) {
      setErrorMessage("User information not loaded. Please try again.");
      setLoading(false);
      return;
    }

    // Async limit check
    try {
      const limitCheck = await checkActiveRechargeLimit(currentIdentity.userParentId, currentAmount);
      if (!limitCheck.success) {
        setErrorMessage(limitCheck.message);
        setLoading(false);
        return;
      }
    } catch {
      setErrorMessage("Failed to verify recharge limit. Please try again.");
      setLoading(false);
      return;
    }

    // Send to backend
    try {
      const response = await Parse.Cloud.run("processFinixRecharge", {
        token,
        amount: currentAmount,
        username: userNameRef.current,
        remark: remarkRef.current,
        userId: currentIdentity.objectId,
        userParentId: currentIdentity.userParentId,
        instrumentType,
        fraud_session_id: fraudSessionRef.current || null,
      });

      if (response?.success) {
        notifyRef.current("Recharge successful!", { type: "success" });
        onCloseRef.current();
        handleRefreshRef.current();
        resetFields();
      } else {
        setErrorMessage(response?.message || "Recharge failed. Please try again.");
      }
    } catch (error) {
      console.error("Error processing recharge:", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Initialize Finix PaymentForm V2
  const initializeFinixForm = () => {
    if (formInitialized) return;

    if (!window.Finix) {
      setErrorMessage("Payment library not loaded. Please refresh the page.");
      return;
    }

    const container = document.getElementById("finix-form-container");
    if (!container) {
      setTimeout(() => { if (!formInitialized) initializeFinixForm(); }, 200);
      return;
    }

    try {
      const form = window.Finix.PaymentForm("finix-form-container", FINIX_ENVIRONMENT, FINIX_APPLICATION_ID, {
        paymentMethods: ["card"],
        showAddress: true,
        showLabels: true,
        labels: {
          cardNumber: "Card Number",
          expirationDate: "Expiration Date",
          securityCode: "CVV",
          postalCode: "Postal Code",
        },
        showPlaceholders: true,
        placeholders: {
          cardNumber: "1234 5678 9012 3456",
          expirationDate: "MM/YY",
          securityCode: "123",
          postalCode: "12345",
        },
        requiredFields: ["cardNumber", "expirationDate", "securityCode", "postalCode"],
        // Finix Submit button triggers this — all validation happens here
        onSubmit: (error, response) => {
          setErrorMessage("");
          setLoading(true);

          if (error) {
            setErrorMessage("Payment tokenization failed. Please check your card details.");
            setLoading(false);
            return;
          }
          if (!response) {
            setErrorMessage("Failed to process payment. Please check your card details and try again.");
            setLoading(false);
            return;
          }

          const tokenData = response.data || response;
          const token = tokenData.id;
          if (!token) {
            setErrorMessage("Failed to process payment. Please try again.");
            setLoading(false);
            return;
          }

          validateAndProcess(token, tokenData.instrument_type);
        },
      });

      formRef.current = form;
      setFormInitialized(true);
    } catch (error) {
      console.error("Error initializing Finix PaymentForm:", error);
      setErrorMessage("Failed to initialize payment form. Please refresh and try again.");
    }
  };

  const parentServiceFee = async () => {
    try {
      setMinLimitLoading(true);
      const response = await Parse.Cloud.run("redeemParentServiceFee", {
        userId: identity?.userParentId,
      });
      setRedeemFees(response?.rechargeLimit || 0);
    } catch (error) {
      console.error("Error fetching parent service fee:", error);
    } finally {
      setMinLimitLoading(false);
    }
  };

  return (
    <React.Fragment>
      {loading ? (
        <Loader />
      ) : (
        <Modal isOpen={open} toggle={onClose} size="md" centered className="overflow-visible">
          <ModalHeader toggle={onClose} className="border-bottom-0 pb-0">
            Recharge with Finix
          </ModalHeader>
          <ModalBody className="pt-2">
            {errorMessage && (
              <Alert color="danger" className="py-2 mb-2" style={{ fontSize: "0.85rem" }}>{errorMessage}</Alert>
            )}

            {/* Compact info fields */}
            <div className="d-flex align-items-center justify-content-between mb-2 px-1" style={{ fontSize: "0.85rem" }}>
              <span className="text-muted">Account: <strong>{userName}</strong></span>
              <span className="text-muted">Balance: <strong>${walletBalance.toFixed(2)}</strong></span>
            </div>

            <div className="d-flex gap-2 mb-2">
              <div style={{ flex: 2 }}>
                <Input
                  id="rechargeAmount"
                  type="number"
                  autoComplete="off"
                  min="10"
                  step="0.01"
                  bsSize="sm"
                  placeholder={`Amount (min $${redeemFees > 10 ? redeemFees.toFixed(0) : "10"})`}
                  value={rechargeAmount}
                  onChange={(e) => setRechargeAmount(e.target.value)}
                />
              </div>
              <div style={{ flex: 3 }}>
                <Input
                  id="remark"
                  type="text"
                  bsSize="sm"
                  placeholder="Remark (optional)"
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                />
              </div>
            </div>

            {/* Finix Payment Form */}
            <div
              id="finix-form-container"
              style={{
                minHeight: "200px",
                padding: "8px",
                border: "1px solid #dee2e6",
                borderRadius: "4px",
              }}
            />
          </ModalBody>
        </Modal>
      )}
    </React.Fragment>
  );
};

export default FinixRechargeDialog;
