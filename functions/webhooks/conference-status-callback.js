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
  const fns = Runtime.getFunctions();
  const conf = require(fns["shared/conf"].path);
  const sync = require(fns["shared/sync"].path);

  const customerPN = event.To;

  sync.updateSession(customerPN, { status: "answered" });

  const session = await sync.getSession(customerPN);

  // a call leg to the conference that dials the dedicated Twilio Pay phone number
  // Twilio Pay will be initiated in webhooks/incoming-call
  await client.conferences(session.confName).participants.create({
    from: session.reservedPN,
    to: conf.getPayPhone(),
  });

  await sync.updateSession(customerPN, {
    attempt: 1,
    paymentStep: conf.paymentSteps[0],
    errorType: "",
  });

  callback(null, {});
}

async function onCallComplete(ctx, event, callback) {
  // get helpers
  const fns = Runtime.getFunctions();
  const sync = require(fns["shared/sync"].path);

  const customerPN = event.To;

  const session = await sync.getSession(customerPN);
  await Promise.allSettled([
    sync.removeReservation(session.reservedPN), // free up reserved phone number
    sync.updateSession(customerPN, { status: event.CallStatus }),
  ]);

  callback(null, {});
}
