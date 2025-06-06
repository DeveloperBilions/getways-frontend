import { Parse } from "parse";
import { dataProvider } from "../Provider/parseDataProvider";
Parse.initialize(
    process.env.REACT_APP_APPID,
    process.env.REACT_APP_JAVASCRIPT_KEY,
    process.env.REACT_APP_MASTER_KEY
  );
  Parse.serverURL = process.env.REACT_APP_URL;
  Parse.masterKey = process.env.REACT_APP_MASTER_KEY;
export const getParentUserId = async (userId) => {
    try {
      const userQuery = new Parse.Query(Parse.User);
      userQuery.equalTo("objectId", userId);
      userQuery.select("userParentId");
  
      const user = await userQuery.first({ useMasterKey: true });
  
      if (!user) {
        throw new Error("User not found.");
      }
  
      const parentUserId = user.get("userParentId");
      if (!parentUserId) {
        throw new Error("Parent user not found.");
      }
  
      return parentUserId;
    } catch (error) {
      console.error("Error fetching parent user ID:", error);
      throw error;
    }
  };
  
export  async function updatePotBalance(userId, amount, type) {
    try {
      if (!userId || !amount || amount <= 0 || !type) return;
  
      const userQuery = new Parse.Query(Parse.User);
      userQuery.equalTo("objectId", userId);
      userQuery.select("potBalance");
  
      const user = await userQuery.first({ useMasterKey: true });
  
      if (!user) {
        throw new Error(`User not found: ${userId}`);
      }
  
      const currentPotBalance = user.get("potBalance") || 0;
      const potChangeAmount = Math.floor(amount * 0.15);
  
      let newPotBalance;
      if (type === "redeem") {
        newPotBalance = Math.max(0, currentPotBalance - amount); // Prevent negative balance
      } else if (type === "recharge") {
        newPotBalance = currentPotBalance + (amount - potChangeAmount);
      }
     else {
        throw new Error(`Invalid transaction type: ${type}`);
      }
  
      user.set("potBalance", newPotBalance);
      await user.save(null, { useMasterKey: true });
    } catch (error) {
      console.error(`Error updating potBalance for user ${userId}: ${error.message}`);
    }
  }

  export async function fetchTransactionSummary(userid) {
    const playerList = await fetchPlayerList(userid)
    const queryPipeline = [
      {
        $match: {
          userId:{ $in: playerList }
        },
      },
      {
        $facet: {
          totalRechargeAmount: [
            { $match: { status: { $in: [2, 3] } } },
            {
              $group: { _id: null, total: { $sum: "$transactionAmount" } },
            },
          ],
          totalRedeemAmount: [
            {
              $match: {
                type: "redeem",
                status: { $in: [4, 8] },
                transactionAmount: { $gt: 0, $type: "number" },
              },
            },
            {
              $group: { _id: null, total: { $sum: "$transactionAmount" } },
            },
          ],
          totalRecords: [{ $count: "total" }],
        },
      },
    ];
  
    const transactionResults = await new Parse.Query("TransactionRecords")
      .aggregate(queryPipeline, { useMasterKey: true });
  
    const { totalRechargeAmount, totalRedeemAmount, totalRecords } =
      transactionResults[0];
  
      const drawerAgentQueryPipeline = [
        {
          $match: {
            userId: userid
          },
        },
        {
          $group: { _id: null, total: { $sum: "$amount" } },
        },
      ];
    
      const drawerAgentResults = await new Parse.Query("DrawerAgent")
        .aggregate(drawerAgentQueryPipeline, { useMasterKey: true });

    return {
      totalRechargeAmount: totalRechargeAmount[0]?.total || 0,
      totalRedeemAmount: totalRedeemAmount[0]?.total || 0,
      totalRecords: totalRecords[0]?.total || 0,
      drawerAgentResults:drawerAgentResults[0]?.total || 0
    };
  }
  
  export const fetchPlayerList = async (userid) => {
    try {
      const userQuery = new Parse.Query(Parse.User);
      userQuery.equalTo("roleName", "Player");
      userQuery.equalTo("userParentId", userid);
      userQuery.select("objectId");
      userQuery.limit(100000);
      const players = await userQuery.find({ useMasterKey: true });
      return players.map(player => player.id);
    } catch (error) {
      console.error("Error fetching player list:", error);
      throw error;
    }
  };

export const addPayHistory = async (userId, amount, doneBy) => {
  try {
    // Fetch the user's potBalance
    const userQuery = new Parse.Query(Parse.User);
    userQuery.equalTo("objectId", userId);
    userQuery.select("potBalance");
    
    const user = await userQuery.first({ useMasterKey: true });

    if (!user) {
      throw new Error("User not found.");
    }

    const beforeBalance = user.get("potBalance") || 0; // Get current balance
    const afterBalance = beforeBalance - amount; // Calculate new balance

    if (afterBalance < 0) {
      throw new Error("Insufficient balance.");
    }

    // Create a new record in DrawerAgent table
    const DrawerAgent = Parse.Object.extend("DrawerAgent");
    const newRecord = new DrawerAgent();

    newRecord.set("userId", userId);
    newRecord.set("beforeBalance", beforeBalance);
    newRecord.set("afterBalance", afterBalance);
    newRecord.set("amount", amount);
    newRecord.set("doneBy", doneBy);

    // Save the record
    await newRecord.save(null, { useMasterKey: true });

    // Update user's potBalance
    user.set("potBalance", afterBalance);
    await user.save(null, { useMasterKey: true });

    return { success: true, message: "Pay history added successfully." };
  } catch (error) {
    console.error("Error adding pay history:", error);
    return { success: false, message: error.message };
  }
};

