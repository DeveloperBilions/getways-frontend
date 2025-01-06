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

export const calculateDataSummaries = ({ id, users, transactions}) => {
  const totalRegisteredUsers = users.filter(
    (item) => !item.userReferralCode
  ).length; //excluding self
  const totalAgents = users.filter(
    (item) => item.roleName === "Agent" //&& item.username !== identity.username
  ).length;
  const totalRechargeAmount =
    transactions.filter((item) => item.status === 2 || item.status === 3)
      .reduce((sum, item) => sum + item.transactionAmount, 0) || 0;
  const totalRedeemAmount =
    transactions.filter((item) => item.status === 4)
      .reduce((sum, item) => sum + item.transactionAmount, 0) || 0;
  const totalPendingRechargeAmount =
    transactions.filter((item) => item.status === 1)
      .reduce((sum, item) => sum + item.transactionAmount, 0) || 0;
  const totalFailRedeemAmount =
    transactions.filter((item) => item.status === 5)
      .reduce((sum, item) => sum + item.transactionAmount, 0) || 0;
  const totalRecords = transactions.length;
  const totalAmt = transactions.reduce((sum, item) => sum + item.transactionAmount, 0) || 0;
  return { 
    data: [{
      id: id,
      totalRegisteredUsers: totalRegisteredUsers,
      totalAgents: totalAgents,
      totalRechargeAmount: totalRechargeAmount,
      totalRedeemAmount: totalRedeemAmount,
      totalPendingRechargeAmount: totalPendingRechargeAmount,
      totalFailRedeemAmount: totalFailRedeemAmount,
      totalRecords: totalRecords,
      totalAmt: totalAmt
    }],
    total: null,
  };
};