// import React, { useState, useEffect } from "react";
// import {
//   Button,
//   Modal,
//   ModalHeader,
//   ModalBody,
//   Row,
//   Col,
//   FormGroup,
//   Label,
//   Form,
//   Input,
//   FormText,
//   Alert,
// } from "reactstrap";
// import { Loader } from "../../Loader";
// import { Parse } from "parse";
// import { walletService } from "../../../Provider/WalletManagement";
// import { validatePositiveNumber } from "../../../Validators/number.validator";

// Parse.initialize(process.env.REACT_APP_APPID, process.env.REACT_APP_MASTER_KEY);
// Parse.serverURL = process.env.REACT_APP_URL;

// const PlayerRedeemDialog = ({ open, onClose, record, handleRefresh }) => {
//   const [userName, setUserName] = useState("");
//   const [redeemAmount, setRedeemAmount] = useState("");
//   const [redeemFees, setRedeemFees] = useState("");
//   const [remark, setRemark] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [walletId, setWalletId] = useState("");
//   const [paymentMethods, setPaymentMethods] = useState({
//     cashAppId: "",
//     paypalId: "",
//     venmoId: "",
//     zelleId: "",
//   });
//   const [showAddPaymentMethodDialog, setShowAddPaymentMethodDialog] =
//     useState(false);
//   const [showWarningModal, setShowWarningModal] = useState(false);
//   const [warningMessage, setWarningMessage] = useState("");
//   const [errorMessage, setErrorMessage] = useState("");
//   const [savingPaymentMethod, setSavingPaymentMethod] = useState(false); // Add this state
//   const [errorAddPayment, setErrorAddPayment] = useState("");
//   const resetFields = () => {
//     setUserName("");
//     setRedeemAmount("");
//     setRemark("");
//     setWarningMessage("");
//     setErrorMessage("");
//   };

//   const parentServiceFee = async () => {
//     try {
//       const response = await Parse.Cloud.run("redeemParentServiceFee", {
//         userId: record?.userParentId,
//       });
//       setRedeemFees(response?.redeemService || 0);
//     } catch (error) {
//       console.error("Error fetching parent service fee:", error);
//     }
//   };

//   useEffect(() => {
//     if (record && open) {
//       parentServiceFee();
//       setUserName(record.username || "");
//     } else {
//       resetFields();
//     }
//   }, [record, open]);

//   useEffect(() => {
//     async function WalletService() {
//       const wallet = await walletService.getMyWalletData();
//       const { cashAppId, paypalId, venmoId, objectId } = wallet?.wallet;
//       setPaymentMethods({ cashAppId, paypalId, venmoId });
//       setWalletId(objectId);
//     }

//     if (open) {
//       WalletService();
//     }
//   }, [open]);

//   const handleConfirm = () => {
//     const { cashAppId, paypalId, venmoId } = paymentMethods;
//     const methodCount = [cashAppId, paypalId, venmoId].filter(Boolean).length;

//     if (methodCount === 0) {
//       setWarningMessage(
//         "No payment methods are added. Please add a payment method to proceed."
//       );
//       setShowWarningModal(true);
//     }

//     // else if (methodCount > 0 && methodCount < 3) {
//     //   setWarningMessage(
//     //     `You have ${methodCount} payment mode${
//     //       methodCount > 1 ? "s" : ""
//     //     } added for refunds. Would you like to add/edit the payment method?`
//     //   );
//     //   setShowWarningModal(true);
//     // }
//     else {
//       handleSubmit(); // Call handleSubmit directly if 3 payment methods are already added
//     }
//   };

//   const handleSubmit = async () => {
//     const { cashAppId, paypalId, venmoId, zelleId } = paymentMethods;
//     if (!cashAppId && !paypalId && !venmoId && !zelleId) {
//       setErrorMessage("Refund cannot be processed without a payment mode.");
//       return;
//     }

