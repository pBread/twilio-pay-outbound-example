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
  const fns = Runtime.getFunctions();

  const conf = require(fns["shared/conf"].path);
  const sync = require(fns["shared/sync"].path);

  const customerPN = event.customerPN;

  const stepIdx = conf.paymentSteps.indexOf(event.For);
  const paymentStep = conf.paymentSteps[stepIdx + 1] ?? "wrapping-up";

  await sync.updateSession(customerPN, {
    attempt: event.Attempt,
    errorType: event.ErrorType,
    paymentStep,
  });

  callback(null, {});
}
