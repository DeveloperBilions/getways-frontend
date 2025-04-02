import axios from 'axios'

// PayPal API Credentials (Replace with actual credentials)
const PAYPAL_CLIENT_ID = process.env.REACT_APP_PAYPAL_CLIENT_ID;
const PAYPAL_SECRET = process.env.REACT_APP_PAYPAL_SECRET;
const PAYPAL_API_URL = process.env.REACT_APP_PAYPAL_URL; // Use "https://api-m.sandbox.paypal.com" for testing

const detectPayPalRecipientType = (recipient) => {
    if (/^\+?[1-9]\d{1,14}$/.test(recipient)) {
      return "PHONE"; // It's a phone number
    } else if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) {
      return "EMAIL"; // It's an email
    }
    return null; // Invalid format
};

export const sendMoneyToPayPal = async (recipientPayPalId, amount, currency = "USD",type) => {
  try {
    if (!recipientPayPalId || !amount || amount <= 0) {
      return { success: false, error: "Invalid recipient or amount." };
    }
    const recipientType = detectPayPalRecipientType(recipientPayPalId);
    if (!recipientType) {
      return { success: false, error: "Invalid PayPal ID format (must be email or phone)." };
    }

    // Get PayPal access token
    const authResponse = await axios.post(
      `${PAYPAL_API_URL}/v1/oauth2/token`,
      "grant_type=client_credentials",
      {
        auth: { username: PAYPAL_CLIENT_ID, password: PAYPAL_SECRET },
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    const accessToken = authResponse.data.access_token;

    // Create PayPal Payout
    const payoutResponse = await axios.post(
      `${PAYPAL_API_URL}/v1/payments/payouts`,
      {
        sender_batch_header: {
          sender_batch_id: `batch_${Date.now()}`,
          email_subject: "You have received a payout!",
        },
        items: [
          {
            recipient_type: recipientType,
            receiver: recipientPayPalId,
            amount: {
              value: amount.toFixed(2),
              currency: currency,
            },
            note: "Payout for your transaction",
            recipient_wallet: type
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    if (payoutResponse.data.batch_header.batch_status === "SUCCESS" || payoutResponse.data.batch_header.batch_status === "PENDING") {
      return {
        success: true,
        payoutBatchId: payoutResponse.data.batch_header.payout_batch_id,
        paypalStatus:payoutResponse.data.batch_header.batch_status
      };
    } else {
      return { success: false, error: "PayPal payout failed." };
    }
  } catch (error) {
    console.log(error,"paypalerrro")

    console.error("PayPal Payout Error:", error.response?.data || error.message);
    return { success: false, error: error.message };
  }
};

