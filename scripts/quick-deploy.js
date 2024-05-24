const util = require("./util");
require("dotenv").config();

const client = require("twilio")(
  process.env.ACCOUNT_SID,
  process.env.AUTH_TOKEN
);

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
  statusHistory: ["Starting Quick Deploy"],
  // env variables
  accountSid: process.env.ACCOUNT_SID,

  apiKey: process.env.TWILIO_API_KEY,
  apiSecret: process.env.TWILIO_API_SECRET,
  syncSvcSid: process.env.SYNC_SERVICE_SID,

  apiKeyStatus: process.env.TWILIO_API_KEY ? SS.created : SS.notStarted,
  apiSecretStatus: process.env.TWILIO_API_SECRET ? SS.created : SS.notStarted,
  syncSvcSidStatus: process.env.SYNC_SERVICE_SID ? SS.created : SS.notStarted,

  payPhone: process.env.TWILIO_PAY_PHONE,
  phonePool: undefined,

  payPhoneStatus: process.env.TWILIO_PAY_PHONE ? SS.created : SS.notStarted,
  phonePoolStatus: SS.notStarted,
};

(async () => {
  await initPhonePool();
  const account = await client.api.v2010.accounts(state.accountSid).fetch();
  await setState({ account });
  await checkMakeApiKey();
  await checkMakeSyncSvc();
  await checkMakePayPhone();
  await checkMakePhonePool();

  await setState({ status: "Finished" });
})();

/****************************************************
 Create Records
****************************************************/
async function checkMakeApiKey() {
  await setState({ status: "Checking API key" });

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

async function checkMakeSyncSvc() {
  await setState({ status: "Checking if Sync Service exists" });
  if (state.syncSvcSid)
    await setState({ status: "Sync Service already exists" });
  else {
    try {
      await setState({
        syncSvcSidStatus: SS.working,
        status: "Creating Sync Service",
      });
      const syncSvc = await client.sync.services.create({
        friendlyName: "twilio-pay-sync-service",
      });
      await setState({
        syncSvcSid: syncSvc.sid,
        syncSvcSidStatus: SS.created,
        status: "Successfully created Sync Service",
      });
    } catch (error) {
      await setState({
        syncSvcSidStatus: SS.failed,
        status: "Failed to create Sync Service",
      });
      throw error;
    }
  }

  await setState({ status: "Checking if Sync Service is setup" });
  const curSyncMap = await client.sync.v1
    .services(state.syncSvcSid)
    .syncMaps("reservations")
    .fetch()
    .catch(() => null);

  if (curSyncMap)
    return await setState({
      status: "Sync Service already setup",
      syncSvcSidStatus: SS.done,
    });

  try {
    await setState({
      status: "Configuring Sync Service",
      syncSvcSidStatus: SS.working,
    });
    await client.sync.v1
      .services(state.syncSvcSid)
      .syncMaps.create({ uniqueName: "reservations" });
    await setState({
      status: "Sucessfully configured Sync Service",
      syncSvcSidStatus: SS.done,
    });
  } catch (error) {
    await setState({
      status: "Failed to configure Sync Service",
      syncSvcSidStatus: SS.failed,
    });
  }
}

/****************************************************
 Setup Phones
****************************************************/
async function initPhonePool() {
  try {
    const phones = JSON.parse(process.env.TWILIO_PHONE_POOL);
    if (!Array.isArray(phones)) throw Error("");
    const phonePool = phones.filter(
      (phone) => phone !== process.env.TWILIO_PAY_PHONE
    );

    if (phonePool.length < 2) throw Error("");

    await setState({
      phonePool,
      phonePoolStatus: SS.created,
      status: "Initialized phone pool from env variables.",
    });
  } catch (error) {
    await setState({
      phonePool: undefined,
      phonePoolStatus: SS.notStarted,
      status: "Unable to initialize phone pool from env variables.",
    });
  }
}

async function checkMakePayPhone() {
  await setState({ status: "Checking Pay Phone" });

  if (state.payPhone)
    await setState({
      status: "Pay Phone already created",
      payPhoneStatus: SS.created,
    });
  else {
    await setState({
      status: "Creating Pay Phone",
      payPhoneStatus: SS.working,
    });

    try {
      const availableNumbers = await client
        .availablePhoneNumbers("US")
        .local.list({ limit: 1 });

      const phoneNumber = availableNumbers[0].phoneNumber;

      await client.incomingPhoneNumbers.create({
        friendlyName: "twilio-pay-inbound",
        phoneNumber,
      });

      await setState({
        status: "Successfully created Pay Phone",
        payPhoneStatus: SS.created,
        payPhone: phoneNumber,
      });
    } catch (error) {
      await setState({
        status: "Error creating Pay Phone",
        payPhoneStatus: SS.failed,
      });
    }
  }
}

async function checkMakePhonePool() {
  await setState({ status: "Checking phone pool" });

  if (state.phonePool?.length > 2)
    await setState({
      status: "Phone pool already exists",
      phonePoolStatus: SS.created,
    });
  else {
    await setState({
      status: "Creating phone pool",
      payPhoneStatus: SS.working,
    });

    try {
      const availableNumbers = await client
        .availablePhoneNumbers("US")
        .local.list({ limit: 2 });

      const phoneNumber0 = availableNumbers[0].phoneNumber;
      const phoneNumber1 = availableNumbers[1].phoneNumber;

      await Promise.all([
        client.incomingPhoneNumbers.create({
          friendlyName: "twilio-pay-pool",
          phoneNumber: phoneNumber0,
        }),
        client.incomingPhoneNumbers.create({
          friendlyName: "twilio-pay-pool",
          phoneNumber: phoneNumber1,
        }),
      ]);

      await setState({
        status: "Successfully created phone pool",
        phonePoolStatus: SS.created,
        phonePool: [phoneNumber0, phoneNumber1],
      });
    } catch (error) {
      await setState({
        status: "Error creating phone pool",
        phonePoolStatus: SS.failed,
      });
    }
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
    ["Sync Status", state.syncSvcSidStatus],
    ["Sync Service SID", state.syncSvcSid],
    "separator",
    ["Pay Phone Status", state.payPhoneStatus],
    ["Pay Phone", state.payPhone],
    "blank",
    ["Phone Pool Status", state.phonePoolStatus],
    ["Phone Pool", state.phonePool?.join(", ")],
  ]);

  console.log("\n");

  for (const status of state.statusHistory) console.log(status);
  console.log("\n");
}

async function setState(update = {}) {
  state = { ...state, ...update };
  if (update.status) state.statusHistory.push(update.status);

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
  await util.sleep(1000);
}
