import * as React from "react";
import { Toolbar, Typography, Box, MenuItem} from "@mui/material";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import RefreshIcon from "@mui/icons-material/Refresh";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useNavigate } from "react-router-dom";
import ChangePassword from "./ChangePassword";
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
import { Title } from "react-admin";
import RechargeLimitDialog from "../Views/RechargeRecords/dialog/RechargeLimitDialog";
import DisablePaymentMethodDialog from "../Views/User/dialog/DisablePaymentMethodDialog";
import HelpVideoModal from "../Views/SignIn/HelpVideoModal";
import AllRedeemService from "../Views/User/dialog/AllRedeemService";
import GuidelineModal from "../Views/User/dialog/GuidelineModal";
import EmergencyMessageDialog from "../Views/User/dialog/EmergencyMessageDialog";
import AnnouncementIcon from '@mui/icons-material/Announcement';
//to be used when we create custom user menu
const MyUserMenu = React.forwardRef((props, ref) => {
  return <></>;
});

export default function MyAppBar({ props }) {
  const { identity } = useGetIdentity();
  const [open, setOpen] = React.useState(false);
  const [openRechargeLimit, setOpenRechargeLimit] = React.useState(false); // State for Recharge Limit Dialog
  const [disableDialogOpen, setDisableDialogOpen] = React.useState(false);
  const [openHelpVideo, setOpenHelpVideo] = React.useState(false); // New state for Help Video Modal
  const [openRedeemService, setOpenRedeemService] = React.useState(false);
  const [openGuideline, setOpenGuideline] = React.useState(false); // State for Guideline Modal
  const [openEmergencyModal, setOpenEmergencyModal] = React.useState(false); // State for Guideline Modal

  const role = localStorage.getItem("role")
  const navigate = useNavigate()
  const handleOpenModal = () => {
    setOpen(true);
  };

  const handleCloseModal = () => {
    setOpen(false);
  };
  const handleOpenRechargeLimit = () => {
    setOpenRechargeLimit(true);
  };

  const handleCloseRechargeLimit = () => {
    setOpenRechargeLimit(false);
  };
  const handleCloseEmergencymodal = () => {
    setOpenEmergencyModal(false);
  };
  console.log(identity,"identity")
  return (
    <AppBar
      sx={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "flex-end",
        gap: 1,
        alignItems: "center",
        paddingRight: "1em",
        // backgroundColor: "white",
        backgroundColor: "#272E35",
        position: "fixed",
        // left: "15em",
        top: 0,
        right: 0,
        width: "100%",
        height: "3.5em",
        color: "black",
        color: "white",
      }}
    >
      <Toolbar sx={{ width: "15em" ,cursor: "pointer"}}       onClick={() => navigate("/")}
>
        <img src="/assets/company_logo.svg" alt="Company Logo" loading="lazy" />
      </Toolbar>

      <TitlePortal variant="h5" component="h3" sx={{ paddingLeft: 3 }} />
      {/* <RefreshIconButton /> */}
      {/* <NotificationsNoneIcon /> */}
      {/* <AccountCircleIcon /> */}
      {(role === "Master-Agent" || role === "Agent") && identity?.balance !== undefined && (
          <Box sx={{ display: "flex", alignItems: "center", mt: 0.5 }}>
            <AccountBalanceWalletIcon sx={{ fontSize: 18, mr: 0.5 }} />
            <span style={{ fontWeight: 600, color: "#fff" }}>
              Balance: {identity.balance}
            </span>
          </Box>
        )}
      <Box sx={{ ml: 0, minWidth: 0 }}>
        <b
          noWrap
          variant="subtitle2"
          sx={{ color: "text.secondary", fontWeight: 500 }}
        >
          {identity?.name}
        </b>
        {/* {identity?.role === "Player" && (
          <Typography
            noWrap
            variant="subtitle2"
            sx={{ color: "text.secondary", fontWeight: 500 }}
          >
            Agent: {identity?.userParentName}
          </Typography>
        )} */}
      </Box>
      
      <RefreshButton label="" icon={<RefreshIcon sx={{fontSize: "24px !important", marginRight: "-6px"}} />}  sx={{ color: "white", minWidth: "40px", justifyContent: "flex-end"}}/>
      <UserMenu>
        {( role === "Agent" || role === "Player" || role === "Master-Agent") && 
        <MenuItem onClick={handleOpenModal} style={{color:"#0000008a"}}> 
        <LockOutlinedIcon sx={{ marginRight: 1 }} /> {/* Add icon */}
          Change Password</MenuItem>}
          {(role === "Agent" || role === "Master-Agent")&& (
          <MenuItem
            onClick={handleOpenRechargeLimit}
            style={{ color: "#0000008a" }}
          >
            <AccountBalanceWalletIcon sx={{ marginRight: 1 }} />
            Recharge Limit
          </MenuItem>
        )}
         {role === "Super-User" && (
          <MenuItem
            onClick={(e) =>{
              setDisableDialogOpen(true)
            }}
            style={{ color: "#0000008a" }}
          >
            <AccountBalanceWalletIcon sx={{ marginRight: 1 }} />
            Payment Methods
          </MenuItem>
        )}
        {role === "Super-User" && (
          <MenuItem
            onClick={(e) =>{
              setOpenEmergencyModal(true)
            }}
            style={{ color: "#0000008a" }}
          >
            <AnnouncementIcon sx={{ marginRight: 1 }} />
            Emergency Message
          </MenuItem>
        )}
         {identity?.redeemServiceEnabled && role === "Master-Agent" && (
          <MenuItem onClick={() => setOpenRedeemService(true)} style={{ color: "#0000008a" }}>
            <MonetizationOnIcon sx={{ marginRight: 1 }} /> Agent Redeem Fees
          </MenuItem>
        )}
         <MenuItem
          onClick={() => setOpenHelpVideo(true)}
          style={{ color: "#0000008a" }}
        >
          <HelpOutlineIcon sx={{ marginRight: 1 }} />
          Help Videos
        </MenuItem>
        {identity?.email === "zen@zen.com" && role === "Super-User" &&
        <MenuItem
              onClick={(e) => {
                navigate("/transactionData");
              }}
              style={{ color: "#0000008a" }}
            >
              <AccountBalanceWalletIcon sx={{ marginRight: 1 }} />
              Transaction Export
            </MenuItem> }
        <Logout style={{color:"#0000008a"}} />
      </UserMenu>
      {/* <HelpOutlineIcon style={{cursor:"pointer"}} onClick={() => setOpenGuideline(true)}/>  */}
      <ChangePassword open={open} onClose={handleCloseModal} />
      <RechargeLimitDialog open={openRechargeLimit} onClose={handleCloseRechargeLimit} />
      <DisablePaymentMethodDialog
        open={disableDialogOpen}
        onClose={() => setDisableDialogOpen(false)}
      />
      <HelpVideoModal open={openHelpVideo} handleClose={() => setOpenHelpVideo(false)} />
      <AllRedeemService open={openRedeemService} onClose={() => setOpenRedeemService(false)} />
      <GuidelineModal open={openGuideline} onClose={() => setOpenGuideline(false)} />
      <EmergencyMessageDialog open={openEmergencyModal} onClose={() => setOpenEmergencyModal(false)} />
    </AppBar>
  );
}
