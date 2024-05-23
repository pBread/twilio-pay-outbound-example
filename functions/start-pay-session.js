const { ACCOUNT_SID, AUTH_TOKEN } = process.env;
const client = require("twilio")(ACCOUNT_SID, AUTH_TOKEN);

exports.handler = async function handler(ctx, { request, ...event }, callback) {
  try {
    await startPaySession(ctx, event, callback);
  } catch (error) {
    callback(error);
  }
};

async function startPaySession(ctx, event, callback) {}
