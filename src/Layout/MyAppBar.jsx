import * as React from 'react';
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

import AppBar from "@mui/material/AppBar";
import { TitlePortal, RefreshIconButton, UserMenu, Logout } from "react-admin";
import { Title } from "react-admin";

//to be used when we create custom user menu
const MyUserMenu = React.forwardRef((props, ref) => {
    return <></>;
})

export default function MyAppBar({ props }) {
    return (
        <AppBar
            sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "flex-end",
                gap: 1,
                alignItems: "center",
                paddingRight: "1em",
                backgroundColor: "white",
                position: "fixed",
                left: "15em",
                top: 0,
                right: 0,
                width: "calc(100% - 15em)",
                height: "4em",
                color: "black",
            }}
        >
            <TitlePortal variant="h5" component="h3" sx={{ paddingLeft: 3 }} />
            {/* <RefreshIconButton /> */}
            {/* <NotificationsNoneIcon /> */}
            {/* <AccountCircleIcon /> */}
            <UserMenu>
                <Logout />
            </UserMenu>
        </AppBar>
    );
}