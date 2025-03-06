import { Layout, useSidebarState } from "react-admin";
import MyAppBar from "./MyAppBar";
import { MySidebar } from "./MySidebar";
import Config from "../Config.json";
import { Navigate } from "react-router-dom";
import { useMediaQuery } from "@mui/system";

export const MyLayout = (props) => {
  const [open] = useSidebarState();
  const isMobile = useMediaQuery("(max-width:600px)");
  if (Config?.maintenance) {
    console.log("Maintenance Mode is Active");
    return <Navigate to="/maintenance" replace />;
  }

  return (
    <Layout
      {...props}
      appBar={MyAppBar}
      sidebar={MySidebar}
      sx={{
        "& .RaLayout-content": {
          marginLeft: { xs: "0em" }, // Adjust content margin based on sidebar
          width: { xs: "100%", md: "calc(100% - 15em)" }, // Full width on small screens
          transition: "margin-left 0.3s ease, width 0.3s ease", // Smooth transition
          padding: "1em",
          overflow: "auto",
          display: { xs: open && isMobile ? "none" : "block", md: "block" },
        },
      }}
    />
  );
};
