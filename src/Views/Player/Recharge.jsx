import React, { useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Button,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import WalletIcon from "../../Assets/icons/WalletIcon.svg";
import AOG_Symbol from "../../Assets/icons/AOGsymbol.png";
import useDeviceType from "../../Utils/Hooks/useDeviceType";
import Docs from "../../Assets/icons/Docs.svg";
import { useGetIdentity } from "react-admin";

const Recharge = () => {
  const { isMobile } = useDeviceType();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedRechargeAmount, setSelectedRechargeAmount] = useState(50);
  const { identity } = useGetIdentity();


  const handleToggleDropdown = () => {
    setDropdownOpen((prevState) => !prevState);
  };
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
              // mt: "8px",
              mb: "8px",
            }}
          >
            Seamless Recharge: Add Funds Instantly
          </Typography>
        )}
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
                    amount !== selectedRechargeAmount
                      ? "1px dashed #7e57c2"
                      : "none",
                  bgcolor:
                    amount === selectedRechargeAmount
                      ? "#7e57c2"
                      : "transparent",
                  color: amount === selectedRechargeAmount ? "white" : "black",
                  ":hover": {
                    border: "none",
                    bgcolor: "#7e57c2",
                    color: "white",
                  },
                }}
                onClick={() => setSelectedRechargeAmount(amount)}
              >
                {amount}
              </Button>
            ))}
          </Box>

          <Box
            sx={{
              height: "56px",
              display: "flex", // Required for justifyContent to work
              justifyContent: "space-between",
              paddingTop: "8px",
              paddingBottom: "8px",
            }}
          >
            <Box
              sx={{
                height: "40px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center", // Ensures vertical alignment
                paddingTop: "8px",
                paddingRight: "24px",
                paddingBottom: "8px",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <img
                  src={AOG_Symbol}
                  alt="AOG Symbol"
                  style={{ width: "16px", height: "16px" }}
                />
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 600,
                    fontSize: "18px",
                    lineHeight: "100%",
                    letterSpacing: "0px",
                    color: "#000000", // Ensure visibility
                  }}
                >
                  {selectedRechargeAmount}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <img
                src={Docs}
                alt="Docs Icon"
                style={{ width: "24px", height: "24px", marginRight: 8 }}
              />
              <Button
                variant="contained"
                sx={{
                  width: "118px",
                  height: "40px",
                  gap: "24px",
                  paddingTop: "8px",
                  paddingRight: "20px",
                  paddingBottom: "8px",
                  paddingLeft: "20px",
                  borderRadius: "4px",
                  backgroundColor: "#28A745",
                  color: "#FFFFFF",
                  "&:disabled": {
                    backgroundColor: "#A5D6A7", // Optional: Lighter green for disabled state
                  },
                }}
                
                disabled={identity?.isBlackListed}
              >
                RECHARGE
              </Button>
            </Box>
          </Box>

          <Box
            sx={{
              height: "52px",
              gap: "8px",
              paddingTop: "8px",
              paddingBottom: "8px",
            }}
          >
            <Box
              sx={{
                height: "36px",
                display: "flex",
                justifyContent: "space-between",
                paddingTop: "8px",
                paddingBottom: "8px",
              }}
            >
              <Box
                sx={{
                  height: "20px",
                  display: "flex", // Ensure alignment
                  alignItems: "center", // Align icon vertically
                  gap: "6.67px", // Adjust spacing between elements
                }}
              >
                <img
                  src={WalletIcon}
                  alt="Wallet Icon"
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "3.33px",
                    padding: "6.67px",
                  }}
                />

                <Box
                  sx={{
                    height: "17px",
                    display: "flex", // Ensures alignment
                    alignItems: "center", // Aligns text properly
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 500,
                      fontSize: "14px",
                      lineHeight: "100%",
                      letterSpacing: "0px",
                    }}
                  >
                    Wallet
                  </Typography>
                </Box>

                <Box>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent double triggering from the parent onClick
                      handleToggleDropdown();
                    }}
                  >
                    <ExpandMoreIcon
                      sx={{
                        transform: dropdownOpen
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                        transition: "transform 0.3s",
                      }}
                    />
                  </IconButton>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default Recharge;
