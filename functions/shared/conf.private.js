const {
  DOMAIN_NAME,
  SYNC_SERVICE_SID,
  RESERVATION_TTL,
  TWILIO_PAY_PHONE,
  TWILIO_PHONE_POOL,
} = process.env;

module.exports = {
  getHostname: () => `https://${DOMAIN_NAME}`,
  getPayPhone: () => TWILIO_PAY_PHONE,
  getPhonePool,
  getReservationTTL: () => parseInt(RESERVATION_TTL),
  getSyncSvcSid: () => SYNC_SERVICE_SID,

  paymentSteps: [
    "payment-card-number",
    "expiration-date",
    "postal-code",
    "security-code",
  ],
};

function getPhonePool() {
  try {
    const phones = JSON.parse(TWILIO_PHONE_POOL);
    if (!Array.isArray(phones)) throw Error("");
    return phones.filter((phone) => phone !== TWILIO_PAY_PHONE);
  } catch (error) {
    throw Error(`\
Invalid env variable: TWILIO_PHONE_POOL.

It must be a stringified JSON array of strings, like so...
TWILIO_PHONE_POOL=["+18885550001","+18885550002"]

Received...
TWILIO_PHONE_POOL=${TWILIO_PHONE_POOL}`);
  }
}
