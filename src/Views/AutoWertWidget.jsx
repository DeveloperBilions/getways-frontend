import React, { useEffect } from "react";
import WertWidget from "@wert-io/widget-initializer";
import { signSmartContractData } from "@wert-io/widget-sc-signer";
import { Parse } from "parse";
import { generateScInputData } from "./Player/dialog/GenerateInput";

// Initialize Parse (if not already initialized)
Parse.initialize(process.env.REACT_APP_APPID, process.env.REACT_APP_MASTER_KEY);
Parse.serverURL = process.env.REACT_APP_URL;

const privateKey = "0x2bcb9fc6533713d0705a9f15850a027ec26955d96c22ae02075f3544e6842f74";

const AutoWertWidget = () => {
  useEffect(() => {
    const handleOpenWert = async () => {
      const queryParams = new URLSearchParams(window.location.search);
      const amount = queryParams.get("amount");
      const walletAddr = queryParams.get("walletAddr");
      const userId = queryParams.get("userId");

      if (!amount || isNaN(amount) || !walletAddr || !userId) {
        console.error("Missing or invalid query parameters");
        return;
      }

      const clickId = `txn-${Date.now()}`;
      const path =
        "0x55d398326f99059ff775485246999027b31979550009c4b32d4817908f001c2a53c15bff8c14d8813109be";
      const amountIn = (parseFloat(amount) * Math.pow(10, 18)).toString();
      const amountOutMinimum = "0";
      const recipient = walletAddr
      const scInputData = generateScInputData(
        path,
        recipient,
        amountIn,
        amountOutMinimum
      );

      const signedData = signSmartContractData(
        {
          address: walletAddr,
          commodity: "USDT",
          commodity_amount: amount,
          network: "bsc",
          sc_address: "0x13f4EA83D0bd40E75C8222255bc855a974568Dd4",
          sc_input_data: scInputData,
        },
        privateKey
      );

      try {
        const AOGTransaction = Parse.Object.extend("AOGTransaction");
        const newTxn = new AOGTransaction();

        newTxn.set("clickId", clickId);
        newTxn.set("walletAddress", walletAddr);
        newTxn.set("amount", parseFloat(amount));
        newTxn.set("status", "Pending");
        newTxn.set("date", new Date());
        newTxn.set("userId", userId);

        await newTxn.save(null);
        console.log("✅ Transaction inserted as Pending");
      } catch (err) {
        console.error("❌ Error inserting transaction:", err.message);
      }

      const wertWidget = new WertWidget({
        ...signedData,
        partner_id: "01JS1S88TZANH9XQGZYHDTE9S5",
        origin: "https://widget.wert.io",
        click_id: clickId,
        redirect_url: "https://aogcoin.club/Games/index.php",
        currency: "USD",
        is_crypto_hidden: true,
        listeners: {
          close: () => {
            window.location.href = "https://aogcoin.club/Games/index.php";
          },
          "payment-status": async (status) => {
            console.log("🔁 Wert Payment Status:", status);

            try {
              let updatedStatus = "Pending";

              switch (status?.status) {
                case "success":
                  updatedStatus = "Success";
                  break;
                case "failed":
                  updatedStatus = "Failed";
                  break;
                case "cancelled":
                  updatedStatus = "Cancelled";
                  break;
                case "expired":
                  updatedStatus = "Expired";
                  break;
              }

              const AOGTransaction = Parse.Object.extend("AOGTransaction");
              const query = new Parse.Query(AOGTransaction);
              query.equalTo("clickId", clickId);

              const existingTxn = await query.first({ useMasterKey: true });

              if (existingTxn) {
                existingTxn.set("status", updatedStatus);
                await existingTxn.save(null, { useMasterKey: true });
                console.log(`✅ Transaction status updated to ${updatedStatus}`);
              } else {
                console.warn("⚠️ Transaction not found for clickId:", clickId);
              }

              if (status?.status === "success") {
                window.location.href = "https://aogcoin.club/Games/index.php";
              }
            } catch (err) {
              console.error("❌ Error updating transaction:", err.message);
            }
          },    
        },
      });

      wertWidget.open();
    };

    handleOpenWert();
  }, []);

  return null;
};

export default AutoWertWidget;