export const fetchDrawerAgentHistory = async (userId, page = 0, limit = 10) => {
  try {
    const DrawerAgent = Parse.Object.extend("DrawerAgent");
    const query = new Parse.Query(DrawerAgent);
    
    query.equalTo("userId", userId); // Filter by userId
    query.descending("createdAt"); // Order by latest transactions first
    query.limit(limit); // Limit the number of results per page
    query.skip(page * limit); // Skip records based on the page

    const results = await query.find();
    const totalCount = await query.count(); // Get total count for pagination

    return {
      data: results.map((entry) => ({
        userId: entry.get("userId"),
        beforeBalance: entry.get("beforeBalance"),
        afterBalance: entry.get("afterBalance"),
        amount: entry.get("amount"),
        doneBy: entry.get("doneBy"),
        createdAt: entry.get("createdAt"),
      })),
      total: totalCount, // Return total records for pagination
    };
  } catch (error) {
    console.error("Error fetching drawer agent history:", error);
    return { data: [], total: 0 };
  }
};

export const getAgentRechargeReport = async (fromDate, toDate, page = 1, limit = 50) => {
  const userQuery = new Parse.Query(Parse.User);
  userQuery.equalTo("roleName", "Agent");
  userQuery.select("objectId", "username"); // Include username
  userQuery.limit(100000);
  const agents = await userQuery.find({ useMasterKey: true });

  const agentIds = agents.map(agent => agent.id);
  if (agentIds.length === 0) return [];

  // Find players under these agents
  const playerQuery = new Parse.Query(Parse.User);
  playerQuery.containedIn("userParentId", agentIds);
  playerQuery.select("objectId", "userParentId"); // Select player ID and parent agent ID
  playerQuery.limit(100000);
  const players = await playerQuery.find({ useMasterKey: true });

  if (players.length === 0) return [];

  // Create a mapping of players to their agents
  const playerAgentMap = {};
  players.forEach(player => {
    playerAgentMap[player.id] = player.get("userParentId");
  });

  const playerIds = players.map(player => player.id);

  // Find recharge transactions for these players
  const Transaction = Parse.Object.extend("TransactionRecords");
  const transactionQuery = new Parse.Query(Transaction);

  if (fromDate) {
    transactionQuery.greaterThanOrEqualTo("transactionDate", new Date(fromDate));
  }
  if (toDate) {
    transactionQuery.lessThanOrEqualTo("transactionDate", new Date(toDate));
  }

  transactionQuery.containedIn("userId", playerIds);
  transactionQuery.equalTo("type", "recharge");
  transactionQuery.containedIn("status", [2, 3]); // Only successful transactions
  transactionQuery.limit(100000);

  // Aggregate total recharge amount per agent
  const pipeline = [
    {
      $match: {
        userId: { $in: playerIds },
        transactionDate: {
          $gte: fromDate ? new Date(fromDate) : new Date("1970-01-01"),
          $lte: toDate ? new Date(toDate) : new Date(),
        },
        type: "recharge",
        status: { $in: [2, 3] },
      },
    },
    {
      $group: {
        _id: "$userId", // Group by player ID first
        totalRechargeAmount: { $sum: "$transactionAmount" },
      },
    },
  ];

  const results = await transactionQuery.aggregate(pipeline);

  // Map player transactions to their respective agents
  const agentRechargeMap = {};

  results.forEach(result => {
    const agentId = playerAgentMap[result._id]; // Get agent ID from player ID
    if (agentId) {
      if (!agentRechargeMap[agentId]) {
        agentRechargeMap[agentId] = 0;
      }
      agentRechargeMap[agentId] += result.totalRechargeAmount; // Sum recharge per agent
    }
  });

  // Convert to array and sort
  const finalResults = Object.entries(agentRechargeMap)
    .map(([agentId, totalRechargeAmount]) => {
      const agent = agents.find(a => a.id === agentId);
      return {
        agentId,
        agentName: agent ? agent.get("username") : "Unknown Agent",
        totalRechargeAmount: totalRechargeAmount.toFixed(2),
      };
    })
    .sort((a, b) => b.totalRechargeAmount - a.totalRechargeAmount) // Sort by recharge amount
    .slice((page - 1) * limit, page * limit); // Paginate results
  return finalResults;
};


