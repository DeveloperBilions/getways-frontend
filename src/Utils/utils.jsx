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
          userParentId: { $exists: true, $ne: null }, // Ensure valid userParentId
          status: { $in: [2, 3] },
          createdAt: { $gte: start, $lte: end },
          transactionAmount: { $gt: 0 } // Ensure valid transaction amounts
        } 
      },
      { 
        $group: {
          _id: "$userParentId", // Group by userParentId (agent)
          totalAmount: { $sum: "$transactionAmount" }
        }
      }
    ];

    const transactions = await new Parse.Query("TransactionRecords").aggregate(pipeline, { useMasterKey: true });

    if (transactions.length === 0) {
      return { status: "success", data: [] };
    }
    const agentIds = transactions.map(trx => trx.objectId).filter(id => id);
    console.log("Extracted agentIds:", agentIds);
    
    // Step 3: Fetch agent names from the User table using userParentId
    //const agentIds = transactions.map((trx) => trx.objectId); // _id contains userParentId
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
      agentName: agentMap[transaction.objectId] || "Unknown Agent", // Corrected key
      totalAmount: transaction.totalAmount
    }))
    .sort((a, b) => sortOrder === "asc" ? a.totalAmount - b.totalAmount : b.totalAmount - a.totalAmount);
    
    return { status: "success", data: sortedData };
  } catch (error) {
    console.error("Error fetching transactions:", error.message);
    return { status: "error", code: 500, message: error.message };
  }
};






