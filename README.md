# Twilio Pay Outbound Example

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

You need to add the ACCOUNT_SID & AUTH_TOKEN environment variables. All of the other variables are optional if you are using the `quick-deploy` script. That script will automatically generate all other environment variables on your behalf.

```.env
ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Run Quick Deploy Script

_WARNING: this script will create services, procure phone numbers, and create API Keys in your Twilio Account._

```bash
npm run quick-deploy
```

## Node Version Manager (NVM)

This project requires node version 18. [NVM](https://github.com/nvm-sh/nvm) is a standard package to manage node versions.

If you don't have NVM, you can easily [install with Homebrew](https://formulae.brew.sh/formula/nvm).

```bash
brew install nvm
```

NVM provides alternative installation instructions, see [Install & Update Scripts](https://github.com/nvm-sh/nvm?tab=readme-ov-file#installing-and-updating)
