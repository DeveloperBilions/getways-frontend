export const mapTransactionStatus = (status) => {
  switch (status) {
    case 0:
      return "Pending Referral Link";
    case 1:
      return "Pending Confirmation";
    case 2:
      return "Confirmed";
    case 3:
      return "Coins Credited";
    case 4:
      return "Redeem Success";
    case 5:
      return "Redeem Failed";
    case 6:
      return "Pending Approval";
    case 7:
      return "Redeem Rejected";
    default:
      return "Unknown Status";
  }
};

export const calculateDataSummaries = ({
  id,
  users,
  transactions,
  walletBalances,
}) => {
  const totalBalance = users.reduce((sum, user) => {
    return sum + (walletBalances[user?.id] || 0);
  }, 0);
  const referenceDate = new Date("2025-01-17"); // Reference date (17th Jan)
  const totalRegisteredUsers = users.filter(
    (item) => !item.userReferralCode
  ).length; //excluding self
  const totalAgents = users.filter(
    (item) => item.roleName === "Agent" //&& item.username !== identity.username
  ).length;
  const totalRechargeAmount =
    transactions
      .filter((item) => item.status === 2 || item.status === 3)
      .reduce((sum, item) => sum + item.transactionAmount, 0) || 0;
  const totalRedeemAmount = Math.floor(
    transactions
      .filter(
        (item) =>
          item.type === "redeem" && (item.status === 8 || item.status === 4)
      )
      .reduce((sum, item) => sum + item.transactionAmount, 0) || 0
  );
  const totalPendingRechargeAmount =
    transactions
      .filter((item) => item.status === 1)
      .reduce((sum, item) => sum + item.transactionAmount, 0) || 0;
  const totalFailRedeemAmount =
    transactions
      .filter((item) => {
        const transactionDate = new Date(item.transactionDate);
        if (transactionDate > referenceDate) {
          return item.status === 7; // After 17th Jan, consider status 7
        } else {
          return item.status === 5; // Before or on 17th Jan, consider status 5
        }
      })
      .reduce((sum, item) => sum + item.transactionAmount, 0) || 0;
  const totalRecords = transactions?.length;
  const totalAmt =
    transactions.reduce((sum, item) => sum + item.transactionAmount, 0) || 0;
  const totalCashoutRedeemsSuccess =
    transactions
      .filter((item) => item.status === 12)
      .reduce((sum, item) => sum + item.transactionAmount, 0) || 0;
  const totalCashoutRedeemsInProgress =
    transactions
      .filter((item) => item.status === 11)
      .reduce((sum, item) => sum + item.transactionAmount, 0) || 0;

  const totalRedeemSuccessful = transactions.filter(
    (item) => item.status === 8
  )?.length;
  const totalRechargeByType = {
    wallet: transactions
      .filter(
        (item) =>
          item.type === "recharge" &&
          item.useWallet === true &&
          (item.status === 2 || item.status === 3) &&
          Number.isFinite(item.transactionAmount) // Ensure transactionAmount is a valid number
      )
      .reduce((sum, item) => sum + item.transactionAmount, 0),
    others: transactions
      .filter(
        (item) =>
          item.type === "recharge" &&
          (item.useWallet === false ||
            item.useWallet === null ||
            item.useWallet === undefined) &&
          (item.status === 2 || item.status === 3) &&
          Number.isFinite(item.transactionAmount) // Ensure transactionAmount is a valid number
      )
      .reduce((sum, item) => sum + item.transactionAmount, 0),
  };
  const getUserParentName = (userId) => {
    const user = users.find((user) => user.id === userId);
    return user ? user.userParentName : "Unknown";
  };
  const totalRedeemByTypeData = {
    wallet: transactions
      .filter(
        (item) =>
          item.type === "redeem" && (item.status === 4 || item.status === 8)
      )
      .map((item) => ({
        transactionId: item.id,
        type: item?.type,
        amount: item.transactionAmount,
        status: item.status,
        paymentType: "redeem",
        transactionIdFromStripe: item?.transactionIdFromStripe,
        transactionDate: item?.transactionDate,
        isCashout: item.status === 12,
        redeemServiceFee: item?.redeemServiceFee,
        paymentMode: item?.paymentMode,
        paymentMethodType: item?.paymentMethodType,
        remark: item?.remark,
        redeemRemarks: item?.redeemRemarks,
        agentName: getUserParentName(item?.userId),
        userName: item?.username,
      })),
    others: transactions
      .filter((item) => item.type === "redeem" && item.status === 12)
      .map((item) => ({
        transactionId: item.id,
        type: item?.type,
        amount: item.transactionAmount,
        status: item.status,
        paymentType: "cashout",
        transactionIdFromStripe: item?.transactionIdFromStripe,
        transactionDate: item?.transactionDate,
        isCashout: item.status === 12,
        redeemServiceFee: item?.redeemServiceFee,
        paymentMode: item?.paymentMode,
        paymentMethodType: item?.paymentMethodType,
        remark: item?.remark,
        redeemRemarks: item?.redeemRemarks,
        agentName: getUserParentName(item?.userId),
        userName: item?.username,
      })),
  };
  const totalRechargeByTypeData = {
    wallet: transactions
      .filter(
        (item) =>
          item.type === "recharge" &&
          item.useWallet === true &&
          (item.status === 2 || item.status === 3) &&
          Number.isFinite(item.transactionAmount) // Ensure transactionAmount is a valid number
      )
      .map((item) => ({
        transactionId: item.id,
        type: item?.type,
        amount: item.transactionAmount,
        status: item.status,
        paymentType: "wallet",
        transactionIdFromStripe: item?.transactionIdFromStripe,
        transactionDate: item?.transactionDate,
        isCashout: item.status === 12,
        redeemServiceFee: item?.redeemServiceFee,
        paymentMode: item?.paymentMode,
        paymentMethodType: item?.paymentMethodType,
        remark: item?.remark,
        redeemRemarks: item?.redeemRemarks,
        agentName: getUserParentName(item?.userId),
        userName: item?.username,
      })),
    others: transactions
      .filter(
        (item) =>
          item.type === "recharge" &&
          (item.useWallet === false ||
            item.useWallet === null ||
            item.useWallet === undefined) &&
          (item.status === 2 || item.status === 3) &&
          Number.isFinite(item.transactionAmount) // Ensure transactionAmount is a valid number
      )
      .map((item) => ({
        transactionId: item.id,
        type: item?.type,
        amount: item.transactionAmount,
        status: item.status,
        paymentType: "others",
        transactionIdFromStripe: item?.transactionIdFromStripe,
        transactionDate: item?.transactionDate,
        isCashout: item.status === 12,
        redeemServiceFee: item?.redeemServiceFee,
        paymentMode: item?.paymentMode,
        paymentMethodType: item?.paymentMethodType,
        remark: item?.remark,
        redeemRemarks: item?.redeemRemarks,
        agentName: getUserParentName(item?.userId),
        userName: item?.username,
      })),
  };
  const totalFeesCharged = transactions
    .filter(
      (item) =>
        item.type === "redeem" && (item.status === 8 || item.status === 4)
    ) // Only consider redeems
    .reduce((sum, item) => {
      const serviceFee = parseInt(item.redeemServiceFee) || 0; // Default to 0 if invalid
      const transactionAmount = parseInt(item.transactionAmount) || 0; // Default to 0 if invalid

      const calculatedFee = Math.floor((serviceFee / 100) * transactionAmount); // Calculate fee
      return sum + calculatedFee;
    }, 0);

  return {
    data: [
      {
        id: id,
        totalRegisteredUsers: totalRegisteredUsers,
        totalAgents: totalAgents,
        totalRechargeAmount: totalRechargeAmount,
        totalRedeemAmount: totalRedeemAmount,
        totalPendingRechargeAmount: totalPendingRechargeAmount,
        totalFailRedeemAmount: totalFailRedeemAmount,
        totalRecords: totalRecords,
        totalAmt: totalAmt,
        totalCashoutRedeemsSuccess,
        totalCashoutRedeemsInProgress,
        totalRedeemSuccessful,
        totalRechargeByType,
        totalFeesCharged,
        walletBalances,
        totalBalance,
        totalRechargeByTypeData,
        totalRedeemByTypeData,
      },
    ],
    total: null,
  };
};
export const calculateDataSummariesForSummary = ({
  id,
  users,
  walletBalances,
}) => {
  const totalBalance = users.reduce((sum, user) => {
    return sum + (walletBalances[user?.id] || 0);
  }, 0);

  return {
    data: [
      {
        id: id,
        walletBalances,
        totalBalance,
      },
    ],
    total: null,
  };
};

