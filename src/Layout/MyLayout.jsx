import { Layout } from "react-admin";
import MyAppBar from "./MyAppBar";
import Config from "../Config.json";
import { Navigate } from "react-router-dom";

export const MyLayout = (props) => {
  if (Config?.maintenance) {
    console.log("Maintenance Mode is Active");
    return <Navigate to="/maintenance" replace />;
  }

  return (
    <Layout
      {...props}
      appBar={MyAppBar}
      sidebar={() => null} // Remove sidebar completely
      sx={{
        "& .RaLayout-content": {
          marginLeft: { xs: "0", md: "120px" }, // Remove left margin on small screens, apply on medium+
          marginRight: { xs: "0", md: "120px" }, // Remove right margin on small screens, apply on medium+
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
