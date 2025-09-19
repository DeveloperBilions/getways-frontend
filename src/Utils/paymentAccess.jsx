import { Parse } from 'parse';

export const isPaymentMethodAllowed = async (userParentId, methodKey) => {
  if (!userParentId || !methodKey) return false;
  try {
    const query = new Parse.Query("Settings");
    query.equalTo("type", `allowedAgentsFor_${methodKey}`);
    const obj = await query.first({ useMasterKey: true });
    const allowedIds = obj?.get("settings") || [];
    return allowedIds.includes(userParentId);
  } catch (err) {
    console.error(`Error checking access for ${methodKey}:`, err);
    return false;
  }
};

export const isCashoutMethodAllowed = async (userParentId, methodKey) => {
  if (!userParentId || !methodKey) return false;
  try {
    const query = new Parse.Query("Settings");
    query.equalTo("type", `allowedCashoutAgentsFor_${methodKey}`);
    const obj = await query.first({ useMasterKey: true });
    const allowedIds = obj?.get("settings") || [];
    return allowedIds.includes(userParentId);
  } catch (err) {
    console.error(`Error checking cashout access for ${methodKey}:`, err);
    return false;
  }
};
