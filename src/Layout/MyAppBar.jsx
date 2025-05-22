import * as React from "react";
import {
  Toolbar,
  Typography,
  Box,
  IconButton,
  MenuItem,
  Backdrop,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import AppBar from "@mui/material/AppBar";
import {
  RefreshButton,
  UserMenu,
  useGetIdentity,
  useSidebarState,
  useLogout,
  useRefresh,
} from "react-admin";
import ChangePassword from "./ChangePassword";
import RechargeLimitDialog from "../Views/RechargeRecords/dialog/RechargeLimitDialog";
import DisablePaymentMethodDialog from "../Views/User/dialog/DisablePaymentMethodDialog";
import HelpVideoModal from "../Views/SignIn/HelpVideoModal";
import AllRedeemService from "../Views/User/dialog/AllRedeemService";
import EmergencyMessageDialog from "../Views/User/dialog/EmergencyMessageDialog";
import { useMediaQuery } from "@mui/system";
import { useState } from "react";
import { walletService } from "../Provider/WalletManagement";
import { useEffect } from "react";
import AOG_Symbol from "../Assets/icons/AOGsymbol.png";
import Account from "../Assets/icons/Account.svg";
import globalRecharge from "../Assets/icons/globalRecharge.svg";
import paymentMethods from "../Assets/icons/paymentMethods.svg";
import emergencyMessage from "../Assets/icons/emergencyMessage.svg";
import helpVideos from "../Assets/icons/helpVideos.svg";
import logout_icon from "../Assets/icons/logout.svg";
import GlobalSettingsDialog from "../Views/User/dialog/GlobalSettingsDialog";
import { Loader } from "../Views/Loader";
import { Parse } from "parse";
import passwordChange from "../Assets/icons/passwordChange.svg";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import CustomUserMenu from "./CustomUserMenu";
import RechargeMethodsDialog from "../Views/User/dialog/RechargeMethodsDialog";
import SyncAltIcon from "@mui/icons-material/SyncAlt";

export default function MyAppBar(props) {
  const { identity } = useGetIdentity();
  const logout = useLogout();
  const [openModal, setOpenModal] = React.useState(false);
  const refresh = useRefresh();
  const [isLoading, setIsLoading] = useState(false);
  const [openRechargeLimit, setOpenRechargeLimit] = React.useState(false);
  const [disableDialogOpen, setDisableDialogOpen] = React.useState(false);
  const [openHelpVideo, setOpenHelpVideo] = React.useState(false);
  const [openRedeemService, setOpenRedeemService] = React.useState(false);
  const [openEmergencyModal, setOpenEmergencyModal] = React.useState(false);
  const [openGlobalSettingsDialog, setOpenGlobalSettingsDialog] =
    React.useState(false);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);

  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const [open, setOpen] = useSidebarState(); // Use the sidebar state
  const [balance, setBalance] = useState(0);
  const isSidebarOpen = role !== "Player";
  const isMobile = useMediaQuery(
    isSidebarOpen ? "(max-width:1023px)" : "(max-width: 900px)"
  );

  const handleOpenModal = () => {
    setUserMenuOpen(false); // Close user menu
    setOpenModal(true);
  };
  const handleCloseModal = () => setOpenModal(false);
  const handleOpenRechargeLimit = () => setOpenRechargeLimit(true);
  const handleOpenGlobalSettingsDialog = () =>
    setOpenGlobalSettingsDialog(true);
  const handleCloseRechargeLimit = () => setOpenRechargeLimit(false);
  const handleCloseEmergencyModal = () => setOpenEmergencyModal(false);
  const handleCloseGlobalSettingsDialog = () =>
    setOpenGlobalSettingsDialog(false);

  const [activeTab, setActiveTab] = useState("users");
  const [openRechargeMethods, setOpenRechargeMethods] = React.useState(false);

  const getBalance = async () => {
    try {
      // Initial fetch
      const wallet = await walletService.getMyWalletData();
      const walletObject = wallet?.wallet;

      if (!walletObject) return;

      setBalance(walletObject?.balance || 0);

      // Set up LiveQuery to listen for balance changes
      const Wallet = Parse.Object.extend("Wallet");
      const query = new Parse.Query(Wallet);
      query.equalTo("objectId", walletObject.objectId);

      const subscription = await query.subscribe();

      subscription.on("update", (updatedWallet) => {
        const newBalance = updatedWallet.get("balance");
        console.log(newBalance);
        setBalance(newBalance);
      });

      // Optional: unsubscribe on component unmount
      return () => {
        subscription.unsubscribe();
      };
    } catch (error) {
      console.log("Error fetching or subscribing to wallet:", error);
    }
  };

  const handleRefresh = () => {
    setIsLoading(true);
    refresh();
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  useEffect(() => {
    const path = window.location.pathname;
    const pathSegments = path.split("/").filter(Boolean); // Removes empty strings
    setActiveTab(pathSegments[pathSegments.length - 1] || "users");
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
      }
    );
    if (identity?.email != "cvgetways@get.com") {
      menuItems.push({
        key: "summary",
        label: "Summary",
        onClick: () => navigate("/summary"),
      });
    }
    if (role === "Super-User" && identity?.email != "cvgetways@get.com") {
      menuItems.push({
        key: "Reports",
        label: "Reports",
        onClick: () => navigate("/Reports"),
      });
      menuItems.push({
        key: "kycRecords",
        label: "KYC",
        onClick: () => navigate("/kycRecords"),
      });
      menuItems.push({
        key: "GiftCardHistory",
        label: "Giftcard",
        onClick: () => navigate("/GiftCardHistory"),
      });
      menuItems.push({
        key: "wlletAudit",
        label: "Wallet Audit",
        onClick: () => navigate("/walletAudit"),
      });
    }
  }

  return (
    <>
      {" "}
      <Backdrop
        sx={{
          color: "#fff",
          zIndex: 9999,
          backgroundColor: "transparent",
        }}
        open={isLoading}
      >
        <Loader />
      </Backdrop>
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
        <Box
          sx={{ display: "flex", alignItems: "center", pl: { xs: 2, sm: 1 } }}
        >
          {/* Only show menu icon on mobile */}
          <Toolbar
            sx={{
              width: "auto",
              cursor: "pointer",
              padding: 0,
              minHeight: role === "Player" ? "4em" : "3.5em",
            }}
            onClick={() => {
              if (role === "Player") {
                setActiveTab("playerDashboard");
                navigate("/playerDashboard");
              } else {
                setActiveTab("users");
                navigate("/users");
              }
            }}
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
        {/* {role === "Player" && (
          <Box
            sx={{ width: "100%", display: "flex", justifyContent: "center" }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: 0.2,
              }}
            >
              {" "}
              <Typography
                variant="body2"
                sx={{
                  color: "#fff", // Gray color for "Available balance"
                  fontSize: { xs: "14px", sm: "18px" },
                  fontWeight: 400,
                }}
              >
                Wallet balance:
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
        )} */}
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
            {role === "Agent" && (
              <Box sx={{ display: "flex", alignItems: "center", mt: 0.5 }}>
                <AccountBalanceWalletIcon sx={{ fontSize: 18, mr: 0.5 }} />
                <span
                  style={{ fontWeight: 600, color: "var(--secondery-color)" }}
                >
                  Balance: {(identity.balance ?? 0).toFixed(2)}
                </span>
              </Box>
            )}
            {role === "Master-Agent" &&
              identity?.totalPotBalanceOfChildren !== undefined && (
                <Box sx={{ display: "flex", alignItems: "center", mt: 0.5 }}>
                  <AccountBalanceWalletIcon sx={{ fontSize: 18, mr: 0.5 }} />
                  <span
                    style={{ fontWeight: 600, color: "var(--secondery-color)" }}
                  >
                    Balance: {identity.totalPotBalanceOfChildren.toFixed(2)}
                  </span>
                </Box>
              )}
            {role !== "Player" && !isMobile && (
              <RefreshButton
                label=""
                onClick={handleRefresh}
                icon={
                  <RefreshIcon
                    sx={{
                      fontSize: {
                        xs: "20px !important",
                        md: "24px !important",
                      },
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
            <CustomUserMenu
              icon={
                <img
                  src={Account}
                  alt="Account"
                  style={{ width: 19, height: 19 }}
                />
              }
            >
              <Box sx={{ width: "248px", height: "auto" }}>
                {(role === "Agent" ||
                  role === "Player" ||
                  role === "Master-Agent") && (
                  <Box sx={{ mb: 1 }}>
                    <MenuItem
                      onClick={handleOpenModal}
                      style={{
                        color: "#000000",
                        gap: "8px",
                      }}
                    >
                      <img
                        src={passwordChange}
                        alt="Change Password"
                        style={{ height: "24px", width: "24px" }}
                      />
                      <Typography sx={{ fontWeight: 400, fontSize: "16px" }}>
                        Change Password
                      </Typography>
                    </MenuItem>
                  </Box>
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
                    <FlashOnIcon sx={{ mr: 1, fontSize: "20px" }} />
                    Recharge Limit
                  </MenuItem>
                )}
                {role === "Super-User" && (
                  <Box sx={{ mb: 1 }}>
                    <MenuItem
                      onClick={handleOpenGlobalSettingsDialog}
                      style={{
                        color: "#000000",
                        gap: "8px",
                      }}
                    >
                      <img src={globalRecharge} alt="Global Recharge" />
                      <Typography sx={{ fontWeight: 400, fontSize: "16px" }}>
                        Global Recharge
                      </Typography>
                    </MenuItem>
                  </Box>
                )}
                {role === "Super-User" && (
                  <Box sx={{ mb: 1 }}>
                    <MenuItem
                      onClick={() => setOpenRechargeMethods(true)}
                      style={{ color: "#000000", gap: "8px" }}
                    >
                      <SyncAltIcon sx={{ fontSize: 20, color: "#000" }} />
                      <Typography sx={{ fontWeight: 400, fontSize: "16px" }}>
                        Recharge Methods
                      </Typography>
                    </MenuItem>
                  </Box>
                )}
                {role === "Super-User" && (
                  <Box sx={{ mb: 1 }}>
                    <MenuItem
                      onClick={() => setDisableDialogOpen(true)}
                      style={{
                        color: "#000000",
                        gap: "8px",
                      }}
                    >
                      <img src={paymentMethods} alt="Payment Methods" />
                      <Typography sx={{ fontWeight: 400, fontSize: "16px" }}>
                        Payment Methods
                      </Typography>
                    </MenuItem>
                  </Box>
                )}
                {/* {role === "Super-User" && (
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
                )} */}
                {role === "Super-User" && (
                  <Box sx={{ mb: 1 }}>
                    <MenuItem
                      onClick={() => setOpenEmergencyModal(true)}
                      style={{
                        color: "#000000",

                        gap: "8px",
                      }}
                    >
                      <img src={emergencyMessage} alt="Emergency Message" />
                      <Typography sx={{ fontWeight: 400, fontSize: "16px" }}>
                        Emergency Message
                      </Typography>
                    </MenuItem>
                  </Box>
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
                <Box sx={{ mb: 1 }}>
                  <MenuItem
                    onClick={() => {
                      setUserMenuOpen(false); // Close user menu
                      setOpenHelpVideo(true);
                    }}
                    style={{
                      color: "#000000",
                      gap: "8px",
                    }}
                  >
                    <img src={helpVideos} alt="Help Videos" />
                    <Typography sx={{ fontWeight: 400, fontSize: "16px" }}>
                      Help Videos
                    </Typography>
                  </MenuItem>
                </Box>
                <MenuItem
                  onClick={() => logout()}
                  style={{
                    color: "#000000",
                    gap: "8px",
                  }}
                >
                  <img src={logout_icon} alt="logout" />
                  <Typography sx={{ fontWeight: 400, fontSize: "16px" }}>
                    Logout
                  </Typography>
                </MenuItem>{" "}
              </Box>
            </CustomUserMenu>
            {role !== "Player" && !isMobile && (
              <Box sx={{ mr: 2, minWidth: 0 }}>
                <Typography
                  noWrap
                  variant="subtitle2"
                  sx={{
                    color: "white",
                    fontWeight: 500,
                    fontSize: "16px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {identity?.name}
                </Typography>
              </Box>
            )}
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
        <GlobalSettingsDialog
          open={openGlobalSettingsDialog}
          onClose={handleCloseGlobalSettingsDialog}
        />
        <RechargeMethodsDialog
          open={openRechargeMethods}
          onClose={() => setOpenRechargeMethods(false)}
        />
      </AppBar>
    </>
  );
}
