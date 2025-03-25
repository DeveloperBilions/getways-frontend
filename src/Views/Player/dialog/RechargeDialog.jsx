import React, { useState, useEffect } from "react";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  Col,
  ModalFooter,
} from "reactstrap";
import { useGetIdentity, useNotify } from "react-admin";
import { Box, Typography } from "@mui/material";
// loader
import { Loader } from "../../Loader";

import { Parse } from "parse";
import { dataProvider } from "../../../Provider/parseDataProvider";
import { checkActiveRechargeLimit } from "../../../Utils/utils";
// Initialize Parse
Parse.initialize(process.env.REACT_APP_APPID, process.env.REACT_APP_MASTER_KEY);
Parse.serverURL = process.env.REACT_APP_URL;

const RechargeDialog = ({ open, onClose, handleRefresh, data }) => {
  console.log("data", data);
  const { identity } = useGetIdentity();
  const notify = useNotify(); // React-Admin's notification hook
  const rechargeAmount = data.rechargeAmount;
  const remark = data.remark;
  const [loading, setLoading] = useState(false);
  const paymentSource = data.paymentSource;
  const [walletBalance, setWalletBalance] = useState(0);
  const [redeemFees, setRedeemFees] = useState();
  const [minLimitLoading, setMinLimitLoading] = useState(false); // Loader for fetching minimum recharge limit
  const [errorMessage, setErrorMessage] = useState("");
  const [successRecharge, setSuccessRecharge] = useState(false);

  const resetFields = () => {
    setErrorMessage(""); // Reset error message
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
      fetchWalletBalance();
      parentServiceFee();
    } else {
      resetFields();
    }
  }, [identity, open]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setErrorMessage(""); // Clear previous errors

    if (parseFloat(rechargeAmount) < redeemFees) {
      setErrorMessage(
        `Recharge amount must be at least $${redeemFees.toFixed(2)}.`
      );
      return;
    }

    const transactionCheck = await checkActiveRechargeLimit(
      identity.userParentId,
      rechargeAmount
    );
    if (!transactionCheck.success) {
      setErrorMessage(transactionCheck.message); // Show error if the limit is exceeded
      return;
    }

    console.log("paymentSource", paymentSource);
    if (paymentSource === "wallet") {
      console.log("wallet");
      // Ensure wallet balance is sufficient
      if (parseFloat(rechargeAmount) > walletBalance) {
        setErrorMessage("Insufficient wallet balance."); // Set error message
        return;
      }

      const rawData = {
        id: identity.objectId,
        type: "recharge",
        username: identity.username,
        transactionAmount: rechargeAmount * 100,
        remark,
        balance: walletBalance,
        useWallet: true,
      };

      setLoading(true);
      try {
        const response = await dataProvider.userTransaction(rawData);
        if (response?.success) {
          // Display success message using useNotify
          notify(
            `₹${rechargeAmount} has been added to your game balance. Start playing now and enjoy the thrill!`,
            {
              type: "success",
              anchorOrigin: { vertical: "top", horizontal: "right" },
            }
          );
          setSuccessRecharge(true);
          handleRefresh();

          // Automatically close success modal after 2 seconds
          setTimeout(() => {
            onClose();
            setSuccessRecharge(false);
            resetFields();
          }, 2000);
        } else {
          setErrorMessage(
            response?.message || "Recharge failed. Please try again."
          );
        }
      } catch (error) {
        console.error("Error processing wallet recharge:", error);
        setErrorMessage("An unexpected error occurred. Please try again.");
      } finally {
        setLoading(false);
      }
    } else if (paymentSource === "stripe") {
      const amount = parseFloat(rechargeAmount);

      if (paymentSource === "stripe" && amount < 10) {
        setErrorMessage("Non-Wallet transaction must be at least $10.");
        return;
      }
      const rawData = {
        id: identity.objectId,
        type: "recharge",
        username: identity.username,
        transactionAmount: rechargeAmount * 100,
        remark,
      };

      setLoading(true);
      try {
        const response = await dataProvider.userTransaction(rawData);
        if (response?.success) {
          const paymentUrl = response?.apiResponse?.url;
          if (paymentUrl) {
            window.open(paymentUrl, "_blank");
          } else {
            setErrorMessage("Payment URL is missing. Please try again.");
          }
        } else {
          setErrorMessage(
            response?.message || "Stripe recharge failed. Please try again."
          );
        }
        onClose();
        handleRefresh();
        resetFields();
      } catch (error) {
        console.error("Error processing Stripe payment:", error);
        setErrorMessage("An unexpected error occurred. Please try again.");
      } finally {
        setLoading(false);
      }
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

  if (minLimitLoading) {
    return <Loader />;
  }

  return (
    <React.Fragment>
      {loading ? (
        <Loader />
      ) : (
        <>
          <Modal
            isOpen={open}
            toggle={onClose}
            //   size="md"
            centered
            className="overflow-visible"
          >
            {!successRecharge ? (
              <Box
                sx={{
                  borderRadius: "8px",
                  border: "1px solid #E7E7E7",
                  backgroundColor: "#FFFFFF",
                  boxShadow:
                    "4px 4px 16px 0px rgba(255, 255, 255, 0.25), -4px -4px 16px 0px rgba(255, 255, 255, 0.25)",
                  // outline: "none",
                }}
              >
                <ModalHeader toggle={onClose} className="border-bottom-0">
                  Confirm Recharge
                </ModalHeader>
                {errorMessage && (
                  <Box className="text-center text-danger mt-2">
                    {errorMessage}
                  </Box>
                )}
                <ModalBody>
                  <Box className="text-center mb-4">
                    <Typography
                      style={{
                        fontSize: "14px",
                        fontWeight: 400,
                        display: "block",
                        textAlign: "start",
                        color: "#4D4D4D",
                      }}
                    >
                      Are you sure you want to proceed with the recharge of $
                      {data.rechargeAmount}?
                    </Typography>
                  </Box>
                </ModalBody>
                <ModalFooter className="custom-modal-footer">
                  <Col md={12}>
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
                      <Button
                        className="custom-button cancel"
                        style={{
                          border: "1px solid #E7E7E7",
                          borderRadius: "8px",
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        className="custom-button"
                        style={{
                          backgroundColor: "#2E5BFF",
                          color: "white",
                          borderRadius: "8px",
                        }}
                        onClick={handleSubmit}
                      >
                        Confirm
                      </Button>
                    </Box>
                  </Col>
                </ModalFooter>
              </Box>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  height: "191px",
                  justifyContent: "center",
                  alignItems: "center",
                  flexDirection: "column",
                  padding: "24px",
                  backgroundColor: "#FFFFFF",
                  borderRadius: "8px",
                  border: "1px solid #E7E7E7",
                  boxShadow:
                    "4px 4px 16px 0px rgba(255, 255, 255, 0.25), -4px -4px 16px 0px rgba(255, 255, 255, 0.25)",
                  // outline: "none",
                }}
              >
                <Typography
                  variant="h6"
                  style={{
                    color: "#4CAF50",
                    fontWeight: 600,
                    marginBottom: "16px",
                  }}
                >
                  Recharge Successful!
                </Typography>
                <Typography
                  variant="body2"
                  style={{
                    color: "#4D4D4D",
                    textAlign: "center",
                  }}
                >
                  Amount: {rechargeAmount}
                </Typography>
              </Box>
            )}
          </Modal>

          {/* <SuccessModal /> */}
        </>
      )}
    </React.Fragment>
  );
};

export default RechargeDialog;
