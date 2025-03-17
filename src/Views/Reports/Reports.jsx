import {
  useGetIdentity,
} from "react-admin";
import React, { useState } from "react";
import { Overview } from "./Overview";
import { Comparison } from "./Comparison";
import { AgentOverview } from "./AgentOverview";

// MUI imports
import { 
  Box, 
  Button, 
  Typography, 
  Paper,
  Stack
} from "@mui/material";
import { PlayerOverview } from "./PlayerOverview";
import { PlayerComparison } from "./PlayerComparison";
import { ParticularPlayer } from "./ParticularPlayer";

export const Reports = () => {
  const { identity } = useGetIdentity();
  
  // State to track which component is visible
  // Using a single state variable for active component
  const [activeComponent, setActiveComponent] = useState("overview");
  
  // Function to handle button clicks
  const handleComponentChange = (componentName) => {
    setActiveComponent(componentName);
  };
  
  // Only render if the user is authorized
  if (identity?.email !== "zen@zen.com") {
    return null;
  }
  
  return (
    <Box sx={{ width: '100%', p: 2 }}>
      {/* Toggle Buttons */}
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Report Sections
        </Typography>
        <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
          <Button
            variant={activeComponent === "overview" ? "contained" : "outlined"}
            color="primary"
            onClick={() => handleComponentChange("overview")}
          >
            Overview
          </Button>
          
          <Button
            variant={activeComponent === "comparison" ? "contained" : "outlined"}
            color="primary"
            onClick={() => handleComponentChange("comparison")}
          >
            Comparison
          </Button>
          
          <Button
            variant={activeComponent === "agentOverview" ? "contained" : "outlined"}
            color="primary"
            onClick={() => handleComponentChange("agentOverview")}
          >
            Agent Overview
          </Button>
          <Button
            variant={activeComponent === "playerOverview" ? "contained" : "outlined"}
            color="primary"
            onClick={() => handleComponentChange("playerOverview")}
          >
            Player Overview
          </Button>
          <Button
            variant={activeComponent === "playerComparison" ? "contained" : "outlined"}
            color="primary"
            onClick={() => handleComponentChange("playerComparison")}
          >
            Player Comparison
          </Button>
          <Button
            variant={activeComponent === "particularPlayer" ? "contained" : "outlined"}
            color="primary"
            onClick={() => handleComponentChange("particularPlayer")}
          >
            Particular Player
          </Button>
        </Stack>
      </Paper>
      
      {/* Only render the active component */}
      {activeComponent === "overview" && (
        <Box sx={{ mb: 3 }}>
          <Overview />
        </Box>
      )}
      
      {activeComponent === "comparison" && (
        <Box sx={{ mb: 3 }}>
          <Comparison />
        </Box>
      )}
      
      {activeComponent === "agentOverview" && (
        <Box sx={{ mb: 3 }}>
          <AgentOverview />
        </Box>
      )}

      {activeComponent === "playerOverview" && (
        <Box sx={{ mb: 3 }}>
          <PlayerOverview />
        </Box>
      )}

      {activeComponent === "playerComparison" && (
        <Box sx={{ mb: 3 }}>
          <PlayerComparison />
        </Box>
      )}

      {activeComponent === "particularPlayer" && (
        <Box sx={{ mb: 3 }}>
          <ParticularPlayer />
        </Box>
      )}
    </Box>
  );
};