// Webhook for payment connector endpoint, which is configured in the Twilio Console.
// This may not be necessary depending on your implementation.

const crypto = require("crypto");

exports.handler = async function handler(ctx, event, callback) {
  console.log("/webhooks/pay-connector", event);

  switch (event.method) {
    case "charge":
      return callback(null, {
        charge_id: crypto.randomUUID(),
        error_code: null,
        error_message: null,
      });
    case "tokenize":
      return callback(null, {
        token_id: crypto.randomUUID(),
        error_code: null,
        error_message: null,
      });
  }
};
