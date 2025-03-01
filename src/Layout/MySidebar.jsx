import * as React from "react";
import {
  SidebarClasses,
  useLocales,
  useSidebarState,
  useGetIdentity,
} from "react-admin";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import CssBaseline from "@mui/material/CssBaseline";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import MailIcon from "@mui/icons-material/Mail";

export const MySidebar = ({ children }) => {
  const { identity } = useGetIdentity();

  if (!identity) {
    return null;
  }

  const drawerWidth = identity?.role === "Player" ? "0em" : "15em";

  return (
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          position: "fixed",
          width: drawerWidth,
          boxSizing: "border-box",
          // backgroundColor: "blue",
          backgroundColor: "#272E3E",
          overflow: "hidden",
          top: "3.5em",
          bottom: 0,
          left: 0,    
        },
        "& .MuiMenuItem-root": {
          color: "#c0c7d8",
          //   color: "#272E35",
          fontSize: 18,
          // '&:active': {
          //     backgroundColor: "blue",
          // },
        },
        "& .MuiSvgIcon-root": {
          color: "#d0d5e2",
          //   color: "#272E35",
        },
        // '& .RaMenuItemLink-active': {
        //     color: "#ffffFF",
        // },
        // '& .MuiMenuItem.Mui-selected': {
        //     backgroundColor: "red",
        // }
      }}
    >
      {/* <Toolbar>
        <img src="/assets/company_logo.svg" alt="Company Logo" loading="lazy" />

        <Typography
          variant="h4"
          component="div"
          align="center"
          noWrap
          sx={{
            alignSelf: "center",
            justifySelf: "center",
            color: "white",
          }}
        >
          GETWAYS
        </Typography>
      </Toolbar> */}
      {/* <Divider sx={{ borderColor: "#45516e" }} /> */}
      {children}
    </Drawer>
  );
};
