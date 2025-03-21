import { Layout } from "react-admin";
import MyAppBar from "./MyAppBar";
import { MySidebar } from "./MySidebar";
import Config from "../Config.json";
import { Navigate } from "react-router-dom";

export const MyLayout = (props) => {
  if (Config?.maintenance) {
    console.log("Maintenance Mode is Active");
    return <Navigate to="/maintenance" replace />;
  }

  const role = localStorage.getItem("role");
  console.log(role, "role");

  const isSidebarOpen = role !== "Player";

  const EmptySidebar = () => null;

  return (
    <Layout
      {...props}
      appBar={MyAppBar}
      sidebar={isSidebarOpen ? MySidebar : EmptySidebar}
      sx={{
        "& .RaLayout-content": {
          marginLeft: { xs: "0", md: isSidebarOpen ? "120px" : "0" }, // Remove left margin on small screens, apply on medium+
          marginRight: { xs: "0", md: isSidebarOpen ? "120px" : "0" }, // Remove right margin on small screens, apply on medium+
          width: "100%", // Full width
          padding: { xs: "1em", md: "1em" },
          overflow: "auto",
          boxSizing: "border-box",
          height: "auto",
        },
      }}
    />
  );
};
