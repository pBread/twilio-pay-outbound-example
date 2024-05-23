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
  accountSid: ACCOUNT_SID,
  authToken: AUTH_TOKEN,

  account: undefined,
  accountName() {
    return this.account?.friendlyName;
  },
};
const setState = async (update = {}) => {
  state = { ...state, ...update };
  await render();
};

let client = require("twilio")(ACCOUNT_SID, AUTH_TOKEN);

(async () => {
  await manageAccount();
  await askQuestion("hello");
  rl.close();
})();

async function manageAccount() {
  const account = await client.api.v2010.accounts(ACCOUNT_SID).fetch();
  await setState({ account });
}

async function render() {
  console.clear();
  util.printTable([
    ["Account SID", state.accountSid],
    state.accountName.accountName && ["Account Name", state.accountName],
    null,
  ]);
}
