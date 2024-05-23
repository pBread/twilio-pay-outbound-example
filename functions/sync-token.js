const crypto = require("crypto");

const AccessToken = require("twilio").jwt.AccessToken;
const SyncGrant = AccessToken.SyncGrant;

const { ACCOUNT_SID, SYNC_SERVICE_SID, TWILIO_API_KEY, TWILIO_API_SECRET } =
  process.env;

exports.handler = async function handler(ctx, event, callback) {
  const identity = event.identity ?? crypto.randomUUID();

  const syncGrant = new SyncGrant({ serviceSid: SYNC_SERVICE_SID });

  const token = new AccessToken(
    ACCOUNT_SID,
    TWILIO_API_KEY,
    TWILIO_API_SECRET,
    { identity }
  );
  token.addGrant(syncGrant);

  callback(null, { identity, token: token.toJwt() });
};