export const fetchTransactionsofAgent = async ({
  sortOrder = "desc",
  startDate,
  endDate,
} = {}) => {
  try {
    // Step 1: Set start and end date with correct hours
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0); // Start of the day in UTC

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // End of the day in UTC

    // Step 2: Fetch transactions grouped by userParentId
    const pipeline = [
      { 
        $match: { 
          transactionDate: { $gte: start, $lte: end },
          transactionAmount: { $gt: 0, $type: "number" }, // Ensure valid transaction amounts
          status: { $in: [2, 3, 4, 8, 12] }, // Recharge: 2,3; Redeem: 4,8; Cashout: 12
          // userParentId: { $exists: true, $ne: null } // Ensure valid userParentId
        } 
      },
      { 
        $group: {
          _id: "$userParentId", // Group by userParentId (agent)
          totalRecharge: { 
            $sum: { $cond: [{ $in: ["$status", [2, 3]] }, "$transactionAmount", 0] }
          },
          totalRedeem: { 
            $sum: { $cond: [{ $in: ["$status", [4, 8]] }, "$transactionAmount", 0] }
          },
          totalCashout: { 
            $sum: { $cond: [{ $eq: ["$status", 12] }, "$transactionAmount", 0] }
          }
        }
      },
      {
        $project: {
          _id: 0,
          agentId: "$_id",
          totalRecharge: { $round: ["$totalRecharge", 2] },
          totalRedeem: { $round: ["$totalRedeem", 2] },
          totalCashout: { $round: ["$totalCashout", 2] }
        }
      }
    ];

    // Fetch from both collections
    const activeTransactions = await new Parse.Query("TransactionRecords")
      .aggregate(pipeline, { useMasterKey: true });
    const archiveTransactions = await new Parse.Query("Transactionrecords_archive")
      .aggregate(pipeline, { useMasterKey: true });

    // Step 3: Merge transactions using a Map
    const transactionMap = new Map();

    // Helper function to process transactions
    const processTransactions = (transactions) => {
      transactions.forEach(tx => {
        const agentId = tx.agentId;
        if (transactionMap.has(agentId)) {
          const existing = transactionMap.get(agentId);
          transactionMap.set(agentId, {
            agentId,
            totalRecharge: (existing.totalRecharge || 0) + (tx.totalRecharge || 0),
            totalRedeem: (existing.totalRedeem || 0) + (tx.totalRedeem || 0),
            totalCashout: (existing.totalCashout || 0) + (tx.totalCashout || 0)
          });
        } else {
          transactionMap.set(agentId, {
            agentId,
            totalRecharge: tx.totalRecharge || 0,
            totalRedeem: tx.totalRedeem || 0,
            totalCashout: tx.totalCashout || 0
          });
        }
      });
    };

    // Process both active and archive transactions
    processTransactions(activeTransactions);
    processTransactions(archiveTransactions);

    if (transactionMap.size === 0) {
      return { status: "success", data: [] };
    }

    // Step 4: Fetch agent names
    const agentIds = Array.from(transactionMap.keys());
    const agentQuery = new Parse.Query(Parse.User);
    agentQuery.containedIn("objectId", agentIds);
    agentQuery.select("objectId", "username");
    agentQuery.limit(10000);
    const agents = await agentQuery.find({ useMasterKey: true });

    const agentMap = {};
    agents.forEach(agent => {
      agentMap[agent.id] = agent.get("username") || "Unknown Agent";
    });

    // Step 5: Format and sort the data
    const formattedData = Array.from(transactionMap.values()).map(tx => ({
      agentName: agentMap[tx.agentId] || "Unknown Agent",
      totalRecharge: parseFloat((tx.totalRecharge || 0).toFixed(2)),
      totalRedeem: parseFloat((tx.totalRedeem || 0).toFixed(2)),
      totalCashout: parseFloat((tx.totalCashout || 0).toFixed(2))
    }));

    const sortedData = formattedData.sort((a, b) => 
      sortOrder === "asc" 
        ? a.totalRecharge - b.totalRecharge 
        : b.totalRecharge - a.totalRecharge
    );

    return { status: "success", data: sortedData };

  } catch (error) {
    console.error("Error fetching transactions:", error.message);
    return { status: "error", code: 500, message: error.message };
  }
};

