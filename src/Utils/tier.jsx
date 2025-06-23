import { Parse } from "parse";
import { dataProvider } from "../Provider/parseDataProvider";
Parse.initialize(
    process.env.REACT_APP_APPID,
    process.env.REACT_APP_JAVASCRIPT_KEY,
    process.env.REACT_APP_MASTER_KEY
  );
  Parse.serverURL = process.env.REACT_APP_URL;
  Parse.masterKey = process.env.REACT_APP_MASTER_KEY;
  export async function getAgentTierDetails(agentId, type) {
    try {
      // 1. Fetch the agent user
      const agent = await new Parse.Query(Parse.User).get(agentId, {
        useMasterKey: true,
      });
  
      const agentTier = agent.get("tier");
      if (!agentTier) return null;
  
      // 2. Fetch the tier settings from Settings table
      const settingsQuery = new Parse.Query("Settings");
      settingsQuery.equalTo("type", "tierValues");
      const settingsObj = await settingsQuery.first({ useMasterKey: true });
  
      if (!settingsObj) return null;
  
      const tierList = settingsObj.get("settings") || [];
      const tierInfo = tierList.find((t) => t.tier === agentTier);
      if (!tierInfo) return null;
  
      // 3. Get the required minimum value for the given type (e.g., 'deposit', 'recharge', 'payout')
      const requiredMin = tierInfo?.[type];
      if (typeof requiredMin !== "number") return null;
  
      // 4. Compare it with the agent's potBalance
      const potBalance = agent.get("potBalance") || 0;
  
      const isSufficient = potBalance >= requiredMin;
  
      return {
        tier: agentTier,
        potBalance,
        type,
        requiredMin,
        isSufficient,
        ...tierInfo,
      };
    } catch (error) {
      console.error("Error fetching agent tier details:", error);
      return null;
    }
  }