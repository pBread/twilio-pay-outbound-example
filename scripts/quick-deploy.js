/****************************************************
 Quick Deploy Script

****************************************************/
const {
  IncomingPhoneNumberInstance,
} = require("twilio/lib/rest/api/v2010/account/incomingPhoneNumber");
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

let state = {
  accountSid: ACCOUNT_SID,
  authToken: AUTH_TOKEN,

  account: undefined,

  apiKey: TWILIO_API_KEY,
  apiSecret: TWILIO_API_SECRET,

  syncSvcSid: SYNC_SERVICE_SID,

  payPhone: TWILIO_PAY_PHONE,
  phonePool: makePhonePool(),
};

const setState = async (update = {}) => {
  state = { ...state, ...update };

  let env = {};
  if (update.apiKey) env["TWILIO_API_KEY"] = update.apiKey;
  if (update.apiSecret) env["TWILIO_API_SECRET"] = update.apiSecret;
  if (update.syncSvcSid) env["SYNC_SERVICE_SID"] = update.syncSvcSid;
  if (update.payPhone) env["TWILIO_PAY_PHONE"] = update.payPhone;
  if (update.phonePool)
    env["TWILIO_PHONE_POOL"] = JSON.stringify(update.phonePool);

  if (Object.keys(env).length) util.updateEnvFile(env);

  await render();
};

const client = require("twilio")(ACCOUNT_SID, AUTH_TOKEN);

(async () => {
  await manageAccount();
  await manageApiKey();
  await manageSyncService();
  await setupSyncService();
  await procurePhones();
})();

async function manageAccount() {
  if (!ACCOUNT_SID || !AUTH_TOKEN)
    throw Error(
      `Missing required env variables: ACCOUNT_SID and/or AUTH_TOKEN`
    );

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

  try {
    const apiKeyResult = await client.newKeys.create({
      friendlyName: "twilio-pay-example",
    });

    const apiKey = apiKeyResult.sid;
    const apiSecret = apiKeyResult.secret;

    setState({ apiKey, apiSecret });
  } catch (error) {
    console.error("Unable to create API Key");
    throw error;
  }
}

async function manageSyncService() {
  if (state.syncSvcSid) return;

  try {
    const syncSvc = await client.sync.services.create({
      friendlyName: "twilio-pay-sync-service",
    });
    setState({ syncSvcSid: syncSvc.sid });
  } catch (error) {
    console.error("Unable to create Sync Service");
    throw error;
  }
}

async function setupSyncService() {
  console.log("checking if reservations SyncMap exists");

  const curSyncMap = await client.sync.v1
    .services(state.syncSvcSid)
    .syncMaps("reservations")
    .fetch()
    .catch(() => null);

  if (curSyncMap) return console.log("reservations SyncMap already exists");

  console.log("creating a SyncMap to track phone reservations....");
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
    ["Has API Key", !!state.apiKey && !!state.apiSecret],
    "blank",
    ["Sync Service SID", state.syncSvcSid],
  ]);

  const warnings = [];

  if (state.warnApiKey)
    warnings.push(
      `You will need to create a Twilio API Key and add the TWILIO_API_KEY & TWILIO_API_SECRET to environment variables to your Twilio Function. See https://www.twilio.com/docs/iam/api-keys#create-an-api-key`
    );
  if (state.warnSyncSvc)
    warnings.push(
      `You will need to create a Sync Service and add the SYNC_SERVICE_SID to the Function's env variables`
    );

  for (let i = 0; i < warnings.length; i++) {
    if (i === 0) console.log("\n\nMessages:");
    const warning = `(${i + 1})  ` + warnings[i];
    console.log(warning);
  }

  console.log("\n\n");
}
