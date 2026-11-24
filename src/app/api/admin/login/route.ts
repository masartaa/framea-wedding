import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import {
  getSessionCookieOptions,
  isAuthConfigured,
  isSessionSecretConfigured,
  verifyAdminPassword,
} from "@/lib/auth";
import { getInvitationAuthRecordBySlug } from "@/lib/invitations";
import { normalizeInvitationSlug } from "@/lib/invitation-slug";
import { verifyPasswordHash } from "@/lib/password-hash";
import {
  checkLoginRateLimit,
  delayFailedLogin,
  getClientIp,
  recordFailedLogin,
  resetLoginRateLimit,
} from "@/lib/rate-limit";
import { createSessionToken } from "@/lib/session-token";

const superAdminLoginSchema = z.object({
  mode: z.literal("superadmin").optional().default("superadmin"),
  password: z
    .string()
    .min(1, "Sandi wajib diisi.")
    .max(200, "Sandi terlalu panjang."),
});

const coupleLoginSchema = z.object({
  mode: z.literal("couple"),
  slug: z
    .string()
    .trim()
    .min(2, "Slug undangan wajib diisi.")
    .max(80, "Slug undangan terlalu panjang."),
  password: z
    .string()
    .min(1, "Sandi undangan wajib diisi.")
    .max(200, "Sandi terlalu panjang."),
});

const loginRequestSchema = z.union([coupleLoginSchema, superAdminLoginSchema]);

export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request.headers);
  const rateLimit = checkLoginRateLimit(clientIp);
  if (!rateLimit.allowed) {
    const minutes = Math.max(1, Math.ceil(rateLimit.retryAfterSeconds / 60));
    return NextResponse.json(
      {
        error: `Terlalu banyak percobaan login gagal. Coba lagi dalam ${minutes} menit.`,
      },
      {
        status: 429,
        headers: {
          "Cache-Control": "no-store",
          "Retry-After": String(rateLimit.retryAfterSeconds),
        },
      }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Format permintaan tidak valid." },
      {
        status: 400,
        headers: { "Cache-Control": "no-store" },
      }
    );
  }

  const parsed = loginRequestSchema.safeParse(body);
  if (!parsed.success) {
    const firstMessage =
      parsed.error.issues[0]?.message ?? "Data login tidak valid.";
    return NextResponse.json(
      { error: firstMessage },
      {
        status: 400,
        headers: { "Cache-Control": "no-store" },
      }
    );
  }

  if (parsed.data.mode === "couple") {
    if (!isSessionSecretConfigured() || !process.env.DATABASE_URL) {
      return NextResponse.json(
        {
          error:
            "Layanan login pemilik undangan belum dikonfigurasi (DATABASE_URL / SESSION_SECRET).",
        },
        {
          status: 503,
          headers: { "Cache-Control": "no-store" },
        }
      );
    }

    const normalizedSlug = normalizeInvitationSlug(parsed.data.slug);
    let authRecord: Awaited<ReturnType<typeof getInvitationAuthRecordBySlug>> =
      null;

    try {
      authRecord = await getInvitationAuthRecordBySlug(normalizedSlug);
    } catch {
      authRecord = null;
    }

    const validCouple =
      authRecord !== null &&
      verifyPasswordHash(parsed.data.password, authRecord.passwordHash);

    if (!validCouple || !authRecord) {
      await delayFailedLogin();
      const { remainingAttempts } = recordFailedLogin(clientIp);
      const detail =
        remainingAttempts > 0
          ? `Slug undangan atau sandi salah. Sisa percobaan: ${remainingAttempts}.`
          : "Slug undangan atau sandi salah. Percobaan login sementara dibatasi.";

      return NextResponse.json(
        { error: detail },
        {
          status: 401,
          headers: { "Cache-Control": "no-store" },
        }
      );
    }

    resetLoginRateLimit(clientIp);
    const token = await createSessionToken({
      role: "couple",
      slug: authRecord.slug,
      invitationId: authRecord.id,
    });

    const response = NextResponse.json(
      {
        ok: true,
        role: "couple",
        slug: authRecord.slug,
        redirectTo: `/admin/${authRecord.slug}`,
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      }
    );
    response.cookies.set({
      ...getSessionCookieOptions(),
      value: token,
    });
    return response;
  }

  // Mode Super Admin
  if (!isAuthConfigured()) {
    return NextResponse.json(
      {
        error:
          "Autentikasi Super Admin belum dikonfigurasi. Pastikan ADMIN_PASSWORD dan SESSION_SECRET (min. 16 karakter) sudah diatur.",
      },
      {
        status: 503,
        headers: { "Cache-Control": "no-store" },
      }
    );
  }

  const isValid = verifyAdminPassword(parsed.data.password);
  if (!isValid) {
    await delayFailedLogin();
    const { remainingAttempts } = recordFailedLogin(clientIp);
    const detail =
      remainingAttempts > 0
        ? `Sandi Super Admin salah. Sisa percobaan: ${remainingAttempts}.`
        : "Sandi Super Admin salah. Percobaan login sementara dibatasi.";

    return NextResponse.json(
      { error: detail },
      {
        status: 401,
        headers: { "Cache-Control": "no-store" },
      }
    );
  }

  resetLoginRateLimit(clientIp);
  const token = await createSessionToken({ role: "superadmin" });
  const response = NextResponse.json(
    {
      ok: true,
      role: "superadmin",
      redirectTo: "/admin",
    },
    {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    }
  );
  response.cookies.set({
    ...getSessionCookieOptions(),
    value: token,
  });

  return response;
}
