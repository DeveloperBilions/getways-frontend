import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  Row,
  Col,
  Card,
  CardBody,
} from "reactstrap";
import { Box, Typography } from "@mui/material";
import { Loader } from "../../Loader";
import { Parse } from "parse";
import DisablePaymentMethodDialog from "./DisablePaymentMethodDialog";
import WalletIcon from "../../../Assets/icons/WalletIcon.svg";
import PayPalLogo from "../../../Assets/icons/paypal_logo.svg";
import CashAppLogo from "../../../Assets/icons/cashapp_logo.svg";
import VenmoLogo from "../../../Assets/icons/venmo_logo.svg";
import ZelleLogo from "../../../Assets/icons/zelle_logo.svg";
// Initialize Parse
Parse.initialize(process.env.REACT_APP_APPID, process.env.REACT_APP_MASTER_KEY);
Parse.serverURL = process.env.REACT_APP_URL;

const PaypalBox = () => {
  return (
    <Box
      sx={{
        bgcolor: "#CFE6F2",
        color: "white",
        width: 20,
        height: 20,
        borderRadius: "4px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "12px",
        mr: 1,
      }}
    >
      <img src={PayPalLogo} alt="PayPal" style={{ width: 16 }} />
    </Box>
  );
};
const CashAppBox = () => {
  return (
    <Box
      sx={{
        mr: 1,
      }}
    >
      <img src={CashAppLogo} alt="CashApp" style={{ width: 20 }} />
    </Box>
  );
};
const VenmoBox = () => {
  return (
    <Box
      sx={{
        bgcolor: "#CCE8FF",
        color: "white",
        width: 20,
        height: 20,
        borderRadius: "4px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "12px",
        mr: 1,
      }}
    >
      <img src={VenmoLogo} alt="Venmo" style={{ width: 16 }} />
    </Box>
  );
};
const ZelleBox = () => {
  return (
    <Box
      sx={{
        bgcolor: "#E3D2F9",
        color: "white",
        width: 20,
        height: 20,
        borderRadius: "4px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "12px",
        mr: 1,
      }}
    >
      <img src={ZelleLogo} alt="Zelle" style={{ width: 16 }} />
    </Box>
  );
};

const WalletDialog = ({ open, onClose, record }) => {
  const [walletDetails, setWalletDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [disableDialogOpen, setDisableDialogOpen] = useState(false);
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
            status: { $in: [11, 12] },
          },
        }, // Match userId and status

        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ];
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
              <div
                className="alert alert-success d-flex justify-content-between align-items-center"
                style={{
                  border: "1px solid #22C55E",
                  borderRadius: "4px",
                  padding: "16px",
                  backgroundColor: "#DCFCE7",
                }}
                role="alert"
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "40px",
                      height: "40px",
                      borderRadius: "4px",
                      backgroundColor: "#D6F5DD",
                    }}
                  >
                    <img
                      src={WalletIcon}
                      alt="wallet"
                      style={{ width: "20px", height: "20px" }}
                    />
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: "18px",
                        color: "#000",
                        fontWeight: "400",
                      }}
                    >
                      Available Balance
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    fontSize: "24px",
                    color: "#000",
                    fontWeight: "400",
                  }}
                >
                  ${walletDetails?.balance || 0}
                </div>
              </div>
              <Card
                // className="shadow-sm"
                style={{ border: "none" }}
              >
                {/* Payment Methods */}
                <CardBody
                  style={{
                    background: "#F2F2F2",
                    borderRadius: "4px",
                    border: "1px solid #CFD4DB",
                  }}
                >
                  <Typography
                    sx={{ fontSize: "18px", fontWeight: "400", mb: 1 }}
                  >
                    Payment Methods
                  </Typography>
                  {[
                    { icon: CashAppBox, value: walletDetails?.cashAppId },
                    { icon: PaypalBox, value: walletDetails?.paypalId },
                    { icon: VenmoBox, value: walletDetails?.venmoId },
                    { icon: ZelleBox, value: walletDetails?.zelleId },
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
                      <div
                        style={{
                          // marginLeft: "10px",
                          display: "flex",
                          alignItems: "center",
                          // gap: "8px",
                        }}
                      >
                        <item.icon />
                        <div style={{ color: item.value ? "#000" : "#FF8C00", fontWeight: "400", fontSize: "16px" }}>
                          {item.value || "Not added"}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardBody>

                {/* Cashout Statistics */}
                <CardBody
                  style={{
                    background: "#F2F2F2",
                    borderRadius: "4px",
                    border: "1px solid #CFD4DB",
                    marginTop: "20px",
                  }}
                >
                  <Typography sx={{fontSize:"18px",fontWeight:400,mb:1}}>Cashout Status</Typography>
                  <Row>
                    {[
                      {
                        label: "In Progress",
                        value: cashoutStats.inProgressCount,
                      },
                      {
                        label: "Completed",
                        value: cashoutStats.completedCount,
                      },
                      { label: "Retried", value: cashoutStats.retriedCount },
                    ].map((item, index) => (
                      <Col key={index} xs="4">
                        <div
                          style={{
                            background: "#fff",
                            padding: "10px",
                            borderRadius: "6px",
                            fontWeight: "bold",
                          }}
                        >
                          <span style={{ color: "gray", fontWeight: "600",fontSize:"12px",whiteSpace:"nowrap"}}>
                            {" "}
                            {item.label}
                          </span>
                          <div style={{ fontSize: "16px",fontWeight:400, marginTop: "5px" }}>
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
