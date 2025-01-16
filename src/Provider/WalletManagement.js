import { Parse } from "parse";

Parse.initialize(
  process.env.REACT_APP_APPID,
  process.env.REACT_APP_JAVASCRIPT_KEY,
  process.env.REACT_APP_MASTER_KEY
);
Parse.serverURL = process.env.REACT_APP_URL;
Parse.masterKey = process.env.REACT_APP_MASTER_KEY;

export const walletService = {
  getMyWalletData: async () => {
    try {
      // Create a query on the Wallet class
      const Wallet = Parse.Object.extend("Wallet"); // Assuming your class is named "Wallet"
      const query = new Parse.Query(Wallet);
      const userId = localStorage.getItem("id");
      // Add a condition to match the userId
      query.equalTo("userID", userId);

      // Fetch the wallet object
      const wallet = await query.first();

      // Check if a wallet was found
      if (!wallet) {
        return {
          wallet: "No Wallet Found",
        };
      }

      // Return the wallet data
      return {
        wallet: { ...wallet.attributes, objectId: wallet.id },
      };
    } catch (error) {
      console.error("Error fetching wallet data:", error.message);
      throw new Error("Could not fetch wallet data. Please try again.");
    }
  },
  updatePaymentMethods: async (paymentMethods) => {
    try {
      const Wallet = Parse.Object.extend("Wallet");
      const query = new Parse.Query(Wallet);
      const userId = localStorage.getItem("id");
  
      query.equalTo("userID", userId);
  
      let wallet = await query.first();
  
      // If wallet does not exist, create a new one
      if (!wallet) {
        wallet = new Wallet();
        wallet.set("userID", userId);
        console.log("Creating new wallet for user ID:", userId);
      }
  
      // Ensure payment methods are correctly set
      if (paymentMethods) {
        wallet.set("cashAppId", paymentMethods.cashAppId || "");
        wallet.set("paypalId", paymentMethods.paypalId || "");
        wallet.set("venmoId", paymentMethods.venmoId || "");
      } else {
        console.warn("No payment methods provided, setting to empty.");
        wallet.set("cashAppId", "");
        wallet.set("paypalId", "");
        wallet.set("venmoId", "");
      }
  
      // Save the updated or newly created wallet object
      const updatedWallet = await wallet.save(null);
  
      return {
        message: "Payment methods updated successfully.",
        wallet: { ...updatedWallet.attributes },
      };
    } catch (error) {
      console.error("Error updating or creating wallet:", error.message);
      throw new Error("Could not update or create wallet. Please try again.");
    }
  },  
  getCashoutTransactions: async (request) => {
    console.log(request, "getCashoutTransactions");
    const { page = 1, limit = 10, userId } = request; // Default to page 1 and limit 10
  
    if (!userId) {
      return {
        status: "error",
        code: 401,
        message: "Unauthorized: User not logged in",
      };
    }
  
    try {

      const Wallet = Parse.Object.extend("Wallet");
      const walletQuery = new Parse.Query(Wallet);
      walletQuery.equalTo("userID", userId);
      const wallet = await walletQuery.first();

      if (!wallet) {
        return {
          status: "error",
          code: 404,
          message: "Wallet not found for the user",
        };
      }  

      const walletCreationDate = wallet.get("createdAt"); // Assuming createdAt is the wallet's creation date

  
      // Define the TransactionRecords class
      const TransactionDetails = Parse.Object.extend("TransactionRecords");
  
      // Create a query to find transactions with isCashOut === true
      const query1 = new Parse.Query(TransactionDetails);
      query1.equalTo("isCashOut", true);
  
      // Create a query to find transactions with status === 4
      const query2 = new Parse.Query(TransactionDetails);
      query2.equalTo("type", "redeem");
      query2.notEqualTo("status", 6);

      // Combine queries with OR
      const query = Parse.Query.or(query1, query2);
  
      // Filter by userId
      query.equalTo("userId", userId);
      query.greaterThanOrEqualTo("transactionDate", walletCreationDate); // Exclude transactions before wallet creation date

      // Pagination logic
      query.skip((page - 1) * limit); // Skip records for previous pages
      query.limit(limit); // Limit the number of results
      query.descending("updatedAt"); // Sort by most recent updates
  
      // Execute the query for fetching the paginated results
      const results = await query.find();
  
      // Count total records for pagination metadata (without pagination logic applied)
      const countQuery = Parse.Query.or(query1, query2);
      countQuery.equalTo("type", "redeem"); // Filter by the same userId
      countQuery.greaterThanOrEqualTo("transactionDate", walletCreationDate); // Include wallet creation date filter
      const totalCount = await countQuery.count(); // Get total count without limit or skip
  
      // Map the results to a readable format
      const transactions = results.map((transaction) => {
        return {
          id: transaction.id,
          type: transaction.get("type"),
          gameId: transaction.get("gameId"),
          username: transaction.get("username"),
          userId: transaction.get("userId"),
          transactionDate: transaction.get("transactionDate"),
          transactionAmount: transaction.get("transactionAmount"),
          remark: transaction.get("remark"),
          redeemServiceFee: transaction.get("redeemServiceFee"),
          paymentMode: transaction.get("paymentMode"),
          status: transaction.get("status"),
          paymentMethodType: transaction.get("paymentMethodType"),
          updatedAt: transaction.get("updatedAt"), // Include updatedAt in response
          isCashOut: transaction.get("isCashOut"),
          redeemRemarks:transaction.get("redeemRemarks")
        };
      });
  
      // Return paginated results
      return {
        status: "success",
        transactions,
        pagination: {
          currentPage: page,
          pageSize: limit,
          totalRecords: totalCount, // Include total records count here
          totalPages: Math.ceil(totalCount / limit), // Calculate total pages
        },
      };
    } catch (error) {
      console.log("getCashoutTransactions", error);
      // Handle errors
      if (error instanceof Parse.Error) {
        return {
          status: "error",
          code: error.code,
          message: error.message,
        };
      } else {
        return {
          status: "error",
          code: 500,
          message: "An unexpected error occurred.",
        };
      }
    }
  } 
};
