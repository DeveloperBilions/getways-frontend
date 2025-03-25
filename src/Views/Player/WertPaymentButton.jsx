import React, { useState } from "react";
import WertWidget from "@wert-io/widget-initializer";

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
        paymentStatus: (status) => {
          console.log("Wert Payment Status:", status);

          // ✅ Store click_id and status in your DB or cloud
          fetch("https://your-backend.com/store-wert-transaction", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              click_id: clickId,
              amount,
              currency: "BTC",
              status,
              createdAt: new Date().toISOString(),
            }),
          });
        },
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
