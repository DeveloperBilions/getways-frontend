import React, { useState, useEffect, useRef } from "react";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  Col,
  ModalFooter,
} from "reactstrap";
import { useGetIdentity, useNotify } from "react-admin";
import { Box, IconButton, Typography } from "@mui/material";
// loader
import { Loader } from "../../Loader";

import { Parse } from "parse";
import { dataProvider } from "../../../Provider/parseDataProvider";
import {
  checkActiveRechargeLimit,
  getParentUserId,
  isRechargeEnabledForAgent,
  updatePotBalance,
} from "../../../Utils/utils";
import WertWidget from "@wert-io/widget-initializer";
import { signSmartContractData } from "@wert-io/widget-sc-signer";

import Close from "../../../Assets/icons/close.svg";
import { Alert } from "@mui/material";
import { generateScInputData } from "./GenerateInput";

// Initialize Parse
Parse.initialize(process.env.REACT_APP_APPID, process.env.REACT_APP_MASTER_KEY);
Parse.serverURL = process.env.REACT_APP_URL;
const privateKey =
  "0x2bcb9fc6533713d0705a9f15850a027ec26955d96c22ae02075f3544e6842f74";

const RechargeDialog = ({ open, onClose, handleRefresh, data }) => {
  const { identity } = useGetIdentity();
  const notify = useNotify(); // React-Admin's notification hook
  const rechargeAmount = data.rechargeAmount;
  const remark = data.remark;
  const [loading, setLoading] = useState(false);
  const paymentSource = data.paymentSource;
  const [walletBalance, setWalletBalance] = useState(0);
  const [redeemFees, setRedeemFees] = useState();
  const [errorMessage, setErrorMessage] = useState("");
  const [successRecharge, setSuccessRecharge] = useState(false);
  const [RechargeEnabled, setRechargeEnabled] = useState(false);
  const [rechargeDisabled, setRechargeDisabled] = useState(false);
  const [autoSubmitted, setAutoSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [balanceLoaded, setBalanceLoaded] = useState(false);
  const isMountedRef = useRef(false);

  const resetFields = () => {
    setIsSubmitting(false);
    setAutoSubmitted(false);
    setErrorMessage("");
    setSuccessRecharge(false);
  };

  useEffect(() => {
    const fetchWalletBalance = async () => {
      try {
        const walletQuery = new Parse.Query("Wallet");
        walletQuery.equalTo("userID", identity.objectId);
        const wallet = await walletQuery.first();
        if (wallet) {
          setWalletBalance(wallet.get("balance") || 0);
          setBalanceLoaded(true); // ✅ mark as loaded
        } else {
          setWalletBalance(0);
          setBalanceLoaded(true);
        }
      } catch (error) {
        console.error("Error fetching wallet balance:", error);
      }
    };

    isMountedRef.current = true;
    if (identity && open) {
      fetchWalletBalance();
      parentServiceFee();
    } else {
      resetFields();
    }
    return () => {
      isMountedRef.current = false;
    };
  }, [identity, open]);

  useEffect(() => {
    const checkRechargeAccess = async () => {
      const disabled = !(await isRechargeEnabledForAgent(
        identity?.userParentId
      ));
      setRechargeDisabled(disabled);
    };

    checkRechargeAccess();
  }, [identity]);
  useEffect(() => {
    if (!open || !identity || !balanceLoaded || autoSubmitted) return;

    const allConditionsSatisfied = () => {
      const isAmountValid = parseFloat(rechargeAmount) >= redeemFees;
      const isWalletEnough =
        paymentSource === "wallet"
          ? parseFloat(rechargeAmount) <= walletBalance
          : true;
      const isStripeMinValid =
        paymentSource === "stripe" ? parseFloat(rechargeAmount) >= 10 : true;
      const isAccessGranted = !RechargeEnabled && !rechargeDisabled;

      return (
        isAmountValid &&
        isWalletEnough &&
        isStripeMinValid &&
        identity &&
        isAccessGranted
      );
    };

    const submitIfReady = async () => {
      if (isSubmitting || autoSubmitted || !isMountedRef.current) return;

      const transactionCheck = await checkActiveRechargeLimit(
        identity?.userParentId,
        rechargeAmount
      );

      if (!transactionCheck.success) {
        setErrorMessage(transactionCheck.message || "Recharge Limit Reached");
        return;
      }

      if (!allConditionsSatisfied()) {
        // ✅ Set descriptive error message
        if (parseFloat(rechargeAmount) < redeemFees) {
          setErrorMessage(
            `Recharge amount must be at least $${redeemFees.toFixed(2)}.`
          );
        } else if (
          paymentSource === "wallet" &&
          parseFloat(rechargeAmount) > walletBalance
        ) {
          setErrorMessage("Insufficient wallet balance.");
        } else if (
          paymentSource === "stripe" &&
          parseFloat(rechargeAmount) < 10
        ) {
          setErrorMessage("Stripe payment must be at least $10.");
        } else if (RechargeEnabled || rechargeDisabled) {
          setErrorMessage("Recharge is currently disabled for this account.");
        } else {
          setErrorMessage("Some required conditions are not satisfied.");
        }
        return;
      }

      setAutoSubmitted(true); // prevent multiple calls
      setIsSubmitting(true);
      const syntheticEvent = { preventDefault: () => {} };
      handleSubmit(syntheticEvent);
    };
    if (open && identity && !autoSubmitted) {
      submitIfReady();
    }
  }, [
    open,
    identity,
    rechargeAmount,
    walletBalance,
    redeemFees,
    RechargeEnabled,
    rechargeDisabled,
    paymentSource,
    autoSubmitted,
    balanceLoaded
  ]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
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
    if (paymentSource === "wallet") {
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
          const currentCount = parseInt(
            localStorage.getItem("kycRechargeCount") || "0",
            10
          );
          localStorage.setItem(
            "kycRechargeCount",
            (currentCount + 1).toString()
          );

          // Automatically close success modal after 2 seconds
          setTimeout(() => {
            onClose();
            setSuccessRecharge(false);
            handleRefresh();
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
        if (isMountedRef.current) {
          setIsSubmitting(false);
          setLoading(false);
        }
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
        const currentUser = await Parse.User.current().fetch();
        let walletAddr = currentUser.get("walletAddr");

        if (!walletAddr || walletAddr.trim() === "") {
          try {
            const walletResp = await Parse.Cloud.run(
              "assignRandomWalletAddrIfMissing",
              {
                userId: currentUser.id,
              }
            );
            walletAddr = walletResp.walletAddr;
            console.log("Assigned new walletAddr:", walletAddr);
          } catch (e) {
            console.error("Failed to assign wallet address:", e.message);
            setErrorMessage(
              "Wallet address assignment failed. Please try again."
            );
            setLoading(false);
            setIsSubmitting(false);
            return;
          }
        }

        handleOpenWert(rechargeAmount);
        // const response = await dataProvider.userTransaction(rawData);
        // if (response?.success) {
        //   window.open(response?.apiResponse.paymentUrl, "_blank");

        //   const paymentUrl = response?.apiResponse?.url;
        //   if (paymentUrl) {
        //     window.open(paymentUrl, "_blank");
        //   } else {
        //     setErrorMessage("Payment URL is missing. Please try again.");
        //   }
        //   onClose();
        //   handleRefresh();
        //   resetFields();
        // }else {
        //   setErrorMessage(
        //     response?.message || "Stripe recharge failed. Please try again."
        //   );
        // }
        // onClose();
        // handleRefresh();
        // resetFields();
      } catch (error) {
        console.error("Error processing Stripe payment:", error);
        setErrorMessage("An unexpected error occurred. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };
  const handleOpenWert = async (amount) => {
    if (!amount || isNaN(amount)) {
      alert("Please enter a valid amount.");
      return;
    }

    const clickId = `txn-${Date.now()}`;

    const currentUser = Parse.User.current();
    if (!currentUser) {
      alert("User not logged in.");
      return;
    }

    const user = await currentUser.fetch();
    console.log(user.get("walletAddr"), "userDetails");

    const path =
      "0x55d398326f99059ff775485246999027b31979550009c4b32d4817908f001c2a53c15bff8c14d8813109be";

    const recipient = user.get("walletAddr");
    const amountIn = (parseFloat(amount) * Math.pow(10, 18)).toString();
    const amountOutMinimum = "0";

    const sc_input_data = generateScInputData(
      path,
      recipient,
      amountIn,
      amountOutMinimum
    );

    const signedData = signSmartContractData(
      {
        address: recipient,
        commodity: "USDT",
        commodity_amount: amount,
        network: "bsc",
        sc_address: "0x13f4EA83D0bd40E75C8222255bc855a974568Dd4",
        sc_input_data: sc_input_data,
      },
      privateKey
    );
    const wertWidget = new WertWidget({
      ...signedData,
      partner_id: "01JS1S88TZANH9XQGZYHDTE9S5",
      origin: "https://widget.wert.io",
      click_id: clickId,
      redirect_url: process.env.REACT_APP_REFERRAL_URL,
      currency: "USD",
      is_crypto_hidden: true,
      listeners: {
        "payment-status": async (status) => {
          console.log("Wert Payment Status:", status);
          try {
            const Transaction = Parse.Object.extend("TransactionRecords");
            const query = new Parse.Query(Transaction);
            query.equalTo("transactionIdFromStripe", clickId);
            const existingTxn = await query.first({ useMasterKey: true });

            const transactionDate = new Date();
            let newStatus = 1; // default to expired
            let failReason = ""; // initialize empty

            // switch (status?.status) {
            //   case "success":
            //     newStatus = 2;
            //     break;
            //   case "pending":
            //   case "progress":
            //   case "created":
            //     newStatus = 1;
            //     break;
            //   case "failed":
            //   case "cancelled":
            //     newStatus = 10;
            //     failReason = status?.fail_reason || "Unknown failure";
            //     break;
            //   default:
            //     newStatus = 9;
            //     break;
            // }

            // If transaction exists, update status
            if (existingTxn) {
              existingTxn.set("status", newStatus);
              existingTxn.set("transactionIdFromStripe", clickId);
              existingTxn.set("transactionDate", transactionDate);
              await existingTxn.save(null, { useMasterKey: true });
              const parentUserId = await getParentUserId(
                existingTxn.get("userId")
              );
              await updatePotBalance(
                parentUserId,
                existingTxn.get("transactionAmount"),
                "recharge"
              );
            } else {
              // Create new record if not found
              const txn = new Transaction();
              txn.set("transactionIdFromStripe", clickId);
              txn.set("status", newStatus);
              txn.set("userId", currentUser.id);
              txn.set("username", user.get("username"));
              txn.set("userParentId", user.get("userParentId"));
              txn.set("type", "recharge");
              txn.set("portal", "Wert");
              txn.set("transactionAmount", parseFloat(amount));
              txn.set("gameId", "786");
              txn.set("transactionDate", transactionDate);
              txn.set("walletAddr", user.get("walletAddr"));

              await txn.save(null, { useMasterKey: true });
              await updatePotBalance(
                user.get("userParentId"),
                parseFloat(amount),
                "recharge"
              );
            }

            // Optionally close the widget on success
            if (status?.status === "success") {
              wertWidget.close();
              onClose();
            }
          } catch (err) {
            console.error("Error handling Wert status:", err.message);
          }
        },
        close: () => {
          onClose();
        },
      },
    });

    wertWidget.open();
  };

  const parentServiceFee = async () => {
    try {
      const response = await Parse.Cloud.run("redeemParentServiceFee", {
        userId: identity?.userParentId,
      });
      setRedeemFees(response?.rechargeLimit || 0);
      setRechargeEnabled(response?.rechargeDisabled || false);
    } catch (error) {
      console.error("Error fetching parent service fee:", error);
    }
  };

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
                <ModalHeader
                  toggle={onClose}
                  className="border-bottom-0"
                  style={{
                    fontSize: "24px",
                    fontWeight: 500,
                  }}
                  close={
                    <IconButton
                      onClick={onClose}
                      sx={{
                        position: "absolute",
                        right: "16px",
                        top: "16px",
                      }}
                    >
                      <img
                        src={Close}
                        alt="cancel"
                        width="24px"
                        height="24px"
                      />
                    </IconButton>
                  }
                >
                  Recharge
                </ModalHeader>

                <ModalBody>
                  {balanceLoaded && errorMessage ? (
                    <Alert severity="error">{errorMessage}</Alert>
                  ) : (
                    <Box className="text-center text-secondary mt-2">
                      Processing your recharge...
                    </Box>
                  )}

                  {rechargeDisabled && paymentSource === "stripe" && (
                    <Alert severity="warning" sx={{ my: 2 }}>
                      Recharges are not available at this time. Please try again
                      later.
                    </Alert>
                  )}
                  {/* <Box className="text-center mb-4">
                    <Typography
                      style={{
                        fontSize: "18px",
                        fontWeight: 400,
                        display: "block",
                        textAlign: "start",
                        color: "#4D4D4D",
                      }}
                    >
                      Are you sure you want to proceed with the recharge of $
                      {data.rechargeAmount}?
                    </Typography>
                  </Box> */}
                </ModalBody>
                {/* <ModalFooter className="custom-modal-footer">
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
                          border: "1px solid var(--primary-color)",
                          borderRadius: "8px",
                          fontSize: "18px",
                          fontWeight: 500,
                          fontFamily: "Inter",
                          color:"#4D4D4D"
                        }}
                        onClick={onClose}
                        disabled={identity?.rechargeDisabled}
                      >
                        Cancel
                      </Button>
                      <Button
                        className="custom-button"
                        style={{
                          backgroundColor: "#2E5BFF",
                          color: "white",
                          borderRadius: "8px",
                          fontFamily: "Inter",
                        }}
                        onClick={handleSubmit}
                        disabled={RechargeEnabled || rechargeDisabled}
                      >
                        Confirm
                      </Button>
                    </Box>
                  </Col>
                </ModalFooter> */}
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
                    fontWeight: 500,
                    marginBottom: "20px",
                  }}
                >
                  Recharge Successful!
                </Typography>
                <Typography
                  variant="body2"
                  style={{
                    color: "#4D4D4D",
                    textAlign: "center",
                    fontSize: "12px",
                    fontWeight: 400,
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
