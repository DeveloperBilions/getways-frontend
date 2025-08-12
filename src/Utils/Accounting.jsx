import { Parse } from "parse";
import { dataProvider } from "../Provider/parseDataProvider";
import { fetchPlayerList } from "./utils";
Parse.initialize(
    process.env.REACT_APP_APPID,
    process.env.REACT_APP_JAVASCRIPT_KEY,
    process.env.REACT_APP_MASTER_KEY
  );
  Parse.serverURL = process.env.REACT_APP_URL;
  Parse.masterKey = process.env.REACT_APP_MASTER_KEY;
  export async function fetchAccountingSummary(
    entityType,
    entityId,
    startDate,
    endDate,
    commissionPct = 12
  ) {
    if (!entityId) throw new Error("entityId required");
    // if (!isISODate(startDate) || !isISODate(endDate)) {
    //   throw new Error("startDate/endDate must be YYYY-MM-DD");
    // }
    const start = new Date(startDate);     
    start.setHours(0, 0, 0, 0);            
    
    const endExclusive = new Date(endDate); 
    endExclusive.setHours(23, 59, 59, 999)     
    // All players under this entity
    let playerList = [entityId];
    if (entityType === "master") {
      playerList = await fetchAgentList(entityId); // must return array of _User objectIds
      if (!Array.isArray(playerList) || playerList.length === 0) {
        return {
          success: true,
          data: {
            totalRecharges: 0,
            totalRedeems: 0,
            previousBalance: 0,
            commissionAmount: 0,
            finalBalance: 0,
            transactions: [],
          },
        };
      }
    }
      const prevPipeline = [
      { $match: { userParentId: { $in: playerList } } },
      {
        $facet: {
          prevRecharges: [
            { $match: { type: "recharge", status: { $in: [2, 3] }, transactionDate: { $lt: start } } },
            { $group: { _id: null, total: { $sum: "$transactionAmount" } } },
          ],
          prevRedeems: [
            {
              $match: {
                type: "redeem",
                status: { $in: [4, 8] },
                transactionDate: { $lt: start },
                transactionAmount: { $gt: 0, $type: "number" },
              },
            },
            { $group: { _id: null, total: { $sum: "$transactionAmount" } } },
          ],
        },
      },
    ];
    const prevAgg = await new Parse.Query("TransactionRecords")
      .aggregate(prevPipeline, { useMasterKey: true });
  
    const prevRecharges = safe(prevAgg?.[0]?.prevRecharges?.[0]?.total);
    const prevRedeems = safe(prevAgg?.[0]?.prevRedeems?.[0]?.total);
  
    const prevPayPipeline = [
      { $match: { userId: { $in: playerList }, createdAt: { $lt: start } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ];
    const prevPayAgg = await new Parse.Query("DrawerAgent")
      .aggregate(prevPayPipeline, { useMasterKey: true });
    const prevPayments = safe(prevPayAgg?.[0]?.total);
    const prevCommissionAmount = round2(
      (prevRecharges * (Number(commissionPct) || 0)) / 100
    );
    const previousBalance = round2(
      prevRecharges - prevRedeems - prevPayments - prevCommissionAmount
    );  
    const periodPipeline = [
      { $match: { userParentId: { $in: playerList }, transactionDate: { $gte: start, $lt: endExclusive },
      $or: [
        { type: "recharge", status: { $in: [2, 3] } },
        { type: "redeem",   status: { $in: [4, 8] } }
     ] } },
      {
        $facet: {
          periodRecharges: [
            { $match: { type: "recharge", status: { $in: [2, 3] } } },
            { $group: { _id: null, total: { $sum: "$transactionAmount" } } },
          ],
          periodRedeems: [
            {
              $match: {
                type: "redeem",
                status: { $in: [4, 8] },
                transactionAmount: { $gt: 0, $type: "number" },
              },
            },
            { $group: { _id: null, total: { $sum: "$transactionAmount" } } },
          ],
          transactions: [
            {
              $match: {
                $or: [
                  { type: "recharge", status: { $in: [2, 3, "2", "3"] } },
                  { type: "redeem",   status: { $in: [4, 8, "4", "8"] } },
                ],
              },
            },
            {
              $project: {
                _id: 0,
                // your original fields
                date: { $dateToString: { format: "%Y-%m-%d", date: "$transactionDate" } },
                type: 1,
                status: 1,
                amount: "$transactionAmount",
                userId: 1,
                portal: 1,
                username: 1,
  
                // ADDED fields
                transactionId: "$_id",
                transactionDateISO: {
                  $dateToString: { format: "%Y-%m-%dT%H:%M:%S.%LZ", date: "$transactionDate", timezone: "UTC" },
                },
                userParentId: 1,
              },
            },
          ],
        },
      },
    ];
  
    const periodAgg = await new Parse.Query("TransactionRecords")
      .aggregate(periodPipeline, { useMasterKey: true });
  
    const periodRecharges = safe(periodAgg?.[0]?.periodRecharges?.[0]?.total);
    const periodRedeems = safe(periodAgg?.[0]?.periodRedeems?.[0]?.total);
    const txRows = Array.isArray(periodAgg?.[0]?.transactions)
      ? periodAgg[0].transactions
      : [];
  
    const periodPayPipeline = [
      { $match: { userId: entityId, createdAt: { $gte: start, $lt: endExclusive } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ];
    const periodPayAgg = await new Parse.Query("DrawerAgent")
      .aggregate(periodPayPipeline, { useMasterKey: true });
    const periodPayments = safe(periodPayAgg?.[0]?.total);
  
  
    const commissionAmount = round2((periodRecharges * (Number(commissionPct) || 0)) / 100);
  
    const finalBalance = round2(
      previousBalance + periodRecharges - periodRedeems - commissionAmount - periodPayments
    );
  
    const userIds = new Set();
    txRows.forEach(r => r.userId && userIds.add(r.userId));
  
    if (userIds.size) {
      const userQ = new Parse.Query(Parse.User);
      userQ.containedIn("objectId", Array.from(userIds));
      userQ.select(["isDeleted", "username", "name"]);
      const users = await userQ.find({ useMasterKey: true });
      const isDeletedMap = new Map(users.map(u => [u.id, !!u.get("isDeleted")]));
  
      txRows.forEach(r => (r.userIsDeleted = isDeletedMap.get(r.userId) ?? false));
    }
    let fixedAgentName = null;
    let fixedMasterName = null;
  
    if (entityType === "agent") {
      try {
        const agentObj = await new Parse.Query(Parse.User).get(entityId, { useMasterKey: true });
        fixedAgentName = agentObj.get("name") || agentObj.get("username") || agentObj.id;
        const masterId = agentObj.get("userParentId");
        if (masterId) {
          try {
            const m = await new Parse.Query(Parse.User).get(masterId, { useMasterKey: true });
            fixedMasterName = m.get("name") || m.get("username") || m.id;
          } catch {}
        }
      } catch {}
    } else if (entityType === "master") {
      try {
        const m = await new Parse.Query(Parse.User).get(entityId, { useMasterKey: true });
        fixedMasterName = m.get("name") || m.get("username") || m.id;
      } catch {}
    }
  
    const nameIds = new Set(txRows.map(r => r.userId).filter(Boolean));
    if (entityType === "master") {
      txRows.forEach(r => r.userParentId && nameIds.add(r.userParentId));
    }
  
    let nameMap = new Map();
    if (nameIds.size) {
      const q = new Parse.Query(Parse.User);
      q.containedIn("objectId", Array.from(nameIds));
      q.select(["name", "username"]);
      const rows = await q.find({ useMasterKey: true });
      nameMap = new Map(rows.map(u => [u.id, (u.get("name") || u.get("username") || u.id)]));
    }
  
    txRows.forEach(r => {
      r.customerName = nameMap.get(r.userId) || r.username || r.userId || "";
      if (entityType === "agent") {
        r.agentName = fixedAgentName || "";
        r.masterAgentName = fixedMasterName || "";
      } else {
        r.agentName = nameMap.get(r.userParentId) || r.userParentId || "";
        r.masterAgentName = fixedMasterName || "";
      }
      r.transactionType = r.type === "recharge" ? "Recharge" : "Redeem";
      // transactionId, transactionDateISO, mode already projected above
    });
  
    const transactions = [...txRows].sort((a, b) =>
      a.date.localeCompare(b.date)
    );
  
    return {
      success: true,
      data: {
        totalRecharges: round2(periodRecharges),
        totalRedeems: round2(periodRedeems),
        previousBalance: round2(previousBalance),
        commissionAmount,
        finalBalance,
        transactions,
      },
    };
  }
  
  
  /* ---------------- helpers ---------------- */
  function isISODate(s) {
    return /^\d{4}-\d{2}-\d{2}$/.test(s);
  }
  function addDays(d, n) {
    const x = new Date(d);
    x.setUTCDate(x.getUTCDate() + n);
    return x;
  }
  function safe(n) {
    const x = Number(n);
    return Number.isFinite(x) ? x : 0;
  }
  function round2(n) {
    return Math.round((Number(n) || 0) * 100) / 100;
  }

  
  function toYMD(d) {
    const dt = d instanceof Date ? d : new Date(d);
    const y = dt.getUTCFullYear();
    const m = String(dt.getUTCMonth() + 1).padStart(2, "0");
    const day = String(dt.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }
  
  export const fetchAgentList = async (userid) => {
    try {
      const userQuery = new Parse.Query(Parse.User);
      userQuery.equalTo("roleName", "Agent");
      userQuery.equalTo("userParentId", userid);
      userQuery.select("objectId");
      const players = await userQuery.findAll({ useMasterKey: true });
      return players.map(player => player.id);
    } catch (error) {
      console.error("Error fetching player list:", error);
      throw error;
    }
  };