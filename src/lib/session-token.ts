import { SignJWT, jwtVerify } from "jose";
import { isValidInvitationSlug } from "@/lib/invitation-slug";

export const ADMIN_SESSION_COOKIE = "framea_admin_session";
export const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 hari

export type AdminSession =
  | {
      role: "superadmin";
      expiresAt: string;
    }
  | {
      role: "couple";
      slug: string;
      invitationId: number;
      pwdFp: string;
      expiresAt: string;
    };

export type SessionTokenPayload =
  | { role: "superadmin" }
  | { role: "couple"; slug: string; invitationId: number; pwdFp: string };

function getEncodedSecret(): Uint8Array | null {
  const secret = process.env.SESSION_SECRET?.trim();
  if (!secret || secret.length < 16) {
    return null;
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(
  payload: SessionTokenPayload
): Promise<string> {
  const secret = getEncodedSecret();
  if (!secret) {
    throw new Error("SESSION_SECRET belum dikonfigurasi dengan benar.");
  }

  return new SignJWT(payload)
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

    if (typeof payload.exp !== "number") {
      return null;
    }

    const expiresAt = new Date(payload.exp * 1000).toISOString();

    // Kompatibel dengan cookie v1 ("admin") dan v2 ("superadmin")
    if (payload.role === "superadmin" || payload.role === "admin") {
      return {
        role: "superadmin",
        expiresAt,
      };
    }

    if (
      payload.role === "couple" &&
      typeof payload.slug === "string" &&
      isValidInvitationSlug(payload.slug) &&
      typeof payload.invitationId === "number" &&
      Number.isInteger(payload.invitationId) &&
      payload.invitationId > 0 &&
      typeof payload.pwdFp === "string" &&
      /^[a-f0-9]{24}$/.test(payload.pwdFp)
    ) {
      return {
        role: "couple",
        slug: payload.slug,
        invitationId: payload.invitationId,
        pwdFp: payload.pwdFp,
        expiresAt,
      };
    }

    return null;
  } catch {
    return null;
  }
}
