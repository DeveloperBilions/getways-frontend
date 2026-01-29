import React, { useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";
import {
  Box,
  IconButton,
  TextField,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import Close from "../../../Assets/icons/close.svg";
import AOG_Symbol from "../../../Assets/icons/AOGsymbol.png";
import Parse from "parse";

// Flow steps
const STEPS = [
  "Enter Details",
  "Processing",
  "Confirmation"
];

const FiservDisbursementDialog = ({
  open,
  onClose,
  amount,
  method, // 'paypal' or 'venmo'
  handleRefresh,
  widgetMode = false,
  widgetUserId = null,
  widgetType = null
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  // Form data
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  
  // Transaction result
  const [transactionResult, setTransactionResult] = useState(null);

  const handleClose = () => {
    // Reset state
    setActiveStep(0);
    setLoading(false);
    setError("");
    setSuccess(false);
    setEmail("");
    setPhone("");
    setFirstName("");
    setLastName("");
    setTransactionResult(null);
    onClose();
  };

  const validateForm = () => {
    if (!firstName || !lastName) {
      setError("First name and last name are required");
      return false;
    }

    if (method === 'paypal' && !email) {
      setError("Email is required for PayPal");
      return false;
    }

    if (method === 'venmo' && !phone) {
      setError("Phone number is required for Venmo");
      return false;
    }

    // Email validation
    if (method === 'paypal') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError("Please enter a valid email address");
        return false;
      }
    }

    // Phone validation
    if (method === 'venmo') {
      const phoneRegex = /^\d{3}-?\d{3}-?\d{4}$/;
      if (!phoneRegex.test(phone.replace(/\D/g, ''))) {
        setError("Please enter a valid phone number (format: 123-456-7890)");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    setError("");
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setActiveStep(1); // Move to processing step

    try {
      // Format phone number
      const formattedPhone = phone ? phone.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3') : '';

      // Call Fiserv DDP API through Parse Cloud Function
      console.log('📡 Calling Fiserv Digital Disbursements API...');
      console.log(`   Method: ${method.toUpperCase()}`);
      console.log(`   Amount: $${amount}`);
      
      // In widget mode, use useMasterKey and pass userId/type
      const cloudOptions = widgetMode ? { useMasterKey: true } : { sessionToken: Parse.User.current().getSessionToken() };
      
      const params = {
        amount: parseFloat(amount),
        paymentMethod: method,
        email: email || undefined,
        phone: formattedPhone || undefined,
        userData: {
          firstName,
          lastName,
          email: email || undefined,
          phone: formattedPhone || undefined
        }
      };

      // Add widget parameters if in widget mode
      if (widgetMode) {
        params.type = widgetType;
        params.userId = widgetUserId;
      }

      const result = await Parse.Cloud.run("fiservDDP_cashout", params, cloudOptions);

      console.log('✅ Cashout successful:', result);
      
      setTransactionResult(result);
      setSuccess(true);
      setActiveStep(2); // Move to confirmation step
      
      // Refresh balance after successful cashout
      if (handleRefresh) {
        setTimeout(() => handleRefresh(), 1000);
      }

      // If in widget mode, notify parent window
      if (widgetMode) {
        window.parent.postMessage({ type: 'CASHOUT_SUCCESS', data: result }, '*');
      }
    } catch (err) {
      console.error('❌ Cashout failed:', err);
      setError(err.message || "Failed to process cashout. Please try again.");
      setActiveStep(0); // Go back to form
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        // Step 1: Enter Details
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 3, textAlign: "center" }}>
              {method === 'paypal' ? 'PayPal' : 'Venmo'} Cashout
            </Typography>

            <Box sx={{ mb: 3, p: 2, bgcolor: "#F4F3FC", borderRadius: 1 }}>
              <Typography sx={{ fontSize: 14, color: "#666", mb: 1 }}>
                Cashout Amount
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <img src={AOG_Symbol} alt="Coin" style={{ width: 24, height: 24, marginRight: 8 }} />
                <Typography sx={{ fontSize: 24, fontWeight: 600 }}>
                  ${amount}
                </Typography>
              </Box>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
              <TextField
                fullWidth
                label="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
              <TextField
                fullWidth
                label="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </Box>

            {method === 'paypal' && (
              <TextField
                fullWidth
                label="PayPal Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your-email@example.com"
                required
                sx={{ mb: 2 }}
              />
            )}

            {method === 'venmo' && (
              <TextField
                fullWidth
                label="Venmo Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="123-456-7890"
                required
                sx={{ mb: 2 }}
              />
            )}

            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Step 1:</strong> We'll create a recipient profile<br />
                <strong>Step 2:</strong> Process your {method === 'paypal' ? 'PayPal' : 'Venmo'} disbursement
              </Typography>
            </Alert>
          </Box>
        );

      case 1:
        // Step 2: Processing
        return (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <CircularProgress size={60} sx={{ mb: 3 }} />
            <Typography variant="h6" sx={{ mb: 2 }}>
              Processing Your Cashout...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Creating recipient and processing payment through Fiserv Digital Disbursements
            </Typography>
            <Box sx={{ mt: 3, p: 2, bgcolor: "#F4F3FC", borderRadius: 1 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                ✅ Step 1: Creating Recipient Profile
              </Typography>
              <Typography variant="body2">
                ⏳ Step 2: Processing {method === 'paypal' ? 'PayPal' : 'Venmo'} Payment
              </Typography>
            </Box>
          </Box>
        );

      case 2:
        // Step 3: Confirmation
        return (
          <Box sx={{ textAlign: "center", py: 2 }}>
            <Box sx={{ 
              width: 80, 
              height: 80, 
              borderRadius: "50%", 
              bgcolor: "#4CAF50", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              margin: "0 auto 20px"
            }}>
              <Typography sx={{ fontSize: 48, color: "white" }}>✓</Typography>
            </Box>

            <Typography variant="h5" sx={{ mb: 2, color: "#4CAF50" }}>
              Cashout Successful!
            </Typography>

            <Box sx={{ mb: 3, p: 2, bgcolor: "#F4F3FC", borderRadius: 1, textAlign: "left" }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Transaction ID:</strong> {transactionResult?.merchantTransactionId}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Amount:</strong> ${amount}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Method:</strong> {method === 'paypal' ? 'PayPal' : 'Venmo'}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Status:</strong> {transactionResult?.status || 'Pending'}
              </Typography>
              {transactionResult?.fiservTransactionId && (
                <Typography variant="body2">
                  <strong>Fiserv Transaction ID:</strong> {transactionResult.fiservTransactionId}
                </Typography>
              )}
            </Box>

            <Alert severity="success" sx={{ mb: 2 }}>
              <Typography variant="body2">
                ✅ Step 1 Complete: Recipient Created<br />
                ✅ Step 2 Complete: Payment Processed<br />
                Your funds will be transferred to your {method === 'paypal' ? 'PayPal' : 'Venmo'} account shortly.
              </Typography>
            </Alert>

            {transactionResult?.portalUrl && (
              <Alert severity="info">
                <Typography variant="body2">
                  You can track your payment status at:<br />
                  <a href={transactionResult.portalUrl} target="_blank" rel="noopener noreferrer">
                    {transactionResult.portalUrl}
                  </a>
                </Typography>
              </Alert>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Modal isOpen={open} toggle={handleClose} centered size="md">
      <Box sx={{ borderRadius: "8px", border: "1px solid #E7E7E7", backgroundColor: "#FFFFFF" }}>
        <ModalHeader
          toggle={handleClose}
          className="border-bottom-0 pb-0"
          close={
            <IconButton
              onClick={handleClose}
              sx={{ position: "absolute", right: "16px", top: "16px" }}
            >
              <img src={Close} alt="close" width="24px" height="24px" />
            </IconButton>
          }
        >
          Fiserv Digital Disbursements
        </ModalHeader>

        <ModalBody>
          <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
            {STEPS.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {renderStepContent()}
        </ModalBody>

        <ModalFooter>
          <Box sx={{ display: "flex", width: "100%", justifyContent: "space-between", gap: 2 }}>
            <Button onClick={handleClose} disabled={loading}>
              {success ? "Close" : "Cancel"}
            </Button>
            
            {activeStep === 0 && (
              <Button 
                variant="contained" 
                onClick={handleSubmit}
                disabled={loading}
              >
                Submit Cashout
              </Button>
            )}
          </Box>
        </ModalFooter>
      </Box>
    </Modal>
  );
};

export default FiservDisbursementDialog;