export const fetchTransactionComparison = async ({
  sortOrder = "desc",
  selectedDates,
  type = "date",
} = {}) => {
  try {
    // Step 1: Determine date format based on type
    let dateFormat = "%Y-%m-%d";
    if (type === "month") {
      dateFormat = "%Y-%m";
    } else if (type === "year") {
      dateFormat = "%Y";
    }

    // Step 2: Build aggregation pipeline
    const pipeline = [
      {
        $match: {
          transactionAmount: { $gt: 0, $type: "number" },
          status: { $in: [2, 3, 4, 8, 12] }, // Recharge: 2,3; Redeem: 4,8; Cashout: 12
          // userParentId: { $exists: true, $ne: null }, // Ensure valid userParentId
        },
      },
      {
        $group: {
          _id: {
            agent: "$userParentId",
            date: {
              $dateToString: {
                format: dateFormat,
                date: "$transactionDate",
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
              },
            },
          },
          totalRecharge: {
            $sum: { $cond: [{ $in: ["$status", [2, 3]] }, "$transactionAmount", 0] },
          },
          totalRedeem: {
            $sum: { $cond: [{ $in: ["$status", [4, 8]] }, "$transactionAmount", 0] },
          },
          totalCashout: {
            $sum: { $cond: [{ $eq: ["$status", 12] }, "$transactionAmount", 0] },
          },
        },
      },
      {
        $match: {
          "_id.date": { $in: selectedDates }, // Match only selected dates
        },
      },
      {
        $project: {
          _id: 0,
          agentId: "$_id.agent",
          date: "$_id.date",
          totalRecharge: { $round: ["$totalRecharge", 2] },
          totalRedeem: { $round: ["$totalRedeem", 2] },
          totalCashout: { $round: ["$totalCashout", 2] },
        },
      },
      {
        $sort: { date: sortOrder === "asc" ? 1 : -1 },
      },
    ];

    // Step 3: Fetch transactions from both collections
    const activeTransactions = await new Parse.Query("TransactionRecords").aggregate(pipeline, {
      useMasterKey: true,
    });
    const archiveTransactions = await new Parse.Query("Transactionrecords_archive").aggregate(
      pipeline,
      { useMasterKey: true }
    );

    // Step 4: Merge transactions using a Map
    const transactionMap = new Map();

    const processTransactions = (transactions) => {
      transactions.forEach((tx) => {
        const key = `${tx.agentId}-${tx.date}`; // Unique key for agent and date
        if (transactionMap.has(key)) {
          const existing = transactionMap.get(key);
          transactionMap.set(key, {
            agentId: tx.agentId,
            date: tx.date,
            totalRecharge: existing.totalRecharge + (tx.totalRecharge || 0),
            totalRedeem: existing.totalRedeem + (tx.totalRedeem || 0),
            totalCashout: existing.totalCashout + (tx.totalCashout || 0),
          });
        } else {
          transactionMap.set(key, {
            agentId: tx.agentId,
            date: tx.date,
            totalRecharge: tx.totalRecharge || 0,
            totalRedeem: tx.totalRedeem || 0,
            totalCashout: tx.totalCashout || 0,
          });
        }
      });
    };

    processTransactions(activeTransactions);
    processTransactions(archiveTransactions);

    if (transactionMap.size === 0) {
      return { status: "success", data: [] };
    }

    // Step 5: Fetch agent names
    const agentIds = [...new Set([...transactionMap.values()].map((tx) => tx.agentId))];
    const agentQuery = new Parse.Query(Parse.User);
    agentQuery.containedIn("objectId", agentIds);
    agentQuery.select("objectId", "username");
    agentQuery.limit(10000);
    const agents = await agentQuery.find({ useMasterKey: true });

    const agentMap = {};
    agents.forEach((agent) => {
      agentMap[agent.id] = agent.get("username") || "Unknown Agent";
    });

    // Step 6: Format output
    const formattedData = {};
    transactionMap.forEach((tx) => {
      const agentId = tx.agentId;
      if (!formattedData[agentId]) {
        formattedData[agentId] = {
          agentName: agentMap[agentId] || "Unknown Agent",
          transactions: {},
        };
      }
      formattedData[agentId].transactions[tx.date] = {
        totalRecharge: tx.totalRecharge,
        totalRedeem: tx.totalRedeem,
        totalCashout: tx.totalCashout,
      };
    });

    return { status: "success", data: Object.values(formattedData) };
  } catch (error) {
    console.error("Error fetching transactions:", error.message);
    return { status: "error", code: 500, message: error.message };
  }
};

