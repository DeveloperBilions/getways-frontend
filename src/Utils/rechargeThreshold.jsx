import Parse from "parse";

export async function checkAndUpdateThresholdMethod() {
  try {
    const RechargeThreshold = Parse.Object.extend("RechargeThresholds");
    const RechargeThresholdsHistory = Parse.Object.extend("RechargeThresholdsHistory");

    // Get all active threshold histories
    const historyQuery = new Parse.Query(RechargeThresholdsHistory);
    historyQuery.equalTo("isActive", true);
    const activeHistories = await historyQuery.find({ useMasterKey: true });

    if (!activeHistories.length) {
      return { activeMethod: null, message: "No active threshold history found" };
    }

    let activeThresholdMethod = null;

    for (const history of activeHistories) {
      const currentMethod = history.get("currentPaymentMethod");
      const pendingRandomAmount = Number(history.get("pendingRandomAmount") || 0);
      const thresholdId = history.get("thresholdId");
      const historyUpdatedAt = history.get("updatedAt");

      // Fetch total successful recharge amount for this payment method since history was created
      const totalAmount = await getTotalRechargeAmountByMethod(currentMethod, historyUpdatedAt);

      if (totalAmount >= pendingRandomAmount) {
        // Total exceeded pendingRandomAmount - deactivate this history
        history.set("isActive", false);
        await history.save(null, { useMasterKey: true });

        // Get the threshold to find next method
        const thresholdQuery = new Parse.Query(RechargeThreshold);
        const threshold = await thresholdQuery.get(thresholdId, { useMasterKey: true });

        if (!threshold) continue;

        const methods = threshold.get("targetPaymentMethods") || [];
        if (!methods.length) continue;

        // Find next method
        const currentIndex = methods.findIndex(
          (m) => m.toLowerCase() === currentMethod.toLowerCase()
        );
        const nextIndex = (currentIndex + 1) % methods.length;
        const nextMethod = methods[nextIndex];

        // Check if next method already has active history
        const existingNextHistory = await findOrCreateThresholdHistory(
          thresholdId,
          nextMethod,
          threshold.get("minAmount"),
          threshold.get("maxAmount")
        );

        if (existingNextHistory) {
          activeThresholdMethod = existingNextHistory.get("currentPaymentMethod");
        }
      } else {
        // Current method is still valid
        activeThresholdMethod = currentMethod;
      }
    }

    return { activeMethod: activeThresholdMethod, success: true };
  } catch (err) {
    console.error("Error checking/updating threshold method:", err);
    return { activeMethod: null, success: false, error: err.message };
  }
}

async function getTotalRechargeAmountByMethod(paymentMethod, sinceDate) {
  try {
    const TransactionRecords = Parse.Object.extend("TransactionRecords");
    const query = new Parse.Query(TransactionRecords);

    query.equalTo("type", "recharge");
    query.containedIn("status", [2, 3]); // Successful recharges

    // Map payment method to portal name
    const portalMap = {
      stripe: "Stripe",
      paynearme: "PayNearMe",
      coinbase: "Coinbase",
      clkk: "CLK",
      payarc: "Payarc",
      "authorizenet-charge": "AuthorizeNet",
      fiserv: "Fiserv",
      fiservcheckout: "FiservCheckout",
      getpay: "GetPay",
      finix: "Finix",
      commercehub: "CommerceHub",
      instant:"Wert",
    };

    const methodLower = paymentMethod.toLowerCase();

    // Special handling for 'link' payment method
    if (methodLower === "link") {
      query.equalTo("portal", "Stripe");
      query.contains("transactionIdFromStripe", "https://crypto.link.com");
    } else {
      const portalName = portalMap[methodLower] || paymentMethod;
      query.equalTo("portal", portalName);
    }

    if (sinceDate) {
      query.greaterThanOrEqualTo("createdAt", sinceDate);
    }

    query.limit(100000);

    const results = await query.find({ useMasterKey: true });
    const total = results.reduce((sum, record) => {
      return sum + Number(record.get("transactionAmount") || 0);
    }, 0);

    return total;
  } catch (err) {
    console.error("Error fetching transaction totals:", err);
    return 0;
  }
}

