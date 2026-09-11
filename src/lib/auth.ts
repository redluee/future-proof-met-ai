import { cookies } from "next/headers";
import crypto from "crypto";

const DEFAULT_ADMIN_USERNAME = "Steven";
const DEFAULT_ADMIN_PASSWORD = "Duimpie2.0";
const SESSION_COOKIE_NAME = "minor_session";

function getSecretKey(): string {
  return process.env.AUTH_SECRET || "steven-portfolio-super-secret-hmac-salt-key-2026";
}

export function getAdminUsername(): string {
  return process.env.AUTH_USERNAME || DEFAULT_ADMIN_USERNAME;
}

export function getAdminPassword(): string {
  return process.env.AUTH_PASSWORD || DEFAULT_ADMIN_PASSWORD;
}

/**
 * Timing-safe credential comparison to prevent timing attacks.
 */
export function checkCredentials(user: string, pass: string): boolean {
  const expectedUser = getAdminUsername();
  const expectedPass = getAdminPassword();

  const userMatch = user.trim().toLowerCase() === expectedUser.toLowerCase();

  const passBuffer = Buffer.from(pass);
  const expectedPassBuffer = Buffer.from(expectedPass);

  if (passBuffer.length !== expectedPassBuffer.length) {
    return false;
  }

  const passMatch = crypto.timingSafeEqual(passBuffer, expectedPassBuffer);
  return userMatch && passMatch;
}

/**
 * Creates a cryptographically signed HMAC session token.
 */
export function createSessionToken(): string {
  const payload = `${getAdminUsername()}:${Date.now()}`;
  const hmac = crypto.createHmac("sha256", getSecretKey()).update(payload).digest("hex");
  return `${Buffer.from(payload).toString("base64url")}.${hmac}`;
}

/**
 * Verifies the HMAC signature and timestamp of the session token.
 */
export function verifySessionToken(token: string): boolean {
  try {
    const [payloadB64, signature] = token.split(".");
    if (!payloadB64 || !signature) return false;

    const payload = Buffer.from(payloadB64, "base64url").toString("utf-8");
    const [username, timestampStr] = payload.split(":");
    if (!username || !timestampStr) return false;

    // Verify HMAC signature
    const expectedHmac = crypto.createHmac("sha256", getSecretKey()).update(payload).digest("hex");
    const sigBuffer = Buffer.from(signature);
    const expectedSigBuffer = Buffer.from(expectedHmac);

    if (sigBuffer.length !== expectedSigBuffer.length) return false;
    if (!crypto.timingSafeEqual(sigBuffer, expectedSigBuffer)) return false;

    // Check expiry (30 days max)
    const timestamp = Number(timestampStr);
    const maxAge = 30 * 24 * 60 * 60 * 1000;
    if (Date.now() - timestamp > maxAge) return false;

    return username.toLowerCase() === getAdminUsername().toLowerCase();
  } catch {
    return false;
  }
}

export async function getSession(): Promise<{ isAuthenticated: boolean; username: string | null }> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
    if (sessionCookie && verifySessionToken(sessionCookie.value)) {
      return { isAuthenticated: true, username: getAdminUsername() };
    }
  } catch {
    // cookies() called outside request context
  }
  return { isAuthenticated: false, username: null };
}

export async function requireAuth(): Promise<boolean> {
  const session = await getSession();
  return session.isAuthenticated;
}

export { SESSION_COOKIE_NAME };
