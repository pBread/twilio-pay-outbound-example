const { ACCOUNT_SID, AUTH_TOKEN } = process.env;
const client = require("twilio")(ACCOUNT_SID, AUTH_TOKEN);

exports.handler = async function wrapper(ctx, { request, ...event }, callback) {
  try {
    await startPaySession(ctx, event, callback);
  } catch (error) {
    callback(error);
  }
};

async function startPaySession(ctx, event, callback) {
  // helpers
  const fns = Runtime.getFunctions();
  const conf = require(fns["shared/conf"].path);
  const sync = require(fns["shared/sync"].path);
  const util = require(fns["shared/util"].path);

  // query params or body payload
  const customerPN = util.formatPhone(event.customerPN);

  // Orchestrate Session & Reservation Record Creation:
  // - delete old SyncDocument assigned to customer's phone number
  // - removes any SyncMapItems for phone reservation
  await sync.cleanUpSession(customerPN);
  // - reserves a phone number for this pay session by creating SyncMapItem
  const { reservedPN } = await sync.reservePhoneNumber(customerPN);
  // - creates new Sync Document to manage this pay session
  const session = await sync.createSession({
    ...event, // overloaded request parameters are accessible by webhooks
    customerPN,
    reservedPN,
  });

  // Orchestrate Conference Call:
  // - customer is called first, which is what this line does
  // - when customer answers, webhooks/conference-status-callback is executed
  // and calls the Twilio Pay Phone
  // - the webhooks/incoming-call is executed once that 2nd call leg is established
  // and initiates Twilio Pay
  const call = await client.conferences(session.confName).participants.create({
    label: "customer",
    beep: "false",
    statusCallback: `${conf.getHostname()}/webhooks/conference-status-callback`,
    statusCallbackEvent: ["initiated", "ringing", "answered", "completed"],
    record: false,
    from: conf.getPayPhone(), // customer receives call from the same phone number
    to: customerPN,
    waitUrl: "", // no hold music
  });

  callback(null, { call, session });
}
