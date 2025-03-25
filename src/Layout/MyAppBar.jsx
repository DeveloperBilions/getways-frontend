import * as React from "react";
import { Toolbar, Typography, Box, IconButton, MenuItem } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import AppBar from "@mui/material/AppBar";
import {
  RefreshButton,
  UserMenu,
  useGetIdentity,
  useSidebarState,
  useLogout,
} from "react-admin";
import ChangePassword from "./ChangePassword";
import RechargeLimitDialog from "../Views/RechargeRecords/dialog/RechargeLimitDialog";
import DisablePaymentMethodDialog from "../Views/User/dialog/DisablePaymentMethodDialog";
import HelpVideoModal from "../Views/SignIn/HelpVideoModal";
import AllRedeemService from "../Views/User/dialog/AllRedeemService";
import EmergencyMessageDialog from "../Views/User/dialog/EmergencyMessageDialog";
import { padding, useMediaQuery } from "@mui/system";
import { useState } from "react";
import { walletService } from "../Provider/WalletManagement";
import { useEffect } from "react";
import AOG_Symbol from "../Assets/icons/AOGsymbol.png";

export default function MyAppBar(props) {
  const { identity } = useGetIdentity();
  const logout = useLogout();
  const [openModal, setOpenModal] = React.useState(false);
  const [openRechargeLimit, setOpenRechargeLimit] = React.useState(false);
  const [disableDialogOpen, setDisableDialogOpen] = React.useState(false);
  const [openHelpVideo, setOpenHelpVideo] = React.useState(false);
  const [openRedeemService, setOpenRedeemService] = React.useState(false);
  const [openEmergencyModal, setOpenEmergencyModal] = React.useState(false);
  const isMobile = useMediaQuery("(max-width:1023px)");
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const [open, setOpen] = useSidebarState(); // Use the sidebar state
  const [balance, setBalance] = useState();

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);
  const handleOpenRechargeLimit = () => setOpenRechargeLimit(true);
  const handleCloseRechargeLimit = () => setOpenRechargeLimit(false);
  const handleCloseEmergencyModal = () => setOpenEmergencyModal(false);

  const [activeTab, setActiveTab] = useState("users");

  const getBalance = async () => {
    try {
      const wallet = await walletService.getMyWalletData();
      setBalance(wallet?.wallet?.balance);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getBalance();
  }, []);

  // Toggle sidebar state
  const toggleSidebar = () => {
    setOpen(!open);
  };

  if (!identity) return null;

  // Generate menu items for the desktop navigation
  const menuItems = [];
  if (role && role !== "Player") {
    menuItems.push(
      {
        key: "users",
        label: "User Management",
        onClick: () => navigate("/users"),
      },
      {
        key: "rechargeRecords",
        label: "Recharge Records",
        onClick: () => navigate("/rechargeRecords"),
      },
      {
        key: "redeemRecords",
        label: "Redeem Records",
        onClick: () => navigate("/redeemRecords"),
      },
      {
        key: "summary",
        label: "Summary",
        onClick: () => navigate("/summary"),
      }
    );
    if (role === "Super-User") {
      menuItems.push({
        key: "reports",
        label: "Reports",
        onClick: () => navigate("/Reports"),
      });
    }
  }

  return (
    <AppBar
      sx={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0",
        backgroundColor: "var(--primary-color)",
        top: 0,
        width: "100%",
        height: role === "Player" ? "4em" : "3.5em",
        color: "white",
        zIndex: 1300,
        paddingLeft: role === "Player" && !isMobile ? "272px" : "0",
        paddingRight: role === "Player" && !isMobile ? "300px" : "0",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", pl: { xs: 2, sm: 1 } }}>
        {/* Only show menu icon on mobile */}
        <Toolbar
          sx={{
            width: "auto",
            cursor: "pointer",
            padding: 0,
            minHeight: role === "Player" ? "4em" : "3.5em",
          }}
          onClick={() => navigate("/")}
        >
          <img
            src="/assets/company_logo.svg"
            alt="Company Logo"
            loading="lazy"
            style={{
              maxHeight: "3em",
              width: "auto",
            }}
          />
        </Toolbar>

        {/* Desktop navigation - only show on non-mobile */}
        {!isMobile && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "var(--primary-color)",
              "& > *": {
                height: "3.5em",
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                fontWeight: 400,
                padding: "0 5px",
                // "&:hover": {
                //   backgroundColor: "#333",
                // },
              },
            }}
          >
            {menuItems.map((item) => (
              <Box>
                <Box
                  key={item.key}
                  onClick={() => {
                    setActiveTab(item.key);
                    item.onClick();
                  }}
                  sx={{
                    color: "white",
                    textTransform: "none",
                    bgcolor: activeTab === item.key ? "#292929" : "none",
                    borderRadius: activeTab === item.key ? "4px" : "0px",
                    padding: "0 1em",
                    height: "2.5rem",
                    display: "flex",
                    alignItems: "center", // Vertically center the text
                    ":hover": {
                      backgroundColor: "#292929",
                      borderRadius: "4px",
                    },
                  }}
                >
                  {item.icon} {item.label}
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Box>
      {role === "Player" && (
        <Box sx={{ width: "100%", display: "flex", justifyContent: "center" }}>
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            {" "}
            <Typography
              variant="body2"
              sx={{
                color: "#fff", // Gray color for "Available balance"
                fontSize: { xs: "14px", sm: "18px" },
                fontWeight: 400,
              }}
            >
              Wallet balance
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <img
                src={AOG_Symbol}
                alt="AOG Symbol"
                style={{ width: 24, height: 24 }}
              />
              <Typography
                sx={{
                  color: "#fff", // Black for the balance
                  fontWeight: "600",
                  fontFamily: "Inter",
                  fontSize: { xs: "20px", sm: "24px" },
                }}
              >
                {balance}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          flexGrow: 1,
          backgroundColor: "var(--primary-color)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", ml: 2 }}>
          {role === "Agent" && identity?.balance !== undefined && (
            <Box sx={{ display: "flex", alignItems: "center", mt: 0.5 }}>
              <AccountBalanceWalletIcon sx={{ fontSize: 18, mr: 0.5 }} />
              <span
                style={{ fontWeight: 600, color: "var(--secondery-color)" }}
              >
                Balance: {identity.balance}
              </span>
            </Box>
          )}
          {role !== "Player" && !isMobile && (
            <Box sx={{ ml: 1, minWidth: 0 }}>
              <Typography
                noWrap
                variant="subtitle2"
                sx={{
                  color: "white",
                  fontWeight: 500,
                  fontSize: { xs: "0.8rem", md: "1rem" },
                  maxWidth: { xs: "100px", md: "200px" },
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {identity?.name}
              </Typography>
            </Box>
          )}
          {role !== "Player" && !isMobile && (
            <RefreshButton
              label=""
              icon={
                <RefreshIcon
                  sx={{
                    fontSize: { xs: "20px !important", md: "24px !important" },
                    marginRight: "-6px",
                  }}
                />
              }
              sx={{
                color: "white",
                minWidth: { xs: "30px", md: "40px" },
                justifyContent: "flex-end",
                ml: 1,
              }}
            />
          )}
          <UserMenu sx={{ ml: 1 }}>
            <Box sx={{ width: "248px" }}>
              {(role === "Agent" ||
                role === "Player" ||
                role === "Master-Agent") && (
                <MenuItem
                  onClick={handleOpenModal}
                  style={{
                    color: "#000000",
                    fontWeight: 400,
                    fontSize: "16px",
                  }}
                >
                  Change Password
                </MenuItem>
              )}
              {(role === "Agent" || role === "Master-Agent") && (
                <MenuItem
                  onClick={handleOpenRechargeLimit}
                  style={{
                    color: "#000000",
                    fontWeight: 400,
                    fontSize: "16px",
                  }}
                >
                  Recharge Limit
                </MenuItem>
              )}
              {role === "Super-User" && (
                <MenuItem
                  onClick={() => setDisableDialogOpen(true)}
                  style={{
                    color: "#000000",
                    fontWeight: 400,
                    fontSize: "16px",
                  }}
                >
                  Payment Methods
                </MenuItem>
              )}
              {role === "Super-User" && (
                <MenuItem
                  onClick={() => {
                    navigate("/transactionData");
                  }}
                  style={{
                    color: "#000000",
                    fontWeight: 400,
                    fontSize: "16px",
                  }}
                >
                  Transaction Export
                </MenuItem>
              )}
              {role === "Super-User" && (
                <MenuItem
                  onClick={() => setOpenEmergencyModal(true)}
                  style={{
                    color: "#000000",
                    fontWeight: 400,
                    fontSize: "16px",
                  }}
                >
                  Emergency Message
                </MenuItem>
              )}
              {identity?.redeemServiceEnabled && role === "Master-Agent" && (
                <MenuItem
                  onClick={() => setOpenRedeemService(true)}
                  style={{
                    color: "#000000",
                    fontWeight: 400,
                    fontSize: "16px",
                  }}
                >
                  Agent Redeem Fees
                </MenuItem>
              )}
              <MenuItem
                onClick={() => setOpenHelpVideo(true)}
                style={{ color: "#000000", fontWeight: 400, fontSize: "16px" }}
              >
                Help Videos
              </MenuItem>
              <MenuItem
                onClick={() => logout()}
                style={{ color: "#000000", fontWeight: 400, fontSize: "16px" }}
              >
                Logout
              </MenuItem>{" "}
            </Box>
          </UserMenu>
          {isMobile && role !== "Player" && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={toggleSidebar}
              sx={{ mr: 1, ml: 0.5 }}
            >
              {open ? <CloseIcon /> : <MenuIcon />}
            </IconButton>
          )}
        </Box>
      </Box>
      <ChangePassword open={openModal} onClose={handleCloseModal} />
      <RechargeLimitDialog
        open={openRechargeLimit}
        onClose={handleCloseRechargeLimit}
      />
      <DisablePaymentMethodDialog
        open={disableDialogOpen}
        onClose={() => setDisableDialogOpen(false)}
      />
      <HelpVideoModal
        open={openHelpVideo}
        handleClose={() => setOpenHelpVideo(false)}
      />
      <AllRedeemService
        open={openRedeemService}
        onClose={() => setOpenRedeemService(false)}
      />
      <EmergencyMessageDialog
        open={openEmergencyModal}
        onClose={handleCloseEmergencyModal}
      />
    </AppBar>
  );
}
