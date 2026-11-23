import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import {
  getSessionCookieOptions,
  isAuthConfigured,
  verifyAdminPassword,
} from "@/lib/auth";
import {
  checkLoginRateLimit,
  delayFailedLogin,
  getClientIp,
  recordFailedLogin,
  resetLoginRateLimit,
} from "@/lib/rate-limit";
import { createSessionToken } from "@/lib/session-token";

const loginSchema = z.object({
  password: z
    .string()
    .min(1, "Sandi wajib diisi.")
    .max(200, "Sandi terlalu panjang."),
});

export async function POST(request: NextRequest) {
  if (!isAuthConfigured()) {
    return NextResponse.json(
      {
        error:
          "Autentikasi admin belum dikonfigurasi. Pastikan ADMIN_PASSWORD dan SESSION_SECRET (min. 16 karakter) sudah diatur.",
      },
      {
        status: 503,
        headers: { "Cache-Control": "no-store" },
      }
    );
  }

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

  const parsed = loginSchema.safeParse(body);
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

  const isValid = verifyAdminPassword(parsed.data.password);
  if (!isValid) {
    await delayFailedLogin();
    const { remainingAttempts } = recordFailedLogin(clientIp);
    const detail =
      remainingAttempts > 0
        ? `Sandi admin salah. Sisa percobaan: ${remainingAttempts}.`
        : "Sandi admin salah. Percobaan login sementara dibatasi.";

    return NextResponse.json(
      { error: detail },
      {
        status: 401,
        headers: { "Cache-Control": "no-store" },
      }
    );
  }

  resetLoginRateLimit(clientIp);
  const token = await createSessionToken();
  const response = NextResponse.json(
    { ok: true },
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
