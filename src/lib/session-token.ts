import { SignJWT, jwtVerify } from "jose";

export const ADMIN_SESSION_COOKIE = "framea_admin_session";
export const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 hari

export interface AdminSession {
  role: "admin";
  expiresAt: string;
}

function getEncodedSecret(): Uint8Array | null {
  const secret = process.env.SESSION_SECRET?.trim();
  if (!secret || secret.length < 16) {
    return null;
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(): Promise<string> {
  const secret = getEncodedSecret();
  if (!secret) {
    throw new Error("SESSION_SECRET belum dikonfigurasi dengan benar.");
  }

  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${ADMIN_SESSION_MAX_AGE_SECONDS}s`)
    .sign(secret);
}

export async function verifySessionToken(
  token: string | undefined | null
): Promise<AdminSession | null> {
  if (!token) {
    return null;
  }

  const secret = getEncodedSecret();
  if (!secret) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });

    if (payload.role !== "admin" || typeof payload.exp !== "number") {
      return null;
    }

    return {
      role: "admin",
      expiresAt: new Date(payload.exp * 1000).toISOString(),
    };
  } catch {
    return null;
  }
}
