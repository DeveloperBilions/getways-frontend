import React, { useState } from "react";
import WertWidget from "@wert-io/widget-initializer";
import Parse from "parse";
Parse.initialize(process.env.REACT_APP_APPID, process.env.REACT_APP_MASTER_KEY);
Parse.serverURL = process.env.REACT_APP_URL;
const WertPaymentButton = () => {
  const [amount, setAmount] = useState("");

  const handleOpenWert = () => {
    if (!amount || isNaN(amount)) {
      alert("Please enter a valid amount.");
      return;
    }

    const clickId = `txn-${Date.now()}`;
    console.log("Wert Payment Status:", clickId);

    const wertWidget = new WertWidget({
      partner_id: "01JQ475DKJCZZWZYED5BY9NC35",
      origin: "https://sandbox.wert.io", // Use production URL in production
      commodity: 'BNB',
      network: 'bsc',
      commodity_amount:amount.toString(),
      commodities: JSON.stringify([
        // {
        //   commodity: 'POL',
        //   network: 'amoy',
        // },
        {
          commodity: 'BNB',
          network: 'bsc',
        },
      ]),
      click_id: clickId,
      redirect_url: "https://yourdomain.com/payment-success",
      listeners: {
        'payment-status': async (status) => {
          console.log("Wert Payment Status:", status);

          if (status === "success") {
            try {
              const currentUser = Parse.User.current();
              if (!currentUser) {
                alert("User not logged in.");
                return;
              }

              const Transaction = Parse.Object.extend("TransactionRecords");
              const txn = new Transaction();

              txn.set("transactionIdFromStripe", clickId);
              txn.set("status", 2); // 2 = success
              txn.set("userId", currentUser.id);
              txn.set("transactionAmount", parseFloat(amount));

              await txn.save(null, { useMasterKey: true });

              console.log("✅ Transaction saved in Parse.");
            } catch (error) {
              console.error("❌ Error saving transaction:", error.message);
            }
          }
        }
        },
    });

    wertWidget.open();
  };

  return (
    <div>
      <input
        type="number"
        placeholder="Enter Amount in BTC"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        style={{ marginRight: "10px" }}
      />
      <button onClick={handleOpenWert}>Pay with Crypto (BTC)</button>
    </div>
  );
};

export default WertPaymentButton;
