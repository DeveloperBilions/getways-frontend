import React from "react";
import { Box, Button, Typography } from "@mui/material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import FileCheck from "../../Assets/icons/FileCheck.svg";
import Iicon from "../../Assets/icons/Iicon.svg";
import PaymentSuccess from "../../Assets/icons/payment-success.svg";
import { useRedirect } from "react-admin";
import useDeviceType from "../../Utils/Hooks/useDeviceType";
import FileCheckWhite from "../../Assets/icons/FileCheckWhite.svg";

const TransactionRecords = ({
  message,
  totalTransactions,
  transactionData,
  redirectUrl,
}) => {
  const redirect = useRedirect();
  const { isMobile } = useDeviceType();

  return (
    <Box
      sx={{
        padding: isMobile ? "16px" : "24px",
        backgroundColor: "#FFFFFF",
        borderRadius: "8px",
        border: "1px solid #E7E7E7",
        boxShadow: "0px 4px 16px rgba(0, 0, 0, 0.05)",
      }}
    >
      <Box
        sx={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "16px",
        }}
      >
        <Typography
          sx={{
            fontFamily: "Inter",
            fontWeight: 500,
            fontSize: isMobile ? "18px" : "20px",
            lineHeight: "100%",
            color: "#000000",
            textTransform: "none",
          }}
        >
          {message}
        </Typography>
        <Typography
          sx={{
            fontFamily: "Inter",
            fontWeight: 400,
            fontSize: isMobile ? "10px" : "12px",
            lineHeight: "100%",
            textAlign: "center",
            color: "#214670",
          }}
        >
          Last {transactionData.length} transactions here
        </Typography>
      </Box>
      <Box>
        {/* Transactions Summary */}
        <Box
          sx={{
            width: "100%",
            border: "1px solid #F4F3FC",
            borderRadius: "8px",
            marginBottom: "16px",
            bgcolor: "#F4F3FC",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: isMobile ? "12px" : "16px",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: isMobile ? "8px" : "12px",
              }}
            >
              <Box
                sx={{
                  width: isMobile ? "32px" : "40px",
                  height: isMobile ? "32px" : "40px",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "#2E5BFF",
                }}
              >
                <img
                  src={FileCheckWhite}
                  alt="Transaction Icon"
                  style={{
                    width: "20px",
                    height: "24px",
                  }}
                />
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontFamily: "Inter",
                    fontSize: isMobile ? "12px" : "14px",
                    color: "#333",
                  }}
                >
                  Total number of transactions
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "Inter",
                    fontSize: isMobile ? "16px" : "18px",
                    fontWeight: 600,
                    color: "#2E5BFF",
                    width: "50px",
                  }}
                >
                  {totalTransactions}
                </Typography>
              </Box>
            </Box>
            <Button
              onClick={() => {
                if (redirectUrl) {
                  redirect(`/${redirectUrl}`);
                }
              }}
            >
              <ArrowForwardIosIcon />
            </Button>
          </Box>
        </Box>

        {/* Transaction List - Show only top 5 transactions */}
        {transactionData.length > 0 ? (
          transactionData.map((item, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: isMobile ? "12px" : "16px",
                borderBottom:
                  index < transactionData.length - 1
                    ? "1px solid #E0E0E0"
                    : "none",
                bgcolor: "white",
              }}
            >
              <Box>
                <Typography
                  sx={{
                    fontFamily: "Inter",
                    fontSize: isMobile ? "14px" : "16px",
                  }}
                >
                  {item.status}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "Inter",
                    fontWeight: 400,
                    fontSize: isMobile ? "12px" : "14px",
                    color: "#808080",
                  }}
                >
                  {item.date} | {item.time}
                </Typography>
              </Box>
              <Typography
                sx={{
                  fontFamily: "Inter",
                  fontWeight: 500,
                  fontSize: isMobile ? "16px" : "18px",
                  color: "#000000",
                }}
              >
                {item.amount}
              </Typography>
            </Box>
          ))
        ) : (
          <Typography
            sx={{
              fontFamily: "Inter",
              fontSize: isMobile ? "12px" : "14px",
              color: "#666",
              padding: "16px",
              textAlign: "center",
            }}
          >
            No transactions available
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default TransactionRecords;
