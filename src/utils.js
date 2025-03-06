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
  const totalRecords = transactions.length;
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
  ).length;
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
  const getUserName = (userId) => {
    const user = users.find((user) => user.id === userId);
    return user ? user.username : "Unknown";
  };
  const totalRedeemByTypeData = {
    wallet: transactions
      .filter(
        (item) =>
          item.type === "redeem" && (item.status === 4 || item.status === 8)
      )
      .map((item) => ({
        transactionId: item.id,
        amount: item.transactionAmount,
        status: item.status,
        paymentType: "redeem",
        transactionIdFromStripe: item?.transactionIdFromStripe,
        transactionDate: item?.transactionDate,
        redeemServiceFee: item?.redeemServiceFee,
        agentName: getUserParentName(item?.userId),
        userName: getUserName(item?.userId),
      })),
    others: transactions
      .filter((item) => item.type === "redeem" && item.status === 12)
      .map((item) => ({
        transactionId: item.id,
        amount: item.transactionAmount,
        status: item.status,
        paymentType: "cashout",
        transactionIdFromStripe: item?.transactionIdFromStripe,
        transactionDate: item?.transactionDate,
        redeemServiceFee: item?.redeemServiceFee,
        agentName: getUserParentName(item?.userId),
        userName: getUserName(item?.userId),
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
        amount: item.transactionAmount,
        date: item.date,
        status: item.status,
        paymentType: "wallet",
        transactionIdFromStripe: item?.transactionIdFromStripe,
        transactionDate: item?.transactionDate,
        agentName: getUserParentName(item?.userId),
        userName: getUserName(item?.userId),
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
        amount: item.transactionAmount,
        date: item.date,
        status: item.status,
        paymentType: "others",
        transactionIdFromStripe: item?.transactionIdFromStripe,
        transactionDate: item?.transactionDate,
        agentName: getUserParentName(item?.userId),
        userName: getUserName(item?.userId),
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


export const calculateDataSummariesForSummary = ({ id, users,walletBalances }) => {

  const totalBalance = users.reduce((sum, user) => {
    return sum + (walletBalances[user?.id] || 0);
  }, 0);
  // const referenceDate = new Date("2025-01-17"); // Reference date (17th Jan)
  console.log(users);
  const totalRegisteredUsers = users.filter(
    (item) => !item.userReferralCode
  ).length; //excluding self
  const totalAgents = users.filter(
    (item) => item.roleName === "Agent" //&& item.username !== identity.username
  ).length;

  return {
    data: [
      {
        id: id,
        totalRegisteredUsers: totalRegisteredUsers,
        totalAgents: totalAgents,
        walletBalances,
        totalBalance,
      },
    ],
    total: null,
  };
};