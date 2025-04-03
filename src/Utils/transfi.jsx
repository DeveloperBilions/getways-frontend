import axios from "axios";

export const processTransfiDeposit = async (transactionAmount, userEmail, firstName, lastName) => {
  const username = process.env.REACT_APP_TRANSFI_USERNAME;
  const password = process.env.REACT_APP_TRANSFI_PASSWORD;
  const redirectUrl = process.env.REACT_APP_REDIRECT_URL_TRANSFI;

  try {
    const basicAuthHeader = "Basic " + btoa(`${username}:${password}`);

    let userExists = false;

    // Check if user exists
    try {
      const checkUserRes = await axios.get(
        "https://api.transfi.com/v2/users/individuals",
        {
          params: { email: userEmail },
          headers: {
            accept: "application/json",
            authorization: basicAuthHeader,
          },
        }
      );
      userExists = checkUserRes.data?.users?.length > 0;
    } catch (err) {
      if (err.response && err.response.data?.code === "NOT_FOUND") {
        userExists = false;
      } else {
        throw err; // re-throw other unexpected errors
      }
    }

    // If user doesn't exist, create them
    if (!userExists) {
      await axios.post(
        "https://api.transfi.com/v2/users/individual",
        {
          email: userEmail,
          firstName,
          lastName,
          country: "IN",
          date:"20-01-2002"
        },
        {
          headers: {
            accept: "application/json",
            authorization: basicAuthHeader,
            "content-type": "application/json",
          },
        }
      );
    } 

    // Process deposit order
    const depositRes = await axios.post(
      "https://api.transfi.com/v2/orders/gaming",
      {
        paymentType: "card",
        purposeCode: "fee_payments",
        type: "individual",
        amount: parseFloat(transactionAmount) / 100,
        balanceCurrency: "USDT",
        country: "IN",
        currency: "USD",
        email: userEmail,
        firstName,
        lastName,
        redirectUrl,
        sourceUrl: redirectUrl,
      },
      {
        headers: {
          accept: "application/json",
          authorization: basicAuthHeader,
          "content-type": "application/json",
        },
      }
    );
    return depositRes.data;

  } catch (error) {
    console.error("Error in Transfi workflow:", error.response?.data || error.message);
    throw error;
  }
};