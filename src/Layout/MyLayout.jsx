import {Layout} from "react-admin";
import MyAppBar from "./MyAppBar";
import { MySidebar } from "./MySidebar";
import Config from "../Config.json";
import { Navigate } from "react-router-dom";

export const MyLayout = (props) => {
    console.log(Config,"ConfigvConfigConfig")
    // Check if the app is in maintenance mode
    if (Config?.maintenance) {
      console.log("Maintenance Mode is Active"); // Debug log
      return <Navigate to="/maintenance" replace />;
    }
  
    // Render the normal layout
    return (
      <Layout
        {...props}
        appBar={MyAppBar}
        sidebar={MySidebar}
      />
    );
  };