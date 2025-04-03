import { Layout } from "react-admin";
import MyAppBar from "./MyAppBar";
import { MySidebar } from "./MySidebar";
import Config from "../Config.json";
import { Navigate } from "react-router-dom";

export const MyLayout = (props) => {
  if (Config?.maintenance) {
    return <Navigate to="/maintenance" replace />;
  }

  const role = localStorage.getItem("role");

  const isSidebarOpen = role !== "Player";

  const EmptySidebar = () => null;

  return (
    <Layout
      {...props}
      appBar={MyAppBar}
      sidebar={isSidebarOpen ? MySidebar : EmptySidebar}
      sx={{
        "& .RaLayout-content": {
          paddingLeft: { xs: 1, md: isSidebarOpen ? "120px" : "300px" },
          paddingRight: { xs: 1, md: isSidebarOpen ? "120px" : "300px" },
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
