import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { normalizeInvitationSlug } from "@/lib/invitation-slug";
import { getInvitationAuthRecordBySlug } from "@/lib/invitations";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE_SECONDS,
  verifySessionToken,
  type AdminSession,
} from "@/lib/session-token";

export function isSessionSecretConfigured(): boolean {
  const sessionSecret = process.env.SESSION_SECRET?.trim();
  return Boolean(sessionSecret && sessionSecret.length >= 16);
}

export function isAuthConfigured(): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD?.trim();
  return Boolean(adminPassword && isSessionSecretConfigured());
}

function sha256Buffer(value: string): Buffer {
  return createHash("sha256").update(value, "utf8").digest();
}

export function verifyAdminPassword(inputPassword: string): boolean {
  const expectedPassword = process.env.ADMIN_PASSWORD;
  if (!expectedPassword || expectedPassword.length === 0) {
    return false;
  }

  const inputHash = sha256Buffer(inputPassword);
  const expectedHash = sha256Buffer(expectedPassword);
  return timingSafeEqual(inputHash, expectedHash);
}

export function getSessionCookieOptions(
  maxAge = ADMIN_SESSION_MAX_AGE_SECONDS
) {
  return {
    name: ADMIN_SESSION_COOKIE,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

export function computePasswordFingerprint(
  passwordHash: string
): string | null {
  const secret = process.env.SESSION_SECRET?.trim();
  if (!secret || secret.length < 16 || !passwordHash) {
    return null;
  }

  return createHmac("sha256", secret)
    .update(passwordHash, "utf8")
    .digest("hex")
    .slice(0, 24);
}

function verifyPasswordFingerprint(
  passwordHash: string | null | undefined,
  expectedFp: string
): boolean {
  if (!passwordHash || !expectedFp) {
    return false;
  }

  const actualFp = computePasswordFingerprint(passwordHash);
  if (!actualFp || actualFp.length !== expectedFp.length) {
    return false;
  }

  return timingSafeEqual(
    Buffer.from(actualFp, "utf8"),
    Buffer.from(expectedFp, "utf8")
  );
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token);
  if (!session) {
    return null;
  }

  if (session.role === "couple") {
    if (!process.env.DATABASE_URL) {
      return null;
    }

    try {
      const authRecord = await getInvitationAuthRecordBySlug(session.slug);
      if (
        !authRecord ||
        authRecord.id !== session.invitationId ||
        authRecord.slug !== session.slug ||
        !verifyPasswordFingerprint(authRecord.passwordHash, session.pwdFp)
      ) {
        return null;
      }
    } catch {
      return null;
    }
  }

  return session;
}

export function canAccessInvitation(
  session: AdminSession,
  slug: string
): boolean {
  if (session.role === "superadmin") {
    return true;
  }
  return session.slug === normalizeInvitationSlug(slug);
}

export async function requireAdminSession(): Promise<
  | { ok: true; session: AdminSession }
  | { ok: false; response: NextResponse }
> {
  const session = await getAdminSession();
  if (!session) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Sesi admin tidak valid. Silakan login kembali." },
        {
          status: 401,
          headers: { "Cache-Control": "no-store" },
        }
      ),
    };
  }

  return { ok: true, session };
}

export async function requireSuperAdminSession(): Promise<
  | { ok: true; session: Extract<AdminSession, { role: "superadmin" }> }
  | { ok: false; response: NextResponse }
> {
  const auth = await requireAdminSession();
  if (!auth.ok) {
    return auth;
  }

  if (auth.session.role !== "superadmin") {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Akses ditolak. Fitur ini khusus untuk Super Admin." },
        {
          status: 403,
          headers: { "Cache-Control": "no-store" },
        }
      ),
    };
  }

  return { ok: true, session: auth.session };
}

export async function requireInvitationAccessSession(slug: string): Promise<
  | { ok: true; session: AdminSession }
  | { ok: false; response: NextResponse }
> {
  const auth = await requireAdminSession();
  if (!auth.ok) {
    return auth;
  }

  if (!canAccessInvitation(auth.session, slug)) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Akses ditolak. Anda tidak memiliki izin untuk undangan ini." },
        {
          status: 403,
          headers: { "Cache-Control": "no-store" },
        }
      ),
    };
  }

  return { ok: true, session: auth.session };
}