//     const validationResponse = validatePositiveNumber(redeemAmount);
//     if (!validationResponse.isValid) {
//       setErrorMessage(validationResponse.error);
//       return;
//     }
//     // if (redeemAmount <= 0) {
//     //   setErrorMessage(
//     //     "RedeemAmount amount cannot be negative or 0. Please enter a valid amount."
//     //   );
//     //   return;
//     // }

//     if (redeemAmount < 15) {
//       setErrorMessage("RedeemAmount amount cannot be less than 15.");
//       return;
//     }
//     const rawData = {
//       ...record,
//       redeemServiceFee: redeemFees,
//       transactionAmount: redeemAmount,
//       remark,
//       type: "redeem",
//       walletId: walletId,
//     };

//     setLoading(true);
//     try {
//       const response = await Parse.Cloud.run("playerRedeemRedords", rawData);
//       if (response?.status === "error") {
//         setErrorMessage(response?.message);
//       } else {
//         onClose();
//         setRedeemAmount("");
//         setRemark("");
//         handleRefresh();
//       }
//     } catch (error) {
//       console.error("Error Redeem Record details:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAddPaymentMethod = async (newMethods) => {
//     try {
//       const trimmedMethods = {
//         cashAppId: paymentMethods?.cashAppId?.trim() || "",
//         venmoId: paymentMethods?.venmoId?.trim() || "",
//         paypalId: paymentMethods?.paypalId?.trim() || "",
//         zelleId: paymentMethods?.zelleId?.trim() || "",
//       };
//       if (
//         (!paymentMethods?.cashAppId?.trim() ||
//           paymentMethods?.cashAppId?.trim() === "") &&
//         (!paymentMethods?.venmoId?.trim() ||
//           paymentMethods?.venmoId?.trim() === "") &&
//         (!paymentMethods?.paypalId?.trim() ||
//           paymentMethods?.paypalId?.trim() === "") &&
//         (!paymentMethods?.zelleId?.trim() ||
//           paymentMethods?.zelleId?.trim() === "")
//       ) {
//         setErrorAddPayment("Add at least one valid payment method.");
//         return false;
//       }
//       if (
//         paymentMethods?.cashAppId?.trim() &&
//         !/^(?=.*[a-zA-Z]).{1,20}$/.test(paymentMethods?.cashAppId.trim())
//       ) {
//         setErrorAddPayment(
//           "CashApp ID must include at least 1 letter and be no longer than 20 characters."
//         );
//         return false;
//       }
//       if (
//         paymentMethods?.venmoId?.trim() &&
//         !/^[a-zA-Z0-9]+$/.test(paymentMethods?.venmoId.trim())
//       ) {
//         setErrorAddPayment(
//           "Venmo ID can only contain letters and numbers (no symbols, dashes, or spaces)."
//         );
//         return false;
//       }
//       setErrorAddPayment("");
//       setSavingPaymentMethod(true); // Start loader
//       await walletService.updatePaymentMethods(trimmedMethods);
//       setPaymentMethods(newMethods);
//       setShowAddPaymentMethodDialog(false);
//       setShowWarningModal(false);
//       handleSubmit(); // Automatically call handleSubmit after adding payment methods
//     } catch (error) {
//       console.error("Error updating payment methods:", error);
//       setErrorAddPayment(
//         error.message || "Failed to update payment methods. Please try again."
//       );
//     } finally {
//       setSavingPaymentMethod(false); // Stop loader
//     }
//   };
//   return (
//     <React.Fragment>
//       {loading ? (
//         <Loader />
//       ) : (
//         <Modal isOpen={open} toggle={onClose} size="md" centered>
//           <ModalHeader toggle={onClose} className="border-bottom-0 pb-0">
//             Redeem Request Amount
//           </ModalHeader>
//           <ModalBody>
//             <FormText className="font-weight-bold">
//               Redeems may take up to 2 hours
//             </FormText>
//             {errorMessage && (
//               <Alert color="danger" className="mt-2">
//                 {errorMessage}
//               </Alert>
//             )}
//             <Form>
//               <Row>
//                 <Col md={12}>
//                   <FormGroup>
//                     <Label for="userName">Account</Label>
//                     <Input
//                       id="userName"
//                       name="userName"
//                       type="text"
//                       value={userName}
//                       required
//                       disabled
//                     />
//                   </FormGroup>
//                 </Col>

