import axios from "axios";

const API_URL = "https://api.dev.clkk-api.io/api/partner/checkout/sessions";
const API_KEY = "ckpl_wChpcgGHHobBKfSpRx3FHOahkA5lOTJe4bmTD22RafI"; // Replace with your real key

export async function createCheckoutSession(amount,user) {
  try {
    const response = await axios.post(
      API_URL,
      {
        amount: amount,
        success_url: "https://example.com/success",
        cancel_url: "https://example.com/cancel",
        customer: {
          id: user.objectId,
          name: user.username,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("Checkout Session Created:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating checkout session:", error.response?.data || error.message);
  }
}