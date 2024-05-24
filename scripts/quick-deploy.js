const util = require("./util");
require("dotenv").config();

const SS = {
  notStarted: "Not Started",
  working: "Working",
  created: "Created",
  done: "Done",
  failed: "Failed",
};

let state = {
  account: null,
  status: "Starting Quick Deploy",
  // env variables
  accountSid: process.env.ACCOUNT_SID,

  apiKey: process.env.TWILIO_API_KEY,
  apiSecret: process.env.TWILIO_API_SECRET,
  syncSvcSid: process.env.SYNC_SERVICE_SID,

  apiKeyStatus: process.env.TWILIO_API_KEY ? SS.created : SS.notStarted,
  apiSecretStatus: process.env.TWILIO_API_SECRET ? SS.created : SS.notStarted,
  syncSvcSidStatus: process.env.SYNC_SERVICE_SID ? SS.created : SS.notStarted,
};

(async () => {
  const account = await client.api.v2010.accounts(ACCOUNT_SID).fetch();
  await setState({ account });
  await checkMakeApiKey();
})();

/****************************************************
 Create Records
****************************************************/
async function checkMakeApiKey() {
  setState({ status: "Checking API key" });

  if (state.apiKey && state.apiSecret)
    return setState({
      apiKeyStatus: SS.done,
      apiSecretStatus: SS.done,
      status: "API Key already created",
    });

  await setState({
    apiKeyStatus: SS.working,
    apiSecretStatus: SS.working,
    status: "Generating new API Key",
  });

  try {
    const apiKeyResult = await client.newKeys.create({
      friendlyName: "twilio-pay-example",
    });
    const apiKey = apiKeyResult.sid;
    const apiSecret = apiKeyResult.secret;
    setState({
      apiKey,
      apiSecret,
      apiKeyStatus: SS.done,
      apiSecretStatus: SS.done,
      status: "API Key created",
    });
  } catch (error) {
    setState({
      apiKeyStatus: SS.failed,
      apiSecretStatus: SS.failed,
      status: "API key generation failed",
    });
  }
}

/****************************************************
 Misc
****************************************************/
async function render() {
  console.clear();
  util.printTable([
    ["Status", state.status],
    "separator",
    ["Account SID", state.accountSid],
    ["Account Name", state.account?.friendlyName],
    "separator",
    ["API Key Status", state.apiKeyStatus],
    ["API Secret Status", state.apiSecretStatus],
    ["API Key", state.apiKey],
    "separator",
  ]);

  console.log("\n\n");
}

async function setState(update = {}) {
  state = { ...state, ...update };

  // update env file
  let env = {};
  if (update.apiKey) env["TWILIO_API_KEY"] = update.apiKey;
  if (update.apiSecret) env["TWILIO.API_SECRET"] = update.apiSecret;
  if (update.syncSvcSid) env["SYNC_SERVICE_SID"] = update.syncSvcSid;
  if (update.payPhone) env["TWILIO_PAY_PHONE"] = update.payPhone;
  if (update.phonePool)
    env["TWILIO_PHONE_POOL"] = JSON.stringify(update.phonePool);

  if (Object.keys(env).length) return util.updateEnvFile(env);

  // print to console
  await render();
}