//                 <Col md={12}>
//                   <FormGroup>
//                     <Label for="redeemAmount">Redeem Amount</Label>
//                     <Input
//                       id="redeemAmount"
//                       name="redeemAmount"
//                       type="text"
//                       autoComplete="off"
//                       min="1"
//                       value={redeemAmount}
//                       onChange={(e) => {
//                         let value = e.target.value;
//                         if (value === "" || /^\d*$/.test(value)) {
//                           if (value === "") {
//                             setRedeemAmount(value);
//                           } else if (value.includes(".")) {
//                             value = Math.floor(parseFloat(value));
//                             setRedeemAmount(value);
//                           } else if (/^\d*$/.test(value)) {
//                             setRedeemAmount(value);
//                           }
//                         }
//                       }}
//                       required
//                       onKeyDown={(e) => {
//                         if (e.keyCode === 190) {
//                           // Prevent the default behavior of typing a decimal
//                           e.preventDefault();
//                         }
//                       }}
//                     />
//                   </FormGroup>
//                 </Col>

//                 <p className="mb-0">
//                   <small>Redeem Service Fee @ {redeemFees}%</small>
//                 </p>
//                 {redeemFees > 0 && (
//                   <p className="mb-1">
//                     <small>
//                       Total amount to be redeemed = $
//                       {Math.floor(
//                         redeemAmount - redeemAmount * (redeemFees / 100)
//                       ) || 0}
//                     </small>
//                   </p>
//                 )}

//                 <Col md={12}>
//                   <FormGroup>
//                     <Label for="remark">Remark</Label>
//                     <Input
//                       id="remark"
//                       name="remark"
//                       type="textarea"
//                       autoComplete="off"
//                       maxLength={30}
//                       onChange={(e) => setRemark(e.target.value)}
//                     />
//                   </FormGroup>
//                 </Col>

//                 <Col md={12}>
//                   <div className="d-flex justify-content-end">
//                     <Button
//                       color="success"
//                       className="mx-2"
//                       onClick={handleConfirm}
//                       disabled={loading}
//                     >
//                       {loading ? "Processing..." : "Confirm"}
//                     </Button>
//                     <Button color="secondary" onClick={onClose}>
//                       Cancel
//                     </Button>
//                   </div>
//                 </Col>
//               </Row>
//             </Form>
//           </ModalBody>
//         </Modal>
//       )}

//       {/* Warning Modal */}
//       <Modal
//         isOpen={showWarningModal}
//         toggle={() => {
//           if (
//             paymentMethods.cashAppId ||
//             paymentMethods.paypalId ||
//             paymentMethods.venmoId
//           ) {
//             setShowWarningModal(false);
//           } else {
//             setErrorMessage(
//               "Refund cannot be processed without a payment mode."
//             );
//             setShowWarningModal(false);
//           }
//         }}
//         size="md"
//         centered
//       >
//         <ModalHeader toggle={() => setShowWarningModal(false)}>
//           Attention
//         </ModalHeader>
//         <ModalBody>
//           <p>{warningMessage}</p>
//           <div className="d-flex justify-content-end">
//             {paymentMethods.cashAppId ||
//             paymentMethods.paypalId ||
//             paymentMethods.venmoId ? (
//               <Button
//                 color="primary"
//                 onClick={() => {
//                   setShowWarningModal(false);
//                   handleSubmit();
//                 }}
//               >
//                 No, Continue
//               </Button>
//             ) : null}
//             <Button
//               color="primary"
//               className="ms-2"
//               onClick={() => {
//                 setShowAddPaymentMethodDialog(true);
//                 setShowWarningModal(false);
//               }}
//             >
//               Add/Edit Payment Method
//             </Button>
//             <Button
//               color="secondary"
//               className="ms-2"
//               onClick={() => {
//                 setShowWarningModal(false);
//                 handleSubmit();
//               }}
//             >
//               Close
//             </Button>
//           </div>
//         </ModalBody>
//       </Modal>

