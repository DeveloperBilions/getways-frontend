import Parse from "parse";
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
  
