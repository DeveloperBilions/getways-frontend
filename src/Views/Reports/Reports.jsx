// import { useGetIdentity } from "react-admin";
// import React, { useState } from "react";
// import { Overview } from "./Overview";
// import { Comparison } from "./Comparison";
// import { AgentOverview } from "./AgentOverview";

// // MUI imports
// import { Box, Button, Typography, Paper, Stack, Tooltip } from "@mui/material";
// import { PlayerOverview } from "./PlayerOverview";
// import { PlayerComparison } from "./PlayerComparison";
// import { ParticularPlayer } from "./ParticularPlayer";

// export const Reports = () => {
//   const { identity } = useGetIdentity();

//   // State to track which component is visible
//   // Using a single state variable for active component
//   const [activeComponent, setActiveComponent] = useState("overview");
//   const descriptions = {
//     overview:
//       "This Overview page is a comprehensive financial dashboard that allows users to filter transaction data by date range (starting from December 1, 2024) and displays key metrics including conversion rates, ticket amounts, and transaction distributions through summary cards and an interactive pie chart. The dashboard visualizes agent performance through three separate bar charts for recharge, redeem, and cashout activities, while also providing a sortable detailed table of agent transaction totals.",
//     comparison:
//       "This Comparison page enables users to analyze and compare agent transaction data across different time periods. It features interactive bar charts displaying recharge, redeem, and cashout metrics for each agent with color-coded time periods. Users can filter by specific dates, months, or years, allowing for flexible temporal analysis of financial transaction patterns.",
//     agentOverview:
//       "The Agent Overview page allows admins to analyze an agent’s transactions over a selected date range, featuring an agent search with autocomplete, date filters, and data visualization. It retrieves transaction records, including total recharges, redeems, and cashouts, and presents them using a line chart for daily trends and a pie chart for a summarized breakdown.",
//     playerOverview:
//       "The Player Overview page provides a detailed transactional analysis of players, focusing on recharge, redeem, and cashout activities. Users can filter data based on date ranges and agent usernames. The page features sortable tables for top 30 players by transaction type, interactive bar charts for recharge, redeem, and cashout trends, and a pie chart summarizing total distributions.",
//     playerComparison:
//       "The Player Comparison page allows users to compare player transaction data (Recharge, Redeem, Cashout) over selected dates, months, or years. It features a user search with autocomplete, date range selection, and filters for transaction types and top player counts. Users can apply filters to generate bar charts visualizing transaction trends.",
//     particularPlayer:
//       "The Particular Player page allows admins to analyze an player’s transactions over a selected date range, featuring an player search with autocomplete, date filters, and data visualization. It retrieves transaction records, including total recharges, redeems, and cashouts, and presents them using a line chart for daily trends and a pie chart for a summarized breakdown.",
//   };

//   // Function to handle button clicks
//   const handleComponentChange = (componentName) => {
//     setActiveComponent(componentName);
//   };

//   // Only render if the user is authorized
//   if (identity?.email !== "zen@zen.com") {
//     return null;
//   }

//   return (
//     <Box sx={{ width: "100%", p: 2 }}>
//       <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
//         <Typography variant="h6" sx={{ mb: 2 }}>
//           Report Sections
//         </Typography>
//         <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
//           {Object.keys(descriptions).map((key) => (
//             <Tooltip key={key} title={<Typography sx={{ fontSize: "12px" }}>{descriptions[key]}</Typography>} arrow>
//               <Button
//                 variant={activeComponent === key ? "contained" : "outlined"}
//                 color="primary"
//                 onClick={() => handleComponentChange(key)}
//               >
//                 {key.replace(/([A-Z])/g, " $1").trim()}
//               </Button>
//             </Tooltip>
//           ))}
//         </Stack>
//       </Paper>
//       {activeComponent === "overview" && (
//         <Box sx={{ mb: 3 }}>
//           <Overview  description={descriptions["overview"]}/>
//         </Box>
//       )}
//       {activeComponent === "comparison" && (
//         <Box sx={{ mb: 3 }}>
//           <Comparison description={descriptions["comparison"]}/>
//         </Box>
//       )}
//       {activeComponent === "agentOverview" && (
//         <Box sx={{ mb: 3 }}>
//           <AgentOverview description={descriptions["agentOverview"]}/>
//         </Box>
//       )}
//       {activeComponent === "playerOverview" && (
//         <Box sx={{ mb: 3 }}>
//           <PlayerOverview description={descriptions["playerOverview"]}/>
//         </Box>
//       )}
//       {activeComponent === "playerComparison" && (
//         <Box sx={{ mb: 3 }}>
//           <PlayerComparison description={descriptions["playerComparison"]}/>
//         </Box>
//       )}
//       {activeComponent === "particularPlayer" && (
//         <Box sx={{ mb: 3 }}>
//           <ParticularPlayer description={descriptions["particularPlayer"]}/>
//         </Box>
//       )}
//     </Box>
//   );
// };

