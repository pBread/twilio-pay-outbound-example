/****************************************************
 Quick Deploy Script

****************************************************/
const util = require("./util");
require("dotenv").config();
const rl = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true,
});

const ask = async (question) =>
  new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });

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

let state = {
  warnings: [],
  accountSid: ACCOUNT_SID,
  authToken: AUTH_TOKEN,

  account: undefined,

  apiKey: TWILIO_API_KEY,
  apiSecret: TWILIO_API_SECRET,

  syncSvcSid: SYNC_SERVICE_SID,
};
const setState = async (update = {}) => {
  state = { ...state, ...update };
  await render();
};

let client = require("twilio")(ACCOUNT_SID, AUTH_TOKEN);

(async () => {
  await manageAccount();
  await manageApiKey();

  rl.close();
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

  const answer = await ask(
    `You have not provided an API Key. Would you like to create an API key now? (y or n, default = y)`
  );

  const doCreateApiKey = evalYesNo(answer);

  if (!doCreateApiKey)
    setState({
      warnings: state.warnings.concat(`\
You have not defined an API key. You will need to create one and add the TWILIO_API_KEY & TWILIO_API_SECRET to environment variables to your Twilio Function.`),
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
    throw error;
  }
}

function evalYesNo(answer) {
  if (!answer) answer = "y";
  answer = answer.trim().toLowerCase();

  if (answer === "y" || answer === "yes") return true;
  if (answer === "n" || answer === "no") return false;

  throw Error("Invalid Reponse");
}

async function render() {
  console.clear();
  util.printTable([
    ["Account SID", state.accountSid],
    ["Account Name", state.account?.friendlyName],
    "separator",
    ["Has API Key", !!state.apiKey && !!state.apiSecret],
  ]);

  for (let i = 0; i < state.warnings.length; i++) {
    if (i === 0) console.log("\n\nMessages:");
    const warning = `(${i + 1})  ` + state.warnings[i];
    console.log(warning);
  }

  console.log("\n\n");
}