export const fetchTransactionsofPlayer = async ({
  userParentId,
  startDate,
  endDate,
} = {}) => {
  try {
    // Step 1: Set start and end date with correct hours
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0); // Start of the day

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // End of the day

    // Step 2: Fetch transactions grouped by username
    const pipeline = [
      { 
        $match: {
          transactionDate: { $gte: start, $lte: end },
          transactionAmount: { $gt: 0, $type: "number" }, // Ensure valid transaction amounts
          status: { $in: [2, 3, 4, 8, 12] }, // Relevant statuses only
          username: { $exists: true, $ne: null } // Ensure valid username
        } 
      },
      { 
        $group: {
          _id: "$username", // Group by username
          totalRecharge: { 
            $sum: { 
              $cond: [{ $in: ["$status", [2, 3]] }, "$transactionAmount", 0] 
            }
          },
          totalRedeem: { 
            $sum: { 
              $cond: [{ $in: ["$status", [4, 8]] }, "$transactionAmount", 0] 
            }
          },
          totalCashout: { 
            $sum: { 
              $cond: [{ $eq: ["$status", 12] }, "$transactionAmount", 0] 
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          username: "$_id",
          totalRecharge: { $round: ["$totalRecharge", 2] },
          totalRedeem: { $round: ["$totalRedeem", 2] },
          totalCashout: { $round: ["$totalCashout", 2] }
        }
      }
    ];

    if (userParentId) {
      pipeline[0].$match.userParentId = userParentId;
    }

    // Fetch from both active and archive collections
    const activeTransactions = await new Parse.Query("TransactionRecords")
      .aggregate(pipeline, { useMasterKey: true });
    const archiveTransactions = await new Parse.Query("Transactionrecords_archive")
      .aggregate(pipeline, { useMasterKey: true });

    // Step 3: Merge results from both collections
    const transactionMap = new Map();

    // Process active transactions
    activeTransactions.forEach(tx => {
      transactionMap.set(tx.username, {
        username: tx.username,
        totalRecharge: tx.totalRecharge || 0,
        totalRedeem: tx.totalRedeem || 0,
        totalCashout: tx.totalCashout || 0
      });
    });

    // Merge archive transactions
    archiveTransactions.forEach(tx => {
      if (transactionMap.has(tx.username)) {
        const existing = transactionMap.get(tx.username);
        transactionMap.set(tx.username, {
          username: tx.username,
          totalRecharge: (existing.totalRecharge || 0) + (tx.totalRecharge || 0),
          totalRedeem: (existing.totalRedeem || 0) + (tx.totalRedeem || 0),
          totalCashout: (existing.totalCashout || 0) + (tx.totalCashout || 0)
        });
      } else {
        transactionMap.set(tx.username, {
          username: tx.username,
          totalRecharge: tx.totalRecharge || 0,
          totalRedeem: tx.totalRedeem || 0,
          totalCashout: tx.totalCashout || 0
        });
      }
    });

    // Convert map to array and sort
    const mergedTransactions = Array.from(transactionMap.values())
      .sort((a, b) => b.totalRecharge - a.totalRecharge);

    return {
      status: "success",
      data: mergedTransactions.length > 0 ? mergedTransactions : []
    };

  } catch (error) {
    console.error("Error fetching transactions:", error.message);
    return { status: "error", code: 500, message: error.message };
  }
}

export const fetchTransactionsofAgentByDate = async ({
  sortOrder = "desc",
  startDate,
  endDate,
  agentId,
} = {}) => {
  try {
    // Step 1: Normalize start and end dates
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0); 

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); 

    // Step 2: Build match conditions
    const matchConditions = {
      transactionDate: { $gte: start, $lte: end },
      transactionAmount: { $gt: 0, $type: "number" },
      status: { $in: [2, 3, 4, 8, 12] }, // Recharge: 2,3; Redeem: 4,8; Cashout: 12
    };

    if (agentId) {
      matchConditions.userParentId = agentId;
    }

    // Step 3: Aggregation pipeline
    const pipeline = [
      { $match: matchConditions },
      {
        $group: {
          _id: {
            agent: "$userParentId",
            date: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$transactionDate",
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, // Local timezone
              },
            },
          },
          totalRecharge: {
            $sum: { $cond: [{ $in: ["$status", [2, 3]] }, "$transactionAmount", 0] },
          },
          totalRedeem: {
            $sum: { $cond: [{ $in: ["$status", [4, 8]] }, "$transactionAmount", 0] },
          },
          totalCashout: {
            $sum: { $cond: [{ $eq: ["$status", 12] }, "$transactionAmount", 0] },
          },
        },
      },
      {
        $project: {
          _id: 0,
          agentId: "$_id.agent",
          date: "$_id.date",
          totalRecharge: { $round: ["$totalRecharge", 2] },
          totalRedeem: { $round: ["$totalRedeem", 2] },
          totalCashout: { $round: ["$totalCashout", 2] },
        },
      },
      { $sort: { date: sortOrder === "asc" ? 1 : -1 } },
    ];

    // Step 4: Fetch from both collections
    const activeTransactions = await new Parse.Query("TransactionRecords").aggregate(pipeline, {
      useMasterKey: true,
    });
    const archiveTransactions = await new Parse.Query("Transactionrecords_archive").aggregate(
      pipeline,
      { useMasterKey: true }
    );

    // Step 5: Merge transactions using a Map
    const transactionMap = new Map();

    const processTransactions = (transactions) => {
      transactions.forEach((tx) => {
        const key = `${tx.agentId}-${tx.date}`;
        if (transactionMap.has(key)) {
          const existing = transactionMap.get(key);
          transactionMap.set(key, {
            agentId: tx.agentId,
            date: tx.date,
            totalRecharge: existing.totalRecharge + tx.totalRecharge,
            totalRedeem: existing.totalRedeem + tx.totalRedeem,
            totalCashout: existing.totalCashout + tx.totalCashout,
          });
        } else {
          transactionMap.set(key, {
            agentId: tx.agentId,
            date: tx.date,
            totalRecharge: tx.totalRecharge || 0,
            totalRedeem: tx.totalRedeem || 0,
            totalCashout: tx.totalCashout || 0,
          });
        }
      });
    };

    processTransactions(activeTransactions);
    processTransactions(archiveTransactions);

    if (transactionMap.size === 0) {
      return { status: "success", data: [] };
    }

    // Step 6: Fetch agent name
    const agentQuery = new Parse.Query(Parse.User);
    agentQuery.equalTo("objectId", agentId);
    agentQuery.select("username");
    const agent = await agentQuery.first({ useMasterKey: true });
    const agentName = agent ? agent.get("username") : "Unknown Agent";

    // Step 7: Format output
    const transactionsByDate = {};
    transactionMap.forEach((value) => {
      transactionsByDate[value.date] = {
        totalRecharge: value.totalRecharge,
        totalRedeem: value.totalRedeem,
        totalCashout: value.totalCashout,
      };
    });

    const formattedData = [
      {
        agentName,
        transactions: transactionsByDate,
      },
    ];

    return { status: "success", data: formattedData };
  } catch (error) {
    console.error("Error fetching transactions:", error.message);
    return { status: "error", code: 500, message: error.message };
  }
};