//       {/* Add Payment Method Modal */}
//       <Modal
//         isOpen={showAddPaymentMethodDialog}
//         toggle={() => setShowAddPaymentMethodDialog(false)}
//         size="md"
//         centered
//       >
//         <ModalHeader>Add/Edit Payment Method</ModalHeader>
//         <ModalBody>
//           <Form
//             onSubmit={(e) => {
//               e.preventDefault();
//               handleAddPaymentMethod(paymentMethods);
//             }}
//           >
//             {errorAddPayment && (
//               <Alert color="danger" className="mt-2">
//                 {errorAddPayment}
//               </Alert>
//             )}
//             <Row>
//               <Col md={12}>
//                 <FormGroup>
//                   <Label for="cashAppId">CashApp ID</Label>
//                   <Input
//                     id="cashAppId"
//                     name="cashAppId"
//                     type="text"
//                     value={paymentMethods.cashAppId}
//                     onChange={(e) =>
//                       setPaymentMethods({
//                         ...paymentMethods,
//                         cashAppId: e.target.value,
//                       })
//                     }
//                   />
//                 </FormGroup>
//               </Col>
//               <Col md={12}>
//                 <FormGroup>
//                   <Label for="paypalId">PayPal ID</Label>
//                   <Input
//                     id="paypalId"
//                     name="paypalId"
//                     type="text"
//                     value={paymentMethods.paypalId}
//                     onChange={(e) =>
//                       setPaymentMethods({
//                         ...paymentMethods,
//                         paypalId: e.target.value,
//                       })
//                     }
//                   />
//                 </FormGroup>
//               </Col>
//               <Col md={12}>
//                 <FormGroup>
//                   <Label for="venmoId">Venmo ID</Label>
//                   <Input
//                     id="venmoId"
//                     name="venmoId"
//                     type="text"
//                     value={paymentMethods.venmoId}
//                     onChange={(e) =>
//                       setPaymentMethods({
//                         ...paymentMethods,
//                         venmoId: e.target.value,
//                       })
//                     }
//                   />
//                 </FormGroup>
//               </Col>
//               <Col md={12}>
//                 <FormGroup>
//                   <Label for="zelleId">Zelle ID</Label>
//                   <Input
//                     id="zelleId"
//                     name="zelleId"
//                     type="text"
//                     value={paymentMethods.zelleId}
//                     onChange={(e) =>
//                       setPaymentMethods({
//                         ...paymentMethods,
//                         zelleId: e.target.value,
//                       })
//                     }
//                   />
//                 </FormGroup>
//               </Col>
//               <Col md={12} className="d-flex justify-content-end">
//                 <Button
//                   color="primary"
//                   type="submit"
//                   disabled={savingPaymentMethod}
//                 >
//                   {savingPaymentMethod
//                     ? " Saving ..." // Use your custom Loader component
//                     : "Save"}
//                 </Button>
//               </Col>
//             </Row>
//           </Form>
//         </ModalBody>
//       </Modal>
//     </React.Fragment>
//   );
// };

// export default PlayerRedeemDialog;


import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Alert,
  Modal,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Modal as ReactstrapModal, ModalHeader, ModalBody, Row, Col, FormGroup, Label, Form, Input, FormText } from "reactstrap";
import { Loader } from "../../Loader";
import { Parse } from "parse";
import { walletService } from "../../../Provider/WalletManagement";
import { validatePositiveNumber } from "../../../Validators/number.validator";
import useDeviceType from "../../../Utils/Hooks/useDeviceType";
import { useNotify } from "react-admin";

