import { Layout } from "react-admin";
import MyAppBar from "./MyAppBar";
import { MySidebar } from "./MySidebar";
import Config from "../Config.json";
import { Navigate } from "react-router-dom";
import { useMediaQuery } from "@mui/system";

export const MyLayout = (props) => {
  const isMobile = useMediaQuery("(max-width: 900px)");
  const isTablet = useMediaQuery("(min-width:901px) and (max-width:1100px)");
  if (Config?.maintenance) {
    return <Navigate to="/maintenance" replace />;
  }

  const role = localStorage.getItem("role");

  const isSidebarOpen = role !== "Player";

  const EmptySidebar = () => null;

  const padding = isMobile
    ? "1vw"
    : isSidebarOpen
    ? "7.813vw"
    : isTablet
    ? "16vw"
    : "22vw";

  return (
    <Layout
      {...props}
      appBar={MyAppBar}
      sidebar={isSidebarOpen ? MySidebar : EmptySidebar}
      sx={{
        "& .RaLayout-content": {
          paddingLeft: padding,
          paddingRight: padding,
          width: "100%", // Full width
          overflow: "auto",
          boxSizing: "border-box",
          height: "auto",
          bgcolor: isSidebarOpen ? "#fff" : "#F4F3FC",
        },
      }}
    />
  );
};
