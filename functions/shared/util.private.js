module.exports = { formatPhone, sleep };

function formatPhone(phone) {
  if (typeof phone !== "string") throw Error(`Invalid phone: ${phone}`);

  let _phone = phone.trim();
  if (!_phone.startsWith("+")) _phone = `+${_phone}`;
  return _phone;
}

async function sleep(ms = 500) {
  return new Promise((resolve) =>
    setTimeout(() => {
      resolve(null);
    }, ms)
  );
}
