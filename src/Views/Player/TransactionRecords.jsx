import React from "react";
import { Box, Typography } from "@mui/material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import FileCheck from "../../Assets/icons/FileCheck.svg";
import Iicon from "../../Assets/icons/Iicon.svg";
import PaymentSuccess from "../../Assets/icons/payment-success.svg";
import { useRedirect } from "react-admin";

const TransactionRecords = ({
  totalTransactions,
  transactionData,
  redirectUrl,
}) => {
  const redirect = useRedirect();
  return (
    <Box sx={{ padding: "0" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 24px",
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
          <Box
            onClick={() => {
              if (redirectUrl) {
                redirect(`/${redirectUrl}`);
              }
            }}
          >
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
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            height: "32px",
            bgcolor: "#EDF7FF",
            paddingLeft: "10px",
          }}
        >
          <img src={Iicon} alt="Iicon" style={{ width: 16, marginRight: 8 }} />
          <Typography sx={{ fontSize: "12px", color: "#666" }}>
            Last {totalTransactions} transactions here
          </Typography>
        </Box>

        {/* Transaction items grouped by date */}
        {transactionData.map((dateGroup, dateIndex) => (
          <Box key={dateIndex}>
            <Typography
              sx={{
                display: "flex",
                alignItems: "center",
                fontSize: "14px",
                color: "#666",
                // mb: 1,
                bgcolor: "#F5F5F5",
                height: "31px",
                paddingLeft: "16px",
                paddingRight: "16px",
              }}
            >
              {dateGroup.date}
            </Typography>

            {dateGroup.items.map((item, itemIndex) => (
              <Box
                key={itemIndex}
                sx={{
                  bgcolor: "white",
                  height: "59px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingLeft: "16px",
                  paddingRight: "16px",
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
                        color: item.color, // Apply dynamic color
                      }}
                    >
                      {item.type}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography sx={{ fontSize: "12px", color: "#888" }}>
                        {item.time}
                      </Typography>
                      {/* <Box
                            sx={{
                              fontSize: "10px",
                              color: "#888",
                              border: "1px solid #ddd",
                              borderRadius: "2px",
                              padding: "0 4px",
                            }}
                          >
                            {item.tag}
                          </Box> */}
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
  );
};

export default TransactionRecords;