// Function to get role-based options
export const getRoleBasedOptions = (role) => {
  const defaultMainOptions = [
    { id: "recharge", label: "Recharge", icon: "💰" },
    { id: "redeem", label: "Redeem", icon: "🎁" },
    { id: "wallet", label: "Wallet", icon: "👛" },
    { id: "giftcard", label: "Gift Cards", icon: "🎫" },
    { id: "support", label: "Help & Support", icon: "❓" },
    { id: "account", label: "Account Management", icon: "👤" },
    { id: "other", label: "Other", icon: "🤷‍♂️" },
  ];

  const defaultSubOptions = {
    recharge: [
      { id: "recharge-methods", label: "Recharge Methods", icon: "💳" },
      { id: "recharge-amount", label: "Recharge Denominations", icon: "💵" },
      { id: "recharge-history", label: "Recharge History", icon: "📜" },
      { id: "recharge-notes", label: "Transaction Notes", icon: "📝" },
      { id: "recharge-issues", label: "Recharge Troubleshooting", icon: "⚠️" },
    ],
    redeem: [
      { id: "redeem-amount", label: "Redemption Amounts", icon: "💵" },
      { id: "redeem-fee", label: "Service Fees", icon: "💸" },
      { id: "redeem-time", label: "Processing Time", icon: "⏱️" },
      { id: "redeem-history", label: "Redemption History", icon: "📜" },
      { id: "redeem-notes", label: "Transaction Notes", icon: "📝" },
    ],
    wallet: [
      { id: "wallet-balance", label: "Check Balance", icon: "🔍" },
      { id: "wallet-cashout", label: "Cashout Process", icon: "💰" },
      { id: "wallet-history", label: "Transaction History", icon: "📜" },
      { id: "wallet-instant", label: "Instant Recharge", icon: "⚡" },
    ],
    giftcard: [
      { id: "giftcard-manage", label: "My Gift Cards", icon: "🎁" },
      { id: "giftcard-cashout", label: "Cashout to Gift Cards", icon: "💱" },
    ],
    support: [
      { id: "support-balance", label: "Balance Inquiries", icon: "💰" },
      { id: "support-giftcard", label: "Gift Card Issues", icon: "🎫" },
      { id: "support-transaction", label: "Transaction Issues", icon: "📜" },
    ],
    account: [
      { id: "account-login", label: "Login Issues", icon: "🔑" },
      { id: "account-profile", label: "Profile Menu", icon: "👤" },
    ],
  };

  const defaultFinalOptions = {
    "recharge-methods": [
      "What recharge methods are available on GETWAYS?",
      "How does Quick Debit Recharge work with Coinbase?",
      "What is the difference between Standard and Instant Recharge?",
      "Can I use my wallet funds for Instant Recharge?",
      "How does the payment portal work for recharges?",
    ],
    "recharge-amount": [
      "What denomination options are available for recharge?",
      "Can I recharge a custom amount?",
      "What are the minimum and maximum recharge amounts?",
    ],
    "recharge-history": [
      "How can I view my recent recharge transactions?",
      "How long does GETWAYS keep recharge history?",
      "Why is my recharge showing as pending?",
    ],
    "recharge-notes": [
      "How can I add a transaction note during recharge?",
      "What can transaction notes be used for?",
    ],
    "recharge-issues": [
      "My recharge payment was deducted but not credited",
      "How long does recharge processing normally take?",
      "Can I cancel a pending recharge?",
      "Why was my recharge attempt declined?",
    ],
    "redeem-amount": [
      "What denominations are available for redemption?",
      "Is there a minimum and maximum redeem amount?",
      "Can I redeem a custom amount?",
    ],  
    "redeem-fee": [
      "What service fee applies to redemptions?",
      "How is the redemption service fee calculated?",
      "Are there any fee-free redeem options?",
      "Can the service fee change based on redemption amount?",
    ],
    "redeem-time": [
      "How long does the redemption process take?",
      "Why is my redemption taking longer than 2 hours?",
      "What causes redemption delays?",
    ],
    "redeem-history": [
      "Where can I see my redemption history?",
      "What does it mean if my redemption is marked as expired?",
      "Can I view the total number of redemption transactions?",
    ],
    "redeem-notes": [
      "How can I add a transaction note during redemption?",
      "What can transaction notes be used for in redemptions?",
    ],
    "wallet-balance": [
      "How to check my current wallet balance?",
      "Why is my balance not updating?",
      "Is there a maximum balance limit for my wallet?",
    ],
    "wallet-cashout": [
      "How does the cashout process work?",
      "What gift cards are available for cashout?",
      "What are the cashout amount restrictions?",
    ],
    "wallet-history": [
      "How can I view my complete wallet transaction history?",
      "What details are shown in the transaction history?",
    ],
    "wallet-instant": [
      "How to use wallet funds for Instant Recharge?",
      "Is there a limit to Instant Recharge amounts?",
      "Are there any fees for using Instant Recharge?",
      "Why can't I access the Instant Recharge option?",
    ],
    "giftcard-manage": [
      "How to view all my gift cards?",
      "How to see my expired gift cards?",
      "How can I find a specific gift card by order ID?",
    ],
    "giftcard-cashout": [
      "How to cashout my wallet balance to a gift card?",
      "Can I select multiple gift cards for a single cashout?",
    ],
    "support-balance": [
      "How do I check my available balance?",
      "What should I do if my balance is incorrect?",
    ],
    "support-giftcard": [
      "What should I do if my gift card is not working?",
      "How to check if a gift card is expired?",
      "Can I replace an expired gift card?",
    ],
    "support-transaction": [
      "How do I verify a transaction issue?",
      "What should I do if a transaction is pending for too long?",
      "Why did my transaction fail?",
    ],
    "account-login": ["Can I sign up directly on GETWAYS?",],
    "account-profile": [
      "What options are available in the profile dropdown?",
      "How do I change my account password?",
      "How do I access the help video ?",
    ],
  };

  let mainOptions, subOptions, finalOptions;

  switch (role) {
    case "Player":
      mainOptions = [...defaultMainOptions];
      subOptions = { ...defaultSubOptions };
      finalOptions = { ...defaultFinalOptions };
      break;

    case "Agent":
      mainOptions = [...defaultMainOptions];
      subOptions = { ...defaultSubOptions };
      finalOptions = { ...defaultFinalOptions };
      break;

    case "Master-Agent":
      mainOptions = [...defaultMainOptions];
      subOptions = { ...defaultSubOptions };
      finalOptions = { ...defaultFinalOptions };
      break;

    case "Super-User":
      mainOptions = [...defaultMainOptions];
      subOptions = { ...defaultSubOptions };
      finalOptions = { ...defaultFinalOptions };
      break;

    default:
      mainOptions = [...defaultMainOptions];
      subOptions = { ...defaultSubOptions };
      finalOptions = { ...defaultFinalOptions };
  }

  return {
    mainOptions,
    subOptions,
    finalOptions,
  };
};
