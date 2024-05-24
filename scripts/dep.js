/****************************************************
 Quick Deploy Script

****************************************************/
const util = require("./util");
require("dotenv").config();

const {
  ACCOUNT_SID,
  AUTH_TOKEN,
  DOMAIN_NAME,
  PAY_CONNECTOR_NAME,
  RESERVATION_TTL,
  SYNC_SERVICE_SID,
  TWILIO_API_KEY,
  TWILIO_API_SECRET,
  TWILIO_PAY_PHONE,
  TWILIO_PHONE_POOL,
} = process.env;

function makePhonePool() {
  try {
    const phones = JSON.parse(TWILIO_PHONE_POOL);
    if (!Array.isArray(phones)) throw Error("");
    return phones.filter((phone) => phone !== TWILIO_PAY_PHONE);
  } catch (error) {}

  return [];
}

const statuses = {
  notStarted: "Not Started",
  working: "Working",
  done: "Done",
  failed: "Failed",

  created: "Service Created",

  procuring: "Procuring",
  procured: "Procured",
};

let state = {
  accountSid: ACCOUNT_SID,
  authToken: AUTH_TOKEN,

  account: undefined,

  apiKey: TWILIO_API_KEY,
  apiSecret: TWILIO_API_SECRET,

  syncSvcSid: SYNC_SERVICE_SID,

  payPhone: TWILIO_PAY_PHONE,
  phonePool: makePhonePool(),

  apiKeyStatus: TWILIO_API_KEY ? statuses.done : statuses.notStarted,
  apiSecretStatus: TWILIO_API_SECRET ? statuses.done : statuses.notStarted,
  syncSvcSidStatus: SYNC_SERVICE_SID ? statuses.created : statuses.notStarted,
  payPhoneStatus: TWILIO_PAY_PHONE ? statuses.procured : statuses.notStarted,
  phonePoolStatus: makePhonePool()?.length
    ? statuses.statuses.procured
    : statuses.notStarted,
};

const setState = async (update = {}) => {
  state = { ...state, ...update };

  let env = {};
  if (update.apiKey) {
    env["TWILIO_API_KEY"] = update.apiKey;
    state.apiKeyStatus = statuses.done;
  }
  if (update.apiSecret) {
    env["TWILIO_API_SECRET"] = update.apiSecret;
    state.apiKeyStatus = statuses.done;
  }
  if (update.syncSvcSid) {
    env["SYNC_SERVICE_SID"] = update.syncSvcSid;
  }
  if (update.payPhone) {
    env["TWILIO_PAY_PHONE"] = update.payPhone;
  }
  if (update.phonePool) {
    env["TWILIO_PHONE_POOL"] = JSON.stringify(update.phonePool);
  }
  if (Object.keys(env).length) util.updateEnvFile(env);

  await render();
};

const client = require("twilio")(ACCOUNT_SID, AUTH_TOKEN);

(async () => {
  if (!ACCOUNT_SID || !AUTH_TOKEN)
    throw Error(
      `Missing required env variables: ACCOUNT_SID and/or AUTH_TOKEN`
    );

  await getAccount();
  await manageApiKey();
  await manageSyncService();
  await setupSyncService();
  await procurePhones();
})();

async function getAccount() {
  try {
    const account = await client.api.v2010.accounts(ACCOUNT_SID).fetch();
    await setState({ account });
  } catch (error) {
    console.error(
      "Unable to fetch account. Check your ACCOUNT_SID & AUTH_TOKEN"
    );
    throw error;
  }
}

async function manageApiKey() {
  if (state.apiKey && state.apiSecret) return;
  setState({
    apiKeyStatus: statuses.working,
    apiSecretStatus: statuses.working,
  });

  try {
    const apiKeyResult = await client.newKeys.create({
      friendlyName: "twilio-pay-example",
    });

    const apiKey = apiKeyResult.sid;
    const apiSecret = apiKeyResult.secret;

    setState({ apiKey, apiSecret });
  } catch (error) {
    console.error("Unable to create API Key");
    setState({
      apiKeyStatus: statuses.failed,
      apiSecretStatus: statuses.failed,
    });
    throw error;
  }
}

async function manageSyncService() {
  if (state.syncSvcSid) return;

  setState({ syncSvcSidStatus: statuses.working });
  try {
    const syncSvc = await client.sync.services.create({
      friendlyName: "twilio-pay-sync-service",
    });
    setState({ syncSvcSid: syncSvc.sid, syncSvcSidStatus: "Service Created" });
  } catch (error) {
    setState({ syncSvcSidStatus: statuses.failed });

    console.error("Unable to create Sync Service");
    throw error;
  }
}

async function setupSyncService() {
  setState({ syncSvcSidStatus: "Configuring" });

  const curSyncMap = await client.sync.v1
    .services(state.syncSvcSid)
    .syncMaps("reservations")
    .fetch()
    .catch(() => null);

  if (curSyncMap) return console.log("reservations SyncMap already exists");

  try {
    await client.sync.v1
      .services(state.syncSvcSid)
      .syncMaps.create({ uniqueName: "reservations" });

    console.log("success! created SyncMap to track phone reservations");
  } catch (error) {
    console.error("unable to create SyncMap");
  }
}

async function procurePhones() {
  if (state.payPhone) return;

  const availableNumbers = await client
    .availablePhoneNumbers("US")
    .local.list();

  const [payPhone, ...phonePool] = await Promise.all([
    client.incomingPhoneNumbers.create({
      friendlyName: "twilio-pay-inbound",
      phoneNumber: availableNumbers[0].phoneNumber,
    }),
    client.incomingPhoneNumbers.create({
      friendlyName: "twilio-pay-pool",
      phoneNumber: availableNumbers[1].phoneNumber,
    }),
    client.incomingPhoneNumbers.create({
      friendlyName: "twilio-pay-pool",
      phoneNumber: availableNumbers[2].phoneNumber,
    }),
  ]);

  await setState({
    payPhone: payPhone.phoneNumber,
    phonePool: phonePool.map((phone) => phone.phoneNumber),
  });
}

async function render() {
  console.clear();
  util.printTable([
    ["Account SID", state.accountSid],
    ["Account Name", state.account?.friendlyName],
    "separator",
    ["API Key Status", state.apiKeyStatus],
    ["API Secret Status", state.apiSecretStatus],
    "blank",
    ["Sync Status", state.syncSvcSidStatus],
    ["Sync Service SID", state.syncSvcSid],
    "blank",
  ]);

  console.log("\n\n");
}
