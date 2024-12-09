import { fontSize, fontStyle, lineHeight } from "@mui/system";
import { defaultTheme } from "react-admin";
import { defaultDarkTheme } from "react-admin";

export const MyTheme = {
    ...defaultTheme,
    palette: {
        primary: { main: "#0288d1" },
        secondary: { main: "#ab47bc" },
        error: { main: "#d32f2f" },
        warning: { main: "#f57c00" },
        info: { main: "#737373" },
        success: { main: "#388e3c" }
    },
    typography: {
        fontFamily: 'Inter, sans-serif'
    },
    components: {
        MuiDrawer: {
            styleOverrides: {
                root: {
                    backgroundColor: "#272E3E",
                    width: "15em",
                    position: "fixed",
                    top: 0,
                    left: 0,
                    height: "100%",

                },
            }
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: "white",
                    position: "fixed",
                    left: "15em",
                    top: 0,
                    right: 0,
                    width: "calc(100% - 15em)",
                    height: "4em",
                    color: "black",
                    justifyContent: "center",
                }
            }
        },
        MuiTableCell: {
            styleOverrides: {
                root: {
                    width: 100,
                    maxWidth: 100,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    paddingLeft: "0.5",
                    fontSize: "0.75em",
                },
                head: { //TBC
                    backgroundColor: "red"
                }
            }
        },
        MuiTable: {
            styleOverrides: {
                root: {
                    boxShadow: "0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)",
                }
            }
        },
        MuiBox: { //doesn't work
            styleOverrides: {
                // root: ({ownerState}) => ({
                //     ...(ownerState.className==='overlayFormBox' && {
                //         backgroundColor: "red",
                //     }),
                // }),
                ".overlayFormBox": {
                    backgroundColor: "green",
                }
            },
        },
        RaLayout: {
            styleOverrides: {
                root: {
                    height: "calc(100% - 4em)",
                    "& .RaLayout-appFrame": {
                        margin: 0,
                        backgroundColor: "#f2f2f2"
                    },
                    "& .RaLayout-content": {
                        backgroundColor: "rgba(0,0,0,0)",
                        position: "absolute",
                        left: "15em",
                        top: "4em",
                        width: "calc(100% - 15em)",
                        paddingLeft: "1em",
                        paddingRight: "1em",
                        overflow: "auto",
                    },
                },
            }
        },
        RaSidebar: {
            styleOverrides: {
                root: {
                    height: "100%"
                }
            }
        },
        RaMenuItemLink: {
            styleOverrides: {
                root: {
                    color: "#e6e6e6",
                    // borderLeft: "3px solid red",
                    '&.RaMenuItemLink-active': {
                        // borderLeft: "3px solid blue",
                        color: "white",
                    },
                },
                // '& .RaMenuItemLink-active': {
                //     root: {
                //         borderLeft: "3px solid blue", 
                //     },
                // },

            }
        },
        RaList: {
            styleOverrides: {
                root: {
                    backgroundColor: "rgba(0,0,0,0)",
                },
                '& .RaList-content': {
                    boxShadow: "none",
                }
            }
        },

    }
}
//appbar position: fixed left: 15em