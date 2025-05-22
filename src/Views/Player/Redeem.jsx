import React, { useEffect, useState } from "react";
import { Box, Typography, Button, TextField, Alert } from "@mui/material";
import AOG_Symbol from "../../Assets/icons/AOGsymbol.png";
import { useGetIdentity, useNotify, useRefresh } from "react-admin";
import RedeemDialog from "./dialog/PlayerRedeemDialog";
import { Parse } from "parse";
import TransactionRecords from "./TransactionRecords";
import { Loader } from "../Loader";
import { validatePositiveNumber } from "../../Validators/number.validator";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import {
  Col,
  Form,
  FormGroup,
  Input,
  Label,
  ModalBody,
  ModalHeader,
  Modal as ReactstrapModal,
  Row,
} from "reactstrap";
import { walletService } from "../../Provider/WalletManagement";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { getTotalRechargeAmount } from "../../Utils/utils";

Parse.initialize(process.env.REACT_APP_APPID, process.env.REACT_APP_MASTER_KEY);
Parse.serverURL = process.env.REACT_APP_URL;

const Redeem = ({
  data,
  totalData,
  wallet,
  handleRedeemRefresh,
  redeemFees,
  totalRechargeData,
}) => {
  const [isRedeemDisabled, setIsRedeemDisabled] = useState(true);
  const [redeemAmount, setRedeemAmount] = useState(50);
  const { identity } = useGetIdentity();
  const [loading, setLoading] = useState(false);
  const notify = useNotify();
  const [showRedeemConfirmDialog, setShowRedeemConfirmDialog] = useState(false);
  const [redeemDialogOpen, setRedeemDialogOpen] = useState(false);
  const [liveRechargeTotal, setLiveRechargeTotal] = useState(0);
  const refresh = useRefresh();
  const [remark, setRemark] = useState("");
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [errorAddPayment, setErrorAddPayment] = useState("");
  const [showAddPaymentMethodDialog, setShowAddPaymentMethodDialog] =
    useState(false);
  const [savingPaymentMethod, setSavingPaymentMethod] = useState(false);
  const [walletId, setWalletId] = useState("");
  const [paymentMethods, setPaymentMethods] = useState({
    cashAppId: "",
    paypalId: "",
    venmoId: "",
    zelleId: "",
  });

  const resetFields = () => {
    setRedeemAmount(50);
    setRemark("");
  };
  useEffect(() => {
    if (wallet) {
      const { cashAppId, paypalId, venmoId, objectId } = wallet;
      setPaymentMethods({ cashAppId, paypalId, venmoId });
      setWalletId(objectId);
    }
  }, [wallet]);

  useEffect(() => {
  const fetchRechargeTotal = async () => {
    try {
      if (identity?.objectId) {
        const total = await getTotalRechargeAmount(identity.objectId);
        setLiveRechargeTotal(total);
        if (total <= 0) {
          setIsRedeemDisabled(true);
        } else {
          setIsRedeemDisabled(false);
        }
      }
    } catch (error) {
      console.error("Failed to fetch total recharge amount:", error);
      setIsRedeemDisabled(true); // Disable in case of error
    }
  };

  fetchRechargeTotal();
}, [identity]);

  const transformedIdentity = {
    id: identity?.objectId,
    ...identity,
  };

  const handleRefresh = async () => {
    refresh();
    handleRedeemRefresh();
  };

  const handleConfirm = async () => {
    const { cashAppId, paypalId, venmoId } = paymentMethods;
    const methodCount = [cashAppId, paypalId, venmoId].filter(Boolean).length;
  
    if (methodCount === 0) {
      notify(
        "No payment methods are added. Please add a payment method to proceed.",
        {
          type: "warning",
          anchorOrigin: { vertical: "top", horizontal: "right" },
        }
      );
      setShowWarningModal(true);
      return;
    }
  else{
    handleConfirmDoublee()
  }
  };
  const handleConfirmDoublee = async () => {
    try {
      const total = await getTotalRechargeAmount(identity?.objectId);
      setLiveRechargeTotal(total);
      if (redeemAmount > total * 0.5) {
        setShowRedeemConfirmDialog(true); // open MUI dialog
      } else {
        handleSubmit();
      }
    } catch (error) {
      console.error("Failed to fetch recharge total", error);
      notify("Unable to validate redeem limit at the moment.", {
        type: "error",
      });
    }
  }

  const handleSubmit = async () => {
    const { cashAppId, paypalId, venmoId, zelleId } = paymentMethods;
    if (!cashAppId && !paypalId && !venmoId && !zelleId) {
      // setErrorMessage("Refund cannot be processed without a payment mode.");
      notify("Refund cannot be processed without a payment mode.", {
        type: "error",
      });
      return;
    }

    const validationResponse = validatePositiveNumber(redeemAmount);
    if (!validationResponse.isValid) {
      // setErrorMessage(validationResponse.error);
      notify(validationResponse.error, {
        type: "error",
      });
      return;
    }

    if (redeemAmount < 15) {
      // setErrorMessage("RedeemAmount amount cannot be less than 15.");
      notify("RedeemAmount amount cannot be less than 15.", {
        type: "error",
      });
      return;
    }
    const rawData = {
      ...transformedIdentity,
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
        // setErrorMessage(response?.message);
        notify(response?.message, {
          type: "error",
        });
      } else {
        notify(`Redeem Successful! Amount: ${redeemAmount}`, {
          type: "success",
          anchorOrigin: { vertical: "top", horizontal: "right" },
        });
        resetFields();
        handleRefresh();
      }
    } catch (error) {
      console.error("Error Redeem Record details:", error);
      notify("An error occurred while processing your request.", {
        type: "error",
      });
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
        (!paymentMethods?.cashAppId?.trim() ||
          paymentMethods?.cashAppId?.trim() === "") &&
        (!paymentMethods?.venmoId?.trim() ||
          paymentMethods?.venmoId?.trim() === "") &&
        (!paymentMethods?.paypalId?.trim() ||
          paymentMethods?.paypalId?.trim() === "") &&
        (!paymentMethods?.zelleId?.trim() ||
          paymentMethods?.zelleId?.trim() === "")
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
      handleConfirmDoublee()
      //handleSubmit();
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
    <>
      <Box
        sx={{
          padding: { xs: "16px", sm: "20px", md: "24px" },
          backgroundColor: "#FFFFFF",
          borderRadius: "8px",
          border: "1px solid #E7E7E7",
          boxShadow: "0px 4px 16px rgba(0, 0, 0, 0.05)",
          mb: 2,
        }}
      >
        <Typography
          sx={{
            fontFamily: "Inter",
            fontWeight: 500,
            fontSize: { xs: "20px", sm: "22px", md: "24px" },
            marginBottom: { xs: "12px", md: "16px" },
            color: "#000000",
          }}
        >
          Redeem
        </Typography>

        <Box
          sx={{
            width: "100%",
            border: "1px solid #E7E7E7",
            borderRadius: "8px",
            padding: "12px",
          }}
        >
          {/* {isTransactionNoteVisible && (
            <>
              <Box>
                <TextField
                  fullWidth
                  label="Add Transaction Note"
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  variant="outlined"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        border: "none",
                      },
                      "&:hover fieldset": {
                        border: "none",
                      },
                    },
                    "& .MuiInputBase-input": {
                      fontSize: { xs: "14px", md: "16px" }, 
                    },
                  }}
                />
              </Box>
              <Box sx={{ borderBottom: "1px solid #e0e0e0", my: 1 }} />
            </>
          )} */}

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              minHeight: "52px",
              gap: "8px",
              // flexDirection: { xs: "column", md: "row" },  responsive behavior
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  bgcolor: "#EFF6FF",
                  borderRadius: "40px",
                  padding: "11.5px 24px",
                }}
              >
                <img
                  src={AOG_Symbol}
                  alt="AOG Symbol"
                  style={{ width: "32px", height: "32px" }}
                />
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 600,
                    fontSize: "32px",
                    lineHeight: "100%",
                    letterSpacing: "0px",
                    color: "#000000",
                  }}
                >
                  {redeemAmount}
                </Typography>
              </Box>
              <TextField
                fullWidth
                label="Add Transaction Note"
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      border: "none",
                    },
                    "&:hover fieldset": {
                      border: "none",
                    },
                  },
                  "& .MuiInputBase-input": {
                    fontSize: { xs: "14px", md: "16px" },
                  },
                }}
              />
            </Box>
            {/* <Box sx={{ display: "flex", alignItems: "center" }}>
              <img
                src={Docs}
                alt="Docs Icon"
                style={{
                  width: "24px", 
                  height: "24px", 
                  cursor: "pointer",
                }}
                onClick={() =>
                  setIsTransactionNoteVisible(!isTransactionNoteVisible)
                }
              />
            </Box> */}
          </Box>
        </Box>

        {/* <Box
          sx={{
            display: "flex",
            gap: { xs: "8px", sm: "10px", md: "12px" },
            justifyContent: "center",
            alignItems: "center",
            m: 2,
            flexWrap: "wrap", // Already had wrap, which is good
            maxWidth: "100%", // Ensure box doesn't overflow container
          }}
        >
          {[20, 50, 100, 200, 500].map((amount) => (
            <Button
              key={amount}
              variant="outlined"
              sx={{
                borderRadius: "40px",
                // Adjusted widths for different breakpoints to create better wrapping behavior
                width: {
                  xs: "calc(50% - 8px)", // 2 buttons per row on extra small screens
                  sm: "calc(33.33% - 10px)", // 3 buttons per row on small screens
                  md: "calc(25% - 12px)", // 4 buttons per row on medium screens
                  lg: "auto", // Flexible width on large screens
                },
                minWidth: { xs: "80px", sm: "90px", md: "100px" }, // Minimum width to prevent squishing
                padding: { xs: "6px 12px", md: "8px 16px" },
                border: amount !== redeemAmount ? "1px dashed #93B1D2" : "none",
                bgcolor: amount === redeemAmount ? "#2E5BFF" : "transparent",
                color: amount === redeemAmount ? "white" : "black",
                ":hover": {
                  border: "none",
                  bgcolor: "#2E5BFF",
                  color: "white",
                },
                gap: "8px",
              }}
              onClick={() => setRedeemAmount(amount)}
            >
              <img
                src={AOG_Symbol}
                alt="AOG Symbol"
                style={{
                  width: { xs: "20px", md: "24px" },
                  height: { xs: "20px", md: "24px" },
                }}
              />
              <Typography
                sx={{
                  fontWeight: 400,
                  fontSize: { xs: "14px", sm: "16px", md: "18px" },
                }}
              >
                {amount}
              </Typography>
            </Button>
          ))}
        </Box> */}
        <Box
          sx={{
            display: "flex",
            gap: "6px",
            justifyContent: "center",
            alignItems: "center",
            m: 2,
            flexWrap: "wrap", // Already had wrap, which is good
            maxWidth: "100%", // Ensure box doesn't overflow container
          }}
        >
          {[20, 50, 100, 200, 500].map((amount) => (
            <Button
              key={amount}
              variant="outlined"
              sx={{
                borderRadius: "40px",
                width: {
                  xs: "calc(50% - 8px)", // 2 buttons per row on extra small screens
                  sm: "calc(33.33% - 10px)", // 3 buttons per row on small screens
                  md: "calc(25% - 12px)", // 4 buttons per row on medium screens
                  lg: "auto", // Flexible width on large screens
                },
                minWidth: { xs: "80px", sm: "90px", md: "100px" },
                padding: { xs: "6px 12px", md: "8px 16px" },
                border: amount !== redeemAmount ? "1px dashed#93B1D2" : "none",
                bgcolor: amount === redeemAmount ? "#2E5BFF" : "transparent",
                color: amount === redeemAmount ? "white" : "black",
                ":hover": {
                  border: "none",
                  bgcolor: "#2E5BFF",
                  color: "white",
                },
                gap: "8px",
              }}
              onClick={() => setRedeemAmount(amount)}
            >
              <img
                src={AOG_Symbol}
                alt="AOG Symbol"
                style={{ width: "24px", height: "24px" }}
              />
              <Typography
                sx={{ fontWeight: 400, fontSize: { xs: "16px", md: "18px" } }}
              >
                {amount}
              </Typography>
            </Button>
          ))}
        </Box>
        <Box
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <Box
            sx={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexDirection: { xs: "column", md: "row" },
              gap: { xs: "12px", md: "0" },
            }}
          >
            <Typography
              sx={{
                fontFamily: "Inter",
                fontWeight: 400,
                fontSize: { xs: "10px", md: "12px" },
                lineHeight: "100%",
                color: "#000",
              }}
            >
              Redeem Service Fee @ {redeemFees}%
            </Typography>
            <Typography
              sx={{
                fontFamily: "Inter",
                fontWeight: 400,
                fontSize: { xs: "10px", md: "12px" },
                lineHeight: "100%",
                color: "#000",
              }}
            >
              Redeems may take up to 2 hours
            </Typography>
          </Box>

          <Button
            onClick={handleConfirm}
            sx={{
              width: "100%",
              height: "52px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              borderRadius: "4px",
              padding: { xs: "10px", md: "inherit" },
              backgroundColor: "#2E5BFF",
              color: "#FFFFFF",
              fontFamily: "Inter",
              fontWeight: 500,
              fontSize: { xs: "16px", md: "18px" },
              textTransform: "none",
              "&:hover": {
                backgroundColor: "#2E5BFF",
              },
              "&.Mui-disabled": {
                backgroundColor: "#B0B0B0", // Light gray disabled background
                color: "#F0F0F0", // Faded text color
                cursor: "not-allowed",
                opacity: 0.7,
              },
            }}
            disabled={isRedeemDisabled}
          >
            Redeem Request
            <ArrowForwardIcon
              style={{ width: "24px", height: "24px", marginLeft: "10px" }}
            />{" "}
            {/* Matches Recharge */}
          </Button>
        </Box>
      </Box>
      {totalData > 0 && data.length !== 0 && (
        <TransactionRecords
          message={"Recent Redeem"}
          totalTransactions={totalData}
          transactionData={data}
          redirectUrl={"redeemRecords"}
        />
      )}
      <RedeemDialog
        open={redeemDialogOpen}
        onClose={() => setRedeemDialogOpen(false)}
        onConfirm={handleConfirm}
        redeemAmount={redeemAmount}
        remark={remark}
        record={transformedIdentity}
        handleRefresh={handleRefresh}
      />
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
            notify("Refund cannot be processed without a payment mode.", {
              type: "error",
            });
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
          <Box
            className="d-flex w-100 justify-content-between"
            sx={{
              flexDirection: { xs: "column", sm: "row" }, // Column on small screens, row on larger screens
              alignItems: { xs: "stretch", sm: "stretch" }, // Stretch items to take full width in both modes
              gap: { xs: 2, sm: 2 }, // Add spacing between buttons
              marginBottom: { xs: 2, sm: 2 }, // Add margin at the bottom
              width: "100% !important", // Ensure the container takes full width
            }}
          >
            {paymentMethods.cashAppId ||
            paymentMethods.paypalId ||
            paymentMethods.venmoId ? (
              <Button
                color="primary"
                onClick={() => {
                  setShowWarningModal(false);
                  handleConfirmDoublee();
                  //handleSubmit();
                }}
              >
                No, Continue
              </Button>
            ) : null}
            <Button
              className="custom-button cancel"
              style={{
                border: "1px solid var(--primary-color)",
                borderRadius: "8px",
                fontWeight: 500,
                fontFamily: "Inter",
                color: "#4D4D4D",
              }}
              onClick={() => {
                setShowWarningModal(false);
                handleConfirmDoublee();
                //handleSubmit();
              }}
            >
              Close
            </Button>
            <Button
              className="custom-button"
              style={{
                backgroundColor: "#2E5BFF",
                color: "white",
                borderRadius: "8px",
                fontFamily: "Inter",
              }}
              onClick={() => {
                setShowAddPaymentMethodDialog(true);
                setShowWarningModal(false);
              }}
            >
              Add/Edit Payment Method
            </Button>
          </Box>
        </ModalBody>
      </ReactstrapModal>

      {/* Add Payment Method Modal (unchanged) */}
      <ReactstrapModal
        isOpen={showAddPaymentMethodDialog}
        toggle={() => setShowAddPaymentMethodDialog(false)}
        size="md"
        centered
      >
        <ModalHeader toggle={() => setShowAddPaymentMethodDialog(false)}>
          Add/Edit Payment Method
        </ModalHeader>
        <ModalBody>
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              handleAddPaymentMethod(paymentMethods);
            }}
          >
            {errorAddPayment && (
              <Alert severity="warning" sx={{ mb: 2 }}>
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
                  className="custom-button"
                  style={{
                    backgroundColor: "#2E5BFF",
                    color: "white",
                    borderRadius: "8px",
                    fontFamily: "Inter",
                  }}
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
      <Dialog
        open={showRedeemConfirmDialog}
        //onClose={() => setShowRedeemConfirmDialog(false)}
      >
        <DialogTitle>Confirm Redeem</DialogTitle>
        <DialogContent>
          <DialogContentText>
            The redeem amount is higher than 50% of your total recharge. Would
            you like to continue?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setShowRedeemConfirmDialog(false)}
            color="inherit"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              setShowRedeemConfirmDialog(false);
              //handleConfirmDoublee()
              handleSubmit();
            }}
            variant="contained"
            sx={{ backgroundColor: "#2E5BFF", color: "#fff" }}
          >
            Yes, Continue
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Redeem;
