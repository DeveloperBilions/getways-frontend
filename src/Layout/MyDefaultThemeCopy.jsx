import {
  borderRadius,
  fontFamily,
  fontSize,
  fontStyle,
  lineHeight,
  minWidth,
} from "@mui/system";
import { defaultTheme } from "react-admin";
import { defaultDarkTheme } from "react-admin";

export const MyTheme = {
  ...defaultTheme,
  palette: {
    primary: { main: "#000" },
    secondary: { main: "#fff" },
    error: { main: "#d32f2f" },
    warning: { main: "#f57c00" },
    info: { main: "#737373" },
    success: { main: "#388e3c" },
  },
  typography: {
    fontFamily: "Inter, sans-serif",
  },
  components: {
    // MuiDrawer: {
    //   styleOverrides: {
    //     root: {
    //       backgroundColor: "#272E3E",
    //       width: "15em",
    //       position: "fixed",
    //       top: 0,
    //       left: 0,
    //       height: "100%",
    //     },
    //   },
    // },
    // MuiAppBar: {
    //   styleOverrides: {
    //     root: {
    //       backgroundColor: "white",
    //       position: "fixed",
    //       left: "15em",
    //       top: 0,
    //       right: 0,
    //       width: "calc(100% - 15em)",
    //       height: "4em",
    //       color: "black",
    //       justifyContent: "center",
    //     },
    //   },
    // },
    MuiTableCell: {
      styleOverrides: {
        root: {
          width: "auto", // Allow dynamic width based on content
          minWidth: 100, // Minimum width to ensure readability
          padding: "8px 12px", // Consistent padding
          fontSize: "0.875rem", // Match the font size in the image
          fontFamily: "Inter, sans-serif", // Match the font family in the image
          textAlign: "left", // Center-align text as in the image
          overflow: "hidden",
          textOverflow: "ellipsis",
          borderBottom: "1px solid #ddd", // Light border between rows
          "&:first-child": {
            paddingLeft: "16px", // Extra padding for the first column
          },
          "&:last-child": {
            paddingRight: "16px", // Extra padding for the last column
          },
        },
        head: {
          backgroundColor: "#E6E6E6", // Light gray header background
          fontWeight: 600, // Bold headers
        },
      },
    },
    MuiTable: {
      styleOverrides: {
        root: {
          boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)", // Subtle shadow
          border: "1px solid #e0e0e0", // Border around the table
          borderRadius: "10px", // Slight rounding
        },
      },
    },
    RaDatagrid: {
      styleOverrides: {
        root: {
          "& .RaDatagrid-thead": {
            backgroundColor: "#E6E6E6", // Grey background for the header
          },
          "& .RaDatagrid-row": {
            "&:hover": {
              backgroundColor: "#f9f9f9", // Hover effect
            },
          },
          "& .RaDatagrid-headerCell": {
            backgroundColor: "#E6E6E6", // Ensure header cells are grey
            fontWeight: 500,
            // fontFamily: "Inter, sans-serif",
          },
        },
      },
    },
    MuiBox: {
      //doesn't work
      styleOverrides: {
        // root: ({ownerState}) => ({
        //     ...(ownerState.className==='overlayFormBox' && {
        //         backgroundColor: "red",
        //     }),
        // }),
        ".overlayFormBox": {
          backgroundColor: "green",
        },
      },
    },
    RaLayout: {
      styleOverrides: {
        root: {
          height: "calc(100% - 4em)",
          //   "& .RaLayout-appFrame": {
          //     margin: 0,
          //     backgroundColor: "#f2f2f2",
          //   },
          "& .RaLayout-content": {
            backgroundColor: "rgba(0,0,0,0)",
            // position: "absolute",
            // left: "15em",
            top: "4em",
            width: "calc(100% - 15em)",
            padding: "1em",
            overflow: "auto",
          },
        },
      },
    },
    // RaSidebar: {
    //   styleOverrides: {
    //     root: {
    //       height: "100%",
    //     },
    //   },
    // },
    RaMenuItemLink: {
      styleOverrides: {
        root: {
          color: "#e6e6e6",
          // borderLeft: "3px solid red",
          "&.RaMenuItemLink-active": {
            // borderLeft: "3px solid blue",
            color: "white",
          },
        },
        // '& .RaMenuItemLink-active': {
        //     root: {
        //         borderLeft: "3px solid blue",
        //     },
        // },
      },
    },
    RaList: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(0,0,0,0)",
        },
        "& .RaList-content": {
          boxShadow: "none",
        },
      },
    },
    RaFilterForm: {
      styleOverrides: {
        root: {
          display: "flex",
          flexDirection: "row",
          flexWrap: "nowrap",
          justifyContent: "flex-start",
          alignItems: "baseline",
          minHeight: "fit-content !important",
        },
      },
    },
  },
};

//appbar position: fixed left: 15em
