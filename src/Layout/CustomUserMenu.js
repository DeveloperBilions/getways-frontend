import React, { useState } from "react";
import {
  Menu,
  MenuItem,
  IconButton,
  Box,
  Typography,
} from "@mui/material";

export default function CustomUserMenu({ icon, children }) {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const open = Boolean(anchorEl);

  // Clone each child and inject onClick logic to close the menu
  const enhancedChildren = React.Children.map(children, (child) =>
    React.cloneElement(child, {
      onClick: (e) => {
        if (child.props.onClick) child.props.onClick(e);
        handleMenuClose();
      },
    })
  );

  return (
    <>
      <IconButton onClick={handleMenuOpen} sx={{ ml: 1 }}>
        {icon}
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        PaperProps={{
          sx: { width: 248 },
        }}
      >
        {enhancedChildren}
      </Menu>
    </>
  );
}
