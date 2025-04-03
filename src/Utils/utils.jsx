import { Parse } from "parse";
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
  
      console.log(`Updated potBalance for user ${userId}: ${newPotBalance} (${type})`);
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

  console.log(finalResults, "Final Agent Recharge Data");
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
    start.setHours(0, 0, 0, 0); // Start of the day

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // End of the day

    // Step 2: Fetch transactions grouped by userParentId
    const pipeline = [
      { 
        $match: { 
          // userParentId: { $exists: true, $ne: null }, // Ensure valid userParentId
          status: { $in: [2, 3, 4, 8, 12] }, // Include recharge (2, 3), redeem (8), and cashout (12)
          transactionDate: { $gte: start, $lte: end },
          transactionAmount: { $gt: 0 } // Ensure valid transaction amounts
        } 
      },
      { 
        $group: {
          _id: "$userParentId", // Group by userParentId (agent)
          totalRecharge: { 
            $sum: { $cond: [{ $in: ["$status", [2, 3]] }, "$transactionAmount", 0] }
          }, // Sum only recharge transactions
          totalRedeem: { 
            $sum: { $cond: [{ $in: ["$status", [4,8]] }, "$transactionAmount", 0] }
          }, // Sum only redeem transactions
          totalCashout: { 
            $sum: { $cond: [{ $eq: ["$status", 12] }, "$transactionAmount", 0] }
          } // Sum only cashout transactions
        }
      }
    ];

    const activeTransactions = await new Parse.Query("TransactionRecords").aggregate(pipeline, { useMasterKey: true });
    const archiveTransactions = await new Parse.Query("Transactionrecords_archive").aggregate(pipeline, { useMasterKey: true });
    const transactions = [...activeTransactions, ...archiveTransactions];

    if (transactions.length === 0) {
      return { status: "success", data: [] };
    }

    const agentIds = transactions.map(trx => trx.objectId).filter(id => id);
    console.log("Extracted agentIds:", agentIds);

    // Step 3: Fetch agent names from the User table using userParentId
    const agentQuery = new Parse.Query(Parse.User);
    agentQuery.containedIn("objectId", agentIds);
    agentQuery.select("objectId", "username"); // Fetch only required fields
    agentQuery.limit(10000);

    const agents = await agentQuery.find({ useMasterKey: true });

    // Step 4: Map userParentId (_id) -> username
    const agentMap = {};
    agents.forEach((agent) => {
      agentMap[agent.id] = agent.get("username") || "Unknown Agent";
    });

    // Step 5: Map transactions to agents correctly
    const sortedData = transactions.map((transaction) => ({
      agentName: agentMap[transaction.objectId] || "Unknown Agent", // Correct agent mapping
      totalRecharge: Math.floor(transaction.totalRecharge || 0),
      totalRedeem: Math.floor(transaction.totalRedeem || 0),
      totalCashout: Math.floor(transaction.totalCashout || 0),
    }))    
    .sort((a, b) => sortOrder === "asc" ? a.totalRecharge - b.totalRecharge : b.totalRecharge - a.totalRecharge);
    
    return { status: "success", data: sortedData };
  } catch (error) {
    console.error("Error fetching transactions:", error.message);
    return { status: "error", code: 500, message: error.message };
  }
};

