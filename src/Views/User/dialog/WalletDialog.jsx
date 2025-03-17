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
  const role = localStorage.getItem("role");
  const [cashoutStats, setCashoutStats] = useState({
    inProgressCount: 0,
    completedCount: 0,
    retriedCount: 0,
  });

  useEffect(() => {
    const fetchWalletDetails = async () => {
      setLoading(true);
      try {
        const walletQuery = new Parse.Query("Wallet");
        walletQuery.equalTo("userID", record.id); // Query by the user ID
        const wallet = await walletQuery.first();
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
        } else {
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
      fetchCashoutStats(record.id).then((stats) => {
        setCashoutStats(stats);
      });
    }
  }, [open, record]);

  const fetchCashoutStats = async (userId) => {
    try {
      const now = new Date();
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000); // 2 hours ago
      const pipeline = [
        { 
          $match: { 
            userId: userId, 
            status: { $in: [11, 12] } 
          } 
        }, // Match userId and status
  
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]
      const query = new Parse.Query("TransactionRecords");
      const results = await query.aggregate(pipeline);
     // Count retried transactions separately with a direct query
     const retriedCountQuery = new Parse.Query("TransactionRecords");
     retriedCountQuery.equalTo("userId", userId);
     retriedCountQuery.equalTo("status", 11);
     retriedCountQuery.lessThan("updatedAt", twoHoursAgo);
     
     const retriedCount = await retriedCountQuery.count();

      let inProgressCount = 0;
      let completedCount = 0;
  
      results.forEach((result) => {
        if (result.objectId === 11) {
          inProgressCount = result.count;
        } else if (result.objectId === 12) {
          completedCount = result.count;
        }
      });
  
      return { inProgressCount, completedCount, retriedCount };
    } catch (error) {
      console.error("Error fetching cashout stats:", error);
      return { inProgressCount: 0, completedCount: 0, retriedCount: 0 };
    }
  };
  
  return (
    <>
     <Modal isOpen={open} toggle={onClose} size="md" centered>
      <ModalHeader toggle={onClose}>Wallet Details</ModalHeader>
      <ModalBody>
        {loading ? (
          <Loader />
        ) : walletDetails ? (
          <>
        <div class="alert alert-success d-flex justify-content-between align-items-center" role="alert">
          <span>Available Balance</span>
              <span style={{ fontSize: "1.5rem", color: "#000" }}>
                ${walletDetails?.balance || 0}
              </span>
          </div>
          <Card className="shadow-sm" style={{ borderRadius: "10px", backgroundColor: "#fff" }}>
            {/* Payment Methods */}
            <CardBody style={{ background: "#F7F7F7", borderRadius: "8px" }}>
              <h5 className="mb-3">Payment Methods</h5>
              {[  
                { label: "CashApp ID", value: walletDetails?.cashAppId },
                { label: "PayPal", value: walletDetails?.paypalId },
                { label: "Venmo ID", value: walletDetails?.venmoId },
                { label: "Zelle ID", value: walletDetails?.zelleId}
              ].map((item, index) => (
                <div
                  key={index}
                  style={{
                    backgroundColor: "#fff",
                    borderRadius: "6px",
                    padding: "12px",
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "10px",
                  }}
                >
                  <div style={{ marginLeft: "10px", flexGrow: 1 }}>
                    <span style={{color:"gray",fontWeight:"600"}}>{item.label}</span>
                    <div style={{ color: item.value ? "#000" : "#FF8C00" }}>
                      {item.value || "Not added"}
                    </div>
                  </div>
                </div>
              ))}
            </CardBody>

            {/* Cashout Statistics */}
            <CardBody style={{ background: "#F7F7F7", borderRadius: "8px", marginTop: "10px" }}>
              <h5 className="mb-3">Cashout Statistics</h5>
              <Row>
                {[
                  { label: "In Progress", value: cashoutStats.inProgressCount },
                  { label: "Completed", value: cashoutStats.completedCount },
                  { label: "Retried", value: cashoutStats.retriedCount },
                ].map((item, index) => (
                  <Col key={index} xs="4" className="text-center">
                    <div
                      style={{
                        background: "#fff",
                        padding: "10px",
                        borderRadius: "6px",
                        fontWeight: "bold",
                      }}
                    >
                     <span style={{color:"gray",fontWeight:"600"}}> {item.label}</span>
                      <div style={{ fontSize: "1.5rem", marginTop: "5px" }}>
                        {item.value}
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            </CardBody>
          </Card>
          </>
        ) : (
          <div className="text-center">
            <p style={{ fontSize: "1.2rem", color: "#999" }}>
              Wallet not yet created.
            </p>
          </div>
        )}

        {/* Close Button */}
        <div className="text-end mt-3">
          <Button color="secondary" onClick={onClose}>
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
