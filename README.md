# Twilio Pay Outbound Example

This demo shows how to collect payment information by placing an outbound call to a customer and using [Twilio Pay](https://www.twilio.com/docs/voice/twiml/pay).

_NOTE: The payment method collection flow is not fully built out. After providing fake credit card information, it will simply fail. You will need to implement your payment processing flow to use something like this in production._

## Quick Start

### Download Repo and Install

```bash
git clone https://github.com/pBread/twilio-pay-outbound-example.git
cd twilio-pay-outbound-example

# this project requires node version 18
# see nvm below for installation instructions
nvm install 18
nvm use 18

npm install
```

### Add Env Variables, at least ACCOUNT_SID & AUTH_TOKEN

You need to add the `ACCOUNT_SID` & `AUTH_TOKEN` environment variables. All of the other variables are optional if you are using the `quick-deploy` script. That script will automatically generate all other environment variables on your behalf.

```.env
ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Run Quick Deploy Script

```bash
npm run quick-deploy
```

**WARNING**: This script will create records in your Twilio Account if you leave environment variables undefined.

- If TWILIO_API_KEY or TWILIO_API_SECRET are undefined, an API Key & Secret are created.
- If SYNC_SERVICE_SID is undefined, a new Sync Service will be created.
- If TWILIO_PAY_PHONE is undefined, a new phone number will be procured.
- If TWILIO_PHONE_POOL does not have phone numbers, 2 phone numbers will be procured.

Other than that, the script will always perform the following:

- A SyncMap called "reservations" will be created.
- The incoming-call webhook of the TWILIO_PAY_PHONE will be created.

### Setup Pay Connector

#### Existing Pay Connector

If you already have a Pay Connector and it is not named "Default", you will need to update the [Function's env variable](https://www.twilio.com/docs/serverless/functions-assets/functions/variables) `PAY_CONNECTOR_NAME` to the Pay Connector's Unique Name. See [Setting Environment Variables](https://www.twilio.com/docs/serverless/functions-assets/functions/variables#setting-environment-variables).

Furthermore, you will need to

NOTE: Generic Pay Connectors cannot be modified after being approved. You will

#### New Pay Connector

You will need to create a [Generic Pay Connector](https://www.twilio.com/docs/voice/twiml/pay/generic-pay-connector) and set the endpoint to the to `https://YOUR_FN_DOMAIN/webhooks/pay-connector`.

If you name your pay connector to anything other than `Default`, you will need to update the [Function's env variable](https://www.twilio.com/docs/serverless/functions-assets/functions/variables) `PAY_CONNECTOR_NAME` to the Pay Connector's Unique Name. See [Setting Environment Variables](https://www.twilio.com/docs/serverless/functions-assets/functions/variables#setting-environment-variables).

- Log into your Twilio Account.
- Navigate to Voice > Manage > Pay Connectors.
- Create a Generic Pay Connector
- Name it `Default`
- Set Endpoint URL to `https://YOUR_FN_DOMAIN/webhooks/pay-connector`

## Node Version Manager (NVM)

This project requires node version 18. [NVM](https://github.com/nvm-sh/nvm) is a standard package to manage node versions.

If you don't have NVM, you can easily [install with Homebrew](https://formulae.brew.sh/formula/nvm).

```bash
brew install nvm
```

NVM provides alternative installation instructions, see [Install & Update Scripts](https://github.com/nvm-sh/nvm?tab=readme-ov-file#installing-and-updating)
