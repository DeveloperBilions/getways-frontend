import "./App.css";
import React, { useEffect, useState } from "react";
import {
  Admin,
  Resource,
  CustomRoutes,
  Authenticated,
  ListGuesser,
} from "react-admin";
import { Route, Navigate, Routes } from "react-router-dom";
import PersonIcon from "@mui/icons-material/Person";
import LocalAtmIcon from "@mui/icons-material/LocalAtm";
import SummarizeIcon from "@mui/icons-material/Summarize";
import GridViewIcon from "@mui/icons-material/GridView";
import LoginPage from "./Views/SignIn/forms/CheckPresence";
import { Maintenance } from "./Views/Maintenance";
import UpdateUser from "./Views/SignIn/forms/UpdateUser";
import LoginEmailPage from "./Views/SignIn/forms/LoginPage";
import SignUp from "./Views/SignIn/forms/SignUp";
import PasswordResetEmail from "./Views/SignIn/forms/PasswordResetEmail";
import ResetPassword from "./Views/SignIn/forms/ResetPassword";
import EmailSent from "./Views/SignIn/EmailSent";
import ReferralLinkForm from "./Views/ReferralLink/ReferralLinkForm";
import { authProvider } from "./Provider/parseAuthProvider";
import { dataProvider } from "./Provider/parseDataProvider";
import { MyLayout } from "./Layout/MyLayout";
import { MyTheme } from "./Layout/MyDefaultThemeCopy";
import { UserList } from "./Views/User/UserList";
import { RechargeRecordsList } from "./Views/RechargeRecords/RechargeRecordsList";
import { RedeemRecordsList } from "./Views/RedeemRecords/RedeemRecordsList";
import { DataSummary } from "./Views/Summary/DataSummary";
import { PlayerList } from "./Views/Player/PlayerList";
import { Stripe } from "./Views/Stripe/Stripe";
import { Success } from "./Views/Stripe/Success";
import { Wallet } from "./Views/Player/Wallet";
import Config from "./Config.json";
import { QueryClient } from "react-query";
import { Reports } from "./Views/Reports/Reports";
import { TransactionData } from "./Views/TransactionData/TransactionData";
import WifiOffIcon from "@mui/icons-material/WifiOff";
import { Box, Typography, Button } from "@mui/material";
import CheckoutForm from "./Views/Stripe/CheckoutForm";
import CheckoutFormV2 from "./Views/Stripe/CheckoutFormV2";
import GiftCardHistory from "./Views/Player/GiftCardHistory";

function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      window.location.reload();
    };
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isOnline) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          textAlign: "center",
          backgroundColor: "#f8f9fa",
          padding: "20px",
        }}
      >
        <WifiOffIcon sx={{ fontSize: 80, color: "#ff5722", marginBottom: 2 }} />
        <Typography variant="h4" color="textPrimary" gutterBottom>
          No Internet Connection
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Please check your network and try again.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          sx={{ marginTop: 3, padding: "10px 20px" }}
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </Box>
    );
  }

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: false,
        staleTime: 5 * 60 * 1000,
      },
    },
  });

  if (Config?.maintenance) {
    return (
      <Admin>
        <CustomRoutes noLayout>
          <Route path="*" element={<Navigate to="/maintenance" replace />} />
          <Route path="/maintenance" element={<Maintenance />} />
        </CustomRoutes>
      </Admin>
    );
  }

  return (
    <Admin
      dataProvider={dataProvider}
      authProvider={authProvider}
      loginPage={LoginPage}
      layout={MyLayout}
      theme={MyTheme}
    >
      {(permissions) => {
        if (permissions && permissions !== "Player") {
          return (
            <>
              <Resource
                name="users"
                list={UserList}
                options={{
                  label: "User Management",
                  defaultQuery: { sort: "createdAt", order: "DESC" },
                }}
                icon={PersonIcon}
              />
              <Resource
                name="rechargeRecords"
                list={RechargeRecordsList}
                options={{
                  label: "Recharge Records",
                  defaultQuery: { sort: "transactionDate", order: "DESC" },
                }}
                icon={LocalAtmIcon}
              />
              <Resource
                name="redeemRecords"
                list={RedeemRecordsList}
                options={{
                  label: "Redeem Records",
                  defaultQuery: { sort: "transactionDate", order: "DESC" },
                }}
                icon={LocalAtmIcon}
              />
              <Resource
                name="summary"
                list={DataSummary}
                options={{ label: "Summary" }}
                icon={SummarizeIcon}
              />
              {permissions === "Super-User" && (
                <>
                  <Resource
                    name="Reports"
                    list={Reports}
                    options={{ label: "Reports" }}
                    icon={SummarizeIcon}
                  />
                  <CustomRoutes>
                    <Route
                      path="/transactionData"
                      element={
                        <Authenticated>
                          <TransactionData resource="transactionData" />
                        </Authenticated>
                      }
                    />
                  </CustomRoutes>
                </>
              )}
              <CustomRoutes>
                <Route
                  path="/checkout"
                  element={
                    <Authenticated>
                      <CheckoutForm />
                    </Authenticated>
                  }
                />
                <Route
                  path="/checkout-version2"
                  element={
                    <Authenticated>
                      <CheckoutFormV2 />
                    </Authenticated>
                  }
                />
              </CustomRoutes>
              <Route path="/success" element={<Success />} />
              <Route path="/maintenance" element={<Maintenance />} />
            </>
          );
        } else if (permissions && permissions === "Player") {
          return (
            <>
              <Resource
                name="playerDashboard"
                list={PlayerList}
                options={{ label: "DashBoard" }}
                icon={SummarizeIcon}
              />
              <Resource
                name="Wallet"
                list={
                  <Authenticated>
                    <Wallet />
                  </Authenticated>
                }
                options={{ label: "Wallet" }}
                icon={SummarizeIcon}
              />
              <CustomRoutes>
                <Route
                  path="/playerDashboard"
                  element={
                    <Authenticated>
                      <PlayerList resource="DashBoard" />
                    </Authenticated>
                  }
                />
                 <Route
                  path="/gift-card-history"
                  element={
                    <Authenticated>
                      <GiftCardHistory resource="GiftCardHistory" />
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
                <Route
                  path="/checkout"
                  element={
                    <Authenticated>
                      <CheckoutForm />
                    </Authenticated>
                  }
                />
                <Route
                  path="/checkout-version2"
                  element={
                    <Authenticated>
                      <CheckoutFormV2 />
                    </Authenticated>
                  }
                />
              </CustomRoutes>
            </>
          );
        } else {
          return (
            <CustomRoutes noLayout>
              <Route path="*" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/loginEmail" element={<LoginEmailPage />} />
              <Route path="/updateUser" element={<UpdateUser />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/reset-email-sent" element={<EmailSent />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/reset-email" element={<PasswordResetEmail />} />
              <Route path="/create-user" element={<ReferralLinkForm />} />
              <Route
                path="/checkout"
                element={
                  <Authenticated>
                    <CheckoutForm />
                  </Authenticated>
                }
              />
              <Route
                path="/checkout-version2"
                element={
                  <Authenticated>
                    <CheckoutFormV2 />
                  </Authenticated>
                }
              />
            </CustomRoutes>
          );
        }
      }}
    </Admin>
  );
}

export default App;
