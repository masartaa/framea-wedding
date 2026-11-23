import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE_SECONDS,
  verifySessionToken,
  type AdminSession,
} from "@/lib/session-token";

export function isAuthConfigured(): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD?.trim();
  const sessionSecret = process.env.SESSION_SECRET?.trim();
  return Boolean(adminPassword && sessionSecret && sessionSecret.length >= 16);
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

export function getSessionCookieOptions(maxAge = ADMIN_SESSION_MAX_AGE_SECONDS) {
  return {
    name: ADMIN_SESSION_COOKIE,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  return verifySessionToken(token);
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
