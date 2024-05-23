// Webhook is called after the payment session is complete. This might not be necessary
// depending on your Pay implementation.
// This callback is referenced in webhooks/incoming-call when Twilio Pay is initated

const { ACCOUNT_SID, AUTH_TOKEN } = process.env;
const client = require("twilio")(ACCOUNT_SID, AUTH_TOKEN);

exports.handler = async function wrapper(ctx, event, callback) {
  try {
    return handler(ctx, event, callback);
  } catch (error) {
    console.error(error);
    callback(error);
  }
};

async function handler(ctx, event, callback) {
  // add your pay result logic here
  // ...
  callback(null, {});
}
