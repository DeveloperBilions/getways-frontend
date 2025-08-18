import { Parse } from "parse";

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
  startISO,
  endExclusiveISO,
  commissionPct = 12
) {
  if (!entityId) throw new Error("entityId required");

  const start = new Date(startISO);
  const endExclusive = new Date(endExclusiveISO);

  let agentIds = [entityId];
  if (entityType === "master") {
    agentIds = await fetchAgentList(entityId);
    if (!agentIds?.length) {
      return {
        success: true,
        data: {
          totalRecharges: 0,
          totalRedeems: 0,
          previousBalance: 0,
          commissionAmount: 0,
          finalBalance: 0
        }
      };
    }
  }

  const prevPipeline = [
    { $match: {
      userParentId: { $in: agentIds },
      transactionDate: {  $lt: start },
      $or: [
        { type: "recharge", status: { $in: [2, 3] } },
        { type: "redeem", status: { $in: [4, 8] } }
      ]
    }},
    {
      $facet: {
        prevRecharges: [
          { $match: { type: "recharge", status: { $in: [2, 3] } } },
          { $group: { _id: null, total: { $sum: "$transactionAmount" } } }
        ],
        prevRedeems: [
          { $match: { type: "redeem", status: { $in: [4, 8] }, transactionAmount: { $gt: 0, $type: "number" } } },
          { $group: { _id: null, total: { $sum: "$transactionAmount" } } }
        ]
      }
    }
  ];
  const prevAgg = await new Parse.Query("TransactionRecords").aggregate(prevPipeline, { useMasterKey: true });
  const prevRecharges = safe(prevAgg?.[0]?.prevRecharges?.[0]?.total);
  const prevRedeems = safe(prevAgg?.[0]?.prevRedeems?.[0]?.total);

  const prevPayPipeline = [
    { $match: { userId: entityId ,createdAt: { $lt: start } } },
    { $group: { _id: null, total: { $sum: "$amount" } } }
  ];
  const prevPayAgg = await new Parse.Query("DrawerAgent").aggregate(prevPayPipeline, { useMasterKey: true });
  const prevPayments = safe(prevPayAgg?.[0]?.total);

  const prevCommissionAmount = round2((prevRecharges * (Number(commissionPct) || 0)) / 100);
  const previousBalance = round2(prevRecharges - prevRedeems - prevPayments - prevCommissionAmount);

  const periodPipeline = [
    {
      $match: {
        userParentId: { $in: agentIds },
        transactionDate: { $gte: start, $lt: endExclusive },
        $or: [
          { type: "recharge", status: { $in: [2, 3] } },
          { type: "redeem", status: { $in: [4, 8] } }
        ]
      }
    },
    {
      $facet: {
        periodRecharges: [
          { $match: { type: "recharge", status: { $in: [2, 3] } } },
          { $group: { _id: null, total: { $sum: "$transactionAmount" } } }
        ],
        periodRedeems: [
          { $match: { type: "redeem", status: { $in: [4, 8] }, transactionAmount: { $gt: 0, $type: "number" } } },
          { $group: { _id: null, total: { $sum: "$transactionAmount" } } }
        ]
      }
    }
  ];
  const periodAgg = await new Parse.Query("TransactionRecords").aggregate(periodPipeline, { useMasterKey: true });
  const periodRecharges = safe(periodAgg?.[0]?.periodRecharges?.[0]?.total);
  const periodRedeems = safe(periodAgg?.[0]?.periodRedeems?.[0]?.total);

  const periodPayPipeline = [
    { $match: { userId: entityId, createdAt: { $gte: start, $lt: endExclusive } } },
    { $group: { _id: null, total: { $sum: "$amount" } } }
  ];
  const periodPayAgg = await new Parse.Query("DrawerAgent").aggregate(periodPayPipeline, { useMasterKey: true });
  const periodPayments = safe(periodPayAgg?.[0]?.total);

  const commissionAmount = round2((periodRecharges * (Number(commissionPct) || 0)) / 100);
  const finalBalance = round2(previousBalance + periodRecharges - periodRedeems - commissionAmount - periodPayments);

  return {
    success: true,
    data: {
      totalRecharges: round2(periodRecharges),
      totalRedeems: round2(periodRedeems),
      previousBalance: round2(previousBalance),
      commissionAmount,
      finalBalance
    }
  };
}

