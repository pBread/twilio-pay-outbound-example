const { ACCOUNT_SID, AUTH_TOKEN } = process.env;
const client = require("twilio")(ACCOUNT_SID, AUTH_TOKEN);

exports.handler = async function wrapper(ctx, event, callback) {
  try {
    switch (event.CallStatus) {
      case "completed":
        return onCallComplete(ctx, event, callback);

      case "in-progress":
        return onUserAnswer(ctx, event, callback);

      case "initiated":
      case "ringing":
        const fns = Runtime.getFunctions();
        const sync = require(fns["shared/sync"].path);
        const customerPN = event.To;
        // update session SyncDoc with call status, which is available in user interface
        await sync.updateSession(customerPN, { status: event.CallStatus });

      default:
        callback(null, {});
    }
  } catch (error) {
    console.error(error);
    callback(error);
  }
};

async function onUserAnswer(ctx, event, callback) {
  callback(null, {});
}

async function onCallComplete(ctx, event, callback) {
  callback(null, {});
}
