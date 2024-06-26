// This webhook manages incoming calls for the dedicated Twilio Pay phone number.
// Essentially, a Twilio conference is established and, once the customer answers,
// that conference calls a phone number connected to this webhook.

// This webhook is responsible for starting Twilio Pay.

exports.handler = async function wrapper(ctx, event, callback) {
  try {
    return handler(ctx, event, callback);
  } catch (error) {
    console.error(error);
    callback(error);
  }
};

async function handler(ctx, event, callback) {
  // helpers
  const fns = Runtime.getFunctions();
  const conf = require(fns["shared/conf"].path);
  const promptMap = require(fns["shared/prompts"].path);
  const sync = require(fns["shared/sync"].path);

  // the From number is used as a key to find the session
  const reservedPN = event.From;
  const reservation = await sync.getPhoneReservation(reservedPN);
  if (!reservation) throw Error("Unable to find reservation");

  const session = await sync.getSession(reservation.customerPN);
  const qStr = `?customerPN=${encodeURIComponent(session.customerPN)}`;

  const twiml = new Twilio.twiml.VoiceResponse();

  const langAbv = session.language ?? "en";
  const promptConf = promptMap[langAbv];

  const pay = twiml.pay({
    action: `${conf.getHostname()}/webhooks/pay-action${qStr}`,
    chargeAmount: `${session.amount}`,
    method: "charge",
    language: promptConf.language ?? "en-US",
    paymentConnector: conf.getPayConnectorName() || "default",
    statusCallback: `${conf.getHostname()}/webhooks/pay-status-callback${qStr}`,
  });

  // OPTIONAL: this allows you to control the payment flow, scripts, etc.
  const voice = promptConf.voice;
  for (const step in promptConf.script) {
    pay.prompt({ for: step }).say({ voice }, promptConf.script[step]);
  }

  callback(null, twiml);
}
