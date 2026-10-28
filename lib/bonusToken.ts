import crypto from "crypto";

// Stateless, signed "start" token: proves the customer opened the bonus link
// at a given time. No database change needed.
const secret = () => {
  const s = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET;
  if (!s) throw new Error("NEXTAUTH_SECRET is not set");
  return s;
};

const b64 = (b: Buffer | string) => Buffer.from(b).toString("base64url");

export function signBonusToken(customerId: string, platform: string): string {
  const payload = b64(JSON.stringify({ c: customerId, p: platform, t: Date.now() }));
  const sig = crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

/** Returns the elapsed milliseconds since the link was opened, or null if invalid. */
export function readBonusToken(token: string, customerId: string, platform: string): number | null {
  try {
    const [payload, sig] = String(token).split(".");
    if (!payload || !sig) return null;
    const expected = crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (data.c !== customerId || data.p !== platform || typeof data.t !== "number") return null;
    return Date.now() - data.t;
  } catch {
    return null;
  }
}
