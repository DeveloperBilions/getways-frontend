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
  Logout,
  useGetIdentity,
  useSidebarState,
} from "react-admin";
import PersonIcon from "@mui/icons-material/Person";
import LocalAtmIcon from "@mui/icons-material/LocalAtm";
import SummarizeIcon from "@mui/icons-material/Summarize";
import AnnouncementIcon from "@mui/icons-material/Announcement";
import ChangePassword from "./ChangePassword";
import RechargeLimitDialog from "../Views/RechargeRecords/dialog/RechargeLimitDialog";
import DisablePaymentMethodDialog from "../Views/User/dialog/DisablePaymentMethodDialog";
import HelpVideoModal from "../Views/SignIn/HelpVideoModal";
import AllRedeemService from "../Views/User/dialog/AllRedeemService";
import EmergencyMessageDialog from "../Views/User/dialog/EmergencyMessageDialog";
import { useMediaQuery } from "@mui/system";

export default function MyAppBar(props) {
  const { identity } = useGetIdentity();
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

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);
  const handleOpenRechargeLimit = () => setOpenRechargeLimit(true);
  const handleCloseRechargeLimit = () => setOpenRechargeLimit(false);
  const handleCloseEmergencyModal = () => setOpenEmergencyModal(false);

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
        height: "3.5em",
        color: "white",
        zIndex: 1300,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", pl: { xs: 2, sm: 1 } }}>
        {/* Only show menu icon on mobile */}
        <Toolbar
          sx={{
            width: "auto",
            cursor: "pointer",
            padding: 0,
            minHeight: "3.5em",
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
                padding: "0 1em",
                height: "3.5em",
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                fontWeight: 400,
                "&:hover": {
                  backgroundColor: "#333",
                },
              },
            }}
          >
            {menuItems.map((item) => (
              <Box
                key={item.key}
                onClick={item.onClick}
                sx={{
                  color: "white",
                  textTransform: "none",
                  padding: "0 1em",
                  height: "3.5em",
                  display: "flex",
                  alignItems: "center", // Vertically center the text
                  "&:hover": {
                    transition: "background-color 0.3s ease", // Smooth transition
                    borderRadius: "8px",
                  },
                }}
              >
                {item.icon} {item.label}
              </Box>
            ))}
          </Box>
        )}
      </Box>
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
          {(role === "Master-Agent" || role === "Agent") &&
            identity?.balance !== undefined && (
              <Box sx={{ display: "flex", alignItems: "center", mt: 0.5 }}>
                <AccountBalanceWalletIcon sx={{ fontSize: 18, mr: 0.5 }} />
                <span
                  style={{ fontWeight: 600, color: "var(--secondery-color)" }}
                >
                  Balance: {identity.balance}
                </span>
              </Box>
            )}
          {!isMobile && (
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
          {!isMobile && (
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
            {(role === "Agent" ||
              role === "Player" ||
              role === "Master-Agent") && (
              <MenuItem
                onClick={handleOpenModal}
                style={{ color: "#0000008a" }}
              >
                <LockOutlinedIcon sx={{ marginRight: 1 }} /> Change Password
              </MenuItem>
            )}
            {(role === "Agent" || role === "Master-Agent") && (
              <MenuItem
                onClick={handleOpenRechargeLimit}
                style={{ color: "#0000008a" }}
              >
                <AccountBalanceWalletIcon sx={{ marginRight: 1 }} /> Recharge
                Limit
              </MenuItem>
            )}
            {role === "Super-User" && (
              <MenuItem
                onClick={() => setDisableDialogOpen(true)}
                style={{ color: "#0000008a" }}
              >
                <AccountBalanceWalletIcon sx={{ marginRight: 1 }} /> Payment
                Methods
              </MenuItem>
            )}
            {role === "Super-User" && (
              <MenuItem
                onClick={() => {
                  navigate("/transactionData");
                }}
                style={{ color: "#0000008a" }}
              >
                <AccountBalanceWalletIcon sx={{ marginRight: 1 }} /> Transaction
                Export
              </MenuItem>
            )}
            {role === "Super-User" && (
              <MenuItem
                onClick={() => setOpenEmergencyModal(true)}
                style={{ color: "#0000008a" }}
              >
                <AnnouncementIcon sx={{ marginRight: 1 }} /> Emergency Message
              </MenuItem>
            )}
            {identity?.redeemServiceEnabled && role === "Master-Agent" && (
              <MenuItem
                onClick={() => setOpenRedeemService(true)}
                style={{ color: "#0000008a" }}
              >
                <MonetizationOnIcon sx={{ marginRight: 1 }} /> Agent Redeem Fees
              </MenuItem>
            )}
            <MenuItem
              onClick={() => setOpenHelpVideo(true)}
              style={{ color: "#0000008a" }}
            >
              <HelpOutlineIcon sx={{ marginRight: 1 }} /> Help Videos
            </MenuItem>
            <Logout style={{ color: "#0000008a" }} />
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
