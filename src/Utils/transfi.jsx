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

export const processTransfiDeposit = async (transactionAmount, userId) => {
  try {
    const result = await Parse.Cloud.run("processTransfiDeposit", {
      transactionAmount,
      userId,
    });
    return result;
  } catch (error) {
    console.error("Error calling processTransfiDeposit:", error.message);
    throw error;
  }
};


export const submitTransfiKyc = async ({
  myuserId,
  email,
  firstName,
  lastName,
  dob,
  country = "US",
}) => {
  try {
    const result = await Parse.Cloud.run("submitTransfiKyc", {
      myuserId,
      email,
      firstName,
      lastName,
      dob,
      country,
    });
    return result;
  } catch (error) {
    console.error("Error calling submitTransfiKyc:", error.message);
    throw error;
  }
};


export const regenerateTransfiKycLink = async (myuserId) => {
  try {
    const result = await Parse.Cloud.run("regenerateTransfiKycLink", {
      myuserId,
    });
    return result;
  } catch (error) {
    console.error("Error calling regenerateTransfiKycLink:", error.message);
    throw error;
  }
};