export async function fetchAccountingTransactions(
  entityType,
  entityId,
  startISO,
  endExclusiveISO
) {
  if (!entityId) throw new Error("entityId required");

  const start = new Date(startISO);
  const endExclusive = new Date(endExclusiveISO);

  let agentIds = [entityId];
  if (entityType === "master") agentIds = await fetchAgentList(entityId);
  if (!agentIds?.length) return [];

  const txPipeline = [
    {
      $match: {
        userParentId: { $in: agentIds },
        transactionDate: { $gte: start, $lt: endExclusive },
        $or: [
          { type: "recharge", status: { $in: [2, 3, "2", "3"] } },
          { type: "redeem",  status: { $in: [4, 8, "4", "8"] } }
        ]
      }
    },
    {
      $project: {
        _id: 0,
        date: { $dateToString: { format: "%Y-%m-%d", date: "$transactionDate" } },
        type: 1,
        status: 1,
        amount: "$transactionAmount",
        userId: 1,
        username: 1,
        userParentId: 1,
        portal: 1,
        // needed for mode
        transactionIdFromStripe: 1,
        referralLink: 1,
        useWallet: 1,
        // keep these if you still use them elsewhere
        transactionId: "$_id",
        transactionDateISO: {
          $dateToString: {
            format: "%Y-%m-%dT%H:%M:%S.%LZ",
            date: "$transactionDate",
            timezone: "UTC"
          }
        }
      }
    }
  ];

  const txRows = await new Parse.Query("TransactionRecords").aggregate(txPipeline, { useMasterKey: true });

  const userIds = new Set();
  txRows.forEach(r => r.userId && userIds.add(r.userId));
  if (entityType === "master") txRows.forEach(r => r.userParentId && userIds.add(r.userParentId));

  let nameMap = new Map();
  if (userIds.size) {
    const q = new Parse.Query(Parse.User);
    q.containedIn("objectId", Array.from(userIds));
    q.select(["name", "username"]);
    const rows = await q.find({ useMasterKey: true });
    nameMap = new Map(rows.map(u => [u.id, (u.get("name") || u.get("username") || u.id)]));
  }

  let fixedAgentName = null;
  let fixedMasterName = null;
  if (entityType === "agent") {
    try {
      const agentObj = await new Parse.Query(Parse.User).get(entityId, { useMasterKey: true });
      fixedAgentName = agentObj.get("name") || agentObj.get("username") || agentObj.id;
      const masterId = agentObj.get("userParentId");
      if (masterId) {
        const m = await new Parse.Query(Parse.User).get(masterId, { useMasterKey: true });
        fixedMasterName = m.get("name") || m.get("username") || m.id;
      }
    } catch {}
  } else if (entityType === "master") {
    try {
      const m = await new Parse.Query(Parse.User).get(entityId, { useMasterKey: true });
      fixedMasterName = m.get("name") || m.get("username") || m.id;
    } catch {}
  }

  // helper for mode
  const lower = v => (typeof v === "string" ? v.toLowerCase() : "");
  const getMode = (data) => {
    const id = lower(data?.transactionIdFromStripe);
    const ref = lower(data?.referralLink);
    return id.includes("txn")
      ? "WERT"
      : id.includes("crypto.link.com")
      ? "Link"
      : ref.includes("pay.coinbase.com")
      ? "CoinBase"
      : ref.includes("aog")
      ? "AOG"
      : ref.includes("transfi")
      ? "TransFi"
      : data?.useWallet
      ? "Wallet"
      : data?.portal === "Payarc"
      ? "Payarc"
      : "Stripe";
  };

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
    r.mode = getMode(r);
  });

  txRows.sort((a, b) => a.date.localeCompare(b.date));
  return txRows;
}


export const fetchAgentList = async (userid) => {
  const userQuery = new Parse.Query(Parse.User);
  userQuery.equalTo("roleName", "Agent");
  userQuery.equalTo("userParentId", userid);
  userQuery.select("objectId");
  const players = await userQuery.findAll({ useMasterKey: true });
  return players.map(p => p.id);
};

function safe(n) {
  const x = Number(n);
  return Number.isFinite(x) ? x : 0;
}
function round2(n) {
  return Math.round((Number(n) || 0) * 100) / 100;
}
