import "./App.css";
import React from "react";
import {
  Admin,
  Resource,
  CustomRoutes,
  Authenticated,
  ListGuesser,
} from "react-admin";
import { Route } from "react-router-dom";
// mui icon
import PersonIcon from "@mui/icons-material/Person";
import LocalAtmIcon from "@mui/icons-material/LocalAtm";
import SummarizeIcon from "@mui/icons-material/Summarize";
import GridViewIcon from "@mui/icons-material/GridView";
// pages
import LoginPage from "./Views/SignIn/forms/CheckPresence";
import UpdateUser from "./Views/SignIn/forms/UpdateUser";
import LoginEmailPage from "./Views/SignIn/forms/LoginPage";
import SignUp from "./Views/SignIn/forms/SignUp";
import PasswordResetEmail from "./Views/SignIn/forms/PasswordResetEmail";
import ResetPassword from "./Views/SignIn/forms/ResetPassword";
import EmailSent from "./Views/SignIn/EmailSent";
import ReferralLinkForm from "./Views/ReferralLink/ReferralLinkForm";
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
import { SummaryList } from "./Views/Summary/SummaryList ";
import { Summary } from "./Views/Summary/Summary";
import { DataSummary } from "./Views/Summary/DataSummary";
import { PlayerList } from "./Views/Player/PlayerList";

function App() {
  return (
    <Admin
      dataProvider={dataProvider}
      authProvider={authProvider}
      loginPage={LoginPage}
      layout={MyLayout}
      theme={MyTheme}
    >
      {(permissions) =>
        permissions && permissions !== "Player" ? (
          <>
            <Resource
              name="users"
              list={UserList}
              options={{ label: "User Management" }}
              icon={PersonIcon}
            />

            <Resource
              name="rechargeRecords"
              list={RechargeRecordsList}
              options={{ label: "Recharge Records" }}
              icon={LocalAtmIcon}
            />

            <Resource
              name="redeemRecords"
              recordRepresentation="redeemRecords"
              list={RedeemRecordsList}
              options={{ label: "Redeem Records" }}
              icon={LocalAtmIcon}
            />
            <Resource
              name="summary"
              list={DataSummary}
              options={{ label: "Summary" }}
              icon={SummarizeIcon}
            />
          </>
        ) : (
          <>
            <Resource
              name="playerDashboard"
              list={PlayerList}
              options={{ label: "playerDashboard" }}
              icon={SummarizeIcon}
            />
            <CustomRoutes>
              <Route
                path="/playerDashboard"
                element={
                  <Authenticated>
                    <PlayerList resource="playerDashboard" />
                  </Authenticated>
                }
              />
              <Route
                path="/rechargeRecords"
                element={
                  <Authenticated>
                    <RechargeRecordsList resource="rechargeRecords" />
                  </Authenticated>
                }
              />
              <Route
                path="/redeemRecords"
                element={
                  <Authenticated>
                    <RedeemRecordsList resource="redeemRecords" />
                  </Authenticated>
                }
              />
            </CustomRoutes>
          </>
        )
      }

      <CustomRoutes noLayout>
        <Route path="/loginEmail" element={<LoginEmailPage />} />
        <Route path="/updateUser" element={<UpdateUser />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/reset-email-sent" element={<EmailSent />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/reset-email" element={<PasswordResetEmail />} />
        <Route path="/create-user" element={<ReferralLinkForm />} />
      </CustomRoutes>

      {/* <CustomRoutes>
        <Route
          path="/playerDashboard"
          element={
            <Authenticated>
              <PlayerList resource="playerDashboard" />
            </Authenticated>
          }
        />
        <Route
          path="/rechargeRecords"
          element={
            <Authenticated>
              <RechargeRecordsList resource="rechargeRecords" />
            </Authenticated>
          }
        />
        <Route
          path="/redeemRecords"
          element={
            <Authenticated>
              <RedeemRecordsList resource="redeemRecords" />
            </Authenticated>
          }
        />
      </CustomRoutes> */}
    </Admin>
  );
}

export default App;
