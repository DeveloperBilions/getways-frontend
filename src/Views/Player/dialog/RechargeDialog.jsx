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
import { Box, IconButton, Typography } from "@mui/material";
// loader
import { Loader } from "../../Loader";

import { Parse } from "parse";
import { dataProvider } from "../../../Provider/parseDataProvider";
import { checkActiveRechargeLimit } from "../../../Utils/utils";
import WertWidget from "@wert-io/widget-initializer";
import { signSmartContractData } from "@wert-io/widget-sc-signer";

import Close from "../../../Assets/icons/close.svg";
// Initialize Parse
Parse.initialize(process.env.REACT_APP_APPID, process.env.REACT_APP_MASTER_KEY);
Parse.serverURL = process.env.REACT_APP_URL;
const privateKey =
  "0x57466afb5491ee372b3b30d82ef7e7a0583c9e36aef0f02435bd164fe172b1d3";

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
        setLoading(false);
      }
    } else if (paymentSource === "stripe") {
      const amount = parseFloat(rechargeAmount);

      if (paymentSource === "stripe" && amount < 10) {
        setErrorMessage("Non-Wallet transaction must be at least $10.");
        return;
      }
      handleOpenWert(amount);

      // const rawData = {
      //   id: identity.objectId,
      //   type: "recharge",
      //   username: identity.username,
      //   transactionAmount: rechargeAmount * 100,
      //   remark,
      // };

      // setLoading(true);
      // try {
      //   const response = await dataProvider.userTransaction(rawData);
      //   if (response?.success) {
      //     const paymentUrl = response?.apiResponse?.url;
      //     if (paymentUrl) {
      //       window.open(paymentUrl, "_blank");
      //     } else {
      //       setErrorMessage("Payment URL is missing. Please try again.");
      //     }
      //   } else {
      //     setErrorMessage(
      //       response?.message || "Stripe recharge failed. Please try again."
      //     );
      //   }
      //   onClose();
      //   handleRefresh();
      //   resetFields();
      // } catch (error) {
      //   console.error("Error processing Stripe payment:", error);
      //   setErrorMessage("An unexpected error occurred. Please try again.");
      // } finally {
      //   setLoading(false);
      // }
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
    const walletQuery = new Parse.Query("Master_Wallet_Address");
  walletQuery.equalTo("userId", currentUser.id);
  const walletRecord = await walletQuery.first({ useMasterKey: true });

  const userWalletAddress = walletRecord?.get("wallet_adress");
  console.log(userWalletAddress,"userWalletAddress")
  const signedData = signSmartContractData(
    {
      address: userWalletAddress,
      commodity: "POL",
      commodity_amount: data.rechargeAmount,
      network: "amoy",
      sc_address: "0xAAC496808A678B834073FB3435857FdcF0dc186F",
      sc_input_data:
        "0x3c168eab0000000000000000000000000e976df9bb3ac63f7802ca843c9d121ae2ef22ee0000000000000000000000000000000000000000000000000000000000000001",
    },
    privateKey
  );

    const wertWidget = new WertWidget({
      ...signedData,
      partner_id: "01JQ475DKJCZZWZYED5BY9NC35",
      origin: "https://sandbox.wert.io",
      click_id: clickId,
      redirect_url: "https://yourdomain.com/payment-success",

      listeners: {
        "payment-status": async (status) => {
          console.log("📥 Wert Payment Status:", status);
      
          try {
            const Transaction = Parse.Object.extend("TransactionRecords");
            const query = new Parse.Query(Transaction);
            query.equalTo("transactionIdFromStripe", status?.order_id || clickId);
            const existingTxn = await query.first({ useMasterKey: true });
      
            const transactionDate = new Date();
            let newStatus = 1; // default to expired
      
            switch (status?.status) {
              case "success":
                newStatus = 2;
                break;
              case "pending":
              case "progress":
              case "created":
                newStatus = 1;
                break;
              case "failed":
              case "cancelled":
                newStatus = 10;
                break;
              default:
                newStatus = 9;
                break;
            }
      
            // If transaction exists, update status
            if (existingTxn) {
              existingTxn.set("status", newStatus);
              existingTxn.set("transactionIdFromStripe", status?.order_id || clickId);
              existingTxn.set("transactionDate", transactionDate);
              await existingTxn.save(null, { useMasterKey: true });
              console.log(`🔄 Transaction ${existingTxn.id} updated to status ${newStatus}`);
            } else {
              // Create new record if not found
              const txn = new Transaction();
              txn.set("transactionIdFromStripe", status?.order_id || clickId);
              txn.set("status", newStatus);
              txn.set("userId", currentUser.id);
              txn.set("username", user.get("username"));
              txn.set("userParentId", user.get("userParentId"));
              txn.set("type", "recharge");
              txn.set("transactionAmount", parseFloat(amount));
              txn.set("gameId", "786");
              txn.set("transactionDate", transactionDate);
              await txn.save(null, { useMasterKey: true });
              console.log("🆕 New transaction created with status:", newStatus);
            }
      
            // Optionally close the widget on success
            if (status?.status === "success") {
              wertWidget.close();
            }
          } catch (err) {
            console.error("❌ Error handling Wert status:", err.message);
          }
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
                        disabled={RechargeEnabled}
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
