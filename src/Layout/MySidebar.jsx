import * as React from "react";
import { useSidebarState } from "react-admin";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import { useNavigate } from "react-router-dom";
import { useGetIdentity } from "react-admin";
import { useMediaQuery } from "@mui/system";

export const MySidebar = () => {
  const { identity } = useGetIdentity();
  const [open, setOpen] = useSidebarState();
  const isMobile = useMediaQuery("(max-width:1023px)");
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  if (!identity || !isMobile) {
    // Don't render sidebar on larger screens
    return null;
  }

  // Generate menu items
  const menuItems = [];
  if (role && role !== "Player") {
    menuItems.push(
      {
        key: "users",
        label: "User Management",
        // icon: <PersonIcon />,
        onClick: () => navigate("/users"),
      },
      {
        key: "rechargeRecords",
        label: "Recharge Records",
        // icon: <LocalAtmIcon />,
        onClick: () => navigate("/rechargeRecords"),
      },
      {
        key: "redeemRecords",
        label: "Redeem Records",
        // icon: <LocalAtmIcon />,
        onClick: () => navigate("/redeemRecords"),
      },
      {
        key: "summary",
        label: "Summary",
        // icon: <SummarizeIcon />,
        onClick: () => navigate("/summary"),
      }
    );
    if (role === "Super-User") {
      menuItems.push({
        key: "reports",
        label: "Reports",
        // icon: <SummarizeIcon />,
        onClick: () => navigate("/Reports"),
      });
    }
  }

  const handleMenuItemClick = (onClick) => {
    if (onClick) onClick();
    setOpen(false);
  };

  return (
    <Drawer
      variant="temporary"
      anchor="left"
      open={open}
      onClose={() => setOpen(false)}
      sx={{
        width: open ? "100%" : 0,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: "100%",
          boxSizing: "border-box",
          backgroundColor: "var(--secondary-color)",
          color: "var(--primery-color)",
          zIndex: 1200,
          marginTop: "3.5em",
        },
        "& .MuiModal-backdrop": {
          backgroundColor: "transparent !important",
        },
      }}
    >
      <List sx={{ padding: "8px 0" }}>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.key}
            onClick={() => handleMenuItemClick(item.onClick)}
            sx={{
              padding: "12px 20px",
            }}
          >
            <ListItemText
              primary={item.label}
              sx={{
                "& .MuiTypography-root": {
                  fontSize: "16px",
                  fontWeight: 400,
                },
              }}
            />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};
