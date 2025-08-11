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
// utils/accounting.js
export async function fetchAccountingSummary(
    entityType,            // "agent" | "master" (for your logic/rbac; not used in queries except for clarity)
    entityId,              // agent or master id (used for DrawerAgent.userId)
    startDate,             // "YYYY-MM-DD"
    endDate,               // "YYYY-MM-DD"
    commissionPct = 12
  ) {
    if (!entityId) throw new Error("entityId required");
    if (!isISODate(startDate) || !isISODate(endDate)) {
      throw new Error("startDate/endDate must be YYYY-MM-DD");
    }
  
    // Inclusive date range: [startDate, endDate 23:59:59.999] by using exclusive end+1d
    const start = new Date(`${startDate}T00:00:00.000Z`);
    const endExclusive = addDays(new Date(`${endDate}T00:00:00.000Z`), 1);
  
    // All players under this entity
    let  playerList = [entityId];
    if(entityType === "master"){
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
   
  
    // ---------- PREVIOUS (before start) ----------
    const prevPipeline = [
      { $match: { userParentId: { $in: playerList } } },
      {
        $facet: {
          prevRecharges: [
            { $match: { type: "recharge", status: { $in: [2, 3] }, createdAt: { $lt: start } } },
            { $group: { _id: null, total: { $sum: "$transactionAmount" } } },
          ],
          prevRedeems: [
            {
              $match: {
                type: "redeem",
                status: { $in: [4, 8] },
                _created_at: { $lt: start },
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
  
    // Payments to this entity BEFORE the period
    const prevPayPipeline = [
      { $match: { userId: entityId, _created_at: { $lt: start } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ];
    const prevPayAgg = await new Parse.Query("DrawerAgent")
      .aggregate(prevPayPipeline, { useMasterKey: true });
    const prevPayments = safe(prevPayAgg?.[0]?.total);
  
    // Carry-forward before period (no commission applied here)
    const previousBalance = prevRecharges - prevRedeems - prevPayments;
  
    // ---------- PERIOD (between start..end) ----------
    const periodPipeline = [
      { $match: { userParentId: { $in: playerList }, createdAt: { $gte: start, $lt: endExclusive } } },
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
          // For CSV export
          transactions: [
            {
              $project: {
                _id: 0,
                date: {
                  $dateToString: { format: "%Y-%m-%d", date: "$_created_at" },
                },
                type: 1,
                status: 1,
                amount: "$transactionAmount",
                userId: 1,
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
  
    // Payments INSIDE the period (reduce final balance)
    const periodPayPipeline = [
      { $match: { userId: entityId, _created_at: { $gte: start, $lt: endExclusive } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ];
    const periodPayAgg = await new Parse.Query("DrawerAgent")
      .aggregate(periodPayPipeline, { useMasterKey: true });
    const periodPayments = safe(periodPayAgg?.[0]?.total);
  
    // Add payments into export rows
    const payTxRows = await buildPaymentRows(entityId, start, endExclusive);
  
    // Commission applies only on period recharges
    const commissionAmount = round2((periodRecharges * (Number(commissionPct) || 0)) / 100);
  
    // Final balance:
    // previous + periodRecharges - periodRedeems - commission - periodPayments
    const finalBalance = round2(
      previousBalance + periodRecharges - periodRedeems - commissionAmount - periodPayments
    );
  
    // Merge export rows
    const transactions = [...txRows, ...payTxRows].sort((a, b) =>
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
  
  async function buildPaymentRows(entityId, start, endExclusive) {
    const payList = await new Parse.Query("DrawerAgent")
      .greaterThanOrEqualTo("_created_at", start)
      .lessThan("_created_at", endExclusive)
      .equalTo("userId", entityId)
      .find({ useMasterKey: true });
  
    return payList.map((p) => ({
      date: toYMD(p.get("createdAt") || p.get("_created_at") || p.createdAt),
      type: "payment",
      status: "paid",
      amount: Number(p.get("amount") || 0),
      userId: entityId,
      reference: p.id,
    }));
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