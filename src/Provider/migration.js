import { Parse } from "parse";

Parse.initialize(
  process.env.REACT_APP_APPID,
  process.env.REACT_APP_JAVASCRIPT_KEY,
  process.env.REACT_APP_MASTER_KEY
);
Parse.serverURL = process.env.REACT_APP_URL;
Parse.masterKey = process.env.REACT_APP_MASTER_KEY;

const migrateRedeemTransactions = async () => {
  try {
    // Step 1: Define the TransactionRecords class
    const TransactionRecords = Parse.Object.extend("TransactionRecords");
    const Wallet = Parse.Object.extend("Wallet");

    // Step 2: Query for transactions with type = redeem and status = 8
    const query = new Parse.Query(TransactionRecords);
    query.equalTo("type", "redeem");
    query.equalTo("status", 8);

    // Fetch all matching transactions
    const transactions = await query.find();

    const now = new Date();

    for (const transaction of transactions) {
      const userId = transaction.get("userId");
      const transactionAmount = transaction.get("transactionAmount");
      const cashAppId = transaction.get("cashAppId");

      // Step 3: Query for the user's wallet
      const walletQuery = new Parse.Query(Wallet);
      walletQuery.equalTo("userID", userId);
      let wallet = await walletQuery.first();

      // Step 4: Create a wallet if it doesn't exist
      if (!wallet) {
        wallet = new Wallet();
        wallet.set("userID", userId);
        wallet.set("balance", 0); // Initialize balance
      }

      // Set the cashAppId in the wallet (if provided in the transaction)
      if (cashAppId) {
        wallet.set("cashAppId", cashAppId);
      }

      // Step 5: Update the wallet balance
      const currentBalance = wallet.get("balance") || 0;
      wallet.set("balance", currentBalance + transactionAmount);

      // Save the wallet
      await wallet.save(null, { useMasterKey: true });

      // Step 6: Update the transaction status to 6
      transaction.set("status", 6);

      // Save the transaction
      await transaction.save(null, { useMasterKey: true });
    }

    // Step 7: Update transactions with status = 6 and older than 24 hours
    const status6Query = new Parse.Query(TransactionRecords);
    status6Query.equalTo("status", 6);

    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    status6Query.lessThan("createdAt", twentyFourHoursAgo);

    const oldTransactions = await status6Query.find();

    for (const oldTransaction of oldTransactions) {
      oldTransaction.set("status", 9);
      await oldTransaction.save(null, { useMasterKey: true });
    }
  } catch (error) {
    console.error("Error during migration:", error.message);
  }
};

// Execute the migration script
migrateRedeemTransactions();
