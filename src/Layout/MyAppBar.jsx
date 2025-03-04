import * as React from "react";
import { Toolbar, Typography, Box, MenuItem } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import RefreshIcon from "@mui/icons-material/Refresh";
import MenuIcon from "@mui/icons-material/Menu";
import { useNavigate } from "react-router-dom";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import AppBar from "@mui/material/AppBar";
import {
  TitlePortal,
  RefreshButton,
  UserMenu,
  Logout,
  useGetIdentity,
  useSidebarState,
} from "react-admin";
import ChangePassword from "./ChangePassword";
import RechargeLimitDialog from "../Views/RechargeRecords/dialog/RechargeLimitDialog";
import DisablePaymentMethodDialog from "../Views/User/dialog/DisablePaymentMethodDialog";
import HelpVideoModal from "../Views/SignIn/HelpVideoModal";
import AllRedeemService from "../Views/User/dialog/AllRedeemService";

export default function MyAppBar(props) {
  const { identity } = useGetIdentity();
  const [open, setOpen] = useSidebarState(); // Sidebar state
  const [openModal, setOpenModal] = React.useState(false);
  const [openRechargeLimit, setOpenRechargeLimit] = React.useState(false);
  const [disableDialogOpen, setDisableDialogOpen] = React.useState(false);
  const [openHelpVideo, setOpenHelpVideo] = React.useState(false);
  const [openRedeemService, setOpenRedeemService] = React.useState(false);

  const role = localStorage.getItem("role");
  const navigate = useNavigate();

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);
  const handleOpenRechargeLimit = () => setOpenRechargeLimit(true);
  const handleCloseRechargeLimit = () => setOpenRechargeLimit(false);
  const toggleSidebar = () => setOpen(!open); // Toggle sidebar

  return (
    <AppBar
      sx={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingRight: { xs: "0.5em", md: "1em" }, // Reduce padding on small screens
        paddingLeft: { xs: "0.5em", md: "1em" },
        backgroundColor: "#272E35",
        position: "fixed",
        top: 0,
        width: "100%",
        height: "3.5em",
        color: "white",
        zIndex: 1300, // Above sidebar
      }}
    >
      {/* Left Section: Menu Button, Logo, and Title */}
      <Box sx={{ display: "flex", alignItems: "center" }}>
        {/* Hamburger Menu for small screens */}
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={toggleSidebar}
          sx={{ display: { xs: "block", sm: "none" } }} // Show only on small screens
        >
          <MenuIcon />
        </IconButton>

        {/* Logo */}
        <Toolbar
          sx={{
            width: { xs: "auto", md: "15em" }, // Auto width on mobile, fixed on desktop
            cursor: "pointer",
            padding: { xs: "0 0.5em", md: "0" }, // Adjust padding for mobile
          }}
          onClick={() => navigate("/")}
        >
          <img
            src="/assets/company_logo.svg"
            alt="Company Logo"
            loading="lazy"
            style={{
              maxHeight: { xs: "2em", md: "3em" }, // Smaller logo on mobile
              width: "auto",
            }}
          />
        </Toolbar>

        {/* Title */}
        <TitlePortal
          variant="h5"
          component="h3"
          sx={{
            paddingLeft: { xs: 12, md: 0 }, // Adjust padding for mobile
            fontSize: { xs: "1.2rem", md: "1.5rem" }, // Smaller font on mobile
            display: { xs: "none", sm: "block" }, // Hide on very small screens
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        />
      </Box>

      {/* Right Section: User Info, Refresh, and Menu */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: { xs: 0.5, md: 1 }, // Reduce gap on mobile
        }}
      >
        {/* User Name */}
        <Box sx={{ ml: 0, minWidth: 0 }}>
          <Typography
            noWrap
            variant="subtitle2"
            sx={{
              color: "white",
              fontWeight: 500,
              fontSize: { xs: "0.8rem", md: "1rem" }, // Smaller text on mobile
              maxWidth: { xs: "100px", md: "200px" }, // Limit width to prevent overflow
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {identity?.name}
          </Typography>
        </Box>

        {/* Refresh Button */}
        <RefreshButton
          label=""
          icon={
            <RefreshIcon
              sx={{
                fontSize: { xs: "20px !important", md: "24px !important" }, // Smaller icon on mobile
                marginRight: "-6px",
              }}
            />
          }
          sx={{
            color: "white",
            minWidth: { xs: "30px", md: "40px" }, // Smaller button on mobile
            justifyContent: "flex-end",
          }}
        />

        {/* User Menu */}
        <UserMenu>
          {(role === "Agent" ||
            role === "Player" ||
            role === "Master-Agent") && (
            <MenuItem onClick={handleOpenModal} style={{ color: "#0000008a" }}>
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
      </Box>

      {/* Dialogs */}
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
    </AppBar>
  );
}
