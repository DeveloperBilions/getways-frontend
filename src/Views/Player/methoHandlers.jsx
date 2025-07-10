export const methodHandlers = {
    stripe: async () => {
      navigate("/stripe-payment", { state: { rechargeAmount, remark } });
    },
  
    paynearme: async () => {
      navigate("/paynearme-payment", { state: { rechargeAmount, remark } });
    },
  
    payarc: async () => {
      navigate("/payment-checkout", { state: { rechargeAmount } });
    },
  
    coinbase: async () => {
      const encodedAddresses = encodeURIComponent(
        JSON.stringify({ [identity.walletAddr]: ["base"] })
      );
      const buyUrl = `https://pay.coinbase.com/buy/select-asset?appId=${projectId}&addresses=${encodedAddresses}&defaultAsset=USDC&defaultPaymentMethod=CARD&presetCryptoAmount=${rechargeAmount}`;
  
      const TransactionDetails = Parse.Object.extend("TransactionRecords");
      const transactionDetails = new TransactionDetails();
      const user = await Parse.User.current()?.fetch();
  
      transactionDetails.set("type", "recharge");
      transactionDetails.set("gameId", "786");
      transactionDetails.set("username", identity?.username || "");
      transactionDetails.set("userId", identity?.objectId);
      transactionDetails.set("transactionDate", new Date());
      transactionDetails.set("transactionAmount", rechargeAmount);
      transactionDetails.set("remark", remark);
      transactionDetails.set("useWallet", false);
      transactionDetails.set("userParentId", user?.get("userParentId") || "");
      transactionDetails.set("status", 1);
      transactionDetails.set("portal", "Coinbase");
      transactionDetails.set("referralLink", buyUrl);
      transactionDetails.set("transactionIdFromStripe", buyUrl);
      transactionDetails.set("walletAddr", identity?.walletAddr);
  
      await transactionDetails.save(null, { useMasterKey: true });
  
      const popup = window.open(buyUrl, "_blank");
      if (!popup || popup.closed || typeof popup.closed === "undefined") {
        setPopupBlocked(true);
        setPopupDialogOpen(true);
      }
    },
  
    instant: async () => {
      setRechargeDialogOpen(true);
    },
  
    crypto: async () => {
      setRechargeLinkDialogOpen(true);
    },
  };
  