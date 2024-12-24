import * as React from "react";
import { Toolbar, Typography, Box } from "@mui/material";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

import AppBar from "@mui/material/AppBar";
import {
  TitlePortal,
  RefreshIconButton,
  UserMenu,
  Logout,
  useGetIdentity,
} from "react-admin";
import { Title } from "react-admin";

//to be used when we create custom user menu
const MyUserMenu = React.forwardRef((props, ref) => {
  return <></>;
});

export default function MyAppBar({ props }) {
  const { identity } = useGetIdentity();
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
      <Toolbar sx={{ width: "15em" }}>
        <img src="/assets/company_logo.svg" alt="Company Logo" loading="lazy" />
      </Toolbar>

      <TitlePortal variant="h5" component="h3" sx={{ paddingLeft: 3 }} />
      {/* <RefreshIconButton /> */}
      {/* <NotificationsNoneIcon /> */}
      {/* <AccountCircleIcon /> */}
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
      <UserMenu>
        <Logout />
      </UserMenu>
    </AppBar>
  );
}