async function findOrCreateThresholdHistory(thresholdId, method, minAmount, maxAmount) {
  try {
    const RechargeThresholdsHistory = Parse.Object.extend("RechargeThresholdsHistory");

    // Check if there's already an active history for this threshold and method
    const existingQuery = new Parse.Query(RechargeThresholdsHistory);
    existingQuery.equalTo("thresholdId", thresholdId);
    existingQuery.equalTo("currentPaymentMethod", method);
    existingQuery.equalTo("isActive", true);

    const existing = await existingQuery.first({ useMasterKey: true });
    if (existing) {
      return existing;
    }

    // Create new history entry
    const min = Number(minAmount);
    const max = Number(maxAmount);

    // Generate random amount in steps of 10 within min-max
    const start = Math.ceil(min / 10);
    const end = Math.floor(max / 10);
    const options = [];
    for (let i = start; i <= end; i++) {
      options.push(i * 10);
    }
    const randomAmount = options.length > 0 
      ? options[Math.floor(Math.random() * options.length)]
      : max;

    const newHistory = new RechargeThresholdsHistory();
    newHistory.set("thresholdId", thresholdId);
    newHistory.set("currentPaymentMethod", method);
    newHistory.set("pendingRandomAmount", randomAmount);
    newHistory.set("pendingAmount", max);
    newHistory.set("isActive", true);

    await newHistory.save(null, { useMasterKey: true });
    return newHistory;
  } catch (err) {
    console.error("Error finding/creating threshold history:", err);
    return null;
  }
}

export async function getActiveThresholdMethod() {
  try {
    // First check and update thresholds based on transaction totals
    const result = await checkAndUpdateThresholdMethod();
    
    if (!result.success) {
      return { activeMethod: null, thresholds: [], activeMethods: [], thresholdMethods: [] };
    }

    // Then get all active thresholds with their active methods
    const thresholds = await getAllActiveThresholdsWithActiveMethod();
    
    // Find the active methods from thresholds (these should be shown)
    const activeMethods = thresholds
      .filter((t) => t.activeMethod)
      .map((t) => t.activeMethod.toLowerCase());

    // Collect ALL methods that are part of any threshold (threshold-controlled methods)
    const allThresholdMethods = new Set();
    thresholds.forEach((t) => {
      if (Array.isArray(t.methods)) {
        t.methods.forEach((m) => allThresholdMethods.add(m.toLowerCase()));
      }
    });
    return {
      activeMethods: [...new Set(activeMethods)],
      thresholdMethods: [...allThresholdMethods], // All methods controlled by thresholds
      thresholds,
    };
  } catch (err) {
    console.error("Error getting active threshold method:", err);
    return { activeMethod: null, thresholds: [], activeMethods: [], thresholdMethods: [] };
  }
}

