import { desc, eq, sql } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getDb } from "@/db";
import { wishes } from "@/db/schema";
import {
  checkWishRateLimit,
  getClientIp,
  recordWishSubmission,
} from "@/lib/rate-limit";

const createWishSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nama wajib diisi.")
    .max(50, "Nama maksimal 50 karakter."),
  message: z
    .string()
    .trim()
    .min(1, "Ucapan wajib diisi.")
    .max(300, "Ucapan maksimal 300 karakter."),
  website: z.string().optional().default(""),
});

function sanitizePlainText(input: string): string {
  return input.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim();
}

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { wishes: [], total: 0 },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      }
    );
  }

  try {
    const db = getDb();
    const rows = await db
      .select({
        id: wishes.id,
        name: wishes.name,
        message: wishes.message,
        createdAt: wishes.createdAt,
      })
      .from(wishes)
      .where(eq(wishes.isHidden, false))
      .orderBy(desc(wishes.createdAt))
      .limit(100);

    const [countRow] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(wishes)
      .where(eq(wishes.isHidden, false));

    return NextResponse.json(
      {
        wishes: rows.map((row) => ({
          id: row.id,
          name: row.name,
          message: row.message,
          createdAt: row.createdAt.toISOString(),
        })),
        total: countRow?.count ?? rows.length,
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Gagal memuat ucapan.";
    console.error(`Gagal membaca daftar ucapan: ${message}`);
    return NextResponse.json(
      { error: "Gagal memuat daftar ucapan. Silakan muat ulang halaman." },
      {
        status: 500,
        headers: { "Cache-Control": "no-store" },
      }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: "Layanan ucapan belum tersedia saat ini." },
      {
        status: 503,
        headers: { "Cache-Control": "no-store" },
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

  const parsed = createWishSchema.safeParse(body);
  if (!parsed.success) {
    const firstMessage =
      parsed.error.issues[0]?.message ?? "Isian ucapan tidak valid.";
    return NextResponse.json(
      { error: firstMessage },
      {
        status: 400,
        headers: { "Cache-Control": "no-store" },
      }
    );
  }

  // Honeypot anti-bot: abaikan diam-diam jika field tersembunyi terisi
  if (parsed.data.website.trim().length > 0) {
    return NextResponse.json(
      { ok: true, skipped: true },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      }
    );
  }

  const clientIp = getClientIp(request.headers);
  const rateLimit = checkWishRateLimit(clientIp);
  if (!rateLimit.allowed) {
    const minutes = Math.max(1, Math.ceil(rateLimit.retryAfterSeconds / 60));
    return NextResponse.json(
      {
        error: `Anda sudah mengirim beberapa ucapan. Silakan coba lagi dalam ${minutes} menit.`,
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

  const cleanName = sanitizePlainText(parsed.data.name).slice(0, 50);
  const cleanMessage = sanitizePlainText(parsed.data.message).slice(0, 300);

  if (!cleanName || !cleanMessage) {
    return NextResponse.json(
      { error: "Nama dan ucapan wajib diisi." },
      {
        status: 400,
        headers: { "Cache-Control": "no-store" },
      }
    );
  }

  try {
    const db = getDb();
    const [inserted] = await db
      .insert(wishes)
      .values({
        name: cleanName,
        message: cleanMessage,
        isHidden: false,
      })
      .returning({
        id: wishes.id,
        name: wishes.name,
        message: wishes.message,
        createdAt: wishes.createdAt,
      });

    recordWishSubmission(clientIp);

    return NextResponse.json(
      {
        ok: true,
        wish: {
          id: inserted.id,
          name: inserted.name,
          message: inserted.message,
          createdAt: inserted.createdAt.toISOString(),
        },
      },
      {
        status: 201,
        headers: { "Cache-Control": "no-store" },
      }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Gagal menyimpan ucapan.";
    console.error(`Gagal menyimpan ucapan tamu: ${message}`);
    return NextResponse.json(
      { error: "Gagal mengirim ucapan. Silakan coba beberapa saat lagi." },
      {
        status: 500,
        headers: { "Cache-Control": "no-store" },
      }
    );
  }
}