export const checkActiveRechargeLimit = async (userId, transactionAmount) => {
  try {
    // Fetch user details
    const userQuery = new Parse.Query(Parse.User);
    userQuery.equalTo("objectId", userId);
    const user = await userQuery.first({ useMasterKey: true });

    if (!user) {
      throw new Error(`User with ID ${userId} not found.`);
    }

    // Get user's active recharge limit settings
    const activeRechargeLimit = user.get("activeRechargeLimit"); // "daily" or "monthly"
    const monthlyLimit = user.get("monthlyRechargeLimit") || 0;
    const dailyLimit = user.get("dailyRechargeLimit") || 0;

    if (!activeRechargeLimit) {
      return { success: true, message: "No active recharge limit set." };
    }

    // Determine the start date based on the active recharge limit (Convert to CST)
    const nowUTC = new Date();
    const offsetCST = 6 * 60 * 60 * 1000; // CST is UTC-6 (in milliseconds)
    let startDateCST = new Date(nowUTC.getTime() - offsetCST); // Adjust to CST

    if (activeRechargeLimit === "monthly") {
      startDateCST.setDate(1); // Set to 1st day of the month
      startDateCST.setHours(0, 0, 0, 0); // Reset time to midnight CST
    } else {
      startDateCST.setHours(0, 0, 0, 0); // Reset time to midnight CST
    }

    // Convert CST start date back to UTC for querying
    let startDateUTC = new Date(startDateCST.getTime() + offsetCST);

    // Use MongoDB aggregation pipeline to calculate total recharged amount
    const pipeline = [
      {
        $match: {
          userParentId: userId,
          status: { $in: [2, 3] }, // Only successful transactions
          transactionDate: { $gte: startDateUTC }, // Filter transactions within active period
        },
      },
      {
        $group: {
          _id: null,
          totalRecharged: { $sum: "$transactionAmount" }, // Sum transaction amounts
        },
      },
    ];

    const TransactionRecords = Parse.Object.extend("TransactionRecords");
    const query = new Parse.Query(TransactionRecords);
    const totalRechargedResult = await query.aggregate(pipeline);

    // Extract total recharged amount from aggregation result
    const totalRecharged = totalRechargedResult.length > 0 ? totalRechargedResult[0].totalRecharged : 0;

    // Convert new transaction amount to correct format (cents to dollars)
    const newTransactionAmount = Math.floor(parseFloat(transactionAmount)) ;
    // Check if the new transaction would exceed the limit
    if (
      (activeRechargeLimit === "monthly" && totalRecharged + newTransactionAmount > monthlyLimit) ||
      (activeRechargeLimit === "daily" && totalRecharged + newTransactionAmount > dailyLimit)
    ) {
      const limitAmount = activeRechargeLimit === "monthly" ? monthlyLimit :dailyLimit
      return {
        success: false,
        message: `The maximum ${activeRechargeLimit} recharge limit is ${limitAmount}. Please try again.`
       // message: `You have reached the ${activeRechargeLimit} maximum limit. Please try again later.`,
      };
    }

    return { success: true, message: "Transaction within allowed recharge limit." };
  } catch (error) {
    console.error("Error in checkActiveRechargeLimit:", error.message);
    return { success: false, message: error.message || "An error occurred while checking limits." };
  }
};

export const fetchPlayerTransactionComparison = async ({
  sortOrder = "desc",
  selectedDates,
  type = "date",
  playerId,
} = {}) => {
  try {
    // Step 1: Determine date format based on type
    let dateFormat = "%Y-%m-%d";
    if (type === "month") {
      dateFormat = "%Y-%m";
    } else if (type === "year") {
      dateFormat = "%Y";
    }

    // Step 2: Build aggregation pipeline
    const pipeline = [
      {
        $match: {
          transactionAmount: { $gt: 0, $type: "number" }, // Ensure valid transaction amounts
          status: { $in: [2, 3, 4, 8, 12] }, // Recharge: 2,3; Redeem: 4,8; Cashout: 12
          username: { $exists: true, $ne: null }, // Ensure valid username
        },
      },
      {
        $group: {
          _id: {
            username: "$username",
            date: {
              $dateToString: {
                format: dateFormat,
                date: "$transactionDate",
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, // Local timezone
              },
            },
          },
          totalRecharge: {
            $sum: { $cond: [{ $in: ["$status", [2, 3]] }, "$transactionAmount", 0] },
          },
          totalRedeem: {
            $sum: { $cond: [{ $in: ["$status", [4, 8]] }, "$transactionAmount", 0] },
          },
          totalCashout: {
            $sum: { $cond: [{ $eq: ["$status", 12] }, "$transactionAmount", 0] },
          },
        },
      },
      {
        $match: {
          "_id.date": { $in: selectedDates }, // Match only selected dates
        },
      },
      {
        $project: {
          _id: 0,
          username: "$_id.username",
          date: "$_id.date",
          totalRecharge: { $round: ["$totalRecharge", 2] },
          totalRedeem: { $round: ["$totalRedeem", 2] },
          totalCashout: { $round: ["$totalCashout", 2] },
        },
      },
      {
        $sort: { date: sortOrder === "asc" ? 1 : -1, username: 1 },
      },
    ];

    if (playerId) {
      pipeline[0].$match.userId = { $exists: true, $ne: null, $eq: playerId }; // Filter by playerId
    }

    // Step 3: Fetch transactions from both collections
    const activeTransactions = await new Parse.Query("TransactionRecords").aggregate(pipeline, {
      useMasterKey: true,
    });
    const archiveTransactions = await new Parse.Query("Transactionrecords_archive").aggregate(
      pipeline,
      { useMasterKey: true }
    );

    // Step 4: Merge transactions using a Map
    const transactionMap = new Map();

    // Helper function to process transactions
    const processTransactions = (transactions) => {
      transactions.forEach((tx) => {
        const key = `${tx.username}-${tx.date}`; // Unique key for username and date
        if (transactionMap.has(key)) {
          const existing = transactionMap.get(key);
          transactionMap.set(key, {
            username: tx.username,
            date: tx.date,
            totalRecharge: (existing.totalRecharge || 0) + (tx.totalRecharge || 0),
            totalRedeem: (existing.totalRedeem || 0) + (tx.totalRedeem || 0),
            totalCashout: (existing.totalCashout || 0) + (tx.totalCashout || 0),
          });
        } else {
          transactionMap.set(key, {
            username: tx.username,
            date: tx.date,
            totalRecharge: tx.totalRecharge || 0,
            totalRedeem: tx.totalRedeem || 0,
            totalCashout: tx.totalCashout || 0,
          });
        }
      });
    };

    // Process active and archive transactions
    processTransactions(activeTransactions);
    processTransactions(archiveTransactions);

    // Step 5: Format output
    if (transactionMap.size === 0) {
      return { status: "success", data: [] };
    }

    const formattedData = {};
    transactionMap.forEach((tx) => {
      if (!formattedData[tx.username]) {
        formattedData[tx.username] = {
          username: tx.username,
          transactions: {},
        };
      }
      formattedData[tx.username].transactions[tx.date] = {
        totalRecharge: tx.totalRecharge,
        totalRedeem: tx.totalRedeem,
        totalCashout: tx.totalCashout,
      };
    });

    return { status: "success", data: Object.values(formattedData) };
  } catch (error) {
    console.error("Error fetching transactions:", error.message);
    return { status: "error", code: 500, message: error.message };
  }
};

