// ===== Crockford Base32 (no I, L, O, U) =====
const B32 = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
const MAP = (() => {
  const m = {};
  for (let i = 0; i < B32.length; i++) m[B32[i]] = i;
  m["I"] = m["L"] = m["1"] = 1;
  m["O"] = m["0"] = 0;
  return m;
})();

function b32encode(num, length) {
  let n = BigInt(num);
  let out = "";
  if (n === 0n) out = "0";
  while (n > 0n) {
    const rem = Number(n % 32n);
    out = B32[rem] + out;
    n = n / 32n;
  }
  while (out.length < length) out = "0" + out;
  return out;
}

function b32decode(str) {
  const s = str.replace(/[-\s]/g, "").toUpperCase();
  let n = 0n;
  for (const ch of s) {
    const v = MAP[ch];
    if (v === undefined) throw new Error("Invalid char: " + ch);
    n = n * 32n + BigInt(v);
  }
  return n;
}

// ===== CRC-8 =====
const SECRET_SALT = 0xA7;
function crc8(bytes) {
  let crc = 0x00 ^ SECRET_SALT;
  for (let b of bytes) {
    crc ^= b & 0xff;
    for (let i = 0; i < 8; i++) {
      crc = (crc & 0x80) ? ((crc << 1) ^ 0x07) : (crc << 1);
      crc &= 0xff;
    }
  }
  return crc & 0xff;
}

function numToBytesBE(num, byteLen) {
  let n = BigInt(num);
  const out = new Uint8Array(byteLen);
  for (let i = byteLen - 1; i >= 0; i--) {
    out[i] = Number(n & 0xffn);
    n >>= 8n;
  }
  return out;
}

// ===== Bit layout =====
const EPOCH = Date.UTC(2020, 0, 1);
const DAY_MS = 24 * 60 * 60 * 1000;

function ymdToUTC(ymd) {
  const [y, m, d] = ymd.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}
function toInputDateString(msUTC) {
  const d = new Date(msUTC);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function daysSinceEpoch(msUTC) {
  return Math.floor((msUTC - EPOCH) / DAY_MS);
}

export function generateCode(storeId, dateYmd, txnNum) {
  if (!(storeId >= 1 && storeId <= 200)) throw new Error("Store 1–200");
  if (!(txnNum >= 1 && txnNum <= 10000)) throw new Error("Txn 1–10000");

  const dateMs = ymdToUTC(dateYmd);
  const d = daysSinceEpoch(dateMs);
  if (d < 0 || d > 32767) throw new Error("Date out of range");

  const store0 = BigInt(storeId - 1);
  const days = BigInt(d);
  const txn0 = BigInt(txnNum - 1);

  const payload = (store0 << 29n) | (days << 14n) | txn0;
  const bytes = numToBytesBE(payload, 5);
  const check = crc8(bytes);

  const full = (payload << 8n) | BigInt(check);
  return b32encode(full, 9);
}

export function decodeCode(codeStr) {
  const n = b32decode(codeStr.trim().toUpperCase());
  const checksum = Number(n & 0xffn);
  const payload = n >> 8n;

  const bytes = numToBytesBE(payload, 5);
  const expect = crc8(bytes);
  if (checksum !== expect) throw new Error("Checksum mismatch");

  const store0 = Number((payload >> 29n) & 0xffn);
  const days = Number((payload >> 14n) & 0x7fffn);
  const txn0 = Number(payload & 0x3fffn);

  return {
    storeId: store0 + 1,
    txnNum: txn0 + 1,
    dateYmd: toInputDateString(EPOCH + days * DAY_MS),
  };
}
