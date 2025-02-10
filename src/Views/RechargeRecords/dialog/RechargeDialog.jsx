import React, { useState, useEffect } from "react";
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
import { useGetIdentity,useNotify } from "react-admin";
// loader
import { Loader } from "../../Loader";

import { Parse } from "parse";
import { dataProvider } from "../../../Provider/parseDataProvider";
// Initialize Parse
Parse.initialize(process.env.REACT_APP_APPID, process.env.REACT_APP_MASTER_KEY);
Parse.serverURL = process.env.REACT_APP_URL;

const RechargeDialog = ({ open, onClose, handleRefresh }) => {
  const { identity } = useGetIdentity();
  const notify = useNotify(); // React-Admin's notification hook
  const [userName, setUserName] = useState("");
  const [rechargeAmount, setRechargeAmount] = useState("");
  const [remark, setRemark] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentSource, setPaymentSource] = useState("stripe");
  const [walletBalance, setWalletBalance] = useState(0);
  const [redeemFees, setRedeemFees] = useState();
  const [minLimitLoading, setMinLimitLoading] = useState(false); // Loader for fetching minimum recharge limit
  const [errorMessage, setErrorMessage] = useState(""); // New state for error message

  const resetFields = () => {
    setUserName("");
    setRechargeAmount("");
    setRemark("");
    setPaymentSource("stripe");
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
      setUserName(identity.username || "");
      fetchWalletBalance();
      parentServiceFee()
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
        balance:walletBalance,
        useWallet: true,
      };

      setLoading(true);
      try {
        const response = await dataProvider.userTransaction(rawData);
        if (response?.success) {
          // Display success message using useNotify
          notify("Recharge successful!", { type: "success" });
        } else {
          setErrorMessage(response?.message || "Recharge failed. Please try again.");
        }
        onClose();
        handleRefresh();
        resetFields();
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
          setErrorMessage(response?.message || "Stripe recharge failed. Please try again.");
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
    }
    finally {
      setMinLimitLoading(false);
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
            Recharge Amount
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
                      min="1"
                      onChange={(e) => setRechargeAmount(e.target.value)}
                      required
                    />
                  </FormGroup>
                </Col>
                <Col md={12}>
                  <FormGroup>
                    <Label for="paymentSource">Payment Source</Label>
                    <Input
                      type="select"
                      name="paymentSource"
                      id="paymentSource"
                      value={paymentSource}
                      onChange={(e) => setPaymentSource(e.target.value)}
                    >
                      <option value="stripe">Payment Portal</option>
                      <option value="wallet">Wallet</option>
                    </Input>
                    <small>
                      Wallet Balance:{" "}
                      <strong>{walletBalance.toFixed(2)}</strong>
                    </small>
                  </FormGroup>
                </Col>

                <Col md={12}>
                  <FormGroup>
                    <Label for="remark">Remark</Label>
                    <Input
                      id="remark"
                      name="remark"
                      type="textarea"
                      autoComplete="off"
                      maxLength={30}
                      onChange={(e) => setRemark(e.target.value)}
                    />
                  </FormGroup>
                </Col>

                <Col md={12}>
                  <div className="d-flex justify-content-end">
                    <Button
                      color="success"
                      type="submit"
                      className="mx-2"
                      disabled={loading || minLimitLoading}
                    >
                      {loading ? "Processing..." : "Confirm"}
                    </Button>
                    <Button color="secondary" onClick={onClose}>
                      Cancel
                    </Button>
                  </div>
                </Col>
              </Row>
            </Form>
          </ModalBody>
        </Modal>
      )}
    </React.Fragment>
  );
};

export default RechargeDialog;
