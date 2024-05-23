// Status callback for Twilio Pay during payment collection, i.e. after the user enters
// credit card number, expiration, etc.
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
  callback(null, {});
}
