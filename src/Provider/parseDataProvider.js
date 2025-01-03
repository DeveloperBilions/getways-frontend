import { Parse } from "parse";
import Stripe from 'stripe';

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
    try {
      const { page, perPage } = params.pagination;
      const { field, order } = params.sort;
      const { q, ...filter } = params.filter;
      const role = localStorage.getItem("role");
      const userid = localStorage.getItem("id");
      const username = localStorage.getItem("username");
  
      Parse.masterKey = Parse.masterKey || process.env.REACT_APP_MASTER_KEY;
  
      const createFilterQuery = (query, filter) => {
        Object.entries(filter).forEach(([key, value]) => {
          if (key === "username") query.matches(key, value, "i");
          else query.equalTo(key, value);
        });
      };
  
      const fetchUsers = async (selectedUser) => {
        const user = selectedUser || (await Parse.User.current());
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
          "email"
        );
  
        const results = await usrQuery.find({ useMasterKey: true });
        results.push(user);
  
        const ids = results.map((r) => r.id);
        return { ids, data: results.map((o) => ({ id: o.id, ...o.attributes })) };
      };
  
      let query, count;
  
      switch (resource) {
        case "users":
          query = new Parse.Query(Parse.User);
          if (role === "Agent") query.equalTo("userParentId", userid);
          createFilterQuery(query, filter);
          count = await query.count({ useMasterKey: true });
          break;
  
        case "redeemRecords":
        case "rechargeRecords":
          const type = resource === "redeemRecords" ? "redeem" : "recharge";
          const Resource = Parse.Object.extend("TransactionRecords");
          query = new Parse.Query(Resource);
          filter.type = type;
  
          if (role === "Player") filter.userId = userid;
          else if (role === "Agent") {
            const { ids } = await fetchUsers();
            query.containedIn("userId", ids);
          }
  
          createFilterQuery(query, filter);
          count = await query.count();
          break;
  
        case "summary":
          if (role === "Super-User" || role === "Agent") {
            const selectedUser =
              filter.username &&
              (await new Parse.Query(Parse.User).get(filter.username, {
                useMasterKey: true,
              }));
            const { ids, data: users } = await fetchUsers(selectedUser);
  
            const transactionQuery = new Parse.Query("TransactionRecords");
            transactionQuery.select(
              "userId",
              "status",
              "transactionAmount",
              "type"
            );
            transactionQuery.containedIn("userId", ids);
            if (filter.startdate) {
              transactionQuery.greaterThanOrEqualTo(
                "transactionDate",
                new Date(`${filter.startdate} 00:00:00`)
              );
            }
            if (filter.enddate) {
              transactionQuery.lessThanOrEqualTo(
                "transactionDate",
                new Date(`${filter.enddate} 23:59:59`)
              );
            }
            const transactions = await transactionQuery.find();
            return {
              data: [
                {
                  id: 0,
                  users,
                  transactions: transactions.map((o) => ({
                    id: o.id,
                    ...o.attributes,
                  })),
                },
              ],
              total: null,
            };
          }
          break;
  
        case "summaryData":
          const rawFilter = {
            userId: filter.username || userid,
            startDate: filter.startdate,
            endDate: filter.enddate,
          };
          const summaryResponse = await Parse.Cloud.run("summaryFilter", rawFilter);
          return {
            data: Object.entries(summaryResponse?.data).map(([key, value], index) => ({
              id: index + 1,
              key,
              value,
            })),
            total: null,
          };
  
        case "playerDashboard":
          query = new Parse.Query(Parse.Object.extend("TransactionRecords"));
          query.equalTo("username", username);
          createFilterQuery(query, filter);
          const playerData = await query.find();
          return {
            data: playerData.map((o) => ({ id: o.id, ...o.attributes })),
            total: count,
          };
  
        case "rechargeRecordsExport":
        case "redeemRecordsExport":
          query = new Parse.Query(Parse.Object.extend("TransactionRecords"));
          filter.type = resource === "rechargeRecordsExport" ? "recharge" : "redeem";
          if (role === "Player") filter.userId = userid;
          else if (role === "Agent") {
            const { ids } = await fetchUsers();
            query.containedIn("userId", ids);
          }
          query.limit(30000);
          if (order === "DESC") query.descending(field);
          else query.ascending(field);
          createFilterQuery(query, filter);
          const exportData = await query.find();
          return {
            data: exportData.map((o) => ({ id: o.id, ...o.attributes })),
            total: count,
          };
  
        default:
          const DefaultResource = Parse.Object.extend(resource);
          query = new Parse.Query(DefaultResource);
          createFilterQuery(query, filter);
          if (role === "Agent") {
            const { ids } = await fetchUsers();
            query.containedIn("userId", ids);
          }
          count = await query.count();
      }
  
      query.limit(perPage);
      query.skip((page - 1) * perPage);
      if (order === "DESC") query.descending(field);
      else if (order === "ASC") query.ascending(field);
  
      const results = await query.find({ useMasterKey: true });
      return {
        data: results.map((o) => ({ id: o.id, ...o.attributes })),
        total: count,
      };
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
          payment_method_types: ["card"], // Accept card payments
          mode: "payment", // One-time payment
          success_url: "http://localhost:3000/#/StripeForm?session_id={CHECKOUT_SESSION_ID}", // Replace with your success URL
          cancel_url: "http://localhost:3000/#/StripeForm?session_id={CHECKOUT_SESSION_ID}", // Replace with your cancel URL
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

        console.log(session,"sessionStorage")
        return { data: { url: session.url } };
      } catch (error) {
        console.error("Error creating session:", error.message);
        throw new Error(`Unable to create payment session: ${error.message}`);
      }
    }
  
    throw new Error("Unsupported resource for getLink");
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
        throw new Error(`Transaction record not found for session ID: ${sessionId}`);
      }
      console.log(session,"sessionsession")
      console.log(TransactionRecords,"TransactionRecordsTransactionRecords")
      // Update the transaction status based on the Stripe session status
      if (session.payment_status === "paid") {
        transaction.set("status", 2); // Assuming 2 represents 'completed'
      } else if (session.payment_status === "pending") {
        transaction.set("status", 1); // Pending
      } else {
        transaction.set("status", 0); // Failed or canceled
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
    const { id, type, username, balance, transactionAmount, remark } = params;

    try {
      // Find the user by ID
      const userQuery = new Parse.Query(Parse.User);
      userQuery.equalTo("objectId",id);
      const user = await userQuery.first({ useMasterKey: true });

      if (!user) {
        throw new Error(`User with ID ${id} not found`);
      }

      let finalAmount;
      if (type === "redeem") {
        // Deduct amount from user's balance
        finalAmount = balance - parseFloat(transactionAmount);
      } else if (type === "recharge") {
        // Credit amount to user's balance
        finalAmount = balance + parseFloat(transactionAmount);
      }

      // Create a new transaction record
      const TransactionDetails = Parse.Object.extend("TransactionRecords");
      const transactionDetails = new TransactionDetails();

      transactionDetails.set("type", type);
      transactionDetails.set("gameId", "786");
      transactionDetails.set("username", username);
      transactionDetails.set("userId", id);
      transactionDetails.set("transactionDate", new Date());
      transactionDetails.set("transactionAmount", parseFloat(transactionAmount) / 100 );
      transactionDetails.set("remark", remark);

      // Save the transaction record
      await transactionDetails.save(null);
      const transactionId = transactionDetails.id;

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"], // Accept card payments,
        mode: "payment", // One-time payment
        success_url: `${process.env.REACT_APP_REDIRECT_URL}?session_id={CHECKOUT_SESSION_ID}`, // Dynamic URL from environment variable
        cancel_url: `${process.env.REACT_APP_REDIRECT_URL}?session_id={CHECKOUT_SESSION_ID}`, // Dynamic URL from environment variable
        expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // Expires in 10 minutes
        line_items: [
          {
            price_data: {
              currency:"usd",
              product_data: {
                name: "One-time Payment", // Placeholder for product
              },
              unit_amount: transactionAmount ,
            },
            quantity: 1,
          },
        ],
        metadata: {
          userId: id, // Replace with the actual user ID
          username:username
        },
      });

      transactionDetails.set("status", 1);
      transactionDetails.set("referralLink", session.url);
      transactionDetails.set("transactionIdFromStripe", session.id);
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
};
