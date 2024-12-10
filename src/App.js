import "./App.css";
import { Admin, Resource, CustomRoutes } from "react-admin";
import { usePermissions, useGetIdentity } from "react-admin";
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
  // const { identity } = useGetIdentity();
  // const { permissions } = usePermissions();
  // console.log(identity);
  // console.log(localStorage.getItem("role"));
  return (
    <Admin
      dataProvider={dataProvider}
      authProvider={authProvider}
      loginPage={LoginPage}
      layout={MyLayout}
      theme={MyTheme}
      // requireAuth
    ><Resource
          name="users"
          list={UserList}
          options={{ label: "User Management" }}
          icon={PersonIcon}
        />
      <Resource
        name="redeemRecords"
        recordRepresentation="redeemRecords"
        list={RedeemRecordsList}
        options={{ label: "Redeem Records" }}
        icon={LocalAtmIcon}
      />
      {permissions => permissions !=='Player' ?
        <Resource
          name="TransactionRecords"
          list={RechargeRecordsList}
          options={{ label: "Recharge Records" }}
          icon={LocalAtmIcon}
        /> : null
      }
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
