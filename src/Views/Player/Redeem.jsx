import React, { useEffect, useState } from "react";
import { Box, Typography, Button } from "@mui/material";
import AOG_Symbol from "../../Assets/icons/AOGsymbol.png";
import useDeviceType from "../../Utils/Hooks/useDeviceType";
import Docs from "../../Assets/icons/Docs.svg";
import iIcon from "../../Assets/icons/Iicon.svg";
import { useGetIdentity } from "react-admin";
import { Parse } from "parse";

Parse.initialize(process.env.REACT_APP_APPID, process.env.REACT_APP_MASTER_KEY);
Parse.serverURL = process.env.REACT_APP_URL;

const Redeem = () => {
  const { isMobile } = useDeviceType();
  const [selectedRedeemAmount, setSelectedRedeemAmount] = useState(50);
  const { identity } = useGetIdentity();
  const [redeemFees, setRedeemFees] = useState(0);

  const transformedIdentity = {
    id: identity?.objectId,
    ...identity,
  };

  const parentServiceFee = async () => {
    try {
      const response = await Parse.Cloud.run("redeemParentServiceFee", {
        userId: transformedIdentity?.userParentId,
      });
      setRedeemFees(response?.redeemService || 0);
    } catch (error) {
      console.error("Error fetching parent service fee:", error);
    }
  };

  useEffect(() => {
    if (transformedIdentity?.userParentId) {
      parentServiceFee();
    }
  }, []);

  return (
    <>
      <Box
        sx={{
          borderBottomWidth: "1px",
          padding: "10px 16px",
        }}
      >
        {isMobile && (
          <Typography
            variant="body2"
            sx={{
              height: "19px",
              fontFamily: "Inter, sans-serif",
              fontWeight: 500,
              fontSize: "16px",
              color: "#4D4D4D", // Corrected text color
              mb: "8px",
            }}
          >
            Withdraw Your Winnings: Easy & Secure
          </Typography>
        )}
        <Box
          sx={{
            height: "32px",
            gap: "8px",
            display: "flex",
            alignItems: "center",
            bgcolor: " #EDF7FF",
            borderRadius: "4px",
            paddingLeft: "8px",
          }}
        >
          {/* Icon */}
          <img
            src={iIcon}
            alt="Info Icon"
            style={{ width: "16px", height: "16px" }}
          />

          {/* Text Box */}
          <Box
            sx={{
              height: "15px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Typography
              sx={{
                fontFamily: "Inter",
                fontWeight: 400,
                fontSize: "12px",
                lineHeight: "100%",
                letterSpacing: "0px",
                textAlign: "center",
              }}
            >
              Redeems may take up to 2 hours
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            height: "89px",
            gap: "16px",
          }}
        >
          <Box
            sx={{
              height: "40px",
              gap: "8px",
              paddingBottom: "8px",
            }}
          >
            {/* Amount Selection */}
            <Box sx={{ width: "100%", paddingTop: "8px" }}>
              <Box sx={{ display: "flex", gap: "6px" }}>
                {[10, 20, 50, 100].map((amount) => (
                  <Button
                    key={amount}
                    variant="outlined"
                    sx={{
                      borderRadius: "20px",
                      width: "64px",
                      padding: "2px 12px",
                      border:
                        amount !== selectedRedeemAmount
                          ? "1px dashed #7e57c2"
                          : "none",
                      bgcolor:
                        amount === selectedRedeemAmount
                          ? "#7e57c2"
                          : "transparent",
                      color:
                        amount === selectedRedeemAmount ? "white" : "black",
                      ":hover": {
                        border: "none",
                        bgcolor: "#7e57c2",
                        color: "white",
                      },
                    }}
                    onClick={() => setSelectedRedeemAmount(amount)}
                  >
                    {amount}
                  </Button>
                ))}
              </Box>
            </Box>
          </Box>

          <Box
            sx={{
              height: "48px",
              display: "flex", // Ensure flex container for proper alignment
              justifyContent: "space-between",
              alignItems: "center", // Align items vertically
              paddingTop: "8px",
            }}
          >
            {/* Redeem Action */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <img src={AOG_Symbol} alt="AOG Symbol" width={16} height={16} />
              <Typography sx={{ fontSize: "16px", fontWeight: 600 }}>
                {selectedRedeemAmount}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <img
                src={Docs}
                alt="Docs Icon"
                style={{ width: "24px", height: "24px" }}
              />
              <Button
                variant="outlined"
                sx={{
                  border: "1px solid #E0E0E0",
                  borderRadius: "6px",
                  fontSize: "14px",
                  fontWeight: "bold",
                  textTransform: "none",
                  padding: "6px 16px",
                }}
                // onClick={() => setRedeemDialogOpen(true)}
              >
                {!isMobile && "REDEEM"} REQUEST
              </Button>
            </Box>
          </Box>
        </Box>

        <Box
          sx={{
            height: "17px",
            marginTop: "12px", // Adjust top margin for proper spacing
            paddingLeft: "2px", // Small left padding for alignment
          }}
        >
          <Typography
            sx={{
              fontFamily: "Inter",
              fontWeight: 500,
              fontSize: "14px",
              lineHeight: "100%",
              letterSpacing: "0px",
              color: "#4D4D4D",
            }}
          >
            Redeem Service Fee @ {redeemFees}%
          </Typography>
        </Box>
      </Box>
    </>
  );
};

export default Redeem;
