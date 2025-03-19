import * as React from "react";
import {
  Toolbar,
  Typography,
  Box,
  MenuItem,
  Menu,
  IconButton,
} from "@mui/material";
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
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [openModal, setOpenModal] = React.useState(false);
  const [openRechargeLimit, setOpenRechargeLimit] = React.useState(false);
  const [disableDialogOpen, setDisableDialogOpen] = React.useState(false);
  const [openHelpVideo, setOpenHelpVideo] = React.useState(false);
  const [openRedeemService, setOpenRedeemService] = React.useState(false);
  const [openEmergencyModal, setOpenEmergencyModal] = React.useState(false);
  const isMobile = useMediaQuery("(max-width:1023px)");
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);
  const handleOpenRechargeLimit = () => setOpenRechargeLimit(true);
  const handleCloseRechargeLimit = () => setOpenRechargeLimit(false);
  const handleCloseEmergencyModal = () => setOpenEmergencyModal(false);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  if (!identity) return null;

  const menuItems = [];
  if (role && role !== "Player") {
    menuItems.push(
      <MenuItem
        key="users"
        onClick={() => {
          navigate("/users");
          handleMenuClose();
        }}
      >
        <PersonIcon sx={{ mr: 1 }} /> User Management
      </MenuItem>,
      <MenuItem
        key="rechargeRecords"
        onClick={() => {
          navigate("/rechargeRecords");
          handleMenuClose();
        }}
      >
        <LocalAtmIcon sx={{ mr: 1 }} /> Recharge Records
      </MenuItem>,
      <MenuItem
        key="redeemRecords"
        onClick={() => {
          navigate("/redeemRecords");
          handleMenuClose();
        }}
      >
        <LocalAtmIcon sx={{ mr: 1 }} /> Redeem Records
      </MenuItem>,
      <MenuItem
        key="summary"
        onClick={() => {
          navigate("/summary");
          handleMenuClose();
        }}
      >
        <SummarizeIcon sx={{ mr: 1 }} /> Summary
      </MenuItem>
    );
    if (role === "Super-User") {
      menuItems.push(
        <MenuItem
          key="reports"
          onClick={() => {
            navigate("/Reports");
            handleMenuClose();
          }}
        >
          <SummarizeIcon sx={{ mr: 1 }} /> Reports
        </MenuItem>
      );
    }
  }
  // else if (role === "Player") {
  //   menuItems.push(
  //     <MenuItem
  //       key="playerDashboard"
  //       onClick={() => {
  //         navigate("/playerDashboard");
  //         handleMenuClose();
  //       }}
  //     >
  //       <SummarizeIcon sx={{ mr: 1 }} /> Dashboard
  //     </MenuItem>,
  //     <MenuItem
  //       key="wallet"
  //       onClick={() => {
  //         navigate("/Wallet");
  //         handleMenuClose();
  //       }}
  //     >
  //       <SummarizeIcon sx={{ mr: 1 }} /> Wallet
  //     </MenuItem>,
  //     <MenuItem
  //       key="rechargeRecords"
  //       onClick={() => {
  //         navigate("/rechargeRecords");
  //         handleMenuClose();
  //       }}
  //     >
  //       <LocalAtmIcon sx={{ mr: 1 }} /> Recharge Records
  //     </MenuItem>,
  //     <MenuItem
  //       key="redeemRecords"
  //       onClick={() => {
  //         navigate("/redeemRecords");
  //         handleMenuClose();
  //       }}
  //     >
  //       <LocalAtmIcon sx={{ mr: 1 }} /> Redeem Records
  //     </MenuItem>
  //   );
  // }

  return (
    <AppBar
      sx={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0",
        backgroundColor: "#000",
        position: "fixed",
        top: 0,
        width: "100%",
        height: "3.5em",
        color: "white",
        zIndex: 1300,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", pl: 1 }}>
        {role !== "Player" && (
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={handleMenuOpen}
            sx={{ display: { xs: "block", md: "none" }, mr: 1, ml: 0.5 }}
          >
            <MenuIcon />
          </IconButton>
        )}
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
              maxHeight: { xs: "2em", md: "3em" },
              width: "auto",
            }}
          />
        </Toolbar>
        {!isMobile && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "#000",
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
                onClick={item.props.onClick}
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
                {item.props.children[1]}
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
          backgroundColor: "#000",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", ml: 2 }}>
          {(role === "Agent") &&
            identity?.balance !== undefined && (
              <Box sx={{ display: "flex", alignItems: "center", mt: 0.5 }}>
                <AccountBalanceWalletIcon sx={{ fontSize: 18, mr: 0.5 }} />
                <span style={{ fontWeight: 600, color: "#fff" }}>
                  Balance: {identity.balance}
                </span>
              </Box>
            )}
            {(role === "Master-Agent") &&
            identity?.totalPotBalanceOfChildren !== undefined && (
              <Box sx={{ display: "flex", alignItems: "center", mt: 0.5 }}>
                <AccountBalanceWalletIcon sx={{ fontSize: 18, mr: 0.5 }} />
                <span style={{ fontWeight: 600, color: "#fff" }}>
                  Balance: {identity.totalPotBalanceOfChildren}
                </span>
              </Box>
            )}
          {role !== "Player" && (
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
          {role !== "Player" && (
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
        </Box>
      </Box>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        sx={{
          "& .MuiMenu-paper": {
            backgroundColor: "#000",
            color: "#c0c7d8",
          },
        }}
      >
        {menuItems}
      </Menu>
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
