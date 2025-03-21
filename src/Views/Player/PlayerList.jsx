import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Collapse,
  Stack,
  Button,
  Divider,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import WalletIcon from "../../Assets/icons/WalletIcon.svg";
import MoneyReceiveWhite from "../../Assets/icons/money-recive-light.svg";
import MoneyReceiveBlack from "../../Assets/icons/money-recive-dark.svg";
import MoneySendWhite from "../../Assets/icons/money-send-light.svg";
import MoneySendBlack from "../../Assets/icons/money-send-dark.svg";
import AOG_Symbol from "../../Assets/icons/AOGsymbol.png";
import { WalletDetails } from "./dialog/WalletDetails";
import { walletService } from "../../Provider/WalletManagement";
import useDeviceType from "../../Utils/Hooks/useDeviceType";
import { Loader } from "../Loader";
import { useNavigate } from "react-router-dom";
import Recharge from "./Recharge";
import Redeem from "./Redeem";

export const PlayerList = () => {
  const { isMobile } = useDeviceType();
  const [balance, setBalance] = useState();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [walletLoading, setWalletLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState("recharge");
  const role = localStorage.getItem("role");
  const navigate = useNavigate();

  useEffect(() => {
    WalletService();
  }, []);

  if (!role) {
    navigate("/login");
  }

  if (walletLoading) {
    return <Loader />;
  }

  async function WalletService() {
    setWalletLoading(true);
    try {
      const wallet = await walletService.getMyWalletData();
      console.log(wallet.wallet);
      setBalance(wallet.wallet.balance);
    } catch (error) {
      console.error("Failed to fetch wallet data:", error);
    } finally {
      setWalletLoading(false);
    }
  }

  const handleToggleDropdown = () => {
    setDropdownOpen((prevState) => !prevState);
  };

  return (
    <Box>
      <Box sx={{ width: "100%", padding: 0, margin: 0 }}>
        {/* Wallet Balance */}
        <Paper sx={{ margin: 0, borderRadius: 0, boxShadow: "none" }}>
          {/* Make the entire header area clickable */}
          <Box
            onClick={handleToggleDropdown}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: 2,
              bgcolor: "#F7FDF8",
              cursor: "pointer",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "top", gap: 1 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 1,
                  borderRadius: "4px",
                  backgroundColor: "#D6F5DD",
                  height: 40,
                  width: 40,
                }}
              >
                <img
                  src={WalletIcon}
                  alt="Wallet Icon"
                  style={{
                    width: 20,
                    height: 20,
                  }}
                />
              </Box>
              <Box>
                <Typography
                  variant="body1"
                  sx={{
                    marginLeft: "4px",
                    fontWeight: 500,
                    fontSize: "20px",
                  }}
                >
                  Wallet Balance
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    marginTop: "-8px",
                  }}
                >
                  <img
                    src={AOG_Symbol}
                    alt="AOG Symbol"
                    style={{ width: 20, height: 20, marginRight: 2 }}
                  />
                  <Typography
                    sx={{
                      color: "#109E38",
                      fontWeight: "600",
                      fontFamily: "Inter",
                      fontSize: "24px",
                    }}
                  >
                    {balance}
                  </Typography>
                </Box>
              </Box>
            </Box>
            <IconButton
              onClick={(e) => {
                e.stopPropagation(); // Prevent double triggering from the parent onClick
                handleToggleDropdown();
              }}
            >
              <ExpandMoreIcon
                sx={{
                  transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.3s",
                }}
              />
            </IconButton>
          </Box>

          <Collapse in={dropdownOpen}>
            <Box sx={{ borderTop: "1px solid #e0e0e0" }}>
              <WalletDetails />
            </Box>
          </Collapse>
        </Paper>
      </Box>

      {!dropdownOpen && (
        <>
          {isMobile && (
            <Box sx={{ bgcolor: "background.paper", p: 2 }}>
              <Stack
                direction="row"
                spacing={1}
                sx={{
                  display: "flex",
                  justifyContent: "space-around",
                  padding: "4px",
                  borderRadius: "8px",
                  border: "1px solid #CFD4DB",
                }}
              >
                <Button
                  variant={selectedTab === "recharge" ? "contained" : "text"}
                  size="small"
                  onClick={() => setSelectedTab("recharge")}
                  sx={{
                    width: "50%",
                    height: "40px",
                    fontSize: "16px",
                    fontWeight: 400,
                    textTransform: "none",
                  }}
                >
                  <img
                    src={
                      selectedTab === "recharge"
                        ? MoneySendWhite
                        : MoneySendBlack
                    }
                    alt="Money Send Icon"
                    style={{ width: 18, height: 18, marginRight: 8 }}
                  />
                  Recharge
                </Button>

                <Button
                  variant={selectedTab === "redeem" ? "contained" : "text"}
                  size="small"
                  onClick={() => setSelectedTab("redeem")}
                  sx={{
                    width: "50%",
                    height: "40px",
                    fontSize: "16px",
                    fontWeight: 400,
                    textTransform: "none",
                  }}
                >
                  <img
                    src={
                      selectedTab === "redeem"
                        ? MoneyReceiveWhite
                        : MoneyReceiveBlack
                    }
                    alt="Money Receive Icon"
                    style={{ width: 18, height: 18, marginRight: 8 }}
                  />
                  Redeem
                </Button>
              </Stack>
            </Box>
          )}

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              width: "100%",
              justifyContent: "space-between",
            }}
          >
            <Box width={{ xs: "100%", sm: "50%" }}>
              {!isMobile && (
                <Box
                  sx={{
                    padding: "16px",
                    bgcolor: "#F9F9F9",
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      height: "36px",
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 500,
                      fontSize: "24px",
                    }}
                  >
                    Recharge
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      height: "19px",
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 500,
                      fontSize: "16px",
                      color: "#4D4D4D", // Corrected text color
                      mt: "8px",
                    }}
                  >
                    Seamless Recharge: Add Funds Instantly
                  </Typography>
                </Box>
              )}

              {((isMobile && selectedTab === "recharge") || !isMobile) && (
                <Recharge />
              )}
            </Box>

            {!isMobile && (
              <Divider
                orientation="vertical"
                flexItem
                sx={{ height: "100%" }}
              />
            )}

            <Box width={{ xs: "100%", sm: "50%" }}>
              {!isMobile && (
                <Box
                  sx={{
                    padding: "16px",
                    bgcolor: "#F9F9F9",
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      height: "36px",
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 500,
                      fontSize: "24px",
                    }}
                  >
                    Redeem
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      height: "19px",
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 500,
                      fontSize: "16px",
                      color: "#4D4D4D", // Corrected text color
                      mt: "8px",
                    }}
                  >
                    Withdraw Your Winnings: Easy & Secure
                  </Typography>
                </Box>
              )}
              {((isMobile && selectedTab === "redeem") || !isMobile) && (
                <Redeem />
              )}
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
};
