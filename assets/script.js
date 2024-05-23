/****************************************************
 Bind Values
****************************************************/
let amount = "";
document.getElementById("amount").addEventListener("input", (ev) => {
  amount = ev.target.value;
});

let customerPN = "";
document.getElementById("customerPN").addEventListener("input", (ev) => {
  customerPN = ev.target.value;
});

let language = "en";
document.getElementById("language").addEventListener("change", (ev) => {
  console.log("language", ev);
  language = ev.target.value;
});

/****************************************************
 Intialize Sync
****************************************************/
let syncClient;
let identity = "ui-";

for (let i = 0; i < 10; i++)
  identity += "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[
    Math.floor(Math.random() * 62)
  ];

console.log("Fetching Twilio Sync Token");

fetchSyncToken().then((token) => {
  console.log("Initializing Twilio Sync Client");
  syncClient = new Twilio.Sync.Client(token);

  syncClient.on("tokenAboutToExpire", async () => {
    const token = await fetchSyncToken();
    syncClient.updateToken(token);
  });
  syncClient.on("tokenExpired", async () => {
    const token = await fetchSyncToken();
    syncClient.updateToken(token);
  });

  syncClient.on("connectionStateChanged", (newState) => {
    console.log(`Twilio Sync Connection Status: ${newState}`);
  });
});

async function fetchSyncToken() {
  const data = await fetch(`/sync-token?identity=${identity}`).then((res) =>
    res.json()
  );
  return data.token;
}

/****************************************************
 Place Call
****************************************************/
async function placeCall() {
  document.getElementById("amount").disabled = true;
  document.getElementById("customerPN").disabled = true;

  try {
    const res = await fetch(
      `/start-pay-session?customerPN=${customerPN}&amount=${amount}&language=${language}`
    );

    if (!res.ok)
      throw Error(`${await res.text()} (${res.status}, ${res.statusText})`);

    await res.json();

    subscribeToSyncDoc();
  } catch (error) {
    console.error(error);

    const overlay = document.createElement("div");
    overlay.className = "error-overlay";
    overlay.innerHTML = error;

    document.body.appendChild(overlay);
  }
}

const divs = {
  reservedPN: document.getElementById("reservedPN"),
  status: document.getElementById("status"),

  paymentStep: document.getElementById("paymentStep"),
  attempt: document.getElementById("attempt"),
  errorType: document.getElementById("errorType"),
};

async function subscribeToSyncDoc() {
  syncClient.document(customerPN).then((doc) => {
    renderCall(doc.data);

    doc.on("updated", ({ data }) => {
      renderCall(data);
    });
  });
}

function renderCall(data) {
  divs.status.innerHTML = `<b>Call Status: </b>${data.status}`;
  divs.reservedPN.innerHTML = `<b>Calling From: </b>${data.reservedPN}`;

  if (data.status === "completed") return;
  divs.paymentStep.innerHTML = data.paymentStep
    ? `<b>Payment Step: </b>${data.paymentStep}`
    : "";

  divs.errorType.innerHTML = data.errorType
    ? `<b>Collection Error: </b>${data.errorType}`
    : "";
}
