import React, { useState, memo, Suspense, useCallback } from "react";
import { useGetIdentity } from "react-admin";
import { Box, Typography, useMediaQuery } from "@mui/material";
import { styled } from "@mui/material/styles";
import { TransactionData } from "../TransactionData/TransactionData";

// Lazy load components
const Overview = React.lazy(() => import("./Overview"));
const Comparison = React.lazy(() => import("./Comparison"));
const AgentOverview = React.lazy(() => import("./AgentOverview"));
const PlayerOverview = React.lazy(() => import("./PlayerOverview"));
const PlayerComparison = React.lazy(() => import("./PlayerComparison"));
const ParticularPlayer = React.lazy(() => import("./ParticularPlayer"));
const Kyc = React.lazy(() => import("./Kyc"));

// Styled components with identical styling to original
const RootBox = styled(Box)({
  width: "100%",
  padding: "16px",
  "@media (max-width: 768px)": {
    padding: "8px",
  },
});

const Title = styled(Typography)({
  fontSize: "24px",
  fontWeight: 500,
  marginBottom: "16px",
  color: "#272E35",
  "@media (max-width: 768px)": {
    fontSize: "20px",
  },
});

const TabContainer = styled(Box)({
  display: "flex",
  flexWrap: "wrap",
  gap: "8px",
  border: "1px solid #E7E7E7",
  borderRadius: "8px",
  padding: "8px",
  width: "100%",
  justifyContent: "center",
  "@media (min-width: 768px)": {
    justifyContent: "flex-start",
  },
});

const TabButton = styled(Box)(({ active }) => ({
  padding: "8px 16px",
  borderRadius: "4px",
  cursor: "pointer",
  backgroundColor: active ? "#000" : "transparent",
  transition: "background-color 0.3s",
  "&:hover": {
    backgroundColor: active ? "#000" : "#f5f5f5",
  },
}));

const TabText = styled(Typography)(({ active }) => ({
  fontSize: "16px",
  color: active ? "#fff" : "#4D4D4D",
  whiteSpace: "nowrap",
  "@media (max-width: 768px)": {
    fontSize: "14px",
  },
}));

const DescriptionBox = styled(Box)({
  marginTop: "24px",
  padding: "16px",
  background: "#F7F8F8",
  borderRadius: "8px",
  "@media (max-width: 768px)": {
    marginTop: "16px",
  },
});

const DescriptionText = styled(Typography)({
  fontSize: "16px",
  color: "#4D4D4D",
  "@media (max-width: 768px)": {
    fontSize: "14px",
  },
});

const ContentContainer = styled(Box)({
  marginTop: "24px",
  padding: "16px",
  width: "100%",
  boxSizing: "border-box",
  "@media (max-width: 768px)": {
    marginTop: "16px",
    padding: "8px",
  },
});

const Reports = memo(() => {
  const { identity } = useGetIdentity();
  const [activeTab, setActiveTab] = useState("Overview");

  const handleTabClick = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  const tabToComponentMap = {
    Overview: "overview",
    Comparison: "comparison",
    "Agent Overview": "agentOverview",
    "Player Overview": "playerOverview",
    "Player Comparison": "playerComparison",
    "Particular Player": "particularPlayer",
    KYC: "Kyc",
    "Transaction Export": "TransactionData",
  };

  const tabOptions = Object.keys(tabToComponentMap);

  const descriptions = {
    overview: "This Overview page is a comprehensive financial dashboard...",
    comparison: "This Comparison page enables users to analyze and compare...",
    agentOverview:
      "The Agent Overview page allows admins to analyze an agent's transactions...",
    playerOverview:
      "The Player Overview page provides a detailed transactional analysis...",
    playerComparison:
      "The Player Comparison page allows users to compare player transaction data...",
    particularPlayer:
      "The Particular Player page allows admins to analyze a player's transactions...",
    TransactionData:
      "The Transaction Export page allows users to download transaction data...",
    Kyc: "This KYC page provides a comprehensive view of customer verification statuses...",
  };

  if (identity?.email !== "zen@zen.com") return null;

  const activeComponent = tabToComponentMap[activeTab];

  return (
    <RootBox>
      <Title>Reports</Title>

      <TabContainer>
        {tabOptions.map((tab) => (
          <TabButton
            key={tab}
            onClick={() => handleTabClick(tab)}
            active={activeTab === tab}
          >
            <TabText active={activeTab === tab}>{tab}</TabText>
          </TabButton>
        ))}
      </TabContainer>

      <DescriptionBox>
        <DescriptionText>{descriptions[activeComponent]}</DescriptionText>
      </DescriptionBox>

      <ContentContainer>
        <Suspense fallback={<div>Loading...</div>}>
          {activeComponent === "overview" && <Overview />}
          {activeComponent === "comparison" && <Comparison />}
          {activeComponent === "agentOverview" && <AgentOverview />}
          {activeComponent === "playerOverview" && <PlayerOverview />}
          {activeComponent === "playerComparison" && <PlayerComparison />}
          {activeComponent === "particularPlayer" && <ParticularPlayer />}
          {activeComponent === "Kyc" && <Kyc />}
          {activeComponent === "TransactionData" && <TransactionData />}
        </Suspense>
      </ContentContainer>
    </RootBox>
  );
});

export default Reports;
