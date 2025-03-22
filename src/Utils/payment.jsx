import axios from "axios";

const createNowPaymentsPayment = async (transactionAmount, id, username) => {
  try {
    const response = await axios.post(
      "https://api.nowpayments.io/v1/payment",
      {
        price_amount: parseFloat(transactionAmount),
        price_currency: "usd", // Change if required
        pay_currency: "btc",   // You can change this to any crypto they support
        ipn_callback_url: `${process.env.REACT_APP_REDIRECT_URL}`, // callback if needed
        order_id: `ORDER-${id}-${Date.now()}`, // dynamic order ID
        order_description: `Payment by ${username}`,
      },
      {
        headers: {
          "x-api-key": "TE7J7PP-N3TMNNH-P1EBJRF-2BTPFAM", // Store API key in env
          "Content-Type": "application/json",
        },
      }
    );
      console.log(response.data ,"response from the url ")
    const {  payment_id } = response.data;

    transactionDetails.set("status", 1); // Pending
    transactionDetails.set("referralLink", `https://nowpayments.io/payment/?iid=${payment_id}`); // Payment link from NOWPayments
    transactionDetails.set("transactionIdFromNowPayments", payment_id);

    return response.data;
  } catch (error) {
    console.error("NOWPayments API error:", error.response?.data || error.message);
    throw error;
  }
};
