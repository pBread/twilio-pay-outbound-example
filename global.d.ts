declare namespace NodeJS {
  export interface ProcessEnv {
    ACCOUNT_SID: string;
    AUTH_TOKEN: string;
    DOMAIN_NAME: string;
    PAY_CONNECTOR_NAME: string;
    RESERVATION_TTL: string;
    SYNC_SERVICE_SID: string;
    TWILIO_API_KEY: string;
    TWILIO_API_SECRET: string;
    TWILIO_PAY_PHONE: string;
    TWILIO_PHONE_POOL: string; // stringified array of strings
  }
}

interface PaySessionDocument {
  unique_name: string;
  data: {
    customerPN: string;
    // When a pay session is started, the reservedPN is temporarily reserved for that session. Those
    // reservations are tracked in the Sync Map "reservations"
    // The reservedPN is used as the from number in the the Twilio Pay call leg.
    reservedPN: string;
  };
}