Parse.initialize(process.env.REACT_APP_APPID, process.env.REACT_APP_MASTER_KEY);
Parse.serverURL = process.env.REACT_APP_URL;

const PlayerRedeemDialog = ({ 
  open, 
  onClose, 
  record, 
  handleRefresh, 
  redeemAmount: initialRedeemAmount, 
  remark: initialRemark 
}) => {
  const { isMobile } = useDeviceType();
  const notify = useNotify();
  const [redeemAmount, setRedeemAmount] = useState(initialRedeemAmount || "");
  const [redeemFees, setRedeemFees] = useState("");
  const [remark, setRemark] = useState(initialRemark || "");
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(false);
  const [walletId, setWalletId] = useState("");
  const [paymentMethods, setPaymentMethods] = useState({
    cashAppId: "",
    paypalId: "",
    venmoId: "",
    zelleId: "",
  });
  const [showAddPaymentMethodDialog, setShowAddPaymentMethodDialog] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [savingPaymentMethod, setSavingPaymentMethod] = useState(false);
  const [errorAddPayment, setErrorAddPayment] = useState("");

  const resetFields = () => {
    setUserName("");
    setRedeemAmount(initialRedeemAmount || "");
    setRemark(initialRemark || "");
    setWarningMessage("");
    setErrorMessage("");
    setSuccessMessage("");
  };

  const parentServiceFee = async () => {
    try {
      const response = await Parse.Cloud.run("redeemParentServiceFee", {
        userId: record?.userParentId,
      });
      setRedeemFees(response?.redeemService || 0);
    } catch (error) {
      console.error("Error fetching parent service fee:", error);
    }
  };

  useEffect(() => {
    if (record && open) {
      parentServiceFee();
      setUserName(record.username || "");
      setRedeemAmount(initialRedeemAmount || "");
      setRemark(initialRemark || "");
    } else {
      resetFields();
    }
  }, [record, open, initialRedeemAmount, initialRemark]);

  useEffect(() => {
    async function WalletService() {
      const wallet = await walletService.getMyWalletData();
      const { cashAppId, paypalId, venmoId, objectId } = wallet?.wallet || {};
      setPaymentMethods({ cashAppId, paypalId, venmoId });
      setWalletId(objectId);
    }

    if (open) {
      WalletService();
    }
  }, [open]);

  const handleConfirm = () => {
    const { cashAppId, paypalId, venmoId } = paymentMethods;
    const methodCount = [cashAppId, paypalId, venmoId].filter(Boolean).length;

    if (methodCount === 0) {
      setWarningMessage(
        "No payment methods are added. Please add a payment method to proceed."
      );
      setShowWarningModal(true);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    const { cashAppId, paypalId, venmoId, zelleId } = paymentMethods;
    if (!cashAppId && !paypalId && !venmoId && !zelleId) {
      setErrorMessage("Refund cannot be processed without a payment mode.");
      return;
    }

    const validationResponse = validatePositiveNumber(redeemAmount);
    if (!validationResponse.isValid) {
      setErrorMessage(validationResponse.error);
      return;
    }

    if (redeemAmount < 15) {
      setErrorMessage("Redeem amount cannot be less than 15.");
      return;
    }

    const rawData = {
      ...record,
      redeemServiceFee: redeemFees,
      transactionAmount: redeemAmount,
      remark,
      type: "redeem",
      walletId: walletId,
    };

    setLoading(true);
    try {
      const response = await Parse.Cloud.run("playerRedeemRedords", rawData);
      if (response?.status === "error") {
        setErrorMessage(response?.message);
      } else {
        // Updated success message format
        setSuccessMessage(`Redeem Successful!\nAmount: ${redeemAmount}`);
        notify("Redeem Successful!",{
          type: "success",
        });
        setTimeout(() => {
          onClose();
          handleRefresh();
        }, 2000);
      }
    } catch (error) {
      console.error("Error Redeem Record details:", error);
      setErrorMessage("An error occurred while processing your request.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddPaymentMethod = async (newMethods) => {
    try {
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
        setErrorAddPayment("Add at least one valid payment method.");
        return false;
      }
      if (
        paymentMethods?.cashAppId?.trim() &&
        !/^(?=.*[a-zA-Z]).{1,20}$/.test(paymentMethods?.cashAppId.trim())
      ) {
        setErrorAddPayment(
          "CashApp ID must include at least 1 letter and be no longer than 20 characters."
        );
        return false;
      }
      if (
        paymentMethods?.venmoId?.trim() &&
        !/^[a-zA-Z0-9]+$/.test(paymentMethods?.venmoId.trim())
      ) {
        setErrorAddPayment(
          "Venmo ID can only contain letters and numbers (no symbols, dashes, or spaces)."
        );
        return false;
      }
      setErrorAddPayment("");
      setSavingPaymentMethod(true);
      await walletService.updatePaymentMethods(trimmedMethods);
      setPaymentMethods(newMethods);
      setShowAddPaymentMethodDialog(false);
      setShowWarningModal(false);
      handleSubmit();
    } catch (error) {
      console.error("Error updating payment methods:", error);
      setErrorAddPayment(
        error.message || "Failed to update payment methods. Please try again."
      );
    } finally {
      setSavingPaymentMethod(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <React.Fragment>
      {/* Main Modal */}
      <Modal
        open={open}
        onClose={onClose}
        aria-labelledby="redeem-modal"
        aria-describedby="redeem-confirmation"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: isMobile ? "90%" : 500,
            height: isMobile ? "auto" : "auto",
            gap: "24px",
            borderRadius: "8px",
            border: "1px solid #E7E7E7",
            padding: "24px",
            backgroundColor: "#FFFFFF",
            boxShadow:
              "4px 4px 16px 0px rgba(255, 255, 255, 0.25), -4px -4px 16px 0px rgba(255, 255, 255, 0.25)",
            outline: "none",
          }}
        >
          {/* Modal Title */}
          {!successMessage && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: isMobile ? "0 0 12px 0" : "0 0 16px 0",
                borderBottom: "none",
              }}
            >
              <Typography
                sx={{
                  fontFamily: "Inter",
                  fontWeight: 600,
                  fontSize: isMobile ? "18px" : "20px",
                  color: "#000000",
                }}
              >
                Confirm Redeem
              </Typography>
              <IconButton onClick={onClose} size="small">
                <CloseIcon
                  sx={{
                    fontSize: isMobile ? "22px" : "24px",
                    color: "#333333",
                  }}
                />
              </IconButton>
            </Box>
          )}

          {/* Modal Content */}
          {successMessage ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "100px",
                textAlign: "center",
                padding: isMobile ? "16px 0" : "24px 0",
              }}
            >
              <Typography
                sx={{
                  fontFamily: "Inter",
                  fontWeight: 500,
                  fontSize: isMobile ? "16px" : "18px",
                  color: "#028B30", // Corrected to a valid hex color code
                  marginBottom: "8px",
                  whiteSpace: "pre-line", // This can be removed since there's no line break needed
                }}
              >
                Redeem Successful!
              </Typography>
              <Typography
                sx={{
                  fontFamily: "Inter",
                  fontWeight: 500,
                  fontSize: isMobile ? "16px" : "18px",
                  color: "#333333",
                }}
              >
                Amount: {redeemAmount}
              </Typography>
            </Box>
          ) : (
            <>
              <Box
                sx={{
                  padding: isMobile ? "0 0 24px 0" : "0 0 32px 0",
                }}
              >
                {errorMessage && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {errorMessage}
                  </Alert>
                )}

                <Typography
                  sx={{
                    fontFamily: "Inter",
                    fontWeight: 400,
                    fontSize: isMobile ? "16px" : "18px",
                    color: "#333333",
                    lineHeight: "24px",
                    wordBreak: "break-word",
                  }}
                >
                  Are you sure you want to proceed with the redeem of $
                  {redeemAmount}?
                </Typography>
              </Box>

              {/* Modal Actions */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "12px",
                }}
              >
                <Button
                  onClick={onClose}
                  sx={{
                    width: "48%",
                    height: isMobile ? "44px" : "48px",
                    borderRadius: "8px",
                    border: "1px solid var(--primary-color)",
                    backgroundColor: "#FFFFFF",
                    color: "var(--primary-color)",
                    fontFamily: "Inter",
                    fontWeight: 500,
                    fontSize: isMobile ? "14px" : "16px",
                    textTransform: "none",
                    "&:hover": {
                      backgroundColor: "#F9FAFB",
                    },
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirm}
                  sx={{
                    width: "48%",
                    height: isMobile ? "44px" : "48px",
                    borderRadius: "8px",
                    backgroundColor: "#2563EB",
                    color: "#FFFFFF",
                    fontFamily: "Inter",
                    fontWeight: 500,
                    fontSize: isMobile ? "14px" : "16px",
                    textTransform: "none",
                    "&:hover": {
                      backgroundColor: "#1D4ED8",
                    },
                  }}
                >
                  Confirm
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Modal>

      {/* Warning Modal (unchanged) */}
      <ReactstrapModal
        isOpen={showWarningModal}
        toggle={() => {
          if (
            paymentMethods.cashAppId ||
            paymentMethods.paypalId ||
            paymentMethods.venmoId
          ) {
            setShowWarningModal(false);
          } else {
            setErrorMessage(
              "Refund cannot be processed without a payment mode."
            );
            setShowWarningModal(false);
          }
        }}
        size="md"
        centered
      >
        <ModalHeader toggle={() => setShowWarningModal(false)}>
          Attention
        </ModalHeader>
        <ModalBody>
          <p>{warningMessage}</p>
          <div className="d-flex justify-content-end">
            {paymentMethods.cashAppId ||
            paymentMethods.paypalId ||
            paymentMethods.venmoId ? (
              <Button
                color="primary"
                onClick={() => {
                  setShowWarningModal(false);
                  handleSubmit();
                }}
              >
                No, Continue
              </Button>
            ) : null}
            <Button
              color="primary"
              className="ms-2"
              onClick={() => {
                setShowAddPaymentMethodDialog(true);
                setShowWarningModal(false);
              }}
            >
              Add/Edit Payment Method
            </Button>
            <Button
              color="secondary"
              className="ms-2"
              onClick={() => {
                setShowWarningModal(false);
                handleSubmit();
              }}
            >
              Close
            </Button>
          </div>
        </ModalBody>
      </ReactstrapModal>

      {/* Add Payment Method Modal (unchanged) */}
      <ReactstrapModal
        isOpen={showAddPaymentMethodDialog}
        toggle={() => setShowAddPaymentMethodDialog(false)}
        size="md"
        centered
      >
        <ModalHeader>Add/Edit Payment Method</ModalHeader>
        <ModalBody>
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              handleAddPaymentMethod(paymentMethods);
            }}
          >
            {errorAddPayment && (
              <Alert color="danger" className="mt-2">
                {errorAddPayment}
              </Alert>
            )}
            <Row>
              <Col md={12}>
                <FormGroup>
                  <Label for="cashAppId">CashApp ID</Label>
                  <Input
                    id="cashAppId"
                    name="cashAppId"
                    type="text"
                    value={paymentMethods.cashAppId}
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
                    value={paymentMethods.paypalId}
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
                    value={paymentMethods.venmoId}
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
                <Button
                  color="primary"
                  type="submit"
                  disabled={savingPaymentMethod}
                >
                  {savingPaymentMethod ? "Saving..." : "Save"}
                </Button>
              </Col>
            </Row>
          </Form>
        </ModalBody>
      </ReactstrapModal>
    </React.Fragment>
  );
};

export default PlayerRedeemDialog;