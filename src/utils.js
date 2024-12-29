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