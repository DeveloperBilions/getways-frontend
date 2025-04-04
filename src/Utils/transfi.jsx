import axios from "axios";
import { Parse } from "parse";
const username = process.env.REACT_APP_TRANSFI_USERNAME;
const password = process.env.REACT_APP_TRANSFI_PASSWORD;
const redirectUrl = process.env.REACT_APP_REDIRECT_URL_TRANSFI;
const basicAuthHeader = "Basic " + btoa(`${username}:${password}`);
Parse.initialize(
  process.env.REACT_APP_APPID,
  process.env.REACT_APP_JAVASCRIPT_KEY,
  process.env.REACT_APP_MASTER_KEY
);
Parse.serverURL = process.env.REACT_APP_URL;
Parse.masterKey = process.env.REACT_APP_MASTER_KEY;

export const processTransfiDeposit = async (
  transactionAmount,
  userId
) => {
  try {
    // Step 1: Fetch from TransfiUserInfo
    const TransfiUserInfo = Parse.Object.extend("TransfiUserInfo");
    const query = new Parse.Query(TransfiUserInfo);
    query.equalTo("userId", userId);
    const userRecord = await query.first({ useMasterKey: true });

    if (!userRecord) {
      throw new Error("User not found in TransfiUserInfo. Please complete KYC first.");
    }

    const kycVerified = userRecord.get("kycVerified");
    if (!kycVerified) {
      throw new Error("KYC is not verified. Please complete KYC to proceed.");
    }

    // Step 2: Get details from Parse record
    const email = userRecord.get("email");
    const firstName = userRecord.get("firstName");
    const lastName = userRecord.get("lastName");

    // Step 3: Place deposit order
    const depositRes = await axios.post(
      "https://sandbox-api.transfi.com/v2/orders/gaming",
      {
        paymentType: "card",
        purposeCode: "fee_payments",
        type: "individual",
        amount: parseFloat(transactionAmount) / 100,
        balanceCurrency: "USDT",
        country: "US",
        currency: "USD",
        email,
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
    console.error("Error in Transfi deposit:", error.response?.data || error.message);
    throw error;
  }
};

export const submitTransfiKyc = async ({
  myuserId,
  email,
  firstName,
  lastName,
  country = "US",
}) => {
  try {
    // Step 1: Check if user exists
    let userExists = false;
    try {
      const checkUserRes = await axios.get(
        "https://sandbox-api.transfi.com/v2/users/individuals",
        {
          params: { email },
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
        throw err; // rethrow unexpected errors
      }
    }

    // Step 2: Create user if not exists
    if (!userExists) {
      await axios.post(
        "https://sandbox-api.transfi.com/v2/users/individual",
        {
          email,
          firstName,
          lastName,
          country,
          date: "20-01-2002", // You can make this dynamic
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

    // Step 3: Submit KYC
    const response = await axios.post(
      "https://sandbox-api.transfi.com/v2/kyc/standard",
      {
        email,
        firstName,
        lastName,
        country,
        redirectUrl,
      },
      {
        headers: {
          Authorization: basicAuthHeader,
          "Content-Type": "application/json",
          accept: "application/json",
        },
      }
    );

    const { userId, redirectUrl: kycRedirectUrl } = response.data;

    // Step 4: Save to Parse
    const TransfiUserInfo = Parse.Object.extend("TransfiUserInfo");
    const transfiRecord = new TransfiUserInfo();

    transfiRecord.set("email", email);
    transfiRecord.set("firstName", firstName);
    transfiRecord.set("lastName", lastName);
    transfiRecord.set("country", country);
    transfiRecord.set("userId", myuserId);
    transfiRecord.set("transfiUserId", userId);
    transfiRecord.set("redirectUrl", kycRedirectUrl);
    transfiRecord.set("kycVerified", false);
    transfiRecord.set("kycStatus", "kyc_pending");

    await transfiRecord.save(null, { useMasterKey: true });

    return { userId, redirectUrl: kycRedirectUrl };
  } catch (error) {
    console.error("Error during Transfi KYC:", error.response?.data || error.message);
    throw error;
  }
};
