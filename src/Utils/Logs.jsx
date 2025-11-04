import { Parse } from "parse";
Parse.initialize(
  process.env.REACT_APP_APPID,
  process.env.REACT_APP_JAVASCRIPT_KEY,
  process.env.REACT_APP_MASTER_KEY
);
Parse.serverURL = process.env.REACT_APP_URL;
Parse.masterKey = process.env.REACT_APP_MASTER_KEY;
export async function logTransactionChange({
  originalTxn,
  updatedTxn,
  sourceFunction,
}) {
  const TransactionRecordsLog = Parse.Object.extend("TransactionRecordsLog");
  const log = new TransactionRecordsLog();

  log.set("transaction", originalTxn);
  log.set("beforeData", originalTxn.toJSON());
  log.set("afterData", updatedTxn.toJSON());
  log.set("sourceFunction", sourceFunction);

  await log.save(null, { useMasterKey: true });
}
