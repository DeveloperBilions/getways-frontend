import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  Row,
  Col,
  Button,
  Card,
  CardBody,
  CardHeader,
  ListGroup,
  ListGroupItem,
} from "reactstrap";
import { Loader } from "../../Loader";
import { Parse } from "parse";
import { FaWallet, FaCashRegister, FaPaypal } from "react-icons/fa";
import { BiLogoVenmo } from "react-icons/bi";
import { SiZelle } from "react-icons/si";
import DisablePaymentMethodDialog from "./DisablePaymentMethodDialog";
// Initialize Parse
Parse.initialize(process.env.REACT_APP_APPID, process.env.REACT_APP_MASTER_KEY);
Parse.serverURL = process.env.REACT_APP_URL;

const WalletDialog = ({ open, onClose, record }) => {
  const [walletDetails, setWalletDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [disableDialogOpen, setDisableDialogOpen] = useState(false);
  const role = localStorage.getItem("role")

  useEffect(() => {
    const fetchWalletDetails = async () => {
      setLoading(true);
      try {
        const walletQuery = new Parse.Query("Wallet");
        walletQuery.equalTo("userID", record.id); // Query by the user ID
        const wallet = await walletQuery.first({ useMasterKey: true });
        if (wallet) {
          setWalletDetails({
            balance: wallet.get("balance"),
            cashAppId: wallet.get("cashAppId"),
            isCashAppDisabled: wallet.get("isCashAppDisabled"),
            paypalId: wallet.get("paypalId"),
            isPaypalDisabled: wallet.get("isPaypalDisabled"),
            venmoId: wallet.get("venmoId"),
            isVenmoDisabled: wallet.get("isVenmoDisabled"),
            zelleId: wallet.get("zelleId"),
            isZelleDisabled: wallet.get("isZelleDisabled"),
          });
        }
        else {
          setWalletDetails(null); // No wallet found
        }
      } catch (error) {
        console.error("Error fetching wallet details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchWalletDetails();
    }
  }, [open, record]);

  return (
    <>
      <Modal isOpen={open} toggle={onClose} size="md" centered>
        <ModalHeader toggle={onClose}>
          <FaWallet style={{ marginRight: "10px" }} />
          Wallet Details
        </ModalHeader>
        <ModalBody>
          {loading ? (
            <Loader />
          ) :walletDetails ? (
            <Card
              className="shadow-sm"
              style={{
                borderRadius: "15px",
                background:
                  "linear-gradient(135deg, rgb(0 0 0), rgb(44 92 83))",
                color: "#fff",
              }}
            >
              <CardHeader
                className="text-center"
                style={{
                  borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
                }}
              >
                <h4 className="mb-0">
                  <strong>Wallet Balance</strong>
                </h4>
              </CardHeader>
              <CardBody className="text-center">
                <h2 style={{ fontSize: "3rem", fontWeight: "bold" }}>
                  ${walletDetails?.balance || 0}
                </h2>
                <p style={{ fontStyle: "italic", opacity: 0.8 }}>
                  Available Balance
                </p>
              </CardBody>
              <CardBody
                style={{
                  borderTop: "1px solid rgba(255, 255, 255, 0.2)",
                  paddingTop: "1rem",
                }}
              >
                <h5 className="mb-3">Payment Methods</h5>
                <ListGroup flush>
                  <ListGroupItem
                    style={{
                      background: "transparent",
                      color: "#fff",
                      border: "none",
                    }}
                  >
                    <FaCashRegister
                      style={{ marginRight: "10px", color: "#FFD700" }}
                    />
                    <strong>CashApp ID:</strong>{" "}
                    {walletDetails?.cashAppId || (
                      <span className="text-warning">Not Added</span>
                    )}
                  </ListGroupItem>
                  <ListGroupItem
                    style={{
                      background: "transparent",
                      color: "#fff",
                      border: "none",
                    }}
                  >
                    <FaPaypal
                      style={{ marginRight: "10px", color: "#0070BA" }}
                    />
                    <strong>PayPal ID:</strong>{" "}
                    {walletDetails?.paypalId || (
                      <span className="text-warning">Not Added</span>
                    )}
                  </ListGroupItem>
                  <ListGroupItem
                    style={{
                      background: "transparent",
                      color: "#fff",
                      border: "none",
                    }}
                  >
                    <BiLogoVenmo
                      style={{ marginRight: "10px", color: "#3D95CE" }}
                    />
                    <strong>Venmo ID:</strong>{" "}
                    {walletDetails?.venmoId || (
                      <span className="text-warning">Not Added</span>
                    )}
                  </ListGroupItem>
                  <ListGroupItem
                    style={{
                      background: "transparent",
                      color: "#fff",
                      border: "none",
                    }}
                  >
                    <SiZelle
                      style={{ marginRight: "10px", color: "#6C757D" }}
                    />
                    <strong>Zelle ID:</strong>{" "}
                    {walletDetails?.zelleId || (
                      <span className="text-warning">Not Added</span>
                    )}
                  </ListGroupItem>
                </ListGroup>
              </CardBody>
            </Card>
          ) : <div className="text-center">
          <p style={{ fontSize: "1.2rem", color: "#999" }}>
            Wallet not yet created.
          </p>
        </div>}
          <div className="text-end mt-3">
            {role === "Super-User" && walletDetails &&  
          <Button
          className="mr-4"
                    color="primary"
                    onClick={() => setDisableDialogOpen(true)}
                  >
                    Manage Payment Methods
                  </Button> }
            <Button color="light" onClick={onClose}>
              Close
            </Button>
          </div>
        </ModalBody>
      </Modal>
      <DisablePaymentMethodDialog
        open={disableDialogOpen}
        onClose={() => setDisableDialogOpen(false)}
        paymentMethods={walletDetails}
        record={record}
      />
    </>
  );
};

export default WalletDialog;
