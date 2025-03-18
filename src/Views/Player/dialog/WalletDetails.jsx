import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Divider,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import DescriptionIcon from "@mui/icons-material/Description";
import AOG_Symbol from "../../../Assets/icons/AOGsymbol.png";
import Docs from "../../../Assets/icons/Docs.svg";
import CashAppLogo from "../../../Assets/icons/cashapp_logo.svg";
import PayPalLogo from "../../../Assets/icons/paypal_logo.svg";
import VenmoLogo from "../../../Assets/icons/venmo_logo.svg";
import ZelleLogo from "../../../Assets/icons/zelle_logo.svg";
import FileCheck from "../../../Assets/icons/FileCheck.svg";
import Iicon from "../../../Assets/icons/Iicon.svg";
import PaymentSuccess from "../../../Assets/icons/payment-success.svg";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

export const WalletDetails = ({
  balance = 500,
  email = "johnmicheal@example.com",
}) => {
  // Sample transaction data
  const [emailDropdownOpen, setEmailDropdownOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("paypal");
  //   const [transactionNote, setTransactionNote] = useState('');
  const transactions = [
    {
      date: "20 February 2025",
      items: [
        {
          type: "Redeem Successful",
          time: "12:06:08 PM",
          tag: "D",
          amount: 100,
        },
      ],
    },
    {
      date: "18 February 2025",
      items: [
        {
          type: "Recharge Successful",
          time: "12:06:08 PM",
          tag: "D",
          amount: 20,
        },
        {
          type: "Recharge Successful",
          time: "12:06:08 PM",
          tag: "D",
          amount: 10,
        },
      ],
    },
    {
      date: "08 February 2025",
      items: [
        { type: "Confirmed", time: "12:06:08 PM", tag: "Zen", amount: 120 },
      ],
    },
  ];

  // Calculate total from transactions
  const totalTransactions = transactions.reduce(
    (acc, dateGroup) => acc + dateGroup.items.length,
    0
  );

  const handlePaymentMethodChange = (event) => {
    setPaymentMethod(event.target.value);
  };

  const toggleEmailDropdown = () => {
    setEmailDropdownOpen(!emailDropdownOpen);
  };

  return (
    <Box sx={{ padding: 0, bgcolor: '#F7FDF8' }}>
      {/* Header */}
      <Box sx={{ padding: "16px 20px" }}>
        <Typography
          variant="h6"
          sx={{ fontWeight: 500, fontSize: "16px", color: "#333" }}
        >
          Your Winnings: Cash Out Easily
        </Typography>

        {/* Amount options */}
        <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
          {[10, 20, 50, 100].map((amount) => (
            <Box
              key={amount}
              sx={{
                border: "1px dashed #ccc",
                borderRadius: "50px",
                padding: "6px 16px",
                fontSize: "14px",
                color: "#333",
              }}
            >
              {amount}
            </Box>
          ))}
        </Box>

        {/* Current balance */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: 3,
            mb: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <img
              src={AOG_Symbol}
              alt="AOG"
              style={{ width: "18px", marginRight: "8px" }}
            />
            <Typography
              component="span"
              sx={{ fontSize: "18px", fontWeight: 500 }}
            >
              500
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 2 }}>
            <img src={Docs} alt="Docs" />
            <Button
              sx={{
                bgcolor: "#F8FBFF",
                color: "black",
                padding: "4px 12px",
                border: "1px solid #D9DCE1",
                borderRadius: "4px",
                fontWeight: 700,
              }}
            >
              CASHOUT
            </Button>
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: 1,
            cursor: "pointer",
            py: 1,
          }}
          onClick={toggleEmailDropdown}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
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
            <Typography
              component="span"
              sx={{ fontSize: "14px", color: "#555" }}
            >
              {email}
            </Typography>
          </Box>
          {emailDropdownOpen ? (
            <KeyboardArrowUpIcon sx={{ fontSize: 16, color: "black" }} />
          ) : (
            <KeyboardArrowDownIcon sx={{ fontSize: 16, color: "black" }} />
          )}
        </Box>

        {/* Payment method dropdown content */}
        {emailDropdownOpen && (
          <Box sx={{ mt: 1, mb: 2, pl: 2 }}>
            <Typography sx={{ fontSize: "14px", color: "#666", mb: 1 }}>
              Change/Add/Edit payment method
            </Typography>

            <RadioGroup
              value={paymentMethod}
              onChange={handlePaymentMethodChange}
            >
              <FormControlLabel
                value="cashapp"
                control={<Radio size="small" />}
                label={
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Box
                      sx={{
                        mr: 1,
                      }}
                    >
                      <img
                        src={CashAppLogo}
                        alt="CashApp"
                        style={{ width: 20 }}
                      />
                    </Box>
                    <Typography sx={{ fontSize: "14px" }}>-</Typography>
                  </Box>
                }
              />

              <FormControlLabel
                value="paypal"
                control={<Radio size="small" checked={true} />}
                label={
                  <Box sx={{ display: "flex", alignItems: "center" }}>
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
                      <img
                        src={PayPalLogo}
                        alt="PayPal"
                        style={{ width: 16 }}
                      />
                    </Box>
                    <Typography sx={{ fontSize: "14px" }}>{email}</Typography>
                  </Box>
                }
              />

              <FormControlLabel
                value="venmo"
                control={<Radio size="small" />}
                label={
                  <Box sx={{ display: "flex", alignItems: "center" }}>
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
                    <Typography sx={{ fontSize: "14px" }}>-</Typography>
                  </Box>
                }
              />

              <FormControlLabel
                value="zelle"
                control={<Radio size="small" />}
                label={
                  <Box sx={{ display: "flex", alignItems: "center" }}>
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
                    <Typography sx={{ fontSize: "14px" }}>-</Typography>
                  </Box>
                }
              />
            </RadioGroup>

            <Button
              fullWidth
              sx={{
                bgcolor: "#6F42C1",
                color: "white",
                mt: 2,
                py: 1,
                ":hover": {
                  bgcolor: "#6F42C1",
                },
              }}
            >
              ADD/EDIT PAYMENT METHOD
            </Button>
          </Box>
        )}
      </Box>

      <Divider />

      {/* Transaction history */}
      <Box sx={{ padding: "0" }}>
        {/* Total transactions */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 20px",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Box
              sx={{
                bgcolor: "#D6F5DD",
                width: 40,
                height: 40,
                borderRadius: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                mr: 1,
              }}
            >
              <img src={FileCheck} alt="FileCheck" style={{ width: 24 }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: "14px", color: "#333" }}>
                Total number of transactions
              </Typography>
              <Typography
                sx={{ fontSize: "18px", fontWeight: 600, color: "#28A745" }}
              >
                {totalTransactions}
              </Typography>
            </Box>
          </Box>
          <ArrowForwardIosIcon sx={{ fontSize: 16, color: "#888" }} />
        </Box>

        {/* Last transactions */}
        <Box sx={{ padding: "16px 20px" }}>
          <Box sx={{ display: "flex", alignItems: "center",height:"32px",bgcolor:"#EDF7FF",paddingLeft:"10px" }}>
            <img src={Iicon} alt="Iicon" style={{ width: 16, marginRight: 8 }} />
            <Typography sx={{ fontSize: "12px", color: "#666" }}>
              Last {totalTransactions} transactions here
            </Typography>
          </Box>

          {/* Transaction items grouped by date */}
          {transactions.map((dateGroup, dateIndex) => (
            <Box key={dateIndex} sx={{ mb: 2 }}>
              <Typography
                sx={{display: "flex", alignItems: "center", fontSize: "14px", color: "#666", mb: 1,bgcolor:"#F5F5F5",height:"31px",paddingLeft:"10px"  }}
              >
                {dateGroup.date}
              </Typography>

              {dateGroup.items.map((item, itemIndex) => (
                <Box
                  key={itemIndex}
                  sx={{
                    bgcolor:"white",
                    height:"59px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    ml: 2,
                    mb: 1,
                    py: 1,
                    borderBottom:
                      itemIndex < dateGroup.items.length - 1
                        ? "1px solid #f0f0f0"
                        : "none",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "4px",
                        bgcolor: "#f0f0f0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mr: 2,
                      }}
                    >
                      <img
                        src={PaymentSuccess}
                        alt="PaymentSuccess"
                        style={{ width: 24 }}
                        />
                    </Box>
                    <Box>
                      <Typography
                        sx={{
                          fontSize: "14px",
                          fontWeight: 500,
                          color: item.type.includes("Successful")
                            ? "#4caf50"
                            : "#2196f3",
                        }}
                      >
                        {item.type}
                      </Typography>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Typography sx={{ fontSize: "12px", color: "#888" }}>
                          {item.time}
                        </Typography>
                        <Box
                          sx={{
                            fontSize: "10px",
                            color: "#888",
                            border: "1px solid #ddd",
                            borderRadius: "2px",
                            padding: "0 4px",
                          }}
                        >
                          {item.tag}
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                  <Typography sx={{ fontSize: "16px", fontWeight: 500 }}>
                    {item.amount}
                  </Typography>
                </Box>
              ))}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};