export async function getAllActiveThresholdsWithActiveMethod() {
  try {
    // Load all active thresholds
    const RechargeThreshold = Parse.Object.extend("RechargeThresholds");
    const thresholdQuery = new Parse.Query(RechargeThreshold);
    thresholdQuery.equalTo("isActive", true);
    thresholdQuery.ascending("minAmount");
    thresholdQuery.limit(100);

    const thresholds = await thresholdQuery.find({ useMasterKey: true });

    const RechargeThresholdsHistory = Parse.Object.extend(
      "RechargeThresholdsHistory"
    );

    const results = [];

    // For each threshold, get its active history
    for (const threshold of thresholds) {
      const thresholdId = threshold.id;

      const historyQuery = new Parse.Query(RechargeThresholdsHistory);
      historyQuery.equalTo("thresholdId", thresholdId);
      historyQuery.equalTo("isActive", true);
      historyQuery.limit(1);

      const activeHistory = await historyQuery.first({ useMasterKey: true });

      results.push({
        thresholdId,
        minAmount: threshold.get("minAmount"),
        maxAmount: threshold.get("maxAmount"),
        methods: threshold.get("targetPaymentMethods") || [],
        activeMethod: activeHistory
          ? activeHistory.get("currentPaymentMethod")
          : null,
        pendingRandomAmount: activeHistory
          ? activeHistory.get("pendingRandomAmount")
          : null,
        pendingAmount: activeHistory
          ? activeHistory.get("pendingAmount")
          : null,
      });
    }

    return results;
  } catch (err) {
    console.error("Error fetching thresholds and active methods:", err);
    throw err;
  }
}
export async function shuffleRechargeMethod(thresholdId) {
  try {
    const RechargeThresholdsHistory = Parse.Object.extend(
      "RechargeThresholdsHistory"
    );
    const RechargeThreshold = Parse.Object.extend("RechargeThresholds");

    // 1. Find the currently active history
    const activeHistoryQuery = new Parse.Query(RechargeThresholdsHistory);
    activeHistoryQuery.equalTo("thresholdId", thresholdId);
    activeHistoryQuery.equalTo("isActive", true);
    const activeHistory = await activeHistoryQuery.first({
      useMasterKey: true,
    });

    // 2. Mark it inactive if exists
    let currentMethod = null;
    if (activeHistory) {
      currentMethod = activeHistory.get("currentPaymentMethod");
      activeHistory.set("isActive", false);
      await activeHistory.save(null, { useMasterKey: true });
    }

    // 3. Load the threshold to get methods and min/max
    const thresholdQuery = new Parse.Query(RechargeThreshold);
    const threshold = await thresholdQuery.get(thresholdId, {
      useMasterKey: true,
    });

    const methods = threshold.get("targetPaymentMethods") || [];
    const min = Number(threshold.get("minAmount"));
    const max = Number(threshold.get("maxAmount"));

    if (!methods.length) {
      throw new Error("No payment methods configured for this threshold.");
    }

    // 4. Determine the next method
    let nextIndex = 0;
    if (currentMethod) {
      const currentIndex = methods.findIndex((m) => m === currentMethod);
      nextIndex = (currentIndex + 1) % methods.length;
    }
    const nextMethod = methods[nextIndex];

    // 5. Generate random amount in steps of 10 within min-max
    const start = Math.ceil(min / 10);
    const end = Math.floor(max / 10);
    if (start > end) {
      throw new Error(`No valid 10-multiple amount between ${min} and ${max}.`);
    }
    const options = [];
    for (let i = start; i <= end; i++) {
      options.push(i * 10);
    }
    const randomAmount = options[Math.floor(Math.random() * options.length)];

    // 6. Create new history entry
    const newHistory = new RechargeThresholdsHistory();
    newHistory.set("thresholdId", thresholdId);
    newHistory.set("currentPaymentMethod", nextMethod);
    newHistory.set("pendingRandomAmount", randomAmount);
    newHistory.set("pendingAmount", max);
    newHistory.set("isActive", true);

    await newHistory.save(null, { useMasterKey: true });

    return { success: true, newMethod: nextMethod, randomAmount };
  } catch (err) {
    console.error("Error shuffling recharge method:", err);
    return { success: false };
  }
}
export async function validateThresholdBeforeRecharge(rechargeAmount, methodId) {
    try {
  
      const RechargeThresholdsHistory = Parse.Object.extend("RechargeThresholdsHistory");
      const query = new Parse.Query(RechargeThresholdsHistory);
      query.equalTo("currentPaymentMethod",methodId);
      query.equalTo("isActive", true);
      const activeHistory = await query.first({ useMasterKey: true });
  
      if (!activeHistory) {
        return { ok: true };
      }
  
      const pendingAmount = Number(activeHistory.get("pendingRandomAmount") || 0);
  
      if (pendingAmount < rechargeAmount) {
        // shuffle required
        const result = await shuffleRechargeMethod(activeHistory.get("thresholdId"));
        if (!result.success) {
          return { ok: false, error: "Failed to shuffle payment method." };
        }
        return { ok: true, shuffled: true, newMethod: result.newMethod };
      }
  
      return { ok: true };
    } catch (err) {
      console.error("Threshold validation error:", err);
      return { ok: false, error: "Threshold validation failed." };
    }
  }
  
