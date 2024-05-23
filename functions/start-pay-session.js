const { ACCOUNT_SID, AUTH_TOKEN } = process.env;
const client = require("twilio")(ACCOUNT_SID, AUTH_TOKEN);

exports.handler = async function wrapper(ctx, { request, ...event }, callback) {
  try {
    await handler(ctx, event, callback);
  } catch (error) {
    callback(error);
  }
};

async function handler(ctx, event, callback) {}
