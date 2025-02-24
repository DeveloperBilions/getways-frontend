import { Parse } from "parse";
import { calculateDataSummaries ,calculateDataSummariesForSummary } from "../utils";
import Stripe from "stripe";

const stripe = new Stripe(process.env.REACT_APP_STRIPE_KEY_PRIVATE); // Replace with your Stripe secret key

Parse.initialize(
  process.env.REACT_APP_APPID,
  process.env.REACT_APP_JAVASCRIPT_KEY,
  process.env.REACT_APP_MASTER_KEY
);
Parse.serverURL = process.env.REACT_APP_URL;
Parse.masterKey = process.env.REACT_APP_MASTER_KEY;

export const dataProvider = {
  create: async (resource, params) => {
    // console.log("CREATE CALLED");
    try {
      if (resource === "users") {
        const data = (({
          username,
          name,
          email,
          password,
          balance,
          signedUp,
          userParentId,
          userParentName,
          roleName,
          userReferralCode,
        }) => ({
          username,
          name,
          email,
          password,
          balance,
          signedUp,
          userParentId,
          userParentName,
          roleName,
          userReferralCode,
        }))(params.data);
        const user = new Parse.User();
        const result = await user.signUp(data);

        // Query the Role class to find the desired role
        const query = new Parse.Query(Parse.Role);
        query.equalTo("name", data.roleName);
        const role = await query.first({ useMasterKey: true });

        if (!role) {
          throw new Parse.Error(404, "Role not found");
        }

        // Add the user to the role
        const relation = role.relation("users");
        relation.add(user);
        await role.save(null, { useMasterKey: true });

        return { data: { id: result.id, ...result.attributes } };
      } else {
        const Resource = Parse.Object.extend(resource);
        const query = new Resource();
        const result = await query.save(params.data);

        return { data: { id: result.id, ...result.attributes } };
      }
    } catch (error) {
      // console.log(params);
      throw error;
    }
  },
  getOne: async (resource, params) => {
    //works
    var query = null;
    var result = null;
    try {
      if (resource === "users") {
        query = new Parse.Query(Parse.User);
        result = await query.get(params.id, { useMasterKey: true });
      } else {
        const Resource = Parse.Object.extend(resource);
        query = new Parse.Query(Resource);
        result = await query.get(params.id);
      }
      return { data: { id: result.id, ...result.attributes } };
    } catch (error) {
      return error;
    }
  },
  getList: async (resource, params) => {
    //works
    // console.log("GETLIST");
    // console.log("*****", params);
    const { page, perPage } = params.pagination;
    const { field, order } = params.sort;
    var filter = params.filter;
    var q = filter.q;
    delete filter.q;
    // console.log("==== =", filter);
    var query = new Parse.Query(Parse.Object);
    var count = null;

    Parse.masterKey = Parse.masterKey || process.env.REACT_APP_MASTER_KEY;
    const role = localStorage.getItem("role");
    const userid = localStorage.getItem("id");
    const username = localStorage.getItem("username");
    const fetchUsers = async (selectedUser, isMaster) => {
      const user = selectedUser ? selectedUser : await Parse.User.current();

      const usrQuery = new Parse.Query(Parse.User);
      usrQuery.equalTo("userParentId", user.id);
      usrQuery.limit(10000);
      usrQuery.select(
        "objectId",
        "userParentId",
        "userParentName",
        "roleName",
        "userType",
        "name",
        "username",
        "userReferralCode",
        "email",
        "isPasswordPermission"
      );
      var results = await usrQuery.find({ useMasterKey: true });
      if (isMaster) {
        const agentIds = results
          .filter((user) => user.get("roleName") === "Agent") // Only Agents
          .map((agent) => agent.id); // Get their IDs

        if (agentIds.length > 0) {
          const playersQuery = new Parse.Query(Parse.User);
          playersQuery.containedIn("userParentId", agentIds);
          playersQuery.limit(10000);
          playersQuery.select(
            "objectId",
            "userParentId",
            "userParentName",
            "roleName",
            "userType",
            "name",
            "username",
            "userReferralCode",
            "email",
            "isPasswordPermission"
          );

          const players = await playersQuery.find({ useMasterKey: true });
          results = results.concat(players); // Add players to the results
        }
      }

      results.push(user);
      // console.log(results);
      var ids = results.map((r) => r.id);
      ids.push(user.id);
      const data = results.map((o) => ({ id: o.id, ...o.attributes }));

      return { ids: ids, data: data };
    };
    const referenceDate = new Date("2025-01-17"); // Reference date (17th Jan)

    try {
      if (resource === "users") {
        query = new Parse.Query(Parse.User);
        query.notEqualTo("isDeleted", true);

        if (role === "Agent") {
          query.equalTo("userParentId", userid);
        } else if (role === "Master-Agent") {
          // Step 1: Find all agents under the Master-Agent
          const agentQuery = new Parse.Query(Parse.User);
          agentQuery.equalTo("userParentId", userid);
          // agentQuery.notEqualTo("isDeleted", true);
          agentQuery.equalTo("roleName", "Agent");

          const agents = await agentQuery.find({ useMasterKey: true });
          const agentIds = agents.map((agent) => agent.id);
          // Step 2: Find all users (agents + players under those agents)
          query.containedIn("userParentId", [userid, ...agentIds]);
        }
        if (
          filter &&
          typeof filter === "object" &&
          Object.keys(filter).length > 0
        ) {
          Object.keys(filter).forEach((f) => {
            if (filter[f] !== undefined && filter[f] !== null) {
              if (f === "username") {
                const searchValue = String(filter[f]);
                const searchRegex = new RegExp(searchValue, "i");

                const emailQuery = new Parse.Query(Parse.User);
                emailQuery.matches("email", searchRegex);

                const usernameQuery = new Parse.Query(Parse.User);
                usernameQuery.matches("username", searchRegex);

                const userParentNameQuery = new Parse.Query(Parse.User);
                userParentNameQuery.matches("userParentName", searchRegex);

                // Combine both username and email query results
                const combinedQuery = Parse.Query.or(
                  emailQuery,
                  usernameQuery,
                  userParentNameQuery
                );
                query = combinedQuery;
              } else if (f === "role") {
                const role = filter[f];
                if (
                  role &&
                  (role === "Player" ||
                    role === "Agent" ||
                    role === "Super-User")
                ) {
                  console.log(role);
                  query.equalTo("roleName", role);
                }
              } else {
                query.equalTo(f, filter[f]);
              }
            }
          });
        }
        count = await query.count({ useMasterKey: true });
      }else if (resource === "redeemRecords") {
        const Resource = Parse.Object.extend("TransactionRecords");
        query = new Parse.Query(Resource);
        filter = { type: "redeem", ...filter };
        if (role === "Player") {
          filter = { userId: userid, ...filter };
          filter &&
            Object.keys(filter).map((f) => {
              if (f === "username") query.matches(f, filter[f], "i");
              else query.equalTo(f, filter[f]);
            });
        } else if (role === "Agent") {
          filter &&
            Object.keys(filter).map((f) => {
              if (f === "username") query.matches(f, filter[f], "i");
              else query.equalTo(f, filter[f]);
            });
          var { ids } = await fetchUsers();
          query.containedIn("userId", ids);
          query.notEqualTo("isCashOut", true);
        } else if (role === "Master-Agent") {
          filter &&
            Object.keys(filter).map((f) => {
              if (f === "username") query.matches(f, filter[f], "i");
              else query.equalTo(f, filter[f]);
            });
          var { ids } = await fetchUsers(null, true);
          query.containedIn("userId", ids);
          query.notEqualTo("isCashOut", true);
        }
        if (
          filter &&
          typeof filter === "object" &&
          Object.keys(filter).length > 0
        ) {
          Object.keys(filter).forEach((f) => {
            if (filter[f] !== undefined && filter[f] !== null) {
              if (f === "username") {
                const searchValue = String(filter[f]);
                const searchRegex = new RegExp(searchValue, "i");

                const usernameQuery = new Parse.Query("TransactionRecords");
                usernameQuery.matches("username", searchRegex);

                const transactionAmountQuery = new Parse.Query(
                  "TransactionRecords"
                );
                transactionAmountQuery.matches(
                  "transactionAmount",
                  searchRegex
                );

                const remarkQuery = new Parse.Query("TransactionRecords");
                remarkQuery.matches("remark", searchRegex);

                // Combine both username and email query results
                const combinedQuery = Parse.Query.or(
                  transactionAmountQuery,
                  usernameQuery,
                  remarkQuery
                );
                query = combinedQuery;
              } else {
                query.equalTo(f, filter[f]);
              }
            }
          });
        }
        count = await query.count();
      } else if (resource === "rechargeRecords") {
        const Resource = Parse.Object.extend("TransactionRecords");
        query = new Parse.Query(Resource);
        filter = { type: "recharge", ...filter};
        if (role === "Player") {
          filter = { userId: userid, ...filter };
          filter &&
            Object.keys(filter).map((f) => {
              if (f === "username") query.matches(f, filter[f], "i");
              else query.equalTo(f, filter[f]);
            });
        } else if (role === "Agent") {
          filter &&
            Object.keys(filter).map((f) => {
              if (f === "username") query.matches(f, filter[f], "i");
              else query.equalTo(f, filter[f]);
            });
          var { ids } = await fetchUsers();
          query.containedIn("userId", ids);
        } else if (role === "Master-Agent") {
          filter &&
            Object.keys(filter).map((f) => {
              if (f === "username") query.matches(f, filter[f], "i");
              else query.equalTo(f, filter[f]);
            });
          var { ids } = await fetchUsers(null, true);

          query.containedIn("userId", ids);
        }

        if (
          filter &&
          typeof filter === "object" &&
          Object.keys(filter).length > 0
        ) {
          Object.keys(filter).forEach((f) => {
            if (filter[f] !== undefined && filter[f] !== null) {
              if (f === "username") {
                const searchValue = String(filter[f]);
                const searchRegex = new RegExp(searchValue, "i");

                const usernameQuery = new Parse.Query("TransactionRecords");
                usernameQuery.matches("username", searchRegex);

                const transactionAmountQuery = new Parse.Query(
                  "TransactionRecords"
                );
                transactionAmountQuery.matches(
                  "transactionAmount",
                  searchRegex
                );

                const remarkQuery = new Parse.Query("TransactionRecords");
                remarkQuery.matches("remark", searchRegex);

                // Combine both username and email query results
                const combinedQuery = Parse.Query.or(
                  transactionAmountQuery,
                  usernameQuery,
                  remarkQuery
                );
                query = combinedQuery;
              } else {
                query.equalTo(f, filter[f]);
              }
            }
          });
        }
      } else if (resource === "summary") {
        var result = null;
        if (
          filter?.startDate &&
          filter?.endDate &&
          new Date(`${filter.startdate}T00:00:00Z`) >
            new Date(`${filter.endDate}T00:00:00Z`)
        ) {
          throw new Error("Start date cannot be greater than end date");
        }

        const queryPipeline = [
          {
            $match: {
              ...((filter?.startDate || filter?.endDate) && {
                createdAt: {
                  $gte: new Date(`${filter.startDate}T00:00:00Z`),
                  $lte: new Date(`${filter.endDate}T23:59:59Z`),
                },
              }),
            },
          },
          {
            $facet: {
              totalRechargeAmount: [
                { $match: { status: { $in: [2, 3] } } },
                {
                  $group: {
                    _id: null,
                    total: { $sum: "$transactionAmount" },
                  },
                },
              ],
              totalRedeemAmount: [
                {
                  $match: {
                    type: "redeem",
                    status: { $in: [4, 8] },
                    transactionAmount: { $gt: 0, $type: "number" } // Ensure positive finite numbers
                  } 
                },
                {
                  $group: {
                    _id: null,
                    total: { $sum: "$transactionAmount" },
                  },
                },
              ],
              totalPendingRechargeAmount: [
                { $match: { status: 1 } },
                {
                  $group: {
                    _id: null,
                    total: { $sum: "$transactionAmount" },
                  },
                },
              ],
              totalCashoutRedeemsSuccess: [
                { $match: { status: 12 } },
                {
                  $group: {
                    _id: null,
                    total: { $sum: "$transactionAmount" },
                  },
                },
              ],
              totalCashoutRedeemsInProgress: [
                { $match: { status: 11 ,                    transactionAmount: { $gt: 0, $type: "number" } // Ensure positive finite numbers
              } },
                {
                  $group: {
                    _id: null,
                    total: { $sum: "$transactionAmount" },
                  },
                },
              ],
              totalRecords: [{ $count: "total" }],
              totalAmt: [
                {
                  $group: {
                    _id: null,
                    total: { $sum: { $ifNull: ["$transactionAmount", 0] } },
                  },
                },
              ]
              ,
              totalFeesCharged: [
                {
                  $match: {
                    type: "redeem",
                    status: { $in: [4, 8] },
                    transactionAmount: { $gt: 0, $type: "number" }, // Ensure positive finite numbers
                    redeemServiceFee: { $gt: 0, $type: "number" }   // Ensure positive finite numbers
                  },
                },
                {
                  $project: {
                    calculatedFee: {
                      $floor: {
                        $multiply: [
                          { $divide: ["$redeemServiceFee", 100] },
                          "$transactionAmount",
                        ],
                      },
                    },
                  },
                },
                {
                  $group: { _id: null, total: { $sum: "$calculatedFee" } },
                },
              ]
              ,
              totalRedeemSuccessful: [
                { $match: { status: 8 } },
                { $count: "count" },
              ],

              totalRechargeByType: [
                { $match: { type: "recharge", status: { $in: [2, 3] } } },
                {
                  $group: {
                    _id: {
                      wallet: { $ifNull: ["$useWallet", false] },
                    },
                    totalAmount: {
                      $sum: { $ifNull: ["$transactionAmount", 0] },
                    },
                  },
                },
                {
                  $project: {
                    _id: 0,
                    wallet: {
                      $cond: [
                        { $eq: ["$_id.wallet", true] },
                        "wallet",
                        "others",
                      ],
                    },
                    totalAmount: 1,
                  },
                },
              ],

              totalRedeemByTypeData: [
                {
                  $match: {
                    type: "redeem",
                    status: { $in: [4, 8, 12] },
                  },
                },
                {
                  $project: {
                    transactionId: "$id",
                    amount: { $ifNull: ["$transactionAmount", 0] },
                    status: 1,
                    paymentType: {
                      $cond: [{ $eq: ["$status", 12] }, "cashout", "redeem"],
                    },
                    transactionIdFromStripe: 1,
                    transactionDate: 1,
                    redeemServiceFee: 1,
                  },
                },
              ],

              totalRechargeByTypeData: [
                {
                  $match: {
                    type: "recharge",
                    status: { $in: [2, 3] },
                  },
                },
                {
                  $project: {
                    transactionId: "$id",
                    amount: { $ifNull: ["$transactionAmount", 0] },
                    date: "$date",
                    status: 1,
                    paymentType: {
                      $cond: [
                        { $eq: ["$useWallet", true] },
                        "wallet",
                        "others",
                      ],
                    },
                    transactionIdFromStripe: 1,
                    transactionDate: 1,
                  },
                },
              ],
            },
          },
        ];
        if (role === "Super-User") {
          //users
          console.log("SU", filter);

          if (filter?.username) {
            var userQuery = new Parse.Query(Parse.User);
            var selectedUser = await userQuery.get(filter.username, {
              useMasterKey: true,
            });
            var { ids, data } = await fetchUsers(selectedUser,"yes");
            queryPipeline[0]["$match"]["userId"] = { $in: ids };
          } else {
            var userQuery = new Parse.Query(Parse.User);
            userQuery.limit(10000);
            var results = await userQuery.find({ useMasterKey: true });
            var data = results.map((o) => ({ id: o.id, ...o.attributes }));
            const currentUser = await Parse.User.current();
            data.push({ id: userid, ...currentUser.attributes });
          }
          // Fetch wallet balances for the users
          const walletQuery = new Parse.Query("Wallet");
          const userIds = data.map((user) => user.id);
          walletQuery.containedIn("userID", userIds);

          const walletResults = await walletQuery.find({ useMasterKey: true });
          const walletBalances = walletResults.reduce((acc, wallet) => {
            acc[wallet.get("userID")] = wallet.get("balance") || 0;
            return acc;
          }, {});
          result = calculateDataSummariesForSummary({
            id: 0,
            users: data,
            walletBalances,
          });
        }
        if (role === "Agent") {
          //users
          const selectedUser =
            filter && filter.username
              ? await new Parse.Query(Parse.User).get(filter.username, {
                  useMasterKey: true,
                })
              : null;
          const { ids, data } = await fetchUsers(selectedUser);
          queryPipeline[0]["$match"]["userId"] = { $in: ids };
          const walletBalances = 0;
          result = calculateDataSummariesForSummary({
            id: 1,
            users: data,
            walletBalances,
          });
        }
        if (role === "Master-Agent") {
          //users
          const selectedUser =
            filter && filter.username
              ? await new Parse.Query(Parse.User).get(filter.username, {
                  useMasterKey: true,
                })
              : null;
          const { ids, data } = await fetchUsers(selectedUser,true);
          queryPipeline[0]["$match"]["userId"] = { $in: ids };
          const walletBalances = 0;
          result = calculateDataSummariesForSummary({
            id: 1,
            users: data,
            walletBalances,
          });
        }

        const matchConditions = [];

        if (filter.startDate) {
          matchConditions.push({
            createdAt: {
              $gte: new Date(`${filter.startDate}T00:00:00Z`),
            },
          });
        }

        if (filter.endDate) {
          matchConditions.push({
            createdAt: { $lte: new Date(`${filter.endDate}T23:59:59Z`) },
          });
        }
        if (queryPipeline[0]["$match"]["userId"]) {
          matchConditions.push({
            userId: queryPipeline[0]["$match"]["userId"],
          });
        }
        const pppipeline = [
          {
            $match: matchConditions.length > 0 ? { $and: matchConditions } : {},
          },
          {
            $group: {
              _id: null, // No grouping key since we want the total sum for all records
              totalAmount: { $sum: "$transactionAmount" }, // Sum the transactionAmount
            },
          },
        ];

        if (matchConditions.length > 0) {
          queryPipeline[0]["$match"] = {
            $and: [
              ...matchConditions,
              { transactionAmount: { $gt: 0, $type: "number" } }, // Ensure positive number
            ],
          };
          pppipeline[0]["$match"] = {
            $and: [
              ...matchConditions,
              { transactionAmount: { $gt: 0, $type: "number" } }, // Ensure positive number
              {
                $or: [
                  {
                    transactionDate: { $lte: new Date("2025-01-17T00:00:00Z") },
                    status: 5,
                  },
                  {
                    transactionDate: { $gt: new Date("2025-01-17T00:00:00Z") },
                    status: 7,
                  },
                ],
              },
            ],
          };
        } else {
          pppipeline[0]["$match"] = {
            $and: [
              { transactionAmount: { $gt: 0, $type: "number" } }, // Ensure positive number
              {
                $or: [
                  {
                    transactionDate: { $lte: new Date("2025-01-17T00:00:00Z") },
                    status: 5,
                  },
                  {
                    transactionDate: { $gt: new Date("2025-01-17T00:00:00Z") },
                    status: 7,
                  },
                ],
              },
            ],
          };
        }

        const newResults = await new Parse.Query(
          "TransactionRecords"
        ).aggregate(queryPipeline, { useMasterKey: true });

        const Combinedresult = await new Parse.Query(
          "TransactionRecords"
        ).aggregate(pppipeline, { useMasterKey: true });

        const {
          totalRechargeAmount,
          totalRedeemAmount,
          totalPendingRechargeAmount,
          totalCashoutRedeemsSuccess,
          totalCashoutRedeemsInProgress,
          totalRecords,
          totalAmt,
          totalFeesCharged,
          totalRedeemSuccessful,
          totalRechargeByType,
          totalRedeemByTypeData,
          totalRechargeByTypeData,
        } = newResults[0];
        const newsummaray = {
          totalRechargeAmount: totalRechargeAmount[0]?.total || 0,
          totalRedeemAmount: totalRedeemAmount[0]?.total || 0,
          totalPendingRechargeAmount: totalPendingRechargeAmount[0]?.total || 0,
          totalCashoutRedeemsSuccess: totalCashoutRedeemsSuccess[0]?.total || 0,
          totalCashoutRedeemsInProgress:
            totalCashoutRedeemsInProgress[0]?.total || 0,
          totalRecords: totalRecords[0]?.total || 0,
          totalAmt: totalAmt[0]?.total || 0,
          totalFeesCharged: totalFeesCharged[0]?.total || 0,
          totalRedeemSuccessful: totalRedeemSuccessful[0]?.count || 0,
          totalRechargeByType: totalRechargeByType,
          totalRedeemByTypeData: totalRedeemByTypeData,
          totalRechargeByTypeData: totalRechargeByTypeData,
        };
        const walletTotalRecharge = newsummaray.totalRechargeByTypeData.filter(
          (o) => o.paymentType === "wallet"
        );
        const othersTotalRecharge = newsummaray.totalRechargeByTypeData.filter(
          (o) => o.paymentType === "others"
        );
        newsummaray.totalRechargeByTypeData = {
          wallet: walletTotalRecharge,
          others: othersTotalRecharge,
        };
        newsummaray.totalRechargeByType = {
          wallet:
            newsummaray.totalRechargeByType.find((o) => o.wallet === "wallet")
              ?.totalAmount || 0,
          others:
            newsummaray.totalRechargeByType.find((o) => o.wallet === "others")
              ?.totalAmount || 0,
        };

        const walletRedeem = newsummaray.totalRedeemByTypeData.filter(
          (o) => o.paymentType === "redeem"
        );
        const othersRedeem = newsummaray.totalRedeemByTypeData.filter(
          (o) => o.paymentType === "cashout"
        );
        newsummaray.totalRedeemByTypeData = {
          wallet: walletRedeem,
          others: othersRedeem,
        };

        result.data[0] = Object.assign(result.data[0], newsummaray);
        result.data[0]["totalFailRedeemAmount"] =
          Combinedresult[0]?.totalAmount || 0;
        console.log("result", result);
        return result;
      }else if (resource === "summaryExport") {
        var result = null;
        if (role === "Super-User") {
          //users
          console.log("SU", filter);

          if (filter?.username) {
            // console.log("IN IF");
            var userQuery = new Parse.Query(Parse.User);
            var selectedUser = await userQuery.get(filter.username, {
              useMasterKey: true,
            });
            var { ids, data } = await fetchUsers(selectedUser);

            const transactionQuery = new Parse.Query("TransactionRecords");
            transactionQuery.select(
              "userId",
              "status",
              "transactionAmount",
              "type",
              "useWallet",
              "redeemServiceFee",
              "isCashOut",
              "transactionIdFromStripe",
              "transactionDate"
            );
            transactionQuery.containedIn("userId", ids);

            filter.startdate &&
              transactionQuery.greaterThanOrEqualTo(
                "transactionDate",
                new Date(filter.startdate + "T00:00:00Z")
              );
            filter.enddate &&
              transactionQuery.lessThanOrEqualTo(
                "transactionDate",
                new Date(filter.enddate + "T23:59:59Z")
              );
            transactionQuery.limit(100000);
            var results = await transactionQuery.find();
          } else {
            var userQuery = new Parse.Query(Parse.User);
            userQuery.limit(10000);
            var results = await userQuery.find({ useMasterKey: true });
            var data = results.map((o) => ({ id: o.id, ...o.attributes }));
            const currentUser = await Parse.User.current();
            data.push({ id: userid, ...currentUser.attributes });

            //transaction
            const transactionQuery = new Parse.Query("TransactionRecords");
            transactionQuery.select(
              "userId",
              "status",
              "transactionAmount",
              "type",
              "useWallet",
              "redeemServiceFee",
              "isCashOut",
              "transactionIdFromStripe",
              "transactionDate"
            );
            filter.startdate &&
              transactionQuery.greaterThanOrEqualTo(
                "transactionDate",
                new Date(filter.startdate + "T00:00:00Z")
              );
            filter.enddate &&
              transactionQuery.lessThanOrEqualTo(
                "transactionDate",
                new Date(filter.enddate + "T23:59:59Z")
              );
            transactionQuery.limit(100000);
            var results = await transactionQuery.find();
            console.log(results, "results");
          }
          // Fetch wallet balances for the users
          const walletQuery = new Parse.Query("Wallet");
          const userIds = data.map((user) => user.id);
          walletQuery.containedIn("userID", userIds);

          const walletResults = await walletQuery.find({ useMasterKey: true });
          const walletBalances = walletResults.reduce((acc, wallet) => {
            acc[wallet.get("userID")] = wallet.get("balance") || 0;
            return acc;
          }, {});
          console.log(
            filter,
            "filteration",
            new Date(
              Date.UTC(
                new Date(filter.startdate + "T00:00:00Z").getUTCFullYear(),
                new Date(filter.startdate + "T00:00:00Z").getUTCMonth(),
                new Date(filter.startdate + "T00:00:00Z").getUTCDate()
              )
            ),
            new Date(
              Date.UTC(
                new Date(filter.enddate + "T23:59:59Z").getUTCFullYear(),
                new Date(filter.enddate + "T23:59:59Z").getUTCMonth(),
                new Date(filter.enddate + "T23:59:59Z").getUTCDate()
              )
            )
          );

          result = calculateDataSummaries({
            id: 0,
            users: data,
            transactions: results.map((o) => ({ id: o.id, ...o.attributes })),
            walletBalances,
          });
          /*result = {
            data: [
              {
                id: 0,
                users: data,
                transactions: results.map((o) => ({
                  id: o.id,
                  ...o.attributes,
                })),
              },
            ],
            total: null,
          };
          console.log(
            "count ",
            result.data[0].users.length,
            result.data[0].transactions.length
          );*/
        }
        if (role === "Agent") {
          console.log("Agent");
          //users
          const selectedUser =
            filter && filter.username
              ? await new Parse.Query(Parse.User).get(filter.username, {
                  useMasterKey: true,
                })
              : null;
          // console.log("selected user:", selectedUser);
          const { ids, data } = await fetchUsers(selectedUser);
          // const filteredData = filter?data.filter(obj => obj.id===filter.username):data;
          // console.log("fetchUsers", data);
          //transactions
          const transactionQuery = new Parse.Query("TransactionRecords");
          transactionQuery.select(
            "userId",
            "status",
            "transactionAmount",
            "type",
            "useWallet",
            "redeemServiceFee",
            "isCashOut"
          );
          transactionQuery.containedIn("userId", ids);
          filter.startdate &&
            transactionQuery.greaterThanOrEqualTo(
              "transactionDate",
              new Date(filter.startdate + " 00:00:00")
            );
          filter.enddate &&
            transactionQuery.lessThanOrEqualTo(
              "transactionDate",
              new Date(filter.enddate + " 23:59:59")
            );
          /*filter && Object.keys(filter).map((f) => {
              if(f === "username") transactionQuery.equalTo("objectId", filter[f], "i"); 
              else transactionQuery.equalTo(f, filter[f]);
          });*/
          transactionQuery.limit(100000);
          results = await transactionQuery.find();
          const walletBalances = 0;
          result = calculateDataSummaries({
            id: 1,
            users: data,
            transactions: results.map((o) => ({ id: o.id, ...o.attributes })),
            walletBalances,
          });

          /*result = {
            data: [
              {
                id: 0,
                users: data,
                transactions: results.map((o) => ({
                  id: o.id,
                  ...o.attributes,
                })),
              },
            ],
            total: null,
          }; */
          // console.log("Summary List ", result);
        }
        if (role === "Master-Agent") {
          console.log("Agent");
          //users
          const selectedUser =
            filter && filter.username
              ? await new Parse.Query(Parse.User).get(filter.username, {
                  useMasterKey: true,
                })
              : null;
          // console.log("selected user:", selectedUser);
          const { ids, data } = await fetchUsers(selectedUser, true);
          // const filteredData = filter?data.filter(obj => obj.id===filter.username):data;
          // console.log("fetchUsers", data);
          //transactions
          const transactionQuery = new Parse.Query("TransactionRecords");
          transactionQuery.select(
            "userId",
            "status",
            "transactionAmount",
            "type",
            "useWallet",
            "redeemServiceFee",
            "isCashOut"
          );
          transactionQuery.containedIn("userId", ids);
          filter.startdate &&
            transactionQuery.greaterThanOrEqualTo(
              "transactionDate",
              new Date(filter.startdate + " 00:00:00")
            );
          filter.enddate &&
            transactionQuery.lessThanOrEqualTo(
              "transactionDate",
              new Date(filter.enddate + " 23:59:59")
            );
          /*filter && Object.keys(filter).map((f) => {
              if(f === "username") transactionQuery.equalTo("objectId", filter[f], "i"); 
              else transactionQuery.equalTo(f, filter[f]);
          });*/
          transactionQuery.limit(100000);
          results = await transactionQuery.find();
          const walletBalances = 0;
          result = calculateDataSummaries({
            id: 1,
            users: data,
            transactions: results.map((o) => ({ id: o.id, ...o.attributes })),
            walletBalances,
          });

          /*result = {
            data: [
              {
                id: 0,
                users: data,
                transactions: results.map((o) => ({
                  id: o.id,
                  ...o.attributes,
                })),
              },
            ],
            total: null,
          }; */
          // console.log("Summary List ", result);
        }
        return result;
      }else if (resource === "summaryData") {
        var result = null;

        // Fetch all users in one query
        const userQuery = new Parse.Query(Parse.User);
        userQuery.limit(10000);
        const users = await userQuery.find({useMasterKey:true});

        // Create a map for quick user lookup by userId
        const userMap = users.reduce((map, user) => {
          map[user.id] = user;
          return map;
        }, {});
        console.log("Users:", users);
        console.log("User Map:", userMap);

        // transaction query
        const transactionQuery = new Parse.Query("TransactionRecords");
        transactionQuery.select(
          "userId",
          "status",
          "transactionAmount",
          "type",
          "useWallet",
          "redeemServiceFee",
          "isCashOut",
          "transactionIdFromStripe",
          "transactionDate",
          "paymentMode",
          "paymentMethodType",
          "remark",
          "redeemRemarks",
          "username"
        );
        transactionQuery.limit(100000);
        var results = await transactionQuery.find();

        // Process transactions and add agentName from the user map
        result = results.map((o) => {
          const transactionData = { id: o.id, ...o.attributes };

          // Get the user object from the map based on userId
          const user = userMap[transactionData.userId];
          console.log("User for transactionId:", transactionData.userId, "->", user);

          // Check if the user has the "userParentName" field
          if (user) {
            const agentName = user.get("userParentName");
            console.log("Agent Name:", agentName);

            // Add the Agent Name to the transaction data
            if (agentName) {
              transactionData.agentName = agentName;
            } else {
              console.log("No userParentName found for user:", user.id);
            }
          } else {
            console.log("User not found for userId:", transactionData.userId);
          }

          return transactionData;
        });

        return { data: result };
      }else if (resource === "walletData") {
        var result = null;

        // Fetch all users in one query
        const userQuery = new Parse.Query(Parse.User);
        userQuery.limit(10000);
        const users = await userQuery.find({ useMasterKey: true });

        // Create a map for quick user lookup by userId
        const userMap = users.reduce((map, user) => {
          map[user.id] = user;
          return map;
        }, {});

        // Wallet query
        const walletQuery = new Parse.Query("Wallet");
        walletQuery.limit(10000);
        const wallets = await walletQuery.find({ useMasterKey: true });

        // Process wallet data and add user-related information
        result = wallets.map((o) => {
          const walletData = { id: o.id, ...o.attributes };

          // Get the user object from the map based on userId
          const user = userMap[walletData.userID];

          if (user) {
            // Extract the required wallet data from the user object
            const agentName = user.get("userParentName");
            const username = user.get("username");
            const userID = walletData.userID
            const zelleId = walletData.zelleId;  // Assuming this comes from the Wallet table
            const balance = walletData.balance;  // Assuming this comes from the Wallet table
            const paypalId = walletData.paypalId; // Assuming this comes from the Wallet table
            const venmoId = walletData.venmoId;  // Assuming this comes from the Wallet table
            const cashAppId = walletData.cashAppId; // Assuming this comes from the Wallet table

            // Add user and wallet-related data to the wallet data
            walletData.agentName = agentName;
            walletData.username = username;
            walletData.zelleId = zelleId;
            walletData.balance = balance;
            walletData.paypalId = paypalId;
            walletData.venmoId = venmoId;
            walletData.cashAppId = cashAppId;
            walletData.userID = userID;
            walletData.createdAt = walletData.createdAt;
          } else {
            console.log("User not found for userId:", walletData.userId);
          }

          return walletData;
        });

        return { data: result };
      }
       else if (resource === "playerDashboard") {
        const Resource = Parse.Object.extend("TransactionRecords");
        query = new Parse.Query(Resource);
        filter = { userId: userid };

        filter &&
          Object.keys(filter).map((f) => {
            if (f === "username") query.equalTo(f, filter[f]);
            else query.equalTo(f, filter[f]);
          });

        query.limit(100000);

        const response = await query.find();
        const res = {
          data: response.map((o) => ({ id: o.id, ...o.attributes })),
          total: count,
        };
        return res;
      } else if (resource === "rechargeRecordsExport") {
        const Resource = Parse.Object.extend("TransactionRecords");
        query = new Parse.Query(Resource);
        filter = { type: "recharge", ...filter };
        if (role === "Player") {
          filter = { userId: userid, ...filter };
        } else if (role === "Agent") {
          var { ids } = await fetchUsers();
          query.containedIn("userId", ids);
        } else if (role === "Master-Agent") {
          var { ids } = await fetchUsers(null, true);
          query.containedIn("userId", ids);
        }

        query.limit(30000);
        query.descending(field);

        filter &&
          Object.keys(filter).map((f) => {
            if (f === "username") query.matches(f, filter[f], "i");
            else query.equalTo(f, filter[f]);
          });

        const response = await query.find();
        const res = {
          data: response.map((o) => ({ id: o.id, ...o.attributes })),
          total: count,
        };

        return res;
      } else if (resource === "redeemRecordsExport") {
        const Resource = Parse.Object.extend("TransactionRecords");
        query = new Parse.Query(Resource);
        filter = { type: "redeem", ...filter };
        if (role === "Player") {
          filter = { userId: userid, ...filter };
        } else if (role === "Agent") {
          var { ids } = await fetchUsers();
          query.containedIn("userId", ids);
        } else if (role === "Master-Agent") {
          var { ids } = await fetchUsers(null, true);
          query.containedIn("userId", ids);
        }

        query.limit(30000);
        query.descending(field);

        filter &&
          Object.keys(filter).map((f) => {
            if (f === "username") query.matches(f, filter[f], "i");
            else query.equalTo(f, filter[f]);
          });

        const response = await query.find();
        const res = {
          data: response.map((o) => ({ id: o.id, ...o.attributes })),
          total: count,
        };
        return res;
      } else if (resource === "Report") {
        const { fromDate, toDate } = params.filter || {}; // Extract filter params

        // Define date filtering condition
        const dateFilter = {};
        if (fromDate) dateFilter.transactionDate = { $gte: new Date(fromDate) };
        if (toDate) dateFilter.transactionDate = { 
            ...dateFilter.transactionDate,
            $lte: new Date(toDate) 
          };

        const queryPipeline = [
          {
            $match: dateFilter, // Apply date filter
          },
          {
            $facet: {
              // New Calculation for Fees (11% of Transaction Amount)
              totalFeesAmount: [
                {
                  $match: {
                    transactionAmount: { $gt: 0, $type: "number" }, // Ensure positive finite numbers
                  },
                },
                {
                  $group: {
                    _id: null,
                    totalFees: { $sum: { $multiply: ["$transactionAmount", 0.11] } },
                  },
                },
              ],
              // Calculation for Ticket Amount (Transaction Amount - Fees)
              totalTicketAmount: [
                {
                  $match: {
                    transactionAmount: { $gt: 0, $type: "number" }, // Ensure positive finite numbers
                  },
                },
                {
                  $group: {
                    _id: null,
                    totalTransaction: { $sum: "$transactionAmount" }, // Sum of all transactions
                    totalFees: { $sum: { $multiply: ["$transactionAmount", 0.11] } }, // Sum of all fees
                  },
                },
                {
                  $project: {
                    _id: 0,
                    totalTicketAmount: { $subtract: ["$totalTransaction", "$totalFees"] }, // Ticket Amount Calculation
                  },
                },
              ],
            },
          },
        ];

        const newResults = await new Parse.Query("TransactionRecords").aggregate(queryPipeline);
        return newResults;
    }
    
      else {
        const Resource = Parse.Object.extend(resource);
        query = new Parse.Query(Resource);
        filter &&
          Object.keys(filter).map((f) => query.equalTo(f, filter[f], "i"));
        var { ids } = await fetchUsers();
        query.containedIn("userId", ids);
        count = await query.count();
      }

      query.limit(perPage);
      query.skip((page - 1) * perPage);
      if (order === "DESC") query.descending(field);
      else if (order === "ASC") query.ascending(field);

      // if (filter && typeof filter === "object" && Object.keys(filter).length > 0) {
      //   Object.keys(filter).forEach((f) => {
      //     if (filter[f] !== undefined && filter[f] !== null) {
      //       if (f === "username") query.matches(f, String(filter[f]), "i");
      //       else query.equalTo(f, filter[f]);
      //     }
      //   });
      // }
      results =
        resource === "users"
          ? await query.find({ useMasterKey: true })
          : await query.find();

      if (resource !== "users") {
        // Extract unique userIds from transactions
        const userIds = [...new Set(results.map((t) => t.get("userId")))];

        if (userIds.length > 0) {
          // Fetch users from Parse.User table
          const userQuery = new Parse.Query(Parse.User);
          userQuery.containedIn("objectId", userIds);
          userQuery.select(
            "objectId",
            "userParentId",
            "name",
            "userParentName"
          ); // Include userParentId and name
          const userResults = await userQuery.find({ useMasterKey: true });

          // Create a map: userId -> userParentId & userParentName
          const userMap = {};
          userResults.forEach((user) => {
            userMap[user.id] = {
              userParentId: user.get("userParentId") || null,
              userParentName: user.get("userParentName") || null,
            };
          });

          console.log(
            "userMap - Ensuring userParentId & userParentName:",
            userMap
          );

          // Debug: Check if transaction.get("userId") exists in userMap
          results = results.map((transaction) => {
            const userId = transaction.get("userId");
            console.log(
              "Processing transaction for userId:",
              userId,
              "Mapped Data:",
              userMap[userId]
            ); // Debug

            return {
              id: transaction.id,
              ...transaction.attributes,
              userParentId: userMap[userId]?.userParentId || null,
              userParentName: userMap[userId]?.userParentName || null,
            };
          });
          console.log("Final results after mapping:", results); // Debug final output
          return { data: results, total: count };
        }
      }
      let res = null;
      if (resource !== "users") {
        return {
          data: results,
          total: count,
        };
      } else {
        return {
          data: results.map((o) => ({ id: o.id, ...o.attributes })),
          total: count,
        };
      }

      return res;
    } catch (error) {
      throw error;
    }
  },
  getMany: async (resource, params) => {
    var query = null;
    var results = null;
    if (resource === "users") {
      results = params.ids.map((id) =>
        new Parse.Query(Parse.User).get(id, { useMasterKey: true })
      );
    } else {
      const Resource = Parse.Object.extend(resource);
      query = new Parse.Query(Resource);
      results = params.ids.map((id) => new Parse.Query(Resource).get(id));
    }
    try {
      const data = await Promise.all(results);
      return {
        // total: data.length,
        data: data.map((o) => ({ id: o.id, ...o.attributes })),
      };
    } catch (error) {
      return error;
    }
  },
  getManyReference: async (resource, params) => {
    const { page, perPage } = params.pagination;
    const { field, order } = params.sort;

    const Resource = Parse.Object.extend(resource);
    var query = null;

    if (resource === "users") {
      query = new Parse.Query(Parse.User);
    } else {
      const Resource = Parse.Object.extend(resource);
      query = new Parse.Query(Resource);
    }

    query.equalTo(params.target, params.id);
    const count = await query.count();
    if (perPage) query.limit(perPage);
    if (page) query.skip((page - 1) * perPage);
    if (order === "DESC") query.descending(field);
    else if (order === "ASC") query.ascending(field);

    try {
      const results = await query.find();
      return {
        total: count,
        data: results.map((o) => ({ id: o.id, ...o.attributes })),
      };
    } catch (error) {
      return error;
    }
  },
  update: async (resource, params) => {
    //works
    var query = null;
    var obj = null;
    var r = null;
    const keys = Object.keys(params.data).filter((o) =>
      o === "id" || o === "createdAt" || o === "updatedAt" ? false : true
    );
    const data = keys.reduce((r, f, i) => {
      r[f] = params.data[f];
      return r;
    }, {});
    try {
      if (resource === "users") {
        query = new Parse.Query(Parse.User);
        obj = await query.get(params.id, { useMasterKey: true });
        r = await obj.save(data, { useMasterKey: true });
      } else {
        const Resource = Parse.Object.extend(resource);
        query = new Parse.Query(resource);
        obj = await query.get(params.id);
        r = await obj.save(data);
      }
      return { data: { id: r.id, ...r.attributes } };
    } catch (error) {
      throw Error(error.toString());
    }
  },
  updateMany: async (resource, params) => {
    //need to filter out id, createdAt, updatedAt

    const Resource = Parse.Object.extend(resource);
    try {
      const qs = await Promise.all(
        params.ids.map((id) => new Parse.Query(Resource).get(id))
      );
      qs.map((q) => q.save(params.data));
      return { data: params.ids };
    } catch {
      throw Error("Failed to update all");
    }
  },
  delete: async (resource, params) => {
    var query = null;
    var result = null;
    var data = null;
    try {
      if (resource === "users") {
        query = new Parse.Query(Parse.User);
        result = await query.get(params.id, { useMasterKey: true });
        data = { data: { id: result.id, ...result.attributes } };
        await result.destroy({ useMasterKey: true });
      } else {
        const Resource = Parse.Object.extend(resource);
        query = new Parse.Query(Resource);
        result = await query.get(params.id);
        data = { data: { id: result.id, ...result.attributes } };
        await result.destroy();
      }
      return data;
    } catch (error) {
      throw Error("Unable to delete");
    }
  },
  deleteMany: async (resource, params) => {
    const Resource = Parse.Object.extend(resource);
    try {
      const qs = await Promise.all(
        params.ids.map((id) => new Parse.Query(Resource).get(id))
      );
      await Promise.all(qs.map((obj) => obj.destroy()));
      return { data: params.ids };
    } catch (error) {
      throw Error("Unable to delete all");
    }
  },
  getLink: async (resource, params) => {
    if (resource === "paymentLink") {
      const { amount, currency } = params;

      try {
        // Create a Checkout Session
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card", "cashapp"], // Accept card payments
          mode: "payment", // One-time payment
          success_url:
            "http://localhost:3000/#/StripeForm?session_id={CHECKOUT_SESSION_ID}", // Replace with your success URL
          cancel_url:
            "http://localhost:3000/#/StripeForm?session_id={CHECKOUT_SESSION_ID}", // Replace with your cancel URL
          expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // Expires in 10 minutes
          line_items: [
            {
              price_data: {
                currency,
                product_data: {
                  name: "One-time Payment", // Placeholder for product
                },
                unit_amount: amount,
              },
              quantity: 1,
            },
          ],
        });

        const TransactionRecords = Parse.Object.extend("TransactionRecords");
        const transaction = new TransactionRecords();

        transaction.set("transactionIdFromStripe", session.id);
        transaction.set("transactionAmount", amount);
        transaction.set("status", 1);
        transaction.set("createdAt", new Date());
        transaction.set("referralLink", session.url);
        transaction.set("referralLink", session.url);

        const savedTransaction = await transaction.save(null);

        console.log("Transaction saved:", savedTransaction);

        console.log(session, "sessionStorage");
        return { data: { url: session.url } };
      } catch (error) {
        console.error("Error creating session:", error.message);
        throw new Error(`Unable to create payment session: ${error.message}`);
      }
    }

    throw new Error("Unsupported resource for getLink");
  },
  finalApprove: async (orderId, redeemRemarks,tempAmount) => {
    try {
      // Fetch the transaction record
      const TransactionRecords = Parse.Object.extend("TransactionRecords");
      const query = new Parse.Query(TransactionRecords);
      query.equalTo("objectId", orderId);
      let transaction = await query.first();

      if (transaction && transaction.get("status") === 11) {
        // Update transaction status
        transaction.set("status", 12);
        if (redeemRemarks) {
          transaction.set("redeemRemarks", redeemRemarks);
        }
        // Get transaction amount and redeem service fee percentage
        const transactionAmount = transaction.get("transactionAmount") || 0;
        const redeemServiceFeePercentage =
          transaction.get("redeemServiceFee") || 0;

        // Calculate the service fee and the amount to credit
        const serviceFee =
          (transactionAmount * redeemServiceFeePercentage) / 100;
        const amountToCredit = transactionAmount - serviceFee;

        if (amountToCredit < 0) {
          return {
            success: false,
            error: "Invalid credit amount calculation.",
          };
        }

        // If the tempAmount is different, refund the difference to the user's wallet
        if (tempAmount < transactionAmount) {
          const refundAmount = transactionAmount - tempAmount;

          // Fetch the user wallet
          const Wallet = Parse.Object.extend("Wallet");
          const walletQuery = new Parse.Query(Wallet);
          walletQuery.equalTo("userID", transaction.get("userId"));
          let wallet = await walletQuery.first();

          // Update wallet balance
          const currentBalance = wallet.get("balance") || 0;
          wallet.set("balance", currentBalance + refundAmount);
          await wallet.save(null);
        }
        transaction.set("transactionAmount", tempAmount);
        // Save the transaction and wallet updates
        await transaction.save(null);

        return {
          success: true,
          data: {
            transaction: transaction.toJSON(),
          },
        };
      } else {
        return {
          success: false,
          error: "Invalid status for approval or transaction not found.",
        };
      }
    } catch (error) {
      console.error("Final approval error:", error);
      throw error;
    }
  },
  finalReject: async (orderId,remark) => {
    try {
      const TransactionRecords = Parse.Object.extend("TransactionRecords");
      const Wallet = Parse.Object.extend("Wallet");

      // Fetch the transaction record
      const query = new Parse.Query(TransactionRecords);
      query.equalTo("objectId", orderId);
      let transaction = await query.first();

      if (transaction && transaction.get("status") === 11) {
        // Fetch the user ID and transaction amount
        const walletId = transaction.get("walletId");
        const transactionAmount = transaction.get("transactionAmount");

        if (!walletId || !transactionAmount) {
          return { success: false, error: "Invalid transaction data" };
        }

        // Fetch the wallet for the user
        const walletQuery = new Parse.Query(Wallet);
        walletQuery.equalTo("objectId", walletId); // Ensure your Wallet class has a `userId` field
        const wallet = await walletQuery.first();
        if (!wallet) {
          return { success: false, error: "Wallet not found for user" };
        }

        // Update wallet balance
        const currentBalance = wallet.get("balance") || 0;
        wallet.set("balance", currentBalance + transactionAmount);
        await wallet.save(null);

        // Update the transaction status
        transaction.set("status", 13); // Rejected status
        transaction.set("redeemRemarks", remark); // Rejected status
        await transaction.save(null);

        return {
          success: true,
          data: {
            transaction: transaction.toJSON(),
            wallet: wallet.toJSON(),
          },
        };
      } else {
        return { success: false, error: "Invalid status for rejection" };
      }
    } catch (error) {
      console.log(error, "weeorrrrrrr");
      console.error("Final rejection error:", error);
      throw error;
    }
  },
  retrieveCheckoutSession: async (sessionId) => {
    try {
      // Fetch the Checkout Session from Stripe
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      // Retrieve the corresponding TransactionRecord in Parse
      const TransactionRecords = Parse.Object.extend("TransactionRecords");
      const query = new Parse.Query(TransactionRecords);
      query.equalTo("transactionIdFromStripe", sessionId);

      const transaction = await query.first();

      if (!transaction) {
        throw new Error(
          `Transaction record not found for session ID: ${sessionId}`
        );
      }
      // Update the transaction status based on the Stripe session status
      if (session.status === "complete") {
        transaction.set("status", 2); // Assuming 2 represents 'completed'
      } else if (session.status === "pending" || session.status === "open") {
        transaction.set("status", 1); // Pending
      } else if (session.status === "expired") {
        transaction.set("status", 9); // Expired
      } else {
        transaction.set("status", 10); // Failed or canceled
        // Failed or canceled
      }

      await transaction.save(null);

      return {
        transaction: { id: transaction.id, ...transaction.attributes },
        stripeSession: session,
      };
    } catch (error) {
      console.error("Error retrieving checkout session:", error.message);
      throw new Error(`Unable to retrieve session: ${error.message}`);
    }
  },
  userTransaction: async (params) => {
    const {
      id,
      type,
      username,
      balance,
      transactionAmount,
      remark,
      useWallet,
    } = params;

    try {
      // Find the user by ID
      const userQuery = new Parse.Query(Parse.User);
      userQuery.equalTo("objectId", id);
      const user = await userQuery.first({ useMasterKey: true });

      if (!user) {
        throw new Error(`User with ID ${id} not found`);
      }

      let finalAmount = balance;
      if (useWallet) {
        // Ensure sufficient wallet balance
        if (balance < parseFloat(transactionAmount / 100)) {
          throw new Error("Insufficient wallet balance.");
        }
        // Deduct amount from the wallet balance
        finalAmount -= parseFloat(transactionAmount / 100);

        // Update the wallet balance in the Wallet class
        const walletQuery = new Parse.Query("Wallet");
        walletQuery.equalTo("userID", id);
        const wallet = await walletQuery.first();

        if (!wallet) {
          throw new Error(`Wallet for user ID ${id} not found.`);
        }

        wallet.set("balance", finalAmount);
        await wallet.save(null);
      } else if (type === "recharge") {
        // Credit amount to user's balance (for non-wallet recharge)
        finalAmount += parseFloat(transactionAmount);

        // Take the floor value of finalAmount with two decimal precision
        finalAmount = Math.floor(finalAmount * 100) / 100;
      }

      // Create a new transaction record
      const TransactionDetails = Parse.Object.extend("TransactionRecords");
      const transactionDetails = new TransactionDetails();

      transactionDetails.set("type", type);
      transactionDetails.set("gameId", "786");
      transactionDetails.set("username", username);
      transactionDetails.set("userId", id);
      transactionDetails.set("transactionDate", new Date());
      transactionDetails.set(
        "transactionAmount",
        Math.floor(parseFloat(transactionAmount) * 100) / 100 / 100 // Ensure transactionAmount has two decimal precision
      );
      transactionDetails.set("remark", remark);
      transactionDetails.set("useWallet", !!useWallet); // Store whether wallet was used

      let session = null;

      if (!useWallet) {
        // Process Stripe transaction
        session = await stripe.checkout.sessions.create({
          payment_method_types: ["card", "cashapp"], // Accept card payments
          mode: "payment", // One-time payment
          success_url: `${process.env.REACT_APP_REDIRECT_URL}?session_id={CHECKOUT_SESSION_ID}`, // Dynamic URL
          cancel_url: `${process.env.REACT_APP_REDIRECT_URL}?session_id={CHECKOUT_SESSION_ID}`, // Dynamic URL
          expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // Expires in 30 minutes
          line_items: [
            {
              price_data: {
                currency: "usd",
                product_data: {
                  name: "One-time Payment", // Placeholder for product
                },
                unit_amount: Math.floor(parseFloat(transactionAmount)), // Store unit amount as integer cents
              },
              quantity: 1,
            },
          ],
          metadata: {
            userId: id,
            username: username,
          },
        });

        transactionDetails.set("status", 1); // Pending status
        transactionDetails.set("referralLink", session.url);
        transactionDetails.set("transactionIdFromStripe", session.id);
      } else {
        transactionDetails.set("status", 2); // Completed via wallet
      }

      // Save the transaction record
      await transactionDetails.save(null);

      return {
        success: true,
        message: "Transaction updated and validated successfully",
        apiResponse: session,
      };
    } catch (error) {
      console.error("Error in userTransaction:", error.message);

      return {
        success: false,
        message: error.message || "An unexpected error occurred.",
      };
    }
  },
  summaryReport:async(params)=> {
    const queryPipeline = [
      {
        $match: {
        },
      },
      { $limit: 10000 },
      {
        $facet: {
          totalRechargeAmount: [
            { $match: { status: { $in: [2, 3] } } },
            {
              $group: {
                _id: null,
                total: { $sum: "$transactionAmount" },
              },
            },
          ],
          totalRedeemAmount: [
            {
              $match: {
                type: "redeem",
                status: { $in: [4, 8] },
                transactionAmount: { $gt: 0, $type: "number" } // Ensure positive finite numbers
              } 
            },
            {
              $group: {
                _id: null,
                total: { $sum: "$transactionAmount" },
              },
            },
          ]
        },
      },
    ];
    const newResults = await new Parse.Query(
      "TransactionRecords"
    ).aggregate(queryPipeline);

    console.log(newResults,"nwResule")

  }
  // refundTransaction: async (params) => {
  //   const { sessionId, amount, remark, redeemServiceFee } = params; // Include additional parameters if needed

  //   try {
  //     // Fetch the Checkout Session from Stripe
  //     const session = await stripe.checkout.sessions.retrieve(sessionId);

  //     if (!session || !session.payment_intent) {
  //       throw new Error("Invalid session ID or payment intent not found.");
  //     }

  //     // Validate refund amount (must be less than or equal to the original payment)
  //     if (amount > session.amount_total) {
  //       throw new Error("Refund amount exceeds the original transaction amount.");
  //     }

  //     // Create a refund for the specified amount
  //     const refund = await stripe.refunds.create({
  //       payment_intent: session.payment_intent,
  //       amount: amount, // Specify the amount to refund in the smallest currency unit
  //     });

  //     // Retrieve the corresponding transaction record
  //     const TransactionRecords = Parse.Object.extend("TransactionRecords");
  //     const query = new Parse.Query(TransactionRecords);
  //     query.equalTo("transactionIdFromStripe", sessionId);

  //     const transaction = await query.first();

  //     if (!transaction) {
  //       throw new Error(`Transaction record not found for session ID: ${sessionId}`);
  //     }

  //     // Update the transaction record with refund details
  //     transaction.set("status", 3); // Assuming 3 represents 'refunded'
  //     transaction.set("refundId", refund.id);
  //     transaction.set("refundAmount", refund.amount / 100); // Save refunded amount
  //     transaction.set("refundDate", new Date());
  //     transaction.set("remark", remark); // Add remark
  //     transaction.set("redeemServiceFee", redeemServiceFee); // Service fee if applicable
  //     await transaction.save(null, { useMasterKey: true });

  //     return {
  //       success: true,
  //       message: "Partial refund processed successfully.",
  //       refundDetails: refund,
  //     };
  //   } catch (error) {
  //     console.error("Error processing refund:", error.message);

  //     if (error instanceof Parse.Error) {
  //       return {
  //         success: false,
  //         code: error.code,
  //         message: error.message,
  //       };
  //     } else {
  //       return {
  //         success: false,
  //         code: 500,
  //         message: "An unexpected error occurred during the refund process.",
  //       };
  //     }
  //   }
  // },
  // refundTransactionOlder: async (params) => {
  //   const { sessionId, amount } = params; // sessionId and amount to refund

  //   try {
  //     // Fetch the Checkout Session from Stripe
  //     const session = await stripe.checkout.sessions.retrieve(sessionId);

  //     if (!session || !session.payment_intent) {
  //       throw new Error("Invalid session ID or payment intent not found.");
  //     }

  //     // Validate refund amount (must be less than or equal to the original payment)
  //     if (amount > session.amount_total) {
  //       throw new Error("Refund amount exceeds the original transaction amount.");
  //     }

  //     // Create a refund for the specified amount
  //     const refund = await stripe.refunds.create({
  //       payment_intent: session.payment_intent,
  //       amount: amount, // Specify the amount to refund in the smallest currency unit
  //     });

  //     // Retrieve the corresponding transaction record
  //     const TransactionRecords = Parse.Object.extend("TransactionRecords");
  //     const query = new Parse.Query(TransactionRecords);
  //     query.equalTo("transactionIdFromStripe", sessionId);

  //     const transaction = await query.first();

  //     if (!transaction) {
  //       throw new Error(`Transaction record not found for session ID: ${sessionId}`);
  //     }

  //     // Update the transaction record with refund details
  //     transaction.set("status", 3); // Assuming 3 represents 'refunded'
  //     transaction.set("refundId", refund.id);
  //     transaction.set("refundAmount", refund.amount / 100); // Save refunded amount
  //     transaction.set("refundDate", new Date());
  //     await transaction.save(null);

  //     return {
  //       success: true,
  //       message: "Partial refund processed successfully.",
  //       refundDetails: refund,
  //     };
  //   } catch (error) {
  //     console.error("Error processing refund:", error.message);
  //     return {
  //       success: false,
  //       message: error.message || "An unexpected error occurred during the refund process.",
  //     };
  //   }
  // }
};