export const fetchTransactionComparison = async ({ sortOrder = "desc", selectedDates, type = "date" }) => {
  try {
    let dateFormat = "%Y-%m-%d";
    if (type === "month") {
      dateFormat = "%Y-%m";
    } else if (type === "year") {
      dateFormat = "%Y";
    }
    const pipeline = [
      {
        $match: {
          // userParentId: { $exists: true, $ne: null },
          status: { $in: [2, 3, 4, 8, 12] },
          transactionAmount: { $gt: 0 },
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
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone // Add local timezone
              }
            },
          },
          totalRecharge: {
            $sum: { $cond: [{ $in: ["$status", [2, 3]] }, "$transactionAmount", 0] },
          },
          totalRedeem: {
            $sum: { $cond: [{ $in: ["$status", [4,8]] }, "$transactionAmount", 0] },
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
        $sort: { "_id.date": sortOrder === "asc" ? 1 : -1 },
      },
    ];
    const activeTransactions = await new Parse.Query("TransactionRecords").aggregate(pipeline, { useMasterKey: true });
    const archiveTransactions = await new Parse.Query("Transactionrecords_archive").aggregate(pipeline, { useMasterKey: true });
    const transactions = [...activeTransactions, ...archiveTransactions];
    if (transactions.length === 0) {
      return { status: "success", data: [] };
    }
    console.log("Fetched Transactions:", transactions);

    const agentIds = [...new Set(transactions.map((trx) => trx.objectId.agent))];
    const agentQuery = new Parse.Query(Parse.User);
    agentQuery.containedIn("objectId", agentIds);
    agentQuery.select("objectId", "username");
    agentQuery.limit(10000);

    const agents = await agentQuery.find({ useMasterKey: true });

    const agentMap = {};
    agents.forEach((agent) => {
      agentMap[agent.id] = agent.get("username") || "Unknown Agent";
    });

    const formattedData = {};
    transactions.forEach((transaction) => {
      const agentId = transaction.objectId.agent;
      const dateKey = transaction.objectId.date;

      if (!formattedData[agentId]) {
        formattedData[agentId] = {
          agentName: agentMap[agentId] || "Unknown Agent",
          transactions: {},
        };
      }

      formattedData[agentId].transactions[dateKey] = {
        totalRecharge: Math.floor(transaction.totalRecharge || 0),
        totalRedeem: Math.floor(transaction.totalRedeem || 0),
        totalCashout: Math.floor(transaction.totalCashout || 0),
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
          // username: { $exists: true, $ne: null }, // Ensure valid username
          status: { $in: [2, 3, 4, 8, 12] }, // Include recharge (2, 3), redeem (8), and cashout (12)
          transactionDate: { $gte: start, $lte: end },
          transactionAmount: { $gt: 0 } // Ensure valid transaction amounts
        } 
      },
      { 
        $group: {
          _id: "$username", // Group by username (player)
          totalRecharge: { 
            $sum: { $cond: [{ $in: ["$status", [2, 3]] }, "$transactionAmount", 0] }
          }, // Sum only recharge transactions
          totalRedeem: { 
            $sum: { $cond: [{ $in: ["$status", [4,8]] }, "$transactionAmount", 0] }
          }, // Sum only redeem transactions
          totalCashout: { 
            $sum: { $cond: [{ $eq: ["$status", 12] }, "$transactionAmount", 0] }
          } // Sum only cashout transactions
        }
      }
    ];
    if (userParentId) {
      pipeline[0].$match.userParentId = { $exists: true, $ne: null, $eq: userParentId }; // Filter by userParentId
    }

    const activeTransactions = await new Parse.Query("TransactionRecords").aggregate(pipeline, { useMasterKey: true });
    const archiveTransactions = await new Parse.Query("Transactionrecords_archive").aggregate(pipeline, { useMasterKey: true });
    const transactions = [...activeTransactions, ...archiveTransactions];

    if (transactions.length === 0) {
      return { status: "success", data: [] };
    }

    // Step 3: Sort transactions based on total amounts
    const sortedTransactions = transactions.map(transaction => ({
      username: transaction.objectId,
      totalRecharge: Math.floor(transaction.totalRecharge || 0),
      totalRedeem: Math.floor(transaction.totalRedeem || 0),
      totalCashout: Math.floor(transaction.totalCashout || 0)
    })).sort((a, b) => b.totalRecharge - a.totalRecharge); // Sort by total amount in descending order

    return { status: "success", data: sortedTransactions };
    
    // return { status: "success", data: transactions };
  } catch (error) {
    console.error("Error fetching transactions:", error.message);
    return { status: "error", code: 500, message: error.message };
  }
}
export const fetchTransactionsofAgentByDate = async ({
  sortOrder = "desc",
  startDate,
  endDate,
  agentId, // Added agentId as a parameter
} = {}) => {
  try {
    // Step 1: Set start and end date with correct hours
    const start = new Date(startDate);
    start.setUTCHours(0, 0, 0, 0); // Start of the day

    const end = new Date(endDate);
    end.setUTCHours(23, 59, 59, 999); // End of the day

    // Step 2: Fetch transactions grouped by userParentId
    const matchConditions = {
      // userParentId: { $exists: true, $ne: null }, // Ensure valid userParentId
      status: { $in: [2, 3, 4, 8, 12] }, // Include recharge (2, 3), redeem (8), and cashout (12)
      transactionDate: { $gte: start, $lte: end },
      transactionAmount: { $gt: 0 } // Ensure valid transaction amounts
    };

    if (agentId) {
      matchConditions.userParentId = agentId; // Filter for specific agent
    }

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
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone // Add local timezone
              } 
            }
          },
          totalRecharge: { 
            $sum: { $cond: [{ $in: ["$status", [2, 3]] }, "$transactionAmount", 0] }
          }, // Sum only recharge transactions
          totalRedeem: { 
            $sum: { $cond: [{ $in: ["$status", [4,8]] }, "$transactionAmount", 0] }
          }, // Sum only redeem transactions
          totalCashout: { 
            $sum: { $cond: [{ $eq: ["$status", 12] }, "$transactionAmount", 0] }
          } // Sum only cashout transactions
        }
      }
    ];

    const activeTransactions = await new Parse.Query("TransactionRecords").aggregate(pipeline, { useMasterKey: true });
    const archiveTransactions = await new Parse.Query("Transactionrecords_archive").aggregate(pipeline, { useMasterKey: true });
    const transactions = [...activeTransactions, ...archiveTransactions];

    if (transactions.length === 0) {
      return { status: "success", data: [] };
    }

    let agentIds = [...new Set(transactions.map(trx => trx.objectId.agent))];

    // Step 3: Fetch agent names (only if agentId is not provided, otherwise we already know it)
    const agentMap = {};
    if (!agentId) {
      const agentQuery = new Parse.Query(Parse.User);
      agentQuery.containedIn("objectId", agentIds);
      agentQuery.select("objectId", "username"); // Fetch only required fields
      agentQuery.limit(10000);

      const agents = await agentQuery.find({ useMasterKey: true });

      agents.forEach((agent) => {
        agentMap[agent.id] = agent.get("username") || "Unknown Agent";
      });
    } else {
      // Fetch the name of the specific agent
      const agentQuery = new Parse.Query(Parse.User);
      agentQuery.equalTo("objectId", agentId);
      agentQuery.select("username");

      const agent = await agentQuery.first({ useMasterKey: true });
      agentMap[agentId] = agent ? agent.get("username") : "Unknown Agent";
    }

    // Step 4: Format Data
    const formattedData = {};
    transactions.forEach(transaction => {
      const agentId = transaction.objectId.agent;
      const dateKey = transaction.objectId.date;

      if (!formattedData[agentId]) {
        formattedData[agentId] = {
          agentName: agentMap[agentId] || "Unknown Agent",
          transactions: {}
        };
      }

      formattedData[agentId].transactions[dateKey] = {
        totalRecharge: Math.floor(transaction.totalRecharge || 0),
        totalRedeem: Math.floor(transaction.totalRedeem || 0),
        totalCashout: Math.floor(transaction.totalCashout || 0)
      };
    });
    return { status: "success", data: Object.values(formattedData) };

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
      (activeRechargeLimit === "monthly" && totalRecharged + newTransactionAmount >= monthlyLimit) ||
      (activeRechargeLimit === "daily" && totalRecharged + newTransactionAmount >= dailyLimit)
    ) {
      return {
        success: false,
        message: `You have reached the ${activeRechargeLimit} maximum limit. Please try again later.`,
      };
    }

    return { success: true, message: "Transaction within allowed recharge limit." };
  } catch (error) {
    console.error("Error in checkActiveRechargeLimit:", error.message);
    return { success: false, message: error.message || "An error occurred while checking limits." };
  }
};