export const fetchTransactionsofPlayerByDate = async ({
  sortOrder = "desc",
  startDate,
  endDate,
  playerId,
} = {}) => {
  try {
    // Step 1: Set start and end date with correct hours
    const start = new Date(startDate);
    start.setUTCHours(0, 0, 0, 0); // Start of the day in UTC

    const end = new Date(endDate);
    end.setUTCHours(23, 59, 59, 999); // End of the day in UTC

    // Step 2: Fetch transactions grouped by playerId and date
    const matchConditions = {
      transactionDate: { $gte: start, $lte: end },
      transactionAmount: { $gt: 0, $type: "number" }, // Ensure valid transaction amounts
      status: { $in: [2, 3, 4, 8, 12] }, // Recharge: 2,3; Redeem: 4,8; Cashout: 12
      userId: { $exists: true, $ne: null }, // Ensure valid userId
    };

    if (playerId) {
      matchConditions.userId = playerId; // Filter for specific player
    }

    const pipeline = [
      { $match: matchConditions },
      {
        $group: {
          _id: {
            player: "$userId",
            date: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$transactionDate",
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, // Local timezone
              },
            },
          },
          totalRecharge: {
            $sum: { $cond: [{ $in: ["$status", [2, 3]] }, "$transactionAmount", 0] },
          },
          totalRedeem: {
            $sum: { $cond: [{ $in: ["$status", [4, 8]] }, "$transactionAmount", 0] },
          },
          totalCashout: {
            $sum: { $cond: [{ $eq: ["$status", 12] }, "$transactionAmount", 0] },
          },
        },
      },
      {
        $project: {
          _id: 0,
          playerId: "$_id.player",
          date: "$_id.date",
          totalRecharge: { $round: ["$totalRecharge", 2] },
          totalRedeem: { $round: ["$totalRedeem", 2] },
          totalCashout: { $round: ["$totalCashout", 2] },
        },
      },
      {
        $sort: { date: sortOrder === "asc" ? 1 : -1 }, // Sort by date
      },
    ];

    // Step 3: Fetch transactions from both collections
    const activeTransactions = await new Parse.Query("TransactionRecords").aggregate(pipeline, {
      useMasterKey: true,
    });
    const archiveTransactions = await new Parse.Query("Transactionrecords_archive").aggregate(
      pipeline,
      { useMasterKey: true }
    );

    // Step 4: Merge transactions using a Map
    const transactionMap = new Map();

    // Helper function to process transactions
    const processTransactions = (transactions) => {
      transactions.forEach((tx) => {
        const key = `${tx.playerId}-${tx.date}`; // Unique key for playerId and date
        if (transactionMap.has(key)) {
          const existing = transactionMap.get(key);
          transactionMap.set(key, {
            playerId: tx.playerId,
            date: tx.date,
            totalRecharge: (existing.totalRecharge || 0) + (tx.totalRecharge || 0),
            totalRedeem: (existing.totalRedeem || 0) + (tx.totalRedeem || 0),
            totalCashout: (existing.totalCashout || 0) + (tx.totalCashout || 0),
          });
        } else {
          transactionMap.set(key, {
            playerId: tx.playerId,
            date: tx.date,
            totalRecharge: tx.totalRecharge || 0,
            totalRedeem: tx.totalRedeem || 0,
            totalCashout: tx.totalCashout || 0,
          });
        }
      });
    };

    // Process active and archive transactions
    processTransactions(activeTransactions);
    processTransactions(archiveTransactions);

    // Step 5: Format Data
    if (transactionMap.size === 0) {
      return { status: "success", data: [] };
    }

    const formattedData = {};
    transactionMap.forEach((tx) => {
      if (!formattedData[tx.playerId]) {
        formattedData[tx.playerId] = {
          transactions: {},
        };
      }
      formattedData[tx.playerId].transactions[tx.date] = {
        totalRecharge: tx.totalRecharge,
        totalRedeem: tx.totalRedeem,
        totalCashout: tx.totalCashout,
      };
    });

    return { status: "success", data: Object.values(formattedData) };
  } catch (error) {
    console.error("Error fetching transactions:", error.message);
    return { status: "error", code: 500, message: error.message };
  }
};