import { useGetIdentity } from "react-admin";
import React, { useState } from "react";
import { Overview } from "./Overview";
import { Comparison } from "./Comparison";
import { AgentOverview } from "./AgentOverview";
import { Box, Typography, useMediaQuery } from "@mui/material";
import { PlayerOverview } from "./PlayerOverview";
import { PlayerComparison } from "./PlayerComparison";
import { ParticularPlayer } from "./ParticularPlayer";
import { TransactionData } from "../TransactionData/TransactionData";
import Kyc from "./Kyc";

export const Reports = () => {
  const { identity } = useGetIdentity();
  const isMobile = useMediaQuery("(max-width:768px)");

  const [activeTab, setActiveTab] = useState("Overview");

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
    overview:
      "This Overview page is a comprehensive financial dashboard...",
    comparison:
      "This Comparison page enables users to analyze and compare...",
    agentOverview:
      "The Agent Overview page allows admins to analyze an agent’s transactions...",
    playerOverview:
      "The Player Overview page provides a detailed transactional analysis...",
    playerComparison:
      "The Player Comparison page allows users to compare player transaction data...",
    particularPlayer:
      "The Particular Player page allows admins to analyze a player’s transactions...",
    TransactionData:
      "The Transaction Export page allows users to download transaction data...",
    Kyc: "This KYC page provides a comprehensive view of customer verification statuses...",
  };

  if (identity?.email !== "zen@zen.com") return null;

  const activeComponent = tabToComponentMap[activeTab];

  const handleTabClick = (tab) => setActiveTab(tab);

  return (
    <Box sx={{ width: "100%", p: { xs: 1, sm: 2 } }}>
      {/* Title */}
      <Typography
        sx={{
          fontSize: { xs: "20px", sm: "24px" },
          fontWeight: 500,
          mb: 2,
          color: "#272E35",
        }}
      >
        Reports
      </Typography>

      {/* Tabs (Responsive Wrapping) */}
      <Box
  sx={{
    display: "flex",
    flexWrap: "wrap", // wrap on all screen sizes
    gap: 1,
    border: "1px solid #E7E7E7",
    borderRadius: "8px",
    p: 1,
    width: "100%", // allow full width
    justifyContent: { xs: "center", sm: "flex-start" }, // center on mobile, align left on desktop
  }}
>
  {tabOptions.map((tab) => (
    <Box
      key={tab}
      onClick={() => handleTabClick(tab)}
      sx={{
        px: 2,
        py: 1,
        borderRadius: "4px",
        cursor: "pointer",
        backgroundColor: activeTab === tab ? "#000" : "transparent",
        transition: "background-color 0.3s",
        "&:hover": {
          backgroundColor: activeTab === tab ? "#000" : "#f5f5f5",
        },
      }}
    >
      <Typography
        sx={{
          fontSize: { xs: "14px", sm: "16px" },
          color: activeTab === tab ? "#fff" : "#4D4D4D",
          whiteSpace: "nowrap",
        }}
      >
        {tab}
      </Typography>
    </Box>
  ))}
</Box>


      {/* Description */}
      <Box
        sx={{
          mt: 3,
          p: 2,
          background: "#F7F8F8",
          borderRadius: "8px",
        }}
      >
        <Typography
          sx={{
            fontSize: { xs: "14px", sm: "16px" },
            color: "#4D4D4D",
          }}
        >
          {descriptions[activeComponent]}
        </Typography>
      </Box>

      {/* Active Component */}
      <Box
  sx={{
    mt: { xs: 2, sm: 3 },
    px: { xs: 1, sm: 2 },
    width: "100%",
    boxSizing: "border-box",
  }}
>
  {activeComponent === "overview" && <Overview />}
  {activeComponent === "comparison" && <Comparison />}
  {activeComponent === "agentOverview" && <AgentOverview />}
  {activeComponent === "playerOverview" && <PlayerOverview />}
  {activeComponent === "playerComparison" && <PlayerComparison />}
  {activeComponent === "particularPlayer" && <ParticularPlayer />}
  {activeComponent === "Kyc" && <Kyc />}
  {activeComponent === "TransactionData" && <TransactionData />}
</Box>

    </Box>
  );
};

