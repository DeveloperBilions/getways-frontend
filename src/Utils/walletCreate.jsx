import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_ONLINEWALLET_API_BASE_URL; // Ensure this is set in your .env file
const API_KEY = process.env.REACT_APP_ONLINEWALLET; // API Key from OnlineCheckWriter
const API_SECRET = process.env.REACT_APP_ONLINEWALLET_SECRET; // API Secret Key

const headers = {
  Authorization: `Bearer ${API_KEY}`,
  "OCW-Api-Secret": API_SECRET,
  "Content-Type": "application/json",
};

// Create Virtual Card
export const createVirtualCard = async (walletId, memo, note, destination,amount) => {
  try {
    const payload = {
      source: {
        accountType: "wallet",
        accountId: walletId, // Dynamic wallet ID
      },
      destination: {
        name: destination.name,
        company: destination.company,
        address1: destination.address1,
        address2: destination.address2,
        city: destination.city,
        state: destination.state,
        zip: destination.zip,
        phone: destination.phone,
        email: destination.email,
      },
      payment_details: {
        amount,
        memo,
        note,
      },
    };

    const response = await axios.post(`${API_BASE_URL}/quickpay/virtualcard`, payload, { headers });

    return response.data;
  } catch (error) {
    console.log(error,"errorFrom virtualCard")
    console.error("Error creating virtual card:", error.response?.data?.errorMsg || error.message);
    throw error;
  }
};