export const isRechargeEnabledForAgent = async (agentId) => {
  try {
    // Check global recharge setting
    const globalSettingQuery = new Parse.Query("Settings");
    globalSettingQuery.equalTo("type", "rechargeEnabled");
    const globalSetting = await globalSettingQuery.first({ useMasterKey: true });
    const isGlobalEnabled = globalSetting?.get("settings")?.[0] === "true";

    if (isGlobalEnabled) return true;

    // Step 1: Fetch agent user
    const agentQuery = new Parse.Query(Parse.User);
    agentQuery.equalTo("objectId", agentId);
    const agent = await agentQuery.first({ useMasterKey: true });

    if (!agent) {
      console.warn("Agent not found.");
      return false;
    }

    const parentId = agent.get("userParentId");

    // Step 2: Fetch allowed recharge IDs
    const settingsQuery = new Parse.Query("Settings");
    settingsQuery.equalTo("type", "allowedMasterAgentsForRecharge");
    const setting = await settingsQuery.first({ useMasterKey: true });
    const allowedIds = setting?.get("settings") || [];

    if (allowedIds.includes(agentId)) {
      return true;
    }

    if (!parentId) return false;

    // Step 3: Fetch parent user
    const parentQuery = new Parse.Query(Parse.User);
    parentQuery.equalTo("objectId", parentId);
    const parentUser = await parentQuery.first({ useMasterKey: true });

    if (!parentUser) return false;

    return allowedIds.includes(parentUser.id);
  } catch (err) {
    console.error("Error checking recharge status:", err);
    return false;
  }
};


export const isCashoutEnabledForAgent = async (agentId) => {
  try {
    // Check global cashout setting
    const globalSettingQuery = new Parse.Query("Settings");
    globalSettingQuery.equalTo("type", "cashoutEnabled");
    const globalSetting = await globalSettingQuery.first({ useMasterKey: true });
    const isGlobalEnabled = globalSetting?.get("settings")?.[0] === "true";

    if (isGlobalEnabled) return true;

    const agentQuery = new Parse.Query(Parse.User);
    agentQuery.equalTo("objectId", agentId);
    const agent = await agentQuery.first({ useMasterKey: true });

    if (!agent) {
      console.warn("Agent not found.");
      return false;
    }

    const parentId = agent.get("userParentId");

    const settingsQuery = new Parse.Query("Settings");
    settingsQuery.equalTo("type", "allowedMasterAgentsForCashout");
    const setting = await settingsQuery.first({ useMasterKey: true });
    const allowedCashoutIds = setting?.get("settings") || [];

    if (allowedCashoutIds.includes(agentId)) {
      return true;
    }

    if (!parentId) return false;

    const parentQuery = new Parse.Query(Parse.User);
    parentQuery.equalTo("objectId", parentId);
    const parentUser = await parentQuery.first({ useMasterKey: true });

    if (!parentUser) return false;

    return allowedCashoutIds.includes(parentUser.id);
  } catch (error) {
    console.error("Error checking cashout enabled for agent:", error);
    return false;
  }
};

export const KYCReport = async (filter) => {
  try {
    const response = await dataProvider.getList("kycRecords", {
      pagination: { page: 1, perPage: 100000 },
      sort: { field: "createdAt", order: "DESC" },
      filter: filter,
    });
    const statusCounts = response.data.reduce((acc, record) => {
      const status = record.kycStatus;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    return { status: "success", data: statusCounts,total:response?.total };

  } catch (error) {
    console.error("Error fetching KYC report:", error.message);
    return { status: "error", code: 500, message: error.message };
  }
};

export async function getTotalRechargeAmount(userId) {
  const queryPipeline = [
    {
      $match: {
        userId: userId, // direct match instead of $in
        status: { $in: [2, 3] }, // successful recharge statuses
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$transactionAmount" },
      },
    },
  ];

  const results = await new Parse.Query("TransactionRecords")
    .aggregate(queryPipeline);

  return results[0]?.total || 0;
}


export async function isPayarcAllowed() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const pipeline = [
    {
      $match: {
        status: { $in: [2, 3] },
        portal: "Payarc",
        createdAt: { $gte: startOfMonth },
      },
    },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: "$transactionAmount" },
      },
    },
  ];

  const results = await new Parse.Query("TransactionRecords").aggregate(pipeline);
  const total = results[0]?.totalAmount || 0;

  return {
    allowed: total < 1000000,
    totalProcessed: total,
  };
}
