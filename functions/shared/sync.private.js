const crypto = require("crypto");

let syncClient;

module.exports = {
  getSyncClient,

  getPhoneReservation,
  reservePhoneNumber,
  removeReservation,

  cleanUpSession,
  createSession,
  getSession,
  updateSession,
};

async function getSyncClient() {
  if (!syncClient) {
    const fns = Runtime.getFunctions();
    const conf = require(fns["shared/conf"].path);

    syncClient = await Runtime.getSync({ serviceName: conf.getSyncSvcSid() });
  }

  return syncClient;
}

/****************************************************
 Reservations
****************************************************/
async function getPhoneReservation(phoneNumber) {
  const syncClient = await getSyncClient();

  try {
    const item = await syncClient
      .maps("reservations")
      .syncMapItems(phoneNumber)
      .fetch()
      .then((item) => item.data);

    return item;
  } catch (error) {
    return null;
  }
}

async function reservePhoneNumber(customerPN) {
  const fns = Runtime.getFunctions();
  const conf = require(fns["shared/conf"].path);
  const util = require(fns["shared/util"].path);

  const phonePool = conf.getPhonePool();

  let reservedPN;
  for (const phone of phonePool) {
    const phoneReservation = await getPhoneReservation(phone);
    if (phoneReservation) continue;
    reservedPN = phone;
    break;
  }

  if (!reservedPN) {
    // check if the syncMap for reservations exists
    const syncMap = await syncClient.maps
      .create({ uniqueName: "reservations" })
      .catch(() => {});

    if (syncMap) {
      console.log(
        "The SyncMap to track reservations did not exist. One has been created. Retrying to reserve phone number."
      );
      return reservePhoneNumber(customerPN);
    }
  }

  if (!reservedPN) {
    throw Error(`\
No phone numbers available for reservation.

Phone Pool: ${phonePool.join(",")}
  `);
  }

  const reservation = { customerPN, reservedPN };
  try {
    await syncClient.maps("reservations").syncMapItems.create({
      key: reservedPN,
      data: reservation,
      itemTtl: conf.getReservationTTL(),
    });
  } catch (error) {
    // an error may occur if two pay sessions are initiated simultaneously
    // retry after 1 second
    console.error("Error reserving phone number");
    console.error(error);
    await util.sleep(1000);
    return reservePhoneNumber(customerPN);
  }

  return reservation;
}

async function removeReservation(reservedPN) {
  await syncClient
    .maps("reservations")
    .syncMapItems(reservedPN)
    .remove()
    .catch(() => {}); // don't care about errors
}

/****************************************************
   Sessions
  ****************************************************/
async function createSession({ customerPN, reservedPN, ...data }) {
  const syncClient = await getSyncClient();

  if (!customerPN || !reservedPN)
    throw Error(`\
Unable to create a session due to invalid session parameters...
    customerPN:${customerPN}
    reservedPN:${reservedPN}
  `);

  const sessionData = {
    confName: crypto.randomUUID(),
    customerPN,
    reservedPN,
    status: "calling",
    ...data,
  };

  try {
    await syncClient.documents.create({
      uniqueName: customerPN,
      data: sessionData,
    });
  } catch (error) {
    console.error("Error creating pay session");
    throw error;
  }

  return sessionData;
}

async function cleanUpSession(customerPN) {
  const syncClient = await getSyncClient();

  const session = await getSession(customerPN).catch(() => {});
  if (!session) return;

  await Promise.allSettled([
    syncClient.documents(customerPN).remove(),
    removeReservation(session.reservedPN),
  ]);
}

async function getSession(customerPN) {
  const syncClient = await getSyncClient();

  return syncClient
    .documents(customerPN)
    .fetch()
    .then(({ data }) => data);
}

async function updateSession(customerPN, update) {
  const syncClient = await getSyncClient();

  const prevSession = await getSession(customerPN);

  const session = { ...prevSession, ...update };
  await syncClient.documents(customerPN).update({ data: session });
  return session;
}
