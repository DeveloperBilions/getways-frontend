import { useGetIdentity } from "react-admin";
import React, { useState } from "react";
import { Overview } from "./Overview";
import { Comparison } from "./Comparison";
import { AgentOverview } from "./AgentOverview";

// MUI imports
import { Box, Button, Typography, Paper, Stack, Tooltip } from "@mui/material";
import { PlayerOverview } from "./PlayerOverview";
import { PlayerComparison } from "./PlayerComparison";
import { ParticularPlayer } from "./ParticularPlayer";

export const Reports = () => {
  const { identity } = useGetIdentity();

  // State to track which component is visible
  // Using a single state variable for active component
  const [activeComponent, setActiveComponent] = useState("overview");
  const descriptions = {
    overview:
      "This Overview page is a comprehensive financial dashboard that allows users to filter transaction data by date range (starting from December 1, 2024) and displays key metrics including conversion rates, ticket amounts, and transaction distributions through summary cards and an interactive pie chart. The dashboard visualizes agent performance through three separate bar charts for recharge, redeem, and cashout activities, while also providing a sortable detailed table of agent transaction totals.",
    comparison:
      "This Comparison page enables users to analyze and compare agent transaction data across different time periods. It features interactive bar charts displaying recharge, redeem, and cashout metrics for each agent with color-coded time periods. Users can filter by specific dates, months, or years, allowing for flexible temporal analysis of financial transaction patterns.",
    agentOverview:
      "The Agent Overview page allows admins to analyze an agent’s transactions over a selected date range, featuring an agent search with autocomplete, date filters, and data visualization. It retrieves transaction records, including total recharges, redeems, and cashouts, and presents them using a line chart for daily trends and a pie chart for a summarized breakdown.",
    playerOverview:
      "The Player Overview page provides a detailed transactional analysis of players, focusing on recharge, redeem, and cashout activities. Users can filter data based on date ranges and agent usernames. The page features sortable tables for top 30 players by transaction type, interactive bar charts for recharge, redeem, and cashout trends, and a pie chart summarizing total distributions.",
    playerComparison:
      "The Player Comparison page allows users to compare player transaction data (Recharge, Redeem, Cashout) over selected dates, months, or years. It features a user search with autocomplete, date range selection, and filters for transaction types and top player counts. Users can apply filters to generate bar charts visualizing transaction trends.",
    particularPlayer:
      "The Particular Player page allows admins to analyze an player’s transactions over a selected date range, featuring an player search with autocomplete, date filters, and data visualization. It retrieves transaction records, including total recharges, redeems, and cashouts, and presents them using a line chart for daily trends and a pie chart for a summarized breakdown.",
  };

  // Function to handle button clicks
  const handleComponentChange = (componentName) => {
    setActiveComponent(componentName);
  };

  // Only render if the user is authorized
  if (identity?.email !== "zen@zen.com") {
    return null;
  }

  return (
    <Box sx={{ width: "100%", p: 2 }}>
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Report Sections
        </Typography>
        <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
          {Object.keys(descriptions).map((key) => (
            <Tooltip key={key} title={<Typography sx={{ fontSize: "12px" }}>{descriptions[key]}</Typography>} arrow>
              <Button
                variant={activeComponent === key ? "contained" : "outlined"}
                color="primary"
                onClick={() => handleComponentChange(key)}
              >
                {key.replace(/([A-Z])/g, " $1").trim()}
              </Button>
            </Tooltip>
          ))}
        </Stack>
      </Paper>
      {activeComponent === "overview" && (
        <Box sx={{ mb: 3 }}>
          <Overview  description={descriptions["overview"]}/>
        </Box>
      )}
      {activeComponent === "comparison" && (
        <Box sx={{ mb: 3 }}>
          <Comparison description={descriptions["comparison"]}/>
        </Box>
      )}
      {activeComponent === "agentOverview" && (
        <Box sx={{ mb: 3 }}>
          <AgentOverview description={descriptions["agentOverview"]}/>
        </Box>
      )}
      {activeComponent === "playerOverview" && (
        <Box sx={{ mb: 3 }}>
          <PlayerOverview description={descriptions["playerOverview"]}/>
        </Box>
      )}
      {activeComponent === "playerComparison" && (
        <Box sx={{ mb: 3 }}>
          <PlayerComparison description={descriptions["playerComparison"]}/>
        </Box>
      )}
      {activeComponent === "particularPlayer" && (
        <Box sx={{ mb: 3 }}>
          <ParticularPlayer description={descriptions["particularPlayer"]}/>
        </Box>
      )}
    </Box>
  );
};
