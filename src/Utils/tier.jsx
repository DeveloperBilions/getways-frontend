import { Parse } from "parse";
import { dataProvider } from "../Provider/parseDataProvider";
Parse.initialize(
    process.env.REACT_APP_APPID,
    process.env.REACT_APP_JAVASCRIPT_KEY,
    process.env.REACT_APP_MASTER_KEY
  );
  Parse.serverURL = process.env.REACT_APP_URL;
  Parse.masterKey = process.env.REACT_APP_MASTER_KEY;
export async function getAgentTierDetails(agentId) {
    try {
      // Fetch the agent user
      const agent = await new Parse.Query(Parse.User)
        .get(agentId, { useMasterKey: true });
  
      const agentTier = agent.get("tier");
      if (!agentTier) return null;
  
      // Fetch the tier settings from Settings table
      const settingsQuery = new Parse.Query("Settings");
      settingsQuery.equalTo("type", "tierValues");
      const settingsObj = await settingsQuery.first({ useMasterKey: true });
  
      if (!settingsObj) return null;
  
      const tierList = settingsObj.get("settings") || [];
      const tierInfo = tierList.find((t) => t.tier === agentTier);
  
      return tierInfo ? { tier: agentTier, ...tierInfo } : null;
    } catch (error) {
      console.error("Error fetching agent tier details:", error);
      return null;
    }
  }
