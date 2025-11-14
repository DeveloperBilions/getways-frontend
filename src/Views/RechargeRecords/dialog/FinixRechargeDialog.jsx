import React, { useState, useEffect, useRef } from "react";
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
  Alert,
} from "reactstrap";
import { useGetIdentity, useNotify } from "react-admin";
import { Loader } from "../../Loader";
import { Parse } from "parse";
import { checkActiveRechargeLimit } from "../../../Utils/utils";

// Initialize Parse
Parse.initialize(process.env.REACT_APP_APPID, process.env.REACT_APP_MASTER_KEY);
Parse.serverURL = process.env.REACT_APP_URL;

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
  const formRef = useRef(null);

  const resetFields = () => {
    setUserName("");
    setRechargeAmount("");
    setRemark("");
    setErrorMessage("");
    setFormInitialized(false);
    if (formRef.current) {
      formRef.current = null;
    }
  };

  useEffect(() => {
    const fetchWalletBalance = async () => {
      try {
        const walletQuery = new Parse.Query("Wallet");
        walletQuery.equalTo("userID", identity.objectId);
        const wallet = await walletQuery.first();
        if (wallet) {
          setWalletBalance(wallet.get("balance") || 0);
        }
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

  // Separate effect to initialize Finix form after modal is open
  useEffect(() => {
    if (open && !formInitialized) {
      const timer = setTimeout(() => {
        initializeFinixForm();
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [open, formInitialized]);

  // Process backend recharge after receiving token
  const processBackendRecharge = async (token, instrumentType) => {
    try {
      console.log("🔄 Step 3: Sending token to backend...");
      console.log("📤 Sending to backend:", {
        token,
        amount: rechargeAmount,
        username: userName,
        remark,
        userId: identity.objectId,
        instrumentType,
      });

      const response = await Parse.Cloud.run("processFinixRecharge", {
        token,
        amount: parseFloat(rechargeAmount),
        username: userName,
        remark,
        userId: identity.objectId,
        userParentId: identity.userParentId,
        instrumentType,
      });

      console.log("✅ Step 4: Response from backend:");
      console.log("📥 Backend response:", response);

      if (response?.success) {
        notify("Recharge successful!", { type: "success" });
        onClose();
        handleRefresh();
        resetFields();
      } else {
        setErrorMessage(response?.message || "Recharge failed. Please try again.");
      }
    } catch (error) {
      console.error("❌ Error processing recharge:", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Initialize Finix TokenForm with onSubmit callback
  const initializeFinixForm = () => {
    if (formInitialized) return;

    if (!window.Finix) {
      console.error("❌ Finix library not loaded");
      setErrorMessage("Payment library not loaded. Please refresh the page.");
      return;
    }

    const container = document.getElementById("finix-form-container");
    if (!container) {
      console.error("❌ Finix form container not found in DOM");
      setTimeout(() => {
        if (!formInitialized) {
          initializeFinixForm();
        }
      }, 200);
      return;
    }

    try {
      console.log("🔄 Initializing Finix form...");
      
      // ✅ KEY: Define onSubmit callback during initialization
      const onFinixSubmit = (...args) => {
        console.log("🎉 📞 Finix onSubmit callback triggered!");
        console.log("Number of arguments:", args.length);
        console.log("All arguments:", args);
        
        // Set loading when submission starts
        setLoading(true);
        
        // Handle different callback signatures
        const [arg1, arg2] = args;
        
        // Check if first arg is error or result
        let err, res;
        
        if (args.length === 0) {
          console.error("❌ Callback received no arguments");
          setErrorMessage("Payment form submitted but received no response. Please try again.");
          setLoading(false);
          return;
        }
        
        if (args.length === 1) {
          // Single argument - could be error or success
          if (arg1 && arg1.error) {
            err = arg1;
          } else if (arg1 && arg1.id) {
            res = arg1;
          } else {
            console.error("❌ Unknown single argument structure:", arg1);
            setErrorMessage("Payment form submitted but response format is unexpected.");
            setLoading(false);
            return;
          }
        } else {
          // Two arguments - standard err, res pattern
          err = arg1;
          res = arg2;
        }
        
        console.log("Parsed - Error:", err);
        console.log("Parsed - Response:", res);
        
        if (err) {
          console.error("❌ Finix tokenization error:", err);
          console.error("Error details:", JSON.stringify(err, null, 2));
          setErrorMessage("Payment tokenization failed. Please check your card details.");
          setLoading(false);
          return;
        }

        // Check if res exists
        if (!res) {
          console.error("❌ No response from Finix");
          console.error("This might mean:");
          console.error("1. Network request to Finix failed");
          console.error("2. Invalid Application ID");
          console.error("3. Form validation failed silently");
          setErrorMessage("Failed to process payment. Please check your card details and try again.");
          setLoading(false);
          return;
        }

        console.log("✅ Token received from Finix");
        console.log("📥 Response:", res);
        console.log("📥 Response type:", typeof res);
        console.log("📥 Response keys:", Object.keys(res || {}));

        // The response IS the token data directly (not res.data)
        const token = res.id;

        if (!token) {
          console.error("❌ No token ID found");
          console.error("Response structure:", JSON.stringify(res, null, 2));
          setErrorMessage("Failed to process payment. Please try again.");
          setLoading(false);
          return;
        }

        console.log("🎫 Token ID:", token);
        console.log("💳 Instrument Type:", res.instrument_type);

        // Send to backend
        processBackendRecharge(token, res.instrument_type);
      };
      
      const form = window.Finix.CardTokenForm("finix-form-container", {
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
        onSubmit: onFinixSubmit, // ✅ Pass callback during init
      });

      formRef.current = form;
      setFormInitialized(true);
      console.log("✅ Finix form initialized successfully");
    } catch (error) {
      console.error("❌ Error initializing Finix form:", error);
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

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    if (parseFloat(rechargeAmount) < redeemFees) {
      setErrorMessage(`Recharge amount must be at least $${redeemFees.toFixed(2)}.`);
      return;
    }

    if (parseFloat(rechargeAmount) < 10) {
      setErrorMessage("Finix transaction must be at least $10.");
      return;
    }

    const transactionCheck = await checkActiveRechargeLimit(identity.userParentId, rechargeAmount);
    if (!transactionCheck.success) {
      setErrorMessage(transactionCheck.message);
      return;
    }

    if (!formRef.current) {
      console.error("❌ Form ref is null!");
      setErrorMessage("Payment form not initialized. Please refresh and try again.");
      return;
    }

    setLoading(true);

    console.log("🔄 Step 1: Submitting Finix form...");
    console.log("📤 Data:", { amount: rechargeAmount, username: userName });

    try {
      // Call submit
      formRef.current.submit('sandbox', 'APmJRsgWpB5vkrNyJV6AAE1h');
      console.log("✅ Submit called - waiting for onSubmit callback...");
    } catch (error) {
      console.error("❌ Error calling submit:", error);
      setErrorMessage("Failed to submit form. Please try again.");
      setLoading(false);
    }
  };

  return (
    <React.Fragment>
      {loading ? (
        <Loader />
      ) : (
        <Modal
          isOpen={open}
          toggle={onClose}
          size="md"
          centered
          className="overflow-visible"
        >
          <ModalHeader toggle={onClose} className="border-bottom-0">
            Recharge with Finix
          </ModalHeader>
          <ModalBody>
            {errorMessage && (
              <Alert color="danger" className="mt-2">
                {errorMessage}
              </Alert>
            )}
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={12}>
                  <FormGroup>
                    <Label for="userName">Account</Label>
                    <Input
                      id="userName"
                      name="userName"
                      type="text"
                      value={userName}
                      required
                      disabled
                    />
                  </FormGroup>
                </Col>

                <Col md={12}>
                  <FormGroup>
                    <Label for="rechargeAmount">Recharge Amount</Label>
                    <Input
                      id="rechargeAmount"
                      name="rechargeAmount"
                      type="number"
                      autoComplete="off"
                      min="10"
                      step="0.01"
                      value={rechargeAmount}
                      onChange={(e) => setRechargeAmount(e.target.value)}
                      required
                    />
                    <small className="text-muted">
                      Minimum: ${redeemFees.toFixed(2)} | Wallet Balance: ${walletBalance.toFixed(2)}
                    </small>
                  </FormGroup>
                </Col>

                <Col md={12}>
                  <FormGroup>
                    <Label for="remark">Remark (Optional)</Label>
                    <Input
                      id="remark"
                      name="remark"
                      type="textarea"
                      value={remark}
                      onChange={(e) => setRemark(e.target.value)}
                      rows="2"
                    />
                  </FormGroup>
                </Col>

                {/* Finix Card Form Container */}
                <Col md={12}>
                  <FormGroup>
                    <Label>Card Details</Label>
                    <div
                      id="finix-form-container"
                      style={{
                        minHeight: "200px",
                        padding: "10px",
                        border: "1px solid #dee2e6",
                        borderRadius: "4px",
                      }}
                    />
                  </FormGroup>
                </Col>
              </Row>

              <div className="d-flex justify-content-end mt-3">
                <Button color="secondary" onClick={onClose} className="me-2">
                  Cancel
                </Button>
                <Button color="primary" type="submit" disabled={!formInitialized}>
                  {formInitialized ? "Process Payment" : "Loading..."}
                </Button>
              </div>
            </Form>
          </ModalBody>
        </Modal>
      )}
    </React.Fragment>
  );
};

export default FinixRechargeDialog;
