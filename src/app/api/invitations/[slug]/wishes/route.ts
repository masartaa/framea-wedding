import { and, desc, eq, sql } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getDb } from "@/db";
import { invitations, wishes } from "@/db/schema";
import {
  isValidInvitationSlug,
  normalizeInvitationSlug,
} from "@/lib/invitation-slug";
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
  return input
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim();
}

async function resolveInvitationId(slugParam: string): Promise<number | null> {
  const normalized = normalizeInvitationSlug(slugParam);
  if (!isValidInvitationSlug(normalized)) {
    return null;
  }

  const db = getDb();
  const [row] = await db
    .select({ id: invitations.id })
    .from(invitations)
    .where(eq(invitations.slug, normalized))
    .limit(1);

  return row?.id ?? null;
}

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { wishes: [], total: 0 },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  }

  const { slug } = await context.params;

  try {
    const invitationId = await resolveInvitationId(slug);
    if (invitationId === null) {
      return NextResponse.json(
        { error: "Undangan tidak ditemukan." },
        { status: 404, headers: { "Cache-Control": "no-store" } }
      );
    }

    const db = getDb();
    const filter = and(
      eq(wishes.invitationId, invitationId),
      eq(wishes.isHidden, false)
    );

    const rows = await db
      .select({
        id: wishes.id,
        name: wishes.name,
        message: wishes.message,
        createdAt: wishes.createdAt,
      })
      .from(wishes)
      .where(filter)
      .orderBy(desc(wishes.createdAt))
      .limit(100);

    const [countRow] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(wishes)
      .where(filter);

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
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Gagal memuat ucapan.";
    console.error(`Gagal membaca ucapan untuk slug "${slug}": ${message}`);
    return NextResponse.json(
      { error: "Gagal memuat daftar ucapan. Silakan muat ulang halaman." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: "Layanan ucapan belum tersedia saat ini." },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }

  const { slug } = await context.params;
  let invitationId: number | null;
  try {
    invitationId = await resolveInvitationId(slug);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Gagal mencari undangan.";
    console.error(`Gagal mencari undangan "${slug}": ${message}`);
    return NextResponse.json(
      { error: "Gagal memproses ucapan. Silakan coba lagi." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }

  if (invitationId === null) {
    return NextResponse.json(
      { error: "Undangan tidak ditemukan." },
      { status: 404, headers: { "Cache-Control": "no-store" } }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Format permintaan tidak valid." },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  const parsed = createWishSchema.safeParse(body);
  if (!parsed.success) {
    const firstMessage =
      parsed.error.issues[0]?.message ?? "Isian ucapan tidak valid.";
    return NextResponse.json(
      { error: firstMessage },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  if (parsed.data.website.trim().length > 0) {
    return NextResponse.json(
      { ok: true, skipped: true },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  }

  const clientIp = getClientIp(request.headers);
  const rateLimit = await checkWishRateLimit(clientIp);
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
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  try {
    const db = getDb();
    const [inserted] = await db
      .insert(wishes)
      .values({
        invitationId,
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

    await recordWishSubmission(clientIp);

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
      { status: 201, headers: { "Cache-Control": "no-store" } }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Gagal menyimpan ucapan.";
    console.error(`Gagal menyimpan ucapan untuk "${slug}": ${message}`);
    return NextResponse.json(
      { error: "Gagal mengirim ucapan. Silakan coba beberapa saat lagi." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
