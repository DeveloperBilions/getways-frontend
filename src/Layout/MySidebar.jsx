import * as React from "react";
import { useSidebarState } from "react-admin";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import { useGetIdentity } from "react-admin";
import { useMediaQuery } from "@mui/system";

export const MySidebar = ({ children }) => {
  const { identity } = useGetIdentity();
  const [open, setOpen] = useSidebarState(); // React Admin's sidebar state hook
  const isMobile = useMediaQuery("(max-width:600px)");

  if (!identity) {
    return null;
  }

  const drawerWidth = identity?.role === "Player" ? "0em" : "15em";

  const handleMenuItemClick = () => {
    if (isMobile) {
      setOpen(false);
    }
  };

  return (
    <Drawer
      variant="permanent" // Always visible on large screens
      sx={{
        width: { xs: open ? drawerWidth : "0em", sm: drawerWidth }, // Collapse on small screens when closed
        flexShrink: 0,
        transition: "width 0.3s ease", // Smooth transition for opening/closing
        "& .MuiDrawer-paper": {
          position: "fixed",
          width: { xs: open ? "100vw" : "0em", sm: drawerWidth },
          boxSizing: "border-box",
          backgroundColor: "#272E3E",
          overflowX: "hidden", // Prevent horizontal scroll
          marginTop: "3.5em", // Adjust based on AppBar height
          height: "calc(100% - 3.5em)", // Full height minus AppBar
          zIndex: 1200, // Ensure it stays above content
        },
        "& .MuiMenuItem-root": {
          color: "#c0c7d8",
          fontSize: 18,
        },
        "& .MuiSvgIcon-root": {
          color: "#d0d5e2",
        },
      }}
      open={open} // Controlled by sidebar state
    >
      <List sx={{ display: "block" }}>
        {/* Wrap children (menu items) to handle clicks */}
        {React.Children.map(children, (child) =>
          React.cloneElement(child, {
            onClick: handleMenuItemClick, // Close sidebar on click in mobile
          })
        )}
      </List>
    </Drawer>
  );
};