export const fetchPlayerTransactionComparison = async ({ sortOrder = "desc", selectedDates, type = "date",playerId }) => {
  try {
    let dateFormat = "%Y-%m-%d";
    if (type === "month") {
      dateFormat = "%Y-%m";
    } else if (type === "year") {
      dateFormat = "%Y";
    }
    const pipeline = [
      {
        $match: {
          // username: { $exists: true, $ne: null }, // Ensure valid username
          status: { $in: [2, 3, 4, 8, 12] },
          transactionAmount: { $gt: 0 },
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
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
              }
            },
          },
          totalRecharge: {
            $sum: { $cond: [{ $in: ["$status", [2, 3]] }, "$transactionAmount", 0] },
          },
          totalRedeem: {
            $sum: { $cond: [{ $in: ["$status", [4,8]] }, "$transactionAmount", 0] },
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
        $sort: { "_id.date": sortOrder === "asc" ? 1 : -1 },
      },
    ];

    if (playerId) {
      pipeline[0].$match.userId = { $exists: true, $ne: null, $eq: playerId } // Ensure valid userId
    }

    const activeTransactions = await new Parse.Query("TransactionRecords").aggregate(pipeline, { useMasterKey: true });
    const archiveTransactions = await new Parse.Query("Transactionrecords_archive").aggregate(pipeline, { useMasterKey: true });
    const transactions = [...activeTransactions, ...archiveTransactions];
    if (transactions.length === 0) {
      return { status: "success", data: [] };
    }

    const formattedData = {};
    transactions.forEach((transaction) => {
      const username = transaction.objectId.username;
      const dateKey = transaction.objectId.date;

      if (!formattedData[username]) {
        formattedData[username] = {
          username,
          transactions: {},
        };
      }

      formattedData[username].transactions[dateKey] = {
        totalRecharge: Math.floor(transaction.totalRecharge || 0),
        totalRedeem: Math.floor(transaction.totalRedeem || 0),
        totalCashout: Math.floor(transaction.totalCashout || 0),
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
    start.setUTCHours(0, 0, 0, 0); // Start of the day

    const end = new Date(endDate);
    end.setUTCHours(23, 59, 59, 999); // End of the day

    // Step 2: Fetch transactions grouped by playerId and date
    const matchConditions = {
      // userId: { $exists: true, $ne: null }, // Ensure valid userId
      status: { $in: [2, 3, 4, 8, 12] }, // Include recharge (2, 3), redeem (8), and cashout (12)
      transactionDate: { $gte: start, $lte: end },
      transactionAmount: { $gt: 0 } // Ensure valid transaction amounts
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
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
              } 
            } 
          },
          totalRecharge: { 
            $sum: { $cond: [{ $in: ["$status", [2, 3]] }, "$transactionAmount", 0] }
          }, // Sum only recharge transactions
          totalRedeem: { 
            $sum: { $cond: [{ $in: ["$status", [4,8]] }, "$transactionAmount", 0] }
          }, // Sum only redeem transactions
          totalCashout: { 
            $sum: { $cond: [{ $eq: ["$status", 12] }, "$transactionAmount", 0] }
          } // Sum only cashout transactions
        }
      }
    ];

    const activeTransactions = await new Parse.Query("TransactionRecords").aggregate(pipeline, { useMasterKey: true });
    const archiveTransactions = await new Parse.Query("Transactionrecords_archive").aggregate(pipeline, { useMasterKey: true });
    const transactions = [...activeTransactions, ...archiveTransactions];

    if (transactions.length === 0) {
      return { status: "success", data: [] };
    }

    // Step 3: Format Data 
    const formattedData = {};
    transactions.forEach(transaction => {
      const playerId = transaction.objectId.player;
      const dateKey = transaction.objectId.date;

      if (!formattedData[playerId]) {
        formattedData[playerId] = {
          transactions: {}
        };
      }

      formattedData[playerId].transactions[dateKey] = {
        totalRecharge: Math.floor(transaction.totalRecharge || 0),
        totalRedeem: Math.floor(transaction.totalRedeem || 0),
        totalCashout: Math.floor(transaction.totalCashout || 0)
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
    // Step 1: Fetch the agent user
    const agent = await new Parse.Query(Parse.User).get(agentId, { useMasterKey: true });

    // Step 2: Get the parent (Master-Agent)
    const masterAgent = agent.get("userParentId");

    if (!masterAgent || !masterAgent.id) {
      console.warn("No Master-Agent linked to this agent.");
      return false;
    }

    // Step 3: Get allowed recharge Master-Agent IDs from settings
    const settingsQuery = new Parse.Query("Settings");
    settingsQuery.equalTo("type", "allowedMasterAgentsForRecharge");
    const setting = await settingsQuery.first({ useMasterKey: true });

    const allowedIds = setting?.get("settings") || [];

    return allowedIds.includes(masterAgent.id);
  } catch (err) {
    console.error("Error checking recharge status:", err);
    return false;
  }
};
export const isCashoutEnabledForAgent = async (agentId) => {
  try {
    const agent = await new Parse.Query(Parse.User).get(agentId, { useMasterKey: true });
    const masterAgent = agent.get("userParentId");

    if (!masterAgent || !masterAgent.id) return false;

    const settingsQuery = new Parse.Query("Settings");
    settingsQuery.equalTo("type", "allowedMasterAgentsForCashout");
    const setting = await settingsQuery.first({ useMasterKey: true });

    const allowedCashoutIds = setting?.get("settings") || [];

    return allowedCashoutIds.includes(masterAgent.id);
  } catch (error) {
    console.error("Error checking cashout enabled for agent:", error);
    return false;
  }
};