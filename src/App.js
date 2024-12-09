import "./App.css";
import React, { useEffect, useState } from "react";
import { Admin, Resource, CustomRoutes, usePermissions } from "react-admin";
import { Route } from "react-router-dom";
// mui icon
import PersonIcon from "@mui/icons-material/Person";
import LocalAtmIcon from "@mui/icons-material/LocalAtm";
// pages
import LoginPage from "./Views/SignIn/forms/LoginPage";
import SignUp from "./Views/SignIn/forms/SignUp";
import PasswordResetEmail from "./Views/SignIn/forms/PasswordResetEmail";
import ResetPassword from "./Views/SignIn/forms/ResetPassword";
import EmailSent from "./Views/SignIn/EmailSent";
// provider
import { authProvider } from "./Provider/parseAuthProvider";
import { dataProvider } from "./Provider/parseDataProvider";
// layout
import { MyLayout } from "./Layout/MyLayout";
import { MyTheme } from "./Layout/MyDefaultTheme";
// components
import { UserList } from "./Views/User/UserList";
import { RechargeRecordsList } from "./Views/RechargeRecords/RechargeRecordsList";
import { RedeemRecordsList } from "./Views/RedeemRecords/RedeemRecordsList";

function App() {
  console.log("i am in App.js")

  const [userRole, setUserRole] = useState(null);

  // Fetch role from localStorage on mount
  useEffect(() => {
    const storedData = localStorage.getItem("Parse/novaApp/currentUser");
    if (storedData) {
      const userObject = JSON.parse(storedData);
      setUserRole(userObject.role || "guest"); // Set default role as "guest" if none exists
    }
  }, []);


  return (
    <Admin
      dataProvider={dataProvider}
      authProvider={authProvider}
      loginPage={LoginPage}
      layout={MyLayout}
      theme={MyTheme}
    >
      {["Super-User"].includes(userRole) && (
        < Resource
          name="users"
          list={UserList}
          options={{ label: "User Management" }}
          icon={PersonIcon}
        />
      )}

      {["Super-User", "Agent", "Player"].includes(userRole) && (
        < Resource
          name="redeemRecords"
          recordRepresentation="redeemRecords"
          list={RedeemRecordsList}
          options={{ label: "Redeem Records" }}
          icon={LocalAtmIcon}
        />
      )}

      {["Super-User", "Agent", "Player"].includes(userRole) && (
        <Resource
          name="TransactionRecords"
          list={RechargeRecordsList}
          options={{ label: "Recharge Records" }}
          icon={LocalAtmIcon}
        />
      )}

      <CustomRoutes noLayout>
        <Route path="/signup" element={<SignUp />} />
        <Route path="/reset-email-sent" element={<EmailSent />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/reset-email" element={<PasswordResetEmail />} />
      </CustomRoutes>
    </Admin>
  );
}

export default App;
